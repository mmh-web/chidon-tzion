import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useProgress } from '../context/ProgressContext';
import { QuestionCard } from '../components/QuestionCard';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { TimerBar } from '../components/TimerBar';
import { Confetti } from '../components/Confetti';
import questionsData from '../data/questions.json';
import { Section, TimerSettings } from '../types';

const sections = questionsData.sections as Section[];

export function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSections = sections.map(s => s.id), timerSettings = { enabled: false, secondsPerQuestion: 30 }, numQuestions = 10 } = (location.state || {}) as {
    selectedSections: string[];
    timerSettings: TimerSettings;
    numQuestions: number;
  };

  const quiz = useQuiz(sections, selectedSections, timerSettings);
  const { addCoins, addEnergy } = useProgress();
  const [started, setStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [showCoinAnim, setShowCoinAnim] = useState(false);

  useEffect(() => {
    if (!started) {
      quiz.startQuiz(numQuestions);
      setStarted(true);
    }
  }, [started, quiz.startQuiz, numQuestions]);

  useEffect(() => {
    if (quiz.finished) {
      navigate('/quiz/summary', {
        state: {
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          missedQuestions: quiz.missedQuestions,
          maxStreak: quiz.maxStreak,
          selectedSections,
        },
      });
    }
  }, [quiz.finished, navigate, quiz.score, quiz.totalQuestions, quiz.missedQuestions, quiz.maxStreak, selectedSections]);

  const [lastAwardedIndex, setLastAwardedIndex] = useState(-1);

  useEffect(() => {
    if (quiz.lastAnswerCorrect && quiz.showingFeedback && quiz.currentIndex !== lastAwardedIndex) {
      setConfettiTrigger(prev => prev + 1);
      addCoins(1);
      addEnergy(100);
      setLastAwardedIndex(quiz.currentIndex);
      setShowCoinAnim(true);
      setTimeout(() => setShowCoinAnim(false), 1500);
    }
  }, [quiz.showingFeedback, quiz.lastAnswerCorrect, quiz.currentIndex, lastAwardedIndex, addCoins, addEnergy]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    quiz.submitAnswer(answer);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    quiz.nextQuestion();
  };

  if (!quiz.currentQuestion) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">🇮🇱</div>
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  return (
    <div>
      <Confetti trigger={confettiTrigger > 0} key={confettiTrigger} intensity={quiz.streak >= 3 ? 'big' : 'small'} />

      {/* Coin earned animation */}
      {showCoinAnim && (
        <div className="coin-float-up fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="text-3xl font-bold text-yellow-500 flex items-center gap-1">
            <span className="text-4xl">₪</span> +1
          </div>
        </div>
      )}

      <ScoreDisplay
        score={quiz.score}
        streak={quiz.streak}
        currentQuestion={quiz.currentIndex}
        totalQuestions={quiz.totalQuestions}
      />

      {timerSettings.enabled && !quiz.showingFeedback && (
        <TimerBar
          seconds={timerSettings.secondsPerQuestion}
          onTimeout={quiz.handleTimeout}
          paused={quiz.showingFeedback}
          questionKey={quiz.currentQuestion.id}
        />
      )}

      <QuestionCard
        question={quiz.currentQuestion}
        choices={quiz.choices}
        onAnswer={handleAnswer}
        disabled={quiz.showingFeedback}
        selectedAnswer={selectedAnswer}
        correctAnswer={quiz.showingFeedback ? quiz.currentQuestion.answer : null}
      />

      {quiz.showingFeedback && (
        <div className="mt-4 animate-pop-in">
          <div className={`text-center p-4 rounded-xl mb-3 ${
            quiz.lastAnswerCorrect
              ? 'bg-green-100 border-2 border-green-300 animate-pop-in'
              : 'bg-red-100 border-2 border-red-300 animate-shake'
          }`}>
            <span className="text-4xl">{quiz.lastAnswerCorrect ? (quiz.streak >= 3 ? '🔥🎉🔥' : '🎉') : '😢'}</span>
            <p dir="ltr" className={`font-bold text-lg mt-1 ${quiz.lastAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {quiz.lastAnswerCorrect
                ? (quiz.streak >= 5 ? 'UNSTOPPABLE!' : quiz.streak >= 3 ? 'Amazing streak!' : 'Correct! +₪1')
                : 'Incorrect'}
            </p>
            {!quiz.lastAnswerCorrect && (
              <p className="text-sm text-red-600 mt-1">
                Correct answer: {quiz.currentQuestion.answer}
              </p>
            )}
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-israel-blue hover:bg-israel-blue-dark text-white py-3 rounded-xl font-bold text-lg transition-colors border-none cursor-pointer"
          >
            {quiz.currentIndex + 1 < quiz.totalQuestions ? 'Next Question →' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  );
}

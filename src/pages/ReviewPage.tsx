import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flashcard } from '../components/Flashcard';
import { SectionFilter } from '../components/SectionFilter';
import { useProgress } from '../context/ProgressContext';
import questionsData from '../data/questions.json';
import { Section, Question } from '../types';
import { shuffle } from '../utils/shuffle';

const sections = questionsData.sections as Section[];

const israeliJokes = [
  "Why did the falafel cross the road? To get to the other pita!",
  "What's a cat's favorite city? Purr-usalem!",
  "Why is the Dead Sea always calm? Because it has no life!",
  "What do you call a funny pomegranate? A rimon-comedian!",
  "How does hummus say goodbye? Tahini later!",
  "What's a camel's favorite day? Hump day in the Negev!",
  "Why did the sabra go to school? To get a little less prickly!",
  "What did the olive say to the pita? You're on a roll!",
  "Why don't secrets last in Tel Aviv? Too many balconies!",
  "What's a kibbutznik's favorite music? Country!",
];

export function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSections: initialSections = sections.map(s => s.id), missedOnly = false } = (location.state || {}) as {
    selectedSections: string[];
    missedOnly: boolean;
  };

  const [selectedSections, setSelectedSections] = useState<string[]>(initialSections);
  const { progress, recordAnswer, addCoins, addEnergy } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knewCount, setKnewCount] = useState(0);
  const [didntKnowCount, setDidntKnowCount] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [ufoVisible, setUfoVisible] = useState(false);
  const [currentJoke, setCurrentJoke] = useState('');
  const [showCoinReward, setShowCoinReward] = useState(false);

  const questions = useMemo(() => {
    const allQuestions: Question[] = sections
      .filter(s => selectedSections.includes(s.id))
      .flatMap(s => s.questions);

    if (missedOnly) {
      return allQuestions.filter(q => {
        const qp = progress.questionProgress[q.id];
        return qp && (qp.timesWrong > 0 && !qp.mastered);
      }).sort((a, b) => {
        const ap = progress.questionProgress[a.id];
        const bp = progress.questionProgress[b.id];
        return (bp?.timesWrong || 0) - (ap?.timesWrong || 0);
      });
    }

    // Apply shuffle when shuffleKey changes
    return shuffleKey > 0 ? shuffle(allQuestions) : allQuestions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSections, missedOnly, progress, shuffleKey]);

  const triggerUfo = useCallback(() => {
    const joke = israeliJokes[Math.floor(Math.random() * israeliJokes.length)];
    setCurrentJoke(joke);
    setUfoVisible(true);
    setShowCoinReward(true);
    setTimeout(() => {
      setUfoVisible(false);
      setShowCoinReward(false);
    }, 4000);
  }, []);

  const handleResult = (knew: boolean) => {
    const question = questions[currentIndex];
    recordAnswer(question.id, knew);

    if (knew) {
      const newKnewCount = knewCount + 1;
      setKnewCount(newKnewCount);

      // Every correct: earn energy
      addEnergy(25);

      // Every 2 correct: earn ₪1 + UFO joke
      if (newKnewCount > 0 && newKnewCount % 2 === 0) {
        addCoins(1);
        triggerUfo();
      }
    } else {
      setDidntKnowCount(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 100);
  };

  const resetReview = () => {
    setCurrentIndex(0);
    setKnewCount(0);
    setDidntKnowCount(0);
  };

  const handleShuffle = () => {
    setShuffleKey(prev => prev + 1);
    setCurrentIndex(0);
    setKnewCount(0);
    setDidntKnowCount(0);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 space-y-4" dir="ltr">
        <div className="text-6xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-700">
          {missedOnly ? 'No missed questions!' : 'No questions in selected topics'}
        </h2>
        <p className="text-gray-500">
          {missedOnly ? 'Great job! You\'ve mastered the material' : 'Choose different topics'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-israel-blue hover:bg-israel-blue-dark text-white px-6 py-3 rounded-xl font-bold transition-colors border-none cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isFinished = currentIndex >= questions.length - 1 && (knewCount + didntKnowCount) >= questions.length;

  return (
    <div className="space-y-4 relative" dir="ltr">
      {/* UFO Animation */}
      {ufoVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="ufo-fly absolute top-1/4" style={{ fontSize: '4rem' }}>
            🛸
          </div>
          <div className="joke-fade absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur px-6 py-4 rounded-2xl shadow-2xl border-2 border-yellow-400 max-w-[80vw] text-center">
            <p className="text-lg font-bold text-gray-800 m-0">{currentJoke}</p>
            {showCoinReward && (
              <p className="text-yellow-600 font-bold mt-2 m-0 text-xl">+₪1</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          {missedOnly ? '🔄 Review Missed Questions' : '📚 Study Flashcards'}
        </h2>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress + Shuffle */}
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ {knewCount}</span>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">❌ {didntKnowCount}</span>
        <button
          onClick={handleShuffle}
          className="ml-auto bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full font-medium transition-colors border-none cursor-pointer text-sm"
          title="Shuffle cards"
        >
          🔀 Shuffle
        </button>
      </div>

      {!missedOnly && (
        <SectionFilter
          sections={sections}
          selected={selectedSections}
          onChange={(s) => { setSelectedSections(s); setCurrentIndex(0); setKnewCount(0); setDidntKnowCount(0); }}
        />
      )}

      {!isFinished && questions[currentIndex] && (
        <Flashcard
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          onResult={handleResult}
        />
      )}

      {isFinished && (
        <div className="text-center py-8 space-y-4 animate-pop-in">
          <div className="text-6xl">🌟</div>
          <h3 className="text-xl font-bold text-gray-700">You finished all the cards!</h3>
          <p className="text-gray-500">You knew {knewCount} out of {questions.length}</p>
          <div className="flex gap-3">
            <button
              onClick={resetReview}
              className="flex-1 bg-israel-blue hover:bg-israel-blue-dark text-white py-3 rounded-xl font-bold transition-colors border-none cursor-pointer"
            >
              🔄 Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-bold transition-colors border-2 border-gray-200 cursor-pointer"
            >
              🏠 Home
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {!isFinished && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl font-medium transition-colors border-none cursor-pointer disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            onClick={() => currentIndex < questions.length - 1 && setCurrentIndex(prev => prev + 1)}
            disabled={currentIndex >= questions.length - 1}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl font-medium transition-colors border-none cursor-pointer disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

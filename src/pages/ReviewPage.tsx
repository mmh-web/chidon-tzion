import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flashcard } from '../components/Flashcard';
import { SectionFilter } from '../components/SectionFilter';
import { useProgress } from '../context/ProgressContext';
import questionsData from '../data/questions.json';
import { Section, Question } from '../types';

const sections = questionsData.sections as Section[];

export function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSections: initialSections = sections.map(s => s.id), missedOnly = false } = (location.state || {}) as {
    selectedSections: string[];
    missedOnly: boolean;
  };

  const [selectedSections, setSelectedSections] = useState<string[]>(initialSections);
  const { progress, recordAnswer } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knewCount, setKnewCount] = useState(0);
  const [didntKnowCount, setDidntKnowCount] = useState(0);

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

    return allQuestions;
  }, [selectedSections, missedOnly, progress]);

  const handleResult = (knew: boolean) => {
    const question = questions[currentIndex];
    recordAnswer(question.id, knew);

    if (knew) {
      setKnewCount(prev => prev + 1);
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

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          {missedOnly ? '🔄 Review Missed Questions' : '📚 Study Flashcards'}
        </h2>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="flex gap-2 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ {knewCount}</span>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">❌ {didntKnowCount}</span>
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

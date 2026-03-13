import { useState } from 'react';
import { Question } from '../types';

interface Props {
  question: Question;
  onResult: (knew: boolean) => void;
}

export function Flashcard({ question, onResult }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="animate-slide-in">
      <div
        className="flip-card cursor-pointer"
        onClick={() => !flipped && setFlipped(true)}
        style={{ minHeight: '200px' }}
      >
        <div className={`flip-card-inner relative w-full ${flipped ? 'flipped' : ''}`} style={{ minHeight: '200px' }}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 bg-white rounded-2xl p-6 shadow-lg border-2 border-israel-blue flex flex-col items-center justify-center">
            <p className="text-xs text-gray-400 mb-3" dir="ltr">Tap to reveal the answer</p>
            <p className="text-xl font-bold text-gray-800 text-center leading-relaxed" dir="rtl">
              {question.question}
            </p>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 bg-gradient-to-br from-israel-blue to-israel-blue-dark rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
            <p className="text-xs text-blue-200 mb-3" dir="ltr">Answer</p>
            <p className="text-xl font-bold text-white text-center leading-relaxed" dir="rtl">
              {question.answer}
            </p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3 mt-4 animate-pop-in">
          <button
            onClick={() => {
              setFlipped(false);
              setTimeout(() => onResult(true), 300);
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-lg transition-colors border-none cursor-pointer"
          >
            ✅ I knew it!
          </button>
          <button
            onClick={() => {
              setFlipped(false);
              setTimeout(() => onResult(false), 300);
            }}
            className="flex-1 bg-red-400 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-lg transition-colors border-none cursor-pointer"
          >
            ❌ Didn't know
          </button>
        </div>
      )}
    </div>
  );
}

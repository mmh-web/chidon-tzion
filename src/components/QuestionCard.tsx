import { Question } from '../types';

interface Props {
  question: Question;
  choices: string[];
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
  correctAnswer: string | null;
}

export function QuestionCard({ question, choices, onAnswer, disabled, selectedAnswer, correctAnswer }: Props) {
  return (
    <div className="animate-slide-in">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4" dir="rtl">
        <p className="text-xl font-bold text-gray-800 leading-relaxed m-0">
          {question.question}
        </p>
      </div>

      <div className="space-y-3" dir="rtl">
        {choices.map((choice, i) => {
          let bgClass = 'bg-white hover:bg-blue-50 border-gray-200 hover:border-israel-blue';
          let textClass = 'text-gray-700';

          if (disabled && correctAnswer) {
            if (choice === correctAnswer) {
              bgClass = 'bg-green-100 border-green-500';
              textClass = 'text-green-800';
            } else if (choice === selectedAnswer && choice !== correctAnswer) {
              bgClass = 'bg-red-100 border-red-500';
              textClass = 'text-red-800';
            } else {
              bgClass = 'bg-gray-50 border-gray-200 opacity-50';
              textClass = 'text-gray-500';
            }
          }

          return (
            <button
              key={i}
              onClick={() => !disabled && onAnswer(choice)}
              disabled={disabled}
              className={`
                w-full p-4 rounded-xl border-2 text-right transition-all cursor-pointer
                text-lg font-medium
                ${bgClass} ${textClass}
                ${!disabled ? 'active:scale-[0.98]' : ''}
              `}
            >
              <span className="inline-block w-8 h-8 rounded-full bg-israel-blue/10 text-israel-blue text-center leading-8 ml-3 text-sm font-bold">
                {String.fromCharCode(1488 + i)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  score: number;
  streak: number;
  currentQuestion: number;
  totalQuestions: number;
}

export function ScoreDisplay({ score, streak, currentQuestion, totalQuestions }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500 block">ניקוד</span>
          <span className="text-xl font-bold text-israel-blue">{score}</span>
        </div>
        {streak >= 2 && (
          <div className="animate-pop-in bg-orange-100 rounded-lg px-3 py-2 border border-orange-200">
            <span className="text-xs text-orange-600 block">רצף</span>
            <span className="text-xl font-bold text-orange-500">
              🔥 {streak}
            </span>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
        <span className="text-sm text-gray-500">
          שאלה {currentQuestion + 1} מתוך {totalQuestions}
        </span>
      </div>
    </div>
  );
}

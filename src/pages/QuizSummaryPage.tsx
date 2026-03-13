import { useLocation, useNavigate } from 'react-router-dom';
import { Confetti } from '../components/Confetti';
import { QuizAnswer } from '../types';

export function QuizSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, totalQuestions = 0, missedQuestions = [], maxStreak = 0, selectedSections = [] } = (location.state || {}) as {
    score: number;
    totalQuestions: number;
    missedQuestions: QuizAnswer[];
    maxStreak: number;
    selectedSections: string[];
  };

  const correctCount = totalQuestions - missedQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: '!מצוין', color: 'text-yellow-600' };
    if (percentage >= 70) return { emoji: '⭐', text: '!כל הכבוד', color: 'text-blue-600' };
    if (percentage >= 50) return { emoji: '💪', text: 'לא רע! תמשיך לתרגל', color: 'text-green-600' };
    return { emoji: '📚', text: 'צריך לחזור על החומר', color: 'text-orange-600' };
  };

  const grade = getGrade();

  return (
    <div className="space-y-6">
      <Confetti trigger={true} intensity={percentage >= 70 ? 'big' : 'small'} />

      {/* Score Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
        <div className="text-6xl mb-3">{grade.emoji}</div>
        <h2 className={`text-2xl font-bold mb-2 ${grade.color}`}>{grade.text}</h2>
        <div className="text-5xl font-bold text-israel-blue mb-2">{percentage}%</div>
        <p className="text-gray-500">
          {correctCount} נכונות מתוך {totalQuestions} שאלות
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
          <span>🏆 ניקוד: {score}</span>
          <span>🔥 רצף מקסימלי: {maxStreak}</span>
        </div>
      </div>

      {/* Missed Questions */}
      {missedQuestions.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-3">❌ שאלות שהוחמצו ({missedQuestions.length})</h3>
          <div className="space-y-3">
            {missedQuestions.map((q, i) => (
              <div key={i} className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-sm text-gray-600 mb-1 font-medium">שאלה: {q.questionId}</p>
                <p className="text-sm text-red-600">
                  התשובה שלך: <span className="line-through">{q.userAnswer}</span>
                </p>
                <p className="text-sm text-green-600 font-bold">
                  התשובה הנכונה: {q.correctAnswer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {missedQuestions.length > 0 && (
          <button
            onClick={() => navigate('/review', { state: { selectedSections, missedOnly: true } })}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-lg transition-colors border-none cursor-pointer"
          >
            🔄 חזור על שאלות שהחמצתי
          </button>
        )}
        <button
          onClick={() => navigate('/quiz', { state: { selectedSections, timerSettings: { enabled: false, secondsPerQuestion: 30 }, numQuestions: totalQuestions } })}
          className="w-full bg-israel-blue hover:bg-israel-blue-dark text-white py-3 rounded-xl font-bold text-lg transition-colors border-none cursor-pointer"
        >
          🎯 חידון חדש
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-lg transition-colors border-2 border-gray-200 cursor-pointer"
        >
          🏠 דף הבית
        </button>
      </div>
    </div>
  );
}

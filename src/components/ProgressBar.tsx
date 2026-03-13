import { useProgress } from '../context/ProgressContext';
import { Section } from '../types';

interface Props {
  sections: Section[];
  selectedSections: string[];
}

export function ProgressBar({ sections, selectedSections }: Props) {
  const { progress } = useProgress();

  const selectedQuestions = sections
    .filter(s => selectedSections.includes(s.id))
    .flatMap(s => s.questions);

  const totalQuestions = selectedQuestions.length;
  const mastered = selectedQuestions.filter(q => progress.questionProgress[q.id]?.mastered).length;
  const seen = selectedQuestions.filter(q => progress.questionProgress[q.id]?.lastSeen).length;
  const percentage = totalQuestions > 0 ? Math.round((mastered / totalQuestions) * 100) : 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{mastered}/{totalQuestions} mastered</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-israel-blue to-israel-blue-light rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>📚 Seen: {seen}</span>
        <span>🏆 Best Streak: {progress.bestStreak}</span>
        <span>📝 Quizzes: {progress.totalQuizzesTaken}</span>
      </div>
    </div>
  );
}

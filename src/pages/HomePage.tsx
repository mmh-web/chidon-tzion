import { useNavigate } from 'react-router-dom';
import { SectionFilter } from '../components/SectionFilter';
import { ProgressBar } from '../components/ProgressBar';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProgress } from '../context/ProgressContext';
import questionsData from '../data/questions.json';
import { Section, TimerSettings } from '../types';

const sections = questionsData.sections as Section[];
const allSectionIds = sections.map(s => s.id);

export function HomePage() {
  const navigate = useNavigate();
  const [selectedSections, setSelectedSections] = useLocalStorage<string[]>('chidon-sections', allSectionIds);
  const [timerEnabled, setTimerEnabled] = useLocalStorage<boolean>('chidon-timer', false);
  const [timerSeconds, setTimerSeconds] = useLocalStorage<number>('chidon-timer-seconds', 30);
  const [numQuestions, setNumQuestions] = useLocalStorage<number>('chidon-num-questions', 10);
  const { resetProgress } = useProgress();

  const totalSelected = sections
    .filter(s => selectedSections.includes(s.id))
    .reduce((sum, s) => sum + s.questions.length, 0);

  const startQuiz = () => {
    const timerSettings: TimerSettings = { enabled: timerEnabled, secondsPerQuestion: timerSeconds };
    navigate('/quiz', { state: { selectedSections, timerSettings, numQuestions: Math.min(numQuestions, totalSelected) } });
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">!ברוכים הבאים</h2>
        <p className="text-gray-500">בואו נתכונן לחידון ציון</p>
      </div>

      {/* Progress */}
      <ProgressBar sections={sections} selectedSections={selectedSections} />

      {/* Section Filter */}
      <SectionFilter
        sections={sections}
        selected={selectedSections}
        onChange={setSelectedSections}
      />

      {/* Quiz Settings */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-700 m-0">הגדרות חידון</h3>

        {/* Number of questions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">מספר שאלות</span>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={999}>הכל ({totalSelected})</option>
          </select>
        </div>

        {/* Timer toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">⏱️ טיימר</span>
          <button
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={`
              relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none
              ${timerEnabled ? 'bg-israel-blue' : 'bg-gray-300'}
            `}
          >
            <div className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
              ${timerEnabled ? 'right-0.5' : 'right-[26px]'}
            `} />
          </button>
        </div>

        {timerEnabled && (
          <div className="flex items-center justify-between pr-4">
            <span className="text-sm text-gray-500">שניות לשאלה</span>
            <select
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value={15}>15 שניות</option>
              <option value={30}>30 שניות</option>
              <option value={45}>45 שניות</option>
              <option value={60}>60 שניות</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={startQuiz}
          disabled={selectedSections.length === 0}
          className="w-full bg-israel-blue hover:bg-israel-blue-dark text-white py-4 rounded-xl font-bold text-xl transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          🎯 התחל חידון!
        </button>

        <button
          onClick={() => navigate('/review', { state: { selectedSections, missedOnly: false } })}
          className="w-full bg-white hover:bg-gray-50 text-israel-blue py-3 rounded-xl font-bold text-lg transition-colors border-2 border-israel-blue cursor-pointer"
        >
          📚 עיין בכרטיסיות
        </button>

        <button
          onClick={() => navigate('/review', { state: { selectedSections, missedOnly: true } })}
          className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 py-3 rounded-xl font-bold text-lg transition-colors border-2 border-orange-200 cursor-pointer"
        >
          🔄 חזור על שאלות שהחמצתי
        </button>
      </div>

      {/* Reset */}
      <div className="text-center pt-4">
        <button
          onClick={() => { if (confirm('האם אתה בטוח? כל ההתקדמות תימחק.')) resetProgress(); }}
          className="text-xs text-gray-400 hover:text-red-400 bg-transparent border-none cursor-pointer"
        >
          אפס התקדמות
        </button>
      </div>
    </div>
  );
}

import { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProgressState, QuestionProgress } from '../types';

const defaultProgress: ProgressState = {
  questionProgress: {},
  totalQuizzesTaken: 0,
  bestStreak: 0,
  coins: 0,
  ownedCats: [],
  musicUnlocked: false,
  ownedTracks: [],
  activeTrack: '',
};

interface ProgressContextType {
  progress: ProgressState;
  recordAnswer: (questionId: string, correct: boolean) => void;
  incrementQuizCount: () => void;
  updateBestStreak: (streak: number) => void;
  getQuestionProgress: (questionId: string) => QuestionProgress;
  resetProgress: () => void;
  addCoins: (amount: number) => void;
  buyCat: (catId: string, price: number) => boolean;
  buyTrack: (trackId: string, price: number) => boolean;
  setActiveTrack: (trackId: string) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useLocalStorage<ProgressState>('chidon-progress', defaultProgress);

  // One-time migration: fix bugged coin values from earlier useEffect loop
  useEffect(() => {
    if ((progress.coins || 0) > 500) {
      setProgress(prev => ({ ...prev, coins: 0, ownedCats: [] }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getQuestionProgress = (questionId: string): QuestionProgress => {
    return progress.questionProgress[questionId] || {
      questionId,
      timesCorrect: 0,
      timesWrong: 0,
      consecutiveCorrect: 0,
      mastered: false,
      lastSeen: 0,
    };
  };

  const recordAnswer = (questionId: string, correct: boolean) => {
    setProgress(prev => {
      const existing = prev.questionProgress[questionId] || {
        questionId,
        timesCorrect: 0,
        timesWrong: 0,
        consecutiveCorrect: 0,
        mastered: false,
        lastSeen: 0,
      };

      const updated: QuestionProgress = correct
        ? {
            ...existing,
            timesCorrect: existing.timesCorrect + 1,
            consecutiveCorrect: existing.consecutiveCorrect + 1,
            mastered: existing.consecutiveCorrect + 1 >= 3,
            lastSeen: Date.now(),
          }
        : {
            ...existing,
            timesWrong: existing.timesWrong + 1,
            consecutiveCorrect: 0,
            mastered: false,
            lastSeen: Date.now(),
          };

      return {
        ...prev,
        questionProgress: {
          ...prev.questionProgress,
          [questionId]: updated,
        },
      };
    });
  };

  const incrementQuizCount = () => {
    setProgress(prev => ({ ...prev, totalQuizzesTaken: prev.totalQuizzesTaken + 1 }));
  };

  const updateBestStreak = (streak: number) => {
    setProgress(prev => ({
      ...prev,
      bestStreak: Math.max(prev.bestStreak, streak),
    }));
  };

  const addCoins = useCallback((amount: number) => {
    setProgress(prev => ({ ...prev, coins: (prev.coins || 0) + amount }));
  }, [setProgress]);

  const buyCat = (catId: string, price: number): boolean => {
    let success = false;
    setProgress(prev => {
      const coins = prev.coins || 0;
      const owned = prev.ownedCats || [];
      if (coins >= price && !owned.includes(catId)) {
        success = true;
        return { ...prev, coins: coins - price, ownedCats: [...owned, catId] };
      }
      return prev;
    });
    return success;
  };

  const buyTrack = (trackId: string, price: number): boolean => {
    let success = false;
    setProgress(prev => {
      const coins = prev.coins || 0;
      const owned = prev.ownedTracks || [];
      if (coins >= price && !owned.includes(trackId)) {
        success = true;
        return {
          ...prev,
          coins: coins - price,
          musicUnlocked: true,
          ownedTracks: [...owned, trackId],
          activeTrack: prev.activeTrack || trackId,
        };
      }
      return prev;
    });
    return success;
  };

  const setActiveTrack = (trackId: string) => {
    setProgress(prev => ({ ...prev, activeTrack: trackId }));
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
  };

  return (
    <ProgressContext.Provider value={{ progress, recordAnswer, incrementQuizCount, updateBestStreak, getQuestionProgress, resetProgress, addCoins, buyCat, buyTrack, setActiveTrack }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}

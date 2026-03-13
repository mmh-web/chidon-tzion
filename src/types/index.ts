export type QuestionType = 'text' | 'image' | 'map';

export interface Question {
  id: string;
  question: string;
  answer: string;
  type: QuestionType;
  image?: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  questions: Question[];
}

export interface QuestionProgress {
  questionId: string;
  timesCorrect: number;
  timesWrong: number;
  consecutiveCorrect: number;
  mastered: boolean;
  lastSeen: number;
}

export interface ProgressState {
  questionProgress: Record<string, QuestionProgress>;
  totalQuizzesTaken: number;
  bestStreak: number;
  coins: number;
  ownedCats: string[];
}

export interface Cat {
  id: string;
  name: string;
  emoji: string;
  image?: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface QuizAnswer {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
}

export interface TimerSettings {
  enabled: boolean;
  secondsPerQuestion: number;
}

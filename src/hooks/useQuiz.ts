import { useState, useCallback } from 'react';
import { Question, Section, QuizAnswer, TimerSettings } from '../types';
import { shuffle } from '../utils/shuffle';
import { generateChoices } from '../utils/generateChoices';
import { useProgress } from '../context/ProgressContext';

interface QuizState {
  questions: { question: Question; sectionId: string }[];
  currentIndex: number;
  answers: QuizAnswer[];
  score: number;
  streak: number;
  maxStreak: number;
  choices: string[];
  finished: boolean;
  showingFeedback: boolean;
  lastAnswerCorrect: boolean | null;
}

export function useQuiz(sections: Section[], selectedSectionIds: string[], timerSettings: TimerSettings) {
  const { progress, recordAnswer, incrementQuizCount, updateBestStreak } = useProgress();

  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    answers: [],
    score: 0,
    streak: 0,
    maxStreak: 0,
    choices: [],
    finished: false,
    showingFeedback: false,
    lastAnswerCorrect: null,
  });

  const startQuiz = useCallback((numQuestions: number = 10) => {
    const selectedSections = sections.filter(s => selectedSectionIds.includes(s.id));
    const pool: { question: Question; sectionId: string; weight: number }[] = [];

    for (const section of selectedSections) {
      for (const q of section.questions) {
        const qp = progress.questionProgress[q.id];
        let weight = 3; // unseen
        if (qp) {
          weight = Math.max(1, 1 + (qp.timesWrong * 2) - qp.timesCorrect);
          if (qp.mastered) weight = 1;
        }
        pool.push({ question: q, sectionId: section.id, weight });
      }
    }

    // Weighted random selection
    const selected: typeof pool = [];
    const remaining = [...pool];
    const count = Math.min(numQuestions, remaining.length);

    for (let i = 0; i < count; i++) {
      const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      let chosenIndex = 0;

      for (let j = 0; j < remaining.length; j++) {
        random -= remaining[j].weight;
        if (random <= 0) {
          chosenIndex = j;
          break;
        }
      }

      selected.push(remaining[chosenIndex]);
      remaining.splice(chosenIndex, 1);
    }

    const shuffled = shuffle(selected);
    const firstChoices = shuffled.length > 0
      ? generateChoices(shuffled[0].question, sections, shuffled[0].sectionId)
      : [];

    setState({
      questions: shuffled.map(s => ({ question: s.question, sectionId: s.sectionId })),
      currentIndex: 0,
      answers: [],
      score: 0,
      streak: 0,
      maxStreak: 0,
      choices: firstChoices,
      finished: false,
      showingFeedback: false,
      lastAnswerCorrect: null,
    });
  }, [sections, selectedSectionIds, progress]);

  const submitAnswer = useCallback((answer: string) => {
    setState(prev => {
      if (prev.showingFeedback || prev.finished) return prev;

      const current = prev.questions[prev.currentIndex];
      const correct = answer === current.question.answer;
      const newStreak = correct ? prev.streak + 1 : 0;
      const streakBonus = correct && newStreak > 2 ? 5 : 0;
      const newScore = prev.score + (correct ? 10 + streakBonus : 0);
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);

      const quizAnswer: QuizAnswer = {
        questionId: current.question.id,
        correct,
        userAnswer: answer,
        correctAnswer: current.question.answer,
      };

      recordAnswer(current.question.id, correct);

      return {
        ...prev,
        answers: [...prev.answers, quizAnswer],
        score: newScore,
        streak: newStreak,
        maxStreak: newMaxStreak,
        showingFeedback: true,
        lastAnswerCorrect: correct,
      };
    });
  }, [recordAnswer]);

  const handleTimeout = useCallback(() => {
    setState(prev => {
      if (prev.showingFeedback || prev.finished) return prev;

      const current = prev.questions[prev.currentIndex];
      const quizAnswer: QuizAnswer = {
        questionId: current.question.id,
        correct: false,
        userAnswer: "(Time's up)",
        correctAnswer: current.question.answer,
      };

      recordAnswer(current.question.id, false);

      return {
        ...prev,
        answers: [...prev.answers, quizAnswer],
        streak: 0,
        showingFeedback: true,
        lastAnswerCorrect: false,
      };
    });
  }, [recordAnswer]);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        incrementQuizCount();
        updateBestStreak(prev.maxStreak);
        return { ...prev, finished: true, showingFeedback: false };
      }

      const nextQ = prev.questions[nextIndex];
      const newChoices = generateChoices(nextQ.question, sections, nextQ.sectionId);

      return {
        ...prev,
        currentIndex: nextIndex,
        choices: newChoices,
        showingFeedback: false,
        lastAnswerCorrect: null,
      };
    });
  }, [sections, incrementQuizCount, updateBestStreak]);

  const currentQuestion = state.questions[state.currentIndex]?.question || null;
  const missedQuestions = state.answers.filter(a => !a.correct);

  return {
    ...state,
    currentQuestion,
    missedQuestions,
    totalQuestions: state.questions.length,
    startQuiz,
    submitAnswer,
    nextQuestion,
    handleTimeout,
    timerSettings,
  };
}

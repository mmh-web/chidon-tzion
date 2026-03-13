import { Question, Section } from '../types';
import { shuffle } from './shuffle';

export function generateChoices(
  question: Question,
  allSections: Section[],
  currentSectionId: string
): string[] {
  const correctAnswer = question.answer;

  // Gather all answers from the same section first
  const currentSection = allSections.find(s => s.id === currentSectionId);
  const sameSectionAnswers = currentSection
    ? currentSection.questions
        .map(q => q.answer)
        .filter(a => a !== correctAnswer)
    : [];

  // Gather answers from other sections as fallback
  const otherAnswers = allSections
    .filter(s => s.id !== currentSectionId)
    .flatMap(s => s.questions.map(q => q.answer))
    .filter(a => a !== correctAnswer);

  // Deduplicate
  const uniqueSame = [...new Set(sameSectionAnswers)];
  const uniqueOther = [...new Set(otherAnswers)];

  // Pick distractors: prefer same section
  const distractors: string[] = [];
  const shuffledSame = shuffle(uniqueSame);
  const shuffledOther = shuffle(uniqueOther);

  for (const a of shuffledSame) {
    if (distractors.length >= 3) break;
    distractors.push(a);
  }

  for (const a of shuffledOther) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(a)) {
      distractors.push(a);
    }
  }

  return shuffle([correctAnswer, ...distractors]);
}

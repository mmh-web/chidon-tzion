import { Question, Section } from '../types';
import { shuffle } from './shuffle';

export function generateChoices(
  question: Question,
  allSections: Section[],
  currentSectionId: string
): string[] {
  const correctAnswer = question.answer;
  const correctLen = correctAnswer.length;

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

  // Sort by similarity in length to the correct answer (closer = harder to distinguish)
  const byLengthSimilarity = (a: string, b: string) =>
    Math.abs(a.length - correctLen) - Math.abs(b.length - correctLen);

  const sortedSame = [...uniqueSame].sort(byLengthSimilarity);
  const sortedOther = [...uniqueOther].sort(byLengthSimilarity);

  // Pick distractors: prefer same section, sorted by length similarity
  // Add some randomness: pick from top candidates, not always the closest
  const pickFromTop = (arr: string[], count: number): string[] => {
    // Take top ~60% of candidates (at least 5), then shuffle and pick
    const poolSize = Math.max(5, Math.ceil(arr.length * 0.6));
    const topPool = arr.slice(0, poolSize);
    const shuffled = shuffle(topPool);
    return shuffled.slice(0, count);
  };

  const distractors: string[] = [];

  // Try to get distractors from same section first
  const samePicks = pickFromTop(sortedSame, 3);
  for (const a of samePicks) {
    if (distractors.length >= 3) break;
    distractors.push(a);
  }

  // Fill remaining from other sections
  if (distractors.length < 3) {
    const otherPicks = pickFromTop(sortedOther, 3 - distractors.length);
    for (const a of otherPicks) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(a)) {
        distractors.push(a);
      }
    }
  }

  return shuffle([correctAnswer, ...distractors]);
}

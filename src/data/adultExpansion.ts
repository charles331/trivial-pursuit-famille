import { CategoryId, Question } from '../types';

const ADULT_TARGET_PER_CATEGORY = 400;
const TEEN_TARGET_PER_CATEGORY = 135;

function answerOf(question: Question): string {
  return question.options[question.correctAnswerIndex];
}

function compactPrompt(prompt: string): string {
  const clean = prompt.replace(/\s+/g, ' ').trim();
  return clean.length <= 92 ? clean : `${clean.slice(0, 89).trimEnd()}…`;
}

function classicTeenVersion(question: Question, sequence: number): Question {
  return {
    ...question,
    id: `${question.categoryId}_ado_classique_${sequence}`,
    difficulty: 'ado',
  };
}

function associationQuestion(
  categoryId: CategoryId,
  sources: Question[],
  sequence: number,
): Question {
  const correctSlot = sequence % 4;
  const sourceOffset = sequence % sources.length;
  const sourceStride = 7 + Math.floor(sequence / sources.length) * 4;
  const selected = Array.from(
    { length: 4 },
    (_, index) => sources[(sourceOffset + index * sourceStride) % sources.length],
  );

  const options = selected.map((question, index) => {
    const answerQuestion = index === correctSlot
      ? question
      : selected[(index + 1) % selected.length];
    return `${compactPrompt(question.question)} — ${answerOf(answerQuestion)}`;
  });
  const prompts = [
    'Quelle association entre une question et sa réponse est correcte ?',
    'Parmi ces quatre associations, laquelle est exacte ?',
    'Quel duo question–réponse ne contient aucune erreur ?',
    'Quelle proposition associe correctement le fait demandé et sa réponse ?',
    'Une seule de ces associations est juste. Laquelle ?',
    'Quelle paire présente une question avec sa véritable réponse ?',
    'Quel rapprochement entre une question et une réponse est exact ?',
    'Laquelle de ces associations de culture générale est correcte ?',
  ];

  return {
    id: `${categoryId}_adulte_association_${sequence + 1}`,
    categoryId,
    question: prompts[sequence % prompts.length],
    options,
    correctAnswerIndex: correctSlot,
    difficulty: 'adulte',
    explanation: `La bonne association est : ${compactPrompt(selected[correctSlot].question)} — ${answerOf(selected[correctSlot])}.`,
  };
}

/**
 * Builds a stable adult pool without introducing unverifiable facts.
 *
 * Every original question remains available to its intended age group. Adult
 * players receive an adult copy of the category's classic questions, followed
 * by harder association cards based exclusively on answers already reviewed in
 * the repository. The result is deterministic and contains exactly 400 adult
 * cards per category.
 */
export function completeAdultQuestionBank(questions: Question[]): Question[] {
  const categories = [...new Set(questions.map((question) => question.categoryId))];
  const additions: Question[] = [];

  for (const categoryId of categories) {
    const categoryQuestions = questions.filter(
      (question) => question.categoryId === categoryId,
    );
    const existingAdults = categoryQuestions.filter(
      (question) => question.difficulty === 'adulte',
    );

    if (existingAdults.length >= ADULT_TARGET_PER_CATEGORY) continue;

    const sourceQuestions = categoryQuestions.filter((question) => {
      const correctAnswer = answerOf(question);
      return question.options.length === 4
        && typeof correctAnswer === 'string'
        && correctAnswer.trim().length > 0;
    });

    if (sourceQuestions.length < 4) {
      throw new Error(`Pas assez de questions sources pour compléter ${categoryId}.`);
    }

    const remaining = ADULT_TARGET_PER_CATEGORY - existingAdults.length;

    for (let sequence = 0; sequence < remaining; sequence += 1) {
      additions.push(associationQuestion(
        categoryId,
        sourceQuestions,
        sequence,
      ));
    }
  }

  return [...questions, ...additions];
}

export function completeTeenQuestionBank(questions: Question[]): Question[] {
  const categories = [...new Set(questions.map((question) => question.categoryId))];
  const additions: Question[] = [];

  for (const categoryId of categories) {
    const categoryQuestions = questions.filter(
      (question) => question.categoryId === categoryId,
    );
    const teenCount = categoryQuestions.filter(
      (question) => question.difficulty === 'ado',
    ).length;
    const missing = Math.max(0, TEEN_TARGET_PER_CATEGORY - teenCount);
    const childSources = categoryQuestions.filter(
      (question) => question.difficulty === 'enfant',
    );

    additions.push(...childSources
      .slice(0, missing)
      .map((question, index) => classicTeenVersion(question, index + 1)));
  }

  return [...questions, ...additions];
}

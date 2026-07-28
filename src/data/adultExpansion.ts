import { CategoryId, Question } from '../types';

const ADULT_TARGET_PER_CATEGORY = 400;
const TEEN_TARGET_PER_CATEGORY = 135;

function answerOf(question: Question): string {
  return question.options[question.correctAnswerIndex];
}

function classicTeenVersion(question: Question, sequence: number): Question {
  return {
    ...question,
    id: `${question.categoryId}_ado_classique_${sequence}`,
    difficulty: 'ado',
  };
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function rotateOptions(
  options: string[],
  correctAnswerIndex: number,
  offset: number,
): Pick<Question, 'options' | 'correctAnswerIndex'> {
  const rotation = offset % options.length;
  return {
    options: options.map((_, index) => options[(index + rotation) % options.length]),
    correctAnswerIndex: (correctAnswerIndex - rotation + options.length) % options.length,
  };
}

function directAdultQuestion(
  categoryId: CategoryId,
  source: Question,
  sequence: number,
): Question {
  const cleanQuestion = source.question.replace(/\s+/g, ' ').trim();
  const rotated = rotateOptions(
    source.options,
    source.correctAnswerIndex,
    sequence,
  );

  return {
    id: `${categoryId}_adulte_directe_${sequence + 1}`,
    categoryId,
    question: cleanQuestion,
    ...rotated,
    difficulty: 'adulte',
    explanation: source.explanation,
  };
}

/**
 * Builds the adult pool without introducing unverifiable facts.
 *
 * Every original question remains available to its intended age group. Adult
 * players may receive direct versions of already-reviewed teen cards. Child
 * cards are never promoted to adult level. Each source fact is promoted at most once:
 * reaching a round number must never create a disguised duplicate.
 *
 * This deliberately does not turn explanations into fill-in-the-blank cards.
 * Such cards lose context, produce unrelated distractors and merely repeat the
 * source fact. A category may therefore remain below the editorial target until
 * enough genuinely reviewed adult questions have been added.
 */
export function completeAdultQuestionBank(questions: Question[]): Question[] {
  const categories = [...new Set(questions.map((question) => question.categoryId))];
  const additions: Question[] = [];
  const childSourceSignatures = new Set(
    questions
      .filter((question) => question.difficulty === 'enfant')
      .map((question) => (
        `${normalize(question.question)}|${normalize(answerOf(question))}`
      )),
  );

  for (const categoryId of categories) {
    const categoryQuestions = questions.filter(
      (question) => question.categoryId === categoryId,
    );
    const existingAdults = categoryQuestions.filter(
      (question) => question.difficulty === 'adulte',
    );

    if (existingAdults.length >= ADULT_TARGET_PER_CATEGORY) continue;

    const seenSourceSignatures = new Set<string>();
    const sourceQuestions = categoryQuestions.filter((question) => {
      const correctAnswer = answerOf(question);
      const signature = `${normalize(question.question)}|${normalize(correctAnswer)}`;
      const normalizedQuestion = normalize(question.question);
      const normalizedAnswer = normalize(correctAnswer);
      const revealsAnswer = normalizedAnswer.length >= 3
        && ` ${normalizedQuestion} `.includes(` ${normalizedAnswer} `);
      const isEligible = question.difficulty === 'ado'
        && question.options.length === 4
        && typeof correctAnswer === 'string'
        && correctAnswer.trim().length > 0
        && !revealsAnswer
        && question.question.length <= 105
        && question.options.every((option) => option.length <= 55)
        && !childSourceSignatures.has(signature)
        && !seenSourceSignatures.has(signature);
      if (isEligible) seenSourceSignatures.add(signature);
      return isEligible;
    });

    const remaining = Math.min(
      ADULT_TARGET_PER_CATEGORY - existingAdults.length,
      sourceQuestions.length,
    );

    for (let sequence = 0; sequence < remaining; sequence += 1) {
      const source = sourceQuestions[sequence];
      additions.push(directAdultQuestion(
        categoryId,
        source,
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

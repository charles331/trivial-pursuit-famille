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
  occurrence: number,
): Question {
  const cleanQuestion = source.question.replace(/\s+/g, ' ').trim();
  const lowerCaseQuestion = `${cleanQuestion.charAt(0).toLowerCase()}${cleanQuestion.slice(1)}`;
  const promptVariants = [
    cleanQuestion,
    `Question flash : ${lowerCaseQuestion}`,
    `Défi express : ${lowerCaseQuestion}`,
    `À vous de jouer : ${lowerCaseQuestion}`,
  ];
  const prompt = promptVariants[occurrence];
  if (!prompt) {
    throw new Error(`Trop peu de faits uniques pour compléter ${categoryId}.`);
  }
  const rotated = rotateOptions(
    source.options,
    source.correctAnswerIndex,
    sequence + occurrence,
  );

  return {
    id: `${categoryId}_adulte_directe_${sequence + 1}`,
    categoryId,
    question: prompt,
    ...rotated,
    difficulty: 'adulte',
    explanation: source.explanation,
  };
}

/**
 * Builds a stable adult pool without introducing unverifiable facts.
 *
 * Every original question remains available to its intended age group. Adult
 * players receive short, direct cards based exclusively on facts already
 * reviewed in the repository. Options are rotated to balance the correct-answer
 * position. When the source pool is smaller than the target, a second concise
 * "question flash" wording is used instead of the former long association
 * format. The result is deterministic and contains exactly 400 adult cards per
 * category.
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

    const seenSourceSignatures = new Set<string>();
    const sourceQuestions = categoryQuestions.filter((question) => {
      const correctAnswer = answerOf(question);
      const signature = `${normalize(question.question)}|${normalize(correctAnswer)}`;
      const isEligible = question.difficulty !== 'adulte'
        && question.options.length === 4
        && typeof correctAnswer === 'string'
        && correctAnswer.trim().length > 0
        && question.question.length <= 105
        && question.options.every((option) => option.length <= 55)
        && !seenSourceSignatures.has(signature);
      if (isEligible) seenSourceSignatures.add(signature);
      return isEligible;
    });

    if (sourceQuestions.length < 4) {
      throw new Error(`Pas assez de questions sources pour compléter ${categoryId}.`);
    }

    const remaining = ADULT_TARGET_PER_CATEGORY - existingAdults.length;

    for (let sequence = 0; sequence < remaining; sequence += 1) {
      const source = sourceQuestions[sequence % sourceQuestions.length];
      additions.push(directAdultQuestion(
        categoryId,
        source,
        sequence,
        Math.floor(sequence / sourceQuestions.length),
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

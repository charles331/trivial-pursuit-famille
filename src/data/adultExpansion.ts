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

function cleanExplanation(question: Question): string {
  return (question.explanation ?? '')
    .replace(/^Le saviez-vous\s*\?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface AnecdoteCard {
  source: Question;
  subject: string;
  prompt: string;
}

const SUBJECT_VERBS = [
  'est', 'sont', 'était', 'étaient', 'a', 'ont', 'avait', 'avaient', 'peut',
  'peuvent', 'mesure', 'mesurent', 'pèse', 'pèsent', 'vit', 'vivent', 'vient',
  'viennent', 'porte', 'portent', 'compte', 'comptent', 'utilise', 'utilisent',
  'signifie', 'signifient', 'désigne', 'désignent', 'devient', 'deviennent',
  'reste', 'restent', 'fut', 'furent', 'naît', 'naissent', 'contient',
  'contiennent', 'sert', 'servent', 'permet', 'permettent', 'possède',
  'possèdent', 'produit', 'produisent', 'joue', 'jouent', 'se trouve',
  'se trouvent', 'se compose', 'se composent', 'doit', 'doivent', 'fait',
  'font', 'donne', 'donnent', 'rend', 'rendent', 'déteste', 'accompagne',
  'habite', 'pousse', 'provient', "s'inspire", 'finit', 'attrape', 'vise',
  'croient', 'garde', 'change', 'offre', 'ressemblent', 'commencent',
  'reçoit', 'veut', 'se balance', "s'appelle", 'stocke', 'adore', 'rétrécit',
  'sait', 'fallait', 'protège', "s'entraînent", "s'achève", 'rapporte',
  'prend', 'jouait', 'marqués', 'dépassent', 'parcourent', 'sautent',
  'représentent', 'existait', 'tombe', 'risque', 'dit', 'parle', 'avance',
  'butinent', 'bat', 'ajoute', 'tire', 'poussent', 'trouve', 'appelle',
  'existent',
  'proclame', 'proclament', 'raconte', 'racontent', 'explique', 'expliquent',
].sort((a, b) => b.length - a.length);

const SUBJECT_PATTERN = new RegExp(
  `^(.{3,48}?)\\s+(${SUBJECT_VERBS.join('|')})\\b`,
  'i',
);

function anecdoteParts(source: Question): AnecdoteCard | null {
  const explanation = cleanExplanation(source).replace(/^\?\s*/, '');
  const correctAnswer = answerOf(source);
  const normalizedExplanation = normalize(explanation);
  const normalizedAnswer = normalize(correctAnswer);
  const answerPosition = normalizedExplanation.indexOf(normalizedAnswer);
  let subject = '';
  let statement = '';

  if (correctAnswer.length >= 3 && correctAnswer.length <= 48 && answerPosition >= 0) {
    const literalPosition = explanation.toLocaleLowerCase('fr').indexOf(
      correctAnswer.toLocaleLowerCase('fr'),
    );
    if (literalPosition >= 0) {
      subject = explanation.slice(literalPosition, literalPosition + correctAnswer.length);
      statement = `${explanation.slice(0, literalPosition)}…${explanation.slice(literalPosition + correctAnswer.length)}`;
    }
  }

  if (!subject) {
    const match = explanation.match(SUBJECT_PATTERN);
    if (
      match
      && !/^(c'|ce |cela |il |elle |on |pour |dans |en |avant |après |grâce |avec |sans |lors |chaque )/i.test(match[1])
    ) {
      const rawSubject = match[1].trim();
      subject = rawSubject.replace(/\s+n(?:e|')$/i, '').trim();
      statement = `…${explanation.slice(subject.length)}`;
    }
  }

  if (!subject || normalize(subject).length < 2 || subject.includes(',')) return null;
  const prompt = `Quel élément complète ce fait : « ${statement} » ?`;
  if (prompt.length > 125) return null;
  return { source, subject, prompt };
}

function anecdoteAdultQuestion(
  categoryId: CategoryId,
  card: AnecdoteCard,
  distractorCards: AnecdoteCard[],
  sequence: number,
): Question {
  const correctAnswer = card.subject;
  const distractors: string[] = [];

  for (let offset = 1; distractors.length < 3; offset += 1) {
    const candidate = distractorCards[
      (sequence + offset * 17) % distractorCards.length
    ].subject;
    if (
      normalize(candidate) !== normalize(correctAnswer)
      && !distractors.some((answer) => normalize(answer) === normalize(candidate))
    ) {
      distractors.push(candidate);
    }
  }

  const options = [correctAnswer, ...distractors];
  const rotated = rotateOptions(options, 0, sequence);

  return {
    id: `${categoryId}_adulte_anecdote_${sequence + 1}`,
    categoryId,
    question: card.prompt,
    ...rotated,
    difficulty: 'adulte',
    explanation: card.source.explanation,
  };
}

/**
 * Builds a stable adult pool without introducing unverifiable facts.
 *
 * Every original question remains available to its intended age group. Adult
 * players receive short, direct cards based exclusively on facts already
 * reviewed in the repository. Each source fact is promoted at most once:
 * reaching a round number must never create a disguised duplicate. Options are
 * rotated to balance the correct-answer position.
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

    const directCount = existingAdults.length + remaining;
    const anecdoteSourcesBySignature = new Map<string, AnecdoteCard>();
    for (const question of categoryQuestions) {
      const explanation = cleanExplanation(question);
      const card = anecdoteParts(question);
      const signature = `${normalize(explanation)}|${normalize(card?.subject ?? '')}`;
      if (card && !anecdoteSourcesBySignature.has(signature)) {
        anecdoteSourcesBySignature.set(signature, card);
      }
    }

    const anecdoteSources = [...anecdoteSourcesBySignature.values()];
    const anecdoteCount = Math.min(
      ADULT_TARGET_PER_CATEGORY - directCount,
      anecdoteSources.length,
    );
    for (let sequence = 0; sequence < anecdoteCount; sequence += 1) {
      additions.push(anecdoteAdultQuestion(
        categoryId,
        anecdoteSources[sequence],
        anecdoteSources,
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

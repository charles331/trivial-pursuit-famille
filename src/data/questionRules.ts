/**
 * Contrat éditorial d'une carte, en un seul endroit.
 *
 * Les règles de l'ADR 0001 n'existaient que dans `scripts/audit-questions.ts`,
 * qui ne lit que `QUESTIONS_DATABASE` : les cartes produites par le générateur
 * IA n'étaient donc soumises à aucune d'entre elles. Ce module contient les
 * contrôles réutilisables, importés à la fois par l'audit de la banque rédigée
 * et par `/api/generate-pack`.
 */

export const MAX_ADULT_QUESTION_LENGTH = 125;
export const MAX_ADULT_OPTION_LENGTH = 72;
/** Recouvrement lexical au-delà duquel deux énoncés posent le même fait. */
export const PARAPHRASE_OVERLAP = 0.34;
/** Réutilisations maximales d'un même moule d'énoncé dans une catégorie. */
export const MAX_SKELETON_REUSE = 8;
/** Part maximale de cartes jouées au hasard entre quatre nombres nus. */
export const MAX_BARE_NUMBER_RATIO = 0.05;

const DECORATIVE_PREFIX = /^(question flash|défi express|à vous de jouer)\s*:/i;

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const CONTENT_STOP_WORDS = new Set([
  'alors', 'avec', 'avoir', 'cette', 'comme', 'dans', 'depuis', 'elle', 'elles',
  'entre', 'etre', 'fait', 'font', 'leur', 'leurs', 'mais', 'meme', 'pour',
  'quel', 'quelle', 'quels', 'quelles', 'sans', 'sont', 'sous', 'tous', 'toutes',
  'vers', 'votre',
]);

export function contentWords(value: string): Set<string> {
  return new Set(
    normalize(value)
      .split(' ')
      .filter((word) => word.length >= 4 && !CONTENT_STOP_WORDS.has(word)),
  );
}

export function containsWholeNormalizedPhrase(haystack: string, needle: string): boolean {
  const normalizedHaystack = ` ${normalize(haystack)} `;
  const normalizedNeedle = normalize(needle);
  return normalizedNeedle.length >= 4
    && normalizedHaystack.includes(` ${normalizedNeedle} `);
}

export function leaksCorrectAnswer(question: string, correctAnswer: string): boolean {
  if (!containsWholeNormalizedPhrase(question, correctAnswer)) return false;

  const prompt = ` ${normalize(question)} `;
  const answer = normalize(correctAnswer);
  const occurrences = prompt.split(` ${answer} `).length - 1;
  if (occurrences > 1) return true;

  // Deliberately conservative: merely naming an answer candidate in the
  // question can be legitimate ("entre le lièvre et la tortue"). We only
  // reject wording which explicitly asserts that candidate as the answer.
  return [
    ` est ${answer} `,
    ` s appelle ${answer} `,
    ` appele ${answer} `,
    ` appelee ${answer} `,
    ` nomme ${answer} `,
    ` nommee ${answer} `,
  ].some((assertion) => prompt.includes(assertion));
}

export function isArtificialFillIn(question: string): boolean {
  return (
    /\b(?:compl[eè]te|compl[eé]tez|compl[eè]te-t-il|manque)\b.{0,45}\b(?:fait|phrase|affirmation|citation)\b/i.test(question)
    || /\bquel (?:mot|[ée]l[ée]ment) compl[eè]te\b/i.test(question)
    || /(?:_{2,}|[…]{1,3})\s*[a-z]{0,3}\b.*\?/iu.test(question)
  );
}

/** Un blanc entouré d'un accord ou d'un article donne la réponse par la grammaire. */
export function hasGrammarHintAroundBlank(question: string): boolean {
  return (
    /(?:_{2,}|[…]{1,3})\s*(?:s|e|es|ent)\b/iu.test(question)
    || /\b(?:un|une|des|le|la|les)\s+(?:_{2,}|[…]{1,3})/iu.test(question)
  );
}

export function hasDecorativePrefix(question: string): boolean {
  return DECORATIVE_PREFIX.test(question);
}

export function stripDecorativePrefix(question: string): string {
  return question.replace(DECORATIVE_PREFIX, '').trim();
}

/**
 * Format d'association interdit par l'ADR 0001 : le joueur doit alors lire
 * quatre paires « question — réponse » au lieu d'un énoncé unique.
 */
export function isAssociationFormat(question: string, options: string[]): boolean {
  if (/\b(?:association|appariement|correspondance)s?\b/i.test(question)
    && /\b(?:correcte|exacte|juste|bonne)\b/i.test(question)) {
    return true;
  }
  const pairedOptions = options.filter(
    (option) => /\?/.test(option) || /\s[—–]\s/.test(option),
  ).length;
  return pairedOptions >= 2;
}

export function merelyRestatesQuestion(
  card: { question: string; explanation?: string },
  correctAnswer: string,
): boolean {
  const explanation = card.explanation?.trim() ?? '';
  if (!explanation) return true;

  const explanationWithoutLabel = explanation
    .replace(/^\s*le saviez-vous\s*\?\s*/i, '')
    .replace(/^\s*(?:r[ée]ponse|explication)\s*:\s*/i, '');
  const explanationWords = contentWords(explanationWithoutLabel);
  if (explanationWords.size === 0) return true;

  const knownWords = contentWords(`${card.question} ${correctAnswer}`);
  return [...explanationWords].every((word) => knownWords.has(word));
}

/**
 * Squelette d'un énoncé : noms propres et titres cités remplacés par un blanc.
 * « Quel fleuve traverse Budapest ? » et « Quel fleuve traverse Belgrade ? »
 * partagent alors la même clé. Un découpage sur les premiers mots les voyait
 * comme deux moules distincts, et laissait passer les séries de dix-huit cartes.
 */
export function questionSkeleton(question: string): string {
  return question
    .replace(/[«"][^»"]*[»"]/g, '_')
    .split(/\s+/)
    .map((word, index) => (index > 0 && /^[A-ZÀ-Ý]/.test(word) ? '_' : normalize(word)))
    .join(' ')
    .replace(/(?:_[\s,]*)+/g, '_ ')
    .trim();
}

/** Mots pleins d'un énoncé, pour rapprocher deux reformulations du même fait. */
export function comparableWords(value: string): Set<string> {
  return new Set(
    normalize(value)
      .split(' ')
      .filter((word) => word.length > 2 && !CONTENT_STOP_WORDS.has(word))
      .map((word) => {
        const trimmed = word.replace(/(aux|es|s|e)$/, '');
        return trimmed.length > 7 ? trimmed.slice(0, 6) : trimmed;
      }),
  );
}

/**
 * Noms propres et titres cités d'un énoncé.
 *
 * Deux cartes peuvent partager la même réponse sans poser le même fait : « La
 * Nuit étoilée » et « Le Café de nuit » sont deux van Gogh, XIII et Thorgal
 * deux séries de Van Hamme. Quand chaque énoncé nomme une œuvre ou une entité
 * que l'autre ignore, il ne s'agit pas d'une reformulation.
 */
export function distinctiveNames(question: string): Set<string> {
  const quoted = [...question.matchAll(/[«"]([^»"]*)[»"]/g)].map((match) => match[1]);
  const capitalised = question
    .split(/\s+/)
    .slice(1)
    .filter((word) => /^[A-ZÀ-Ý]/.test(word));
  return new Set([...quoted, ...capitalised].map(normalize).filter(Boolean));
}

/** Réponse comparable : « Le Danube » et « Danube » désignent le même fait. */
export function comparableAnswer(answer: string): string {
  return normalize(answer).replace(/^(le|la|les|l|un|une|des|du|de)\s+/, '');
}

/**
 * Deux énoncés reformulent-ils le même fait ? À n'appeler que sur des cartes
 * qui partagent déjà catégorie et bonne réponse.
 */
export function paraphrasesSameFact(leftQuestion: string, rightQuestion: string): boolean {
  const left = comparableWords(leftQuestion);
  const right = comparableWords(rightQuestion);
  if (left.size === 0 || right.size === 0) return false;

  const namesLeft = distinctiveNames(leftQuestion);
  const namesRight = distinctiveNames(rightQuestion);
  const eachNamesSomethingOwn = [...namesLeft].some((name) => !namesRight.has(name))
    && [...namesRight].some((name) => !namesLeft.has(name));
  if (eachNamesSomethingOwn) return false;

  const shared = [...left].filter((word) => right.has(word)).length;
  const union = new Set([...left, ...right]).size;
  return shared / union >= PARAPHRASE_OVERLAP;
}

/** Une option qui n'est qu'un nombre : quatre d'entre elles font un pur hasard. */
export function isBareNumberOption(option: string): boolean {
  return /^[^\d]{0,6}\d{1,4}[^\d]{0,12}$/.test(option.trim());
}

export function isBareNumberCard(options: string[]): boolean {
  return options.every(isBareNumberOption);
}

export interface QuestionCandidate {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

/**
 * Contrôles éditoriaux applicables à une carte prise isolément.
 *
 * Renvoie `null` si la carte est conforme, sinon le motif de rejet — le même
 * libellé que celui de l'audit, pour que les deux chaînes parlent la même
 * langue dans les journaux.
 */
export function editorialRejectionReason(card: QuestionCandidate): string | null {
  const question = typeof card.question === 'string' ? card.question.trim() : '';
  if (question.length < 10) return 'énoncé absent ou trop court';

  if (!Array.isArray(card.options) || card.options.length !== 4) return 'il faut 4 choix';
  if (card.options.some((option) => typeof option !== 'string' || !option.trim())) {
    return 'choix vide';
  }
  if (new Set(card.options.map(normalize)).size !== 4) return 'choix dupliqué';

  if (!Number.isInteger(card.correctAnswerIndex)
    || card.correctAnswerIndex < 0
    || card.correctAnswerIndex > 3) {
    return 'bonne réponse invalide';
  }

  if (question.length > MAX_ADULT_QUESTION_LENGTH) {
    return `énoncé de plus de ${MAX_ADULT_QUESTION_LENGTH} caractères`;
  }
  if (card.options.some((option) => option.trim().length > MAX_ADULT_OPTION_LENGTH)) {
    return `choix de plus de ${MAX_ADULT_OPTION_LENGTH} caractères`;
  }

  if (hasDecorativePrefix(question)) return 'préfixe artificiel interdit';
  if (isAssociationFormat(question, card.options)) return 'format d’association interdit';
  if (isArtificialFillIn(question)) return 'question à trou artificielle';
  if (hasGrammarHintAroundBlank(question)) return 'indice grammatical autour d’un blanc';

  const correctAnswer = card.options[card.correctAnswerIndex]?.trim() ?? '';
  if (leaksCorrectAnswer(question, correctAnswer)) return 'bonne réponse révélée dans l’énoncé';
  if (merelyRestatesQuestion({ question, explanation: card.explanation }, correctAnswer)) {
    return 'explication non informative';
  }

  return null;
}

import { QUESTIONS_DATABASE } from '../src/data/questions';
import { CategoryId, DifficultyLevel, Question } from '../src/types';

const CATEGORIES: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports',
  'popculture',
  'gastronomie',
];
const DIFFICULTIES: DifficultyLevel[] = ['enfant', 'ado', 'adulte'];
const ADULT_EDITORIAL_TARGET_PER_CATEGORY = 400;

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CONTENT_STOP_WORDS = new Set([
  'alors', 'avec', 'avoir', 'cette', 'comme', 'dans', 'depuis', 'elle', 'elles',
  'entre', 'etre', 'fait', 'font', 'leur', 'leurs', 'mais', 'meme', 'pour',
  'quel', 'quelle', 'quels', 'quelles', 'sans', 'sont', 'sous', 'tous', 'toutes',
  'vers', 'votre',
]);

function contentWords(value: string): Set<string> {
  return new Set(
    normalize(value)
      .split(' ')
      .filter((word) => word.length >= 4 && !CONTENT_STOP_WORDS.has(word)),
  );
}

function containsWholeNormalizedPhrase(haystack: string, needle: string): boolean {
  const normalizedHaystack = ` ${normalize(haystack)} `;
  const normalizedNeedle = normalize(needle);
  return normalizedNeedle.length >= 4
    && normalizedHaystack.includes(` ${normalizedNeedle} `);
}

function leaksCorrectAnswer(question: string, correctAnswer: string): boolean {
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

function isArtificialFillIn(question: string): boolean {
  return (
    /\b(?:compl[eè]te|compl[eé]tez|compl[eè]te-t-il|manque)\b.{0,45}\b(?:fait|phrase|affirmation|citation)\b/i.test(question)
    || /\bquel (?:mot|[ée]l[ée]ment) compl[eè]te\b/i.test(question)
    || /(?:_{2,}|[…]{1,3})\s*[a-z]{0,3}\b.*\?/iu.test(question)
  );
}

function merelyRestatesQuestion(question: Question, correctAnswer: string): boolean {
  const explanation = question.explanation?.trim() ?? '';
  if (!explanation) return true;

  const explanationWithoutLabel = explanation
    .replace(/^\s*le saviez-vous\s*\?\s*/i, '')
    .replace(/^\s*(?:r[ée]ponse|explication)\s*:\s*/i, '');
  const explanationWords = contentWords(explanationWithoutLabel);
  if (explanationWords.size === 0) return true;

  const knownWords = contentWords(`${question.question} ${correctAnswer}`);
  return [...explanationWords].every((word) => knownWords.has(word));
}


/**
 * Squelette d'un énoncé : noms propres et titres cités remplacés par un blanc.
 * « Quel fleuve traverse Budapest ? » et « Quel fleuve traverse Belgrade ? »
 * partagent alors la même clé. Un découpage sur les premiers mots les voyait
 * comme deux moules distincts, et laissait passer les séries de dix-huit cartes.
 */
function questionSkeleton(question: string): string {
  return question
    .replace(/[«"][^»"]*[»"]/g, '_')
    .split(/\s+/)
    .map((word, index) => (index > 0 && /^[A-ZÀ-Ý]/.test(word) ? '_' : normalize(word)))
    .join(' ')
    .replace(/(?:_[\s,]*)+/g, '_ ')
    .trim();
}

/** Mots pleins d'un énoncé, pour rapprocher deux reformulations du même fait. */
function comparableWords(value: string): Set<string> {
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
function distinctiveNames(question: string): Set<string> {
  const quoted = [...question.matchAll(/[«"]([^»"]*)[»"]/g)].map((match) => match[1]);
  const capitalised = question
    .split(/\s+/)
    .slice(1)
    .filter((word) => /^[A-ZÀ-Ý]/.test(word));
  return new Set([...quoted, ...capitalised].map(normalize).filter(Boolean));
}

/** Réponse comparable : « Le Danube » et « Danube » désignent le même fait. */
function comparableAnswer(answer: string): string {
  return normalize(answer).replace(/^(le|la|les|l|un|une|des|du|de)\s+/, '');
}

const errors: string[] = [];
const editorialIssueCounts = new Map<string, number>();
function editorialError(issue: string, id: string): void {
  editorialIssueCounts.set(issue, (editorialIssueCounts.get(issue) ?? 0) + 1);
  errors.push(`${issue} : ${id}`);
}

const ids = new Set<string>();
const adultTextsByCategory = new Map<CategoryId, Set<string>>();
const adultFactsByCategory = new Map<CategoryId, Set<string>>();
let longAdultOptions = 0;
let associationCards = 0;
let longAdultQuestions = 0;

function answerOfQuestion(question: Question): string {
  return question.options[question.correctAnswerIndex] ?? '';
}

function sourceFactSignature(question: Question): string {
  const answer = question.options[question.correctAnswerIndex] ?? '';
  return `${normalize(question.question)}|${normalize(answer)}`;
}

const childFactSignatures = new Set(
  QUESTIONS_DATABASE
    .filter((question) => question.difficulty === 'enfant')
    .map(sourceFactSignature),
);
const teenFactSignatures = new Set(
  QUESTIONS_DATABASE
    .filter((question) => question.difficulty === 'ado')
    .map(sourceFactSignature),
);

for (const question of QUESTIONS_DATABASE) {
  if (ids.has(question.id)) errors.push(`Identifiant dupliqué : ${question.id}`);
  ids.add(question.id);

  if (!CATEGORIES.includes(question.categoryId)) {
    errors.push(`Catégorie invalide pour ${question.id}`);
  }
  if (!DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`Difficulté invalide pour ${question.id}`);
  }
  if (!question.question.trim()) errors.push(`Question vide : ${question.id}`);
  if (question.options.length !== 4) errors.push(`Il faut 4 choix : ${question.id}`);
  if (new Set(question.options.map(normalize)).size !== 4) {
    errors.push(`Choix dupliqué : ${question.id}`);
  }
  if (
    !Number.isInteger(question.correctAnswerIndex)
    || question.correctAnswerIndex < 0
    || question.correctAnswerIndex > 3
  ) {
    errors.push(`Bonne réponse invalide : ${question.id}`);
  }

  // Le niveau ado ne doit jamais être complété en recopiant la banque enfant :
  // cela supprime une marche entière de la progression enfant -> ado -> adulte.
  if (question.difficulty === 'ado'
    && childFactSignatures.has(sourceFactSignature(question))) {
    editorialError(`Question enfant recopiée au niveau ado`, question.id);
  }

  if (question.difficulty === 'adulte') {
    const texts = adultTextsByCategory.get(question.categoryId) ?? new Set<string>();
    const signature = `${normalize(question.question)}|${question.options.map(normalize).join('|')}`;
    if (texts.has(signature)) errors.push(`Question adulte dupliquée : ${question.id}`);
    texts.add(signature);
    adultTextsByCategory.set(question.categoryId, texts);
    const correctAnswer = question.options[question.correctAnswerIndex] ?? '';
    const sourceSignature = sourceFactSignature(question);
    if (childFactSignatures.has(sourceSignature)) {
      editorialError(`Question enfant promue au niveau adulte`, question.id);
    } else if (teenFactSignatures.has(sourceSignature)) {
      editorialError(`Question ado promue au niveau adulte`, question.id);
    }
    const factSignature = `${normalize(question.question.replace(/^(question flash|défi express|à vous de jouer)\s*:\s*/i, ''))}|${normalize(correctAnswer)}`;
    const facts = adultFactsByCategory.get(question.categoryId) ?? new Set<string>();
    if (facts.has(factSignature)) errors.push(`Fait adulte répété : ${question.id}`);
    facts.add(factSignature);
    adultFactsByCategory.set(question.categoryId, facts);
    if (/^(question flash|défi express|à vous de jouer)\s*:/i.test(question.question)) {
      errors.push(`Préfixe artificiel interdit : ${question.id}`);
    }
    if (question.id.includes('_adulte_anecdote_')) {
      editorialError(`Carte adulte issue du générateur d'anecdotes interdite`, question.id);
    }
    if (isArtificialFillIn(question.question)) {
      editorialError(`Question adulte à trou artificielle`, question.id);
    }
    if (leaksCorrectAnswer(question.question, correctAnswer)) {
      editorialError(`Bonne réponse adulte révélée dans l'énoncé`, question.id);
    }
    if (merelyRestatesQuestion(question, correctAnswer)) {
      editorialError(`Explication adulte non informative`, question.id);
    }
    if (
      /(?:_{2,}|[…]{1,3})\s*(?:s|e|es|ent)\b/iu.test(question.question)
      || /\b(?:un|une|des|le|la|les)\s+(?:_{2,}|[…]{1,3})/iu.test(question.question)
    ) {
      editorialError(`Indice grammatical autour d'un blanc`, question.id);
    }
    if (question.options.some((option) => option.length > 72)) longAdultOptions += 1;
    if (question.question.length > 125) longAdultQuestions += 1;
    if (question.id.includes('_adulte_association_')) associationCards += 1;
  }
}

// --- Reformulations d'un même fait -----------------------------------------
// L'audit ne comparait que des textes identiques : deux cartes « Quelle mer
// sépare l'Australie de la Nouvelle-Zélande ? » et « Quelle mer se trouve
// entre l'Australie et la Nouvelle-Zélande ? » passaient toutes deux.
const PARAPHRASE_OVERLAP = 0.34;
const adultByAnswer = new Map<string, Question[]>();
for (const question of QUESTIONS_DATABASE) {
  if (question.difficulty !== 'adulte') continue;
  const key = `${question.categoryId}|${comparableAnswer(answerOfQuestion(question))}`;
  adultByAnswer.set(key, [...(adultByAnswer.get(key) ?? []), question]);
}
for (const group of adultByAnswer.values()) {
  for (let left = 0; left < group.length; left += 1) {
    for (let right = left + 1; right < group.length; right += 1) {
      const a = comparableWords(group[left].question);
      const b = comparableWords(group[right].question);
      if (a.size === 0 || b.size === 0) continue;
      const namesLeft = distinctiveNames(group[left].question);
      const namesRight = distinctiveNames(group[right].question);
      const eachNamesSomethingOwn = [...namesLeft].some((name) => !namesRight.has(name))
        && [...namesRight].some((name) => !namesLeft.has(name));
      if (eachNamesSomethingOwn) continue;
      const shared = [...a].filter((word) => b.has(word)).length;
      const union = new Set([...a, ...b]).size;
      if (shared / union >= PARAPHRASE_OVERLAP) {
        editorialError(
          `Fait adulte reformulé (déjà posé par ${group[left].id})`,
          group[right].id,
        );
      }
    }
  }
}

// --- Moules d'énoncé sur-utilisés -------------------------------------------
const MAX_SKELETON_REUSE = 8;
for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter(
    (question) => question.categoryId === categoryId && question.difficulty === 'adulte',
  );
  const skeletons = new Map<string, number>();
  for (const question of rows) {
    const key = questionSkeleton(question.question);
    skeletons.set(key, (skeletons.get(key) ?? 0) + 1);
  }
  for (const [skeleton, count] of skeletons) {
    if (count > MAX_SKELETON_REUSE) {
      errors.push(
        `${categoryId} réutilise ${count} fois le moule « ${skeleton} »`
          + ` (maximum ${MAX_SKELETON_REUSE})`,
      );
    }
  }
}

// --- Cartes jouées au hasard entre quatre nombres nus ------------------------
const MAX_BARE_NUMBER_RATIO = 0.05;
for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter(
    (question) => question.categoryId === categoryId && question.difficulty === 'adulte',
  );
  const bare = rows.filter(
    (question) => question.options.every(
      (option) => /^[^\d]{0,6}\d{1,4}[^\d]{0,12}$/.test(option.trim()),
    ),
  ).length;
  if (bare > rows.length * MAX_BARE_NUMBER_RATIO) {
    errors.push(
      `${categoryId} compte ${bare} cartes adultes dont les quatre options sont`
        + ` des nombres nus (maximum ${Math.floor(rows.length * MAX_BARE_NUMBER_RATIO)})`,
    );
  }
}

console.log('Catégorie       Enfant  Ado  Adulte  Total');
console.log('--------------------------------------------');
for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter((q) => q.categoryId === categoryId);
  const counts = DIFFICULTIES.map(
    (difficulty) => rows.filter((q) => q.difficulty === difficulty).length,
  );
  console.log(
    `${categoryId.padEnd(15)}${String(counts[0]).padStart(6)}${String(counts[1]).padStart(5)}`
      + `${String(counts[2]).padStart(8)}${String(rows.length).padStart(7)}`,
  );
  if (counts[2] !== ADULT_EDITORIAL_TARGET_PER_CATEGORY) {
    errors.push(
      `${categoryId} doit contenir exactement ${ADULT_EDITORIAL_TARGET_PER_CATEGORY}`
        + ` questions adultes relues (actuellement ${counts[2]})`,
    );
  }
  const answerPositions = [0, 1, 2, 3].map(
    (answerIndex) => rows.filter(
      (q) => q.difficulty === 'adulte' && q.correctAnswerIndex === answerIndex,
    ).length,
  );
  if (answerPositions.some(
    (count) => count !== ADULT_EDITORIAL_TARGET_PER_CATEGORY / 4,
  )) {
    errors.push(
      `${categoryId} doit équilibrer les réponses adultes entre A, B, C et D`
        + ` (${answerPositions.join('/')})`,
    );
  }
  if (counts[0] !== 135 || counts[1] !== 135) {
    errors.push(`${categoryId} doit contenir 135 questions enfant et 135 questions ado`);
  }
}

if (associationCards > 0) {
  errors.push(`${associationCards} cartes utilisent encore le format d’association`);
}
if (longAdultOptions > 0) {
  errors.push(`${longAdultOptions} cartes adultes contiennent un choix de plus de 72 caractères`);
}
if (longAdultQuestions > 0) {
  errors.push(`${longAdultQuestions} cartes adultes dépassent 125 caractères`);
}

if (errors.length > 0) {
  console.error(`\nAudit échoué (${errors.length} erreur(s)) :`);
  if (editorialIssueCounts.size > 0) {
    console.error('Synthèse éditoriale :');
    for (const [issue, count] of editorialIssueCounts) {
      console.error(`- ${issue} : ${count}`);
    }
    console.error('');
  }
  console.error(errors.slice(0, 50).map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`\nAudit réussi : ${QUESTIONS_DATABASE.length} questions valides.`);
  console.log('Qualité adulte : aucun fait répété ni reformulé, aucun préfixe artificiel,');
  console.log('question ≤ 125 caractères, choix ≤ 72 caractères.');
  console.log(`Moules : aucun énoncé adulte réutilisé plus de ${MAX_SKELETON_REUSE} fois par catégorie.`);
  console.log('Niveaux : aucune carte enfant recopiée au niveau ado ou adulte.');
  console.log(`Volume adulte : exactement ${ADULT_EDITORIAL_TARGET_PER_CATEGORY} cartes relues par catégorie.`);
}

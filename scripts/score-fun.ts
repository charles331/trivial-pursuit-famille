/**
 * Note de fun des cartes, en pourcentage.
 *
 * Le barème ne sort pas de nulle part : il formalise, critère par critère, ce qui
 * a été reproché aux cartes pendant les tests en famille. Chaque reproche est
 * devenu une ligne mesurable :
 *
 *   « question impossible et vraiment pas fun »   → chemin de raisonnement
 *   « trop simple ou trop évidente »              → chemin de raisonnement
 *   « il faut une série belge ou française »      → ancrage culturel
 *   « recentrée plus proche de la Belgique...     → ancrage culturel
 *     ou alors plus proche dans le temps »        → proximité temporelle
 *   « elle devrait dire qu'elle parle de fourmis » → autoportance
 *   « le saviez-vous » réclamé sur tous formats   → explication qui apprend
 *   les vrai/faux et questions ouvertes           → variété de format
 *
 * Ce que la note est : un comparateur. Elle classe les catégories et les niveaux
 * entre eux, et repère les cartes à reprendre en priorité. Ce qu'elle n'est pas :
 * une vérité absolue. « 71 % de fun » ne veut rien dire dans l'abstrait ; « la
 * catégorie X est dix points sous la moyenne » veut dire quelque chose.
 *
 * Le barème est validé plus bas (`--validate`) sur les cartes réellement rejetées
 * en partie et sur celles qui les ont remplacées : si la note ne les sépare pas,
 * elle ne mesure rien.
 */

import { QUESTIONS_DATABASE } from '../src/data/questions';
import {
  isBareNumberCard,
  isBareYearCard,
  isPersonNameLotteryCard,
  merelyRestatesQuestion,
  normalize,
} from '../src/data/questionRules';
import { CategoryId, DifficultyLevel, Question } from '../src/types';

interface Criterion {
  key: string;
  label: string;
  weight: number;
  /** Note du critère, entre 0 (raté) et 1 (parfait). */
  score: (card: Question) => number;
}

const FRANCOPHONE = /belg|bruxell|wallon|flandre|flamand|liège|anvers|gand|bruges|namur|charleroi|ardenne|meuse|escaut|français|france|paris|lyon|marseille|québec|suisse|romand|luxembourg|francophone|hergé|tintin|schtroumpf|astérix|molière|hugo|magritte|simenon|brel|stromae|angèle|gaulois|gaufre|frite|spéculoos|carbonnade|waterzooi/i;
const ANGLO = /britannique|américain|anglais|anglaise|écossais|irlandais|australien|canadien anglais|états-unis|angleterre|royaume-uni|londres|new york|hollywood|shakespeare|texas|californie/i;
const NARRATIVE = /pourquoi|comment|que fait|que se passe|quelle particularité|quel animal|surnom|quelle est la position|que tient|que manque|que découvre|que libère|que devient|combien|quel objet|quelle couleur|quelle forme|à quoi (?:sert|reconnaît)/i;
const ADMINISTRATIVE = /traité|convention|directive|organisme|institution|accord|protocole|sommet|commission|décret|ordonnance|réforme|statut|charte/i;

/**
 * Ce qui distingue réellement chaque option des trois autres.
 *
 * Les mots présents dans les quatre options ne départagent rien : « Le traité
 * de » revient partout, seul le nom propre porte la réponse. On les retire donc
 * avant de juger si les options laissent quelque chose à raisonner.
 */
function discriminatingParts(options: string[]): string[] {
  const wordsOf = (option: string): string[] => option.trim().split(/\s+/).filter(Boolean);
  const normalizedWords = options.map((option) => new Set(wordsOf(normalize(option))));
  const sharedByAll = [...(normalizedWords[0] ?? [])].filter(
    (word) => normalizedWords.every((set) => set.has(word)),
  );
  const shared = new Set(sharedByAll);
  return options.map((option) => wordsOf(option)
    .filter((word) => !shared.has(normalize(word)))
    .join(' '));
}

/** Millésime le plus ancien cité par la carte, tous champs confondus. */
function oldestYear(card: Question): number | null {
  const text = `${card.question} ${card.options.join(' ')} ${card.explanation ?? ''}`;
  const years = [...text.matchAll(/\b(1[0-9]{3}|20[0-2][0-9])\b/g)].map((m) => Number(m[1]));
  return years.length > 0 ? Math.min(...years) : null;
}

function answerOf(card: Question): string {
  if ((card.format ?? 'mcq') === 'open') return card.answer ?? '';
  return card.options[card.correctAnswerIndex] ?? '';
}

/**
 * L'explication apporte-t-elle un fait que la carte ne contenait pas déjà ? On
 * cherche un mot de contenu absent de l'énoncé et de la réponse : sans lui, le
 * « Le saviez-vous ? » ne fait que répéter la carte.
 */
function explanationTeaches(card: Question): number {
  const explanation = card.explanation?.trim();
  if (!explanation) return 0;
  if (merelyRestatesQuestion(card, answerOf(card))) return 0.35;
  const known = new Set(normalize(`${card.question} ${answerOf(card)}`).split(' '));
  const fresh = normalize(explanation)
    .split(' ')
    .filter((word) => word.length > 4 && !known.has(word));
  // Un chiffre ou une date dans l'explication est le marqueur le plus net de
  // l'anecdote qui se raconte à table.
  const hasFigure = /\d/.test(explanation);
  if (fresh.length >= 4) return hasFigure ? 1 : 0.9;
  if (fresh.length >= 2) return 0.7;
  return 0.5;
}

const CRITERIA: Criterion[] = [
  {
    key: 'raisonnement',
    label: 'Chemin de raisonnement',
    weight: 30,
    score: (card) => {
      // Les formats sans quatre propositions n'ont pas de leurre, mais ce n'est
      // pas pour autant un chemin de raisonnement offert. Une carte ouverte est
      // au contraire le format le plus dur du jeu : il n'y a rien à éliminer, il
      // faut produire la réponse. Le barème la créditait d'un 1 plein, ce qui a
      // masqué une carte d'attribution en format ouvert — « quel studio fondé par
      // Miyazaki ? » sans aucune option — notée 88 % alors qu'elle a bloqué la
      // table. Un vrai/faux, lui, se raisonne à partir de l'affirmation posée.
      const format = card.format ?? 'mcq';
      if (format === 'boolean') return 0.9;
      if (format === 'open') return 0.6;
      if (isPersonNameLotteryCard(card.question, card.options)) return 0;
      if (isBareYearCard(card.question, card.options)) return 0;
      if (isBareNumberCard(card.options)) return 0.45;
      // Ce qui compte n'est pas la longueur des options mais la longueur de ce
      // qui les **distingue**. « Le traité d'Alcáçovas / de Saragosse / de
      // Cateau-Cambrésis / de Tordesillas » comptait quatre options rédigées et
      // récoltait la note pleine, alors que « Le traité de » est commun aux
      // quatre : seul le nom propre départage, et c'est une loterie.
      //
      // Le même test épargne « L'échelle de Mohs / de Saffir-Simpson / de
      // Beaufort / La magnitude de moment », où la quatrième option sort du
      // moule : les options ne partagent alors pas toutes le même préfixe, et le
      // joueur a bel et bien de quoi raisonner.
      const discriminating = discriminatingParts(card.options);
      const wordy = discriminating.filter((part) => part.split(/\s+/).filter(Boolean).length >= 3).length;
      if (wordy >= 3) return 1;
      if (wordy >= 1) return 0.85;
      // Quatre noms propres nus — quatre pays, quatre villes, quatre titres — se
      // reconnaissent plus qu'ils ne se déduisent. Moins sévère que la loterie de
      // personnes : ces entités-là sont au moins familières.
      const bareProperNouns = card.options.every(
        (option) => /^(Le|La|L’|Les|Un|Une)?\s*[A-ZÀ-Ý]/.test(option.trim()) && !/\d/.test(option),
      );
      if (!bareProperNouns) return 0.7;
      // Au niveau enfant, ce reproche ne tient pas : « Comment s'appelle le
      // bonhomme de neige dans La Reine des Neiges ? » entre Olaf, Sven, Kristoff
      // et Hans n'est pas une loterie pour qui a vu le film vingt fois. Le niveau
      // enfant repose délibérément sur la reconnaissance de personnages aimés, et
      // c'est ce qui le rend joyeux. Pénaliser ces cartes enverrait la prochaine
      // passe éditoriale les « corriger », et appauvrirait le jeu.
      return card.difficulty === 'enfant' ? 0.8 : 0.5;
    },
  },
  {
    key: 'anecdote',
    label: 'Explication qui apprend',
    weight: 20,
    score: explanationTeaches,
  },
  {
    key: 'ancrage',
    label: 'Ancrage culturel proche',
    weight: 15,
    score: (card) => {
      const text = `${card.question} ${card.options.join(' ')} ${card.explanation ?? ''}`;
      if (FRANCOPHONE.test(text)) return 1;
      if (ANGLO.test(text)) return 0.35;
      return 0.7;
    },
  },
  {
    key: 'temps',
    label: 'Proximité temporelle',
    weight: 15,
    score: (card) => {
      const year = oldestYear(card);
      if (year === null) return 0.85; // fait intemporel : ni proche ni lointain
      if (year >= 1990) return 1;
      if (year >= 1945) return 0.75;
      if (year >= 1900) return 0.5;
      return 0.3;
    },
  },
  {
    key: 'recit',
    label: 'Carte qui se raconte',
    weight: 10,
    score: (card) => {
      if (ADMINISTRATIVE.test(card.question)) return 0.3;
      if (NARRATIVE.test(card.question)) return 1;
      return 0.6;
    },
  },
  {
    key: 'lecture',
    label: 'Lisible à voix haute',
    weight: 5,
    score: (card) => {
      const longestOption = Math.max(0, ...card.options.map((option) => option.length));
      const questionPenalty = Math.max(0, (card.question.length - 110) / 90);
      const optionPenalty = Math.max(0, (longestOption - 45) / 40);
      return Math.max(0, 1 - questionPenalty - optionPenalty);
    },
  },
  {
    key: 'format',
    label: 'Variété de format',
    weight: 5,
    score: (card) => ((card.format ?? 'mcq') === 'mcq' ? 0.7 : 1),
  },
];

const TOTAL_WEIGHT = CRITERIA.reduce((sum, criterion) => sum + criterion.weight, 0);

export function funScore(card: Question): number {
  const points = CRITERIA.reduce(
    (sum, criterion) => sum + criterion.weight * criterion.score(card),
    0,
  );
  return (points / TOTAL_WEIGHT) * 100;
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

function bar(percent: number, width = 26): string {
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '·'.repeat(Math.max(0, width - filled));
}

// --- Validation du barème ----------------------------------------------------
// Cartes réellement rejetées en partie, et ce qui les a remplacées. Si la note
// ne sépare pas les deux colonnes, elle ne mesure pas ce qu'elle prétend.
const VALIDATION: Array<{ verdict: string; card: Question }> = [
  {
    verdict: 'REJETÉE — « impossible », 4 infirmières',
    card: {
      id: 'v1', categoryId: 'histoire', difficulty: 'ado',
      question: 'Quelle infirmière britannique, surnommée "la dame à la lampe", a fondé les soins infirmiers modernes pendant la guerre de Crimée ?',
      options: ['Marie Curie', 'Clara Barton', 'Florence Nightingale', 'Edith Cavell'],
      correctAnswerIndex: 2,
      explanation: 'Le saviez-vous ? Florence Nightingale est considérée comme la fondatrice des soins infirmiers modernes.',
    },
  },
  {
    verdict: 'REJETÉE — millésime, 4 années',
    card: {
      id: 'v2', categoryId: 'cinema', difficulty: 'ado',
      question: 'En quelle année est sorti le tout premier film Star Wars ?',
      options: ['1977', '1983', '1971', '1985'],
      correctAnswerIndex: 0,
      explanation: 'Le saviez-vous ? Le premier film Star Wars est sorti en 1977.',
    },
  },
  {
    verdict: 'REJETÉE — 4 personnages du même roman',
    card: {
      id: 'v3', categoryId: 'art', difficulty: 'ado',
      question: 'Comment s’appelle l’ancien forçat, héros des Misérables ?',
      options: ['Javert', 'Marius', 'Thénardier', 'Jean Valjean'],
      correctAnswerIndex: 3,
      explanation: 'Le saviez-vous ? Jean Valjean avait été condamné au bagne pour avoir volé un simple morceau de pain.',
    },
  },
];

function runValidation(): void {
  console.log('Validation du barème — cartes rejetées en partie, et leur remplaçante\n');
  for (const { verdict, card } of VALIDATION) {
    console.log(`${funScore(card).toFixed(0).padStart(3)}%  ${verdict}`);
    console.log(`       ${card.question.slice(0, 96)}`);
  }
  console.log();
  for (const id of ['his_265', 'cin_157', 'art_156']) {
    const card = QUESTIONS_DATABASE.find((q) => q.id === id);
    if (!card) continue;
    console.log(`${funScore(card).toFixed(0).padStart(3)}%  REPRISE — ${id}`);
    console.log(`       ${card.question.slice(0, 96)}`);
  }
}

// --- Rapport -----------------------------------------------------------------
const CATEGORIES: CategoryId[] = [
  'histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports', 'popculture', 'gastronomie',
];
const LEVELS: DifficultyLevel[] = ['enfant', 'ado', 'adulte'];

function report(): void {
  const all = QUESTIONS_DATABASE.map((card) => ({ card, score: funScore(card) }));

  console.log(`Note de fun — ${all.length} cartes\n`);
  console.log(`Moyenne générale : ${mean(all.map((r) => r.score)).toFixed(1)} %\n`);

  console.log('Par niveau');
  for (const level of LEVELS) {
    const rows = all.filter((r) => r.card.difficulty === level);
    const avg = mean(rows.map((r) => r.score));
    console.log(`  ${level.padEnd(7)} ${bar(avg)} ${avg.toFixed(1)} %  (${rows.length} cartes)`);
  }

  console.log('\nPar critère (moyenne pondérée réellement obtenue)');
  for (const criterion of CRITERIA) {
    const obtained = mean(QUESTIONS_DATABASE.map((card) => criterion.score(card))) * 100;
    console.log(
      `  ${criterion.label.padEnd(26)} ${bar(obtained, 20)} ${obtained.toFixed(1)} %`
        + `   (poids ${criterion.weight})`,
    );
  }

  console.log('\nPar catégorie et par niveau');
  console.log(`  ${'Catégorie'.padEnd(13)}${LEVELS.map((l) => l.padStart(8)).join('')}${'total'.padStart(9)}`);
  const catAverages: Array<{ categoryId: CategoryId; avg: number }> = [];
  for (const categoryId of CATEGORIES) {
    const cells = LEVELS.map((level) => {
      const rows = all.filter((r) => r.card.categoryId === categoryId && r.card.difficulty === level);
      return mean(rows.map((r) => r.score));
    });
    const rows = all.filter((r) => r.card.categoryId === categoryId);
    const avg = mean(rows.map((r) => r.score));
    catAverages.push({ categoryId, avg });
    console.log(
      `  ${categoryId.padEnd(13)}`
        + cells.map((value) => `${value.toFixed(1).padStart(8)}`).join('')
        + `${avg.toFixed(1).padStart(9)}`,
    );
  }

  console.log('\nClassement des catégories');
  for (const { categoryId, avg } of [...catAverages].sort((a, b) => b.avg - a.avg)) {
    console.log(`  ${categoryId.padEnd(13)} ${bar(avg)} ${avg.toFixed(1)} %`);
  }

  const buckets = [
    ['≥ 80 % — excellentes', (s: number) => s >= 80],
    ['70-80 % — bonnes', (s: number) => s >= 70 && s < 80],
    ['60-70 % — correctes', (s: number) => s >= 60 && s < 70],
    ['50-60 % — tièdes', (s: number) => s >= 50 && s < 60],
    ['< 50 % — à reprendre', (s: number) => s < 50],
  ] as const;
  console.log('\nDistribution');
  for (const [label, test] of buckets) {
    const count = all.filter((r) => test(r.score)).length;
    const share = (count / all.length) * 100;
    console.log(`  ${label.padEnd(24)} ${bar(share)} ${share.toFixed(1)} %  (${count})`);
  }

  const worst = [...all].sort((a, b) => a.score - b.score).slice(0, 12);
  console.log('\nLes douze cartes les moins fun');
  for (const { card, score } of worst) {
    console.log(`  ${score.toFixed(0).padStart(3)}%  [${card.id}/${card.difficulty}] ${card.question.slice(0, 84)}`);
  }

  const best = [...all].sort((a, b) => b.score - a.score).slice(0, 8);
  console.log('\nLes huit cartes les plus fun');
  for (const { card, score } of best) {
    console.log(`  ${score.toFixed(0).padStart(3)}%  [${card.id}/${card.difficulty}] ${card.question.slice(0, 84)}`);
  }

  // Pire catégorie x niveau : là où il faut travailler ensuite.
  const pairs: Array<{ label: string; avg: number; count: number }> = [];
  for (const categoryId of CATEGORIES) {
    for (const level of LEVELS) {
      const rows = all.filter((r) => r.card.categoryId === categoryId && r.card.difficulty === level);
      pairs.push({ label: `${categoryId} / ${level}`, avg: mean(rows.map((r) => r.score)), count: rows.length });
    }
  }
  console.log('\nLes six blocs à reprendre en priorité');
  for (const pair of pairs.sort((a, b) => a.avg - b.avg).slice(0, 6)) {
    console.log(`  ${pair.label.padEnd(24)} ${pair.avg.toFixed(1)} %  (${pair.count} cartes)`);
  }
}

// Le rapport ne s'exécute qu'en ligne de commande : `funScore` doit rester
// importable par un autre script sans tout imprimer au passage.
const invokedDirectly = process.argv[1]?.includes('score-fun');
if (invokedDirectly) {
  if (process.argv.includes('--validate')) runValidation();
  else report();
}

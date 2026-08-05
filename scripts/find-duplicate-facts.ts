/**
 * Cartes qui reposent le même fait, dans une même catégorie — analyse, non bloquante.
 *
 * L'audit dédoublonne les cartes adultes sur « catégorie + bonne réponse ». Trois
 * choses lui échappent, et c'est ce script qui les montre :
 *
 * - les cartes Vrai/Faux, qui répondent toutes « Vrai » ou « Faux » et n'entrent
 *   donc jamais en collision par leur réponse ;
 * - la même question reformulée d'un niveau à l'autre — l'audit ne compare les
 *   niveaux que sur des textes identiques ;
 * - un fait posé dans les deux sens : « pour quel événement l'Atomium a-t-il été
 *   construit ? » et « quelle ville accueillit l'Exposition de 1958 ? ».
 *
 * L'audit applique la règle pour le pool des formats variés seulement, où elle
 * passe. Sur le corpus entier elle remonte plus de deux cents paires anciennes,
 * pour l'essentiel un fait posé à la fois au niveau enfant et au niveau adulte :
 * les corriger est une décision éditoriale, pas une correction mécanique. D'où ce
 * script, à lancer avant d'écrire un lot de cartes :
 *
 *   npm run audit:doublons             # paires au seuil par défaut
 *   npm run audit:doublons -- 0.5      # plus sévère, pour ne voir que les criantes
 *   npm run audit:doublons -- 0.34 20  # seuil, puis nombre de paires détaillées
 */
import { QUESTIONS_DATABASE } from '../src/data/questions';
import {
  PARAPHRASE_OVERLAP,
  comparableFactText,
  comparableWords,
  distinctiveNames,
} from '../src/data/questionRules';
import { CategoryId, Question } from '../src/types';

const threshold = Number(process.argv[2]) || PARAPHRASE_OVERLAP;
const detailCount = Number(process.argv[3]) || 25;

function answerOf(question: Question): string {
  return (question.format ?? 'mcq') === 'open'
    ? question.answer ?? ''
    : question.options[question.correctAnswerIndex] ?? '';
}

interface Indexed {
  card: Question;
  words: Set<string>;
  names: Set<string>;
}

// Un seul découpage par carte : la comparaison est quadratique par catégorie.
const indexed: Indexed[] = QUESTIONS_DATABASE.map((card) => {
  const text = comparableFactText(card.question, answerOf(card));
  return { card, words: comparableWords(text), names: distinctiveNames(text) };
});

const byCategory = new Map<CategoryId, Indexed[]>();
for (const entry of indexed) {
  byCategory.set(entry.card.categoryId, [...(byCategory.get(entry.card.categoryId) ?? []), entry]);
}

interface Pair { score: number; left: Question; right: Question }
const pairs: Pair[] = [];

for (const group of byCategory.values()) {
  for (let i = 0; i < group.length; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      const left = group[i];
      const right = group[j];
      if (left.words.size === 0 || right.words.size === 0) continue;

      // Deux cartes qui nomment chacune une œuvre que l'autre ignore parlent de
      // deux faits distincts, même si le vocabulaire se recoupe.
      const eachNamesSomethingOwn = [...left.names].some((name) => !right.names.has(name))
        && [...right.names].some((name) => !left.names.has(name));
      if (eachNamesSomethingOwn) continue;

      let shared = 0;
      for (const word of left.words) if (right.words.has(word)) shared += 1;
      if (shared === 0) continue;
      const score = shared / new Set([...left.words, ...right.words]).size;
      if (score >= threshold) pairs.push({ score, left: left.card, right: right.card });
    }
  }
}

pairs.sort((a, b) => b.score - a.score);

const levels = (pair: Pair) => [pair.left.difficulty, pair.right.difficulty].sort().join(' / ');
const countsByLevels = new Map<string, number>();
for (const pair of pairs) {
  countsByLevels.set(levels(pair), (countsByLevels.get(levels(pair)) ?? 0) + 1);
}

console.log(`Corpus : ${QUESTIONS_DATABASE.length} cartes. Seuil de recouvrement : ${threshold}`);
console.log(`${pairs.length} paire(s) posant le même fait dans une même catégorie.\n`);

console.log('Par couple de niveaux');
for (const [pairLevels, count] of [...countsByLevels].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${pairLevels.padEnd(20)} ${String(count).padStart(4)}`);
}

const withinSameLevel = pairs.filter((pair) => pair.left.difficulty === pair.right.difficulty);
console.log(
  `\nDont ${withinSameLevel.length} au sein d'un même niveau — celles-là tombent`
    + ' dans la même partie, pour le même joueur.',
);

console.log(`\nLes ${Math.min(detailCount, pairs.length)} paires les plus proches`);
for (const pair of pairs.slice(0, detailCount)) {
  console.log(`  ${(pair.score * 100).toFixed(0).padStart(3)}%  ${pair.left.id} / ${pair.right.id}  [${pair.left.categoryId}, ${levels(pair)}]`);
  console.log(`        ${pair.left.question} => ${answerOf(pair.left)}`);
  console.log(`        ${pair.right.question} => ${answerOf(pair.right)}`);
}

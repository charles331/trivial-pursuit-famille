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
 * L'audit refuse ces paires au sein d'un même niveau — celles qui tombent dans la
 * même partie, pour le même joueur — à huit exceptions relues et justifiées. Il
 * laisse passer le report d'un niveau à l'autre, bien plus nombreux : un fait posé
 * à la fois en enfant et en adulte se discute, il ne se corrige pas mécaniquement.
 * D'où ce script, à lancer avant d'écrire un lot de cartes :
 *
 *   npm run audit:doublons        # les paires, et leur répartition par niveaux
 *   npm run audit:doublons -- 60  # avec soixante paires détaillées
 *
 * Le rapprochement est exactement celui de l'audit (`restatesSameFact`) : au sein
 * d'un même niveau, il ne doit plus rien rester en dehors des huit paires relues
 * et acceptées. Ce qui subsiste entre niveaux, ce sont des approfondissements : la
 * carte du haut nomme le sujet de celle du bas pour demander davantage.
 */
import { QUESTIONS_DATABASE } from '../src/data/questions';
import { restatesSameFact } from '../src/data/questionRules';
import { CategoryId, Question } from '../src/types';

const detailCount = Number(process.argv[2]) || 25;

function answerOf(question: Question): string {
  return (question.format ?? 'mcq') === 'open'
    ? question.answer ?? ''
    : question.options[question.correctAnswerIndex] ?? '';
}

interface Indexed {
  card: Question;
  side: { question: string; answer: string; isBoolean: boolean };
}

const indexed: Indexed[] = QUESTIONS_DATABASE.map((card) => ({
  card,
  side: {
    question: card.question,
    answer: answerOf(card),
    isBoolean: (card.format ?? 'mcq') === 'boolean',
  },
}));

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
      if (restatesSameFact(left.side, right.side)) {
        pairs.push({ score: 1, left: left.card, right: right.card });
      }
    }
  }
}

pairs.sort((a, b) => b.score - a.score);

const levels = (pair: Pair) => [pair.left.difficulty, pair.right.difficulty].sort().join(' / ');
const countsByLevels = new Map<string, number>();
for (const pair of pairs) {
  countsByLevels.set(levels(pair), (countsByLevels.get(levels(pair)) ?? 0) + 1);
}

console.log(`Corpus : ${QUESTIONS_DATABASE.length} cartes.`);
console.log(`${pairs.length} paire(s) posant le même fait dans une même catégorie.\n`);

console.log('Par couple de niveaux');
for (const [pairLevels, count] of [...countsByLevels].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${pairLevels.padEnd(20)} ${String(count).padStart(4)}`);
}

const withinSameLevel = pairs.filter((pair) => pair.left.difficulty === pair.right.difficulty);
console.log(
  `\nDont ${withinSameLevel.length} au sein d'un même niveau — celles-là tombent dans la`
    + ' même partie, pour le même joueur, et l\'audit les refuse désormais (à huit paires'
    + ' près, relues et acceptées). Ce qui reste entre niveaux est un approfondissement :'
    + ' la carte du haut nomme le sujet de celle du bas pour demander davantage.',
);

console.log(`\nLes ${Math.min(detailCount, pairs.length)} paires les plus proches`);
for (const pair of pairs.slice(0, detailCount)) {
  console.log(`  ${pair.left.id} / ${pair.right.id}  [${pair.left.categoryId}, ${levels(pair)}]`);
  console.log(`        ${pair.left.question} => ${answerOf(pair.left)}`);
  console.log(`        ${pair.right.question} => ${answerOf(pair.right)}`);
}

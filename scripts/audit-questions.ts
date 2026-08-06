import { QUESTIONS_DATABASE } from '../src/data/questions';
import {
  MAX_ADULT_OPTION_LENGTH,
  MAX_ADULT_QUESTION_LENGTH,
  MAX_BARE_NUMBER_RATIO,
  MAX_SKELETON_REUSE,
  comparableAnswer,
  comparableFactText,
  echoesCorrectAnswer,
  editorialRejectionReason,
  hasDecorativePrefix,
  hasGrammarHintAroundBlank,
  isArtificialFillIn,
  isBareNumberCard,
  isBareYearCard,
  isAttributionLotteryCard,
  leaksCorrectAnswer,
  promptGivesAwayQuantity,
  merelyRestatesQuestion,
  normalize,
  quotesAnswerProperName,
  paraphrasesSameFact,
  restatesSameFact,
  questionSkeleton,
  stripDecorativePrefix,
} from '../src/data/questionRules';
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
/**
 * Budget de cartes d'attribution au niveau ado, par catégorie.
 *
 * L'attribution nue — « Qui a composé La Flûte enchantée ? » entre Beethoven,
 * Verdi, Wagner et Mozart — est la seule forme qui n'offre aucune prise : l'énoncé
 * ne dit rien de la personne, seulement ce qu'elle a produit. Quatre cartes par
 * catégorie restent permises, réservées aux signatures que la maison rend
 * familières, et de préférence belges : Magritte, Morris, Franquin, Brel, Simenon.
 *
 * Le plafond ne vise volontairement pas toutes les cartes à quatre noms propres :
 * « Quel dieu grec règne sur les mers, armé de son trident ? » et « Quel
 * personnage de Nintendo est un plombier moustachu ? » décrivent leur réponse, et
 * cette description est le chemin de raisonnement. Les convertir appauvrirait le
 * jeu — c'est mesuré par la note de fun (`npm run score:fun`), pas interdit ici.
 */
const MAX_ADO_ATTRIBUTION_PER_CATEGORY = 4;
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

function questionFormat(question: Question): 'mcq' | 'boolean' | 'open' {
  return question.format ?? 'mcq';
}

function answerOfQuestion(question: Question): string {
  if (questionFormat(question) === 'open') return question.answer ?? '';
  return question.options[question.correctAnswerIndex] ?? '';
}

function sourceFactSignature(question: Question): string {
  return `${normalize(question.question)}|${normalize(answerOfQuestion(question))}`;
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

  // Les formats sans quatre propositions (vrai/faux, ouvert) ne sont pas soumis
  // aux contrôles de distracteurs ; ils passent par le contrat éditorial partagé,
  // qui applique les règles propres à leur format.
  if (questionFormat(question) !== 'mcq') {
    const reason = editorialRejectionReason(question);
    if (reason) editorialError(reason, question.id);
  } else {
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

    // Une carte dont l'énoncé reprend ce qui distingue la bonne réponse se joue
    // sans rien savoir. Le contrôle vaut à tous les niveaux : les cartes enfant
    // sont les premières à tomber dans « Quel fruit garnit la tarte aux pommes ? ».
    if (echoesCorrectAnswer(question.question, question.options, question.correctAnswerIndex)) {
      editorialError(`Énoncé qui donne la bonne réponse`, question.id);
    }

    // Un mot de remplissage dans la réponse suffisait à passer le contrôle
    // ci-dessus : « près de la rivière Ebola » pour « la maladie à virus Ebola ».
    // Le nom propre qui nomme la réponse ne peut pas figurer dans l'énoncé.
    if (quotesAnswerProperName(question.question, question.options, question.correctAnswerIndex)) {
      editorialError(`Nom propre de la bonne réponse cité dans l'énoncé`, question.id);
    }

    // Une carte de quantité dont l'énoncé porte déjà le nombre demandé se recopie
    // au lieu de se jouer : « une équipe de rugby à sept » pour « 7 ».
    if (promptGivesAwayQuantity(question.question, question.options, question.correctAnswerIndex)) {
      editorialError(`Énoncé qui donne la quantité demandée`, question.id);
    }
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
    const correctAnswer = answerOfQuestion(question);
    const sourceSignature = sourceFactSignature(question);
    if (childFactSignatures.has(sourceSignature)) {
      editorialError(`Question enfant promue au niveau adulte`, question.id);
    } else if (teenFactSignatures.has(sourceSignature)) {
      editorialError(`Question ado promue au niveau adulte`, question.id);
    }
    const factSignature = `${normalize(stripDecorativePrefix(question.question))}|${normalize(correctAnswer)}`;
    const facts = adultFactsByCategory.get(question.categoryId) ?? new Set<string>();
    if (facts.has(factSignature)) errors.push(`Fait adulte répété : ${question.id}`);
    facts.add(factSignature);
    adultFactsByCategory.set(question.categoryId, facts);
    if (hasDecorativePrefix(question.question)) {
      errors.push(`Préfixe artificiel interdit : ${question.id}`);
    }
    if (question.id.includes('_adulte_anecdote_')) {
      editorialError(`Carte adulte issue du générateur d'anecdotes interdite`, question.id);
    }
    if (isArtificialFillIn(question.question)) {
      editorialError(`Question adulte à trou artificielle`, question.id);
    }
    // Contrôles propres au QCM : les autres formats sont déjà passés par le
    // contrat éditorial partagé, qui applique les règles adaptées à leur forme.
    if (questionFormat(question) === 'mcq') {
      if (leaksCorrectAnswer(question.question, correctAnswer)) {
        editorialError(`Bonne réponse adulte révélée dans l'énoncé`, question.id);
      }
      if (merelyRestatesQuestion(question, correctAnswer)) {
        editorialError(`Explication adulte non informative`, question.id);
      }
      if (hasGrammarHintAroundBlank(question.question)) {
        editorialError(`Indice grammatical autour d'un blanc`, question.id);
      }
      if (question.options.some((option) => option.length > MAX_ADULT_OPTION_LENGTH)) {
        longAdultOptions += 1;
      }
      if (question.question.length > MAX_ADULT_QUESTION_LENGTH) longAdultQuestions += 1;
    }
    if (question.id.includes('_adulte_association_')) associationCards += 1;
  }
}

// --- Reformulations d'un même fait -----------------------------------------
// L'audit ne comparait que des textes identiques : deux cartes « Quelle mer
// sépare l'Australie de la Nouvelle-Zélande ? » et « Quelle mer se trouve
// entre l'Australie et la Nouvelle-Zélande ? » passaient toutes deux.
const adultByAnswer = new Map<string, Question[]>();
for (const question of QUESTIONS_DATABASE) {
  if (question.difficulty !== 'adulte') continue;
  const key = `${question.categoryId}|${comparableAnswer(answerOfQuestion(question))}`;
  adultByAnswer.set(key, [...(adultByAnswer.get(key) ?? []), question]);
}
for (const group of adultByAnswer.values()) {
  for (let left = 0; left < group.length; left += 1) {
    for (let right = left + 1; right < group.length; right += 1) {
      if (paraphrasesSameFact(group[left].question, group[right].question)) {
        editorialError(
          `Fait adulte reformulé (déjà posé par ${group[left].id})`,
          group[right].id,
        );
      }
    }
  }
}

/**
 * Paires que le rapprochement signale et que l'on garde, après relecture.
 *
 * Le détecteur exige déjà une réponse commune, ou citée dans l'autre énoncé, et
 * écarte les réponses qui ne sont qu'une quantité. Il reste huit paires où la
 * condition est remplie sans que le fait soit le même, et les corriger appauvrirait
 * le jeu. Chacune est acceptée pour une raison précise ; toute nouvelle entrée dans
 * cette liste est une décision éditoriale, à discuter avant de l'ajouter.
 */
const ACCEPTED_TWIN_FACTS = new Set([
  // Le roi qui règne et son prédécesseur : deux réponses, deux cartes.
  'his_069|his_116',
  // Deux pays différents sur le même continent.
  'geo_009|geo_070',
  // La plus petite province, et celle où se trouve Waterloo.
  'geo_adulte_editorial_02_044|geo_adulte_editorial_final_009',
  // L'ours et l'enfant du Livre de la jungle.
  'art_042|art_130',
  // Deux ballons ovales, deux sports.
  'spo_070|spo_113',
  // Le lionceau et son père.
  'pop_015|pop_016',
  // Le hip-hop comme musique, le break comme danse.
  'pop_ado_editorial_031|pop_ado_editorial_056',
  // Une carotte orange n'est pas un abricot orange.
  'gas_086|gas_108',
]);

function twinKey(leftId: string, rightId: string): string {
  return [leftId, rightId].sort().join('|');
}

// --- Un même fait posé deux fois dans un même niveau ------------------------
// Le dédoublonnage adulte plus haut compare « catégorie + bonne réponse » sur des
// textes normalisés : il ne voyait ni le fait posé dans les deux sens, ni deux
// formulations écrites dans deux lots différents, ni les cartes Vrai/Faux — qui
// répondent toutes « Vrai » ou « Faux » et n'entrent donc jamais en collision de
// cette façon. Quarante-neuf grappes vivaient ainsi au sein d'un même niveau,
// c'est-à-dire dans la même partie et pour le même joueur.
//
// Le contrôle porte sur le niveau : les paires d'un niveau à l'autre — un fait
// posé à la fois en enfant et en adulte — sont bien plus nombreuses et se
// discutent séparément (`npm run audit:doublons` les montre).
for (let left = 0; left < QUESTIONS_DATABASE.length; left += 1) {
  for (let right = left + 1; right < QUESTIONS_DATABASE.length; right += 1) {
    const first = QUESTIONS_DATABASE[left];
    const second = QUESTIONS_DATABASE[right];
    if (first.categoryId !== second.categoryId) continue;
    if (first.difficulty !== second.difficulty) continue;
    if (ACCEPTED_TWIN_FACTS.has(twinKey(first.id, second.id))) continue;
    if (restatesSameFact(
      { question: first.question, answer: answerOfQuestion(first), isBoolean: questionFormat(first) === 'boolean' },
      { question: second.question, answer: answerOfQuestion(second), isBoolean: questionFormat(second) === 'boolean' },
    )) {
      editorialError(`Fait déjà posé au même niveau par ${first.id}`, second.id);
    }
  }
}

// --- Formats variés : le fait ne doit pas déjà exister ailleurs -------------
// Le dédoublonnage adulte ci-dessus compare « catégorie + bonne réponse ». Une
// carte Vrai/Faux répond « Vrai » ou « Faux » : elle échappe donc entièrement à
// ce filet, et une affirmation pouvait reposer un fait déjà posé par un QCM — le
// record belge d'absence de gouvernement, l'année du passage à l'euro. La carte
// ouverte, elle, échappait au rapprochement d'un niveau à l'autre, qui ne
// compare que des textes identiques : « les longs bateaux des Vikings » du
// niveau enfant revenait en carte ouverte adulte.
//
// On compare donc l'énoncé *et* la réponse révélée, contre toutes les cartes de
// la même catégorie, tous niveaux confondus. La règle ne vise que le pool des
// formats variés : l'appliquer au corpus entier remonterait plus de deux cents
// paires anciennes, ce qui est une décision éditoriale à part
// (`npm run audit:doublons` les liste).
for (const question of QUESTIONS_DATABASE) {
  if (questionFormat(question) === 'mcq') continue;
  const mine = comparableFactText(question.question, answerOfQuestion(question));
  for (const other of QUESTIONS_DATABASE) {
    if (other.id === question.id || other.categoryId !== question.categoryId) continue;
    if (paraphrasesSameFact(mine, comparableFactText(other.question, answerOfQuestion(other)))) {
      editorialError(`Fait déjà posé par ${other.id}, en format varié`, question.id);
    }
  }
}

// --- Moules d'énoncé sur-utilisés -------------------------------------------
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
for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter(
    (question) => question.categoryId === categoryId
      && question.difficulty === 'adulte'
      && questionFormat(question) === 'mcq',
  );
  const bare = rows.filter((question) => isBareNumberCard(question.options)).length;
  if (bare > rows.length * MAX_BARE_NUMBER_RATIO) {
    errors.push(
      `${categoryId} compte ${bare} cartes adultes dont les quatre options sont`
        + ` des nombres nus (maximum ${Math.floor(rows.length * MAX_BARE_NUMBER_RATIO)})`,
    );
  }
}

// --- Contrat éditorial du niveau ado ---------------------------------------
// Le niveau ado n'avait qu'une seule règle — ne pas recopier la banque enfant —
// là où le niveau adulte en compte une douzaine. Les deux contrôles ci-dessous
// verrouillent le défaut qui rendait ce niveau injouable pour un enfant de dix
// ans : la carte sans chemin de raisonnement, où l'on sait ou l'on tire au sort.
for (const question of QUESTIONS_DATABASE) {
  if (question.difficulty !== 'ado') continue;
  // Aucune tolérance sur les millésimes : deux années voisines ne se déduisent
  // jamais. L'année a sa place dans l'énoncé, pas dans les quatre options.
  if (isBareYearCard(question.question, question.options)) {
    editorialError(`Carte ado jouée entre quatre millésimes`, question.id);
  }
}

for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter(
    (question) => question.categoryId === categoryId && question.difficulty === 'ado',
  );
  const attribution = rows.filter(
    (question) => isAttributionLotteryCard(question.question, question.options),
  ).length;
  if (attribution > MAX_ADO_ATTRIBUTION_PER_CATEGORY) {
    errors.push(
      `${categoryId} compte ${attribution} cartes ado d'attribution jouées entre`
        + ` quatre noms (maximum ${MAX_ADO_ATTRIBUTION_PER_CATEGORY})`,
    );
  }
}


// L'invariant « 400 cartes adultes relues, réponses équilibrées A/B/C/D » ne
// vaut que pour les QCM : les formats vrai/faux et ouverts forment un pool
// séparé, hors quota, résumé sous le tableau.
let variableFormatBoolean = 0;
let variableFormatOpen = 0;
console.log('Catégorie       Enfant  Ado  Adulte  Total');
console.log('--------------------------------------------');
for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter((q) => q.categoryId === categoryId);
  const counts = DIFFICULTIES.map(
    (difficulty) => rows.filter((q) => q.difficulty === difficulty).length,
  );
  const adultMcq = rows.filter(
    (q) => q.difficulty === 'adulte' && questionFormat(q) === 'mcq',
  );
  variableFormatBoolean += rows.filter((q) => questionFormat(q) === 'boolean').length;
  variableFormatOpen += rows.filter((q) => questionFormat(q) === 'open').length;
  console.log(
    `${categoryId.padEnd(15)}${String(counts[0]).padStart(6)}${String(counts[1]).padStart(5)}`
      + `${String(counts[2]).padStart(8)}${String(rows.length).padStart(7)}`,
  );
  if (adultMcq.length !== ADULT_EDITORIAL_TARGET_PER_CATEGORY) {
    errors.push(
      `${categoryId} doit contenir exactement ${ADULT_EDITORIAL_TARGET_PER_CATEGORY}`
        + ` questions adultes QCM relues (actuellement ${adultMcq.length})`,
    );
  }
  const answerPositions = [0, 1, 2, 3].map(
    (answerIndex) => adultMcq.filter((q) => q.correctAnswerIndex === answerIndex).length,
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
if (variableFormatBoolean > 0 || variableFormatOpen > 0) {
  console.log(
    `\nFormats variés (pool séparé) : ${variableFormatBoolean} vrai/faux,`
      + ` ${variableFormatOpen} ouvertes.`,
  );
}

if (associationCards > 0) {
  errors.push(`${associationCards} cartes utilisent encore le format d’association`);
}
if (longAdultOptions > 0) {
  errors.push(
    `${longAdultOptions} cartes adultes contiennent un choix de plus de`
      + ` ${MAX_ADULT_OPTION_LENGTH} caractères`,
  );
}
if (longAdultQuestions > 0) {
  errors.push(
    `${longAdultQuestions} cartes adultes dépassent ${MAX_ADULT_QUESTION_LENGTH} caractères`,
  );
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
  console.log(
    `question ≤ ${MAX_ADULT_QUESTION_LENGTH} caractères,`
      + ` choix ≤ ${MAX_ADULT_OPTION_LENGTH} caractères.`,
  );
  console.log(`Moules : aucun énoncé adulte réutilisé plus de ${MAX_SKELETON_REUSE} fois par catégorie.`);
  console.log('Énoncés : aucun ne cite le nom propre qui désigne sa bonne réponse.');
  console.log('Niveaux : aucune carte enfant recopiée au niveau ado ou adulte.');
  console.log(
    'Qualité ado : aucune devinette de millésime, et au plus'
      + ` ${MAX_ADO_ATTRIBUTION_PER_CATEGORY} cartes d'attribution par catégorie.`,
  );

  console.log('Doublons : aucun fait posé deux fois dans un même niveau et une même catégorie.');
  console.log('Formats variés : aucune carte vrai/faux ni ouverte ne repose un fait déjà posé dans sa catégorie.');

  console.log(`Volume adulte : exactement ${ADULT_EDITORIAL_TARGET_PER_CATEGORY} cartes QCM relues par catégorie (les formats variés forment un pool séparé).`);
}

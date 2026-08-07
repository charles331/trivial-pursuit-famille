/**
 * Diagnostic éditorial du niveau de difficulté.
 *
 * Contrairement à `audit-questions.ts`, ce script ne fait jamais échouer la
 * commande : il mesure. Il sert à piloter le rééquilibrage du niveau des
 * cartes (étalon visé : l'édition Famille du Trivial Pursuit du commerce,
 * culture générale grand public, avec un ancrage francophone assumé).
 *
 * Usage : npm run analyze:difficulty
 */
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

/** Seuils éditoriaux visés. Dépassement = signal, pas erreur. */
const TARGETS = {
  /** Part maximale de bonnes réponses jamais vues aux niveaux enfant/ado. */
  unknownAnswerRate: 0.2,
  /** Part minimale de cartes à ancrage francophone (France, Belgique, Suisse, Québec…). */
  francophoneRate: 0.3,
  /** Nombre maximal de cartes partageant le même moule d'énoncé. */
  templateReuse: 8,
  /** Part maximale de cartes dont les 4 options sont des nombres nus. */
  bareNumberRate: 0.05,
  /** Part maximale de cartes « qui a fait cette œuvre ? », dont la réponse est un nom. */
  authorAttributionRate: 0.1,
};

function deaccent(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const STOP_WORDS = new Set<string>([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux', 'et', 'ou', 'en',
  'dans', 'par', 'pour', 'sur', 'avec', 'quel', 'quelle', 'quels', 'quelles',
  'qui', 'que', 'quoi', 'est', 'sont', 'ce', 'cet', 'cette', 'son', 'sa', 'ses',
  'leur', 'plus', 'tres', 'comme', 'apres', 'avant', 'entre', 'sans', 'sous',
  'vers', 'depuis', 'chez', 'tout', 'toute', 'tous', 'toutes', 'meme', 'aussi',
  'bien', 'peut', 'nom', 'nomme', 'appelle', 'appele', 'designe', 'signifie',
  'surtout', 'souvent', 'principalement', 'generalement', 'notamment',
]);

/** Radical grossier : suffisant pour rapprocher « traité »/« traités ». */
function stem(word: string): string {
  const trimmed = word.replace(/(aux|eaux|es|s|e)$/, '');
  return trimmed.length > 7 ? trimmed.slice(0, 6) : trimmed;
}

function contentWords(value: string): string[] {
  const tokens: string[] = deaccent(value).match(/[a-z0-9]+/g) ?? [];
  return tokens
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .map(stem);
}

function answerOf(question: Question): string {
  return question.options[question.correctAnswerIndex] ?? '';
}

function fullText(question: Question): string {
  return deaccent(
    `${question.question} ${question.options.join(' ')} ${question.explanation ?? ''}`,
  );
}

/**
 * Squelette d'un énoncé : on remplace les noms propres et les titres cités par
 * un blanc. « Quel fleuve traverse Budapest ? » et « Quel fleuve traverse
 * Belgrade ? » donnent alors la même clé, alors qu'un découpage sur les
 * premiers mots les distinguait à tort.
 */
function skeleton(question: string): string {
  return question
    .replace(/[«"][^»"]*[»"]/g, '_')
    .split(/\s+/)
    .map((word, index) => (index > 0 && /^[A-ZÀ-Ý]/.test(word) ? '_' : deaccent(word)))
    .join(' ')
    .replace(/(?:_[\s,]*)+/g, '_ ')
    .trim();
}

function rowsOf(categoryId: CategoryId, difficulty: DifficultyLevel): Question[] {
  return QUESTIONS_DATABASE.filter(
    (question) => question.categoryId === categoryId
      && question.difficulty === difficulty,
  );
}

function pct(part: number, total: number): string {
  return total === 0 ? '  n/a' : `${Math.round((100 * part) / total)}%`.padStart(5);
}

function flag(value: number, total: number, max: number): string {
  return total > 0 && value / total > max ? ' <<' : '';
}

function section(title: string): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

// ---------------------------------------------------------------------------
// 1. Volume
// ---------------------------------------------------------------------------
section('1. Volume par catégorie et niveau');
console.log('catégorie      enfant   ado  adulte');
for (const categoryId of CATEGORIES) {
  const counts = DIFFICULTIES.map((difficulty) => rowsOf(categoryId, difficulty).length);
  console.log(
    `${categoryId.padEnd(15)}${String(counts[0]).padStart(6)}`
      + `${String(counts[1]).padStart(6)}${String(counts[2]).padStart(8)}`,
  );
}

// ---------------------------------------------------------------------------
// 2. Cartes ado recopiées du niveau enfant
// ---------------------------------------------------------------------------
section('2. Niveau ado : cartes clonées du niveau enfant');
console.log('Une carte ado identique à une carte enfant supprime une marche de la');
console.log('progression enfant → ado → adulte.');
console.log('\ncatégorie      clones  ado propres');
let clonedTeenTotal = 0;
for (const categoryId of CATEGORIES) {
  const childFacts = new Set(
    rowsOf(categoryId, 'enfant').map(
      (question) => `${deaccent(question.question)}|${deaccent(answerOf(question))}`,
    ),
  );
  const teens = rowsOf(categoryId, 'ado');
  const cloned = teens.filter(
    (question) => childFacts.has(
      `${deaccent(question.question)}|${deaccent(answerOf(question))}`,
    ),
  ).length;
  clonedTeenTotal += cloned;
  console.log(
    `${categoryId.padEnd(15)}${String(cloned).padStart(6)}`
      + `${String(teens.length - cloned).padStart(13)}${cloned > 0 ? ' <<' : ''}`,
  );
}
console.log(`\nTotal clones ado : ${clonedTeenTotal}`);

// ---------------------------------------------------------------------------
// 3. Notoriété des bonnes réponses adultes
// ---------------------------------------------------------------------------
section('3. Notoriété des bonnes réponses (niveau adulte)');
console.log('« inconnue du foyer » : aucun mot plein de la réponse n\'apparaît aux');
console.log('niveaux enfant ou ado. « hapax » : le mot n\'apparaît qu\'une fois dans');
console.log('tout le corpus, signe d\'un fait isolé et non réutilisable.');
console.log(`\nCible : ≤ ${Math.round(100 * TARGETS.unknownAnswerRate)}% d'inconnues du foyer.`);

const familyLexicon = new Set<string>();
for (const question of QUESTIONS_DATABASE) {
  if (question.difficulty === 'adulte') continue;
  for (const word of contentWords(
    `${question.question} ${question.options.join(' ')} ${question.explanation ?? ''}`,
  )) {
    familyLexicon.add(word);
  }
}
const corpusCounts = new Map<string, number>();
for (const question of QUESTIONS_DATABASE) {
  for (const word of contentWords(`${question.question} ${question.options.join(' ')}`)) {
    corpusCounts.set(word, (corpusCounts.get(word) ?? 0) + 1);
  }
}

console.log('\ncatégorie      inconnue  hapax');
for (const categoryId of CATEGORIES) {
  const rows = rowsOf(categoryId, 'adulte');
  let unknown = 0;
  let hapax = 0;
  for (const question of rows) {
    const words = contentWords(answerOf(question));
    if (words.length === 0) continue;
    if (words.every((word) => !familyLexicon.has(word))) {
      unknown += 1;
      if (words.every((word) => (corpusCounts.get(word) ?? 0) <= 1)) hapax += 1;
    }
  }
  console.log(
    `${categoryId.padEnd(15)}${pct(unknown, rows.length)}${pct(hapax, rows.length)}`
      + flag(unknown, rows.length, TARGETS.unknownAnswerRate),
  );
}

// ---------------------------------------------------------------------------
// 4. Moules d'énoncé répétés
// ---------------------------------------------------------------------------
section('4. Moules d\'énoncé répétés (niveau adulte)');
console.log(`Un même moule utilisé plus de ${TARGETS.templateReuse} fois transforme la catégorie`);
console.log('en interrogation scolaire.');
for (const categoryId of CATEGORIES) {
  const rows = rowsOf(categoryId, 'adulte');
  const molds = new Map<string, number>();
  for (const question of rows) {
    const key = skeleton(question.question);
    molds.set(key, (molds.get(key) ?? 0) + 1);
  }
  const overused = [...molds.entries()]
    .filter(([, count]) => count > TARGETS.templateReuse)
    .sort((a, b) => b[1] - a[1]);
  const affected = overused.reduce((sum, [, count]) => sum + count, 0);
  if (overused.length === 0) {
    console.log(`${categoryId.padEnd(15)}ok`);
    continue;
  }
  console.log(`${categoryId.padEnd(15)}${affected}/${rows.length} cartes <<`);
  for (const [mold, count] of overused.slice(0, 4)) {
    console.log(`${' '.repeat(17)}${String(count).padStart(3)}x « ${mold}… »`);
  }
}

// ---------------------------------------------------------------------------
// 5. Réponse annoncée par l'énoncé
// ---------------------------------------------------------------------------
section('5. Bonne réponse annoncée par l\'énoncé');
console.log('Un mot plein de la bonne réponse figure déjà dans la question ET est');
console.log('absent des trois distracteurs : il désigne la bonne réponse.');
const giveaways: Question[] = [];
for (const question of QUESTIONS_DATABASE) {
  const answerWords = new Set(contentWords(answerOf(question)));
  const promptWords = new Set(contentWords(question.question));
  const distractorWords = new Set<string>();
  question.options.forEach((option, index) => {
    if (index === question.correctAnswerIndex) return;
    for (const word of contentWords(option)) distractorWords.add(word);
  });
  const telling = [...answerWords].filter(
    (word) => promptWords.has(word) && !distractorWords.has(word),
  );
  if (telling.length > 0) giveaways.push(question);
}
for (const difficulty of DIFFICULTIES) {
  const rows = QUESTIONS_DATABASE.filter((question) => question.difficulty === difficulty);
  const hits = giveaways.filter((question) => question.difficulty === difficulty);
  console.log(`${difficulty.padEnd(8)}${String(hits.length).padStart(5)}/${rows.length}${pct(hits.length, rows.length)}`);
}
console.log('\nExemples adultes :');
for (const question of giveaways.filter((q) => q.difficulty === 'adulte').slice(0, 8)) {
  console.log(`  [${question.categoryId}] ${question.question}`);
  console.log(`      → ${answerOf(question)}`);
}

// ---------------------------------------------------------------------------
// 6. Doublons de fait par paraphrase
// ---------------------------------------------------------------------------
section('6. Doublons de fait par paraphrase');
console.log('Même bonne réponse et énoncés très proches : l\'audit ne les voit pas,');
console.log('car il compare les textes à l\'identique.');

function paraphrasePairs(rows: Question[], others?: Question[]): [Question, Question][] {
  const index = new Map<string, Question[]>();
  for (const question of others ?? rows) {
    const key = deaccent(answerOf(question));
    index.set(key, [...(index.get(key) ?? []), question]);
  }
  const pairs: [Question, Question][] = [];
  rows.forEach((question, position) => {
    for (const candidate of index.get(deaccent(answerOf(question))) ?? []) {
      if (!others && (rows.indexOf(candidate) <= position)) continue;
      const left = new Set(contentWords(question.question));
      const right = new Set(contentWords(candidate.question));
      if (left.size === 0 || right.size === 0) continue;
      const shared = [...left].filter((word) => right.has(word)).length;
      const union = new Set([...left, ...right]).size;
      if (shared / union >= 0.34) pairs.push([question, candidate]);
    }
  });
  return pairs;
}

let sameLevel = 0;
let crossLevel = 0;
console.log('\ncatégorie      adulte/adulte  ado→adulte');
for (const categoryId of CATEGORIES) {
  const within = paraphrasePairs(rowsOf(categoryId, 'adulte'));
  const across = paraphrasePairs(rowsOf(categoryId, 'adulte'), rowsOf(categoryId, 'ado'));
  sameLevel += within.length;
  crossLevel += across.length;
  console.log(
    `${categoryId.padEnd(15)}${String(within.length).padStart(13)}`
      + `${String(across.length).padStart(12)}`,
  );
  for (const [left, right] of within.slice(0, 2)) {
    console.log(`${' '.repeat(17)}« ${left.question} »`);
    console.log(`${' '.repeat(17)}« ${right.question} »  → ${answerOf(left)}`);
  }
}
console.log(`\nTotal : ${sameLevel} paires adulte/adulte, ${crossLevel} reprises d'une carte ado.`);

// ---------------------------------------------------------------------------
// 7. Cartes jouées au hasard
// ---------------------------------------------------------------------------
section('7. Cartes dont les 4 options sont des nombres nus');
console.log('Sans repère mémorisable, le joueur tire au sort entre quatre nombres.');
console.log(`Cible : ≤ ${Math.round(100 * TARGETS.bareNumberRate)}% des cartes adultes.`);
console.log('');
for (const categoryId of CATEGORIES) {
  const rows = rowsOf(categoryId, 'adulte');
  const bare = rows.filter(
    (question) => question.options.every((option) => /^[^\d]{0,6}\d{1,4}[^\d]{0,12}$/.test(option.trim())),
  ).length;
  console.log(
    `${categoryId.padEnd(15)}${String(bare).padStart(4)}/${rows.length}${pct(bare, rows.length)}`
      + flag(bare, rows.length, TARGETS.bareNumberRate),
  );
}

// ---------------------------------------------------------------------------
// 8. Ancrage francophone
// ---------------------------------------------------------------------------
section('8. Ancrage francophone et belge');
console.log('La culture francophone reste la plus parlante pour un foyer belge.');
console.log(`Cible adulte : ≥ ${Math.round(100 * TARGETS.francophoneRate)}% de cartes francophones,`);
console.log('sauf en sciences : une loi physique n\'a pas de nationalité.');

const BELGIAN = [
  'belg', 'bruxelles', 'wallon', 'flandre', 'flamand', 'liege', 'gand', 'anvers',
  'bruges', 'namur', 'charleroi', 'ardenne', 'mons', 'louvain', 'hasselt',
  'malines', 'ostende', 'tournai', 'escaut', 'senne', 'anderlecht', 'merckx',
  'tintin', 'spirou', 'schtroumpf', 'franquin', 'peyo', 'herge', 'magritte',
  'brel', 'stromae', 'angele', 'speculoos', 'trappist',
];
const FRANCOPHONE = [
  ...BELGIAN,
  // Pays, régions et villes
  'france', 'francais', 'francaise', 'paris', 'lyon', 'lyonnais', 'marseille',
  'marseillais', 'bordeaux', 'bordelais', 'toulouse', 'nantes', 'nice', 'nicois',
  'strasbourg', 'lille', 'rennes', 'dijon', 'reims', 'avignon', 'normandie',
  'normand', 'bretagne', 'breton', 'provence', 'provencal', 'loire', 'alsace',
  'alsacien', 'bourgogne', 'bourguignon', 'savoie', 'savoyard', 'auvergne',
  'auvergnat', 'perigord', 'gascogne', 'landes', 'roussillon', 'languedoc',
  'basque', 'corse', 'jura', 'vendee', 'picard', 'lorraine', 'champagne',
  'ardeche', 'camargue', 'cevennes', 'pyrenees', 'sarrasin', 'castelnaudary',
  'espelette', 'sauternes', 'chablis', 'banyuls', 'cantal', 'bresse',
  // Culture et histoire
  'molier', 'hugo', 'zola', 'baudelair', 'proust', 'camus', 'rimbaud',
  'verlaine', 'flaubert', 'balzac', 'voltaire', 'rousseau', 'sartre',
  'gaulle', 'napoleon', 'versailles', 'louvre', 'orsay', 'impressionn',
  'nouvelle vague', 'academie francaise', 'francophon',
  // Table
  'bouillabaisse', 'ratatouille', 'cassoulet', 'aligot', 'brandade',
  'pissaladiere', 'socca', 'far breton', 'kouign', 'canele', 'calisson',
  'roquefort', 'camembert', 'comte', 'reblochon', 'munster', 'chevre',
  'baguette', 'croissant', 'creperie', 'galette', 'crepe', 'pot-au-feu',
  'bearnaise', 'hollandaise', 'bechamel', 'gribiche', 'chiffonnade',
  'beurre blanc', 'terroir', 'appellation', 'aop', 'chicoree', 'praline',
  'cidre', 'calvados', 'pastis', 'genievre', 'chartreuse',
  // Cinéma, scène et lettres francophones
  'truffaut', 'godard', 'melville', 'carne', 'renoir', 'clouzot', 'tati',
  'varda', 'besson', 'kassovitz', 'jeunet', 'sciamma', 'audiard', 'ozon',
  'haneke', 'dardenne', 'akerman', 'van dormael', 'dolan', 'villeneuve',
  'arcand', 'de funes', 'bourvil', 'gabin', 'delon', 'belmondo', 'deneuve',
  'huppert', 'binoche', 'depardieu', 'jean reno', 'poelvoorde',
  'magritte du cinema', 'nouvelle vague',
  'chanson francaise', 'brel', 'brassens', 'gainsbourg', 'piaf', 'aznavour',
  'goldman', 'celine dion', 'indochine', 'telephone', 'orelsan', 'angele',
  'stromae', 'aya nakamura', 'bigflo', 'damso',
  // Autres aires francophones
  'quebec', 'quebecois', 'montreal', 'suisse', 'romand', 'geneve', 'lausanne',
  'luxembourg', 'senegal', 'maroc', 'marocain', 'tunisi', 'algeri', 'algerien',
  'ivoir', 'haiti', 'congo', 'cameroun', 'mali', 'burkina', 'benin', 'togo',
];

console.log('\ncatégorie      enfant  ado  adulte   (dont belge, adulte)');
for (const categoryId of CATEGORIES) {
  const shares = DIFFICULTIES.map((difficulty) => {
    const rows = rowsOf(categoryId, difficulty);
    const hits = rows.filter(
      (question) => FRANCOPHONE.some((key) => fullText(question).includes(key)),
    ).length;
    return pct(hits, rows.length);
  });
  const adults = rowsOf(categoryId, 'adulte');
  const belgian = adults.filter(
    (question) => BELGIAN.some((key) => fullText(question).includes(key)),
  ).length;
  const adultRows = adults.length;
  const adultHits = adults.filter(
    (question) => FRANCOPHONE.some((key) => fullText(question).includes(key)),
  ).length;
  const francophoneTarget = categoryId === 'sciences' ? 0 : TARGETS.francophoneRate;
  console.log(
    `${categoryId.padEnd(15)}${shares[0]}${shares[1]}${shares[2]}`
      + `${pct(belgian, adultRows)}`
      + flag(adultRows - adultHits, adultRows, 1 - francophoneTarget),
  );
}

// ---------------------------------------------------------------------------
// 9. Charge de lecture du niveau enfant
// ---------------------------------------------------------------------------
section('9. Charge de lecture du niveau enfant');
console.log('catégorie      mots/question  max  >18 mots  explication');
for (const categoryId of CATEGORIES) {
  const rows = rowsOf(categoryId, 'enfant');
  const lengths = rows.map((question) => question.question.split(/\s+/).length);
  const mean = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
  const long = lengths.filter((value) => value > 18).length;
  const explained = rows.filter((question) => (question.explanation ?? '').trim()).length;
  console.log(
    `${categoryId.padEnd(15)}${mean.toFixed(1).padStart(11)}`
      + `${String(Math.max(...lengths)).padStart(6)}${String(long).padStart(9)}`
      + `${pct(explained, rows.length)}`,
  );
}

// ---------------------------------------------------------------------------
// 10. Recouvrement entre catégories
// ---------------------------------------------------------------------------
section('10. Recouvrement entre catégories (même bonne réponse)');
console.log('Deux catégories qui partagent leurs réponses donnent l\'impression de');
console.log('rejouer la même carte sur une autre case.');
for (const difficulty of DIFFICULTIES) {
  const overlaps: string[] = [];
  CATEGORIES.forEach((left, index) => {
    for (const right of CATEGORIES.slice(index + 1)) {
      const leftAnswers = new Set(rowsOf(left, difficulty).map((q) => deaccent(answerOf(q))));
      const shared = new Set(
        rowsOf(right, difficulty)
          .map((q) => deaccent(answerOf(q)))
          .filter((answer) => leftAnswers.has(answer)),
      ).size;
      if (shared >= 8) overlaps.push(`${left}/${right}=${shared}`);
    }
  });
  console.log(`${difficulty.padEnd(8)}${overlaps.join(', ') || 'rien de notable'}`);
}

// ---------------------------------------------------------------------------
// 11. Cartes d'attribution d'une œuvre à son auteur
// ---------------------------------------------------------------------------
section('11. Attribution d\'une œuvre à son auteur (niveau adulte)');
console.log('« Quel réalisateur a signé ce film ? » n\'a qu\'une seule façon de se');
console.log('gagner : connaître le nom. Quatre noms inconnus, et la carte se subit au');
console.log('lieu de se jouer. Le moule échappe au contrôle 4 : chaque énoncé');
console.log('reformule légèrement le même geste.');
console.log('Sont comptées les cartes qui réclament un rôle de créateur — auteur,');
console.log('dessinateur, compositeur, architecte, studio — et dont la réponse est un');
console.log('nom. Un personnage ou une marque en réponse ne compte pas.');
console.log(`\nCible : ≤ ${Math.round(100 * TARGETS.authorAttributionRate)}% des cartes adultes par catégorie.`);
console.log('');

/**
 * « Qui a fait cette œuvre ? », sous toutes ses variantes.
 *
 * Ce contrôle a été faux deux fois avant d'être juste, et les deux erreurs
 * valent d'être notées. La première version listait des verbes — « réalisé,
 * signé, peint, écrit » — et annonçait 104 cartes d'attribution en art : elle
 * ratait « qui a créé », « quel est l'auteur de », « à quel artiste doit-on ».
 * La deuxième comptait toute carte dont la réponse est un nom propre, et
 * gonflait le compte de l'inverse : Blacksad, Bob Morane, Michel Vaillant,
 * Pokémon, Motown ou Spotify sont des personnages et des marques, pas des
 * auteurs.
 *
 * Le critère juste tient aux deux bouts : l'énoncé réclame **un rôle de
 * créateur** — auteur, dessinateur, compositeur, architecte, mangaka, studio —
 * et la bonne réponse est **un nom**, pas un titre précédé d'un article.
 */
const ASKS_FOR_CREATOR = /\b(?:qui\s+(?:a|est|fut|grava|con[çc]ut|dessina|cr[éeè]a|composa|[ée]crivit|illustra|sculpta|peignit|r[ée]alisa|imagina|inventa|fonda)|quel(?:le)?s?\s+(?:auteur|autrice|cr[éeè]at|artiste|peintre|sculpt|architecte|[ée]crivain|romanci|dessinat|sc[ée]nariste|compositeur|compositrice|mangaka|po[èe]te|dramaturge|chor[ée]graphe|photographe|couturi|designer|graveur|illustrat|verrier|cin[ée]aste|r[ée]alisat|metteur|studio|artisan|graphiste|styliste|orf[èe]vre)|[àa] quel(?:le)? (?:artiste|auteur|peintre|cr[ée]ateur))/i;

/** Une réponse-patronyme : un nom propre, pas un titre précédé d'un article. */
function looksLikePersonName(answer: string): boolean {
  const trimmed = answer.trim();
  return /^[A-ZÀ-Ý]/.test(trimmed) && !/^(le |la |les |l’|l'|un |une |des |du |de |au )/i.test(trimmed);
}

for (const categoryId of CATEGORIES) {
  const rows = rowsOf(categoryId, 'adulte');
  const attribution = rows.filter(
    (question) => ASKS_FOR_CREATOR.test(question.question) && looksLikePersonName(answerOf(question)),
  );
  console.log(
    `${categoryId.padEnd(15)}${String(attribution.length).padStart(4)}/${rows.length}`
      + `  ${pct(attribution.length, rows.length).padStart(5)}`
      + ` ${flag(attribution.length, rows.length, TARGETS.authorAttributionRate)}`,
  );
}

// ---------------------------------------------------------------------------
// 12. Cartes qui demandent de nommer une personne
// ---------------------------------------------------------------------------
section('12. « Nommez la personne » (niveau adulte)');
console.log('La famille de la section 11 étendue aux autres rôles : roi, explorateur,');
console.log('savant, dirigeant, militante, sportif. Une carte n\'est pas fautive parce');
console.log('que sa réponse est un nom — « Quel explorateur remonta le Saint-Laurent ? »');
console.log('se gagne très bien face à trois inconnus et un Jacques Cartier. Ce que la');
console.log('colonne « hors du jeu » compte, c\'est le cas où le nom attendu n\'apparaît');
console.log('nulle part ailleurs dans le corpus : personne à table ne peut le produire.');
console.log('');

const ASKS_FOR_ROLE = /\bquel(?:le)?s?\s+(?:explorat|navigat|conquistador|roi\b|reine|empereur|imp[ée]ratrice|tsar|sultan|pharaon|pape|g[ée]n[ée]ral|mar[ée]chal|amiral|chef\b|savant|scientifique|physicien|chimiste|biologiste|m[ée]decin|astronome|math[ée]maticien|inventeur|philosophe|[ée]conomiste|pr[ée]sident|chancelier|ministre|dirigeant|souverain|r[ée]sistant|aviat|alpiniste|militant|sportif|joueur|coureur|cycliste|nageur|athl[èe]te|pilote|boxeur|footballeur|l[ée]gislateur)/i;

for (const categoryId of CATEGORIES) {
  const rows = rowsOf(categoryId, 'adulte');
  const named = rows.filter(
    (question) => (ASKS_FOR_ROLE.test(question.question) || ASKS_FOR_CREATOR.test(question.question))
      && looksLikePersonName(answerOf(question)),
  );
  const outside = named.filter((question) => {
    const words = contentWords(answerOf(question));
    return words.length > 0 && words.every((word) => !familyLexicon.has(word));
  });
  console.log(
    `${categoryId.padEnd(15)}${String(named.length).padStart(4)}/${rows.length}`
      + `   hors du jeu : ${String(outside.length).padStart(3)}`,
  );
}

console.log('\nDiagnostic terminé. Les repères « << » signalent un écart à la cible.');

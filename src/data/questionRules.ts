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

const ANSWER_ARTICLES = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd', 'au', 'aux', 'et',
]);

/**
 * Comme `normalize`, mais les accents restent : ils distinguent des mots que le
 * joueur lit comme différents. Sans eux, « maïs » se confondrait avec la
 * conjonction « mais » et « Demon Slayer » avec « démon ».
 */
function simplify(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/**
 * Ce qu'il reste d'une réponse une fois retirés articles et liaisons, au
 * singulier pour que « plante » et « plantes » se reconnaissent d'un choix à
 * l'autre. Les mots vides des énoncés ne s'appliquent pas ici : « sous » ou
 * « même » ne disent rien dans une question, mais font toute la réponse dans
 * « Sous la terre » ou « La même plante ».
 */
function answerWords(answer: string): string[] {
  return simplify(answer)
    .split(' ')
    .filter((word) => word.length >= 3 && !ANSWER_ARTICLES.has(normalize(word)))
    .map((word) => word.replace(/s$/, ''));
}

function isEchoedInQuestion(question: string, word: string): boolean {
  const prompt = ` ${simplify(question)} `;
  return prompt.includes(` ${word} `) || prompt.includes(` ${word}s `);
}

/**
 * L'énoncé donne-t-il la bonne réponse par simple ressemblance de mots ?
 *
 * `leaksCorrectAnswer` n'attrape que la citation littérale suivie d'une
 * assertion. Elle laissait passer la forme la plus courante du problème :
 * « Quel film de 1966 montre une bataille d'Alger… ? » pour « La Bataille
 * d'Alger ». L'article change, la phrase exacte n'apparaît pas, et pourtant la
 * carte se joue sans rien savoir.
 *
 * Ce qui compte n'est pas qu'un mot de la réponse soit présent — « Quelle
 * marche de Gandhi… ? » face à quatre marches ne trahit rien — mais que
 * l'énoncé reprenne ce qui **distingue** la bonne réponse des trois autres. Et
 * seulement elle : nommer deux candidats (« entre le lièvre et la tortue »)
 * oblige toujours à choisir.
 */
export function echoesCorrectAnswer(question: string, options: string[], correctIndex: number): boolean {
  if (options.length !== 4) return false;

  const wordsPerOption = options.map(answerWords);
  const echoesOption = (index: number): boolean => {
    const others = new Set(wordsPerOption.filter((_, other) => other !== index).flat());
    const discriminating = wordsPerOption[index].filter((word) => !others.has(word));
    return discriminating.length > 0
      && discriminating.every((word) => isEchoedInQuestion(question, word));
  };

  if (!echoesOption(correctIndex)) return false;
  return options.every((_, index) => index === correctIndex || !echoesOption(index));
}

/**
 * Mots outils que la capitale initiale d'une phrase ou d'un titre ne transforme
 * pas en nom propre : « Dans le Nord », « Le Trésor… », « C'est le créateur… ».
 */
const FUNCTION_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux', 'et', 'ou',
  'dans', 'pour', 'par', 'sur', 'sous', 'avec', 'sans', 'chez', 'vers', 'entre',
  'ce', 'cet', 'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs', 'est',
  'quel', 'quelle', 'quels', 'quelles', 'qui', 'que', 'quoi', 'comment',
  'combien', 'pourquoi', 'quand', 'lorsque', 'lequel', 'laquelle', 'depuis',
  'the', 'and', 'of', 'for', 'from', 'with',
  // Une majuscule de titre ne fait pas un nom propre d'un pronom ni d'un
  // adverbe : « Non, je ne regrette rien », « Il est cinq heures ».
  'non', 'oui', 'ne', 'pas', 'plus', 'rien', 'tout', 'je', 'tu', 'il', 'elle',
  'nous', 'vous', 'ils', 'elles', 'on', 'mon', 'ton', 'notre', 'votre',
]);

/**
 * Noms propres d'un texte, dans l'ordre : les mots capitalisés, mots outils
 * exclus.
 *
 * Les majuscules de début de phrase ne sont pas filtrées par la position mais
 * par le sens : « Dans » et « Quand » restent des mots outils, tandis que
 * « Ebola » ou « Titanic » désigne bel et bien quelque chose, même en tête de
 * réponse.
 */
function properNames(text: string): string[] {
  return text
    .split(/[^\p{L}\p{N}’'-]+/u)
    .filter((word) => /^[A-ZÀ-Ý]/.test(word))
    .flatMap((word) => simplify(word).split(' '))
    .filter((word) => word.length >= 3 && !FUNCTION_WORDS.has(normalize(word)))
    .map((word) => word.replace(/s$/, ''));
}

/**
 * L'énoncé cite-t-il un nom propre qui n'appartient qu'à la bonne réponse ?
 *
 * `echoesCorrectAnswer` exige que **tous** les mots distinctifs de la bonne
 * réponse soient repris dans l'énoncé. Un seul mot de remplissage suffisait
 * donc à passer : « Quelle épidémie fut identifiée en 1976 près de la rivière
 * Ebola ? » pour « La maladie à virus Ebola » — « virus » n'apparaît pas dans
 * la question, la carte passait, et pourtant elle ne demande rien à personne.
 *
 * Un nom propre ne se raisonne pas, il se reconnaît : dès qu'il n'appartient
 * qu'à la bonne réponse et que l'énoncé le prononce, la carte est donnée.
 *
 * Trois garde-fous conservent les cartes légitimes. Le nom doit distinguer la
 * bonne réponse des trois autres — « Quelle Marche de Gandhi… ? » face à quatre
 * marches ne trahit rien. Il doit être un nom propre des deux côtés : citer
 * l'œuvre dont on interroge le contenu reste permis. Et c'est **le dernier** nom
 * propre de la réponse qui compte, celui qui la nomme vraiment : « Qui joue
 * Daniel Plainview ? » ne donne pas « Daniel Day-Lewis », le prénom partagé ne
 * désigne personne, alors que « près de la rivière Ebola » donne « la maladie à
 * virus Ebola ».
 *
 * Le contrôle reste donc incomplet par construction : un nom identifiant placé
 * ailleurs qu'en fin de réponse lui échappe. Il attrape la forme courante, pas
 * toutes les formes.
 */
export function quotesAnswerProperName(
  question: string,
  options: string[],
  correctIndex: number,
): boolean {
  if (options.length !== 4) return false;

  const namesInAnswer = properNames(options[correctIndex] ?? '');
  const identifyingName = namesInAnswer[namesInAnswer.length - 1];
  if (!identifyingName) return false;

  const wordsPerOption = options.map(answerWords);
  const others = new Set(
    wordsPerOption.filter((_, index) => index !== correctIndex).flat(),
  );
  if (others.has(identifyingName)) return false;

  return properNames(question).includes(identifyingName)
    && isEchoedInQuestion(question, identifyingName);
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

/**
 * Carte jouée entre quatre millésimes : « En quelle année… ? » suivi de 1905,
 * 1912, 1918, 1914.
 *
 * Plus étroit que `isBareNumberCard`, qui accepte toute réponse chiffrée — « 206
 * os », « quatre cavités » — et qui a sa place. Ici, aucun raisonnement ne
 * départage deux années voisines : on retient la date, ou on tire au sort. Mieux
 * vaut interroger la substance de l'événement en citant l'année dans l'énoncé.
 */
/** Un énoncé qui réclame explicitement une date : « en quelle année… ? ». */
const YEAR_PROMPT = /en quelle année|quelle année|en quel siècle|quel siècle|à quelle date/i;

export function isBareYearCard(question: string, options: string[]): boolean {
  if (options.length !== 4) return false;
  // C'est l'énoncé, et non le nombre de chiffres, qui dit s'il s'agit d'un
  // millésime. Se fier aux seuls chiffres signalait à tort le matricule 007 de
  // James Bond, les 501 points des fléchettes et les 151 Pokémon d'origine.
  if (!YEAR_PROMPT.test(question)) return false;
  // Deux échappatoires, toutes deux couvertes par un test : un préfixe court
  // déguise le millésime (« En 476 »), et l'Antiquité s'écrit sur trois chiffres
  // — « 395 » contre « 476 » se devine tout autant que « 1977 » contre « 1983 ».
  return options.every(
    (option) => /^\s*(?:en\s+|vers\s+|l[’']an\s+)?[0-9]{3,4}\s*$/i.test(option),
  );
}


/**
 * Un énoncé qui réclame le nom d'une personne : « qui a peint… », « quel
 * navigateur… », « quelle infirmière… ».
 */
const PERSON_ROLE_WORDS = 'écrivain|peintre|roi|reine|président|premier ministre|médecin'
  + '|navigateur|explorateur|savant|scientifique|compositeur|acteur|actrice|réalisateur'
  + '|chanteur|chanteuse|infirmière|militant|maréchal|amiral|empereur|impératrice'
  + '|sculpteur|architecte|auteur|romancier|poète|dessinateur|inventeur|philosophe'
  + '|héros|héroïne|personnage|détective|forçat|résistant|pharaon|chevalier|dieu|déesse';

/**
 * Le « qui » interrogatif ouvre l'énoncé ou suit une ponctuation. Le « qui »
 * relatif, lui, suit un nom : « la danse **qui a** donné son nom au Boléro » ne
 * demande pas un nom de personne, et se départage très bien.
 */
const PERSON_PROMPT = new RegExp(
  `((?:^|[?!.,;:]\\s*|^\\s*)qui\\s+(a|est|était|fut|invent|peign|dirig|compos|écriv|réalis)`
  + `|quel(le)?s?\\s+(${PERSON_ROLE_WORDS}))`,
  'i',
);

/**
 * « Comment s'appelle… ? » ne réclame un nom de personne que si l'énoncé en
 * désigne une : « comment s'appelle le sous-marin du capitaine Nemo ? » ou « le
 * château du capitaine Haddock ? » interrogent un objet et un lieu, pas un
 * personnage, et se départagent autrement.
 */
const NAMING_PROMPT = /comment\s+s(?:’|')?(?:appelle|appelait|appellent)|comment\s+se\s+nomm/i;
const PERSON_ROLE = new RegExp(`\\b(${PERSON_ROLE_WORDS})\\b`, 'i');

/**
 * Une option qui ressemble à un nom de personne.
 *
 * Le patronyme seul compte autant que le nom complet : « Bizet » face à
 * « Gounod », « Offenbach » et « Massenet » est exactement la même loterie que
 * « Florence Nightingale » face à « Clara Barton ». C'est le trou par lequel
 * passait « Comment s'appelle l'ancien forçat des Misérables ? », entre Javert,
 * Marius et Thénardier.
 */
function looksLikePersonName(option: string): boolean {
  const trimmed = option.trim().replace(/^(Le|La|L’|L'|Les)\s+/i, '');
  if (!/^[A-ZÀ-Ý]/.test(trimmed)) return false;
  if (/\d/.test(trimmed)) return false;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 4) return false; // une phrase descriptive, pas un nom
  return tokens.every((token) => /^([A-ZÀ-Ý][\wà-ÿ.’'-]*|de|von|van|del|di|le|la|du|d’|d')$/.test(token));
}

/**
 * Carte jouée à la loterie de noms propres : l'énoncé réclame un nom de personne
 * et les quatre options sont des noms de personnes.
 *
 * C'est le défaut qui rendait le niveau ado injouable pour un enfant de dix ans :
 * « Quelle infirmière britannique… ? » entre Barton, Cavell, Curie et
 * Nightingale ne laisse aucun chemin de raisonnement — on sait, ou on tire au
 * sort. La carte n'est pas fautive parce que son sujet est exigeant, mais parce
 * qu'aucune déduction n'est possible : mieux vaut interroger l'œuvre ou le fait
 * que le nom, en citant celui-ci dans l'énoncé.
 */
export function isPersonNameLotteryCard(question: string, options: string[]): boolean {
  if (options.length !== 4) return false;
  const asksForPerson = PERSON_PROMPT.test(question)
    || (NAMING_PROMPT.test(question) && PERSON_ROLE.test(question));
  if (!asksForPerson) return false;
  return options.every(looksLikePersonName);
}

/** Verbes d'attribution : celui qui a fait l'œuvre. */
// Deux pièges de rédaction, tous deux rencontrés :
//  - sans borne à droite, « la peintre Frida Kahlo » contient « a peint » ;
//  - `\b` ne convient pas comme borne, car il est ASCII : après le « é » de
//    « composé », JavaScript ne voit aucune frontière et la règle ne matchait
//    plus aucun participe accentué. On exige donc simplement que le participe
//    ne soit pas suivi d'une autre lettre.
const NOT_A_LETTER = '(?![a-zà-ÿ])';
const ATTRIBUTION_VERB = new RegExp(
  '\\b(a|ont)\\s+(composé|peint|écrit|réalisé|dessiné|conçu|créé|sculpté|bâti|construit'
  + `|inventé|découvert|fondé|tourné|publié|signé)${NOT_A_LETTER}`
  + '|\\best\\s+l(?:e|a|’|\')?\\s*'
  + `(auteur|autrice|créateur|créatrice|inventeur|réalisateur|compositeur)${NOT_A_LETTER}`,
  'i',
);

/**
 * Carte d'attribution jouée entre quatre noms : « Qui a composé La Flûte
 * enchantée ? » entre Beethoven, Verdi, Wagner et Mozart.
 *
 * C'est la forme la plus pure du défaut, et la seule qui n'offre *aucune* prise :
 * l'énoncé ne dit rien de la personne, seulement ce qu'elle a produit. On sait
 * qui a composé, ou l'on tire au sort entre quatre contemporains.
 *
 * Volontairement plus étroit que `isPersonNameLotteryCard`, qui signale une forme
 * suspecte mais attrape aussi de très bonnes cartes : « Quel dieu grec règne sur
 * les mers, armé de son trident ? » et « Quel personnage de Nintendo est un
 * plombier moustachu en salopette ? » décrivent leur réponse, et cette
 * description *est* le chemin de raisonnement. Les réécrire appauvrirait le jeu.
 * C'est l'attribution nue qu'il faut convertir, en interrogeant l'œuvre.
 */
export function isAttributionLotteryCard(question: string, options: string[]): boolean {
  if (options.length !== 4) return false;
  if (!ATTRIBUTION_VERB.test(question)) return false;
  return options.every(looksLikePersonName);
}

export interface QuestionCandidate {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  format?: 'mcq' | 'boolean' | 'open';
  answer?: string;
}

/** Longueur maximale de la réponse révélée d'une carte ouverte. */
export const MAX_OPEN_ANSWER_LENGTH = 80;

/** Les deux seuls choix admis pour une carte Vrai/Faux, une fois normalisés. */
const BOOLEAN_OPTION_SET = new Set(['vrai', 'faux']);

/**
 * Contrôles propres aux cartes Vrai/Faux : exactement deux choix « Vrai » et
 * « Faux » et une bonne réponse binaire. Les contrôles de distracteurs (échos,
 * noms propres…) ne s'appliquent pas : il n'y a pas quatre options à départager.
 */
function booleanRejectionReason(card: QuestionCandidate): string | null {
  if (!Array.isArray(card.options) || card.options.length !== 2) {
    return 'une carte vrai/faux a exactement deux choix';
  }
  const normalized = new Set(card.options.map(normalize));
  if (normalized.size !== 2 || [...normalized].some((option) => !BOOLEAN_OPTION_SET.has(option))) {
    return 'les deux choix doivent être « Vrai » et « Faux »';
  }
  if (card.correctAnswerIndex !== 0 && card.correctAnswerIndex !== 1) {
    return 'bonne réponse invalide';
  }
  return null;
}

/**
 * Contrôles propres aux cartes ouvertes : aucune proposition, une réponse
 * canonique qui n'apparaît pas dans l'énoncé (sinon la carte se joue seule) et
 * un index correct fixé à 0, celui que le lecteur soumet en cas de réussite.
 */
function openRejectionReason(card: QuestionCandidate): string | null {
  if (Array.isArray(card.options) && card.options.length !== 0) {
    return 'une carte ouverte n’a aucune proposition';
  }
  if (card.correctAnswerIndex !== 0) return 'bonne réponse invalide';
  const answer = typeof card.answer === 'string' ? card.answer.trim() : '';
  if (answer.length < 1) return 'réponse absente';
  if (answer.length > MAX_OPEN_ANSWER_LENGTH) {
    return `réponse de plus de ${MAX_OPEN_ANSWER_LENGTH} caractères`;
  }
  // Sans propositions, la moindre apparition littérale de la réponse suffit à
  // donner la carte : on est plus strict que pour un QCM, où `leaksCorrectAnswer`
  // ne vise que les tournures qui affirment explicitement la réponse.
  if (containsWholeNormalizedPhrase(card.question, answer)) {
    return 'réponse révélée dans l’énoncé';
  }
  return null;
}

/**
 * Contrôles éditoriaux applicables à une carte prise isolément.
 *
 * Renvoie `null` si la carte est conforme, sinon le motif de rejet — le même
 * libellé que celui de l'audit, pour que les deux chaînes parlent la même
 * langue dans les journaux.
 */
export function editorialRejectionReason(card: QuestionCandidate): string | null {
  const format = card.format ?? 'mcq';
  const question = typeof card.question === 'string' ? card.question.trim() : '';
  if (question.length < 10) return 'énoncé absent ou trop court';
  if (question.length > MAX_ADULT_QUESTION_LENGTH) {
    return `énoncé de plus de ${MAX_ADULT_QUESTION_LENGTH} caractères`;
  }
  if (hasDecorativePrefix(question)) return 'préfixe artificiel interdit';

  // Les formats sans quatre propositions ont leurs propres contrôles : les
  // règles de distracteurs (échos, noms propres, association…) n'ont pas de sens
  // sans quatre options à départager.
  if (format === 'boolean') {
    const reason = booleanRejectionReason(card);
    if (reason) return reason;
    const correct = card.options[card.correctAnswerIndex]?.trim() ?? '';
    if (merelyRestatesQuestion({ question, explanation: card.explanation }, correct)) {
      return 'explication non informative';
    }
    return null;
  }
  if (format === 'open') {
    const reason = openRejectionReason(card);
    if (reason) return reason;
    if (merelyRestatesQuestion({ question, explanation: card.explanation }, card.answer ?? '')) {
      return 'explication non informative';
    }
    return null;
  }

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

  if (card.options.some((option) => option.trim().length > MAX_ADULT_OPTION_LENGTH)) {
    return `choix de plus de ${MAX_ADULT_OPTION_LENGTH} caractères`;
  }

  if (isAssociationFormat(question, card.options)) return 'format d’association interdit';
  if (isArtificialFillIn(question)) return 'question à trou artificielle';
  if (hasGrammarHintAroundBlank(question)) return 'indice grammatical autour d’un blanc';

  const correctAnswer = card.options[card.correctAnswerIndex]?.trim() ?? '';
  if (leaksCorrectAnswer(question, correctAnswer)) return 'bonne réponse révélée dans l’énoncé';
  if (echoesCorrectAnswer(question, card.options, card.correctAnswerIndex)) {
    return 'énoncé qui donne la bonne réponse';
  }
  if (quotesAnswerProperName(question, card.options, card.correctAnswerIndex)) {
    return 'nom propre de la bonne réponse cité dans l’énoncé';
  }
  if (merelyRestatesQuestion({ question, explanation: card.explanation }, correctAnswer)) {
    return 'explication non informative';
  }

  return null;
}

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  echoesCorrectAnswer,
  editorialRejectionReason,
  isAttributionLotteryCard,
  isBareYearCard,
  answersDesignateSameThing,
  comparableFactText,
  isPersonNameLotteryCard,
  paraphrasesSameFact,
  promptGivesAwayQuantity,
  quotesAnswerProperName,
  restatesSameFact,
} from '../src/data/questionRules';

/** Raccourci de lecture : la bonne réponse est toujours le premier choix. */
function echoes(question: string, correct: string, ...wrong: [string, string, string]): boolean {
  return echoesCorrectAnswer(question, [correct, ...wrong], 0);
}

test('an answer echoed word for word in the question is caught', () => {
  assert.equal(
    echoes(
      'Quel film de 1966 montre une bataille d’Alger sans acteurs professionnels ?',
      'La Bataille d’Alger',
      'Z', 'Queimada', 'Chronique des années de braise',
    ),
    true,
  );
});

test('a changed article does not hide the leak', () => {
  // « une bataille d'Alger » contre « La Bataille d'Alger » : la citation
  // littérale manque, la carte se joue quand même sans rien savoir.
  assert.equal(
    echoes(
      'Quelle province belge a pour chef-lieu la ville de Liège ?',
      'La province de Liège',
      'Le Hainaut', 'Le Brabant wallon', 'Le Luxembourg',
    ),
    true,
  );
});

test('a word shared by every option gives nothing away', () => {
  // Quatre marches, une seule « du sel » : « marche » ne désigne personne.
  assert.equal(
    echoes(
      'Quelle marche menée par Gandhi en 1930 dénonça un monopole britannique ?',
      'La Marche du sel',
      'La Longue Marche', 'La Marche sur Rome', 'La Marche de la faim',
    ),
    false,
  );
});

test('naming two candidates still forces a choice', () => {
  assert.equal(
    echoes(
      'Entre le lièvre et la tortue, qui remporte la course de la fable ?',
      'La tortue',
      'Le lièvre', 'Le renard', 'Le corbeau',
    ),
    false,
  );
});

test('plural and singular are the same word from one option to the next', () => {
  // « plante » apparaît dans un mauvais choix : il ne distingue plus rien.
  assert.equal(
    echoes(
      'De quelle plante le thé vert et le thé noir proviennent-ils ?',
      'La même plante',
      'Deux plantes différentes', 'Un arbuste et une liane', 'Un arbre et une fleur',
    ),
    false,
  );
});

test('accents separate words a player reads as different', () => {
  // « maïs » n'est pas la conjonction « mais ».
  assert.equal(
    echoes(
      'Quel grain donne son nom au whisky bourbon mais n’est pas son seul ingrédient ?',
      'Le maïs',
      'Le blé', 'Le seigle', 'L’orge',
    ),
    false,
  );
});

test('a rewritten question is accepted once the giveaway word is gone', () => {
  assert.equal(
    echoes(
      'Quel fruit du verger, rouge ou vert, se croque à l’automne et se cuit en compote ?',
      'La pomme',
      'La banane', 'L’ananas', 'Le melon',
    ),
    false,
  );
});

test('the editorial contract rejects a card that gives its answer away', () => {
  assert.equal(
    editorialRejectionReason({
      question: 'Quel fruit garnit la tarte aux pommes ?',
      options: ['La pomme', 'La banane', 'L’ananas', 'Le melon'],
      correctAnswerIndex: 0,
      explanation: 'La tarte aux pommes figure déjà dans des recettes du Moyen Âge.',
    }),
    'énoncé qui donne la bonne réponse',
  );
});

/** Raccourci de lecture : la bonne réponse est toujours le premier choix. */
function quotesName(question: string, correct: string, ...wrong: [string, string, string]): boolean {
  return quotesAnswerProperName(question, [correct, ...wrong], 0);
}

test('a filler word in the answer no longer hides a quoted proper name', () => {
  // « virus » n'apparaît pas dans l'énoncé, ce qui suffisait à passer
  // echoesCorrectAnswer alors que « Ebola » donne la carte.
  assert.equal(
    quotesName(
      'Quelle épidémie fut identifiée pour la première fois en 1976 près de la rivière Ebola ?',
      'La maladie à virus Ebola',
      'La fièvre jaune', 'La fièvre de Lassa', 'La maladie de Marburg',
    ),
    true,
  );
});

test('a proper name shared with another option gives nothing away', () => {
  assert.equal(
    quotesName(
      'Quelle maladie doit son nom à la ville allemande de Marburg ?',
      'La maladie de Marburg',
      'La maladie à virus Ebola', 'La fièvre de Marburg-Lassa', 'La variole de Marburg',
    ),
    false,
  );
});

test('a shared first name does not designate a person', () => {
  // « Daniel » ne distingue rien : c'est le nom de famille qui nomme la réponse.
  assert.equal(
    quotesName(
      'Qui joue Daniel Plainview dans There Will Be Blood ?',
      'Daniel Day-Lewis',
      'Joaquin Phoenix', 'Christian Bale', 'Sean Penn',
    ),
    false,
  );
});

test('naming the work whose content is asked about stays allowed', () => {
  assert.equal(
    quotesName(
      'Que devient Simba à la fin du dessin animé de Disney ?',
      'Le roi de la Terre des Lions',
      'Un explorateur', 'Un chasseur', 'Un chef hyène',
    ),
    false,
  );
});

test('a capital at the start of a sentence is not a proper name', () => {
  // « Quand » ouvre l'énoncé comme la réponse : ce n'est pas un nom propre.
  assert.equal(
    quotesName(
      'Quand un arbitre accorde-t-il un avantage au football ?',
      'Quand poursuivre le jeu profite à l’équipe lésée',
      'Quand la faute est involontaire', 'Quand le ballon sort', 'Quand le gardien sort de sa surface',
    ),
    false,
  );
});

test('the editorial contract rejects a card that quotes its answer’s name', () => {
  assert.equal(
    editorialRejectionReason({
      question: 'Quelle épidémie fut identifiée en 1976 près de la rivière Ebola ?',
      options: ['La maladie à virus Ebola', 'La fièvre jaune', 'La fièvre de Lassa', 'La maladie de Marburg'],
      correctAnswerIndex: 0,
      explanation: 'Deux flambées presque simultanées eurent lieu au Soudan et au Zaïre en 1976.',
    }),
    'nom propre de la bonne réponse cité dans l’énoncé',
  );
});

// --- Formats variés : Vrai/Faux et questions ouvertes ----------------------

test('a well-formed true/false card is accepted', () => {
  assert.equal(
    editorialRejectionReason({
      format: 'boolean',
      question: 'Un ver de terre possède plusieurs cœurs.',
      options: ['Vrai', 'Faux'],
      correctAnswerIndex: 0,
      explanation: 'Il en a cinq paires, de simples anneaux musculaires qui poussent le sang.',
    }),
    null,
  );
});

test('a true/false card must offer exactly Vrai and Faux', () => {
  assert.equal(
    editorialRejectionReason({
      format: 'boolean',
      question: 'Un ver de terre possède plusieurs cœurs.',
      options: ['Oui', 'Non'],
      correctAnswerIndex: 0,
      explanation: 'Il en a cinq paires qui poussent le sang dans ses vaisseaux.',
    }),
    'les deux choix doivent être « Vrai » et « Faux »',
  );
});

test('a well-formed open card is accepted', () => {
  assert.equal(
    editorialRejectionReason({
      format: 'open',
      question: 'Comment nomme-t-on la peur des hauteurs ?',
      options: [],
      correctAnswerIndex: 0,
      answer: 'L’acrophobie',
      explanation: 'À ne pas confondre avec l’agoraphobie, la peur des espaces ouverts.',
    }),
    null,
  );
});

test('an open card whose answer appears in the question is rejected', () => {
  assert.equal(
    editorialRejectionReason({
      format: 'open',
      question: 'Quelle est la capitale, Paris, de la France ?',
      options: [],
      correctAnswerIndex: 0,
      answer: 'Paris',
      explanation: 'Elle est traversée par la Seine et compte plus de deux millions d’habitants.',
    }),
    'réponse révélée dans l’énoncé',
  );
});

test('an open card may not carry options', () => {
  assert.equal(
    editorialRejectionReason({
      format: 'open',
      question: 'Comment nomme-t-on la peur des hauteurs ?',
      options: ['L’acrophobie', 'L’agoraphobie'],
      correctAnswerIndex: 0,
      answer: 'L’acrophobie',
      explanation: 'À ne pas confondre avec l’agoraphobie, la peur des espaces ouverts.',
    }),
    'une carte ouverte n’a aucune proposition',
  );
});

// --- Contrat éditorial du niveau ado ----------------------------------------
// Les deux défauts qui rendaient le niveau ado injouable pour un enfant de dix
// ans : la carte sans aucun chemin de raisonnement.

test('four neighbouring years are recognised as a coin toss', () => {
  assert.equal(isBareYearCard('En quelle année la guerre a-t-elle éclaté ?', ['1914', '1905', '1912', '1918']), true);
  assert.equal(isBareYearCard('En quelle année est sorti le premier Star Wars ?', ['1977', '1983', '1971', '1985']), true);
  // Un préfixe et trois chiffres ne déguisent pas la devinette.
  assert.equal(isBareYearCard('En quelle année l’Empire romain d’Occident s’est-il effondré ?', ['En 395', 'En 800', 'En 1453', 'En 476']), true);
});

test('a numeric answer that is not a year stays allowed', () => {
  // « Combien d'os compte le squelette ? » garde toute sa place : l'ordre de
  // grandeur se raisonne, contrairement à deux millésimes voisins.
  assert.equal(isBareYearCard('Combien d’os compte le squelette ?', ['206', '150', '312', '98']), false);
  assert.equal(isBareYearCard('Combien de cavités compte le cœur ?', ['Quatre', 'Deux', 'Trois', 'Six']), false);
  // C'est l'énoncé qui décide : ces nombres ne sont pas des millésimes.
  assert.equal(isBareYearCard('Quel est le matricule de James Bond ?', ['001', '700', '070', '007']), false);
  assert.equal(isBareYearCard('Aux fléchettes, à combien de points commence une partie ?', ['501', '1000', '300', '100']), false);
});

test('four person names behind a “who” prompt are a name lottery', () => {
  assert.equal(
    isPersonNameLotteryCard(
      'Quelle infirmière britannique a fondé les soins infirmiers modernes ?',
      ['Florence Nightingale', 'Clara Barton', 'Edith Cavell', 'Marie Curie'],
    ),
    true,
  );
});

test('a card that asks about the work rather than the name is not a lottery', () => {
  // La reprise du niveau ado repose entièrement sur ce basculement : le nom
  // passe dans l'énoncé, la question porte sur ce que l'on peut déduire.
  assert.equal(
    isPersonNameLotteryCard(
      'Pour quel vol Jean Valjean est-il envoyé au bagne, au début des Misérables ?',
      ['Un morceau de pain', 'Un cheval', 'Une bourse d’or', 'Une paire de chandeliers'],
    ),
    false,
  );
  // Un énoncé qui ne réclame pas de personne échappe à la règle, même si ses
  // options sont des noms propres : « Dans quelle maison de Poudlard… ? ».
  assert.equal(
    isPersonNameLotteryCard(
      'Dans quelle maison de Poudlard Harry Potter est-il réparti ?',
      ['Gryffondor', 'Serpentard', 'Poufsouffle', 'Serdaigle'],
    ),
    false,
  );
});

test('a bare attribution question is the purest lottery', () => {
  assert.equal(
    isAttributionLotteryCard(
      'Qui a composé l’opéra La Flûte enchantée ?',
      ['Mozart', 'Beethoven', 'Verdi', 'Wagner'],
    ),
    true,
  );
});

test('an accented participle still matches', () => {
  // « \b » est ASCII : après le « é » de « composé » ou « réalisé », JavaScript ne
  // voit aucune frontière de mot, et la règle ne matchait plus aucun participe
  // accentué. Ce test verrouille la borne de remplacement.
  assert.equal(
    isAttributionLotteryCard('Qui a réalisé Avatar et Titanic ?',
      ['James Cameron', 'Peter Jackson', 'Steven Spielberg', 'Christopher Nolan']),
    true,
  );
  assert.equal(
    isAttributionLotteryCard('Qui a créé la saga Star Wars ?',
      ['George Lucas', 'Ridley Scott', 'James Cameron', 'Steven Spielberg']),
    true,
  );
});

test('“la peintre Frida Kahlo” is not an attribution question', () => {
  // Sans borne à droite, « la peintre » contenait « a peint ».
  assert.equal(
    isAttributionLotteryCard(
      'De quel pays était originaire la peintre Frida Kahlo, célèbre pour ses autoportraits ?',
      ['Le Mexique', 'L’Espagne', 'L’Argentine', 'Le Brésil'],
    ),
    false,
  );
});

test('a described answer is spared: the description is the reasoning path', () => {
  // Ces cartes gardent quatre noms propres, mais l'énoncé décrit sa réponse : on
  // peut raisonner. Les convertir appauvrirait le jeu.
  assert.equal(
    isAttributionLotteryCard('Quel dieu grec règne sur les mers, armé de son trident ?',
      ['Poséidon', 'Arès', 'Héphaïstos', 'Dionysos']),
    false,
  );
  assert.equal(
    isAttributionLotteryCard('Quel personnage de Nintendo est un plombier moustachu en salopette ?',
      ['Mario', 'Kirby', 'Donkey Kong', 'Yoshi']),
    false,
  );
});

test('a relative “qui a” is not an interrogative one', () => {
  // « la danse qui a donné son nom au Boléro » ne réclame pas un nom de personne.
  assert.equal(
    isPersonNameLotteryCard(
      'De quel pays vient la danse qui a donné son nom au Boléro de Ravel ?',
      ['L’Espagne', 'L’Italie', 'La Russie', 'Le Brésil'],
    ),
    false,
  );
});

// --- Un fait déjà posé, que la clé « catégorie + bonne réponse » ne voit pas ---
// L'audit dédoublonne les cartes adultes par leur bonne réponse. Une carte
// Vrai/Faux répond « Vrai » : deux affirmations n'entrent donc jamais en
// collision de cette façon, et une carte pouvait reposer un fait déjà posé par un
// QCM. La comparaison qui les rattrape inclut la réponse révélée de chaque côté.

/** Ce que l'audit compare réellement : l'énoncé, réponse révélée comprise. */
const withAnswer = comparableFactText;

test('comparer les seuls énoncés laisse passer un fait reposé en vrai/faux', () => {
  // Le cas réel : une carte du pilote reposait l'année du passage à l'euro, déjà
  // posée par un QCM. Sans la réponse, les deux énoncés se ressemblent trop peu.
  const affirmation = 'Le franc belge a été remplacé par l’euro comme monnaie en 2002.';
  const qcm = 'En quelle année les pièces et billets en euros ont-ils remplacé le franc belge ?';
  assert.equal(paraphrasesSameFact(affirmation, qcm), false);
  assert.equal(
    paraphrasesSameFact(withAnswer(affirmation, 'Vrai'), withAnswer(qcm, '2002')),
    true,
    'la réponse révélée doit entrer dans la comparaison',
  );
});

test('une carte ouverte qui reformule un niveau plus bas est rattrapée', () => {
  // « Comment s'appelaient les longs bateaux des Vikings ? » existait au niveau
  // enfant ; le contrôle des niveaux ne compare que des textes identiques.
  const ouverte = 'Comment appelle-t-on les longs navires de guerre des Vikings ?';
  const enfant = 'Comment s’appelaient les longs bateaux des Vikings ?';
  assert.equal(
    paraphrasesSameFact(withAnswer(ouverte, 'Les drakkars'), withAnswer(enfant, 'Les drakkars')),
    true,
  );
});

test('deux affirmations sur des faits voisins mais distincts passent', () => {
  // Le détecteur doit rester utilisable : ces deux cartes coexistent en partie
  // sans que personne n'ait l'impression de répondre deux fois à la même chose.
  assert.equal(
    paraphrasesSameFact(
      withAnswer('Un ver de terre possède plusieurs cœurs.', 'Vrai'),
      withAnswer('Quel animal possède trois cœurs ?', 'La pieuvre'),
    ),
    false,
  );
  assert.equal(
    paraphrasesSameFact(
      withAnswer('Le tout premier film projeté par les frères Lumière montrait l’arrivée d’un train en gare.', 'Faux'),
      withAnswer('À l’époque du muet, les films étaient toujours projetés en silence.', 'Faux'),
    ),
    false,
  );
});

// --- Même moule contre même fait --------------------------------------------
// Le premier jet du rapprochement désignait cent trois cartes à réécrire. Après
// examen, la moitié étaient des cartes saines qui partageaient seulement un moule
// d'énoncé : les réécrire aurait appauvri le jeu. D'où la condition sur la réponse.

/** Raccourci : une carte telle que `restatesSameFact` la reçoit. */
function card(question: string, answer: string, isBoolean = false) {
  return { question, answer, isBoolean };
}

test('deux cartes du même moule mais de faits distincts ne sont pas des doublons', () => {
  assert.equal(
    restatesSameFact(
      card('Comment s’appelle le bébé de la vache ?', 'Le veau'),
      card('Comment s’appelle le bébé de la grenouille ?', 'Le têtard'),
    ),
    false,
  );
  assert.equal(
    restatesSameFact(
      card('Quelle unité mesure une force ?', 'Le newton'),
      card('Quelle unité mesure une pression ?', 'Le pascal'),
    ),
    false,
  );
});

test('le même fait posé dans les deux sens est reconnu', () => {
  assert.equal(
    restatesSameFact(
      card('Qui découvrit la tombe de Toutânkhamon en 1922 ?', 'Howard Carter'),
      card('Quel pharaon possède la tombe découverte presque intacte par Howard Carter ?', 'Toutânkhamon'),
    ),
    true,
  );
});

test('deux formulations d’un même fait, écrites dans deux lots, sont reconnues', () => {
  assert.equal(
    restatesSameFact(
      card('Quel détroit sépare la Sicile de la péninsule italienne ?', 'Le détroit de Messine'),
      card('Quel détroit sépare la Sicile de la péninsule italienne ?', 'Messine'),
    ),
    true,
  );
});

test('une affirmation vrai/faux qui repose le fait d’un QCM est reconnue', () => {
  // « Vrai » ne dit rien du fait : c'est la citation de la réponse du QCM dans
  // l'affirmation qui les rapproche.
  assert.equal(
    restatesSameFact(
      card('Le franc belge a été remplacé par l’euro comme monnaie en 2002.', 'Vrai', true),
      card('En quelle année les pièces et billets en euros ont-ils remplacé le franc belge ?', '2002'),
    ),
    true,
  );
});

test('deux affirmations vrai/faux ne se confondent pas par leur réponse', () => {
  // Sans la garde sur le format, toutes les cartes « Vrai » d'une catégorie
  // deviendraient des doublons les unes des autres.
  assert.equal(
    restatesSameFact(
      card('Un ver de terre possède plusieurs cœurs.', 'Vrai', true),
      card('Le diamant et le graphite sont faits du même élément chimique.', 'Vrai', true),
    ),
    false,
  );
});

test('deux quantités ne se rapprochent pas parce qu’un nombre traîne dans l’énoncé', () => {
  // Le cas réel : « rugby à sept » contient bel et bien « sept », la réponse de la
  // carte du handball. Sans cette garde, toutes les cartes qui comptent des joueurs
  // devenaient des doublons les unes des autres.
  assert.equal(
    restatesSameFact(
      card('Combien de joueurs une équipe de handball aligne-t-elle, gardien compris ?', 'Sept'),
      card('Combien de joueurs compte une équipe de rugby à sept sur le terrain ?', '7'),
    ),
    false,
  );
  // Et deux réponses chiffrées différentes ne se confondent pas par leur unité.
  assert.equal(
    restatesSameFact(
      card('Combien de temps dure une mi-temps au football ?', '45 minutes'),
      card('Combien de temps dure un match de handball ?', 'Deux mi-temps de 30 minutes'),
    ),
    false,
  );
});

test('un même nombre en réponse à deux questions différentes n’est pas un doublon', () => {
  // « Trois régions » et « trois langues » : c'est l'énoncé qui porte le fait, pas
  // la réponse. Le premier jet du détecteur les confondait.
  assert.equal(
    restatesSameFact(
      card('Combien de régions la Belgique fédérale compte-t-elle ?', 'Trois'),
      card('Combien de langues officielles la Belgique compte-t-elle ?', 'Trois'),
    ),
    false,
  );
});

test('« Le détroit de Messine » et « Messine » désignent la même chose', () => {
  // Deux fois le même énoncé, mot pour mot, que ni le dédoublonnage par la réponse
  // ni celui par le couple énoncé-options ne voyaient.
  assert.equal(answersDesignateSameThing('Le détroit de Messine', 'Messine'), true);
  // Mais le tennis et le tennis de table restent deux sports.
  assert.equal(answersDesignateSameThing('Le tennis', 'Le tennis de table'), false);
});

/** Raccourci de lecture : la bonne réponse est toujours le premier choix. */
function donneLeNombre(question: string, correct: string, ...wrong: [string, string, string]): boolean {
  return promptGivesAwayQuantity(question, [correct, ...wrong], 0);
}

test('un nombre écrit en lettres dans l’énoncé donne la réponse', () => {
  // Signalé en partie : « la réponse est dans la question ».
  assert.equal(
    donneLeNombre(
      'Combien de joueurs compte une équipe de rugby à sept sur le terrain ?',
      '7', '9', '5', '10',
    ),
    true,
  );
});

test('un chiffre romain dans l’énoncé donne la réponse aussi', () => {
  assert.equal(
    donneLeNombre(
      'Combien de joueurs compte une équipe de rugby à XV sur le terrain ?',
      '15', '11', '13', '18',
    ),
    true,
  );
});

test('un chiffre dans le nom de l’épreuve ou du jeu donne la réponse', () => {
  assert.equal(
    donneLeNombre(
      'Combien de coureurs composent une équipe de relais 4 x 100 mètres ?',
      '4', '3', '5', '8',
    ),
    true,
  );
  assert.equal(
    donneLeNombre(
      'Au jeu Puissance 4, combien de jetons faut-il aligner pour gagner ?',
      '4', '3', '5', '6',
    ),
    true,
  );
});

test('un accord au pluriel n’est pas la quantité demandée', () => {
  // « Que sont deux isomères ? » ne demande aucun nombre : ce « deux » s'accorde
  // avec le sujet. Sans la condition « l'énoncé demande un nombre », le premier
  // jet du détecteur rejetait cette carte, qui est saine.
  assert.equal(
    donneLeNombre(
      'Que sont deux isomères ?',
      'Deux molécules de même formule brute et de structure différente',
      'Deux atomes de masses différentes',
      'Deux formes cristallines du même métal',
      'Deux ions de charges opposées',
    ),
    false,
  );
});

test('l’article « une » dans l’énoncé ne vaut pas la réponse « 1 »', () => {
  // Sinon toute carte « Combien de … une équipe … ? » dont la réponse est 1
  // serait rejetée pour un article.
  assert.equal(
    donneLeNombre(
      'Combien de médailles d’or une nation peut-elle gagner dans une finale ?',
      '1', '2', '3', '4',
    ),
    false,
  );
});

test('un millésime dans l’énoncé ne se confond pas avec ses chiffres', () => {
  // « 1998 » vaut mille neuf cent quatre-vingt-dix-huit, pas 8 : les séparateurs
  // de milliers font partie du nombre, et « 1 000 » ne vaut pas 1.
  assert.equal(
    donneLeNombre(
      'Combien de buts la Belgique a-t-elle marqués lors du Mondial 1998 ?',
      '8', '4', '6', '12',
    ),
    false,
  );
  assert.equal(
    donneLeNombre(
      'Combien de mètres compte un kilomètre, sachant qu’il en faut 1 000 ?',
      '1 000', '100', '10 000', '500',
    ),
    true,
  );
});

test('une quantité déduite, absente de l’énoncé, reste une bonne carte', () => {
  assert.equal(
    donneLeNombre('Combien de côtés compte un octogone ?', '8', '6', '10', '12'),
    false,
  );
});

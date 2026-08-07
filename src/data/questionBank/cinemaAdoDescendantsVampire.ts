import { Question, QuestionFormat } from '../../types';

/**
 * Vingt-sept cartes ado sur les cinq films Descendants et sur Vampire Diaries.
 *
 * Demandées par la fille du propriétaire du projet, et **ajoutées** : aucune carte
 * existante ne cède sa place. C'est ce qui a fait passer le volume ado de plafond
 * à plancher — voir l'ADR 0006.
 *
 * Trois formats mélangés, comme demandé : dix QCM, neuf Vrai/Faux et huit cartes
 * ouvertes. Le mélange n'est pas décoratif : une carte ouverte se joue à voix haute
 * et se juge, un Vrai/Faux relance la table entière, et l'alternance évite que huit
 * cartes de suite se ressemblent — c'est le critère « variété de format » de la note
 * de fun.
 *
 * Un fan répond de mémoire, et c'est le but. Mais chaque énoncé donne aussi une
 * prise à qui n'a rien vu : « quelle sorcière des mers » désigne Ursula sans la
 * nommer, « quel dieu des Enfers » désigne Hadès, et le journal intime d'Elena
 * donne son titre à la série. C'est la règle de l'énoncé qui décrit sa réponse.
 *
 * Chaque fait est vérifié — y compris le cinquième film, sorti en juillet 2026 —
 * parce qu'une carte fausse est le seul défaut que l'audit ne sait pas attraper.
 * Les deux faits déjà posés par le pool adulte, l'adaptation de romans et Mystic
 * Falls, ne sont pas reposés ici : chaque carte pose un fait qui n'appartient
 * qu'à elle.
 */

type QcmCard = {
  format: 'mcq';
  question: string;
  /** La bonne réponse d'abord ; sa position est répartie ensuite. */
  options: [string, string, string, string];
  explanation: string;
};

type BooleanCard = {
  format: 'boolean';
  question: string;
  isTrue: boolean;
  explanation: string;
};

type OpenCard = {
  format: 'open';
  question: string;
  answer: string;
  explanation: string;
};

type AdoCard = QcmCard | BooleanCard | OpenCard;

const DESCENDANTS: AdoCard[] = [
  // --- Le premier film, et le monde de la saga -------------------------------
  {
    format: 'mcq',
    question: 'Dans Descendants, sur quelle île le royaume d’Auradon a-t-il enfermé les grands méchants de Disney ?',
    options: ['L’Île de l’Oubli', 'L’Île du Crâne', 'L’Île de la Tortue', 'L’Île au Trésor'],
    explanation: 'C’est la Bête qui l’a créée en devenant roi : les méchants y sont enfermés derrière une barrière magique, avec leurs enfants nés après eux.',
  },
  {
    format: 'boolean',
    question: 'Dans Descendants, le prince Ben est le fils de Belle et de la Bête.',
    isTrue: true,
    explanation: 'C’est son tout premier décret de futur roi qui lance l’histoire : il invite quatre enfants de méchants à venir étudier à Auradon.',
  },
  {
    format: 'boolean',
    question: 'Sur l’Île de l’Oubli, la magie fonctionne comme partout ailleurs.',
    isTrue: false,
    explanation: 'C’est justement le sens de leur exil : privés de magie, les méchants ne sont plus dangereux, et leurs enfants grandissent sans le moindre pouvoir.',
  },
  {
    format: 'open',
    question: 'Dans Descendants, quel objet magique Maléfique ordonne-t-elle à sa fille de voler pour briser la barrière ?',
    answer: 'La baguette de la Fée Marraine',
    explanation: 'Mal n’y parvient pas, et le film se termine sur son choix inverse : elle renonce au sort qu’elle avait préparé pour son propre bal.',
  },
  {
    format: 'open',
    question: 'Dans Descendants, de quel grand vizir voleur des Mille et Une Nuits Jay est-il le fils ?',
    answer: 'Jafar',
    explanation: 'Jay tient de son père la manie de tout chaparder, et c’est au tournoi d’Auradon qu’il apprend enfin à jouer pour une équipe.',
  },
  {
    format: 'open',
    question: 'Dans Descendants, de quelle voleuse de chiots dalmatiens Carlos est-il le fils ?',
    answer: 'Cruella d’Enfer',
    explanation: 'Élevé dans la terreur des chiens par sa mère, Carlos se lie d’amitié avec Dude, le chien du lycée : c’est sa manière de s’émanciper.',
  },
  {
    format: 'boolean',
    question: 'Les quatre enfants de méchants du premier film viennent à Auradon pour y suivre les cours d’un lycée.',
    isTrue: true,
    explanation: 'Auradon Prep occupe l’ancien château de la Bête, et les cours de « bonté » y sont obligatoires pour les nouveaux venus.',
  },

  // --- Descendants 2 ---------------------------------------------------------
  {
    format: 'mcq',
    question: 'Dans Descendants 2, de quelle sorcière des mers la pirate Uma est-elle la fille ?',
    options: ['Ursula', 'Maléfique', 'Cruella d’Enfer', 'La Méchante Reine'],
    explanation: 'Uma commande la bande de pirates du port de l’Île de l’Oubli, et c’est sa rivalité avec Mal qui mène tout le film.',
  },
  {
    format: 'open',
    question: 'Dans Descendants 2, de quel pirate ennemi juré de Peter Pan Harry, le bras droit d’Uma, est-il le fils ?',
    answer: 'Le capitaine Crochet',
    explanation: 'Gil complète le trio de pirates : il est, lui, le fils de Gaston, le prétendant éconduit de La Belle et la Bête.',
  },

  // --- Descendants 3 ---------------------------------------------------------
  {
    format: 'mcq',
    question: 'Dans Descendants 3, quel dieu des Enfers se révèle être le père de Mal ?',
    options: ['Hadès', 'Zeus', 'Poséidon', 'Cronos'],
    explanation: 'C’est sa braise magique qui permet de réveiller Auradon du sort jeté à la fin du film.',
  },
  {
    format: 'boolean',
    question: 'Dans Descendants 3, la méchante du film est une princesse d’Auradon, et non une enfant de l’Île de l’Oubli.',
    isTrue: true,
    explanation: 'Audrey, la fille d’Aurore, s’empare du sceptre de Maléfique après avoir été délaissée : le film renverse ainsi toute la logique de la saga.',
  },

  // --- Le quatrième film -----------------------------------------------------
  {
    format: 'mcq',
    question: 'Dans le quatrième film de Descendants, quel objet Red et Chloé utilisent-elles pour remonter dans le temps ?',
    options: ['Une montre à gousset', 'Un miroir magique', 'Une clé d’or', 'Un chapeau haut-de-forme'],
    explanation: 'Elles visent l’époque du coup d’État de la Reine de Cœur et remontent bien plus loin : elles tombent sur leurs propres mères adolescentes.',
  },
  {
    format: 'open',
    question: 'Dans le quatrième film de Descendants, comment s’appelle la fille de Cendrillon, meilleure amie de Red ?',
    answer: 'Chloé',
    explanation: 'Tout les oppose au départ : Chloé est l’élève modèle d’Auradon, Red la fille rebelle d’une reine que tout le monde redoute.',
  },

  // --- Le cinquième film -----------------------------------------------------
  {
    format: 'mcq',
    question: 'Dans le cinquième film de Descendants, dans quel monde Red et Chloé partent-elles délivrer sa mère la Reine de Cœur ?',
    options: ['Le Pays des merveilles', 'Le royaume d’Arendelle', 'La forêt de Sherwood', 'Le pays imaginaire'],
    explanation: 'Sorti en juillet 2026, ce cinquième film introduit un nouveau méchant : Maddox, le fils du Chapelier fou.',
  },
  {
    format: 'boolean',
    question: 'Le cinquième film de Descendants est sorti plus de dix ans après le premier.',
    isTrue: true,
    explanation: 'Le premier film date de 2015 et le cinquième de 2026 : les enfants qui ont découvert la saga à sa sortie ont l’âge de leurs héros aujourd’hui.',
  },
];

const VAMPIRE_DIARIES: AdoCard[] = [
  {
    format: 'mcq',
    question: 'Dans Vampire Diaries, quelle plante empêche un vampire d’hypnotiser un humain ?',
    options: ['La verveine', 'La lavande', 'L’aconit', 'Le gui'],
    explanation: 'Les habitants en glissent dans leur thé ou en portent un brin dans un bijou : c’est ainsi qu’ils se protègent d’être manipulés à leur insu.',
  },
  {
    format: 'mcq',
    question: 'Dans Vampire Diaries, quel bijou serti de lapis-lazuli permet à un vampire de sortir en plein soleil ?',
    options: ['Une bague', 'Un collier', 'Un bracelet', 'Une broche'],
    explanation: 'C’est une sorcière qui l’enchante, et le vampire ne peut plus s’en séparer : la lui retirer revient à le condamner au lever du jour.',
  },
  {
    format: 'mcq',
    question: 'Dans Vampire Diaries, quel mot désigne Katherine, qui a exactement le même visage qu’Elena sans être de sa famille ?',
    options: ['Un doppelgänger', 'Un clone', 'Une jumelle', 'Un fantôme'],
    explanation: 'Le mot vient de l’allemand et signifie « double qui marche ». La même actrice, Nina Dobrev, tient donc les deux rôles.',
  },
  {
    format: 'mcq',
    question: 'Combien de saisons compte la série Vampire Diaries ?',
    options: ['8 saisons', '5 saisons', '11 saisons', '3 saisons'],
    explanation: 'Cent soixante et onze épisodes en tout, diffusés de 2009 à 2017 : la série a duré plus longtemps que la scolarité de ses héros.',
  },
  {
    format: 'mcq',
    question: 'Quelle série dérivée de Vampire Diaries suit la famille Mikaelson à La Nouvelle-Orléans ?',
    options: ['The Originals', 'True Blood', 'Teen Wolf', 'Supernatural'],
    explanation: 'Les Mikaelson sont les tout premiers vampires de l’histoire, d’où le titre : la série leur consacre cinq saisons, de 2013 à 2018.',
  },
  {
    format: 'boolean',
    question: 'Dans Vampire Diaries, Stefan et Damon Salvatore sont deux frères.',
    isTrue: true,
    explanation: 'Ils ont été transformés la même nuit, en 1864, et se disputent depuis lors : c’est le moteur de toute la série.',
  },
  {
    format: 'boolean',
    question: 'Dans Vampire Diaries, Bonnie, l’amie d’enfance d’Elena, est une sorcière.',
    isTrue: true,
    explanation: 'Elle tient ses pouvoirs de sa grand-mère, et c’est presque toujours elle qui paie le prix des sortilèges que les autres réclament.',
  },
  {
    format: 'boolean',
    question: 'Dans Vampire Diaries, un vampire peut entrer chez un humain sans y avoir été invité.',
    isTrue: false,
    explanation: 'C’est la faille dont les personnages se servent le plus souvent : une maison non invitée est un refuge, jusqu’à ce que quelqu’un se trompe.',
  },
  {
    format: 'boolean',
    question: 'Dans Vampire Diaries, le personnage de Klaus est à la fois vampire et loup-garou.',
    isTrue: true,
    explanation: 'On l’appelle un hybride, et briser la malédiction qui l’empêchait de l’être occupe toute une saison.',
  },
  {
    format: 'open',
    question: 'Dans Vampire Diaries, quel objet Elena tient-elle depuis la mort de ses parents, et qui donne son titre à la série ?',
    answer: 'Son journal intime',
    explanation: 'Le titre est au pluriel parce que Stefan tient le sien depuis 1864 : les deux voix se répondent d’un siècle et demi de distance.',
  },
  {
    format: 'open',
    question: 'Quelle seconde série dérivée suit Hope, la fille de Klaus, dans un pensionnat pour jeunes êtres surnaturels ?',
    answer: 'Legacies',
    explanation: 'Hope est à la fois vampire, loup-garou et sorcière — la première « tribride » —, et le pensionnat porte le nom des frères Salvatore.',
  },
  {
    format: 'open',
    question: 'Dans Vampire Diaries, quelle est la seule arme capable de tuer définitivement un vampire Originel ?',
    answer: 'Un pieu taillé dans du chêne blanc',
    explanation: 'L’arbre est unique et a été brûlé : chaque morceau retrouvé relance la course, puisqu’il n’en existe qu’un nombre fini au monde.',
  },
];

/** Assemble les cartes en questions, en répartissant la position des bonnes réponses. */
function build(prefix: string, cards: AdoCard[]): Question[] {
  let qcmSeen = 0;
  return cards.map((card, index) => {
    const base = {
      id: `${prefix}_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'cinema' as const,
      difficulty: 'ado' as const,
      explanation: card.explanation,
      question: card.question,
      format: card.format as QuestionFormat,
    };

    if (card.format === 'boolean') {
      return { ...base, options: ['Vrai', 'Faux'], correctAnswerIndex: card.isTrue ? 0 : 1 };
    }
    if (card.format === 'open') {
      return { ...base, options: [], correctAnswerIndex: 0, answer: card.answer };
    }

    // Les bonnes réponses des QCM tournent entre A, B, C et D : une passe entière
    // qui les concentrerait au même rang se remarquerait sur une carte imprimée.
    const rotation = qcmSeen % 4;
    qcmSeen += 1;
    const { options } = card;
    return {
      ...base,
      options: options.map(
        (_, position) => options[(position + options.length - rotation) % options.length],
      ),
      correctAnswerIndex: rotation,
    };
  });
}

export const CINEMA_ADO_DESCENDANTS_VAMPIRE: Question[] = [
  ...build('cin_ado_descendants', DESCENDANTS),
  ...build('cin_ado_vampire', VAMPIRE_DIARIES),
];

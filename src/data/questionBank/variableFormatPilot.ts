import { Question } from '../../types';

/**
 * Pilote des formats variés — Vrai/Faux et questions ouvertes.
 *
 * Ces cartes vivent à côté des 400 QCM relues par catégorie : elles ne comptent
 * pas dans ce quota et ne sont pas soumises à l'équilibre A/B/C/D, qui n'a de
 * sens que pour quatre propositions. Deux formats coexistent ici :
 *
 * - `boolean` : une affirmation à trancher, deux choix « Vrai » / « Faux ». Le
 *   format débloque les faits sans distracteur crédible et abaisse le plafond.
 * - `open` : aucune proposition ; le lecteur révèle la réponse puis juge la
 *   réponse orale. Le joueur soumet 0 (réussi) ou -1 (raté), si bien que
 *   l'évaluation serveur reste identique aux autres formats. C'est le format le
 *   plus proche du Trivial Pursuit d'origine, réservé au bon sens du lecteur.
 *
 * Toutes sont de niveau adulte : c'est là que le besoin de varété était le plus
 * fort, la banque QCM y ayant épuisé les faits grand public.
 */
export const VARIABLE_FORMAT_PILOT: Question[] = [
  // ---- Vrai / Faux ---------------------------------------------------------
  {
    id: 'var_boolean_001',
    categoryId: 'sciences',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'Un ver de terre possède plusieurs cœurs.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 0,
    explanation: 'Il en a cinq paires : de simples anneaux musculaires qui poussent le sang dans ses vaisseaux.',
  },
  {
    id: 'var_boolean_002',
    categoryId: 'histoire',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'Napoléon Bonaparte était particulièrement petit pour son époque.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 1,
    explanation: 'Il mesurait environ 1,68 m, dans la moyenne française d’alors ; la légende vient d’unités anglaises mal converties.',
  },
  {
    id: 'var_boolean_003',
    categoryId: 'sports',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'La médaille d’or olympique est entièrement faite d’or.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 1,
    explanation: 'Elle est en argent plaqué d’environ six grammes d’or depuis les Jeux de Stockholm en 1912.',
  },
  {
    id: 'var_boolean_004',
    categoryId: 'geographie',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'La Russie s’étend sur onze fuseaux horaires.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 0,
    explanation: 'D’ouest en est, plus de neuf heures séparent Kaliningrad, sur la Baltique, du Kamtchatka, sur le Pacifique.',
  },
  {
    id: 'var_boolean_005',
    categoryId: 'cinema',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'À l’époque du muet, les films étaient toujours projetés en silence.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 1,
    explanation: 'Un pianiste, parfois tout un orchestre, accompagnait la projection en direct dans la salle.',
  },
  {
    id: 'var_boolean_006',
    categoryId: 'popculture',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'Le jeu vidéo Tetris a été inventé en Union soviétique.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 0,
    explanation: 'Alexeï Pajitnov l’a conçu à Moscou en 1984 sur un ordinateur Electronika 60.',
  },
  {
    id: 'var_boolean_007',
    categoryId: 'art',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'Vincent van Gogh n’a vendu qu’un seul tableau de son vivant.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 0,
    explanation: '« La Vigne rouge » passe pour sa seule vente, alors qu’il peignit plus de deux mille œuvres.',
  },
  {
    id: 'var_boolean_008',
    categoryId: 'gastronomie',
    difficulty: 'adulte',
    format: 'boolean',
    question: 'La cacahuète est botaniquement une noix.',
    options: ['Vrai', 'Faux'],
    correctAnswerIndex: 1,
    explanation: 'C’est une légumineuse, cousine du pois et du haricot ; ses gousses mûrissent sous la terre.',
  },

  // ---- Questions ouvertes --------------------------------------------------
  {
    id: 'var_open_001',
    categoryId: 'sciences',
    difficulty: 'adulte',
    format: 'open',
    question: 'Comment nomme-t-on la peur des hauteurs ?',
    options: [],
    correctAnswerIndex: 0,
    answer: 'L’acrophobie',
    explanation: 'À ne pas confondre avec l’agoraphobie, la peur des espaces ouverts et des foules.',
  },
  {
    id: 'var_open_002',
    categoryId: 'geographie',
    difficulty: 'adulte',
    format: 'open',
    question: 'Quelle mer sans côtes est célèbre pour ses algues flottantes ?',
    options: [],
    correctAnswerIndex: 0,
    answer: 'La mer des Sargasses',
    explanation: 'Bornée par des courants et non par des terres, elle piège des radeaux de sargasses au milieu de l’Atlantique.',
  },
  {
    id: 'var_open_003',
    categoryId: 'gastronomie',
    difficulty: 'adulte',
    format: 'open',
    question: 'Quel condiment jaune doit son nom à une ville de Bourgogne ?',
    options: [],
    correctAnswerIndex: 0,
    answer: 'La moutarde',
    explanation: 'Dijon en fit sa spécialité dès le Moyen Âge ; le verjus y remplace souvent le vinaigre.',
  },
  {
    id: 'var_open_004',
    categoryId: 'art',
    difficulty: 'adulte',
    format: 'open',
    question: 'Comment appelle-t-on l’art de la belle écriture tracée à la main ?',
    options: [],
    correctAnswerIndex: 0,
    answer: 'La calligraphie',
    explanation: 'Du grec « kallos », le beau, et « graphein », écrire ; elle est un art majeur en Chine et dans le monde arabe.',
  },
  {
    id: 'var_open_005',
    categoryId: 'histoire',
    difficulty: 'adulte',
    format: 'open',
    question: 'Comment appelle-t-on les longs navires de guerre des Vikings ?',
    options: [],
    correctAnswerIndex: 0,
    answer: 'Les drakkars',
    explanation: 'Légers et à faible tirant d’eau, ils remontaient les fleuves aussi bien qu’ils traversaient la haute mer.',
  },
  {
    id: 'var_open_006',
    categoryId: 'popculture',
    difficulty: 'adulte',
    format: 'open',
    question: 'Quel réseau social à l’oiseau bleu a été rebaptisé « X » en 2023 ?',
    options: [],
    correctAnswerIndex: 0,
    answer: 'Twitter',
    explanation: 'Racheté par Elon Musk en 2022, il a abandonné son logo d’oiseau l’année suivante.',
  },
];

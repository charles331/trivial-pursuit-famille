import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Vrai/Faux et questions ouvertes au niveau ado — quatre par catégorie.
 *
 * Les deux formats ont été adoptés en partie au niveau adulte, où ils notent dix
 * points de fun de plus que les QCM. La raison vaut encore davantage à dix ou
 * douze ans : le Vrai/Faux ramène l'inconnu à une affirmation qu'on peut peser, et
 * la carte ouverte se joue à l'oral, où la table souffle et discute au lieu de
 * cocher.
 *
 * Le volume ado est figé à 135 cartes par catégorie et l'audit le vérifie : on ne
 * peut donc pas en ajouter, seulement convertir. Les cibles ont été choisies parmi
 * les cartes les moins fun de chaque catégorie, et ce sont presque toutes des
 * loteries de quatre noms propres — « Qui a écrit Les Misérables ? » entre quatre
 * écrivains, « Qui a inventé l'imprimerie ? » entre quatre inventeurs. Le format
 * ouvert supprime la loterie : il n'y a plus rien à cocher au hasard, on sait le
 * nom ou on ne le sait pas, et le voisin peut souffler. Le Vrai/Faux, lui, remplace
 * quatre noms par une affirmation qui se raisonne.
 *
 * Quatre de ces conversions règlent en même temps un doublon : les cartes cinéma
 * reposaient un fait déjà posé par une autre carte ado, elles changent donc aussi
 * de sujet.
 */
const REWRITES: CardRewrite[] = [
  // --- Histoire -------------------------------------------------------------
  {
    id: 'his_258',
    format: 'open',
    question: 'Quel navire a conduit en Amérique, en 1620, les colons anglais dits Pères pèlerins ?',
    answer: 'Le Mayflower',
    explanation: 'Ils visaient la Virginie et ont abordé bien plus au nord, faute de savoir où ils étaient.',
  },
  {
    id: 'his_217',
    format: 'boolean',
    question: 'La Première Guerre mondiale a duré plus de quatre ans.',
    isTrue: true,
    explanation: 'Du 28 juillet 1914 au 11 novembre 1918 : quatre ans et trois mois, et près de dix millions de morts.',
  },
  {
    id: 'his_259',
    format: 'boolean',
    question: 'Thanksgiving se fête le même jour aux États-Unis et au Canada.',
    isTrue: false,
    explanation: 'Les Américains le célèbrent fin novembre, les Canadiens dès le début d’octobre : les récoltes y sont plus précoces.',
  },
  {
    id: 'his_189',
    format: 'open',
    question: 'Quel moine allemand a lancé la Réforme en placardant quatre-vingt-quinze thèses ?',
    answer: 'Martin Luther',
    explanation: 'Il a traduit la Bible en allemand, ce qui a beaucoup fait pour fixer cette langue écrite.',
  },

  // --- Géographie -----------------------------------------------------------
  {
    // Reposait aussi Stockholm, déjà demandé par geo_219 : le sujet change.
    id: 'geo_178',
    format: 'open',
    question: 'Comment appelle-t-on un bras de mer étroit et profond creusé autrefois par un glacier ?',
    answer: 'Un fjord',
    explanation: 'Le plus long de Norvège s’enfonce de deux cents kilomètres dans les terres.',
  },
  {
    id: 'geo_162',
    format: 'boolean',
    question: 'Le plus vaste État des États-Unis est le Texas.',
    isTrue: false,
    explanation: 'C’est l’Alaska, plus de deux fois plus grand, acheté à la Russie en 1867 pour une somme dérisoire.',
  },
  {
    id: 'geo_202',
    format: 'boolean',
    question: 'Le parc de Yellowstone est installé au-dessus d’un volcan.',
    isTrue: true,
    explanation: 'C’est ce réservoir de magma qui chauffe l’eau de ses geysers et de ses sources colorées.',
  },
  {
    id: 'geo_183',
    format: 'open',
    question: 'Comment appelle-t-on un pays entièrement entouré de terres, sans aucun accès à la mer ?',
    answer: 'Un pays enclavé',
    explanation: 'Il en existe une quarantaine, et deux sont même entourés d’un seul voisin.',
  },

  // --- Cinéma ---------------------------------------------------------------
  // Ces quatre cartes reposaient un fait déjà posé au même niveau : elles changent
  // de sujet en même temps que de forme.
  {
    id: 'cin_146',
    format: 'open',
    question: 'Quel objet magique décide de la maison des élèves à leur arrivée à Poudlard ?',
    answer: 'Le Choixpeau magique',
    explanation: 'Il tient compte de l’avis de l’élève : Harry lui demande de ne pas l’envoyer chez Serpentard.',
  },
  {
    id: 'cin_155',
    format: 'boolean',
    question: 'Les films Star Wars sont sortis au cinéma dans l’ordre de leur numérotation.',
    isTrue: false,
    explanation: 'La première trilogie projetée est celle des épisodes IV, V et VI ; les épisodes I à III ont suivi vingt ans plus tard.',
  },
  {
    id: 'cin_237',
    format: 'open',
    question: 'Quel personnage de Star Wars parle en inversant l’ordre des mots ?',
    answer: 'Yoda',
    explanation: 'Il n’apparaît que quelques minutes dans la trilogie d’origine, manipulé par un marionnettiste.',
  },
  {
    id: 'cin_250',
    format: 'boolean',
    question: 'Superman perd ses pouvoirs au contact d’une pierre venue de sa planète natale.',
    isTrue: true,
    explanation: 'La kryptonite a été inventée pour la radio, afin que l’acteur puisse prendre des vacances.',
  },

  // --- Sciences -------------------------------------------------------------
  {
    id: 'sci_ado_editorial_108',
    format: 'open',
    question: 'Qui a mis au point le premier vaccin contre la rage ?',
    answer: 'Louis Pasteur',
    explanation: 'Il l’a essayé en 1885 sur un enfant mordu par un chien, sans certitude sur l’issue.',
  },
  {
    id: 'sci_ado_editorial_115',
    format: 'open',
    question: 'Qui a mis au point en Europe l’imprimerie à caractères mobiles ?',
    answer: 'Johannes Gutenberg',
    explanation: 'Il s’est ruiné en imprimant sa Bible, et son associé a récupéré l’atelier.',
  },
  {
    id: 'sci_ado_editorial_113',
    format: 'boolean',
    question: 'C’est un Belge qui a mis au point la première dynamo industrielle.',
    isTrue: true,
    explanation: 'Zénobe Gramme, menuisier de formation, a rendu l’électricité utilisable dans les usines.',
  },
  {
    id: 'sci_ado_editorial_109',
    format: 'boolean',
    question: 'Une même personne a déjà reçu deux prix Nobel dans deux sciences différentes.',
    isTrue: true,
    explanation: 'Marie Curie, en physique puis en chimie ; sa fille Irène en a reçu un à son tour.',
  },

  // --- Art ------------------------------------------------------------------
  {
    id: 'art_155',
    format: 'open',
    question: 'Qui a écrit le roman Les Misérables ?',
    answer: 'Victor Hugo',
    explanation: 'Il l’a terminé en exil sur l’île de Guernesey, où il a vécu près de quinze ans.',
  },
  {
    id: 'art_196',
    format: 'boolean',
    question: 'L’Iliade et l’Odyssée sont attribuées au même poète.',
    isTrue: true,
    explanation: 'On ne sait presque rien de lui, et certains pensent qu’il n’a jamais existé seul.',
  },
  {
    id: 'art_200',
    format: 'open',
    question: 'Quel dieu grec, messager de l’Olympe, porte des sandales ailées ?',
    answer: 'Hermès',
    explanation: 'Il conduisait aussi les âmes des morts, et protégeait les voyageurs comme les voleurs.',
  },
  {
    id: 'art_203',
    format: 'boolean',
    question: 'Le mot « narcissique » vient d’un personnage de la mythologie grecque.',
    isTrue: true,
    explanation: 'Narcisse s’éprend de son reflet dans l’eau et ne parvient plus à s’en détacher.',
  },

  // --- Sports ---------------------------------------------------------------
  {
    id: 'spo_140',
    format: 'boolean',
    question: 'Un match de basket professionnel se joue en quatre périodes.',
    isTrue: true,
    explanation: 'Dix minutes chacune en Europe, douze en NBA, et le chronomètre s’arrête à chaque interruption.',
  },
  {
    id: 'spo_192',
    format: 'open',
    question: 'Qui est à l’origine de la rénovation des Jeux olympiques modernes ?',
    answer: 'Pierre de Coubertin',
    explanation: 'Les premiers Jeux rénovés ont eu lieu à Athènes en 1896, avec moins de trois cents athlètes.',
  },
  {
    id: 'spo_199',
    format: 'boolean',
    question: 'Aux Jeux olympiques de 1976, une gymnaste a obtenu la note parfaite de dix.',
    isTrue: true,
    explanation: 'Le tableau d’affichage n’était pas prévu pour : il a montré 1,00 devant un public médusé.',
  },
  {
    id: 'spo_244',
    format: 'open',
    question: 'Dans quelle catégorie de poids le judoka Teddy Riner combat-il ?',
    answer: 'Les plus de 100 kg',
    explanation: 'Il est resté invaincu pendant près de dix ans, soit plus de cent cinquante combats d’affilée.',
  },

  // --- Pop culture ----------------------------------------------------------
  {
    id: 'pop_ado_editorial_033',
    format: 'boolean',
    question: 'L’album « 21 » d’Adele figure parmi les disques les plus vendus du siècle.',
    isTrue: true,
    explanation: 'Plus de trente millions d’exemplaires, et six récompenses ramassées en une seule soirée.',
  },
  {
    id: 'pop_ado_editorial_022',
    format: 'open',
    question: 'Quelle actrice incarne Wonder Woman au cinéma depuis 2017 ?',
    answer: 'Gal Gadot',
    explanation: 'Ancienne militaire israélienne, elle a passé les auditions sans savoir pour quel rôle.',
  },
  {
    id: 'pop_148',
    format: 'open',
    question: 'Qui est le héros numéro un au début de My Hero Academia ?',
    answer: 'All Might',
    explanation: 'Son pouvoir se transmet de porteur en porteur, ce qui n’arrive à aucun autre dans la série.',
  },
  {
    id: 'pop_145',
    format: 'boolean',
    question: 'Dans Demon Slayer, le héros cherche à rendre son humanité à sa sœur changée en démon.',
    isTrue: true,
    explanation: 'Nezuko garde une part d’humanité, ce qui ne s’était jamais vu chez un démon.',
  },

  // --- Gastronomie ----------------------------------------------------------
  {
    id: 'gas_185',
    format: 'open',
    question: 'Quelle boisson chaude est le symbole de l’hospitalité au Maghreb ?',
    answer: 'Le thé à la menthe',
    explanation: 'On le verse de haut pour le faire mousser, et il se sert traditionnellement trois fois.',
  },
  {
    id: 'gas_147',
    format: 'boolean',
    question: 'Les bêtises de Cambrai doivent leur nom à une erreur de fabrication.',
    isTrue: true,
    explanation: 'Un apprenti confiseur aurait raté sa recette ; le bonbon a plu, et le nom est resté.',
  },
  {
    id: 'gas_222',
    format: 'boolean',
    question: 'Le chocolat blanc ne contient aucun ingrédient issu du cacao.',
    isTrue: false,
    explanation: 'Il contient du beurre de cacao, mais pas la pâte de cacao qui donne la couleur et l’amertume.',
  },
  {
    id: 'gas_ado_editorial_016',
    format: 'open',
    question: 'Que mange-t-on traditionnellement à la Chandeleur ?',
    answer: 'Des crêpes',
    explanation: 'La fête tombe quarante jours après Noël, quand les jours rallongent nettement.',
  },
];

export function applyAdoVariableFormats(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

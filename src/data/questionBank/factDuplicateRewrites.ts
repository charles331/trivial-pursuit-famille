import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Cartes qui reposaient un fait déjà posé, au même niveau et dans la même
 * catégorie — donc dans la même partie, pour le même joueur.
 *
 * Le dédoublonnage de l'audit compare « catégorie + bonne réponse » sur des
 * textes normalisés. Il ne voit ni un fait posé dans les deux sens (« qui
 * découvrit la tombe de Toutânkhamon ? » puis « quel pharaon possède la tombe
 * découverte par Howard Carter ? »), ni deux formulations du même fait écrites
 * dans deux lots différents (« Quel détroit sépare la Sicile de la péninsule
 * italienne ? », mot pour mot, deux fois).
 *
 * Le rapprochement affiné — recouvrement de vocabulaire **et** réponse commune ou
 * citée dans l'autre énoncé — a remonté quarante-neuf grappes au sein d'un même
 * niveau. Une dizaine étaient de faux positifs qu'il aurait été absurde de
 * corriger : « le bébé de la vache » et « le bébé de la grenouille » partagent
 * tout leur moule sans poser le même fait, et une carotte orange n'est pas un
 * abricot orange. Les autres sont réécrites ici.
 *
 * Dans chaque grappe on garde la carte la mieux notée par `npm run score:fun` et
 * l'on réécrit l'autre sur un fait neuf, vérifié contre le corpus entier — ce qui
 * a d'ailleurs évité treize doublons de plus au premier jet. Une exception :
 * `sport_adulte_francophone_005` était en outre faux (Remco Evenepoel n'a pas
 * gagné le Tour de France 2024), c'est donc celle-là qui tombe.
 */
const REWRITES: CardRewrite[] = [
  // --- Enfant ---------------------------------------------------------------
  {
    // Doublait « Quelle est la capitale de la France ? » : même réponse, et pour
    // un enfant c'est la même carte.
    id: 'geo_043',
    question: 'Quel grand pays se trouve juste au sud de la Belgique ?',
    answer: 'La France',
    distractors: ['L’Espagne', 'L’Italie', 'La Suisse'],
    explanation: 'La frontière entre les deux pays court sur environ six cents kilomètres.',
  },

  // --- Histoire, adulte -----------------------------------------------------
  {
    // Doublait his_276, la Magna Carta.
    id: 'his_adulte_pilot_013',
    question: 'Quel roi de France a été guillotiné place de la Révolution en 1793 ?',
    answer: 'Louis XVI',
    distractors: ['Louis XIV', 'Charles X', 'Henri IV'],
    explanation: 'La place s’appelle aujourd’hui place de la Concorde, un nom choisi pour tourner la page.',
  },
  {
    // Doublait his_adulte_grand_public_008 : la ligne Bruxelles-Malines de 1835.
    id: 'his_adulte_editorial_02_008',
    question: 'Quelle compagnie maritime a emmené des millions d’émigrants d’Anvers vers l’Amérique ?',
    answer: 'La Red Star Line',
    distractors: ['La Cunard', 'La White Star Line', 'La Compagnie générale transatlantique'],
    explanation: 'Ses hangars du port abritent aujourd’hui un musée consacré à ces départs.',
  },
  {
    // Doublait his_adulte_editorial_05_002 : Carter et la tombe de Toutânkhamon,
    // posés dans les deux sens. C'était aussi la carte la moins fun du corpus.
    id: 'his_adulte_editorial_03_020',
    question: 'Quelle écriture égyptienne a pu être déchiffrée grâce à la pierre de Rosette ?',
    answer: 'Les hiéroglyphes',
    distractors: ['Le cunéiforme', 'L’alphabet phénicien', 'Le linéaire B'],
    explanation: 'La pierre portait le même texte en trois écritures, dont le grec, déjà connu.',
  },
  {
    // Doublait his_adulte_grand_public_023, le traité de Maastricht.
    id: 'his_adulte_editorial_03_022',
    question: 'Quelle institution européenne, élue par les citoyens, siège à Strasbourg ?',
    answer: 'Le Parlement européen',
    distractors: ['La Commission européenne', 'Le Conseil de l’Europe', 'La Cour des comptes'],
    explanation: 'Ses commissions travaillent à Bruxelles : les députés font la navette chaque mois.',
  },

  // --- Géographie, adulte ---------------------------------------------------
  {
    // Doublait geo_271 : Astana et le Kazakhstan, posés dans les deux sens.
    id: 'geo_adulte_qualite_043',
    question: 'Quelle mer intérieure d’Asie centrale a perdu l’essentiel de sa surface depuis 1960 ?',
    answer: 'La mer d’Aral',
    distractors: ['La mer Caspienne', 'Le lac Balkhach', 'La mer Noire'],
    explanation: 'Le détournement de ses deux fleuves pour irriguer le coton a laissé des bateaux en plein désert.',
  },
  {
    // Doublait geo_278, la Sambre à Charleroi et Namur.
    id: 'geo_adulte_editorial_final_011',
    question: 'Quel ouvrage belge soulève les bateaux de soixante-treize mètres d’un seul mouvement ?',
    answer: 'L’ascenseur de Strépy-Thieu',
    distractors: ['Le barrage de la Gileppe', 'L’écluse de Zemst', 'Le tunnel de Cointe'],
    explanation: 'Mis en service en 2002, il a remplacé quatre ascenseurs du XIXᵉ siècle, aujourd’hui classés.',
  },
  {
    // Doublait geo_294, le plus long littoral du monde.
    id: 'geo_adulte_qualite_030',
    question: 'Quelle chute d’eau du Venezuela est la plus haute du monde, avec près de mille mètres ?',
    answer: 'Le Salto Ángel',
    distractors: ['Les chutes du Niagara', 'Les chutes Victoria', 'Les chutes d’Iguazú'],
    explanation: 'L’eau se disperse en brume avant d’atteindre le sol pendant la saison sèche.',
  },
  {
    // Doublait geo_309, le partage de Bornéo.
    id: 'geo_adulte_qualite_023',
    question: 'Quelle cité-État occupe une île à la pointe de la péninsule malaise ?',
    answer: 'Singapour',
    distractors: ['Brunei', 'Macao', 'Hong Kong'],
    explanation: 'Elle agrandit son territoire en gagnant sur la mer, avec du sable importé de ses voisins.',
  },
  {
    // Doublait geo_380 : Quito et l'Équateur, posés dans les deux sens.
    id: 'geo_adulte_qualite_027',
    question: 'Quel courant marin chaud adoucit le climat des côtes d’Europe de l’Ouest ?',
    answer: 'Le Gulf Stream',
    distractors: ['Le courant de Humboldt', 'Le courant du Labrador', 'Le courant des Canaries'],
    explanation: 'Il transporte vers le nord une chaleur venue du golfe du Mexique, d’où son nom.',
  },
  {
    // Doublait geo_adulte_editorial_02_017 : Prague et la Vltava, dans les deux sens.
    id: 'geo_adulte_qualite_004',
    question: 'Quel pays d’Europe compte le plus de volcans encore en activité ?',
    answer: 'L’Italie',
    distractors: ['La Grèce', 'L’Espagne', 'La Roumanie'],
    explanation: 'L’Etna, le Stromboli et le Vésuve y sont surveillés en continu.',
  },
  {
    // Doublait geo_adulte_editorial_final_076, la mer Morte.
    id: 'geo_adulte_editorial_02_039',
    question: 'Quel fleuve termine sa course dans la mer Morte ?',
    answer: 'Le Jourdain',
    distractors: ['L’Euphrate', 'Le Nil', 'Le Tigre'],
    explanation: 'Ses eaux sont tellement prélevées en amont qu’il n’arrive plus qu’au filet.',
  },
  {
    // Doublait geo_adulte_editorial_final_092 : Sumatra et Malacca, dans les deux sens.
    id: 'geo_adulte_editorial_03_043',
    question: 'Quel pays d’Asie du Sud-Est est formé de plus de dix-sept mille îles ?',
    answer: 'L’Indonésie',
    distractors: ['Les Philippines', 'La Malaisie', 'Le Vietnam'],
    explanation: 'Quelques milliers seulement sont habitées, et beaucoup n’ont même pas de nom officiel.',
  },

  // --- Cinéma, adulte -------------------------------------------------------
  {
    // Doublait cin_adulte_editorial_025, Le Dîner de cons.
    id: 'cin_adulte_grand_public_024',
    question: 'Comment appelle-t-on un film qui refait une histoire déjà portée à l’écran ?',
    answer: 'Un remake',
    distractors: ['Un préquel', 'Un spin-off', 'Un reboot'],
    explanation: 'Hollywood en produit beaucoup à partir de films européens ou asiatiques à succès.',
  },
  {
    // Doublait cin_adulte_editorial_final_003, Les Parapluies de Cherbourg.
    id: 'cin_adulte_editorial_02_003',
    question: 'Quelle récompense le cinéma français remet-il chaque année depuis 1976 ?',
    answer: 'Le César',
    distractors: ['Le Lumière', 'Le Molière', 'Le Magritte'],
    explanation: 'La statuette est due au sculpteur César, d’où son nom ; l’équivalent belge s’appelle le Magritte.',
  },
  {
    // Doublait cin_adulte_editorial_03_035, Toto le héros.
    id: 'cin_adulte_editorial_05_019',
    question: 'Quel métier consiste à recréer et enregistrer les bruits d’un film après le tournage ?',
    answer: 'Bruiteur',
    distractors: ['Perchman', 'Monteur son', 'Mixeur'],
    explanation: 'Les pas dans la neige se font souvent avec de la fécule de maïs, plus convaincante que la neige.',
  },
  {
    // Doublait cin_adulte_editorial_final_022, C'est arrivé près de chez vous.
    id: 'cin_adulte_editorial_05_020',
    question: 'Comment appelle-t-on la personne qui dessine et fait fabriquer les costumes d’un film ?',
    answer: 'Le costumier',
    distractors: ['Le décorateur', 'L’accessoiriste', 'Le maquilleur'],
    explanation: 'Sur un film d’époque, il faut parfois recréer des tissus qui ne se fabriquent plus.',
  },

  // --- Art, adulte ----------------------------------------------------------
  {
    // Doublait art_adulte_bd_litterature_027 : l'Agneau mystique et Gand.
    id: 'art_280',
    question: 'Comment appelle-t-on la technique qui creuse une plaque de métal pour en tirer des estampes ?',
    answer: 'La gravure',
    distractors: ['La fresque', 'L’aquarelle', 'La mosaïque'],
    explanation: 'Une même plaque donne des dizaines d’exemplaires, ce qui a fait circuler les images avant la photo.',
  },
  {
    // Doublait art_adulte_editorial_07_023, Les Cités obscures.
    id: 'art_adulte_bd_litterature_011',
    question: 'Quelle bande dessinée belge met en scène de petits êtres bleus vivant dans des champignons ?',
    answer: 'Les Schtroumpfs',
    distractors: ['Boule et Bill', 'Les Tuniques bleues', 'Cédric'],
    explanation: 'Ils sont nés en 1958 comme personnages secondaires d’une autre série, Johan et Pirlouit.',
  },
  {
    // Doublait art_adulte_grand_public_022, l'Atomium.
    id: 'art_adulte_editorial_04_003',
    question: 'Quelle place bruxelloise, bordée de façades baroques dorées, est classée au patrimoine mondial ?',
    answer: 'La Grand-Place',
    distractors: ['La place Royale', 'Le Sablon', 'La place Flagey'],
    explanation: 'Bombardée par les troupes de Louis XIV en 1695, elle a été rebâtie en cinq ans par les corporations.',
  },
  {
    // Doublait art_adulte_editorial_03_018 : La Jeune Fille à la perle, et la
    // carte demandait un courant artistique, ce qui ne se déduit pas.
    id: 'art_adulte_editorial_007',
    question: 'Comment appelle-t-on l’art de composer une image avec des morceaux de papier collés ?',
    answer: 'Le collage',
    distractors: ['Le pointillisme', 'Le fusain', 'Le pastel'],
    explanation: 'Braque et Picasso ont commencé par y coller de vrais morceaux de journal et de papier peint.',
  },
  {
    // Doublait art_adulte_editorial_03_012 : La Nuit étoilée, même remarque.
    id: 'art_adulte_editorial_026',
    question: 'Quel peintre a composé ses dernières œuvres en découpant du papier peint en couleurs ?',
    answer: 'Henri Matisse',
    distractors: ['Paul Cézanne', 'Marc Chagall', 'Joan Miró'],
    explanation: 'Trop affaibli pour tenir un pinceau debout, il « dessinait avec des ciseaux » depuis son fauteuil.',
  },

  // --- Sports, adulte -------------------------------------------------------
  {
    // Cette carte affirmait qu'Evenepoel avait gagné le Tour de France 2024 : il y
    // a pris la troisième place. C'est donc elle qui tombe, et non l'autre carte
    // de la grappe.
    id: 'sport_adulte_francophone_005',
    question: 'Quel grand tour de trois semaines Remco Evenepoel a-t-il remporté en 2022 ?',
    answer: 'Le Tour d’Espagne',
    distractors: ['Le Tour de France', 'Le Tour d’Italie', 'Le Tour de Suisse'],
    explanation: 'Il est le premier Belge à l’emporter depuis Freddy Maertens, quarante-cinq ans plus tôt.',
  },
  {
    // Doublait sport_adulte_curated_06_022, Kim Clijsters à l'US Open.
    id: 'sport_adulte_francophone_019',
    question: 'Quel Belge a remporté le Tour des Flandres et Paris-Roubaix la même année, en 2005 ?',
    answer: 'Tom Boonen',
    distractors: ['Philippe Gilbert', 'Johan Museeuw', 'Greg Van Avermaet'],
    explanation: 'Ce doublé, appelé le « week-end de Pâques », n’a été réussi que par une poignée de coureurs.',
  },
  {
    // Doublait sport_adulte_curated_01_042 : Nina Derwael et les barres, dans les
    // deux sens.
    id: 'sport_adulte_francophone_023',
    question: 'Dans quelle épreuve d’athlétisme la Belge Nafissatou Thiam est-elle devenue championne olympique ?',
    answer: 'L’heptathlon',
    distractors: ['Le 400 mètres haies', 'Le saut en longueur', 'Le lancer du javelot'],
    explanation: 'Sept épreuves en deux jours ; elle a gagné trois titres olympiques d’affilée.',
  },
  {
    // Doublait sport_adulte_curated_final_023 : Spa-Francorchamps et le Grand Prix
    // de Belgique, dans les deux sens.
    id: 'sport_adulte_francophone_027',
    question: 'Dans quelle discipline hivernale le coureur Wout van Aert s’est-il illustré avant la route ?',
    answer: 'Le cyclo-cross',
    distractors: ['Le patinage de vitesse', 'Le ski de fond', 'Le VTT de descente'],
    explanation: 'Trois titres mondiaux dans la boue avant de devenir un coureur classique sur route.',
  },
  {
    // Doublait sport_adulte_francophone_032, le skeleton.
    id: 'sport_adulte_curated_03_033',
    question: 'Quelle épreuve de ski alpin fait franchir une succession serrée de portes ?',
    answer: 'Le slalom',
    distractors: ['La descente', 'Le super-G', 'Le combiné'],
    explanation: 'Les piquets sont articulés à la base : le skieur les couche au passage sans être déséquilibré.',
  },
  {
    // Doublait sport_adulte_curated_final_035 : les anneaux, deux fois.
    id: 'sport_adulte_curated_01_043',
    question: 'Quel agrès du programme féminin de gymnastique n’existe pas chez les hommes ?',
    answer: 'La poutre',
    distractors: ['Le sol', 'Les barres parallèles', 'Le cheval d’arçons'],
    explanation: 'Dix centimètres de large, un mètre vingt-cinq de haut, et un enchaînement de quatre-vingt-dix secondes.',
  },
  {
    // Doublait sport_adulte_curated_final_052, le break maximum au snooker.
    id: 'sport_adulte_curated_final_053',
    question: 'Quel coup, au tennis de table, imprime à la balle une rotation qui la fait plonger ?',
    answer: 'Le lift',
    distractors: ['Le smash', 'Le contre', 'Le bloc'],
    explanation: 'La balle tourne jusqu’à cent fois par seconde, ce qui la fait rebondir en avant chez l’adversaire.',
  },

  // --- Pop culture, adulte --------------------------------------------------
  {
    // Doublait pop_adulte_complement_016, Friends.
    id: 'pop_adulte_editorial_04_011',
    question: 'Quelle série suit un parrain de la mafia du New Jersey qui consulte une psychiatre ?',
    answer: 'Les Soprano',
    distractors: ['Boardwalk Empire', 'Peaky Blinders', 'Ozark'],
    explanation: 'Diffusée à partir de 1999, elle a lancé la mode des séries portées par un antihéros.',
  },
  {
    // Doublait pop_adulte_editorial_06_036, Over the Garden Wall, et demandait un
    // nombre d'épisodes — de la pure mémoire.
    id: 'pop_adulte_editorial_final_02_007',
    question: 'Quelle série d’animation suit un garçon et son chien magique dans le pays d’Ooo ?',
    answer: 'Adventure Time',
    distractors: ['Gravity Falls', 'Steven Universe', 'Rick et Morty'],
    explanation: 'Derrière son décor coloré, la série raconte un monde qui se relève d’une catastrophe.',
  },

  // --- Gastronomie, adulte --------------------------------------------------
  {
    // Doublait gas_adulte_curated_01_018 : déglacer, posé dans les deux sens.
    id: 'gastronomie_adulte_curated_final_051',
    question: 'Que veut dire « monter » des blancs d’œufs ?',
    answer: 'Les battre jusqu’à ce qu’ils deviennent fermes',
    distractors: ['Les cuire à la vapeur', 'Les séparer des jaunes', 'Les laisser reposer au froid'],
    explanation: 'Une pincée de sel ou quelques gouttes de citron aident les bulles d’air à tenir.',
  },
  {
    // Doublait gas_adulte_curated_05_050, le trifle.
    id: 'gastronomie_adulte_curated_final_036',
    question: 'Quel alcool belge parfumé aux baies de genévrier se boit en petit verre ?',
    answer: 'Le genièvre',
    distractors: ['Le calvados', 'L’armagnac', 'Le kirsch'],
    explanation: 'Hasselt et Liège en font depuis des siècles ; le mot « gin » vient de la même racine.',
  },
  // --- Doublons repérés une fois la comparaison des réponses resserrée --------
  // « Le détroit de Messine » et « Messine » ne se comparaient pas : l'article en
  // moins ne suffisait pas, il fallait comparer le mot qui nomme la chose.
  {
    // Doublait geo_274 : l'énoncé était identique, mot pour mot.
    id: 'geo_adulte_qualite_002',
    question: 'Quel État minuscule est entièrement entouré par l’Italie, autour d’un mont ?',
    answer: 'Saint-Marin',
    distractors: ['Monaco', 'Andorre', 'Le Liechtenstein'],
    explanation: 'Il se dit la plus vieille république du monde, fondée selon la tradition en l’an 301.',
  },
  {
    // Doublait geo_378 : son énoncé désignait déjà « la plus peuplée des îles
    // indonésiennes », c'est-à-dire la réponse de l'autre carte.
    id: 'geo_adulte_editorial_final_093',
    question: 'Quelle île, la plus grande du monde, relève du royaume du Danemark ?',
    answer: 'Le Groenland',
    distractors: ['L’Islande', 'Madagascar', 'La Nouvelle-Guinée'],
    explanation: 'Quatre-vingts pour cent de sa surface sont sous la glace, et il compte moins de soixante mille habitants.',
  },
  {
    // Doublait geo_adulte_editorial_02_035, les Rocheuses.
    id: 'geo_adulte_editorial_final_067',
    question: 'Quel haut plateau d’Asie est surnommé le toit du monde ?',
    answer: 'Le Tibet',
    distractors: ['La Mongolie', 'Le Cachemire', 'Le Pamir'],
    explanation: 'Il culmine en moyenne à quatre mille mètres, soit plus haut que le sommet des Alpes françaises.',
  },
  {
    // Doublait cin_163 : la Montagne du Destin, deux fois.
    id: 'cin_170',
    question: 'Dans Le Seigneur des Anneaux, quel peuple vit dans la Comté ?',
    answer: 'Les Hobbits',
    distractors: ['Les Elfes', 'Les Nains', 'Les Ents'],
    explanation: 'Ils marchent pieds nus et prennent, quand ils peuvent, deux petits déjeuners.',
  },
  {
    // Doublait cin_191, la DeLorean.
    id: 'cin_190',
    // Le premier jet posait la question entre quatre millésimes, ce que l'audit
    // interdit au niveau ado : deux années voisines ne se déduisent jamais.
    question: 'Dans Retour vers le futur, que risque Marty s’il empêche la rencontre de ses parents ?',
    answer: 'De disparaître de la photo de famille',
    distractors: ['De vieillir de dix ans', 'De perdre la mémoire', 'De rester coincé en 1955'],
    explanation: 'Ses aînés s’effacent un à un de l’image, en commençant par son frère.',
  },
  {
    // Doublait sci_adulte_editorial_final_027, la loi de Boyle-Mariotte.
    id: 'sci_adulte_qualite_003',
    question: 'Quel appareil sépare les composants d’un mélange en le faisant tourner très vite ?',
    answer: 'La centrifugeuse',
    distractors: ['L’autoclave', 'Le spectromètre', 'L’agitateur magnétique'],
    explanation: 'C’est ainsi qu’on sépare le plasma des globules dans une poche de sang.',
  },
  {
    // Doublait art_adulte_editorial_03_005, Les Ménines au Prado.
    id: 'art_adulte_editorial_05_022',
    question: 'Quel musée de Saint-Pétersbourg occupe l’ancien palais d’Hiver des tsars ?',
    answer: 'L’Ermitage',
    distractors: ['La galerie Tretiakov', 'Le musée Pouchkine', 'Le palais de Peterhof'],
    explanation: 'Ses collections dépassent les trois millions de pièces, dont une infime part est exposée.',
  },
];

export function applyFactDuplicateRewrites(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

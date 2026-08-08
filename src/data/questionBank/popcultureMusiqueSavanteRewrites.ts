import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Le bloc de musique savante de « Pop Culture & Musique », repris en entier.
 *
 * Vingt-huit cartes d'opéra, d'oratorio et de symphonie vivaient dans une
 * catégorie dont la description annonce « chansons à succès, bandes dessinées,
 * jeux vidéo et tendances web ». Elles y avaient été déplacées pour une bonne
 * raison — « Art & Littérature » ne promettait pas d'opéra, et la catégorie qui
 * dit « Musique » n'en comptait presque aucune — mais le résultat se voit en
 * partie : popculture/adulte est le bloc le plus mal noté de toute la banque
 * (67,6 % à `npm run score:fun`), et c'est cette poche qui l'y maintient.
 *
 * Décision du propriétaire du projet, après avoir vu quatre cartes signalées
 * « impossibles » en partie : garder les plus célèbres, remplacer le reste.
 *
 * **Les sept gardées** le sont parce qu'elles appartiennent à la culture
 * générale, pas au catalogue d'un spécialiste. Elles sont réécrites selon la
 * règle qui vaut pour tout le jeu : interroger l'œuvre, pas sa signature. Le nom
 * du compositeur quitte l'énoncé — où il ne servait qu'à désigner un rayon — et
 * passe dans le « Le saviez-vous ? », où le joueur l'apprend quand même. Surtout,
 * les distracteurs ne sont plus tirés du seul catalogue de l'auteur : entre
 * quatre opéras de Puccini, il faut savoir ; entre quatre opéras célèbres, la
 * description du grenier parisien suffit à trancher.
 *
 * **Les vingt remplacées** le sont par ce que la catégorie promet — et par des
 * cartes qui se raisonnent plutôt qu'elles ne se récitent. C'est le fil du lot :
 * pourquoi Mario porte une moustache, pourquoi les envahisseurs de Space
 * Invaders accélèrent, pourquoi un album de BD fait toujours le même nombre de
 * pages. Chaque fois, la réponse se déduit d'une contrainte technique que
 * l'énoncé laisse deviner, et le fait reste à apprendre.
 *
 * Les vingt sujets ont été vérifiés un par un contre le corpus entier avant
 * d'être écrits : sept premières idées — Stromae, Angèle, Tomorrowland, le sens
 * de lecture des mangas, Larian, Gaston Lagaffe, Minecraft — étaient déjà
 * posées ailleurs et ont été abandonnées.
 */
const REWRITES: CardRewrite[] = [
  /* ------------------------------------------------------------------ *
   * Les sept gardées : l'œuvre plutôt que le catalogue.
   * ------------------------------------------------------------------ */
  {
    id: 'pop_adulte_musique_classique_006',
    question: 'Quelle symphonie raconte les rêves d’un artiste amoureux, jusqu’à sa marche au supplice ?',
    answer: 'La Symphonie fantastique',
    distractors: ['Le Boléro', 'La Mer', 'L’Arlésienne'],
    explanation: 'Berlioz y transposa sa passion pour l’actrice Harriet Smithson : une même mélodie, l’idée fixe, revient à chaque mouvement.',
  },
  {
    id: 'pop_adulte_musique_classique_008',
    question: 'Quel opéra suit Violetta, courtisane parisienne que la tuberculose emporte au dernier acte ?',
    answer: 'La Traviata',
    distractors: ['Tosca', 'Manon Lescaut', 'Madame Butterfly'],
    explanation: 'Verdi l’a tiré de La Dame aux camélias, d’Alexandre Dumas fils. Le titre signifie « la dévoyée ».',
  },
  {
    id: 'pop_adulte_musique_classique_010',
    question: 'Quel opéra réunit quatre artistes sans le sou dans un grenier parisien, autour de la frêle Mimì ?',
    answer: 'La Bohème',
    distractors: ['Rigoletto', 'Le Barbier de Séville', 'Les Noces de Figaro'],
    explanation: 'Puccini s’inspira des Scènes de la vie de bohème d’Henry Murger ; la comédie musicale Rent en reprend l’intrigue à New York.',
  },
  {
    id: 'pop_adulte_musique_classique_017',
    question: 'Quel ballet créé à Paris en 1913 déclencha une bagarre dans la salle par ses rythmes martelés ?',
    answer: 'Le Sacre du printemps',
    distractors: ['Le Lac des cygnes', 'Casse-Noisette', 'Giselle'],
    explanation: 'Stravinsky racontait qu’on n’entendait plus l’orchestre ; la chorégraphie de Nijinski scandalisait autant que la musique.',
  },
  {
    id: 'pop_adulte_musique_classique_018',
    question: 'Quelle œuvre s’ouvre sur un glissando de clarinette qui monte en dérapant, entre jazz et symphonie ?',
    answer: 'Rhapsody in Blue',
    distractors: ['Un Américain à Paris', 'West Side Story', 'Le Boléro'],
    explanation: 'Gershwin l’écrivit en trois semaines pour un concert de 1924 ; le glissando était une plaisanterie du clarinettiste, gardée depuis.',
  },
  {
    id: 'pop_adulte_musique_classique_022',
    question: 'Quel opéra met en scène une cigarière de Séville et le brigadier qui déserte pour elle ?',
    answer: 'Carmen',
    distractors: ['Aïda', 'La Flûte enchantée', 'Le Trouvère'],
    explanation: 'Bizet mourut trois mois après une création sifflée, sans voir son opéra devenir le plus joué au monde.',
  },
  {
    id: 'pop_adulte_musique_classique_025',
    question: 'Quel opéra adapte une pièce du Belge Maurice Maeterlinck, prix Nobel de littérature 1911 ?',
    answer: 'Pelléas et Mélisande',
    distractors: ['Manon', 'Werther', 'Les Contes d’Hoffmann'],
    explanation: 'Debussy y bannit les grands airs : le chant suit le rythme de la parole, et l’orchestre murmure sous le texte.',
  },

  /* ------------------------------------------------------------------ *
   * Les vingt remplacées : ce que la catégorie promet, et qui se raisonne.
   * ------------------------------------------------------------------ */

  // --- Jeux vidéo -----------------------------------------------------
  {
    id: 'pop_adulte_musique_classique_001',
    question: 'Pourquoi Mario porte-t-il moustache, casquette et salopette depuis ses tout premiers pixels ?',
    answer: 'Ces détails contournaient les limites d’affichage de l’époque',
    distractors: [
      'Ils copiaient un plombier new-yorkais bien réel',
      'Ils sortaient d’un concours de dessin japonais',
      'Ils reprenaient les couleurs du drapeau italien',
    ],
    explanation: 'La moustache évitait de dessiner une bouche, la casquette une chevelure, et la salopette faisait voir les bras bouger.',
  },
  {
    id: 'pop_adulte_musique_classique_002',
    question: 'Pourquoi les envahisseurs de Space Invaders accélèrent-ils à mesure qu’on les détruit ?',
    answer: 'La machine les dessinait plus vite quand il en restait moins',
    distractors: [
      'Le programme durcissait la partie exprès',
      'Le son du jeu s’accélérait et trompait l’œil',
      'Les joueurs japonais l’avaient réclamé',
    ],
    explanation: 'Ce défaut de matériel a tant plu qu’il est devenu une règle du jeu vidéo : la difficulté monte quand le joueur avance.',
  },
  {
    id: 'pop_adulte_musique_classique_015',
    question: 'Comment une manette de jeu produit-elle sa vibration dans les mains du joueur ?',
    answer: 'Un petit moteur y fait tourner une masse décentrée',
    distractors: [
      'Un haut-parleur y émet des sons très graves',
      'Un aimant y repousse une plaque métallique',
      'Un ressort y est comprimé puis relâché',
    ],
    explanation: 'Les manettes récentes remplacent ce balourd par des moteurs linéaires, capables d’imiter une goutte de pluie ou une corde d’arc.',
  },
  {
    id: 'pop_adulte_musique_classique_019',
    question: 'Que désigne un « easter egg » dans un jeu vidéo ou un film ?',
    answer: 'Un contenu caché par les auteurs, à découvrir par hasard',
    distractors: [
      'Un bogue laissé volontairement par l’éditeur',
      'Une scène coupée puis vendue à part',
      'Un niveau réservé aux versions japonaises',
    ],
    explanation: 'Le premier est signé Warren Robinett, qui cacha son nom dans Adventure en 1979 : l’éditeur ne créditait pas ses programmeurs.',
  },
  {
    id: 'pop_adulte_musique_classique_027',
    question: 'Le fameux « code Konami » se compose de flèches puis de deux lettres : à quoi servait-il ?',
    answer: 'À donner au joueur de quoi survivre à un jeu trop dur',
    distractors: [
      'À passer directement au dernier niveau',
      'À afficher le nom des programmeurs',
      'À changer la langue de la console',
    ],
    explanation: 'Un développeur l’avait ajouté pour se tester lui-même sur Gradius, qu’il trouvait injouable ; il oublia de le retirer.',
  },

  // --- Bande dessinée -------------------------------------------------
  {
    id: 'pop_adulte_musique_classique_003',
    question: 'Pourquoi les albums de BD franco-belges ont-ils presque tous le même nombre de pages ?',
    answer: 'Leur pagination suit les cahiers de seize pages de l’imprimeur',
    distractors: [
      'Une règle des éditeurs limitait la longueur des récits',
      'C’était la durée d’un feuilleton d’une saison',
      'Au-delà, un dos collé ne tenait plus',
    ],
    explanation: 'Trois cahiers pliés font quarante-huit pages : les presses offset d’après-guerre ont figé ce format, et les scénaristes s’y sont pliés.',
  },
  {
    id: 'pop_adulte_musique_classique_012',
    question: 'À quoi reconnaît-on la « ligne claire », le style né chez Hergé ?',
    answer: 'Un trait d’épaisseur constante, sans hachures ni ombres portées',
    distractors: [
      'Un lavis gris qui remplace toutes les couleurs',
      'Des cases sans bordure, ouvertes sur la page',
      'Un dessin au crayon laissé apparent sous l’encre',
    ],
    explanation: 'Le terme est lancé en 1977 par le Néerlandais Joost Swarte, pour nommer ce que Tintin pratiquait depuis quarante ans.',
  },
  {
    id: 'pop_adulte_musique_classique_020',
    question: 'Que désigne le « gaufrier » dans le vocabulaire de la bande dessinée ?',
    answer: 'Une grille de cases toutes identiques, répétée de page en page',
    distractors: [
      'Le carnet d’essais où le dessinateur cherche ses poses',
      'La trame de points qui donne les demi-teintes',
      'Le carton rigide collé sous la couverture',
    ],
    explanation: 'Hergé travaillait souvent en gaufrier de douze cases ; Chris Ware en a fait un principe de composition à part entière.',
  },

  // --- Chanson et disque ---------------------------------------------
  {
    id: 'pop_adulte_musique_classique_009',
    question: 'Que fait un musicien qui « samplé » un morceau existant dans sa propre chanson ?',
    answer: 'Il en réutilise un extrait sonore tel quel',
    distractors: [
      'Il le rejoue à l’identique avec ses musiciens',
      'Il en reprend les paroles en changeant la musique',
      'Il en achète les droits pour empêcher les autres',
    ],
    explanation: 'Quelques secondes de batterie tirées d’un morceau de 1969, l’Amen break, portent des milliers de titres de hip-hop et de jungle.',
  },
  {
    id: 'pop_adulte_musique_classique_013',
    question: 'Pourquoi le 45 tours porte-t-il ce grand trou au centre, là où le 33 tours n’en a qu’un petit ?',
    answer: 'Pour que le bras d’un juke-box l’attrape et l’empile',
    distractors: [
      'Pour l’alléger et réduire les frais de port',
      'Pour laisser respirer la matière pendant le pressage',
      'Pour le distinguer au toucher dans le noir',
    ],
    explanation: 'D’où l’adaptateur en plastique que l’on clipse au centre pour le jouer sur une platine ordinaire.',
  },
  {
    id: 'pop_adulte_musique_classique_023',
    question: 'Pourquoi appelle-t-on « album » un disque qui ne contient pourtant aucune image ?',
    answer: 'Les 78 tours se rangeaient dans des recueils reliés, comme des photos',
    distractors: [
      'Le mot vient du nom du premier studio d’enregistrement',
      'Les pochettes étaient d’abord vendues avec des vignettes à coller',
      'Il traduit un mot anglais désignant la cire du disque',
    ],
    explanation: 'Un 78 tours tenait quatre minutes : il en fallait une dizaine, reliés en volume, pour une symphonie entière.',
  },
  {
    id: 'pop_adulte_musique_classique_016',
    question: 'Que signifie littéralement le mot japonais « karaoké » ?',
    answer: 'Orchestre vide',
    distractors: ['Voix seule', 'Chanson du soir', 'Salle des amis'],
    explanation: '« Kara » veut dire vide — comme dans karaté, la main vide — et « oke » abrège le mot anglais orchestra.',
  },
  {
    id: 'pop_adulte_musique_classique_014',
    question: 'Comment un fichier MP3 tient-il dix fois moins de place que le morceau d’origine ?',
    answer: 'Il jette les sons que l’oreille humaine n’entendrait pas',
    distractors: [
      'Il coupe les fréquences les plus graves',
      'Il ne garde qu’un canal au lieu de deux',
      'Il réduit la durée des silences entre les notes',
    ],
    explanation: 'Un son fort masque un son faible voisin : le codeur supprime le second, que personne ne remarque. C’est ce qu’on appelle le codage perceptif.',
  },

  // --- Internet et tendances ------------------------------------------
  {
    id: 'pop_adulte_musique_classique_004',
    question: 'D’où vient le mot « spam », employé pour les courriers indésirables ?',
    answer: 'D’un sketch des Monty Python où le mot revient sans cesse',
    distractors: [
      'D’un logiciel publicitaire des années 1990',
      'D’un sigle inventé par l’armée américaine',
      'Du nom du premier expéditeur en masse',
    ],
    explanation: 'Dans le sketch, un menu de restaurant décline le SPAM — un jambon en conserve — à chaque ligne, jusqu’à couvrir la conversation.',
  },
  {
    id: 'pop_adulte_musique_classique_007',
    question: 'Pourquoi le premier smiley a-t-il été tapé au clavier sur un forum universitaire, en 1982 ?',
    answer: 'Pour signaler qu’un message était une plaisanterie',
    distractors: [
      'Pour contourner une limite de caractères',
      'Pour signer les messages sans donner son nom',
      'Pour tester l’affichage d’un nouveau terminal',
    ],
    explanation: 'Scott Fahlman proposa deux points, un tiret et une parenthèse après qu’une blague sur un ascenseur eut été prise au sérieux.',
  },
  {
    id: 'pop_adulte_musique_classique_011',
    question: 'Que décrit « l’effet Streisand », devenu un classique de la vie en ligne ?',
    answer: 'Vouloir faire disparaître une information la rend célèbre',
    distractors: [
      'Une célébrité fait vendre un produit qu’elle n’aime pas',
      'Une rumeur démentie revient chaque année',
      'Un artiste devient plus connu après sa mort',
    ],
    explanation: 'En 2003, la chanteuse attaqua un photographe pour une vue aérienne de sa villa : le cliché, vu six fois, fut ensuite téléchargé par centaines de milliers.',
  },
  {
    id: 'pop_adulte_musique_classique_024',
    question: 'Pourquoi l’arobase @ a-t-elle été choisie pour séparer le nom de la machine, dans une adresse ?',
    answer: 'Elle ne figurait dans aucun nom et voulait dire « chez »',
    distractors: [
      'Elle était la seule touche libre du clavier',
      'Elle abrégeait le mot « adresse » en imprimerie',
      'Elle servait déjà de séparateur en téléphonie',
    ],
    explanation: 'Ray Tomlinson la retint en 1971 ; les comptables l’employaient depuis longtemps pour écrire « dix caisses à trois francs ».',
  },
  {
    id: 'pop_adulte_musique_classique_026',
    question: 'Le mot « mème » est né en 1976 sous la plume d’un biologiste : que désignait-il alors ?',
    answer: 'Une idée qui se copie d’un cerveau à l’autre, comme un gène',
    distractors: [
      'Un dessin humoristique publié dans la presse',
      'Un comportement animal transmis par la mère',
      'Un mot inventé qui entre dans le dictionnaire',
    ],
    explanation: 'Richard Dawkins le forge dans Le Gène égoïste, par analogie avec « gène » : ce qui se reproduit ici, ce sont les idées.',
  },
  {
    id: 'pop_adulte_musique_classique_028',
    question: 'Le mot « pixel » est la contraction de deux mots anglais : lesquels ?',
    answer: 'Picture element, soit « élément d’image »',
    distractors: [
      'Pick et cell, soit « case choisie »',
      'Pigment et level, soit « niveau de couleur »',
      'Point et excel, soit « point exact »',
    ],
    explanation: 'Le mot naît vers 1965 dans les laboratoires qui traitaient les images des sondes spatiales, bien avant les écrans domestiques.',
  },

  // --- Séries ----------------------------------------------------------
  {
    id: 'pop_adulte_musique_classique_005',
    question: 'Pourquoi les séries américaines comptaient-elles longtemps une vingtaine d’épisodes par saison ?',
    answer: 'Elles remplissaient la grille hebdomadaire de septembre à mai',
    distractors: [
      'Les acteurs étaient engagés pour une année entière',
      'Un quota syndical imposait ce nombre',
      'La pellicule ne se conservait pas plus longtemps',
    ],
    explanation: 'Les plateformes ont cassé ce calendrier : sans grille à remplir, dix épisodes suffisent, et la série se tourne d’un bloc.',
  },
];

export function applyPopcultureMusiqueSavanteRewrites(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

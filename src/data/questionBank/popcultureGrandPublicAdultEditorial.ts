import { Question } from '../../types';

/**
 * Abaissement du plafond de « Pop Culture & Musique » : le nom de créateur
 * comme seule réponse possible.
 *
 * Troisième passe après le cinéma et l'art, avec un détecteur affiné. Compter
 * « toute carte dont la réponse est un nom propre » surestimait la famille :
 * Blacksad, Philip Mortimer, Bob Morane, Michel Vaillant, Pokémon, Motown ou
 * Spotify sont des personnages et des marques, pas des auteurs. Le critère
 * retenu est donc le rôle demandé par l'énoncé — auteur, dessinateur,
 * compositeur, scénariste, mangaka, studio. Sur ce critère, la catégorie
 * comptait 90 cartes de ce type sur 400 — et non 111 comme annoncé d'abord.
 *
 * La moitié posait un nom qu'un foyer peut produire : Hergé, Franquin,
 * Goscinny, Simenon, Maurice Leblanc, Van Hamme, Gainsbourg, Cabrel, Michel
 * Berger, Bowie, Prince, Sandra Kim. Ces cartes restent.
 *
 * 29 autres attendaient Bill Watterson, Quino, Katsuhiro Ōtomo, Naoki Urasawa,
 * Grant Morrison, Mike Mignola, Bryan Lee O'Malley, Iain M. Banks,
 * N. K. Jemisin, Martha Wells, ou associaient un compositeur célèbre à une
 * œuvre qui ne l'est pas — « Didon et Énée », « Les Indes galantes », « Scènes
 * d'enfants », « Má vlast », « Le Mandarin merveilleux », « Norma »,
 * « Cavalleria rusticana », « Wozzeck », « Einstein on the Beach ». Ce sont
 * celles-là qui sont remplacées ici.
 *
 * Les remplaçantes restent dans les terrains de la catégorie mais changent de
 * point d'entrée : un titre de chanson plutôt que son auteur, un surnom, un
 * chiffre, une console, un jeu de société, un genre musical belge.
 *
 * Reste après cette passe : 62 cartes réclamant un nom de créateur, contre 53
 * en cinéma et 192 en art. La catégorie est par ailleurs très fournie en
 * chanson, en BD et en jeux — c'est ce qui limite la taille de cette passe :
 * les sujets grand public encore libres y sont rares, et une quatrième passe
 * demanderait d'ouvrir un territoire neuf plutôt que de recycler.
 */
type Fact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: Fact[] = [
  // ---- Chanson francophone et belge ---------------------------------------
  ['Quelle chanson d’Édith Piaf commence par « Non, rien de rien » ?', '« Non, je ne regrette rien »', '« La Vie en rose »', '« Milord »', '« L’Hymne à l’amour »', 'Elle l’a enregistrée en 1960 et l’a dédiée à la Légion étrangère.'],
  ['Quelle chanson de Jacques Dutronc raconte le petit matin d’une capitale qui se réveille ?', '« Il est cinq heures, Paris s’éveille »', '« Et moi, et moi, et moi »', '« Les Cactus »', '« J’aime les filles »', 'La flûte de l’introduction a été enregistrée par un musicien du Grand Orchestre du Splendid.'],
  ['Quelle chanson de Claude François est devenue « My Way » en anglais ?', '« Comme d’habitude »', '« Alexandrie Alexandra »', '« Cette année-là »', '« Le Téléphone pleure »', 'Paul Anka en a réécrit les paroles pour Frank Sinatra, qui en a fait un standard mondial.'],
  ['Quel chanteur français ses fans surnommaient-ils « le Taulier » ?', 'Johnny Hallyday', 'Eddy Mitchell', 'Michel Sardou', 'Claude François', 'Sa dernière tournée a rassemblé plus d’un million de spectateurs en France.'],
  ['Quelle chanteuse belge à la voix très ample a triomphé au Québec avant la France ?', 'Lara Fabian', 'Maurane', 'Axelle Red', 'Viktor Lazlo', 'Elle chante aussi en italien, en espagnol et en anglais selon les pays où elle tourne.'],
  ['Quel chanteur belge d’origine sicilienne a vendu des millions de disques avec « Tombe la neige » ?', 'Salvatore Adamo', 'Frédéric François', 'Claude Barzotti', 'Marcel Amont', 'Il chante aussi en italien, en allemand et en espagnol, et reste très populaire en Amérique latine.'],
  ['Dans quelle ville Jacques Brel est-il né en 1929 ?', 'Bruxelles', 'Liège', 'Anvers', 'Charleroi', 'Il a grandi à Schaerbeek avant de tenter sa chance dans les cabarets parisiens.'],
  ['Quelle danse de salon à trois temps s’est imposée dans les bals de Vienne au XIXe siècle ?', 'La valse', 'La polka', 'La mazurka', 'Le quadrille', 'Jugée scandaleuse à ses débuts parce que les danseurs se tenaient face à face et enlacés.'],

  // ---- Tubes et groupes que tout le monde a entendus ----------------------
  ['Quel groupe australien chante « Highway to Hell » ?', 'AC/DC', 'Midnight Oil', 'INXS', 'Men at Work', 'Les frères Young, nés en Écosse, ont fondé le groupe à Sydney en 1973.'],
  ['Quelle chanteuse américaine est surnommée « la reine de la pop » ?', 'Madonna', 'Cher', 'Janet Jackson', 'Cyndi Lauper', 'Elle détient le record de recettes pour une tournée d’artiste féminine.'],
  ['Quel groupe de rock britannique a pour emblème une bouche à la langue tirée ?', 'Les Rolling Stones', 'The Who', 'Led Zeppelin', 'Deep Purple', 'Le dessin a été commandé en 1970 à un étudiant en art londonien pour quelques dizaines de livres.'],
  ['Quel chanteur jamaïcain a fait connaître le reggae dans le monde entier ?', 'Bob Marley', 'Peter Tosh', 'Jimmy Cliff', 'Burning Spear', 'Son concert de 1978 à Kingston a réuni sur scène les deux chefs de partis rivaux du pays.'],
  ['Quelle chaîne lancée en 1981 diffusait des clips musicaux vingt-quatre heures sur vingt-quatre ?', 'MTV', 'VH1', 'Trace', 'Canal Plus', 'Son premier clip diffusé s’intitulait « Video Killed the Radio Star ».'],

  // ---- Musique : des faits, pas des patronymes ---------------------------
  ['De quel instrument le Belge Toots Thielemans a-t-il fait un instrument de jazz ?', 'L’harmonica', 'La clarinette', 'Le banjo', 'L’accordéon', 'Il sifflait aussi ses solos en doublant sa guitare, une signature reprise dans des génériques de films.'],
  ['Combien de touches compte un piano moderne ?', 'Quatre-vingt-huit', 'Soixante-douze', 'Cent deux', 'Soixante', 'Cinquante-deux blanches et trente-six noires couvrent un peu plus de sept octaves.'],
  ['Quelle récompense américaine distingue chaque année les meilleurs enregistrements ?', 'Les Grammy Awards', 'Les Tony Awards', 'Les Emmy Awards', 'Les Billboard Awards', 'La statuette représente un gramophone, d’où le nom donné au prix.'],
  ['Quelle cérémonie récompense chaque année la musique française depuis 1985 ?', 'Les Victoires de la musique', 'Les Molières', 'Les Césars', 'Les Prix Constantin', 'Les catégories distinguent notamment l’album, le concert et la révélation de l’année.'],
  ['Combien de cordes compte un violon ?', 'Quatre', 'Trois', 'Six', 'Huit', 'Accordées de quinte en quinte, elles vont du sol grave au mi aigu.'],

  // ---- Télévision et jeux vidéo ------------------------------------------
  ['Quel jeu télévisé propose une série de quinze questions pour gagner un million ?', '« Qui veut gagner des millions ? »', '« Le Maillon faible »', '« Questions pour un champion »', '« Tout le monde veut prendre sa place »', 'Le format britannique de 1998 a été adapté dans plus de cent pays.'],
  ['Quel jeu de 1993 a lancé la mode du tir en vue subjective sur ordinateur ?', 'Doom', 'Quake', 'Wolfenstein 3D', 'Half-Life', 'Distribué d’abord en partie gratuite, il s’est propagé par les disquettes et les premiers réseaux.'],
  ['Quelle console portable de Nintendo, lancée en 1989, avait un écran vert et noir ?', 'La Game Boy', 'La Game Gear', 'La Lynx', 'La PSP', 'Sa robustesse et ses piles bâton lui ont valu plus de cent millions de ventes.'],
  ['Quel jeu vidéo demande de bâtir une ville, ses routes et ses centrales électriques ?', 'SimCity', 'Civilization', 'Anno 1800', 'Les Sims', 'Son créateur a d’abord conçu l’éditeur de décors d’un jeu de vol, avant d’en faire le jeu lui-même.'],
  ['Quel jeu de cartes à collectionner japonais fait s’affronter des duellistes et leurs monstres ?', 'Yu-Gi-Oh!', 'Magic: The Gathering', 'Hearthstone', 'Force of Will', 'Le jeu est né dans un manga où il n’était qu’un élément de l’intrigue.'],

  // ---- Jeux de société ---------------------------------------------------
  ['Quel jeu de plateau fait bâtir routes et colonies sur une île découpée en hexagones ?', 'Les Colons de Catane', 'Carcassonne', 'Les Aventuriers du rail', 'Puerto Rico', 'Le lancer de deux dés décide à chaque tour des ressources produites par chaque terrain.'],
  ['Quel jeu d’équipe demande de faire deviner un mot en le dessinant contre la montre ?', 'Le Pictionary', 'Le Cranium', 'Le Blanc-manger Coco', 'Le Dobble', 'Les catégories vont de l’objet au verbe, en passant par les expressions à mimer au crayon.'],
  ['Quel jeu de dés cherche brelans, carrés et suites en trois lancers par tour ?', 'Le Yam’s', 'Le Passe-dix', 'Le Zanzibar', 'Le Puerto', 'La combinaison des cinq dés identiques y porte le nom du jeu et rapporte le plus de points.'],
  ['Quel jeu d’ambiance interdit d’employer cinq mots interdits pour faire deviner le sixième ?', 'Le Taboo', 'Le Time’s Up!', 'Le Concept', 'Le Codenames', 'Un coéquipier surveille la liste et sanctionne le moindre mot interdit prononcé.'],

  // ---- Bande dessinée ----------------------------------------------------
  ['Quel élève de bande dessinée triche sans arrêt à côté de la première de classe Léonie ?', 'Ducobu', 'Titeuf', 'Cédric', 'Kid Paddle', 'La série de Zidrou et Godi a donné plusieurs films avec Élie Semoun.'],
  ['Quel héros de bande dessinée belge hérite d’un groupe industriel à la mort de son père adoptif ?', 'Largo Winch', 'Alix', 'Bob Morane', 'Buck Danny', 'Le personnage est d’abord né dans des romans, avant d’être repris en album.'],
];

export const POPCULTURE_GRAND_PUBLIC_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `pop_adulte_grand_public_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'popculture' as const,
      question,
      options: options.map(
        (_, position) => options[(position + options.length - rotation) % options.length],
      ),
      correctAnswerIndex: rotation,
      difficulty: 'adulte' as const,
      explanation,
    };
  },
);

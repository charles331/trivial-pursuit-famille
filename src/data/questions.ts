import { Question } from '../types';
import { generateMassiveQuestionsDatabase } from './questionGenerator';

const CURATED_QUESTIONS: Question[] = [
  // ==================== HISTOIRE ====================
  {
    id: 'h1',
    categoryId: 'histoire',
    question: 'En quelle année a eu lieu la Révolution française avec la prise de la Bastille ?',
    options: ['1789', '1815', '1799', '1776'],
    correctAnswerIndex: 0,
    difficulty: 'enfant',
    explanation: 'Le 14 juillet 1789 marque la prise de la Bastille, symbole de la liberté et fête nationale en France !'
  },
  {
    id: 'h2',
    categoryId: 'histoire',
    question: 'Quel roi de France était surnommé le "Roi-Soleil" ?',
    options: ['François Ier', 'Louis XIV', 'Henri IV', 'Charlemagne'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Louis XIV a régné pendant 72 ans et a fait édifier le majestueux château de Versailles.'
  },
  {
    id: 'h3',
    categoryId: 'histoire',
    question: 'Quelle héroïne française a libéré Orléans en 1429 durant la guerre de Cent Ans ?',
    options: ['Marie Curie', 'Olympe de Gouges', 'Jeanne d\'Arc', 'Catherine de Médicis'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'Surnommée la Pucelle d\'Orléans, Jeanne d\'Arc est une figure héroïque légendaire de France.'
  },
  {
    id: 'h4',
    categoryId: 'histoire',
    question: 'Quel traité signé en 1919 a officiellement mis fin à la Première Guerre mondiale ?',
    options: ['Le Traité de Rome', 'Le Traité d\'Utrecht', 'Le Traité de Vienne', 'Le Traité de Versailles'],
    correctAnswerIndex: 3,
    difficulty: 'adulte',
    explanation: 'Signé le 28 juin 1919 dans la Galerie des Glaces du château de Versailles, ce traité a redessiné la carte de l\'Europe.'
  },
  {
    id: 'h5',
    categoryId: 'histoire',
    question: 'Quel pharaon de la XVIIIe dynastie a instauré le culte monothéiste du disque solaire Aton ?',
    options: ['Akhenaton', 'Toutânkhamon', 'Ramsès II', 'Séti Ier'],
    correctAnswerIndex: 0,
    difficulty: 'adulte',
    explanation: 'Époux de Néfertiti, Akhenaton (nommé Amenhotep IV à l\'origine) a déplacé la capitale religieuse à Amarna.'
  },
  {
    id: 'h6',
    categoryId: 'histoire',
    question: 'Qui fut sacré empereur des Francs et de l\'Occident à Rome le 25 décembre 800 ?',
    options: ['Clovis', 'Charlemagne', 'Louis le Pieux', 'Charles Martel'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'Charlemagne fut couronné par le pape Léon III à la basilique Saint-Pierre de Rome.'
  },
  {
    id: 'h7',
    categoryId: 'histoire',
    question: 'En quelle année Christophe Colomb a-t-il accosté aux Amériques pour la première fois ?',
    options: ['1515', '1492', '1337', '1604'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Parti à la recherche d\'une route maritime vers les Indes, il débarqua sur l\'île de San Salvador aux Bahamas.'
  },
  {
    id: 'h8',
    categoryId: 'histoire',
    question: 'Quelle impératrice d\'Autriche, mariée à François-Joseph Ier, était affectueusement surnommée "Sissi" ?',
    options: ['Marie-Thérèse d\'Autriche', 'Élisabeth de Wittelsbach', 'Marie-Antoinette', 'Eugénie de Montijo'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Élisabeth de Wittelsbach, duchesse en Bavière, devint impératrice d\'Autriche en 1854.'
  },
  {
    id: 'h9',
    categoryId: 'histoire',
    question: 'Quel général carthaginois a traversé les Alpes avec ses éléphants de guerre pour affronter Rome ?',
    options: ['Scipion l\'Africain', 'Vercingétorix', 'Hannibal Barca', 'Mithridate'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Durant la deuxième guerre punique (218 av. J.-C.), Hannibal fit franchir les Alpes à son armée dans des conditions dantesques.'
  },
  {
    id: 'h10',
    categoryId: 'histoire',
    question: 'Quel président américain a prononcé le discours d\'émancipation des esclaves pendant la Guerre de Sécession ?',
    options: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'Theodore Roosevelt'],
    correctAnswerIndex: 2,
    difficulty: 'ado',
    explanation: 'Abraham Lincoln promulgua la Proclamation d\'émancipation le 1er janvier 1863.'
  },

  // ==================== GÉOGRAPHIE ====================
  {
    id: 'g1',
    categoryId: 'geographie',
    question: 'Quelle est la capitale officielle du Japon ?',
    options: ['Kyoto', 'Osaka', 'Tokyo', 'Hiroshima'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'Tokyo est l\'une des métropoles les plus peuplées au monde avec plus de 37 millions d\'habitants.'
  },
  {
    id: 'g2',
    categoryId: 'geographie',
    question: 'Quel pays d\'Afrique australe possède trois capitales distinctes (Pretoria, Le Cap et Bloemfontein) ?',
    options: ['Le Nigeria', 'L\'Afrique du Sud', 'Le Kenya', 'Le Zimbabwe'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Pretoria est la capitale administrative, Le Cap est la capitale législative et Bloemfontein la capitale judiciaire.'
  },
  {
    id: 'g3',
    categoryId: 'geographie',
    question: 'Dans quel pays d\'Amérique du Sud se trouve le désert d\'Atacama, l\'un des plus arides au monde ?',
    options: ['La Colombie', 'L\'Argentine', 'Le Chili', 'Le Pérou'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Le désert d\'Atacama au Chili est si sec que certaines stations météo n\'y ont jamais enregistré la moindre goutte de pluie !'
  },
  {
    id: 'g4',
    categoryId: 'geographie',
    question: 'Combien d\'états membres composent les États-Unis d\'Amérique ?',
    options: ['48', '52', '50', '51'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'Le drapeau américain compte 50 étoiles représentant les 50 États de l\'Union (dont l\'Alaska et Hawaï).'
  },
  {
    id: 'g5',
    categoryId: 'geographie',
    question: 'Quel est le lac le plus profond et le plus ancien du monde, situé en Sibérie ?',
    options: ['Le Lac Baïkal', 'Le Lac Supérieur', 'Le Lac Victoria', 'Le Lac Titicaca'],
    correctAnswerIndex: 0,
    difficulty: 'adulte',
    explanation: 'Le lac Baïkal contient à lui seul 20% des réserves mondiales d\'eau douce liquide de la planète (profondeur max : 1 642 mètres).'
  },
  {
    id: 'g6',
    categoryId: 'geographie',
    question: 'Quel détroit sépare l\'Espagne du Maroc et relie l\'océan Atlantique à la mer Méditerranée ?',
    options: ['Détroit de Malacca', 'Détroit de Gibraltar', 'Détroit du Bosphore', 'Détroit de Béring'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'À son point le plus étroit, le détroit de Gibraltar ne mesure que 14 kilomètres de largeur.'
  },
  {
    id: 'g7',
    categoryId: 'geographie',
    question: 'Dans quel pays se trouve le célèbre volcan sous forme de cône parfait appelé le Mont Fuji ?',
    options: ['En Chine', 'Au Japon', 'En Indonésie', 'En Islande'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Le Mont Fuji est le point culminant du Japon à 3 776 mètres d\'altitude et une montagne sacrée.'
  },
  {
    id: 'g8',
    categoryId: 'geographie',
    question: 'Quelle fleuve mythique traverse Vienne, Bratislava, Budapest et Belgrade avant de se jeter dans la mer Noire ?',
    options: ['Le Rhin', 'Le Volga', 'Le Danube', 'L\'Elbe'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Deuxième plus long fleuve d\'Europe après la Volga, le Danube s\'étire sur 2 850 kilomètres.'
  },
  {
    id: 'g9',
    categoryId: 'geographie',
    question: 'Quelle île française de l\'océan Indien est dominée par le volcan actif du Piton de la Fournaise ?',
    options: ['La Guadeloupe', 'La Réunion', 'La Martinique', 'Tahiti'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'Le Piton de la Fournaise est l\'un des volcans les plus actifs de la planète avec plusieurs éruptions par an.'
  },

  // ==================== CINÉMA & SÉRIES ====================
  {
    id: 'c1',
    categoryId: 'cinema',
    question: 'Quel célèbre réalisateur est l\'auteur du film de science-fiction "Interstellar" et de "Inception" ?',
    options: ['Steven Spielberg', 'Christopher Nolan', 'Denis Villeneuve', 'Ridley Scott'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'Christopher Nolan est réputé pour ses scénarios complexes sur le temps, la mémoire et l\'espace.'
  },
  {
    id: 'c2',
    categoryId: 'cinema',
    question: 'Dans "Le Parrain" (1972) de Francis Ford Coppola, quel grand acteur incarne Don Vito Corleone ?',
    options: ['Al Pacino', 'Robert De Niro', 'Marlon Brando', 'Jack Nicholson'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Marlon Brando a remporté l\'Oscar du meilleur acteur pour sa prestation légendaire dans le rôle du Parrain.'
  },
  {
    id: 'c3',
    categoryId: 'cinema',
    question: 'Quel petit bonhomme vert maîtrisant la Force entraîne Luke Skywalker dans la forêt de Dagobah ?',
    options: ['Yoda', 'Grogu', 'Chewbacca', 'Groot'],
    correctAnswerIndex: 0,
    difficulty: 'enfant',
    explanation: 'Maître Yoda enseigne la philosophie des Jedi dans "L\'Empire contre-attaque" (1980).'
  },
  {
    id: 'c4',
    categoryId: 'cinema',
    question: 'Quel film a remporté la Palme d\'or au Festival de Cannes 2019 avant de rafler 4 Oscars majeurs ?',
    options: ['Roma', 'Parasite', 'La La Land', '1917'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Réalisé par le sud-coréen Bong Joon-ho, "Parasite" est le premier film en langue non-anglaise à décrocher l\'Oscar du meilleur film.'
  },
  {
    id: 'c5',
    categoryId: 'cinema',
    question: 'Quel film d\'animation des studios Disney met en scène les aventures de la princesse Vaiana en Polynésie ?',
    options: ['Mulan', 'La Petite Sirène', 'Vaiana (Moana)', 'Raya et le Dernier Dragon'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'L\'histoire s\'inspire des légendes de la mythologie polynésienne avec le demi-dieu Maui.'
  },
  {
    id: 'c6',
    categoryId: 'cinema',
    question: 'Dans la série culte "Breaking Bad", quelle est la profession initiale du personnage principal Walter White ?',
    options: ['Professeur de chimie', 'Avocat pénaliste', 'Agent de police', 'Pharmacien'],
    correctAnswerIndex: 0,
    difficulty: 'ado',
    explanation: 'Professeur de chimie au lycée, Walter White bascule dans la création de méthamphétamine après un diagnostic de maladie.'
  },
  {
    id: 'c7',
    categoryId: 'cinema',
    question: 'Quel comédien incarne le détective privé cynique Rick Deckard dans le chef-d\'œuvre "Blade Runner" (1982) ?',
    options: ['Harrison Ford', 'Arnold Schwarzenegger', 'Sylvester Stallone', 'Bruce Willis'],
    correctAnswerIndex: 0,
    difficulty: 'adulte',
    explanation: 'Harrison Ford joue le chasseur de répliquants dans le film révolutionnaire de Ridley Scott d\'après Philip K. Dick.'
  },

  // ==================== SCIENCES & NATURE ====================
  {
    id: 's1',
    categoryId: 'sciences',
    question: 'Quel gaz indispensable à la respiration humaine constitue environ 21% de l\'air de notre atmosphère ?',
    options: ['Le Dioxyde de Carbone', 'L\'Oxygène (Dioxygène)', 'L\'Azote', 'L\'Hélium'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Les plantes produisent de l\'oxygène grâce à la photosynthèse en utilisant la lumière du soleil.'
  },
  {
    id: 's2',
    categoryId: 'sciences',
    question: 'En physique quantique, quel nom porte le principe d\'incertitude formulé en 1927 ?',
    options: ['Principe d\'Archimède', 'Principe de Pauli', 'Principe d\'Heisenberg', 'Principe de Pascal'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Werner Heisenberg démontra qu\'il est impossible de connaître simultanément la position exacte et la vitesse d\'une particule.'
  },
  {
    id: 's3',
    categoryId: 'sciences',
    question: 'Quelle est la planète la plus volumineuse et la plus massive de tout notre système solaire ?',
    options: ['Saturne', 'Neptune', 'Jupiter', 'Uranus'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'Jupiter est une géante gazeuse dont la masse est plus de 300 fois supérieure à celle de la Terre.'
  },
  {
    id: 's4',
    categoryId: 'sciences',
    question: 'Quel physicien et astronome italien a été condamné par l\'Inquisition en 1633 pour avoir affirmé que la Terre tourne autour du Soleil ?',
    options: ['Galilée (Galileo Galilei)', 'Johannes Kepler', 'Nicolas Copernic', 'Tycho Brahe'],
    correctAnswerIndex: 0,
    difficulty: 'adulte',
    explanation: 'Galilée est célèbre pour la phrase apocryphe "Et pourtant, elle tourne !" ("Eppur si muove").'
  },
  {
    id: 's5',
    categoryId: 'sciences',
    question: 'Comment appelle-t-on le phénomène naturel de transformation d\'une chenille en papillon ?',
    options: ['La Photosynthèse', 'La Métamorphose', 'La Mutation', 'La Mue'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Dans la chrysalide, le corps de la chenille se réorganise totalement pour donner naissance au papillon adulte.'
  },
  {
    id: 's6',
    categoryId: 'sciences',
    question: 'Quel composant biologique est souvent appelé la "centrale énergétique" de la cellule humaine ?',
    options: ['Le Noyau', 'Le Ribosome', 'La Mitochondrie', 'L\'Appareil de Golgi'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Les mitochondries produisent l\'ATP (adénosine triphosphate), la molécule d\'énergie de nos cellules.'
  },
  {
    id: 's7',
    categoryId: 'sciences',
    question: 'Combien d\'os un squelette humain adulte comporte-t-il environ ?',
    options: ['150 os', '206 os', '300 os', '250 os'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'Un bébé naît avec environ 270 os, mais plusieurs d\'entre eux se soudent en grandissant pour atteindre 206 os à l\'âge adulte.'
  },

  // ==================== ART & LITTÉRATURE ====================
  {
    id: 'a1',
    categoryId: 'art',
    question: 'Quel artiste italien de la Renaissance a sculpté le chef-d\'œuvre du "David" en marbre de Carrare ?',
    options: ['Léonard de Vinci', 'Raphaël', 'Michel-Ange', 'Donatello'],
    correctAnswerIndex: 2,
    difficulty: 'ado',
    explanation: 'Michel-Ange a sculpté cette statue de 5,17 mètres de haut entre 1501 et 1504 à Florence.'
  },
  {
    id: 'a2',
    categoryId: 'art',
    question: 'Quel écrivain français du XIXe siècle a écrit la fresque littéraire "La Comédie humaine" ?',
    options: ['Gustave Flaubert', 'Honoré de Balzac', 'Émile Zola', 'Stendhal'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Balzac a rédigé plus de 90 romans et nouvelles explorant toutes les strates de la société française.'
  },
  {
    id: 'a3',
    categoryId: 'art',
    question: 'Qui a peint le célèbre tableau surréaliste représentant des "montres molles" intitulé "La Persistance de la mémoire" ?',
    options: ['René Magritte', 'Salvador Dalí', 'Pablo Picasso', 'Joan Miró'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'Salvador Dalí a peint ces montres coulantes en 1831, devenues le symbole du temps qui s\'écoule.'
  },
  {
    id: 'a4',
    categoryId: 'art',
    question: 'Quel poète français du XIXe siècle est l\'auteur du recueil "Les Fleurs du mal" (1857) ?',
    options: ['Arthur Rimbaud', 'Paul Verlaine', 'Charles Baudelaire', 'Stéphane Mallarmé'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Son recueil fit scandale à sa sortie et fut même condamné pour "outrage aux bonnes mœurs".'
  },
  {
    id: 'a5',
    categoryId: 'art',
    question: 'Quel peintre impressionniste français est mondialement célèbre pour sa série de peintures des "Nymphéas" dans son jardin de Giverny ?',
    options: ['Claude Monet', 'Auguste Renoir', 'Edgar Degas', 'Paul Cézanne'],
    correctAnswerIndex: 0,
    difficulty: 'enfant',
    explanation: 'Claude Monet a peint près de 250 huiles sur toile représentant son bassin aux nymphéas à Giverny.'
  },

  // ==================== SPORTS & LOISIRS ====================
  {
    id: 'sp1',
    categoryId: 'sports',
    question: 'Combien d\'anneaux de couleurs différentes composent le symbole des Jeux Olympiques ?',
    options: ['4 anneaux', '5 anneaux', '6 anneaux', '7 anneaux'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Les 5 anneaux (bleu, jaune, noir, vert, rouge) représentent l\'union des 5 continents.'
  },
  {
    id: 'sp2',
    categoryId: 'sports',
    question: 'Quel pilote de Formule 1 détient le record du plus grand nombre de victoires en Grand Prix (plus de 100 victoires) ?',
    options: ['Michael Schumacher', 'Ayrton Senna', 'Lewis Hamilton', 'Max Verstappen'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Lewis Hamilton a dépassé le seuil des 100 victoires en F1 et partage le record de 7 titres mondiaux avec Schumacher.'
  },
  {
    id: 'sp3',
    categoryId: 'sports',
    question: 'Dans quel sport de ballon s\'affronte-t-on avec un ballon ovale sans pouvoir faire de passe vers l\'avant à la main ?',
    options: ['Le Football', 'Le Handball', 'Le Rugby', 'Le Basketball'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'Au rugby à XV ou à XIII, toute passe vers l\'avant commise à la main constitue un en-avant !'
  },
  {
    id: 'sp4',
    categoryId: 'sports',
    question: 'Sur quel type de court en gazon vert se déroule chaque été le prestigieux tournoi du Grand Chelem de Wimbledon ?',
    options: ['Du Béton', 'De la Terre battue', 'Du Gazon naturel', 'Du Moquette synthétique'],
    correctAnswerIndex: 2,
    difficulty: 'enfant',
    explanation: 'Wimbledon est le plus ancien tournoi de tennis au monde et exige la tenue vestimentaire blanche pour les joueurs.'
  },

  // ==================== POP CULTURE & MUSIQUE ====================
  {
    id: 'p1',
    categoryId: 'popculture',
    question: 'Quel groupe de rock britannique a chanté le morceau légendaire "Bohemian Rhapsody" en 1975 ?',
    options: ['The Rolling Stones', 'Led Zeppelin', 'Queen', 'Pink Floyd'],
    correctAnswerIndex: 2,
    difficulty: 'ado',
    explanation: 'Porté par la voix spectaculaire de Freddie Mercury, ce titre mélange opéra et hard rock.'
  },
  {
    id: 'p2',
    categoryId: 'popculture',
    question: 'Quel est le nom de la princesse du Royaume Champignon que Mario doit secourir dans les jeux vidéo Nintendo ?',
    options: ['Princesse Zelda', 'Princesse Peach', 'Princesse Daisy', 'Princesse Harmonie'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Depuis 1985, le monstrueux Bowser tente d\'enlever la Princesse Peach au grand dam de Mario !'
  },
  {
    id: 'p3',
    categoryId: 'popculture',
    question: 'Quel compositeur autrichien du XVIIIe siècle, enfant prodige, est l\'auteur de la "Flûte enchantée" et du "Requiem" ?',
    options: ['Ludwig van Beethoven', 'Johann Sebastian Bach', 'Wolfgang Amadeus Mozart', 'Joseph Haydn'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Mozart a composé plus de 600 œuvres virtuoses avant sa mort précoce à l\'âge de 35 ans.'
  },

  // ==================== GASTRONOMIE ====================
  {
    id: 'f1',
    categoryId: 'gastronomie',
    question: 'Quelle spécialité culinaire provençale est une soupe traditionnelle de poissons mijotés servis avec de la rouille ?',
    options: ['La Ratatouille', 'La Bouillabaisse', 'L\'Aïoli', 'La Salade Niçoise'],
    correctAnswerIndex: 1,
    difficulty: 'ado',
    explanation: 'Originaire de Marseille, la bouillabaisse associait historiquement les poissons de roches de la pêche du jour.'
  },
  {
    id: 'f2',
    categoryId: 'gastronomie',
    question: 'Quel fromage AOP à pâte persillée est fabriqué exclusivement à partir de lait cru de brebis dans l\'Aveyron ?',
    options: ['Le Camembert', 'Le Roquefort', 'Le Saint-Nectaire', 'Le Reblochon'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Le Roquefort affine dans les caves naturelles des falaises du Combalou à Roquefort-sur-Soulzon.'
  },
  {
    id: 'f3',
    categoryId: 'gastronomie',
    question: 'Quel petit gâteau bordelais aromatisé à la vanille et au rhum possède une croûte caramélisée et un cœur moelleux ?',
    options: ['Le Macaron', 'Le Canelé', 'Le Financier', 'Le Madeleinette'],
    correctAnswerIndex: 1,
    difficulty: 'enfant',
    explanation: 'Cuit dans un moule en cuivre cannelé, ce gâteau est une fierté de la pâtisserie bordelaise.'
  }
];

export const QUESTIONS_DATABASE: Question[] = [
  ...CURATED_QUESTIONS,
  ...generateMassiveQuestionsDatabase()
];

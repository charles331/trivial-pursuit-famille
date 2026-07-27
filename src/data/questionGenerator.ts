import { Question, CategoryId, DifficultyLevel } from '../types';

// Real authentic culture générale trivia datasets across 8 categories & 3 difficulty levels (Enfant, Ado, Adulte)

export function generateMassiveQuestionsDatabase(): Question[] {
  const allQuestions: Question[] = [];
  let idCounter = 1000;

  const createQ = (
    cat: CategoryId,
    diff: DifficultyLevel,
    qText: string,
    correct: string,
    wrongs: string[],
    exp: string
  ): Question => {
    const options = [correct, ...wrongs];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return {
      id: `gen_q_${idCounter++}`,
      categoryId: cat,
      question: qText,
      options,
      correctAnswerIndex: options.indexOf(correct),
      difficulty: diff,
      explanation: exp
    };
  };

  // ==================== HISTOIRE ====================
  // Enfants
  createQ('histoire', 'enfant', 'Comment s\'appelaient les habitants de la Gaule à l\'époque de Jules César ?', 'Les Gaulois', ['Les Romains', 'Les Vikings', 'Les Égyptiens'], 'Les Gaulois habitaient la Gaule avant la conquête romaine. Astérix en est le héros de BD le plus célèbre !');
  createQ('histoire', 'enfant', 'Quel monument parisien a été construit pour l\'Exposition Universelle de 1889 ?', 'La Tour Eiffel', ['L\'Arc de Triomphe', 'Le Louvre', 'Notre-Dame'], 'Gustave Eiffel a conçu la tour qui porte son nom pour célébrer le centenaire de la Révolution française.');
  createQ('histoire', 'enfant', 'Dans quel pays antique construisait-on des pyramides pour les pharaons ?', 'En Égypte', ['En Grèce', 'En Italie', 'En Chine'], 'Les pyramides de Gizeh servaient de tombeaux monumentaux aux grands pharaons d\'Égypte.');
  createQ('histoire', 'enfant', 'Quel roi de France est célèbre pour avoir aimé les châteaux et la Renaissance (et gagné la bataille de Marignan en 1515) ?', 'François Ier', ['Louis XIV', 'Charlemagne', 'Henri IV'], 'François Ier a fait venir Léonard de Vinci en France et fait bâtir le château de Chambord.');
  createQ('histoire', 'enfant', 'Comment s\'appelait le célèbre paquebot qui a coulé en 1912 après avoir heurté un iceberg ?', 'Le Titanic', ['Le Queen Mary', 'Le Bretagne', 'Le Normandie'], 'Le Titanic était le plus grand et le plus luxueux paquebot de son époque.');

  // Ados
  createQ('histoire', 'ado', 'En quelle année a débuté la Première Guerre mondiale ?', '1914', ['1918', '1939', '1905'], 'La Première Guerre mondiale s\'est déroulée de 1914 à 1918.');
  createQ('histoire', 'ado', 'Quel célèbre empereur français a perdu la bataille de Waterloo en 1815 ?', 'Napoléon Ier', ['Napoléon III', 'Louis XVIII', 'Charles X'], 'La défaite de Waterloo en Belgique scelle la fin définitive de l\'Empire napoléonien.');
  createQ('histoire', 'ado', 'Quelle héroïne a délivré la ville d\'Orléans en 1429 ?', 'Jeanne d\'Arc', ['Marie Curie', 'Aliénor d\'Aquitaine', 'Olympe de Gouges'], 'Jeanne d\'Arc a guidé les troupes françaises avant d\'être brûlée à Rouen en 1431.');
  createQ('histoire', 'ado', 'Quel mur, symbole de la Guerre Froide, est tombé le 9 novembre 1989 ?', 'Le Mur de Berlin', ['La Grande Muraille', 'Le Mur d\'Hadrien', 'Le Mur des Lamentations'], 'La chute du mur de Berlin a précédé la réunification de l\'Allemagne en 1990.');
  createQ('histoire', 'ado', 'Quel roi d\'Angleterre a fondé l\'Église anglicane et eu 6 épouses ?', 'Henri VIII', ['Richard Cœur de Lion', 'Guillaume le Conquérant', 'Charles Ier'], 'Henri VIII s\'est séparé de l\'Église catholique romaine pour pouvoir annuler son mariage.');

  // Adultes
  createQ('histoire', 'adulte', 'Quel traité signé en 1919 a officiellement mis fin à la Première Guerre mondiale ?', 'Le Traité de Versailles', ['Le Traité de Rome', 'Le Traité de Vienne', 'Le Traité de Paris'], 'Signé le 28 juin 1919 dans la Galerie des Glaces du château de Versailles.');
  createQ('histoire', 'adulte', 'Quel général carthaginois a franchi les Alpes avec ses éléphants de guerre ?', 'Hannibal Barca', ['Scipion l\'Africain', 'Vercingétorix', 'Mithridate'], 'Hannibal a mené la deuxième guerre punique contre la République romaine.');
  createQ('histoire', 'adulte', 'Quel pharaon de la XVIIIe dynastie a instauré le culte monothéiste d\'Aton ?', 'Akhenaton', ['Toutânkhamon', 'Ramsès II', 'Séti Ier'], 'Akhenaton et son épouse Néfertiti ont déplacé la capitale égyptienne à Amarna.');
  createQ('histoire', 'adulte', 'Quel homme d\'État français était surnommé "Le Chancelier de Fer" en Allemagne ?', 'Otto von Bismarck', ['Metternich', 'Konrad Adenauer', 'Cavour'], 'Bismarck est l\'artisan majeur de l\'unification allemande au XIXe siècle.');
  createQ('histoire', 'adulte', 'En quelle année l\'Édit de Nantes a-t-il été signé par Henri IV ?', '1598', ['1685', '1515', '1789'], 'L\'Édit de Nantes accordait la liberté de culte aux protestants en France.');

  // ==================== GÉOGRAPHIE ====================
  // Enfants
  createQ('geographie', 'enfant', 'Quelle est la capitale de la France ?', 'Paris', ['Lyon', 'Marseille', 'Bordeaux'], 'Paris est traversée par la Seine et abrite la Tour Eiffel.');
  createQ('geographie', 'enfant', 'Quel est le plus grand océan de la planète Terre ?', 'L\'Océan Pacifique', ['L\'Océan Atlantique', 'L\'Océan Indien', 'L\'Océan Arctique'], 'L\'océan Pacifique couvre plus d\'un tiers de la surface du globe terrestre.');
  createQ('geographie', 'enfant', 'Dans quel pays peut-on voir la Grande Muraille, visible depuis l\'espace ?', 'En Chine', ['Au Japon', 'En Inde', 'En Égypte'], 'La Grande Muraille de Chine mesure plus de 21 000 kilomètres de long.');
  createQ('geographie', 'enfant', 'Sur quel continent se trouve la forêt amazonienne et le Brésil ?', 'L\'Amérique du Sud', ['L\'Afrique', 'L\'Asie', 'L\'Europe'], 'L\'Amérique du Sud abrite le plus grand bassin fluvial du monde.');
  createQ('geographie', 'enfant', 'Quelle est la capitale de l\'Italie, connue pour le Colisée ?', 'Rome', ['Venise', 'Milan', 'Florence'], 'Rome est surnommée la Ville Éternelle.');

  // Ados
  createQ('geographie', 'ado', 'Quelle est la capitale du Canada ?', 'Ottawa', ['Toronto', 'Montréal', 'Vancouver'], 'Ottawa a été choisie par la reine Victoria pour être la capitale canadienne.');
  createQ('geographie', 'ado', 'Quel fleuve d\'Afrique est le plus long fleuve du monde (ex æquo avec l\'Amazone) ?', 'Le Nil', ['Le Congo', 'Le Niger', 'Le Zambèze'], 'Le Nil traverse 11 pays africains avant de se jeter dans la mer Méditerranée.');
  createQ('geographie', 'ado', 'Quelle est la capitale de l\'Australie ?', 'Canberra', ['Sydney', 'Melbourne', 'Brisbane'], 'Canberra a été construite ex nihilo pour départager la rivalité entre Sydney et Melbourne.');
  createQ('geographie', 'ado', 'Dans quel pays se trouve le majestueux volcan Taj Mahal ?', 'En Inde', ['Au Népal', 'Au Pakistan', 'En Indonésie'], 'Le Taj Mahal est un mausolée de marbre blanc situé à Agra en Inde.');
  createQ('geographie', 'ado', 'Quel détroit sépare l\'Espagne du Maroc ?', 'Le détroit de Gibraltar', ['Le détroit de Béring', 'Le détroit de Malacca', 'Le Bosphore'], 'À son endroit le plus étroit, seules 14 kilomètres séparent l\'Europe de l\'Afrique.');

  // Adultes
  createQ('geographie', 'adulte', 'Quelle est la capitale de la Bolivie (siège du gouvernement) ?', 'La Paz', ['Sucre', 'Santa Cruz', 'Cochabamba'], 'Sucre est la capitale constitutionnelle tandis que La Paz abrite le siège du gouvernement.');
  createQ('geographie', 'adulte', 'Quel est le lac le plus profond du monde situé en Sibérie ?', 'Le lac Baïkal', ['Le lac Titicaca', 'Le lac Supérieur', 'Le lac Victoria'], 'Le lac Baïkal contient 20% des réserves mondiales d\'eau douce liquide.');
  createQ('geographie', 'adulte', 'Dans quel pays d\'Amérique du Sud se trouve le désert d\'Atacama ?', 'Le Chili', ['L\'Argentine', 'Le Pérou', 'La Bolivie'], 'Le désert d\'Atacama est l\'un des endroits les plus arides de la planète.');
  createQ('geographie', 'adulte', 'Quelle ville est la capitale administrative de l\'Afrique du Sud ?', 'Pretoria', ['Le Cap', 'Johannesbourg', 'Bloemfontein'], 'L\'Afrique du Sud possède 3 capitales officielles : Pretoria, Le Cap et Bloemfontein.');
  createQ('geographie', 'adulte', 'Quel pays compte le plus grand nombre d\'îles au monde (plus de 220 000 îles) ?', 'La Suède', ['L\'Indonésie', 'La Norvège', 'Les Philippines'], 'La Suède compte plus de 221 800 îles sur son territoire.');

  // ==================== CINÉMA & SÉRIES ====================
  // Enfants
  createQ('cinema', 'enfant', 'Dans le dessin animé "Le Roi Lion", quel est le prénom du jeune lionceau héros ?', 'Simba', ['Mufasa', 'Scar', 'Timon'], 'Simba devient le Roi de la Terre des Lions guidé par Rafiki.');
  createQ('cinema', 'enfant', 'Quel bonhomme de neige adore les câlins chauds dans "La Reine des Neiges" ?', 'Olaf', ['Sven', 'Kristoff', 'Hans'], 'Olaf a été créé par la magie d\'Elsa.');
  createQ('cinema', 'enfant', 'Quel petit poisson orange cherche son papa dans un film Pixar culte ?', 'Nemo', ['Marin', 'Dory', 'Bulle'], 'Nemo est un poisson-clown vivant dans la Grande Barrière de corail.');
  createQ('cinema', 'enfant', 'Quel sorcier à lunettes porte une cicatrice en forme d\'éclair sur le front ?', 'Harry Potter', ['Ron Weasley', 'Drago Malefoy', 'Dumbledore'], 'Harry Potter étudie la magie à l\'école de Poudlard.');
  createQ('cinema', 'enfant', 'Dans "Toy Story", quel est le nom du célèbre cow-boy en jouet ?', 'Woody', ['Buzz l\'Éclair', 'Zigzag', 'Jessie'], 'Woody est le jouet préféré du petit Andy.');

  // Ados
  createQ('cinema', 'ado', 'Quel super-héros Marvel est en réalité le milliardaire Tony Stark ?', 'Iron Man', ['Captain America', 'Thor', 'Spider-Man'], 'Iron Man porte une armure high-tech alimentée par un réacteur Arc.');
  createQ('cinema', 'ado', 'Dans la saga "Star Wars", qui est le père de Luke Skywalker ?', 'Darth Vader (Dark Vador)', ['Darth Sidious', 'Obi-Wan Kenobi', 'Yoda'], 'La réplique culte est : "Non, je suis ton père."');
  createQ('cinema', 'ado', 'Quel film de James Cameron se déroule sur la planète bleue Pandora ?', 'Avatar', ['Titanic', 'Abyss', 'Terminator'], 'Avatar met en scène le peuple Na\'vi en symbiose avec la nature.');
  createQ('cinema', 'ado', 'Dans quelle série Netflix des adolescents affrontent-ils le Monde à l\'Envers à Hawkins ?', 'Stranger Things', ['Wednesday', '13 Reasons Why', 'Riverdale'], 'Eleven et ses amis affrontent le Démogorgon et Vecna.');
  createQ('cinema', 'ado', 'Quel réalisateur a mis en scène "Jurassic Park" et "E.T. l\'extra-terrestre" ?', 'Steven Spielberg', ['George Lucas', 'Christopher Nolan', 'James Cameron'], 'Steven Spielberg est l\'un des cinéastes les plus célèbres d\'Hollywood.');

  // Adultes
  createQ('cinema', 'adulte', 'Quel film a remporté 11 Oscars en 1998, égalant le record de Ben-Hur ?', 'Titanic', ['Gladiator', 'Avatar', 'Le Seigneur des Anneaux'], 'Réalisé par James Cameron avec Leonardo DiCaprio et Kate Winslet.');
  createQ('cinema', 'adulte', 'Quel réalisateur est le maître du suspense derrière "Psychose" et "Les Oiseaux" ?', 'Alfred Hitchcock', ['Stanley Kubrick', 'Orson Welles', 'Billy Wilder'], 'Hitchcock est célèbre pour sa maîtrise de la tension cinématographique.');
  createQ('cinema', 'adulte', 'Dans quel film de Quentin Tarantino trouve-t-on le personnage de Vincent Vega ?', 'Pulp Fiction', ['Reservoir Dogs', 'Kill Bill', 'Django Unchained'], 'John Travolta incarne Vincent Vega aux côtés de Samuel L. Jackson.');
  createQ('cinema', 'adulte', 'Quel acteur a remporté l\'Oscar du meilleur acteur pour "Joker" en 2020 ?', 'Joaquin Phoenix', ['Heath Ledger', 'Jack Nicholson', 'Jared Leto'], 'Joaquin Phoenix a livré une interprétation saisissante d\'Arthur Fleck.');
  createQ('cinema', 'adulte', 'Quel film d\'anticipation de Ridley Scott (1982) met en scène des androïdes nommés Replicants ?', 'Blade Runner', ['Alien', 'Gladiator', 'Prometheus'], 'Harrison Ford y joue le rôle du Blade Runner Rick Deckard.');

  // ==================== SCIENCES & NATURE ====================
  // Enfants
  createQ('sciences', 'enfant', 'Quelle est la planète la plus proche du Soleil dans notre système solaire ?', 'Mercure', ['Vénus', 'La Terre', 'Mars'], 'Mercure fait le tour du Soleil en seulement 88 jours.');
  createQ('sciences', 'enfant', 'Comment s\'appelle le gaz que les humains respirent pour vivre ?', 'L\'Oxygène', ['Le Dioxyde de carbone', 'L\'Azote', 'L\'Hélium'], 'L\'oxygène constitue environ 21% de l\'air de l\'atmosphère terrestre.');
  createQ('sciences', 'enfant', 'Quel mammifère marin est le plus grand animal vivant sur la Terre ?', 'La Baleine Bleue', ['Le Requin Baleine', 'L\'Opaque', 'Le Grand Requin Blanc'], 'La baleine bleue peut mesurer plus de 30 mètres de long et peser 180 tonnes.');
  createQ('sciences', 'enfant', 'Combien de pattes ont les insectes (comme les fourmis ou les abeilles) ?', '6 pattes', ['8 pattes', '4 pattes', '10 pattes'], 'Les insectes ont 6 pattes, tandis que les arachnides (araignées) en ont 8.');
  createQ('sciences', 'enfant', 'Quelle force fait tomber les objets vers le sol quand on les lâche ?', 'La Gravité', ['Le Magnétisme', 'La Pression', 'L\'Électricité'], 'Isaac Newton a formulé la loi de la gravitation universelle.');

  // Ados
  createQ('sciences', 'ado', 'Quel est le symbole chimique de l\'or dans le tableau périodique ?', 'Au', ['Ag', 'Fe', 'Cu'], 'Au vient du mot latin "Aurum" qui signifie aurore brillante.');
  createQ('sciences', 'ado', 'Comment s\'appelle la molécule qui porte l\'information génétique dans nos cellules ?', 'L\'ADN', ['L\'ARN', 'Une protéine', 'Un lipide'], 'L\'acide désoxyribonucléique a la forme d\'une double hélice.');
  createQ('sciences', 'ado', 'Quel savant a découvert la pénicilline (le premier antibiotique) en 1928 ?', 'Alexander Fleming', ['Louis Pasteur', 'Marie Curie', 'Robert Koch'], 'Fleming a remarqué qu\'une moisissure tuait les bactéries dans son laboratoire.');
  createQ('sciences', 'ado', 'Quelle étoile est au centre de notre système solaire ?', 'Le Soleil', ['Proxima du Centaure', 'Sirius', 'Étoile Polaire'], 'Le Soleil contient 99,8% de la masse totale du système solaire.');
  createQ('sciences', 'ado', 'Quel organe du corps humain filtre le sang pour produire l\'urine ?', 'Les Reins', ['Le Foie', 'L\'Estomac', 'La Rate'], 'Nous avons deux reins situés dans le bas du dos.');

  // Adultes
  createQ('sciences', 'adulte', 'Quel est l\'élément chimique le plus abondant dans l\'univers ?', 'L\'Hydrogène', ['L\'Hélium', 'L\'Oxygène', 'Le Carbone'], 'L\'hydrogène représente environ 75% de la matière ordinaire de l\'univers.');
  createQ('sciences', 'adulte', 'Quelle particule subatomique possède une charge électrique négative ?', 'L\'Électron', ['Le Proton', 'Le Neutron', 'Le Quarks'], 'Les électrons orbitent autour du noyau atomique.');
  createQ('sciences', 'adulte', 'Quelle est la vitesse de la lumière dans le vide ?', '300 000 km/s', ['150 000 km/s', '1 000 000 km/s', '340 m/s'], 'En physique, la vitesse de la lumière c vaut environ 299 792 km/s.');
  createQ('sciences', 'adulte', 'Combien de cœurs possède une pieuvre (poulpe) ?', '3 cœurs', ['1 cœur', '2 cœurs', '4 cœurs'], 'Deux cœurs pompent le sang vers les branchies, et un vers le reste du corps.');
  createQ('sciences', 'adulte', 'Quel scientifique a énoncé la théorie de la relativité restreinte en 1905 ?', 'Albert Einstein', ['Niels Bohr', 'Max Planck', 'Isaac Newton'], 'Albert Einstein a révolutionné notre compréhension de l\'espace et du temps.');

  // ==================== ART & LITTÉRATURE ====================
  // Enfants
  createQ('art', 'enfant', 'Qui a peint le tableau très célèbre de "La Joconde" au sourire mystérieux ?', 'Léonard de Vinci', ['Pablo Picasso', 'Claude Monet', 'Vincent van Gogh'], 'La Joconde (Mona Lisa) est exposée au musée du Louvre à Paris.');
  createQ('art', 'enfant', 'Quel écrivain français a écrit les "Fables" comme "Le Corbeau et le Renard" ?', 'Jean de La Fontaine', ['Victor Hugo', 'Molière', 'Jules Verne'], 'La Fontaine utilisait des animaux pour donner des leçons de morale amusantes.');
  createQ('art', 'enfant', 'Quel peintre hollandais s\'est coupé l\'oreille et a peint "La Nuit Étoilée" ?', 'Vincent van Gogh', ['Rembrandt', 'Monet', 'Dalí'], 'Van Gogh utilisait des couleurs éclatantes et des coups de pinceau très expressifs.');
  createQ('art', 'enfant', 'Dans quel conte de fées une jeune fille perd-elle sa pantoufle de verre au bal ?', 'Cendrillon', ['Blanche-Neige', 'La Belle au Bois Dormant', 'Ripounce'], 'Cendrillon doit quitter le bal avant les douze coups de minuit.');

  // Ados
  createQ('art', 'ado', 'Qui a écrit le chef-d\'œuvre littéraire "Les Misérables" avec Jean Valjean ?', 'Victor Hugo', ['Émile Zola', 'Gustave Flaubert', 'Honoré de Balzac'], 'Victor Hugo y dénonce la pauvreté et l\'injustice sociale du XIXe siècle.');
  createQ('art', 'ado', 'Quel auteur dramatique a écrit des pièces comiques célèbres comme "L\'Avare" et "Le Malade Imaginaire" ?', 'Molière', ['Racine', 'Corneille', 'Beaumarchais'], 'Jean-Baptiste Poquelin, dit Molière, est le plus grand auteur de théâtre français.');
  createQ('art', 'ado', 'Quel peintre espagnol est le maître du surréalisme aux montres molles ?', 'Salvador Dalí', ['Pablo Picasso', 'Joan Miró', 'Francisco de Goya'], 'Son tableau le plus célèbre est "La Persistance de la mémoire".');
  createQ('art', 'ado', 'Qui a sculpté la célèbre statue en bronze "Le Penseur" ?', 'Auguste Rodin', ['Camille Claudel', 'Michel-Ange', 'Bernin'], 'Rodin est l\'un des plus grands sculpteurs de l\'époque moderne.');

  // Adultes
  createQ('art', 'adulte', 'Quel mouvement artistique rassemble Picasso, Braque et Gris au début du XXe siècle ?', 'Le Cubisme', ['Le Surréalisme', 'Le Fauvisme', 'L\'Expressionnisme'], 'Le cubisme décompose les formes en éléments géométriques.');
  createQ('art', 'adulte', 'Qui est l\'auteur du roman dystopique "1984" publié en 1949 ?', 'George Orwell', ['Aldous Huxley', 'Ray Bradbury', 'H.G. Wells'], 'Orwell y invente les concepts de Big Brother et de la Novlangue.');
  createQ('art', 'adulte', 'Quel peintre impressionniste est célèbre pour sa série de tableaux des "Nymphéas" à Giverny ?', 'Claude Monet', ['Édouard Manet', 'Paul Cézanne', 'Pierre-Auguste Renoir'], 'Monet a peint les bassins de son jardin de Giverny pendant des années.');
  createQ('art', 'adulte', 'Qui a composé la Symphonie n°9 contenant l\'Hymne à la Joie ?', 'Ludwig van Beethoven', ['Mozart', 'Bach', 'Chopin'], 'Beethoven était totalement sourd lorsqu\'il a composé cette œuvre magistrale.');

  // ==================== SPORTS ====================
  // Enfants
  createQ('sports', 'enfant', 'Combien de joueurs composent une équipe de football sur le terrain ?', '11 joueurs', ['9 joueurs', '7 joueurs', '15 joueurs'], 'Chaque équipe compte 11 joueurs, dont 1 gardien de but.');
  createQ('sports', 'enfant', 'Tous les combien d\'années ont lieu les Jeux Olympiques d\'été ?', 'Tous les 4 ans', ['Tous les ans', 'Tous les 2 ans', 'Tous les 5 ans'], 'Les JO célèbrent le sport mondial dans une grande ville hôte.');
  createQ('sports', 'enfant', 'Dans quel sport utilise-t-on une raquette et une petite balle jaune fluo ?', 'Le Tennis', ['Le Badminton', 'Le Ping-pong', 'Le Squash'], 'Les grands tournois du Grand Chelem incluent Roland-Garros et Wimbledon.');
  createQ('sports', 'enfant', 'Quel grand champion français de judo a remporté plusieurs médailles d\'or olympiques ?', 'Teddy Riner', ['Kylian Mbappé', 'Antoine Dupont', 'Martin Fourcade'], 'Teddy Riner est l\'un des judokas les plus titrés de tous les temps.');

  // Ados
  createQ('sports', 'ado', 'Dans quel sport s\'illustre la légende américaine Michael Jordan ?', 'Le Basket-ball', ['Le Baseball', 'Le Football américain', 'L\'Athlétisme'], 'Michael Jordan a remporté 6 titres NBA avec les Chicago Bulls.');
  createQ('sports', 'ado', 'Quel pays a remporté la Coupe du Monde de Football en 2018 en Russie ?', 'La France', ['La Croatie', 'Le Brésil', 'L\'Allemagne'], 'L\'équipe de France a battu la Croatie 4-2 en finale à Moscou.');
  createQ('sports', 'ado', 'Quelle est la distance exacte d\'un marathon officiel ?', '42,195 km', ['40 km', '50 km', '35 km'], 'La distance s\'inspire de la légende grecque du messager Phidippidès.');
  createQ('sports', 'ado', 'Combien de points vaut un essai au rugby à XV ?', '5 points', ['3 points', '7 points', '2 points'], 'L\'essai peut être transformé pour apporter 2 points supplémentaires.');

  // Adultes
  createQ('sports', 'adulte', 'Quel pays détient le record du plus grand nombre de Coupes du Monde de football (5 titres) ?', 'Le Brésil', ['L\'Allemagne', 'L\'Italie', 'L\'Argentine'], 'Le Brésil l\'a emporté en 1958, 1962, 1970, 1994 et 2002.');
  createQ('sports', 'adulte', 'Quel tennisman espagnol détient le record absolu de victoires à Roland-Garros (14 titres) ?', 'Rafael Nadal', ['Novak Djokovic', 'Roger Federer', 'Carlos Alcaraz'], 'Surnommé le Roi de la Terre Battue.');
  createQ('sports', 'adulte', 'Quel coureur cycliste était surnommé "Le Cannibale" ?', 'Eddy Merckx', ['Bernard Hinault', 'Jacques Anquetil', 'Miguel Indurain'], 'Le Belge Eddy Merckx a gagné 5 Tours de France et 34 étapes.');
  createQ('sports', 'adulte', 'En quelle année la France a-t-elle accueilli les Jeux Olympiques d\'été à Paris récemment ?', '2024', ['2020', '2016', '2012'], 'Paris 2024 a célébré le centenaire des JO de 1924.');

  // ==================== POP CULTURE ====================
  // Enfants
  createQ('popculture', 'enfant', 'Quel est le jeu vidéo de blocs le plus vendu au monde ?', 'Minecraft', ['Roblox', 'Fortnite', 'Tetris'], 'Dans Minecraft, les joueurs explorent et construisent des mondes en pixels 3D.');
  createQ('popculture', 'enfant', 'Quel célèbre plombier moustachu en salopette rouge sauve la Princesse Peach ?', 'Mario', ['Luigi', 'Wario', 'Yoshi'], 'Mario est la mascotte emblématique de la société Nintendo.');
  createQ('popculture', 'enfant', 'Quel Pokémon jaune électrique dit son nom en faisant des étincelles ?', 'Pikachu', ['Salamèche', 'Carapuce', 'Bulbizarre'], 'Pikachu est le fidèle compagnon de Sacha dans le dessin animé.');
  createQ('popculture', 'enfant', 'Quel super-héros grimpe aux murs et lance des toiles d\'araignée à New York ?', 'Spider-Man', ['Batman', 'Superman', 'Flash'], 'Peter Parker devient Spider-Man après avoir été piqué par une araignée radioactive.');

  // Ados
  createQ('popculture', 'ado', 'Quel jeu de battle royale d\'Epic Games permet de danser et construire ?', 'Fortnite', ['PUBG', 'Apex Legends', 'Call of Duty'], 'Fortnite a popularisé les passes de combat et les événements en direct.');
  createQ('popculture', 'ado', 'Quelle chanteuse américaine superstar a lancé le phénoménal "Eras Tour" ?', 'Taylor Swift', ['Beyoncé', 'Rihanna', 'Ariana Grande'], 'The Eras Tour a battu tous les records d\'affluence mondiaux.');
  createQ('popculture', 'ado', 'Quel groupe de musique britannique chantait "Bohemian Rhapsody" ?', 'Queen', ['The Beatles', 'The Rolling Stones', 'Pink Floyd'], 'Emmené par la voix spectaculaire de Freddie Mercury.');
  createQ('popculture', 'ado', 'Quel réseau social est célèbre pour ses vidéos courtes et ses tendances musicales ?', 'TikTok', ['Instagram', 'Snapchat', 'YouTube'], 'TikTok a été lancé par l\'entreprise ByteDance.');

  // Adultes
  createQ('popculture', 'adulte', 'Quel compositeur de génie a créé la bande originale de Star Wars, Harry Potter et Indiana Jones ?', 'John Williams', ['Hans Zimmer', 'Ennio Morricone', 'Howard Shore'], 'John Williams a remporté 5 Oscars pour ses musiques de films inoubliables.');
  createQ('popculture', 'adulte', 'Dans quel jeu vidéo légendaire de Rockstar explore-t-on Los Santos ?', 'GTA V (Grand Theft Auto)', ['Red Dead Redemption', 'Cyberpunk', 'Mafia'], 'GTA V est l\'un des produits culturels les plus rentables de l\'histoire.');
  createQ('popculture', 'adulte', 'Quel groupe suédois des années 70 chante "Dancing Queen" et "Mamma Mia" ?', 'ABBA', ['Boney M.', 'Bee Gees', 'A-ha'], 'ABBA a remporté l\'Eurovision en 1974 avec la chanson Waterloo.');
  createQ('popculture', 'adulte', 'Quel festival de musique californien se déroule chaque année à Indio ?', 'Coachella', ['Tomorrowland', 'Glastonbury', 'Lollapalooza'], 'Coachella est réputé pour sa programmation musicale et ses looks mode.');

  // ==================== GASTRONOMIE ====================
  // Enfants
  createQ('gastronomie', 'enfant', 'De quel pays est originaire la pizza Margherita au fromage et à la tomate ?', 'De l\'Italie', ['De la France', 'Des États-Unis', 'De l\'Espagne'], 'La pizza Margherita a été créée à Naples en l\'honneur de la reine Marguerite.');
  createQ('gastronomie', 'enfant', 'Quelle viennoiserie française feuilletée en forme de croissant mange-t-on au petit-déjeuner ?', 'Le Croissant', ['Le Pain au chocolat', 'La Brioche', 'Le Chausson aux pommes'], 'Le croissant est un symbole incontournable de la boulangerie française.');
  createQ('gastronomie', 'enfant', 'Quel est l\'ingrédient principal pour fabriquer du chocolat ?', 'Le Cacao', ['Le Café', 'La Vanille', 'Le Caramel'], 'Les fèves de cacao sont récoltées dans les cabosses du cacaoyer.');
  createQ('gastronomie', 'enfant', 'Quel légume orange est réputé pour être bon pour la vue et adoré par les lapins ?', 'La Carotte', ['La Courgette', 'La Tomate', 'Le Poivron'], 'La carotte est riche en bêta-carotène.');

  // Ados
  createQ('gastronomie', 'ado', 'Quelle spécialité culinaire japonaise se compose de riz vinaigré et de poisson cru ?', 'Les Sushis', ['Les Ramen', 'Les Gyozas', 'Les Tempura'], 'Les sushis et sashimis sont emblématiques de la gastronomie nippone.');
  createQ('gastronomie', 'ado', 'Quel fromage AOP de Savoie à pâte pressée cuite sert à préparer une fondue savoyarde ?', 'Le Beaufort (ou Comté/Abondance)', ['Le Camembert', 'Le Roquefort', 'Le Brie'], 'Le Beaufort est surnommé le Prince des Gruyères.');
  createQ('gastronomie', 'ado', 'De quel légume est principalement faite la soupe provençale Ratatouille ?', 'De courgettes, aubergines et tomates', ['De pommes de terre', 'De poireaux', 'De carottes'], 'La ratatouille fait mijoter tomates, aubergines, courgettes et poivrons à l\'huile d\'olive.');
  createQ('gastronomie', 'ado', 'Quel petit gâteau bordelais aromatisé au rhum et à la vanille a une croûte caramélisée ?', 'Le Canelé', ['Le Macaron', 'Le Financier', 'La Madeleine'], 'Le canelé est cuit dans de petits moules en cuivre cannelés.');

  // Adultes
  createQ('gastronomie', 'adulte', 'Quel fromage AOP d\'Aveyron est fait à partir de lait cru de brebis dans des caves naturelles ?', 'Le Roquefort', ['Le Bleus d\'Auvergne', 'Le Gorgonzola', 'Le Stilton'], 'Le Roquefort affine dans les caves du village de Roquefort-sur-Soulzon.');
  createQ('gastronomie', 'adulte', 'Quelle sauce émulsionnée chaude est faite à base de beurre, jaunes d\'œufs et d\'estragon ?', 'La sauce Béarnaise', ['La sauce Hollandaise', 'La sauce Mayonnaise', 'La sauce Vinaigrette'], 'Accompagnement traditionnel des viandes rouges grillées.');
  createQ('gastronomie', 'adulte', 'Quel est le champignon souterrain le plus précieux et parfumé, surnommé le Diamant Noir ?', 'La Truffe Noire (du Périgord)', ['Le Cèpe', 'La Morille', 'La Girolle'], 'La truffe noire (Tuber melanosporum) se récolte au pied des chênes.');
  createQ('gastronomie', 'adulte', 'De quel pays est originaire le fameux dessert Tiramisu au mascarpone et au café ?', 'L\'Italie', ['L\'Espagne', 'La Grèce', 'La France'], 'Tiramisu signifie littéralement "remonte-moi le moral".');

  return allQuestions;
}

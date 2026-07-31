import { Question } from '../../types';

type Q = [string, [string, string, string, string], number, string];

const DATA: Q[] = [
  ["Quel groupe belge a enregistré « Not an Addict » ?", ["K's Choice", "dEUS", "Hooverphonic", "Soulwax"], 0, "Le titre figure sur Paradise in Me, album publié par K's Choice en 1995."],
  ["Quel auteur belge a créé le commissaire Maigret ?", ["Agatha Christie", "Georges Simenon", "Stanislas-André Steeman", "Jean Ray"], 1, "Le Liégeois Georges Simenon a fait apparaître Maigret dans soixante-quinze romans."],
  ["Quel groupe interprète « Blue Monday » ?", ["New Order", "The Cure", "Depeche Mode", "Joy Division"], 0, "Le maxi de New Order paru en 1983 est célèbre pour sa pochette inspirée d'une disquette."],
  ["Dans Better Call Saul, quel est le véritable nom de Saul Goodman ?", ["Jimmy McGill", "Chuck McGill", "Howard Hamlin", "Gene Takavic"], 0, "Jimmy adopte Saul Goodman comme identité professionnelle avant les événements de Breaking Bad."],
  ["Quel personnage de Franquin est un animal jaune à taches noires doté d'une longue queue ?", ["Le Marsupilami", "Spip", "Bill", "Cubitus"], 0, "Le Marsupilami apparaît en 1952 dans Spirou et les Héritiers."],
  ["Quel album de Radiohead contient « Paranoid Android » ?", ["OK Computer", "The Bends", "Kid A", "In Rainbows"], 0, "OK Computer, publié en 1997, développe des thèmes liés à la technologie et à l'aliénation."],
  ["Quel jeu de Nintendo permet de gérer une île peuplée d'animaux anthropomorphes ?", ["Animal Crossing: New Horizons", "Stardew Valley", "The Sims 4", "Harvest Moon"], 0, "New Horizons est sorti sur Nintendo Switch en mars 2020."],
  ["Quel héros créé par Edgar P. Jacobs est un professeur de physique nucléaire ?", ["Philip Mortimer", "Francis Blake", "Olrik", "Septimus"], 0, "Mortimer forme avec le capitaine Blake le duo central de Blake et Mortimer."],
  ["Qui chante « Back to Black » ?", ["Amy Winehouse", "Duffy", "Adele", "Lily Allen"], 0, "Le morceau donne son titre au deuxième et dernier album studio d'Amy Winehouse."],
  ["Quel jeu de cartes à collectionner a été créé par Richard Garfield ?", ["Magic: The Gathering", "Pokémon", "Yu-Gi-Oh!", "Hearthstone"], 0, "Magic a été publié pour la première fois par Wizards of the Coast en 1993."],
  ["Quel auteur-dessinateur belge a créé la série Largo Winch avec Jean Van Hamme ?", ["Philippe Francq", "Grzegorz Rosiński", "Francis Vallès", "Philippe Berthet"], 0, "Philippe Francq dessine la série depuis son premier album en 1990."],
  ["Quel album de Nirvana commence par « Smells Like Teen Spirit » ?", ["Nevermind", "In Utero", "Bleach", "Incesticide"], 0, "Nevermind a contribué à porter le rock grunge vers le grand public en 1991."],
  ["Quel jeu vidéo utilise une mécanique de portails bleus et orange ?", ["Portal", "Half-Life 2", "Prey", "The Talos Principle"], 0, "Le Portal Gun permet de relier deux surfaces et de conserver l'élan du personnage."],
  ["Quel journal belge publie historiquement Le Chat de Philippe Geluck ?", ["Le Soir", "La Libre Belgique", "L'Écho", "Le Vif"], 0, "Le personnage apparaît dans Le Soir à partir de mars 1983."],
  ["Quel chanteur nigérian est l'une des figures fondatrices de l'afrobeat ?", ["Fela Kuti", "Burna Boy", "Wizkid", "King Sunny Adé"], 0, "Fela Kuti mêlait jazz, funk et traditions ouest-africaines à des textes politiques."],
  ["Quel jeu belge a été développé par Larian Studios et élu jeu de l'année 2023 ?", ["Baldur's Gate 3", "Divinity: Original Sin 2", "Cyberpunk 2077", "Diablo IV"], 0, "Le studio gantois Larian a développé Baldur's Gate 3 à partir des règles de Donjons et Dragons."],
  ["Quel album de Kate Bush contient « Wuthering Heights » ?", ["The Kick Inside", "Hounds of Love", "Never for Ever", "The Dreaming"], 0, "Kate Bush avait 19 ans lorsque son premier album The Kick Inside est paru en 1978."],
  ["Dans quel jeu contrôle-t-on une oie semant le désordre dans un village anglais ?", ["Untitled Goose Game", "Goat Simulator", "Donut County", "A Short Hike"], 0, "Le studio australien House House a conçu ce jeu d'infiltration comique."],
  ["Quel créateur belge est à l'origine de la série de BD Thorgal avec Grzegorz Rosiński ?", ["Jean Van Hamme", "Jean Dufaux", "Yves Sente", "Raoul Cauvin"], 0, "Jean Van Hamme scénarise le premier album de Thorgal, publié en 1980."],
  ["Quel album de Marvin Gaye contient « Mercy Mercy Me (The Ecology) » ?", ["What's Going On", "Let's Get It On", "I Want You", "Midnight Love"], 0, "L'album de 1971 aborde la guerre, la pauvreté et les atteintes à l'environnement."],
  ["Quel jeu de combat a introduit les personnages Scorpion et Sub-Zero ?", ["Mortal Kombat", "Street Fighter II", "Tekken", "Killer Instinct"], 0, "Mortal Kombat est lancé en arcade en 1992 par Midway."],
  ["Quel dessinateur a créé Corto Maltese ?", ["Hugo Pratt", "Milo Manara", "Guido Crepax", "Dino Battaglia"], 0, "Le marin apparaît dans La Ballade de la mer salée, publiée à partir de 1967."],
  ["Quel groupe a sorti l'album Dummy ?", ["Portishead", "Massive Attack", "Tricky", "Morcheeba"], 0, "Dummy, paru en 1994, contient « Glory Box » et remporta le Mercury Prize."],
  ["Quel jeu vidéo de Lucas Pope place le joueur au contrôle d'un poste-frontière ?", ["Papers, Please", "The Stanley Parable", "Return of the Obra Dinn", "This War of Mine"], 0, "Le joueur vérifie des documents tout en subissant les règles changeantes du régime d'Arstotzka."],
  ["Quel auteur français a créé le héros de BD Adèle Blanc-Sec ?", ["Jacques Tardi", "Enki Bilal", "Moebius", "Régis Loisel"], 0, "Adèle est une romancière et aventurière dans le Paris du début du XXe siècle."],
  ["Quel artiste a enregistré l'album Purple Rain avec son groupe The Revolution ?", ["Prince", "Michael Jackson", "Stevie Wonder", "George Michael"], 0, "Purple Rain sert également de bande originale au film homonyme sorti en 1984."],
  ["Quel jeu met en scène le chevalier silencieux explorant Hallownest ?", ["Hollow Knight", "Shovel Knight", "Dead Cells", "Ori and the Blind Forest"], 0, "Le studio australien Team Cherry a créé cet univers peuplé d'insectes."],
  ["Quelle série de BD humoristique de Cauvin et Lambil se déroule pendant la guerre de Sécession ?", ["Les Tuniques bleues", "Les Femmes en blanc", "Sammy", "Pauvre Lampil"], 0, "Le caporal Blutch et le sergent Chesterfield servent dans l'armée de l'Union."],
  ["Quel groupe punk britannique a publié London Calling ?", ["The Clash", "Sex Pistols", "The Jam", "Buzzcocks"], 0, "Le double album de 1979 mêle punk, reggae, ska et rockabilly."],
  ["Quel jeu de stratégie permet de diriger une civilisation de la préhistoire à l'ère spatiale ?", ["Civilization", "Total War", "Crusader Kings", "Anno"], 0, "Sid Meier a conçu le premier Civilization, publié en 1991."],
  ["Quel héros de BD créé par Morris tire plus vite que son ombre ?", ["Lucky Luke", "Jerry Spring", "Blueberry", "Chick Bill"], 0, "Morris crée Lucky Luke en 1946; René Goscinny en scénarisera de nombreux albums."],
  ["Quelle chanteuse capverdienne a popularisé la morna dans le monde ?", ["Cesária Évora", "Mayra Andrade", "Lura", "Sara Tavares"], 0, "Cesária Évora était surnommée la « diva aux pieds nus »."],
  ["Quel jeu de rôle japonais suit les Voleurs fantômes de cœurs ?", ["Persona 5", "Final Fantasy XV", "Xenoblade Chronicles", "NieR: Automata"], 0, "Les héros de Persona 5 explorent des palais nés des désirs corrompus d'adultes."],
  ["Quel album d'Angèle contient « Balance ton quoi » ?", ["Brol", "Nonante-Cinq", "Multitude", "QALF"], 0, "Brol, premier album d'Angèle, est sorti en 2018 et a connu une réédition intitulée Brol La Suite."],
];

export const POPCULTURE_ADULT_EDITORIAL_02: Question[] = DATA.map(([question, options, correctAnswerIndex, explanation], index) => ({
  id: `pop_adulte_editorial_02_${String(index + 1).padStart(3, '0')}`,
  categoryId: 'popculture', question, options, correctAnswerIndex, difficulty: 'adulte', explanation,
}));

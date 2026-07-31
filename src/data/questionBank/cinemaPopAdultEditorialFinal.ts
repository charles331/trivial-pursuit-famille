import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const CINEMA_FACTS: Fact[] = [
  ['Qui a composé la musique de « Psychose » ?', 'Bernard Herrmann', 'Miklós Rózsa', 'Elmer Bernstein', 'Alex North', 'Les cordes stridentes de Herrmann accompagnent notamment la scène de la douche.'],
  ['Quel compositeur a écrit le thème de « La Panthère rose » ?', 'Henry Mancini', 'Lalo Schifrin', 'Jerry Goldsmith', 'John Barry', 'Mancini composa ce thème jazzy pour le film de Blake Edwards sorti en 1963.'],
  ['Qui a composé la musique des « Parapluies de Cherbourg » ?', 'Michel Legrand', 'Georges Delerue', 'Francis Lai', 'Maurice Jarre', 'Michel Legrand conçut avec Jacques Demy une partition où tous les dialogues sont chantés.'],
  ['Combien de fois Ennio Morricone a-t-il reçu l’Oscar de la meilleure musique de film ?', 'Une seule', 'Trois', 'Cinq', 'Aucune', 'Il l’a obtenu pour Les Huit Salopards en 2016, après un Oscar d’honneur reçu en 2007.'],
  ['Quel effet visuel inventé pour « Vertigo » associe zoom avant et recul de la caméra ?', 'Le travelling compensé', 'Le plan-séquence', 'Le fondu enchaîné', 'La contre-plongée', 'Cet effet, dit aussi effet Vertigo, donne la sensation que l’espace se déforme autour du personnage.'],
  ['Quel compositeur a signé la bande originale de « Blade Runner » ?', 'Vangelis', 'Tangerine Dream', 'Wendy Carlos', 'Giorgio Moroder', 'Vangelis mêle synthétiseurs et saxophone dans la musique du film de Ridley Scott.'],
  ['Quelle compositrice fut la première femme à recevoir seule l’Oscar de la musique pour « Emma » ?', 'Rachel Portman', 'Anne Dudley', 'Debbie Wiseman', 'Lesley Barber', 'Rachel Portman reçut l’Oscar en 1997 pour la musique du film Emma de Douglas McGrath.'],
  ['Quel couturier créa la robe noire d’Audrey Hepburn dans « Diamants sur canapé » ?', 'Hubert de Givenchy', 'Pierre Balmain', 'Cristóbal Balenciaga', 'Yves Saint Laurent', 'Givenchy conçut les robes de Holly Golightly, adaptées à l’écran avec l’équipe costumes.'],
  ['Qui conçut les costumes de « Cléopâtre » portés par Elizabeth Taylor ?', 'Irene Sharaff', 'Edith Head', 'Jean Louis', 'Adrian', 'Irene Sharaff partagea l’Oscar des costumes en couleur pour Cléopâtre.'],
  ['Qui conçut les costumes d’« In the Mood for Love » ?', 'William Chang', 'Emi Wada', 'Eiko Ishioka', 'Kumiko Ogawa', 'William Chang assura aussi le montage et les décors du film de Wong Kar-wai.'],
  ['Quelle créatrice japonaise signa les costumes de « Dracula » de Coppola ?', 'Eiko Ishioka', 'Emi Wada', 'Kazuko Kurosawa', 'Rei Kawakubo', 'Eiko Ishioka reçut l’Oscar pour les costumes très stylisés du film de 1992.'],
  ['Quel film de Vittorio De Sica suit un retraité romain et son chien Flike ?', 'Umberto D.', 'Sciuscià', 'Miracle à Milan', 'Le Jardin des Finzi-Contini', 'Umberto D. dépeint la précarité d’un retraité dans l’Italie d’après-guerre.'],
  ['Quel film de Roberto Rossellini suit une femme dans les ruines de Berlin ?', 'Allemagne année zéro', 'Rome, ville ouverte', 'Paisà', 'Voyage en Italie', 'Le troisième volet de la trilogie de guerre de Rossellini fut tourné dans Berlin détruite.'],
  ['Quel film de Visconti raconte le déclin d’une famille sicilienne de pêcheurs ?', 'La terre tremble', 'Rocco et ses frères', 'Senso', 'Bellissima', 'La terre tremble adapte librement Les Malavoglia de Giovanni Verga.'],
  ['Quel film de Pier Paolo Pasolini met en scène la vie du Christ selon un évangéliste ?', 'L’Évangile selon saint Matthieu', 'Théorème', 'Œdipe roi', 'Médée', 'Pasolini tourna principalement dans le sud de l’Italie avec des acteurs non professionnels.'],
  ['Quel film de Mikio Naruse suit Yukiko et Kengo après leur retour d’Indochine ?', 'Nuages flottants', 'Quand une femme monte l’escalier', 'Le Grondement de la montagne', 'Une femme dans la tourmente', 'Nuages flottants adapte un roman de Fumiko Hayashi et sortit au Japon en 1955.'],
  ['Quel film d’Eisenstein reconstitue une mutinerie navale de 1905 ?', 'Le Cuirassé Potemkine', 'Octobre', 'La Grève', 'Alexandre Nevski', 'La séquence des escaliers d’Odessa est devenue un exemple classique du montage soviétique.'],
  ['Quel film d’Andrzej Munk se déroule dans un train menacé par une alerte à la bombe ?', 'Un homme sur la voie', 'La Passagère', 'Eroica', 'La Chance', 'Un homme sur la voie examine un même événement à travers des témoignages contradictoires.'],
  ['Quel film brésilien de Glauber Rocha met en scène Antônio das Mortes ?', 'Le Dieu noir et le Diable blond', 'Terre en transe', 'Barravento', 'Antonio das Mortes', 'Le film de 1964 est une œuvre majeure du Cinema Novo brésilien.'],
  ['Quel film chilien de Patricio Guzmán observe le désert d’Atacama et la mémoire politique ?', 'Nostalgie de la lumière', 'La Cordillère des songes', 'Le Bouton de nacre', 'Salvador Allende', 'Le film rapproche recherche astronomique et quête des disparus de la dictature.'],
  ['Quel film colombien suit une jeune « mule » transportant de la drogue ?', 'Maria, pleine de grâce', 'La Vendeuse de roses', 'L’Étreinte du serpent', 'Les Oiseaux de passage', 'Catalina Sandino Moreno incarne María dans le film de Joshua Marston.'],
  ['Quel film de Merata Mita filme une occupation māorie sur un promontoire d’Auckland ?', 'Bastion Point: Day 507', 'Mauri', 'Utu', 'Once Were Warriors', 'Merata Mita documenta l’expulsion policière qui mit fin à 506 jours d’occupation.'],
  ['Quel film libanais de Nadine Labaki suit un enfant poursuivant ses parents en justice ?', 'Capharnaüm', 'Caramel', 'Et maintenant, on va où ?', 'Costa Brava, Lebanon', 'Capharnaüm reçut le Prix du jury à Cannes en 2018.'],
  ['Quel film d’Amos Gitaï reconstitue l’expérience d’une équipe de secours pendant la guerre de 1973 ?', 'Kippour', 'Kedma', 'Désengagement', 'Free Zone', 'Kippour s’inspire de l’expérience personnelle de Gitaï, blessé lors d’une mission en hélicoptère.'],
  ['Quel film de Yorgos Lanthimos se déroule dans un hôtel où les célibataires risquent d’être changés en animaux ?', 'The Lobster', 'Canine', 'Mise à mort du cerf sacré', 'Pauvres Créatures', 'Colin Farrell incarne David dans cette satire des normes amoureuses.'],
  ['Quel film d’Aki Kaurismäki suit une ouvrière solitaire nommée Iris ?', 'La Fille aux allumettes', 'L’Homme sans passé', 'Au loin s’en vont les nuages', 'Les Lumières du faubourg', 'Kati Outinen incarne Iris dans ce film finlandais minimaliste sorti en 1990.'],
  ['Quel film géorgien de Nana Ekvtimishvili et Simon Groß suit deux adolescentes à Tbilissi ?', 'Eka et Natia, chronique d’une jeunesse géorgienne', 'Et puis nous danserons', 'Mandarines', 'L’Autre Rive', 'Le film se déroule en 1992, dans une Géorgie marquée par pénuries et violence.'],
  ['Quel film de Radu Jude confronte images d’archives et mémoire de l’Holocauste roumain ?', 'Peu m’importe si l’histoire nous considère comme des barbares', 'Aferim!', 'Bad Luck Banging or Loony Porn', 'Uppercase Print', 'Le titre cite une phrase liée au massacre d’Odessa sous le régime d’Antonescu.'],
  ['Quel film de Jasmila Žbanić suit une traductrice de l’ONU à Srebrenica ?', 'La Voix d’Aïda', 'Grbavica', 'Les Femmes de Visegrad', 'Snow', 'Jasna Đuričić incarne Aida pendant les jours précédant le massacre de Srebrenica.'],
  ['Quel film de João César Monteiro introduit le personnage de João de Deus ?', 'Souvenirs de la maison jaune', 'La Comédie de Dieu', 'Les Noces de Dieu', 'Va-et-vient', 'Souvenirs de la maison jaune reçut le Lion d’argent à Venise en 1989.'],
];

const POP_FACTS: Fact[] = [
  ['Qui chante « Paper Planes » ?', 'M.I.A.', 'Santigold', 'Neneh Cherry', 'FKA twigs', 'Paper Planes figure sur l’album Kala et échantillonne Straight to Hell de The Clash.'],
  ['Quel groupe sud-coréen a publié l’album « Map of the Soul: 7 » ?', 'BTS', 'EXO', 'Seventeen', 'Stray Kids', 'Septuor de K-pop, ce groupe fut le premier act sud-coréen à se hisser en tête des ventes d’albums aux États-Unis.'],
  ['Quelle chanteuse béninoise a enregistré l’album « Djin Djin » ?', 'Angélique Kidjo', 'Oumou Sangaré', 'Rokia Traoré', 'Fatoumata Diawara', 'Djin Djin reçut un Grammy et réunit plusieurs invités internationaux.'],
  ['Quel duo malien de chanteurs aveugles s’est fait connaître avec l’album Dimanche à Bamako ?', 'Amadou & Mariam', 'Tinariwen', 'Songhoy Blues', 'Tamikrest', 'Le duo est notamment connu pour l’album Dimanche à Bamako produit par Manu Chao.'],
  ['Quel artiste portoricain a publié « Un Verano Sin Ti » ?', 'Bad Bunny', 'Rauw Alejandro', 'J Balvin', 'Residente', 'L’album de Bad Bunny mêle reggaeton, dembow et influences caribéennes.'],
  ['Quel drame britannique met en scène le policier corrompu Tony Gates dans sa première saison ?', 'Line of Duty', 'Bodyguard', 'Happy Valley', 'Luther', 'La première enquête de l’unité AC-12 vise le chef d’équipe Tony Gates.'],
  ['Quel drame islandais commence par un torse retrouvé dans un fjord ?', 'Trapped', 'The Valhalla Murders', 'Katla', 'Blackport', 'Trapped suit le policier Andri Ólafsson dans une ville isolée par une tempête.'],
  ['Quelle série espagnole suit la famille De la Mora et sa boutique de fleurs ?', 'La Casa de las Flores', 'Valeria', 'Paquita Salas', 'Les Demoiselles du téléphone', 'La comédie noire mexicaine créée par Manolo Caro révèle les secrets de la famille De la Mora.'],
  ['Quel jeu met en scène le livreur Sam Porter Bridges ?', 'Death Stranding', 'Control', 'Days Gone', 'Alan Wake', 'Norman Reedus incarne Sam dans le jeu de Hideo Kojima.'],
  ['Quel jeu de Remedy suit Jesse Faden dans le Bureau fédéral de contrôle ?', 'Control', 'Quantum Break', 'Alan Wake', 'Max Payne', 'Jesse explore l’Ancienne Maison, bâtiment changeant envahi par le Hiss.'],
  ['Quel jeu coopératif fait incarner deux prisonniers en fuite ?', 'A Way Out', 'It Takes Two', 'Brothers', 'Unravel Two', 'A Way Out de Hazelight se joue obligatoirement à deux en écran partagé.'],
  ['Quel jeu de déduction oppose les libéraux aux fascistes dans l’Allemagne des années 1930 ?', 'Secret Hitler', 'The Resistance', 'Coup', 'Decrypto', 'Les joueurs votent des gouvernements et tentent d’identifier les rôles secrets.'],
  ['Quel jeu demande de rendre la planète rouge habitable en augmentant oxygène et température ?', 'Terraforming Mars', 'Underwater Cities', 'Beyond the Sun', 'Gaia Project', 'Terraforming Mars de Jacob Fryxelius combine projets scientifiques et moteur de cartes.'],
  ['Quel roman de science-fiction a remporté à la fois les prix Hugo, Nebula et Arthur-C.-Clarke ?', 'La Justice de l’ancillaire', 'Le Problème à trois corps', 'Station Eleven', 'La Cinquième Saison', 'Ce triplé, rare, a fait connaître Ann Leckie dès son premier roman en 2013.'],
  ['Quelle autrice a créé la série « Murderbot » ?', 'Martha Wells', 'Ann Leckie', 'Becky Chambers', 'Arkady Martine', 'Murderbot est une unité de sécurité qui a piraté son module de contrôle.'],
  ['Quel auteur a écrit le roman afrofuturiste « Qui a peur de la mort ? » ?', 'Nnedi Okorafor', 'N. K. Jemisin', 'Octavia Butler', 'Tomi Adeyemi', 'Le roman de Nnedi Okorafor se déroule dans une Afrique postapocalyptique.'],
  ['Quel manga de Hiromu Arakawa suit les frères Edward et Alphonse Elric ?', 'Fullmetal Alchemist', 'Soul Eater', 'D.Gray-man', 'Blue Exorcist', 'Les frères Elric cherchent la pierre philosophale après une transmutation humaine ratée.'],
  ['Quel mangaka a créé « Vinland Saga » ?', 'Makoto Yukimura', 'Kentaro Miura', 'Takehiko Inoue', 'Naoki Urasawa', 'Vinland Saga suit notamment Thorfinn dans l’Europe du début du XIe siècle.'],
  ['Quelle série animée met en scène les sœurs Vi et Jinx à Piltover et Zaun ?', 'Arcane', 'Castlevania', 'Dota: Dragon’s Blood', 'Cyberpunk: Edgerunners', 'Arcane adapte l’univers de League of Legends avec une animation produite par Fortiche.'],
  ['Quel studio français a animé la série « Arcane » ?', 'Fortiche Production', 'Ankama Animations', 'Xilam', 'Mikros Animation', 'Fortiche a développé pour Arcane un style combinant 3D et effets peints en 2D.'],
  ['Quel personnage de Doctor Who voyage dans un vaisseau appelé TARDIS ?', 'Le Docteur', 'Le Maître', 'Jack Harkness', 'River Song', 'Le TARDIS ressemble extérieurement à une cabine de police britannique bleue.'],
  ['Quel podcast britannique explore des histoires étranges sous forme de dossiers d’archives ?', 'The Magnus Archives', 'Welcome to Night Vale', 'Limetown', 'Lore', 'The Magnus Archives met en scène Jonathan Sims, archiviste d’un institut londonien fictif.'],
];

function makeQuestions(
  facts: Fact[],
  prefix: string,
  categoryId: 'cinema' | 'popculture',
): Question[] {
  return facts.map(([question, answer, d1, d2, d3, explanation], index) => {
    const raw = [answer, d1, d2, d3];
    const offset = index % 4;
    const options = raw.map((_, optionIndex) => raw[(optionIndex + offset) % 4]);
    return {
      id: `${prefix}_${String(index + 1).padStart(3, '0')}`,
      categoryId,
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  });
}

export const CINEMA_ADULTE_EDITORIAL_FINAL: Question[] = makeQuestions(
  CINEMA_FACTS,
  'cin_adulte_editorial_final',
  'cinema',
);

export const POPCULTURE_ADULTE_EDITORIAL_FINAL: Question[] = makeQuestions(
  POP_FACTS,
  'pop_adulte_editorial_final',
  'popculture',
);

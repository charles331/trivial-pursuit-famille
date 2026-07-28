import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel procédé sonore fut utilisé pour le film « Le Chanteur de jazz » en 1927 ?', 'Le Vitaphone', 'Le Movietone', 'Le Cinémascope', 'Le Technicolor', 'Le Vitaphone synchronisait l’image projetée avec le son enregistré sur des disques.'],
  ['Quel format large anamorphique fut lancé avec « La Tunique » en 1953 ?', 'Le CinemaScope', 'Le VistaVision', 'Le Todd-AO', 'Le Cinerama', 'Le CinemaScope comprimait optiquement une image large sur une pellicule 35 mm.'],
  ['Quel procédé couleur à trois bandes marqua « Le Magicien d’Oz » ?', 'Le Technicolor', 'Le Kodachrome', 'L’Eastmancolor', 'Le Pathécolor', 'Le Technicolor trichrome séparait la lumière sur trois négatifs noir et blanc.'],
  ['Quel métier supervise la cohérence visuelle des décors et accessoires d’un film ?', 'Le chef décorateur', 'Le directeur de casting', 'Le régisseur général', 'Le scripte', 'Le chef décorateur traduit l’univers du scénario en espaces, décors et choix visuels.'],
  ['Quel membre de l’équipe note les raccords entre les prises ?', 'Le scripte', 'Le clapman', 'Le machiniste', 'Le perchman', 'Le scripte consigne costumes, gestes, accessoires et durée pour préserver la continuité.'],
  ['Quel effet consiste à filmer image par image des objets immobiles ?', 'Le stop motion', 'Le rotoscoping', 'Le matte painting', 'Le morphing', 'Le stop motion crée le mouvement en déplaçant légèrement objets ou marionnettes entre les prises.'],
  ['Quel procédé d’animation redessine les mouvements d’images filmées ?', 'La rotoscopie', 'La pixilation', 'La capture volumétrique', 'La chronophotographie', 'Max Fleischer breveta le rotoscope en 1915 pour guider le dessin à partir d’un film réel.'],
  ['Quel plan filmé en continu sans coupe visible est appelé « plan-séquence » ?', 'Un plan-séquence', 'Un champ-contrechamp', 'Un insert', 'Un plan de coupe', 'Le plan-séquence organise une action entière dans la durée d’un seul plan.'],
  ['Quel raccord passe d’une image à une autre par superposition progressive ?', 'Le fondu enchaîné', 'Le volet', 'Le cut', 'Le jump cut', 'Dans un fondu enchaîné, la première image disparaît tandis que la suivante apparaît.'],
  ['Quel mouvement de caméra combine déplacement de l’appareil et support roulant ?', 'Le travelling', 'Le panoramique', 'Le zoom', 'Le recadrage', 'Le travelling déplace physiquement le point de vue, contrairement au zoom optique.'],
  ['Quel film d’Orson Welles met en scène le marin Michael O’Hara et Elsa Bannister ?', 'La Dame de Shanghai', 'La Soif du mal', 'Le Procès', 'Le Criminel', 'La scène finale de La Dame de Shanghai se déroule dans un palais des miroirs.'],
  ['Qui incarne Gilda dans le film de Charles Vidor ?', 'Rita Hayworth', 'Ava Gardner', 'Gene Tierney', 'Lana Turner', 'Rita Hayworth interprète « Put the Blame on Mame » dans Gilda, sorti en 1946.'],
  ['Quel film de John Huston suit des chercheurs d’or dans la Sierra Madre ?', 'Le Trésor de la Sierra Madre', 'Quand la ville dort', 'L’Homme qui voulut être roi', 'Key Largo', 'Humphrey Bogart y incarne Fred C. Dobbs, progressivement dévoré par la méfiance.'],
  ['Quel western de John Ford met en scène la poursuite de Scar par Ethan Edwards ?', 'La Prisonnière du désert', 'La Chevauchée fantastique', 'L’Homme qui tua Liberty Valance', 'La Charge héroïque', 'John Wayne incarne Ethan Edwards dans ce western tourné notamment à Monument Valley.'],
  ['Qui joue Eve Harrington dans « Ève » de Joseph L. Mankiewicz ?', 'Anne Baxter', 'Bette Davis', 'Celeste Holm', 'Thelma Ritter', 'Anne Baxter incarne la jeune admiratrice qui cherche à supplanter la vedette Margo Channing.'],
  ['Quel film de Nicholas Ray met en scène Jim Stark, adolescent joué par James Dean ?', 'La Fureur de vivre', 'À l’est d’Éden', 'Géant', 'Les Amants de la nuit', 'La Fureur de vivre sortit en 1955, peu après la mort de James Dean.'],
  ['Quel mélodrame de Douglas Sirk suit une veuve amoureuse de son jardinier ?', 'Tout ce que le ciel permet', 'Écrit sur du vent', 'Le Secret magnifique', 'Le Temps d’aimer et le Temps de mourir', 'Jane Wyman et Rock Hudson jouent le couple confronté aux conventions sociales.'],
  ['Quel film d’Otto Preminger provoqua une controverse avec le mot « virgin » dans son affiche ?', 'La Lune était bleue', 'Laura', 'Autopsie d’un meurtre', 'L’Homme au bras d’or', 'Preminger distribua La Lune était bleue sans visa du Code de production en 1953.'],
  ['Quel thriller d’Hitchcock se déroule principalement dans un appartement observé par un photographe ?', 'Fenêtre sur cour', 'La Corde', 'Soupçons', 'Le Crime était presque parfait', 'James Stewart observe ses voisins depuis sa fenêtre dans le film de 1954.'],
  ['Quelle actrice joue Madeleine Elster et Judy Barton dans « Sueurs froides » ?', 'Kim Novak', 'Grace Kelly', 'Eva Marie Saint', 'Janet Leigh', 'Kim Novak interprète deux identités au cœur de l’obsession du personnage de James Stewart.'],
  ['Quel film indien de Mehboob Khan raconte le destin de Radha ?', 'Mother India', 'Mughal-e-Azam', 'Pyaasa', 'Shree 420', 'Mother India, sorti en 1957, fut le premier film indien nommé à l’Oscar du film en langue étrangère.'],
  ['Quel réalisateur indien a signé « Lagaan » ?', 'Ashutosh Gowariker', 'Sanjay Leela Bhansali', 'Mani Ratnam', 'Anurag Kashyap', 'Lagaan oppose des villageois indiens à des officiers britanniques dans un match de cricket.'],
  ['Quel film de Mira Nair suit le mariage arrangé d’Aditi à Delhi ?', 'Le Mariage des moussons', 'Salaam Bombay!', 'Un nom pour un autre', 'Mississippi Masala', 'Le Mariage des moussons remporta le Lion d’or à Venise en 2001.'],
  ['Quel réalisateur iranien a signé « Une séparation » ?', 'Asghar Farhadi', 'Jafar Panahi', 'Mohsen Makhmalbaf', 'Majid Majidi', 'Une séparation reçut l’Ours d’or à Berlin puis l’Oscar du meilleur film international.'],
  ['Quel film de Jafar Panahi se déroule presque entièrement dans un taxi à Téhéran ?', 'Taxi Téhéran', 'Hors jeu', 'Le Cercle', 'Ceci n’est pas un film', 'Panahi conduit lui-même le taxi et dialogue avec des passagers jouant entre fiction et documentaire.'],
  ['Quel cinéaste chinois a réalisé « Épouses et Concubines » ?', 'Zhang Yimou', 'Chen Kaige', 'Jia Zhangke', 'Wong Kar-wai', 'Gong Li incarne une jeune femme devenue quatrième épouse dans la Chine des années 1920.'],
  ['Quel film de Chen Kaige raconte l’histoire de deux acteurs d’opéra de Pékin ?', 'Adieu ma concubine', 'Le Roi des masques', 'Vivre!', 'La Cité interdite', 'Adieu ma concubine partagea la Palme d’or 1993 avec La Leçon de piano.'],
  ['Quel réalisateur thaïlandais a signé « Oncle Boonmee » ?', 'Apichatpong Weerasethakul', 'Pen-ek Ratanaruang', 'Anocha Suwichakornpong', 'Nawapol Thamrongrattanarit', 'Oncle Boonmee, celui qui se souvient de ses vies antérieures remporta la Palme d’or en 2010.'],
  ['Quel film philippin de Lino Brocka suit Julio cherchant Ligaya dans une capitale hostile ?', 'Manille', 'Insiang', 'Jaguar', 'Bayan Ko', 'Manille dans les griffes de la lumière décrit exploitation et violence urbaine sous Marcos.'],
  ['Quel réalisateur malien a signé « Yeelen » ?', 'Souleymane Cissé', 'Abderrahmane Sissako', 'Cheick Oumar Sissoko', 'Safi Faye', 'Yeelen puise dans des traditions bambara et reçut le Prix du jury à Cannes en 1987.'],
  ['Quel film de Djibril Diop Mambéty met en scène une vieille femme revenue se venger ?', 'Hyènes', 'Touki Bouki', 'La Petite Vendeuse de soleil', 'Badou Boy', 'Hyènes adapte La Visite de la vieille dame de Dürrenmatt dans une ville sénégalaise.'],
  ['Quelle réalisatrice sénégalaise a signé les films « La Passante » et « Mossane » ?', 'Safi Faye', 'Sarah Maldoror', 'Mati Diop', 'Alice Diop', 'Safi Faye fut l’une des premières cinéastes africaines à réaliser un long métrage commercialement distribué.'],
  ['Quel film de Sarah Maldoror traite de la lutte anticoloniale en Angola ?', 'Sambizanga', 'Afrique sur Seine', 'Mortu Nega', 'Camp de Thiaroye', 'Sambizanga adapte un roman de José Luandino Vieira sur l’arrestation d’un militant angolais.'],
  ['Quel documentaire de Claude Lanzmann repose sur des témoignages et des lieux, sans images d’archives ?', 'Shoah', 'Nuit et Brouillard', 'Le Chagrin et la Pitié', 'Hôtel Terminus', 'Lanzmann construisit cette œuvre de plus de neuf heures autour de l’extermination des Juifs d’Europe.'],
  ['Qui a réalisé le documentaire « Sans soleil » ?', 'Chris Marker', 'Agnès Varda', 'Alain Resnais', 'Raymond Depardon', 'Sans soleil mêle images du Japon, de Guinée-Bissau et d’ailleurs dans une méditation sur la mémoire.'],
  ['Quel film de Frederick Wiseman observe une institution psychiatrique du Massachusetts ?', 'Titicut Follies', 'Hospital', 'Welfare', 'High School', 'Titicut Follies fut tourné à Bridgewater State Hospital et longtemps restreint de diffusion.'],
  ['Quel documentaire de Barbara Kopple suit une grève de mineurs dans le Kentucky ?', 'Harlan County War', 'American Factory', 'Roger and Me', 'The Thin Blue Line', 'Harlan County War reçut l’Oscar du meilleur documentaire en 1977.'],
  ['Quel film d’Errol Morris contribua à la libération de Randall Adams ?', 'The Thin Blue Line', 'Gates of Heaven', 'Vernon, Florida', 'Standard Operating Procedure', 'L’enquête filmique de Morris révéla les fragilités de la condamnation pour meurtre de Randall Adams.'],
  ['Quel documentaire suit le musicien Sixto Rodriguez et son succès inattendu en Afrique du Sud ?', 'Sugar Man', 'Amy', 'Buena Vista Social Club', '20 Feet from Stardom', 'Searching for Sugar Man remporta l’Oscar du documentaire en 2013.'],
  ['Quel studio produisit « Blanche-Neige et les Sept Nains » en 1937 ?', 'Walt Disney Productions', 'Fleischer Studios', 'Warner Bros. Cartoons', 'UPA', 'Blanche-Neige fut le premier long métrage d’animation produit par le studio Disney.'],
  ['Quel film d’animation tchèque de Jiří Trnka adapte Shakespeare avec des marionnettes ?', 'Le Songe d’une nuit d’été', 'Le Brave Soldat Chvéïk', 'Le Rossignol de l’empereur', 'La Main', 'Trnka réalisa en 1959 une ambitieuse adaptation en stop motion du Songe d’une nuit d’été.'],
  ['Quel réalisateur canadien créa le film dessiné sur pellicule « Begone Dull Care » ?', 'Norman McLaren', 'Frédéric Back', 'Caroline Leaf', 'Co Hoedeman', 'McLaren et Evelyn Lambart peignirent et gravèrent directement la pellicule au rythme d’Oscar Peterson.'],
  ['Quel film de Hayao Miyazaki met en scène la princesse Nausicaä ?', 'Nausicaä de la Vallée du Vent', 'Le Château dans le ciel', 'Princesse Mononoké', 'Le Voyage de Chihiro', 'Nausicaä précède la fondation du Studio Ghibli mais réunit plusieurs de ses futurs collaborateurs.'],
  ['Quel film d’Isao Takahata suit deux enfants japonais pendant la Seconde Guerre mondiale ?', 'Le Tombeau des lucioles', 'Pompoko', 'Souvenirs goutte à goutte', 'Mes voisins les Yamada', 'Le film adapte une nouvelle semi-autobiographique d’Akiyuki Nosaka.'],
  ['Quel film d’animation belge de Raoul Servais se déroule dans une ville contrôlée par des ombres ?', 'Taxandria', 'Harpya', 'Chromophobia', 'Papillons de nuit', 'Taxandria mêle prises de vues réelles et images retravaillées par le procédé Servaisgraphie.'],
  ['Quel long métrage animé utilise des peintures à l’huile pour raconter Van Gogh ?', 'La Passion Van Gogh', 'Valse avec Bachir', 'Flee', 'Le Tableau', 'Loving Vincent fut composé de dizaines de milliers d’images peintes dans un style inspiré de Van Gogh.'],
  ['Quel film d’Ari Folman mêle animation et souvenirs de la guerre du Liban ?', 'Valse avec Bachir', 'Flee', 'Persepolis', 'Le Congrès', 'Valse avec Bachir reconstruit une mémoire traumatique avant de basculer vers des images documentaires.'],
  ['Quel film animé danois suit un réfugié afghan racontant son parcours ?', 'Flee', 'Another Day of Life', 'Josep', 'La Traversée', 'Flee de Jonas Poher Rasmussen combine témoignage, animation et images d’archives.'],
  ['Quel film de Charlie Kaufman utilise des marionnettes imprimées en 3D ?', 'Anomalisa', 'Synecdoche, New York', 'Je pense à la fin', 'Human Nature', 'Anomalisa fut coréalisé avec Duke Johnson et animé en stop motion.'],
  ['Quel film de Wes Anderson met en scène des chiens exilés sur une île japonaise ?', 'L’Île aux chiens', 'Fantastic Mr. Fox', 'Asteroid City', 'La Vie aquatique', 'L’Île aux chiens est un film en stop motion sorti en 2018.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const CINEMA_ADULTE_EDITORIAL_05: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `cin_adulte_editorial_05_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'cinema',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel format large anamorphique fut lancé avec « La Tunique » en 1953 ?', 'Le CinemaScope', 'Le VistaVision', 'Le Todd-AO', 'Le Cinerama', 'Le CinemaScope comprimait optiquement une image large sur une pellicule 35 mm.'],
  ['Quel procédé couleur à trois bandes marqua « Le Magicien d’Oz » ?', 'Le Technicolor', 'Le Kodachrome', 'L’Eastmancolor', 'Le Pathécolor', 'Le Technicolor trichrome séparait la lumière sur trois négatifs noir et blanc.'],
  ['Quel métier supervise la cohérence visuelle des décors et accessoires d’un film ?', 'Le chef décorateur', 'Le directeur de casting', 'Le régisseur général', 'Le scripte', 'Le chef décorateur traduit l’univers du scénario en espaces, décors et choix visuels.'],
  ['Quel membre de l’équipe note les raccords entre les prises ?', 'Le scripte', 'Le clapman', 'Le machiniste', 'Le perchman', 'Le scripte consigne costumes, gestes, accessoires et durée pour préserver la continuité.'],
  ['Quel effet consiste à filmer image par image des objets immobiles ?', 'Le stop motion', 'Le rotoscoping', 'Le matte painting', 'Le morphing', 'Le stop motion crée le mouvement en déplaçant légèrement objets ou marionnettes entre les prises.'],
  ['Quel plan filmé en continu sans coupe visible est appelé « plan-séquence » ?', 'Un plan-séquence', 'Un champ-contrechamp', 'Un insert', 'Un plan de coupe', 'Le plan-séquence organise une action entière dans la durée d’un seul plan.'],
  ['Quel raccord passe d’une image à une autre par superposition progressive ?', 'Le fondu enchaîné', 'Le volet', 'Le cut', 'Le jump cut', 'Dans un fondu enchaîné, la première image disparaît tandis que la suivante apparaît.'],
  ['Quel mouvement de caméra combine déplacement de l’appareil et support roulant ?', 'Le travelling', 'Le panoramique', 'Le zoom', 'Le recadrage', 'Le travelling déplace physiquement le point de vue, contrairement au zoom optique.'],
  ['Quel film d’Orson Welles met en scène le marin Michael O’Hara et Elsa Bannister ?', 'La Dame de Shanghai', 'La Soif du mal', 'Le Procès', 'Le Criminel', 'La scène finale de La Dame de Shanghai se déroule dans un palais des miroirs.'],
  ['Qui incarne Gilda dans le film de Charles Vidor ?', 'Rita Hayworth', 'Ava Gardner', 'Gene Tierney', 'Lana Turner', 'Rita Hayworth interprète « Put the Blame on Mame » dans Gilda, sorti en 1946.'],
  ['Quel film de John Huston suit trois chercheurs d’or dans les montagnes du Mexique ?', 'Le Trésor de la Sierra Madre', 'Quand la ville dort', 'L’Homme qui voulut être roi', 'Key Largo', 'Humphrey Bogart y incarne Fred C. Dobbs, progressivement dévoré par la méfiance.'],
  ['Quel western de John Ford met en scène la poursuite de Scar par Ethan Edwards ?', 'La Prisonnière du désert', 'La Chevauchée fantastique', 'L’Homme qui tua Liberty Valance', 'La Charge héroïque', 'John Wayne incarne Ethan Edwards dans ce western tourné notamment à Monument Valley.'],
  ['Qui joue Eve Harrington dans « Ève » de Joseph L. Mankiewicz ?', 'Anne Baxter', 'Bette Davis', 'Celeste Holm', 'Thelma Ritter', 'Anne Baxter incarne la jeune admiratrice qui cherche à supplanter la vedette Margo Channing.'],
  ['Quel film de Nicholas Ray met en scène Jim Stark, adolescent joué par James Dean ?', 'La Fureur de vivre', 'À l’est d’Éden', 'Géant', 'Les Amants de la nuit', 'La Fureur de vivre sortit en 1955, peu après la mort de James Dean.'],
  ['Quel mélodrame de Douglas Sirk suit une veuve amoureuse de son jardinier ?', 'Tout ce que le ciel permet', 'Écrit sur du vent', 'Le Secret magnifique', 'Le Temps d’aimer et le Temps de mourir', 'Jane Wyman et Rock Hudson jouent le couple confronté aux conventions sociales.'],
  ['Quel film d’Otto Preminger provoqua une controverse avec le mot « virgin » dans son affiche ?', 'La Lune était bleue', 'Laura', 'Autopsie d’un meurtre', 'L’Homme au bras d’or', 'Preminger distribua La Lune était bleue sans visa du Code de production en 1953.'],
  ['Quel thriller d’Hitchcock se déroule principalement dans un appartement observé par un photographe ?', 'Fenêtre sur cour', 'La Corde', 'Soupçons', 'Le Crime était presque parfait', 'James Stewart observe ses voisins depuis sa fenêtre dans le film de 1954.'],
  ['Quelle actrice joue Madeleine Elster et Judy Barton dans « Sueurs froides » ?', 'Kim Novak', 'Grace Kelly', 'Eva Marie Saint', 'Janet Leigh', 'Kim Novak interprète deux identités au cœur de l’obsession du personnage de James Stewart.'],
  ['Quel film belge de Jaco Van Dormael suit un homme persuadé d\'avoir été échangé à la naissance ?', 'Toto le héros', 'Le Huitième Jour', 'Mr. Nobody', 'Les Barons', 'Ce premier long métrage a reçu la Caméra d\'or à Cannes en 1991.'],
  ['Quel faux documentaire belge de 1992 suit un tueur en série et son équipe de tournage ?', 'C\'est arrivé près de chez vous', 'Calvaire', 'Les Barons', 'Bullhead', 'Réalisé par trois étudiants avec un budget minuscule, il est devenu un film culte en Belgique.'],
  ['Quel film de Mira Nair suit le mariage arrangé d’Aditi à Delhi ?', 'Le Mariage des moussons', 'Salaam Bombay!', 'Un nom pour un autre', 'Mississippi Masala', 'Le Mariage des moussons remporta le Lion d’or à Venise en 2001.'],
  ['Quel film de Jafar Panahi se déroule presque entièrement au volant, dans la capitale iranienne ?', 'Taxi Téhéran', 'Hors jeu', 'Le Cercle', 'Ceci n’est pas un film', 'Panahi conduit lui-même le taxi et dialogue avec des passagers jouant entre fiction et documentaire.'],
  ['Quel réalisateur québécois a signé « Les Invasions barbares », Oscar du meilleur film étranger ?', 'Denys Arcand', 'Xavier Dolan', 'Jean-Marc Vallée', 'Philippe Falardeau', 'C\'était la suite du Déclin de l\'empire américain, tourné dix-sept ans plus tôt.'],
  ['Quel réalisateur québécois a tourné « Mommy » avant ses trente ans ?', 'Xavier Dolan', 'Denys Arcand', 'Denis Villeneuve', 'Jean-Marc Vallée', 'Le film est tourné dans un format carré, qui s\'élargit brièvement lors d\'une scène de liberté.'],
  ['Quel film de Clouzot suit quatre chauffeurs transportant de la nitroglycérine ?', 'Le Salaire de la peur', 'Les Diaboliques', 'Manon', 'La Vérité', 'Palme d\'or et Ours d\'or en 1953, il fut tourné dans le sud de la France pour figurer l\'Amérique du Sud.'],
  ['Quel réalisateur québécois d\'« Incendies » a ensuite tourné « Premier Contact » ?', 'Denis Villeneuve', 'Xavier Dolan', 'Denys Arcand', 'Philippe Falardeau', 'Incendies adaptait une pièce de Wajdi Mouawad et fut nommé à l\'Oscar du meilleur film étranger.'],
  ['Quel film de Luc Besson suit deux apnéistes rivaux et amis d\'enfance ?', 'Le Grand Bleu', 'Le Cinquième Élément', 'Nikita', 'Subway', 'Sorti en 1988, il a fait connaître l\'apnée au grand public et lancé la carrière de Jean Reno.'],
  ['Quelle cinéaste de la Nouvelle Vague a réalisé « Sans toit ni loi » ?', 'Agnès Varda', 'Claire Denis', 'Catherine Breillat', 'Diane Kurys', 'Elle avait commencé par la photographie ; son dernier documentaire est sorti quand elle avait 89 ans.'],
  ['Quel documentaire de Claude Lanzmann repose sur des témoignages et des lieux, sans images d’archives ?', 'Shoah', 'Nuit et Brouillard', 'Le Chagrin et la Pitié', 'Hôtel Terminus', 'Lanzmann construisit cette œuvre de plus de neuf heures autour de l’extermination des Juifs d’Europe.'],
  ['Quel film d’Errol Morris contribua à la libération de Randall Adams ?', 'The Thin Blue Line', 'Gates of Heaven', 'Vernon, Florida', 'Standard Operating Procedure', 'L’enquête filmique de Morris révéla les fragilités de la condamnation pour meurtre de Randall Adams.'],
  ['Quel studio produisit « Blanche-Neige et les Sept Nains » en 1937 ?', 'Walt Disney Productions', 'Fleischer Studios', 'Warner Bros. Cartoons', 'UPA', 'Blanche-Neige fut le premier long métrage d’animation produit par le studio Disney.'],
  ['Quel film d\'animation de Paul Grimault, commencé en 1948, n\'a été achevé qu\'en 1980 ?', 'Le Roi et l\'Oiseau', 'Le Chat du rabbin', 'Les Triplettes de Belleville', 'La Bergère et le Ramoneur', 'Ses dialogues sont de Jacques Prévert ; le film s\'inspire d\'un conte d\'Andersen.'],
  ['Quel film de Hayao Miyazaki met en scène une princesse qui protège des insectes géants ?', 'Nausicaä de la Vallée du Vent', 'Le Château dans le ciel', 'Princesse Mononoké', 'Le Voyage de Chihiro', 'Nausicaä précède la fondation du Studio Ghibli mais réunit plusieurs de ses futurs collaborateurs.'],
  ['Quel film d’Isao Takahata suit deux enfants japonais pendant la Seconde Guerre mondiale ?', 'Le Tombeau des lucioles', 'Pompoko', 'Souvenirs goutte à goutte', 'Mes voisins les Yamada', 'Le film adapte une nouvelle semi-autobiographique d’Akiyuki Nosaka.'],
  ['Quel long métrage animé est fait de peintures à l’huile sur les derniers jours d’un peintre néerlandais ?', 'La Passion Van Gogh', 'Valse avec Bachir', 'Flee', 'Le Tableau', 'Loving Vincent fut composé de dizaines de milliers d’images peintes dans un style inspiré de Van Gogh.'],
  ['Quel film d’Ari Folman mêle animation et souvenirs de la guerre du Liban ?', 'Valse avec Bachir', 'Flee', 'Persepolis', 'Le Congrès', 'Valse avec Bachir reconstruit une mémoire traumatique avant de basculer vers des images documentaires.'],
  ['Quel film animé danois suit un réfugié afghan racontant son parcours ?', 'Flee', 'Another Day of Life', 'Josep', 'La Traversée', 'Flee de Jonas Poher Rasmussen combine témoignage, animation et images d’archives.'],
  ['Quel film de Charlie Kaufman utilise des marionnettes imprimées en 3D ?', 'Anomalisa', 'Synecdoche, New York', 'Je pense à la fin', 'Human Nature', 'Anomalisa fut coréalisé avec Duke Johnson et animé en stop motion.'],
  ['Quel film en stop motion de Wes Anderson se déroule dans un Japon futuriste imaginaire ?', 'L’Île aux chiens', 'Fantastic Mr. Fox', 'Asteroid City', 'La Vie aquatique', 'Les animaux bannis sur une décharge insulaire sont doublés en anglais, les humains parlant japonais sans traduction.'],
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

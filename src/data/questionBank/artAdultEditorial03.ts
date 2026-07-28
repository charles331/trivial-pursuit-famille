import { Question } from '../../types';

type ArtFact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: ArtFact[] = [
  ['Quel sculpteur grec est traditionnellement associé au décor du Parthénon ?', 'Phidias', 'Praxitèle', 'Myron', 'Polyclète', 'Phidias supervisa le programme sculpté du Parthénon et réalisa sa statue monumentale d’Athéna.'],
  ['Quel artiste de la Renaissance a sculpté le « David » conservé à Florence ?', 'Michel-Ange', 'Donatello', 'Verrocchio', 'Benvenuto Cellini', 'Michel-Ange tailla ce David de marbre entre 1501 et 1504 dans un bloc déjà ébauché.'],
  ['Qui a sculpté le bronze équestre du « Gattamelata » à Padoue ?', 'Donatello', 'Lorenzo Ghiberti', 'Andrea del Verrocchio', 'Jacopo della Quercia', 'Érigé au XVe siècle, le Gattamelata renoua avec le modèle antique de la statue équestre monumentale.'],
  ['Quel sculpteur créa « Persée tenant la tête de Méduse » à Florence ?', 'Benvenuto Cellini', 'Giambologna', 'Antonio Canova', 'Le Bernin', 'Le bronze de Cellini fut installé sous la Loggia dei Lanzi en 1554.'],
  ['Qui a sculpté « L’Enlèvement des Sabines » exposé à Florence ?', 'Giambologna', 'Donatello', 'Michel-Ange', 'Luca della Robbia', 'Giambologna conçut une composition en spirale destinée à être observée sous plusieurs angles.'],
  ['Quel artiste baroque a sculpté « Apollon et Daphné » ?', 'Le Bernin', 'Alessandro Algardi', 'François Duquesnoy', 'Pierre Puget', 'Le Bernin représente dans le marbre l’instant où Daphné se transforme en laurier.'],
  ['Qui a réalisé le groupe sculpté « Le Laocoon » ?', 'Des sculpteurs de Rhodes', 'Phidias seul', 'Praxitèle seul', 'Lysippe seul', 'Pline l’Ancien attribuait le groupe à Athanodoros, Hagésandros et Polydoros de Rhodes.'],
  ['Quel sculpteur français est l’auteur de « Pierre de Wissant », figure des Bourgeois de Calais ?', 'Auguste Rodin', 'Antoine Bourdelle', 'Aristide Maillol', 'Jean-Baptiste Carpeaux', 'Rodin individualisa les six bourgeois du monument commandé par la ville de Calais.'],
  ['Qui a sculpté « La Danse » pour la façade de l’Opéra Garnier ?', 'Jean-Baptiste Carpeaux', 'François Rude', 'David d’Angers', 'James Pradier', 'Le groupe de Carpeaux suscita une vive polémique lors de son dévoilement en 1869.'],
  ['Quel sculpteur réalisa le relief « La Marseillaise » de l’Arc de triomphe ?', 'François Rude', 'Jean-Baptiste Carpeaux', 'Antoine Étex', 'Auguste Préault', 'Le Départ des volontaires de 1792, couramment appelé La Marseillaise, fut sculpté par Rude.'],
  ['Qui a créé la sculpture « Petite Danseuse de quatorze ans » ?', 'Edgar Degas', 'Auguste Rodin', 'Camille Claudel', 'Aristide Maillol', 'Degas présenta en 1881 une cire habillée de vrais textiles et coiffée de cheveux.'],
  ['Quelle sculptrice est l’autrice de « L’Âge mûr » ?', 'Camille Claudel', 'Germaine Richier', 'Niki de Saint Phalle', 'Louise Nevelson', 'L’Âge mûr met en scène trois figures et fut conçu par Claudel dans les années 1890.'],
  ['Quel artiste roumain a sculpté « L’Oiseau dans l’espace » ?', 'Constantin Brâncuși', 'Ossip Zadkine', 'Alberto Giacometti', 'Jean Arp', 'Brâncuși réalisa plusieurs versions épurées de cet oiseau à partir des années 1920.'],
  ['Qui a créé « L’Homme qui marche I » ?', 'Alberto Giacometti', 'Henry Moore', 'Constantin Brâncuși', 'Alexander Calder', 'La silhouette allongée de Giacometti fut modelée en 1960 puis fondue en bronze.'],
  ['Quel sculpteur britannique est connu pour ses grandes figures allongées et évidées ?', 'Henry Moore', 'Barbara Hepworth', 'Antony Gormley', 'Eduardo Paolozzi', 'Moore développa après les années 1920 le thème de la figure couchée aux formes organiques.'],
  ['Qui a créé les mobiles, sculptures abstraites mises en mouvement par l’air ?', 'Alexander Calder', 'Naum Gabo', 'Jean Tinguely', 'Donald Judd', 'Marcel Duchamp proposa le mot « mobile » pour les constructions cinétiques de Calder.'],
  ['Quel artiste suisse réalisa des machines-sculptures volontairement instables ?', 'Jean Tinguely', 'Max Bill', 'Alberto Giacometti', 'Meret Oppenheim', 'Tinguely associa moteurs et matériaux de récupération dans ses sculptures cinétiques.'],
  ['Qui a conçu les « Nanas », grandes figures féminines colorées ?', 'Niki de Saint Phalle', 'Louise Bourgeois', 'Yayoi Kusama', 'Eva Hesse', 'Niki de Saint Phalle développa ses Nanas joyeuses et monumentales à partir du milieu des années 1960.'],
  ['Quel artiste britannique réalisa la sculpture monumentale « Angel of the North » ?', 'Antony Gormley', 'Anish Kapoor', 'Richard Long', 'Tony Cragg', 'La figure d’acier de Gormley, haute de vingt mètres, domine Gateshead depuis 1998.'],
  ['Qui a créé « Cloud Gate », sculpture réfléchissante de Chicago ?', 'Anish Kapoor', 'Jeff Koons', 'Richard Serra', 'Antony Gormley', 'Cloud Gate est constituée de plaques d’acier inoxydable polies et fut achevée en 2006.'],
  ['Quel photographe réalisa « Le Violon d’Ingres » en 1924 ?', 'Man Ray', 'Brassaï', 'André Kertész', 'Robert Doisneau', 'Man Ray transforma le dos de Kiki de Montparnasse en instrument par l’ajout de deux ouïes.'],
  ['Qui prit la photographie « Derrière la gare Saint-Lazare » ?', 'Henri Cartier-Bresson', 'Robert Capa', 'Eugène Atget', 'Willy Ronis', 'Cette image de 1932 illustre la recherche de « l’instant décisif » associée à Cartier-Bresson.'],
  ['Quel photographe couvrit le débarquement américain d’Omaha Beach le 6 juin 1944 ?', 'Robert Capa', 'David Seymour', 'George Rodger', 'Werner Bischof', 'Onze vues connues de Capa prises à Omaha Beach survécurent au développement des films.'],
  ['Qui réalisa la série photographique « Les Américains » ?', 'Robert Frank', 'Walker Evans', 'Garry Winogrand', 'Lee Friedlander', 'Le livre de Robert Frank, publié d’abord en France en 1958, proposa un regard critique sur les États-Unis.'],
  ['Quelle photographe américaine est connue pour ses portraits de célébrités pour Rolling Stone ?', 'Annie Leibovitz', 'Diane Arbus', 'Nan Goldin', 'Cindy Sherman', 'Annie Leibovitz photographia notamment John Lennon et Yoko Ono le jour de la mort du musicien.'],
  ['Qui a écrit le roman « Le Nom de la rose » ?', 'Umberto Eco', 'Italo Calvino', 'Primo Levi', 'Alberto Moravia', 'Publié en 1980, le roman d’Eco mêle enquête criminelle, sémiotique et histoire monastique médiévale.'],
  ['Quel auteur est le créateur du commissaire Maigret ?', 'Georges Simenon', 'Léo Malet', 'Gaston Leroux', 'Maurice Leblanc', 'Le romancier belge Georges Simenon fit apparaître Maigret dans plus de soixante-dix romans.'],
  ['Qui a écrit « Cent Ans de solitude » ?', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Julio Cortázar', 'Carlos Fuentes', 'Le roman publié en 1967 raconte plusieurs générations de la famille Buendía à Macondo.'],
  ['Quel écrivain japonais est l’auteur de « Kafka sur le rivage » ?', 'Haruki Murakami', 'Kenzaburō Ōe', 'Yasunari Kawabata', 'Yukio Mishima', 'Le roman de Murakami parut au Japon en 2002 et alterne deux récits.'],
  ['Qui a écrit « Beloved » ?', 'Toni Morrison', 'Alice Walker', 'Maya Angelou', 'Zora Neale Hurston', 'Beloved, inspiré d’un fait historique lié à l’esclavage, reçut le prix Pulitzer en 1988.'],
  ['Quel romancier nigérian a écrit « Le Monde s’effondre » ?', 'Chinua Achebe', 'Wole Soyinka', 'Ben Okri', 'Ngũgĩ wa Thiong’o', 'Publié en 1958, le roman d’Achebe décrit les bouleversements provoqués par la colonisation chez les Igbo.'],
  ['Qui est l’autrice du roman « La Servante écarlate » ?', 'Margaret Atwood', 'Ursula K. Le Guin', 'Alice Munro', 'Joyce Carol Oates', 'Le roman dystopique de Margaret Atwood fut publié en 1985 sous le titre anglais The Handmaid’s Tale.'],
  ['Quel auteur portugais a écrit « L’Aveuglement » ?', 'José Saramago', 'António Lobo Antunes', 'Fernando Pessoa', 'Eça de Queirós', 'Saramago imagine une épidémie de cécité dans ce roman paru en 1995.'],
  ['Qui a écrit « Si par une nuit d’hiver un voyageur » ?', 'Italo Calvino', 'Umberto Eco', 'Cesare Pavese', 'Dino Buzzati', 'Le roman de Calvino interpelle directement son lecteur et enchaîne dix débuts de récits.'],
  ['Quel auteur tchèque a écrit « L’Insoutenable Légèreté de l’être » ?', 'Milan Kundera', 'Bohumil Hrabal', 'Václav Havel', 'Karel Čapek', 'Le roman de Kundera situe une partie de son intrigue autour du Printemps de Prague.'],
  ['Qui est l’autrice de « Mrs Dalloway » ?', 'Virginia Woolf', 'Katherine Mansfield', 'Doris Lessing', 'Iris Murdoch', 'Le roman de 1925 suit une journée de Clarissa Dalloway et utilise le flux de conscience.'],
  ['Quel écrivain a créé le comté fictif de Yoknapatawpha ?', 'William Faulkner', 'John Steinbeck', 'Ernest Hemingway', 'F. Scott Fitzgerald', 'Faulkner situa de nombreux romans dans ce comté imaginaire inspiré du Mississippi.'],
  ['Qui a écrit la pièce « En attendant Godot » ?', 'Samuel Beckett', 'Eugène Ionesco', 'Jean Genet', 'Arthur Adamov', 'La pièce de Beckett fut créée en français à Paris en 1953.'],
  ['Quel dramaturge américain est l’auteur de « Mort d’un commis voyageur » ?', 'Arthur Miller', 'Tennessee Williams', 'Eugene O’Neill', 'Edward Albee', 'La pièce d’Arthur Miller, créée en 1949, reçut le prix Pulitzer de théâtre.'],
  ['Qui a écrit « La Maison de Bernarda Alba » ?', 'Federico García Lorca', 'Ramón del Valle-Inclán', 'Antonio Buero Vallejo', 'Jacinto Benavente', 'Lorca acheva cette pièce peu avant son assassinat en 1936 ; elle fut créée après sa mort.'],
  ['Quel dramaturge norvégien a écrit « Une maison de poupée » ?', 'Henrik Ibsen', 'August Strindberg', 'Knut Hamsun', 'Bjørnstjerne Bjørnson', 'La pièce d’Ibsen, créée en 1879, provoqua des débats sur le mariage et la condition féminine.'],
  ['Qui a écrit « La Vie est un songe » ?', 'Pedro Calderón de la Barca', 'Lope de Vega', 'Tirso de Molina', 'Miguel de Cervantes', 'Cette pièce du Siècle d’or espagnol interroge la liberté, le pouvoir et l’illusion.'],
  ['Quel auteur a créé le personnage théâtral de Mère Courage ?', 'Bertolt Brecht', 'Friedrich Dürrenmatt', 'Max Frisch', 'Georg Büchner', 'Brecht écrivit Mère Courage et ses enfants en 1939, dans le contexte de la montée de la guerre.'],
  ['Qui a écrit la pièce « Un tramway nommé Désir » ?', 'Tennessee Williams', 'Arthur Miller', 'Edward Albee', 'Sam Shepard', 'Créée à Broadway en 1947, la pièce met en scène Blanche DuBois et Stanley Kowalski.'],
  ['Quel dramaturge a écrit « Rosencrantz et Guildenstern sont morts » ?', 'Tom Stoppard', 'Harold Pinter', 'Peter Shaffer', 'Alan Bennett', 'Stoppard place deux personnages secondaires de Hamlet au centre d’une comédie philosophique.'],
  ['Qui a écrit « Art », pièce centrée sur l’achat d’un tableau blanc ?', 'Yasmina Reza', 'Agnès Jaoui', 'Nathalie Sarraute', 'Marguerite Duras', 'La pièce de Yasmina Reza, créée en 1994, met l’amitié de trois hommes à l’épreuve.'],
  ['Quel écrivain belge est l’auteur de la pièce symboliste « Pelléas et Mélisande » ?', 'Maurice Maeterlinck', 'Émile Verhaeren', 'Michel de Ghelderode', 'Fernand Crommelynck', 'La pièce de Maeterlinck inspira notamment un opéra à Claude Debussy.'],
  ['Qui a écrit le roman belge « La Légende d’Ulenspiegel » ?', 'Charles De Coster', 'Georges Rodenbach', 'Camille Lemonnier', 'Hendrik Conscience', 'Publié en 1867, le livre de De Coster transforme Till l’Espiègle en héros de la révolte des Pays-Bas.'],
  ['Quel écrivain flamand est l’auteur du roman « Le Chagrin des Belges » ?', 'Hugo Claus', 'Louis Paul Boon', 'Tom Lanoye', 'Willem Elsschot', 'Le roman de Claus, paru en 1983, suit un adolescent flamand pendant la Seconde Guerre mondiale.'],
  ['Qui a écrit « Bruges-la-Morte » ?', 'Georges Rodenbach', 'Maurice Maeterlinck', 'Émile Verhaeren', 'Charles De Coster', 'Publié en 1892, le roman symboliste intègre des photographies de Bruges à son récit.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_03: Question[] = FACTS.map(
  ([question, answer, distractor1, distractor2, distractor3, explanation], index) => {
    const options = rotate([answer, distractor1, distractor2, distractor3], index % 4);
    return {
      id: `art_adulte_editorial_03_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);


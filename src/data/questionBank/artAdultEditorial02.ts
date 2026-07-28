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
  ['Qui a composé l’oratorio « Le Messie » ?', 'Georg Friedrich Haendel', 'Jean-Sébastien Bach', 'Antonio Vivaldi', 'Henry Purcell', 'Haendel composa Le Messie en 1741 ; son célèbre chœur « Hallelujah » clôt la deuxième partie.'],
  ['Quel compositeur a écrit « L’Art de la fugue » ?', 'Jean-Sébastien Bach', 'Georg Philipp Telemann', 'Domenico Scarlatti', 'Jean-Philippe Rameau', 'Bach travailla à ce cycle contrapuntique durant la dernière décennie de sa vie.'],
  ['Qui a composé l’opéra « Didon et Énée » ?', 'Henry Purcell', 'John Dowland', 'Benjamin Britten', 'Edward Elgar', 'Créé à la fin du XVIIe siècle, Didon et Énée contient la célèbre plainte de Didon.'],
  ['Quel compositeur français a créé « Les Indes galantes » ?', 'Jean-Philippe Rameau', 'François Couperin', 'Marc-Antoine Charpentier', 'Marin Marais', 'Cet opéra-ballet de Rameau fut créé à l’Académie royale de musique en 1735.'],
  ['Qui a composé l’oratorio « La Création » ?', 'Joseph Haydn', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Franz Schubert', 'Haydn s’inspira notamment de la Genèse et du Paradis perdu de Milton pour cet oratorio.'],
  ['Quel est l’unique opéra achevé de Beethoven ?', 'Fidelio', 'Euryanthe', 'Der Freischütz', 'Alfonso und Estrella', 'Beethoven remania plusieurs fois Fidelio, dont la version définitive fut créée en 1814.'],
  ['Qui a composé le cycle de lieder « Le Voyage d’hiver » ?', 'Franz Schubert', 'Robert Schumann', 'Johannes Brahms', 'Hugo Wolf', 'Schubert mit en musique vingt-quatre poèmes de Wilhelm Müller dans ce cycle de 1827.'],
  ['Quel compositeur a écrit la « Symphonie fantastique » ?', 'Hector Berlioz', 'Camille Saint-Saëns', 'César Franck', 'Gabriel Fauré', 'Créée en 1830, la symphonie utilise une « idée fixe » représentant la femme aimée.'],
  ['Qui a composé les pièces pour piano « Scènes d’enfants » ?', 'Robert Schumann', 'Frédéric Chopin', 'Franz Liszt', 'Felix Mendelssohn', 'Le recueil de Schumann comprend « Rêverie », l’une de ses pièces les plus connues.'],
  ['Quel compositeur a écrit « Un requiem allemand » ?', 'Johannes Brahms', 'Anton Bruckner', 'Gustav Mahler', 'Richard Strauss', 'Brahms choisit lui-même des textes bibliques en allemand plutôt que le texte liturgique latin.'],
  ['Qui a composé le poème symphonique « Les Préludes » ?', 'Franz Liszt', 'Bedřich Smetana', 'Antonín Dvořák', 'Richard Wagner', 'Liszt contribua à établir le poème symphonique comme genre orchestral au XIXe siècle.'],
  ['Quel compositeur italien a écrit « La Traviata » ?', 'Giuseppe Verdi', 'Gioachino Rossini', 'Gaetano Donizetti', 'Vincenzo Bellini', 'La Traviata, inspirée de La Dame aux camélias, fut créée à Venise en 1853.'],
  ['Qui a composé l’opéra « Tristan et Isolde » ?', 'Richard Wagner', 'Richard Strauss', 'Carl Maria von Weber', 'Giacomo Meyerbeer', 'L’accord qui ouvre le prélude de Tristan et Isolde eut une influence majeure sur l’harmonie moderne.'],
  ['Quel compositeur est l’auteur de l’opéra « La Bohème » ?', 'Giacomo Puccini', 'Pietro Mascagni', 'Ruggero Leoncavallo', 'Arrigo Boito', 'Créée à Turin en 1896, La Bohème met en scène de jeunes artistes dans le Paris des années 1830.'],
  ['Qui a composé la musique du ballet « La Belle au bois dormant » ?', 'Piotr Ilitch Tchaïkovski', 'Nikolaï Rimski-Korsakov', 'Alexandre Borodine', 'Sergueï Prokofiev', 'Le ballet fut créé en 1890 au théâtre Mariinsky de Saint-Pétersbourg.'],
  ['Quel compositeur russe a écrit « Tableaux d’une exposition » ?', 'Modeste Moussorgski', 'Mikhaïl Glinka', 'César Cui', 'Mili Balakirev', 'Moussorgski conçut cette suite pour piano après une exposition consacrée à Viktor Hartmann.'],
  ['Qui a composé la valse « Le Beau Danube bleu » ?', 'Johann Strauss fils', 'Johann Strauss père', 'Josef Lanner', 'Franz von Suppé', 'La valse de Johann Strauss fils fut créée à Vienne en 1867.'],
  ['Quel compositeur tchèque est l’auteur du cycle « Má vlast » ?', 'Bedřich Smetana', 'Antonín Dvořák', 'Leoš Janáček', 'Bohuslav Martinů', 'Le poème symphonique « La Moldau » constitue la deuxième partie de Má vlast.'],
  ['Qui a composé la « Symphonie du Nouveau Monde » ?', 'Antonín Dvořák', 'Bedřich Smetana', 'Josef Suk', 'Zdeněk Fibich', 'Dvořák écrivit sa neuvième symphonie à New York, où elle fut créée en 1893.'],
  ['Quel compositeur norvégien a écrit la musique de scène de « Peer Gynt » ?', 'Edvard Grieg', 'Jean Sibelius', 'Carl Nielsen', 'Niels Gade', 'Grieg composa cette musique pour la pièce d’Henrik Ibsen, créée à Christiania en 1876.'],
  ['Qui a composé le poème symphonique « Finlandia » ?', 'Jean Sibelius', 'Edvard Grieg', 'Carl Nielsen', 'Einojuhani Rautavaara', 'Finlandia devint un symbole de l’identité finlandaise sous la domination russe.'],
  ['Quel compositeur a écrit le « Prélude à l’Après-midi d’un faune » ?', 'Claude Debussy', 'Maurice Ravel', 'Erik Satie', 'Paul Dukas', 'Debussy s’inspira d’un poème de Mallarmé pour cette œuvre créée en 1894.'],
  ['Qui a composé « Le Sacre du printemps » ?', 'Igor Stravinsky', 'Sergueï Prokofiev', 'Dmitri Chostakovitch', 'Aram Khatchatourian', 'Le ballet des Ballets russes fut créé à Paris en 1913 avec une chorégraphie de Nijinski.'],
  ['Quel compositeur a écrit « Le Mandarin merveilleux » ?', 'Béla Bartók', 'Zoltán Kodály', 'Leoš Janáček', 'György Ligeti', 'Cette pantomime de Bartók, achevée en 1924, provoqua un scandale lors de sa création à Cologne.'],
  ['Qui a composé « Rhapsody in Blue » ?', 'George Gershwin', 'Aaron Copland', 'Leonard Bernstein', 'Samuel Barber', 'Créée en 1924, Rhapsody in Blue associe écriture concertante et langage inspiré du jazz.'],
  ['Quel architecte a conçu le dôme de la cathédrale de Florence ?', 'Filippo Brunelleschi', 'Leon Battista Alberti', 'Donato Bramante', 'Andrea Palladio', 'Brunelleschi réalisa une double coupole autoportante, achevée au XVe siècle sans cintre en bois complet.'],
  ['Qui a conçu le Tempietto de San Pietro in Montorio à Rome ?', 'Donato Bramante', 'Raphaël', 'Michel-Ange', 'Giulio Romano', 'Ce petit édifice circulaire est un manifeste de l’architecture de la Haute Renaissance.'],
  ['Quel architecte est l’auteur de la villa Rotonda près de Vicence ?', 'Andrea Palladio', 'Giacomo Barozzi da Vignola', 'Michele Sanmicheli', 'Jacopo Sansovino', 'La villa palladienne présente quatre façades à portique organisées autour d’une salle centrale.'],
  ['Qui a dessiné la colonnade de la place Saint-Pierre à Rome ?', 'Le Bernin', 'Francesco Borromini', 'Carlo Maderno', 'Pietro da Cortona', 'Le Bernin conçut au XVIIe siècle les bras elliptiques de la colonnade comme un geste d’accueil.'],
  ['Quel architecte a conçu le Panthéon de Paris ?', 'Jacques-Germain Soufflot', 'Claude-Nicolas Ledoux', 'Étienne-Louis Boullée', 'Ange-Jacques Gabriel', 'Soufflot combina un plan d’église en croix grecque avec un vocabulaire néoclassique.'],
  ['Qui a conçu l’Altes Museum de Berlin ?', 'Karl Friedrich Schinkel', 'Gottfried Semper', 'Leo von Klenze', 'Friedrich von Gärtner', 'Ouvert en 1830, l’Altes Museum présente une longue colonnade ionique face au Lustgarten.'],
  ['Quel architecte dirigea la conception du palais de Westminster au XIXe siècle ?', 'Charles Barry', 'Augustus Pugin', 'George Gilbert Scott', 'John Nash', 'Charles Barry conçut le plan général, tandis qu’Augustus Pugin contribua largement au décor néogothique.'],
  ['Qui a conçu le Crystal Palace pour l’Exposition universelle de 1851 ?', 'Joseph Paxton', 'Isambard Kingdom Brunel', 'Owen Jones', 'Decimus Burton', 'Paxton utilisa des éléments préfabriqués en fer et en verre pour monter rapidement l’immense édifice.'],
  ['Quel architecte catalan a consacré la fin de sa vie à la Sagrada Família ?', 'Antoni Gaudí', 'Lluís Domènech i Montaner', 'Josep Puig i Cadafalch', 'Rafael Moneo', 'Gaudí reprit le projet en 1883 et transforma profondément sa conception néogothique initiale.'],
  ['Qui a conçu l’hôtel Tassel à Bruxelles ?', 'Victor Horta', 'Paul Hankar', 'Henry van de Velde', 'Gustave Strauven', 'Construit à partir de 1893, l’hôtel Tassel est souvent considéré comme un édifice fondateur de l’Art nouveau.'],
  ['Quel architecte écossais a conçu l’École d’art de Glasgow ?', 'Charles Rennie Mackintosh', 'Alexander Thomson', 'Robert Adam', 'William Burges', 'Mackintosh associa géométrie, lumière et détails décoratifs dans le bâtiment commencé en 1897.'],
  ['Qui a conçu le pavillon de la Sécession à Vienne ?', 'Joseph Maria Olbrich', 'Otto Wagner', 'Josef Hoffmann', 'Adolf Loos', 'Le pavillon de 1898 est surmonté d’un dôme ajouré fait de feuilles de laurier dorées.'],
  ['Quel architecte a conçu la villa Savoye à Poissy ?', 'Le Corbusier', 'Auguste Perret', 'Robert Mallet-Stevens', 'Tony Garnier', 'La villa illustre les « cinq points d’une architecture nouvelle » formulés par Le Corbusier.'],
  ['Qui a conçu la maison Schröder à Utrecht ?', 'Gerrit Rietveld', 'Theo van Doesburg', 'Hendrik Petrus Berlage', 'J.J.P. Oud', 'La maison de 1924 transpose dans l’espace les principes géométriques et colorés de De Stijl.'],
  ['Quel architecte fonda et conçut le bâtiment du Bauhaus à Dessau ?', 'Walter Gropius', 'Hannes Meyer', 'Marcel Breuer', 'László Moholy-Nagy', 'Le complexe inauguré en 1926 rend visibles sa structure et ses fonctions derrière de grandes façades vitrées.'],
  ['Qui a conçu le pavillon allemand de l’Exposition de Barcelone de 1929 ?', 'Ludwig Mies van der Rohe', 'Walter Gropius', 'Erich Mendelsohn', 'Bruno Taut', 'Le pavillon, reconstruit dans les années 1980, est célèbre pour ses plans libres et ses matériaux luxueux.'],
  ['Quel architecte a conçu la maison sur la cascade en Pennsylvanie ?', 'Frank Lloyd Wright', 'Richard Neutra', 'Louis Kahn', 'Philip Johnson', 'Fallingwater fut bâtie au-dessus d’une cascade pour la famille Kaufmann à partir de 1936.'],
  ['Qui a conçu l’opéra de Sydney ?', 'Jørn Utzon', 'Eero Saarinen', 'Alvar Aalto', 'Oscar Niemeyer', 'Le projet d’Utzon remporta un concours international en 1957 ; ses coques dominent le port de Sydney.'],
  ['Quel duo a conçu le Centre Pompidou avec une structure technique apparente ?', 'Renzo Piano et Richard Rogers', 'Herzog & de Meuron', 'OMA', 'SANAA', 'Inauguré en 1977, le Centre Pompidou rejette circulations et réseaux techniques vers ses façades.'],
  ['Qui a conçu la pyramide de verre du Louvre ?', 'Ieoh Ming Pei', 'Tadao Andō', 'Norman Foster', 'Kenzo Tange', 'Inaugurée en 1989, la pyramide sert d’entrée au Grand Louvre dans la cour Napoléon.'],
  ['Quel architecte a conçu le musée Guggenheim de Bilbao ?', 'Frank Gehry', 'Daniel Libeskind', 'Peter Eisenman', 'Rem Koolhaas', 'Ouvert en 1997, le musée aux volumes revêtus de titane a contribué à transformer l’image de Bilbao.'],
  ['Qui a conçu le musée juif de Berlin ?', 'Daniel Libeskind', 'David Chipperfield', 'Aldo Rossi', 'Álvaro Siza', 'Le plan brisé du musée, ouvert en 2001, organise des axes et des vides liés à l’histoire juive allemande.'],
  ['Quelle architecte a conçu le Heydar Aliyev Center de Bakou ?', 'Zaha Hadid', 'Kazuyo Sejima', 'Jeanne Gang', 'Elizabeth Diller', 'Le centre culturel se distingue par une enveloppe continue aux courbes fluides, achevée en 2012.'],
  ['Quel architecte a conçu la tour Burj Khalifa à Dubaï ?', 'Adrian Smith', 'César Pelli', 'Santiago Calatrava', 'Jean Nouvel', 'Adrian Smith conçut la tour au sein de l’agence SOM ; elle dépasse 828 mètres depuis son achèvement.'],
  ['Qui a conçu le Louvre Abu Dhabi et son vaste dôme ajouré ?', 'Jean Nouvel', 'Christian de Portzamparc', 'Dominique Perrault', 'Rudy Ricciotti', 'Le dôme superpose plusieurs couches géométriques afin de produire une « pluie de lumière ».'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_02: Question[] = FACTS.map(
  ([question, answer, distractor1, distractor2, distractor3, explanation], index) => {
    const options = rotate([answer, distractor1, distractor2, distractor3], index % 4);
    return {
      id: `art_adulte_editorial_02_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);


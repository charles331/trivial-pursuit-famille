import { Question } from '../../types';

/**
 * Musique classique, opéra et art lyrique — catégorie « Pop Culture & Musique ».
 *
 * Ces cartes vivaient dans « Art & Littérature », dont le nom ne promet ni
 * opéra ni symphonie, tandis que la catégorie explicitement intitulée
 * « Musique » n'en comptait presque aucune. Le joueur qui tombait sur la case
 * art se voyait demander un librettiste ; celui qui connaissait la musique n'en
 * tirait aucun bénéfice. Les cartes sont déplacées telles quelles, sans
 * modification de leur contenu : seule leur catégorie change.
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
  ['Qui a composé l’oratorio « Le Messie » ?', 'Georg Friedrich Haendel', 'Jean-Sébastien Bach', 'Antonio Vivaldi', 'Henry Purcell', 'Haendel composa Le Messie en 1741 ; son célèbre chœur « Hallelujah » clôt la deuxième partie.'],
  ['Quel compositeur a écrit « L’Art de la fugue » ?', 'Jean-Sébastien Bach', 'Georg Philipp Telemann', 'Domenico Scarlatti', 'Jean-Philippe Rameau', 'Bach travailla à ce cycle contrapuntique durant la dernière décennie de sa vie.'],
  ['Qui a composé l’oratorio « La Création » ?', 'Joseph Haydn', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Franz Schubert', 'Haydn s’inspira notamment de la Genèse et du Paradis perdu de Milton pour cet oratorio.'],
  ['Quel est l’unique opéra achevé de Beethoven ?', 'Fidelio', 'Euryanthe', 'Der Freischütz', 'Alfonso und Estrella', 'Beethoven remania plusieurs fois Fidelio, dont la version définitive fut créée en 1814.'],
  ['Qui a composé le cycle de lieder « Le Voyage d’hiver » ?', 'Franz Schubert', 'Robert Schumann', 'Johannes Brahms', 'Hugo Wolf', 'Schubert mit en musique vingt-quatre poèmes de Wilhelm Müller dans ce cycle de 1827.'],
  ['Quel compositeur a écrit la « Symphonie fantastique » ?', 'Hector Berlioz', 'Camille Saint-Saëns', 'César Franck', 'Gabriel Fauré', 'Créée en 1830, la symphonie utilise une « idée fixe » représentant la femme aimée.'],
  ['Quel compositeur a écrit « Un requiem allemand » ?', 'Johannes Brahms', 'Anton Bruckner', 'Gustav Mahler', 'Richard Strauss', 'Brahms choisit lui-même des textes bibliques en allemand plutôt que le texte liturgique latin.'],
  ['Quel compositeur italien a écrit « La Traviata » ?', 'Giuseppe Verdi', 'Gioachino Rossini', 'Gaetano Donizetti', 'Vincenzo Bellini', 'La Traviata, inspirée de La Dame aux camélias, fut créée à Venise en 1853.'],
  ['Qui a composé l’opéra « Tristan et Isolde » ?', 'Richard Wagner', 'Richard Strauss', 'Carl Maria von Weber', 'Giacomo Meyerbeer', 'L’accord qui ouvre le prélude de Tristan et Isolde eut une influence majeure sur l’harmonie moderne.'],
  ['Quel compositeur est l’auteur de l’opéra « La Bohème » ?', 'Giacomo Puccini', 'Pietro Mascagni', 'Ruggero Leoncavallo', 'Arrigo Boito', 'Créée à Turin en 1896, La Bohème met en scène de jeunes artistes dans le Paris des années 1830.'],
  ['Qui a composé la musique du ballet « La Belle au bois dormant » ?', 'Piotr Ilitch Tchaïkovski', 'Nikolaï Rimski-Korsakov', 'Alexandre Borodine', 'Sergueï Prokofiev', 'Le ballet fut créé en 1890 au théâtre Mariinsky de Saint-Pétersbourg.'],
  ['Qui a composé la valse « Le Beau Danube bleu » ?', 'Johann Strauss fils', 'Johann Strauss père', 'Josef Lanner', 'Franz von Suppé', 'La valse de Johann Strauss fils fut créée à Vienne en 1867.'],
  ['Qui a composé la « Symphonie du Nouveau Monde » ?', 'Antonín Dvořák', 'Bedřich Smetana', 'Josef Suk', 'Zdeněk Fibich', 'Dvořák écrivit sa neuvième symphonie à New York, où elle fut créée en 1893.'],
  ['Quel compositeur norvégien a écrit la musique de scène de « Peer Gynt » ?', 'Edvard Grieg', 'Jean Sibelius', 'Carl Nielsen', 'Niels Gade', 'Grieg composa cette musique pour la pièce d’Henrik Ibsen, créée à Christiania en 1876.'],
  ['Qui a composé le poème symphonique « Finlandia » ?', 'Jean Sibelius', 'Edvard Grieg', 'Carl Nielsen', 'Einojuhani Rautavaara', 'Finlandia devint un symbole de l’identité finlandaise sous la domination russe.'],
  ['Quel compositeur a écrit le « Prélude à l’Après-midi d’un faune » ?', 'Claude Debussy', 'Maurice Ravel', 'Erik Satie', 'Paul Dukas', 'Debussy s’inspira d’un poème de Mallarmé pour cette œuvre créée en 1894.'],
  ['Qui a composé « Le Sacre du printemps » ?', 'Igor Stravinsky', 'Sergueï Prokofiev', 'Dmitri Chostakovitch', 'Aram Khatchatourian', 'Le ballet des Ballets russes fut créé à Paris en 1913 avec une chorégraphie de Nijinski.'],
  ['Qui a composé « Rhapsody in Blue » ?', 'George Gershwin', 'Aaron Copland', 'Leonard Bernstein', 'Samuel Barber', 'Créée en 1924, Rhapsody in Blue associe écriture concertante et langage inspiré du jazz.'],
  ['Quel opéra de Rossini met en scène Figaro et le comte Almaviva ?', 'Le Barbier de Séville', 'Guillaume Tell', 'La Cenerentola', 'L’Italienne à Alger', 'Le Barbier de Séville fut créé à Rome en 1816 d’après la comédie de Beaumarchais.'],
  ['Quel opéra de Donizetti raconte l’amour de Nemorino pour Adina ?', 'L’Élixir d’amour', 'Lucia di Lammermoor', 'Don Pasquale', 'La Favorite', 'L’Élixir d’amour est un opéra comique créé à Milan en 1832.'],
  ['Quel compositeur écrivit l’opéra « Boris Godounov » ?', 'Modeste Moussorgski', 'Alexandre Borodine', 'Nikolaï Rimski-Korsakov', 'Piotr Ilitch Tchaïkovski', 'Moussorgski tira son opéra du drame historique de Pouchkine consacré au tsar Boris.'],
  ['Quel opéra de Bizet se déroule principalement à Séville ?', 'Carmen', 'Les Pêcheurs de perles', 'Djamileh', 'La Jolie Fille de Perth', 'Carmen fut créé à l’Opéra-Comique de Paris en 1875, d’après une nouvelle de Mérimée.'],
  ['Quel opéra de Verdi est inspiré du drame « Le Roi s’amuse » de Victor Hugo ?', 'Rigoletto', 'Nabucco', 'Otello', 'Falstaff', 'Rigoletto fut créé à Venise en 1851 après des négociations avec la censure.'],
  ['Quel opéra de Leoncavallo contient l’air « Vesti la giubba » ?', 'Pagliacci', 'Zazà', 'La Bohème', 'Chatterton', 'Dans Pagliacci, le ténor Canio doit jouer la comédie malgré sa jalousie et son désespoir.'],
  ['Qui a composé « Pelléas et Mélisande » ?', 'Claude Debussy', 'Maurice Ravel', 'Gabriel Fauré', 'Paul Dukas', 'Debussy adapta presque intégralement le texte de Maurice Maeterlinck pour son unique opéra achevé.'],
  ['Quel opéra de Gershwin se déroule dans la communauté de Catfish Row ?', 'Porgy and Bess', 'Treemonisha', 'Street Scene', 'Show Boat', 'Porgy and Bess fut créé en 1935 et contient la chanson « Summertime ».'],
  ['Qui a composé l’opéra « Peter Grimes » ?', 'Benjamin Britten', 'Michael Tippett', 'William Walton', 'Ralph Vaughan Williams', 'Créé en 1945, Peter Grimes se déroule dans une communauté côtière anglaise oppressante.'],
  ['Quel opéra de Poulenc raconte le martyre de carmélites sous la Révolution française ?', 'Dialogues des Carmélites', 'La Voix humaine', 'Les Mamelles de Tirésias', 'Saint François d’Assise', 'Poulenc adapta un texte de Georges Bernanos ; l’opéra fut créé en 1957.'],
];

export const MUSIQUE_CLASSIQUE_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `pop_adulte_musique_classique_${String(index + 1).padStart(3, '0')}`,
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

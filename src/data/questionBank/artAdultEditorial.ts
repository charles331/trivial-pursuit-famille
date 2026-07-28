import { Question } from '../../types';

type Artwork = [work: string, artist: string, museum: string, period: string];
type MusicWork = [work: string, composer: string, country: string, period: string];
type Building = [building: string, architect: string, city: string, style: string];

const ARTWORKS: Artwork[] = [
  ['La Joconde', 'Léonard de Vinci', 'musée du Louvre', 'Renaissance'],
  ['La Naissance de Vénus', 'Sandro Botticelli', 'galerie des Offices', 'Renaissance'],
  ['La Création d’Adam', 'Michel-Ange', 'chapelle Sixtine', 'Renaissance'],
  ['L’École d’Athènes', 'Raphaël', 'palais du Vatican', 'Renaissance'],
  ['Les Époux Arnolfini', 'Jan van Eyck', 'National Gallery de Londres', 'Renaissance'],
  ['Le Jardin des délices', 'Jérôme Bosch', 'musée du Prado', 'Renaissance'],
  ['La Tour de Babel', 'Pieter Bruegel l’Ancien', 'Kunsthistorisches Museum', 'Renaissance'],
  ['La Vocation de saint Matthieu', 'Le Caravage', 'église Saint-Louis-des-Français', 'baroque'],
  ['Les Ménines', 'Diego Velázquez', 'musée du Prado', 'baroque'],
  ['La Ronde de nuit', 'Rembrandt', 'Rijksmuseum', 'baroque'],
  ['La Jeune Fille à la perle', 'Johannes Vermeer', 'Mauritshuis', 'baroque'],
  ['Les Trois Grâces', 'Pierre Paul Rubens', 'musée du Prado', 'baroque'],
  ['L’Extase de sainte Thérèse', 'Le Bernin', 'église Santa Maria della Vittoria', 'baroque'],
  ['L’Embarquement pour Cythère', 'Antoine Watteau', 'musée du Louvre', 'rococo'],
  ['Le Verrou', 'Jean-Honoré Fragonard', 'musée du Louvre', 'rococo'],
  ['Le Serment des Horaces', 'Jacques-Louis David', 'musée du Louvre', 'néoclassicisme'],
  ['La Mort de Marat', 'Jacques-Louis David', 'Musées royaux des Beaux-Arts', 'néoclassicisme'],
  ['La Grande Odalisque', 'Jean-Auguste-Dominique Ingres', 'musée du Louvre', 'néoclassicisme'],
  ['Le Voyageur contemplant une mer de nuages', 'Caspar David Friedrich', 'Kunsthalle de Hambourg', 'romantisme'],
  ['Le Radeau de la Méduse', 'Théodore Géricault', 'musée du Louvre', 'romantisme'],
  ['La Liberté guidant le peuple', 'Eugène Delacroix', 'musée du Louvre', 'romantisme'],
  ['Le Désespéré', 'Gustave Courbet', 'collection privée', 'réalisme'],
  ['Un enterrement à Ornans', 'Gustave Courbet', 'musée d’Orsay', 'réalisme'],
  ['L’Angélus', 'Jean-François Millet', 'musée d’Orsay', 'réalisme'],
  ['Olympia', 'Édouard Manet', 'musée d’Orsay', 'réalisme'],
  ['Le Déjeuner sur l’herbe', 'Édouard Manet', 'musée d’Orsay', 'réalisme'],
  ['Impression, soleil levant', 'Claude Monet', 'musée Marmottan Monet', 'impressionnisme'],
  ['La Gare Saint-Lazare', 'Claude Monet', 'musée d’Orsay', 'impressionnisme'],
  ['Le Bal du moulin de la Galette', 'Auguste Renoir', 'musée d’Orsay', 'impressionnisme'],
  ['La Classe de danse', 'Edgar Degas', 'musée d’Orsay', 'impressionnisme'],
  ['Le Berceau', 'Berthe Morisot', 'musée d’Orsay', 'impressionnisme'],
  ['Les Raboteurs de parquet', 'Gustave Caillebotte', 'musée d’Orsay', 'impressionnisme'],
  ['Un bar aux Folies Bergère', 'Édouard Manet', 'Courtauld Gallery', 'réalisme'],
  ['La Montagne Sainte-Victoire', 'Paul Cézanne', 'Courtauld Gallery', 'postimpressionnisme'],
  ['La Nuit étoilée', 'Vincent van Gogh', 'Museum of Modern Art', 'postimpressionnisme'],
  ['Les Tournesols', 'Vincent van Gogh', 'National Gallery de Londres', 'postimpressionnisme'],
  ['Le Café de nuit', 'Vincent van Gogh', 'Yale University Art Gallery', 'postimpressionnisme'],
  ['D’où venons-nous ? Que sommes-nous ? Où allons-nous ?', 'Paul Gauguin', 'Museum of Fine Arts de Boston', 'postimpressionnisme'],
  ['Un dimanche après-midi à l’Île de la Grande Jatte', 'Georges Seurat', 'Art Institute of Chicago', 'pointillisme'],
  ['Le Cirque', 'Georges Seurat', 'musée d’Orsay', 'pointillisme'],
  ['Le Cri', 'Edvard Munch', 'Musée national d’Oslo', 'expressionnisme'],
  ['La Danse', 'Henri Matisse', 'musée de l’Ermitage', 'fauvisme'],
  ['Les Demoiselles d’Avignon', 'Pablo Picasso', 'Museum of Modern Art', 'cubisme'],
  ['Guernica', 'Pablo Picasso', 'musée Reina Sofía', 'cubisme'],
  ['Le Portugais', 'Georges Braque', 'Kunstmuseum de Bâle', 'cubisme'],
  ['Formes uniques de continuité dans l’espace', 'Umberto Boccioni', 'Museum of Modern Art', 'futurisme'],
  ['Composition VIII', 'Vassily Kandinsky', 'musée Guggenheim de New York', 'art abstrait'],
  ['Carré noir', 'Kasimir Malevitch', 'galerie Tretiakov', 'suprématisme'],
  ['Fontaine', 'Marcel Duchamp', 'plusieurs répliques muséales', 'dadaïsme'],
  ['La Trahison des images', 'René Magritte', 'musée d’Art du comté de Los Angeles', 'surréalisme'],
  ['Le Fils de l’homme', 'René Magritte', 'collection privée', 'surréalisme'],
  ['La Persistance de la mémoire', 'Salvador Dalí', 'Museum of Modern Art', 'surréalisme'],
  ['Le Carnaval d’Arlequin', 'Joan Miró', 'Albright-Knox Art Gallery', 'surréalisme'],
  ['Les Deux Fridas', 'Frida Kahlo', 'Museo de Arte Moderno de Mexico', 'modernisme mexicain'],
  ['American Gothic', 'Grant Wood', 'Art Institute of Chicago', 'régionalisme américain'],
  ['Nighthawks', 'Edward Hopper', 'Art Institute of Chicago', 'réalisme américain'],
  ['Number 1A, 1948', 'Jackson Pollock', 'Museum of Modern Art', 'expressionnisme abstrait'],
  ['Orange and Yellow', 'Mark Rothko', 'Albright-Knox Art Gallery', 'expressionnisme abstrait'],
  ['Campbell’s Soup Cans', 'Andy Warhol', 'Museum of Modern Art', 'pop art'],
  ['Whaam!', 'Roy Lichtenstein', 'Tate Modern', 'pop art'],
  ['Maman', 'Louise Bourgeois', 'plusieurs collections muséales', 'art contemporain'],
  ['The Physical Impossibility of Death in the Mind of Someone Living', 'Damien Hirst', 'collection privée', 'Young British Artists'],
  ['The Weather Project', 'Olafur Eliasson', 'Tate Modern', 'art contemporain'],
  ['The Dinner Party', 'Judy Chicago', 'Brooklyn Museum', 'art féministe'],
  ['Untitled Film Stills', 'Cindy Sherman', 'Museum of Modern Art', 'art contemporain'],
];

const MUSIC_WORKS: MusicWork[] = [
  ['Les Quatre Saisons', 'Antonio Vivaldi', 'Italie', 'baroque'],
  ['Le Messie', 'Georg Friedrich Haendel', 'Allemagne', 'baroque'],
  ['L’Art de la fugue', 'Jean-Sébastien Bach', 'Allemagne', 'baroque'],
  ['Didon et Énée', 'Henry Purcell', 'Angleterre', 'baroque'],
  ['Les Indes galantes', 'Jean-Philippe Rameau', 'France', 'baroque'],
  ['La Flûte enchantée', 'Wolfgang Amadeus Mozart', 'Autriche', 'classicisme'],
  ['La Création', 'Joseph Haydn', 'Autriche', 'classicisme'],
  ['Fidelio', 'Ludwig van Beethoven', 'Allemagne', 'classicisme'],
  ['Le Freischütz', 'Carl Maria von Weber', 'Allemagne', 'romantisme'],
  ['Le Voyage d’hiver', 'Franz Schubert', 'Autriche', 'romantisme'],
  ['Symphonie fantastique', 'Hector Berlioz', 'France', 'romantisme'],
  ['Les Scènes d’enfants', 'Robert Schumann', 'Allemagne', 'romantisme'],
  ['Un requiem allemand', 'Johannes Brahms', 'Allemagne', 'romantisme'],
  ['Les Préludes', 'Franz Liszt', 'Hongrie', 'romantisme'],
  ['La Traviata', 'Giuseppe Verdi', 'Italie', 'romantisme'],
  ['Tristan et Isolde', 'Richard Wagner', 'Allemagne', 'romantisme'],
  ['La Bohème', 'Giacomo Puccini', 'Italie', 'romantisme'],
  ['Carmen', 'Georges Bizet', 'France', 'romantisme'],
  ['La Belle au bois dormant', 'Piotr Ilitch Tchaïkovski', 'Russie', 'romantisme'],
  ['Tableaux d’une exposition', 'Modeste Moussorgski', 'Russie', 'romantisme'],
  ['Le Beau Danube bleu', 'Johann Strauss fils', 'Autriche', 'romantisme'],
  ['Má vlast', 'Bedřich Smetana', 'Tchéquie', 'romantisme national'],
  ['Symphonie du Nouveau Monde', 'Antonín Dvořák', 'Tchéquie', 'romantisme national'],
  ['Peer Gynt', 'Edvard Grieg', 'Norvège', 'romantisme national'],
  ['Finlandia', 'Jean Sibelius', 'Finlande', 'romantisme national'],
  ['Prélude à l’Après-midi d’un faune', 'Claude Debussy', 'France', 'impressionnisme'],
  ['Boléro', 'Maurice Ravel', 'France', 'modernisme'],
  ['Le Sacre du printemps', 'Igor Stravinsky', 'Russie', 'modernisme'],
  ['Le Mandarin merveilleux', 'Béla Bartók', 'Hongrie', 'modernisme'],
  ['Pierrot lunaire', 'Arnold Schönberg', 'Autriche', 'expressionnisme'],
  ['Carmina Burana', 'Carl Orff', 'Allemagne', 'modernisme'],
  ['Rhapsody in Blue', 'George Gershwin', 'États-Unis', 'musique du XXe siècle'],
  ['Adagio for Strings', 'Samuel Barber', 'États-Unis', 'musique du XXe siècle'],
  ['Turangalîla-Symphonie', 'Olivier Messiaen', 'France', 'musique du XXe siècle'],
  ['Different Trains', 'Steve Reich', 'États-Unis', 'musique minimaliste'],
];

const BUILDINGS: Building[] = [
  ['dôme de Florence', 'Filippo Brunelleschi', 'Florence', 'Renaissance'],
  ['Tempietto de San Pietro in Montorio', 'Donato Bramante', 'Rome', 'Renaissance'],
  ['villa Rotonda', 'Andrea Palladio', 'Vicence', 'Renaissance'],
  ['colonnade de la place Saint-Pierre', 'Le Bernin', 'Rome', 'baroque'],
  ['palais de Blenheim', 'John Vanbrugh', 'Woodstock', 'baroque anglais'],
  ['Panthéon de Paris', 'Jacques-Germain Soufflot', 'Paris', 'néoclassicisme'],
  ['Altes Museum', 'Karl Friedrich Schinkel', 'Berlin', 'néoclassicisme'],
  ['palais de Westminster', 'Charles Barry', 'Londres', 'néogothique'],
  ['Crystal Palace', 'Joseph Paxton', 'Londres', 'architecture de fer'],
  ['Sagrada Família', 'Antoni Gaudí', 'Barcelone', 'modernisme catalan'],
  ['hôtel Tassel', 'Victor Horta', 'Bruxelles', 'Art nouveau'],
  ['École d’art de Glasgow', 'Charles Rennie Mackintosh', 'Glasgow', 'Art nouveau'],
  ['Sécession de Vienne', 'Joseph Maria Olbrich', 'Vienne', 'Sécession viennoise'],
  ['villa Savoye', 'Le Corbusier', 'Poissy', 'mouvement moderne'],
  ['maison Schröder', 'Gerrit Rietveld', 'Utrecht', 'De Stijl'],
  ['Bauhaus de Dessau', 'Walter Gropius', 'Dessau', 'Bauhaus'],
  ['pavillon de Barcelone', 'Ludwig Mies van der Rohe', 'Barcelone', 'mouvement moderne'],
  ['maison sur la cascade', 'Frank Lloyd Wright', 'Mill Run', 'architecture organique'],
  ['palais de l’Assemblée de Chandigarh', 'Le Corbusier', 'Chandigarh', 'brutalisme'],
  ['opéra de Sydney', 'Jørn Utzon', 'Sydney', 'expressionnisme moderne'],
  ['musée Guggenheim de New York', 'Frank Lloyd Wright', 'New York', 'architecture organique'],
  ['Centre Pompidou', 'Renzo Piano et Richard Rogers', 'Paris', 'architecture high-tech'],
  ['Lloyd’s Building', 'Richard Rogers', 'Londres', 'architecture high-tech'],
  ['pyramide du Louvre', 'Ieoh Ming Pei', 'Paris', 'architecture contemporaine'],
  ['musée Guggenheim de Bilbao', 'Frank Gehry', 'Bilbao', 'déconstructivisme'],
  ['musée juif de Berlin', 'Daniel Libeskind', 'Berlin', 'déconstructivisme'],
  ['Heydar Aliyev Center', 'Zaha Hadid', 'Bakou', 'néofuturisme'],
  ['Elbphilharmonie', 'Herzog & de Meuron', 'Hambourg', 'architecture contemporaine'],
  ['Burj Khalifa', 'Adrian Smith', 'Dubaï', 'néofuturisme'],
  ['Louvre Abu Dhabi', 'Jean Nouvel', 'Abou Dabi', 'architecture contemporaine'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

function makeQuestion(
  id: string,
  question: string,
  answer: string,
  distractors: string[],
  explanation: string,
  offset: number,
): Question {
  const options = rotate([answer, ...distractors], offset);
  return {
    id,
    categoryId: 'art',
    question,
    options,
    correctAnswerIndex: options.indexOf(answer),
    difficulty: 'adulte',
    explanation,
  };
}

function alternatives<T extends readonly string[]>(
  rows: T[],
  index: number,
  field: number,
): string[] {
  const answer = rows[index][field];
  const values: string[] = [];
  for (let step = 1; values.length < 3; step += 1) {
    const candidate = rows[(index + step * 7) % rows.length][field];
    if (candidate !== answer && !values.includes(candidate)) values.push(candidate);
  }
  return values;
}

const FACTS_ALREADY_COVERED = new Set([
  'Le Radeau de la Méduse',
  'La Liberté guidant le peuple',
  'Les Ménines',
  'La Ronde de nuit',
  'Le Déjeuner sur l’herbe',
  'Le Bal du moulin de la Galette',
  'La Montagne Sainte-Victoire',
  'Le Jardin des délices',
  'La Tour de Babel',
]);

/**
 * Premier lot relu : une seule carte par fait éditorial. Les autres axes
 * documentés ci-dessus restent hors banque tant qu'ils n'ont pas été relus
 * individuellement.
 */
/**
 * Cinquante œuvres canoniques, mais autant de formulations différentes.
 *
 * Ces cartes posaient toutes littéralement la même question — « Quel artiste
 * a créé « … » ? » — suivie de la même phrase d'explication. Le fait était
 * juste, la catégorie devenait une litanie. Les tournures et les explications
 * alternent désormais, sans toucher aux œuvres ni aux distracteurs.
 */
/** « à la galerie des Offices », « au musée du Louvre », « à l’église… ». */
function atMuseum(museum: string): string {
  if (/^plusieurs/.test(museum)) return `dans ${museum}`;
  if (/^collection/.test(museum)) return `dans une ${museum}`;
  if (/^église/.test(museum)) return `à l’${museum}`;
  if (/^Musées/.test(museum)) return `aux ${museum}`;
  if (/galerie|Gallery|Kunsthalle|chapelle/i.test(museum)) return `à la ${museum}`;
  return `au ${museum}`;
}

/** « de la Renaissance », « du baroque », « de l’impressionnisme ». */
function ofPeriod(period: string): string {
  if (/^[aeiouyéè]/i.test(period)) return `de l’${period}`;
  if (/^(Renaissance|Sécession|architecture|musique)/.test(period)) return `de la ${period}`;
  return `du ${period}`;
}

/** « à la Renaissance », « au baroque », « à l’impressionnisme ». */
function inPeriod(period: string): string {
  if (/^[aeiouyéè]/i.test(period)) return `à l’${period}`;
  if (/^(Renaissance|Sécession|architecture|musique)/.test(period)) return `à la ${period}`;
  return `au ${period}`;
}

const PROMPTS: ((work: string, museum: string, period: string) => string)[] = [
  (work) => `Qui a réalisé « ${work} » ?`,
  (work) => `De quel artiste « ${work} » est-il l’œuvre ?`,
  (work, museum) => `Qui a signé « ${work} », que l’on peut voir ${atMuseum(museum)} ?`,
  (work, _museum, period) => `Quel artiste ${ofPeriod(period)} est l’auteur de « ${work} » ?`,
  (work) => `À quel artiste doit-on « ${work} » ?`,
  (work) => `Quel est l’auteur de « ${work} » ?`,
  (work, museum) => `Quel artiste exposé ${atMuseum(museum)} a produit « ${work} » ?`,
  (work, _museum, period) => `Qui, ${inPeriod(period)}, a composé l’œuvre « ${work} » ?`,
];

/** « Œuvre du Bernin » plutôt que « Œuvre de Le Bernin ». */
function byArtist(artist: string): string {
  return artist.startsWith('Le ') ? `du ${artist.slice(3)}` : `de ${artist}`;
}

const COMMENTS: ((artist: string, museum: string, period: string) => string)[] = [
  (artist, museum, period) => `Œuvre ${byArtist(artist)}, rattachée ${inPeriod(period)} et conservée ${atMuseum(museum)}.`,
  (artist, museum) => `${artist} en est l’auteur ; on peut la voir ${atMuseum(museum)}.`,
  (artist, museum, period) => `L’art ${ofPeriod(period)} doit cette pièce à ${artist}, exposée ${atMuseum(museum)}.`,
  (artist, museum, period) => `${artist} en est l’auteur ; l’œuvre relève ${ofPeriod(period)} et se trouve ${atMuseum(museum)}.`,
];

export const ART_ADULTE_EDITORIAL: Question[] = ARTWORKS
  .filter(([work]) => !FACTS_ALREADY_COVERED.has(work))
  .slice(0, 50)
  .map(([work, artist, museum, period], index) => makeQuestion(
    `art_adulte_editorial_${String(index + 1).padStart(3, '0')}`,
    PROMPTS[index % PROMPTS.length](work, museum, period),
    artist,
    alternatives(
      ARTWORKS.filter(([candidate]) => !FACTS_ALREADY_COVERED.has(candidate)),
      index,
      1,
    ),
    COMMENTS[index % COMMENTS.length](artist, museum, period),
    index % 4,
  ));

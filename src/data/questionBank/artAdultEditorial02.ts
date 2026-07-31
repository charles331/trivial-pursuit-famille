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
  ['Quel compositeur russe a écrit « Tableaux d’une exposition » ?', 'Modeste Moussorgski', 'Mikhaïl Glinka', 'César Cui', 'Mili Balakirev', 'Moussorgski conçut cette suite pour piano après une exposition consacrée à Viktor Hartmann.'],
  ['Quel architecte a conçu le dôme de la cathédrale de Florence ?', 'Filippo Brunelleschi', 'Leon Battista Alberti', 'Donato Bramante', 'Andrea Palladio', 'Brunelleschi réalisa une double coupole autoportante, achevée au XVe siècle sans cintre en bois complet.'],
  ['Qui a conçu le Tempietto de San Pietro in Montorio à Rome ?', 'Donato Bramante', 'Raphaël', 'Michel-Ange', 'Giulio Romano', 'Ce petit édifice circulaire est un manifeste de l’architecture de la Haute Renaissance.'],
  ['Qui a dessiné la colonnade de la place Saint-Pierre à Rome ?', 'Le Bernin', 'Francesco Borromini', 'Carlo Maderno', 'Pietro da Cortona', 'Le Bernin conçut au XVIIe siècle les bras elliptiques de la colonnade comme un geste d’accueil.'],
  ['Qui a conçu l’Altes Museum de Berlin ?', 'Karl Friedrich Schinkel', 'Gottfried Semper', 'Leo von Klenze', 'Friedrich von Gärtner', 'Ouvert en 1830, l’Altes Museum présente une longue colonnade ionique face au Lustgarten.'],
  ['Quel architecte catalan a consacré la fin de sa vie à la Sagrada Família ?', 'Antoni Gaudí', 'Lluís Domènech i Montaner', 'Josep Puig i Cadafalch', 'Rafael Moneo', 'Gaudí reprit le projet en 1883 et transforma profondément sa conception néogothique initiale.'],
  ['Qui a conçu l’hôtel Tassel à Bruxelles ?', 'Victor Horta', 'Paul Hankar', 'Henry van de Velde', 'Gustave Strauven', 'Construit à partir de 1893, l’hôtel Tassel est souvent considéré comme un édifice fondateur de l’Art nouveau.'],
  ['Qui a conçu le pavillon de la Sécession à Vienne ?', 'Joseph Maria Olbrich', 'Otto Wagner', 'Josef Hoffmann', 'Adolf Loos', 'Le pavillon de 1898 est surmonté d’un dôme ajouré fait de feuilles de laurier dorées.'],
  ['Quel architecte a conçu la villa Savoye à Poissy ?', 'Le Corbusier', 'Auguste Perret', 'Robert Mallet-Stevens', 'Tony Garnier', 'La villa illustre les « cinq points d’une architecture nouvelle » formulés par Le Corbusier.'],
  ['Quel architecte fonda et conçut le bâtiment du Bauhaus à Dessau ?', 'Walter Gropius', 'Hannes Meyer', 'Marcel Breuer', 'László Moholy-Nagy', 'Le complexe inauguré en 1926 rend visibles sa structure et ses fonctions derrière de grandes façades vitrées.'],
  ['Quel architecte a conçu la maison sur la cascade en Pennsylvanie ?', 'Frank Lloyd Wright', 'Richard Neutra', 'Louis Kahn', 'Philip Johnson', 'Fallingwater fut bâtie au-dessus d’une cascade pour la famille Kaufmann à partir de 1936.'],
  ['Qui a conçu la pyramide de verre du Louvre ?', 'Ieoh Ming Pei', 'Tadao Andō', 'Norman Foster', 'Kenzo Tange', 'Inaugurée en 1989, la pyramide sert d’entrée au Grand Louvre dans la cour Napoléon.'],
  ['Quel architecte a conçu le musée Guggenheim de Bilbao ?', 'Frank Gehry', 'Daniel Libeskind', 'Peter Eisenman', 'Rem Koolhaas', 'Ouvert en 1997, le musée aux volumes revêtus de titane a contribué à transformer l’image de Bilbao.'],
  ['Qui a conçu le musée juif de Berlin ?', 'Daniel Libeskind', 'David Chipperfield', 'Aldo Rossi', 'Álvaro Siza', 'Le plan brisé du musée, ouvert en 2001, organise des axes et des vides liés à l’histoire juive allemande.'],
  ['Quelle architecte a conçu le Heydar Aliyev Center de Bakou ?', 'Zaha Hadid', 'Kazuyo Sejima', 'Jeanne Gang', 'Elizabeth Diller', 'Le centre culturel se distingue par une enveloppe continue aux courbes fluides, achevée en 2012.'],
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


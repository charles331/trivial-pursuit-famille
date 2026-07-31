import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel roi anglais imposa à sa cour une forme de costume trois-pièces en 1666 ?', 'Charles II', 'Jacques II', 'Guillaume III', 'George Ier', 'Charles II prescrivit un ensemble composé d’un long justaucorps, d’une veste et d’une culotte.'],
  ['Quelle créatrice ouvrit sa maison de couture parisienne en 1910 et popularisa le jersey ?', 'Gabrielle Chanel', 'Jeanne Lanvin', 'Madeleine Vionnet', 'Madame Grès', 'Chanel adapta jersey, marinière et éléments du vestiaire masculin à une mode féminine plus souple.'],
  ['Quel couturier lança le « New Look » en 1947 ?', 'Christian Dior', 'Cristóbal Balenciaga', 'Pierre Balmain', 'Jacques Fath', 'La première collection Dior réintroduisit taille étranglée et jupe ample après les restrictions de guerre.'],
  ['Quel couturier créa la robe Mondrian en 1965 ?', 'Yves Saint Laurent', 'André Courrèges', 'Pierre Cardin', 'Emanuel Ungaro', 'Saint Laurent traduisit les aplats géométriques de Mondrian dans une robe droite en jersey de laine.'],
  ['Quelle styliste britannique popularisa la minijupe dans les années 1960 ?', 'Mary Quant', 'Barbara Hulanicki', 'Zandra Rhodes', 'Vivienne Westwood', 'Mary Quant vendit à Londres des jupes très courtes associées à la culture jeune du Swinging London.'],
  ['Quel créateur utilisa des plaques de métal et de plastique pour des robes futuristes ?', 'Paco Rabanne', 'Pierre Cardin', 'André Courrèges', 'Rudi Gernreich', 'Rabanne assembla dès 1966 des robes avec pinces, anneaux et matériaux non textiles.'],
  ['Quelle créatrice britannique associa mode punk et boutique SEX à Londres ?', 'Vivienne Westwood', 'Zandra Rhodes', 'Katharine Hamnett', 'Stella McCartney', 'Westwood travailla avec Malcolm McLaren et transforma vêtements déchirés, slogans et tartan en langage punk.'],
  ['Quel créateur faisait partie du groupe de mode appelé les « Six d’Anvers » ?', 'Dries Van Noten', 'Martin Margiela', 'Raf Simons', 'Olivier Theyskens', 'Dries Van Noten participa au voyage professionnel à Londres qui fit connaître les Six d’Anvers en 1986.'],
  ['Quel créateur belge lança une maison connue pour ses vêtements déconstruits et ses étiquettes blanches ?', 'Martin Margiela', 'Ann Demeulemeester', 'Walter Van Beirendonck', 'Dirk Bikkembergs', 'Maison Martin Margiela rendit visibles doublures, coutures et traces de fabrication.'],
  ['Quel musée new-yorkais organise les expositions du Costume Institute ?', 'Le Metropolitan Museum of Art', 'Le Museum of Modern Art', 'Le Whitney Museum', 'Le Cooper Hewitt', 'Le Costume Institute du Met conserve des dizaines de milliers de vêtements et organise l’exposition liée au Met Gala.'],
  ['Quel artiste réalisa « 4′33″ », œuvre où l’interprète ne joue aucune note ?', 'John Cage', 'La Monte Young', 'Morton Feldman', 'Karlheinz Stockhausen', 'Créée en 1952 par David Tudor, l’œuvre fait entendre les sons ambiants pendant trois mouvements silencieux.'],
  ['Quel artiste français exposa une galerie vide sous le titre « Le Vide » en 1958 ?', 'Yves Klein', 'Arman', 'Daniel Spoerri', 'César', 'Klein vida et blanchit la galerie Iris Clert avant d’y accueillir les visiteurs dans un espace apparemment vide.'],
  ['Qui remplit la même galerie d’objets sous le titre « Le Plein » en 1960 ?', 'Arman', 'Yves Klein', 'Jean Tinguely', 'Martial Raysse', 'Arman répondit au Vide de Klein en entassant des déchets et objets jusqu’à rendre la galerie inaccessible.'],
  ['Quel artiste italien associé à l’Arte Povera utilisa chiffons, miroirs et objets ordinaires ?', 'Michelangelo Pistoletto', 'Lucio Fontana', 'Giorgio de Chirico', 'Enrico Castellani', 'Pistoletto employa ces matériaux dans un mouvement que le critique Germano Celant nomma en 1967.'],
  ['Qui écrivit que « l’idée devient une machine qui fait l’art » ?', 'Sol LeWitt', 'Donald Judd', 'Dan Flavin', 'Carl Andre', 'Dans ses Paragraphs on Conceptual Art de 1967, LeWitt plaça la conception avant l’exécution.'],
  ['Qui créa la spirale de basalte « Spiral Jetty » dans le Grand Lac Salé ?', 'Robert Smithson', 'Walter De Maria', 'Michael Heizer', 'Richard Long', 'Smithson construisit Spiral Jetty en 1970 avec roche, terre et cristaux de sel.'],
  ['Quel artiste installa « The Lightning Field » dans le désert du Nouveau-Mexique ?', 'Walter De Maria', 'Robert Smithson', 'James Turrell', 'Michael Heizer', 'L’œuvre de 1977 aligne quatre cents poteaux d’acier sur une grille d’un mile sur un kilomètre.'],
  ['Quel artiste travaille depuis les années 1970 à transformer un cratère en observatoire lumineux ?', 'James Turrell', 'Robert Irwin', 'Dan Graham', 'Bruce Nauman', 'Le Roden Crater de Turrell, en Arizona, organise la perception du ciel par des espaces construits.'],
  ['Quelle artiste réalisa la performance « The Artist Is Present » au MoMA ?', 'Marina Abramović', 'Yoko Ono', 'Carolee Schneemann', 'Valie Export', 'En 2010, Abramović resta assise silencieusement face à des visiteurs pendant les heures d’ouverture.'],
  ['Quel artiste allemand planta symboliquement « 7 000 chênes » à Cassel ?', 'Joseph Beuys', 'Anselm Kiefer', 'Sigmar Polke', 'Gerhard Richter', 'L’action lancée à documenta 7 associa chaque arbre à une colonne de basalte.'],
  ['Quel collectif féministe utilise des masques de gorille et des statistiques sur les musées ?', 'Guerrilla Girls', 'Art Workers’ Coalition', 'The Yes Men', 'Femen', 'Les Guerrilla Girls apparaissent anonymement depuis 1985 pour dénoncer sexisme et racisme dans l’art.'],
  ['Quel artiste enveloppa le Reichstag avec Jeanne-Claude en 1995 ?', 'Christo', 'Daniel Buren', 'Nils-Udo', 'Richard Long', 'Christo et Jeanne-Claude recouvrirent le parlement allemand de tissu argenté pendant deux semaines.'],
  ['Quel artiste français installe des bandes verticales alternées dans l’espace public ?', 'Daniel Buren', 'François Morellet', 'Claude Viallat', 'Bernar Venet', 'Buren utilise depuis les années 1960 un outil visuel fait de bandes de 8,7 centimètres.'],
  ['Quel artiste réalisa les colonnes rayées de la cour d’honneur du Palais-Royal ?', 'Daniel Buren', 'Jean Dubuffet', 'Arman', 'César', 'Les Deux Plateaux, achevés en 1986, intègrent 260 colonnes de hauteurs variées.'],
  ['Quel artiste chinois brisa volontairement un vase ancien dans une œuvre photographique ?', 'Ai Weiwei', 'Cai Guo-Qiang', 'Xu Bing', 'Huang Yong Ping', 'Dropping a Han Dynasty Urn, réalisée en 1995, questionne valeur culturelle et destruction.'],
  ['Quel artiste ghanéen crée de vastes tentures avec des capsules métalliques recyclées ?', 'El Anatsui', 'Ibrahim Mahama', 'Yinka Shonibare', 'William Kentridge', 'El Anatsui assemble des milliers de capsules avec du fil de cuivre en surfaces souples et monumentales.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_FINAL: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `art_adulte_editorial_final_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

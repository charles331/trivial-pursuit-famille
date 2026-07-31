import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel chorégraphe créa le ballet « L’Après-midi d’un faune » en 1912 ?', 'Vaslav Nijinski', 'Michel Fokine', 'Léonide Massine', 'George Balanchine', 'Nijinski chorégraphia et dansa ce ballet des Ballets russes sur la musique de Debussy.'],
  ['Qui chorégraphia « Le Spectre de la rose » pour les Ballets russes ?', 'Michel Fokine', 'Vaslav Nijinski', 'Bronislava Nijinska', 'Serge Lifar', 'Fokine créa ce pas de deux en 1911 pour Tamara Karsavina et Vaslav Nijinski.'],
  ['Quelle chorégraphe allemande développa le Tanztheater à Wuppertal ?', 'Pina Bausch', 'Mary Wigman', 'Sasha Waltz', 'Susanne Linke', 'Pina Bausch dirigea dès 1973 la compagnie devenue Tanztheater Wuppertal.'],
  ['Qui fonda le Ballet du XXe siècle à Bruxelles en 1960 ?', 'Maurice Béjart', 'Roland Petit', 'Rudolf Noureev', 'John Neumeier', 'Béjart installa sa compagnie au Théâtre royal de la Monnaie avant de partir à Lausanne.'],
  ['Quel chorégraphe belge fonda la compagnie Rosas ?', 'Anne Teresa De Keersmaeker', 'Jan Fabre', 'Alain Platel', 'Sidi Larbi Cherkaoui', 'De Keersmaeker fonda Rosas en 1983, année de la création de Rosas danst Rosas.'],
  ['Quel librettiste collabora avec Mozart pour « Don Giovanni » ?', 'Lorenzo Da Ponte', 'Pietro Metastasio', 'Arrigo Boito', 'Felice Romani', 'Da Ponte écrivit aussi pour Mozart les livrets des Noces de Figaro et de Così fan tutte.'],
  ['Quel couple de designers créa la Lounge Chair 670 pour Herman Miller ?', 'Charles et Ray Eames', 'Alison et Peter Smithson', 'Robin et Lucienne Day', 'Aino et Alvar Aalto', 'La chaise longue Eames, lancée en 1956, associe coques de contreplaqué moulé et cuir.'],
  ['Quel designer italien créa le presse-agrumes « Juicy Salif » ?', 'Philippe Starck', 'Ettore Sottsass', 'Achille Castiglioni', 'Joe Colombo', 'Starck dessina cet objet pour Alessi à la fin des années 1980.'],
  ['Qui fonda le groupe de design Memphis à Milan en 1980 ?', 'Ettore Sottsass', 'Gio Ponti', 'Bruno Munari', 'Enzo Mari', 'Memphis combina couleurs vives, motifs géométriques et matériaux considérés comme ordinaires.'],
  ['Quel designer britannique créa l’aspirateur sans sac Dual Cyclone ?', 'James Dyson', 'Jonathan Ive', 'Richard Sapper', 'Kenneth Grange', 'Dyson développa la séparation cyclonique après de nombreux prototypes dans les années 1980.'],
  ['Quel poète italien est l’auteur du « Canzoniere » consacré en partie à Laure ?', 'Pétrarque', 'Dante', 'Boccace', 'L’Arioste', 'Le Canzoniere de Pétrarque contribua à diffuser la forme du sonnet dans la poésie européenne.'],
  ['Qui a écrit le recueil « Les Contemplations » ?', 'Victor Hugo', 'Alphonse de Lamartine', 'Alfred de Musset', 'Gérard de Nerval', 'Publié en 1856, le recueil de Hugo est notamment marqué par la mort de sa fille Léopoldine.'],
  ['Quel poète est l’auteur des « Fleurs du mal » ?', 'Charles Baudelaire', 'Paul Verlaine', 'Arthur Rimbaud', 'Stéphane Mallarmé', 'À sa publication en 1857, six poèmes furent condamnés pour outrage à la morale publique.'],
  ['Qui a écrit le poème « Le Bateau ivre » ?', 'Arthur Rimbaud', 'Paul Verlaine', 'Lautréamont', 'Tristan Corbière', 'Rimbaud écrivit ce long poème en alexandrins en 1871, alors qu’il avait dix-sept ans.'],
  ['Quel poète américain a publié « Feuilles d’herbe » ?', 'Walt Whitman', 'Emily Dickinson', 'Edgar Allan Poe', 'Henry Wadsworth Longfellow', 'Whitman augmenta et remania Leaves of Grass pendant toute sa vie à partir de 1855.'],
  ['Qui a écrit « La Terre vaine » en 1922 ?', 'T. S. Eliot', 'Ezra Pound', 'W. B. Yeats', 'W. H. Auden', 'The Waste Land juxtapose plusieurs voix et langues dans un poème majeur du modernisme.'],
  ['Quel poète chilien publia « Vingt poèmes d’amour et une chanson désespérée » ?', 'Pablo Neruda', 'Vicente Huidobro', 'Nicanor Parra', 'Octavio Paz', 'Le recueil de Neruda parut en 1924 alors que le poète avait vingt ans.'],
  ['Qui est l’auteur du recueil « Cahier d’un retour au pays natal » ?', 'Aimé Césaire', 'Léopold Sédar Senghor', 'Léon-Gontran Damas', 'René Depestre', 'Le poème de Césaire, publié d’abord en 1939, est une œuvre fondatrice de la Négritude.'],
  ['Quel poète grec écrivit le long poème « Axion Esti » ?', 'Odysséas Elytis', 'Georges Séféris', 'Constantin Cavafy', 'Yannis Ritsos', 'Axion Esti, publié en 1959, fut ensuite mis en musique par Mikis Theodorakis.'],
  ['Qui a écrit le recueil « Ariel » publié après sa mort ?', 'Sylvia Plath', 'Anne Sexton', 'Elizabeth Bishop', 'Adrienne Rich', 'Ariel parut en 1965, deux ans après la mort de Sylvia Plath.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_04: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `art_adulte_editorial_04_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);


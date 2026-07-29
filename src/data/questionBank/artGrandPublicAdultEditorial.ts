import { Question } from '../../types';

/**
 * Dernier abaissement du plafond en « Art & Littérature ».
 *
 * Deux familles restaient surdimensionnées pour un jeu familial : la mode et la
 * typographie (36 cartes, dont sept sur des dessinateurs de caractères) et
 * l'histoire des arts extra-européens (41 cartes, jusqu'au byeri fang, au
 * céladon de Goryeo et au tā moko). Trente de ces cartes sont remplacées.
 *
 * Ce qui reste dans ces familles est ce qui a une image mentale partagée :
 * Chanel, Dior, Saint Laurent, Margiela, la chaise des Eames, le Bauhaus,
 * Hokusai, Borobudur, Chichén Itzá, Persépolis, les bronzes du Bénin.
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
  // ---- Peinture et sculpture ---------------------------------------------
  ['Quel peintre espagnol a peint « Les Fusillades du 3 mai 1808 » ?', 'Francisco de Goya', 'Diego Velázquez', 'El Greco', 'Bartolomé Murillo', 'Devenu sourd à quarante-six ans, il a terminé sa vie dans une maison couverte de peintures noires.'],
  ['Quel peintre a représenté des montres molles dans « La Persistance de la mémoire » ?', 'Salvador Dalí', 'René Magritte', 'Joan Miró', 'Max Ernst', 'Il affirmait avoir eu l’idée en observant un camembert qui fondait au soleil.'],
  ['Quel sculpteur florentin a taillé un David de plus de cinq mètres dans un seul bloc ?', 'Michel-Ange', 'Donatello', 'Le Bernin', 'Benvenuto Cellini', 'Le bloc de marbre avait été abandonné par deux sculpteurs avant lui, jugé inutilisable.'],
  ['Quel peintre néerlandais s’est coupé une partie de l’oreille à Arles en 1888 ?', 'Vincent van Gogh', 'Rembrandt', 'Piet Mondrian', 'Johannes Vermeer', 'Il n’a vendu presque aucun tableau de son vivant ; son frère Theo le soutenait financièrement.'],
  ['Quel peintre a couvert ses toiles de rectangles rouges, jaunes et bleus séparés de lignes noires ?', 'Piet Mondrian', 'Kasimir Malevitch', 'Vassily Kandinsky', 'Paul Klee', 'Il n’acceptait aucune diagonale, et s’est brouillé avec un ami qui en avait introduit une.'],
  ['Quel peintre est célèbre pour ses ballerines et ses scènes de coulisses de l’Opéra ?', 'Edgar Degas', 'Auguste Renoir', 'Édouard Manet', 'Berthe Morisot', 'Il se disait réaliste plutôt qu’impressionniste et travaillait surtout en atelier, de mémoire.'],
  ['Quel peintre italien de la Renaissance a peint la voûte de la chapelle Sixtine ?', 'Michel-Ange', 'Raphaël', 'Le Titien', 'Sandro Botticelli', 'Il a travaillé quatre ans debout, la tête renversée, et non allongé comme le veut la légende.'],
  ['Quel sculpteur a représenté un homme assis, penché, le menton sur la main ?', 'Auguste Rodin', 'Aristide Maillol', 'Antoine Bourdelle', 'Camille Claudel', 'La figure devait d’abord surmonter La Porte de l’Enfer et représenter Dante.'],
  ['Quelle sculptrice française, élève et compagne de Rodin, a réalisé « L’Âge mûr » ?', 'Camille Claudel', 'Germaine Richier', 'Niki de Saint Phalle', 'Louise Bourgeois', 'Son frère, l’écrivain Paul Claudel, l’a fait interner les trente dernières années de sa vie.'],
  ['Quelle artiste a peint avec son mari Robert des cercles colorés dits « rythmes » ?', 'Sonia Delaunay', 'Marie Laurencin', 'Vieira da Silva', 'Suzanne Valadon', 'Elle a appliqué ses recherches sur la couleur aux tissus, aux affiches et à la mode.'],

  // ---- Littérature -------------------------------------------------------
  ['Quel romancier a écrit « Le Comte de Monte-Cristo » et « Les Trois Mousquetaires » ?', 'Alexandre Dumas', 'Victor Hugo', 'Jules Verne', 'Eugène Sue', 'Il travaillait avec des collaborateurs, dont Auguste Maquet, et publiait en feuilletons quotidiens.'],
  ['Quel écrivain français a imaginé le capitaine Nemo et le Nautilus ?', 'Jules Verne', 'Alexandre Dumas', 'Pierre Loti', 'Maurice Leblanc', 'Ses Voyages extraordinaires comptent soixante-deux romans, publiés chez le même éditeur pendant quarante ans.'],
  ['Dans quel roman de Victor Hugo Quasimodo sonne-t-il les cloches ?', 'Notre-Dame de Paris', 'Les Misérables', 'Les Travailleurs de la mer', 'L’Homme qui rit', 'Le succès du livre a lancé la restauration de la cathédrale, alors très dégradée.'],
  ['Quel poète a écrit « Le Dormeur du val » avant d’abandonner la poésie à vingt ans ?', 'Arthur Rimbaud', 'Paul Verlaine', 'Stéphane Mallarmé', 'Alfred de Musset', 'Il est ensuite parti comme négociant en Afrique de l’Est, sans plus jamais écrire de vers.'],
  ['Quelle romancière a écrit « Bonjour tristesse » à dix-huit ans ?', 'Françoise Sagan', 'Simone de Beauvoir', 'Colette', 'Marguerite Duras', 'Le livre a fait scandale et s’est vendu à plus de deux millions d’exemplaires.'],
  ['Quelle écrivaine a signé « Le Blé en herbe » et les romans de Claudine ?', 'Colette', 'Françoise Sagan', 'George Sand', 'Anna de Noailles', 'Ses premiers livres ont paru sous le nom de son mari, qui l’enfermait pour la faire écrire.'],
  ['Quel roman de Marguerite Duras, prix Goncourt 1984, se déroule en Indochine ?', 'L’Amant', 'Hiroshima mon amour', 'Un barrage contre le Pacifique', 'Moderato cantabile', 'Elle y reprend, quarante ans plus tard, la matière autobiographique d’un roman précédent.'],
  ['Quel écrivain a créé le personnage de Cyrano de Bergerac au théâtre ?', 'Edmond Rostand', 'Victor Hugo', 'Alfred de Vigny', 'Alfred Jarry', 'La pièce, créée en 1897, a connu un triomphe immédiat de plus de quatre cents représentations.'],
  ['Quel dramaturge belge a écrit la pièce « Escurial » et des récits fantastiques ?', 'Michel de Ghelderode', 'Maurice Maeterlinck', 'Fernand Crommelynck', 'Jean Ray', 'Son théâtre, peuplé de masques et de marionnettes, s’inspire du carnaval flamand.'],
  ['Quel écrivain belge a signé les récits fantastiques des « Contes du whisky » ?', 'Jean Ray', 'Georges Simenon', 'Michel de Ghelderode', 'Thomas Owen', 'On l’a longtemps surnommé le Edgar Poe belge pour son goût de l’étrange et de la mer.'],

  // ---- Architecture, patrimoine, musées ----------------------------------
  ['Quel architecte belge est considéré comme un maître de l’Art nouveau à Bruxelles ?', 'Victor Horta', 'Henry van de Velde', 'Joseph Poelaert', 'Charles Girault', 'Quatre de ses maisons bruxelloises sont inscrites au patrimoine mondial de l’UNESCO.'],
  ['Quel monument bruxellois de 1958 représente neuf sphères reliées entre elles ?', 'L’Atomium', 'Le palais de Justice', 'La Basilique de Koekelberg', 'Le Mont des Arts', 'Il figure la maille d’un cristal de fer agrandie cent soixante-cinq milliards de fois.'],
  ['Quelle place de Bruxelles est bordée de maisons de guildes et d’un hôtel de ville gothique ?', 'La Grand-Place', 'La place Royale', 'Le Sablon', 'La place Sainte-Catherine', 'Un tapis de fleurs de bégonias y est déployé un week-end sur deux ans, en août.'],
  ['Quelle cathédrale française, incendiée en 2019, a fait l’objet d’une vaste restauration ?', 'Notre-Dame de Paris', 'La cathédrale de Reims', 'La cathédrale de Chartres', 'La cathédrale d’Amiens', 'Sa charpente médiévale, surnommée « la forêt », comptait plus de mille troncs de chêne.'],
  ['Quel château de la Loire est célèbre pour son escalier à double révolution ?', 'Chambord', 'Chenonceau', 'Azay-le-Rideau', 'Villandry', 'Léonard de Vinci, présent à la cour de François Ier, en aurait inspiré la conception.'],
  ['Quel palais parisien abrite l’une des plus grandes collections d’art du monde ?', 'Le Louvre', 'Le Grand Palais', 'Le palais de Tokyo', 'Le palais du Luxembourg', 'Ancienne forteresse puis résidence royale, il est devenu musée après la Révolution, en 1793.'],
  ['Quel monument parisien de fer forgé a été bâti pour l’Exposition universelle de 1889 ?', 'La tour Eiffel', 'Le Grand Palais', 'La galerie des Machines', 'Le pont Alexandre-III', 'Elle devait être démontée au bout de vingt ans ; la télégraphie sans fil l’a sauvée.'],
  ['Quelle basilique de Bruxelles est l’un des plus grands édifices Art déco du monde ?', 'La basilique de Koekelberg', 'La cathédrale Saints-Michel-et-Gudule', 'L’église Notre-Dame du Sablon', 'L’abbaye de la Cambre', 'Sa construction, commencée en 1905, ne s’est achevée qu’en 1970.'],
  ['Quelle abbaye normande est bâtie sur un îlot rocheux entouré de très fortes marées ?', 'Le Mont-Saint-Michel', 'L’abbaye de Jumièges', 'L’abbaye du Bec', 'L’abbaye de Fécamp', 'La mer peut y monter à la vitesse d’un cheval au galop lors des grandes marées.'],
  ['Quel musée d’Amsterdam conserve « La Ronde de nuit » de Rembrandt ?', 'Le Rijksmuseum', 'Le Stedelijk Museum', 'Le Mauritshuis', 'Le musée Van Gogh', 'La toile a été restaurée en public, sous les yeux des visiteurs et en direct sur internet.'],
];

export const ART_GRAND_PUBLIC_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `art_adulte_grand_public_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art' as const,
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

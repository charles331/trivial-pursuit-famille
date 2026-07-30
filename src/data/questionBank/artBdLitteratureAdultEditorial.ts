import { Question } from '../../types';

/**
 * Bande dessinée franco-belge, littérature et peinture grand public.
 *
 * Ces trente-huit cartes remplacent, à volume égal, les cartes de musique
 * classique parties vers « Pop Culture & Musique ». Elles corrigent surtout un
 * manque difficile à justifier dans un jeu destiné à un foyer belge : la bande
 * dessinée franco-belge ne comptait que deux cartes adultes sur quatre cents,
 * alors qu'elle en avait huit au niveau enfant et huit au niveau ado.
 *
 * Le reste renforce ce que le nom de la catégorie promet vraiment : des romans
 * que l'on a lus, des tableaux dont on a l'image en tête, du patrimoine que
 * l'on a visité.
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
  // ---- Bande dessinée franco-belge --------------------------------------
  ['Dans quel album Tintin part-il à la recherche d’un trésor sur une île d’Écosse ?', 'L’Île Noire', 'Le Lotus bleu', 'L’Étoile mystérieuse', 'Le Sceptre d’Ottokar', 'Hergé en a redessiné entièrement les décors en 1965, à la demande de son éditeur britannique qui les jugeait peu crédibles.'],
  ['Quel album de Tintin fut publié en deux tomes autour d’un voyage sur la Lune ?', 'Objectif Lune et On a marché sur la Lune', 'Le Temple du Soleil', 'Vol 714 pour Sydney', 'Coke en stock', 'Hergé s’est appuyé sur les travaux de l’ingénieur Bernard Heuvelmans, quinze ans avant Apollo 11.'],
  ['Quel personnage de Peyo précède les Schtroumpfs, qui y apparaissent d’abord en second rôle ?', 'Johan et Pirlouit', 'Benoît Brisefer', 'Jacky et Célestin', 'Poussy', 'Les Schtroumpfs surgissent en 1958 dans « La Flûte à six schtroumpfs » avant de prendre leur indépendance.'],
  ['Quel scénariste a écrit à la fois Astérix, Lucky Luke et Iznogoud ?', 'René Goscinny', 'Jean Van Hamme', 'Raoul Cauvin', 'Greg', 'Il a aussi dirigé le journal Pilote, qui a renouvelé la bande dessinée française dans les années 1960.'],
  ['Quel personnage d’Iznogoud veut « devenir calife à la place du calife » ?', 'Le grand vizir Iznogoud', 'Le calife Haroun El Poussah', 'Dilat Laraht', 'Le sultan Pullmankar', 'La formule est passée dans le langage courant pour désigner une ambition dévorante.'],
  ['Quelle est la particularité du personnage de Gaston Lagaffe à sa création en 1957 ?', 'Il apparaît sans histoire ni rôle défini', 'Il est le fils de Fantasio', 'Il vient de la série Spirou', 'Il est un personnage de publicité', 'Franquin l’a glissé dans les pages du journal comme un intrus, avant de lui donner ses propres gags.'],
  ['Quelle voiture Gaston Lagaffe conduit-elle dans la série de Franquin ?', 'Une Fiat 509', 'Une Citroën 2CV', 'Une Renault 4', 'Une Ford T', 'Franquin, passionné d’automobile, la dessinait dans un état de délabrement toujours plus avancé.'],
  ['Quel recueil très sombre Franquin a-t-il publié en marge de ses séries humoristiques ?', 'Idées noires', 'Les Robinsons du rail', 'Cauchemarrant', 'Le Trombone illustré', 'Ces planches en noir et blanc, très pessimistes, ont surpris son lectorat habituel.'],
  ['Quel album de Blake et Mortimer met en scène un criminel qui vole des œuvres et laisse un signe ?', 'La Marque jaune', 'Le Secret de l’Espadon', 'L’Énigme de l’Atlantide', 'Le Piège diabolique', 'Edgar P. Jacobs y a reconstitué le Londres des années 1950 avec une précision documentaire.'],
  ['Quel dessinateur belge a créé la série Le Chat ?', 'Philippe Geluck', 'Philippe Francq', 'Bernard Yslaire', 'Benoît Sokal', 'Ce personnage au costume et à la logique imparable est né dans les pages du quotidien Le Soir en 1983.'],
  ['Quel duo belge a créé la série des Cités obscures, à l’architecture imaginaire ?', 'François Schuiten et Benoît Peeters', 'Jean Van Hamme et Grzegorz Rosiński', 'Tome et Janry', 'Cauvin et Lambil', 'Schuiten a ensuite dessiné de véritables décors, dont une station du métro bruxellois.'],
  ['Quel marin aventurier a été créé par l’Italien Hugo Pratt ?', 'Corto Maltese', 'Bob Morane', 'Buck Danny', 'Ric Hochet', 'Pratt a longtemps travaillé pour des éditeurs belges avant de créer son personnage en 1967.'],
  ['Quelle récompense est la plus prestigieuse du Festival international de la bande dessinée d’Angoulême ?', 'Le Fauve d’or', 'L’Alph-Art d’honneur seul', 'Le Grand Prix Hergé', 'Le Bédéis Causa', 'Le festival se tient chaque année en janvier depuis 1974 et remet aussi un Grand Prix pour l’ensemble d’une œuvre.'],
  ['Quel dessinateur français, connu sous le pseudonyme Mœbius, a aussi signé Blueberry sous son vrai nom ?', 'Jean Giraud', 'Jacques Tardi', 'Enki Bilal', 'Philippe Druillet', 'Il a mené deux carrières parallèles : le western réaliste sous Giraud, la science-fiction onirique sous Mœbius.'],

  // ---- Littérature ------------------------------------------------------
  ['Quel vaste cycle romanesque Balzac a-t-il rassemblé sous un même titre ?', 'La Comédie humaine', 'Les Rougon-Macquart', 'À la recherche du temps perdu', 'Les Thibault', 'Près de cent romans et nouvelles s’y répondent, avec des personnages qui reviennent d’un livre à l’autre.'],
  ['Quel cycle de vingt romans Émile Zola consacre-t-il à une famille sous le Second Empire ?', 'Les Rougon-Macquart', 'La Comédie humaine', 'Les Hommes de bonne volonté', 'Les Chroniques italiennes', 'Germinal et L’Assommoir en font partie ; Zola voulait montrer l’hérédité à l’œuvre sur cinq générations.'],
  ['Dans quel roman de Zola les mineurs de Montsou se mettent-ils en grève ?', 'Germinal', 'L’Assommoir', 'La Bête humaine', 'Au Bonheur des Dames', 'Zola est descendu lui-même dans une fosse d’Anzin pour préparer son livre.'],
  ['Quelle héroïne de Flaubert s’endette et s’ennuie dans un bourg normand ?', 'Emma Bovary', 'Thérèse Raquin', 'Nana', 'Manon Lescaut', 'Le roman a valu à Flaubert un procès pour outrage aux bonnes mœurs, dont il est sorti acquitté.'],
  ['Par quelle scène célèbre s’ouvre « À la recherche du temps perdu » de Proust ?', 'Une madeleine trempée dans du thé', 'Un bal à l’Opéra', 'Un duel au petit matin', 'Un naufrage en Bretagne', 'Le goût réveille involontairement tout un pan d’enfance : c’est le point de départ de l’œuvre.'],
  ['Quel roman de Camus commence par l’annonce de la mort de la mère du narrateur ?', 'L’Étranger', 'La Peste', 'La Chute', 'Le Premier Homme', 'Sa première phrase, « Aujourd’hui, maman est morte », est l’une des plus commentées de la littérature française.'],
  ['Dans quelle ville algérienne se déroule « La Peste » de Camus ?', 'Oran', 'Alger', 'Constantine', 'Tlemcen', 'Camus y transpose l’expérience de l’Occupation sous la forme d’une épidémie.'],
  ['De quoi Molière est-il mort peu après une représentation en 1673 ?', 'D’un malaise pendant Le Malade imaginaire', 'D’un duel', 'D’une chute de cheval', 'De la peste', 'Il jouait précisément le rôle d’Argan, un hypocondriaque persuadé d’être mourant.'],
  ['Quel écrivain belge a reçu le prix Nobel de littérature en 1911 ?', 'Maurice Maeterlinck', 'Émile Verhaeren', 'Georges Simenon', 'Hugo Claus', 'Son théâtre symboliste, dont « L’Oiseau bleu », était joué dans toute l’Europe.'],
  ['Quelle romancière née à Bruxelles est entrée à l’Académie française en 1980, la première femme élue ?', 'Marguerite Yourcenar', 'Marguerite Duras', 'Simone de Beauvoir', 'Nathalie Sarraute', 'Ses « Mémoires d’Hadrien » se présentent comme la longue lettre d’un empereur romain vieillissant.'],
  ['Combien de membres l’Académie française compte-t-elle lorsqu’elle est au complet ?', 'Quarante', 'Vingt', 'Soixante', 'Cent', 'On les appelle les Immortels, d’après la devise « À l’immortalité » figurant sur leur sceau.'],
  ['Quel prix littéraire français est décerné chaque année début novembre chez Drouant ?', 'Le prix Goncourt', 'Le prix Nobel', 'Le prix Femina', 'Le prix Renaudot', 'Sa dotation est symbolique — quelques euros — mais il multiplie les ventes par plusieurs centaines de milliers.'],

  // ---- Peinture, sculpture, patrimoine ----------------------------------
  ['Quel retable des frères Van Eyck est conservé dans la cathédrale Saint-Bavon de Gand ?', 'L’Agneau mystique', 'Le Jugement dernier', 'Le Retable d’Issenheim', 'La Descente de croix', 'Volé à plusieurs reprises au cours de l’histoire, il lui manque encore aujourd’hui un panneau.'],
  ['Quel peintre flamand est célèbre pour ses scènes de villageois, dont « Le Repas de noce » ?', 'Pieter Bruegel l’Ancien', 'Jérôme Bosch', 'Antoine Van Dyck', 'Quentin Metsys', 'Ses fils et petits-fils ont poursuivi le métier, ce qui complique parfois l’attribution des tableaux.'],
  ['Quel peintre belge est connu pour ses scènes de carnaval, de masques et de squelettes ?', 'James Ensor', 'Paul Delvaux', 'Constant Permeke', 'Fernand Khnopff', 'Il a passé presque toute sa vie à Ostende, au-dessus de la boutique de souvenirs de sa famille.'],
  ['Dans quelle station du métro bruxellois peut-on voir une grande fresque de Paul Delvaux ?', 'Bourse', 'Arts-Loi', 'Schuman', 'Louise', 'La Communauté bruxelloise a confié des œuvres à une soixantaine d’artistes pour décorer son métro.'],
  ['Quelle sculpture de Rodin représente un couple enlacé dans le marbre ?', 'Le Baiser', 'Le Penseur', 'L’Âge d’airain', 'La Cathédrale', 'Elle devait d’abord figurer sur La Porte de l’Enfer, avant que Rodin ne l’en retire.'],
  ['Dans quel jardin Monet a-t-il peint sa série des Nymphéas ?', 'Son jardin de Giverny', 'Le jardin du Luxembourg', 'Le parc de Sceaux', 'Les jardins de Versailles', 'Il y a fait détourner un bras de rivière pour créer le bassin et son pont japonais.'],
  ['Quelle statue grecque sans bras est l’une des plus visitées du Louvre ?', 'La Vénus de Milo', 'La Victoire de Samothrace', 'Le Discobole', 'L’Aurige de Delphes', 'Découverte en 1820 sur l’île de Milos, elle est arrivée au Louvre l’année suivante.'],
  ['Quel peintre a immortalisé les affiches et les danseuses du Moulin Rouge ?', 'Henri de Toulouse-Lautrec', 'Édouard Manet', 'Edgar Degas', 'Georges Seurat', 'Ses affiches lithographiées ont fait entrer la publicité dans l’histoire de l’art.'],
  ['Quel peintre viennois a couvert « Le Baiser » de feuilles d’or ?', 'Gustav Klimt', 'Egon Schiele', 'Oskar Kokoschka', 'Alfons Mucha', 'Son père était graveur et ciseleur sur or, un métier dont il a gardé le goût des surfaces précieuses.'],
  ['Quelle estampe japonaise d’Hokusai montre une vague immense devant le mont Fuji ?', 'La Grande Vague de Kanagawa', 'Le Pont d’Ohashi sous la pluie', 'Les Cinquante-trois Stations', 'Le Pavillon d’or', 'Elle a beaucoup circulé en Europe et marqué durablement les impressionnistes.'],
  ['Dans quelle ville néerlandaise Vermeer a-t-il vécu et peint presque toute son œuvre ?', 'Delft', 'Amsterdam', 'Haarlem', 'Utrecht', 'On ne lui connaît qu’une trentaine de tableaux, ce qui en fait l’un des peintres majeurs les moins prolifiques.'],
  ['Quel musée bruxellois est consacré au plus célèbre peintre surréaliste belge ?', 'Le musée Magritte', 'Le musée Horta', 'Le musée du Cinquantenaire', 'Le musée Wiertz', 'Installé place Royale depuis 2009, il réunit plus de deux cents pièces de l’artiste.'],
];

export const ART_BD_LITTERATURE_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `art_adulte_bd_litterature_${String(index + 1).padStart(3, '0')}`,
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

import { Question } from '../../types';

type Draft = [string, string, string, string, string, string];

const drafts: Draft[] = [
  ["Quel fromage italien est filé à chaud selon la technique de la pasta filata ?", "La mozzarella", "Le parmesan", "Le gorgonzola", "Le pecorino romano", "Le caillé acidifié est étiré dans l'eau chaude, ce qui donne à la mozzarella sa structure fibreuse."],
  ["Quel fromage italien à pâte dure est affiné au minimum douze mois dans sa version Parmigiano Reggiano ?", "Le parmesan", "Le taleggio", "La fontina", "La burrata", "Le Parmigiano Reggiano AOP suit un cahier des charges strict et ne contient pas d'additifs."],
  ["Que contient le cœur crémeux d'une burrata ?", "De la stracciatella et de la crème", "Du gorgonzola fondu", "Du pesto", "De la ricotta sucrée", "Une enveloppe de pâte filée renferme des filaments de mozzarella mêlés à de la crème."],
  ["Quel fromage français est affiné avec une croûte fleurie blanche ?", "Le camembert", "Le comté", "Le cantal", "Le beaufort", "La flore de surface, notamment Penicillium camemberti, forme la croûte et transforme progressivement la pâte."],
  ["Quel gaz forme les trous de l'emmental pendant l'affinage ?", "Le dioxyde de carbone libéré par des bactéries", "L'azote de l'air emprisonné", "La vapeur d'eau du lait", "L'oxygène de la cave", "Des bactéries propioniques le produisent en digérant l'acide lactique ; l'affinage se fait en cave chaude."],
  ["Quel fromage belge est traditionnellement affiné avec une croûte lavée orangée ?", "Le Herve", "Le Passendale", "Le fromage de Bruxelles frais", "Le fromage blanc", "Les lavages favorisent une flore de surface qui donne au Herve son odeur et ses arômes caractéristiques."],
  ["Que signifie « affiner » un fromage ?", "Le faire maturer sous conditions contrôlées", "Retirer tout son sel", "Le faire fondre puis refroidir", "Ajouter obligatoirement des moisissures bleues", "Température, humidité, retournements et soins de croûte pilotent l'évolution de la texture et des arômes."],
  ["Quel fromage chypriote garde une bonne tenue sur le gril ?", "Le halloumi", "La feta", "Le brie", "Le roquefort", "Son réseau protéique et sa fabrication lui donnent un point de fusion élevé, permettant de le dorer sans qu'il s'écoule."],
  ["Quelle sauce française émulsionne jaunes d'œufs et beurre clarifié avec une acidité ?", "La hollandaise", "La béarnaise froide", "La béchamel", "La sauce tomate", "La hollandaise est une émulsion chaude fragile; une température excessive peut coaguler les jaunes."],
  ["Quelle herbe distingue principalement une béarnaise d'une hollandaise ?", "L'estragon", "Le basilic", "La menthe", "La coriandre", "La béarnaise emploie une réduction de vinaigre, échalote, estragon et souvent cerfeuil."],
  ["Quelle sauce froide provençale est une mayonnaise fortement aillée ?", "L'aïoli", "La rouille", "La gribiche", "La ravigote", "Dans les versions modernes, l'aïoli associe ail, jaune d'œuf et huile; des traditions plus anciennes reposent sur l'ail pilé et l'huile."],
  ["Quel ingrédient colore et parfume traditionnellement la sauce rouille ?", "Le safran et le piment", "La betterave", "Le curry vert", "Le cacao", "La rouille accompagne notamment la bouillabaisse avec du pain ou des croûtons."],
  ["Quelle sauce anglaise contient vinaigre, mélasse, anchois et tamarin ?", "La sauce Worcestershire", "La sauce mint", "La brown sauce uniquement", "La custard", "La Worcestershire est fermentée et apporte acidité, salinité, douceur et umami."],
  ["Quelle pâte japonaise est issue de soja fermenté avec du koji ?", "Le miso", "Le wasabi", "Le yuzu kosho", "Le nori", "Riz, orge ou soja peuvent servir de support au koji; durée et composition déterminent couleur et intensité du miso."],
  ["Quel micro-organisme est utilisé pour produire le koji ?", "Aspergillus oryzae", "Penicillium roqueforti", "Saccharomyces boulardii", "Acetobacter aceti", "Le koji fournit des enzymes qui transforment amidons et protéines lors de la fabrication du saké, du miso ou de la sauce soja."],
  ["Quel aliment est produit en coagulant un lait de soja ?", "Le tofu", "Le tempeh", "Le miso", "Le seitan", "Des sels minéraux ou des acides coagulent les protéines; la quantité d'eau retenue détermine la fermeté."],
  ["De quelle protéine céréalière est principalement fait le seitan ?", "Le gluten de blé", "La protéine de riz", "La caséine", "La protéine de pois", "Le seitan est obtenu en isolant le gluten d'une pâte de blé puis en le cuisant dans un bouillon."],
  ["Quel processus transforme l'éthanol en acide acétique pour produire du vinaigre ?", "L'oxydation acétique", "La fermentation malolactique", "La réaction de Maillard", "La coagulation", "Des bactéries acétiques oxydent l'alcool en présence d'oxygène."],
  ["Quelle « mère » gélatineuse peut se former à la surface d'un vinaigre non pasteurisé ?", "Une culture de bactéries acétiques et cellulose", "Une moisissure de fromage", "Du gluten hydraté", "De la pectine pure", "La mère de vinaigre contient des micro-organismes actifs et une matrice de cellulose."],
  ["Quel procédé conserve des légumes dans une saumure grâce aux bactéries lactiques ?", "La lactofermentation", "La pasteurisation sèche", "La lyophilisation", "Le fumage", "Les bactéries produisent de l'acide lactique, abaissant le pH et créant des saveurs acidulées."],
  ["Pourquoi faut-il immerger les légumes pendant une lactofermentation ?", "Pour limiter l'exposition à l'oxygène", "Pour augmenter leur teneur en gluten", "Pour arrêter toute fermentation", "Pour les cuire", "Une saumure correctement dosée et un milieu pauvre en oxygène favorisent les bactéries recherchées."],
  ["Quel procédé retire l'eau d'un aliment congelé sous vide ?", "La lyophilisation", "La pasteurisation", "Le confisage", "La centrifugation", "La glace passe directement à l'état de vapeur par sublimation, ce qui préserve bien structure et arômes."],
  ["Quelle méthode chauffe brièvement un aliment puis le refroidit rapidement avant congélation ?", "Le blanchiment", "Le braisage", "Le rôtissage", "La déshydratation", "Le blanchiment ralentit des enzymes qui altéreraient couleur, saveur et texture pendant le stockage."],
  ["Quel mode de conservation plonge un aliment dans la graisse après cuisson lente ?", "Le confit", "Le gravlax", "Le ceviche", "Le saumurage à sec", "Le confit traditionnel limite le contact avec l'air, mais doit aujourd'hui respecter des règles strictes de refroidissement et de conservation."],
  ["Quel saumon nordique est salé avec sucre et aneth sans être fumé ?", "Le gravlax", "Le kipper", "Le haddock", "Le rollmops", "Le gravlax est une préparation crue maturée au sel; hygiène, température et qualité du poisson sont essentielles."],
  ["Quel poisson fumé et coloré au rocou est appelé haddock en cuisine française ?", "L'églefin", "Le cabillaud", "Le hareng", "Le saumon", "En français culinaire, le haddock désigne de l'églefin salé et fumé, souvent teinté en orange."],
  ["Que désigne un « kipper » britannique ?", "Un hareng fendu, salé et fumé", "Un saumon mariné à l'aneth", "Une anguille en gelée", "Un maquereau au vinaigre", "Le hareng est ouvert en papillon puis fumé à froid, traditionnellement servi au petit déjeuner."],
  ["Quel plat alsacien associe chou fermenté et garnitures de viande ?", "La choucroute garnie", "Le baeckeoffe", "La flammekueche", "Le kougelhopf", "La choucroute résulte d'une fermentation lactique du chou finement émincé."],
  ["Quel plat alsacien mijote viandes et pommes de terre dans une terrine scellée ?", "Le baeckeoffe", "La choucroute", "Le coq au riesling", "Le bibeleskaes", "Le baeckeoffe traditionnel associe plusieurs viandes marinées au vin blanc avec légumes et pommes de terre."],
  ["Quel plat hongrois est une soupe ou un ragoût parfumé au paprika ?", "Le goulasch", "Le pierogi", "Le bigos", "Le bortsch", "Le gulyás hongrois est historiquement une soupe de bergers; ses versions étrangères sont souvent plus épaisses."],
  ["Quel ravioli d'Europe centrale peut être garni de pomme de terre et fromage ?", "Le pierogi", "Le knödel", "Le spaetzle", "Le blini", "Les pierogi polonais sont bouillis puis parfois poêlés; les garnitures peuvent être salées ou sucrées."],
  ["Quel plat vietnamien est une soupe de nouilles de riz dans un bouillon aromatique ?", "Le phở", "Le bánh mì", "Le bún chả", "Le gỏi cuốn", "Le phở varie entre le Nord et le Sud du Vietnam, notamment par les garnitures et l'assaisonnement."],
  ["Quel sandwich vietnamien témoigne de l'influence de la baguette française ?", "Le bánh mì", "Le bánh xèo", "Le bánh cuốn", "Le cơm tấm", "La baguette légère est garnie de viandes, légumes marinés, herbes et condiments."],
];

export const GASTRONOMIE_ADULT_CURATED_03: Question[] = drafts.map((draft, index) => ({
  id: `gas_adulte_curated_03_${String(index + 1).padStart(3, '0')}`,
  categoryId: 'gastronomie',
  question: draft[0],
  options: [draft[1], draft[2], draft[3], draft[4]],
  correctAnswerIndex: 0,
  difficulty: 'adulte',
  explanation: draft[5],
}));


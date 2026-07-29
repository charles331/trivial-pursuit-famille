import { Question } from '../../types';

/**
 * Dernier abaissement du plafond en sciences.
 *
 * La banque gardait des cartes de niveau universitaire, héritées d'un temps où
 * la catégorie mélangeait tableau périodique et biologie moléculaire : le
 * ribulose-1,5-bisphosphate, le plasmocyte, la rhodopsine, l'énarthrose, la
 * glycolyse, les thylakoïdes, l'anse de Henlé, la discontinuité de
 * Mohorovičić, l'upwelling, la diagenèse, l'héliopause, l'héliographe.
 *
 * Vingt-cinq d'entre elles sont remplacées par de la science grand public, dans
 * le registre déjà retenu pour le reste de la catégorie : ce que l'on peut
 * observer, comprendre et retenir.
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
  // ---- Corps humain et santé ---------------------------------------------
  ['Combien de temps un globule rouge vit-il environ dans le sang ?', 'Environ 120 jours', 'Environ 10 jours', 'Environ 3 ans', 'Toute la vie', 'La moelle osseuse en fabrique donc en permanence, plus de deux millions par seconde.'],
  ['Quel organe est le seul du corps humain capable de se régénérer largement ?', 'Le foie', 'Le cœur', 'Le cerveau', 'Le pancréas', 'On peut en prélever une partie sur un donneur vivant : elle repousse en quelques mois chez les deux patients.'],
  ['Pourquoi bâille-t-on, selon l’hypothèse la mieux étayée aujourd’hui ?', 'Pour refroidir légèrement le cerveau', 'Pour capter plus d’oxygène', 'Pour étirer les mâchoires', 'Pour évacuer du gaz carbonique', 'L’ancienne explication par le manque d’oxygène n’a jamais été confirmée par l’expérience.'],
  ['Combien de temps un adulte peut-il survivre sans boire, en moyenne ?', 'Environ trois jours', 'Environ trois semaines', 'Environ douze heures', 'Environ deux mois', 'Sans manger, en revanche, le corps tient plusieurs semaines en puisant dans ses réserves.'],
  ['Pourquoi la peau se ride-t-elle avec l’âge ?', 'Le collagène et l’élastine se raréfient', 'Les cellules gonflent', 'La peau absorbe moins d’eau de pluie', 'Les muscles s’épaississent', 'L’exposition au soleil accélère nettement le phénomène : c’est le photovieillissement.'],
  ['Quel sens est le plus directement lié à la mémoire et aux émotions ?', 'L’odorat', 'La vue', 'L’ouïe', 'Le toucher', 'Ses signaux rejoignent le cerveau sans passer par le relais qui filtre les autres sens.'],

  // ---- Vivant -------------------------------------------------------------
  ['Quel animal possède trois cœurs ?', 'La pieuvre', 'Le dauphin', 'Le crocodile', 'L’autruche', 'Deux cœurs alimentent les branchies, le troisième le reste du corps ; son sang est bleu.'],
  ['Quel est l’animal terrestre le plus rapide sur une courte distance ?', 'Le guépard', 'Le lévrier', 'L’antilope', 'Le cheval', 'Il ne tient sa vitesse maximale que vingt à trente secondes avant de devoir s’arrêter.'],
  ['Combien de temps vit une abeille ouvrière en pleine saison ?', 'Environ six semaines', 'Environ deux ans', 'Environ six mois', 'Environ trois jours', 'Celles nées à l’automne vivent beaucoup plus longtemps, le temps de passer l’hiver.'],
  ['Quel arbre est considéré comme le plus vieil organisme vivant connu ?', 'Le pin de Bristlecone', 'Le chêne pédonculé', 'Le séquoia géant', 'Le baobab', 'Certains dépassent 4 800 ans, en poussant très lentement dans des montagnes arides.'],
  ['Pourquoi les feuilles deviennent-elles jaunes et rouges à l’automne ?', 'La chlorophylle disparaît et laisse voir d’autres pigments', 'L’arbre fabrique de nouveaux pigments', 'Le froid brûle les feuilles', 'La sève remonte dans le tronc', 'Les caroténoïdes jaunes étaient présents tout l’été, masqués par le vert de la chlorophylle.'],
  ['Quel groupe d’animaux compte le plus d’espèces décrites sur Terre ?', 'Les insectes', 'Les poissons', 'Les oiseaux', 'Les mammifères', 'Plus d’un million d’espèces sont décrites, et les entomologistes en découvrent chaque année.'],
  ['Comment appelle-t-on le phénomène qui rend certains animaux lumineux ?', 'La bioluminescence', 'La fluorescence solaire', 'La phosphorescence minérale', 'L’iridescence', 'Elle est très répandue en mer profonde, où la lumière du soleil ne parvient plus.'],

  // ---- Terre, climat, espace ---------------------------------------------
  ['Pourquoi la mer Morte permet-elle de flotter sans effort ?', 'Sa très forte salinité augmente la poussée', 'Elle est peu profonde', 'Son eau est plus froide', 'Elle contient beaucoup d’air dissous', 'Elle est environ dix fois plus salée que l’océan, ce qui la rend beaucoup plus dense.'],
  ['Quelle est la couche de l’atmosphère où se produit la météo ?', 'La troposphère', 'La stratosphère', 'La mésosphère', 'L’ionosphère', 'Elle ne dépasse pas une dizaine de kilomètres, mais concentre presque toute la vapeur d’eau.'],
  ['Pourquoi observe-t-on des aurores boréales surtout près des pôles ?', 'Le champ magnétique y guide les particules solaires', 'L’air y est plus froid', 'Le soleil y est plus proche', 'La glace réfléchit la lumière', 'Lors des fortes éruptions solaires, on peut exceptionnellement en voir jusque sous nos latitudes.'],
  ['Combien de temps met un déchet de plastique à se dégrader en mer, en ordre de grandeur ?', 'Plusieurs siècles', 'Quelques mois', 'Une dizaine d’années', 'Quelques jours', 'Il ne disparaît pas : il se fragmente en microplastiques que l’on retrouve dans la chaîne alimentaire.'],
  ['Quelle est la principale source d’électricité en France ?', 'Le nucléaire', 'Le charbon', 'L’éolien', 'Le gaz', 'La Belgique, elle, combine nucléaire, gaz et importations, avec une part croissante d’éolien en mer.'],
  ['Que mesure-t-on avec un panneau solaire photovoltaïque en kilowatt-crête ?', 'Sa puissance maximale dans des conditions de référence', 'Sa production annuelle', 'Sa surface', 'Son rendement moyen', 'La production réelle dépend ensuite de l’orientation, de la latitude et de la météo.'],
  ['Quel gaz les fusées utilisent-elles le plus souvent comme comburant ?', 'L’oxygène liquide', 'L’azote liquide', 'L’hélium', 'Le gaz carbonique', 'Il est stocké à environ -183 °C, d’où le givre visible sur les réservoirs avant le décollage.'],

  // ---- Physique et chimie du quotidien -----------------------------------
  ['Pourquoi le sel fait-il fondre la glace sur les routes ?', 'Il abaisse la température de fusion de l’eau', 'Il réchauffe la surface', 'Il absorbe l’humidité', 'Il rend la glace poreuse', 'Le procédé perd son efficacité en dessous d’environ -10 °C.'],
  ['Pourquoi une casserole d’eau bout-elle plus vite en altitude ?', 'La pression plus faible abaisse la température d’ébullition', 'L’air est plus sec', 'Le feu chauffe davantage', 'L’eau y est plus pure', 'À 2 000 mètres, l’eau bout vers 93 °C : les pâtes y cuisent donc moins bien.'],
  ['Pourquoi un miroir de salle de bain se couvre-t-il de buée ?', 'La vapeur se condense sur la surface froide', 'Le verre absorbe l’eau', 'Le savon dégage un gaz', 'L’air chaud sèche le verre', 'Chauffer le miroir, ou aérer la pièce, suffit à empêcher la condensation.'],
  ['Pourquoi le pain grillé brunit-il et sent-il bon ?', 'La réaction de Maillard entre sucres et protéines', 'La caramélisation du beurre', 'L’évaporation de l’eau seule', 'La fermentation continue', 'La même réaction donne leur goût à la viande saisie, au café torréfié et à la bière brune.'],
  ['Pourquoi ajoute-t-on du fluor dans certains dentifrices ?', 'Il renforce l’émail contre les acides', 'Il blanchit les dents', 'Il tue toutes les bactéries', 'Il parfume la pâte', 'Il favorise la reminéralisation de l’émail attaqué par les acides des aliments.'],
];

export const SCIENCES_GRAND_PUBLIC_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `sci_adulte_grand_public_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'sciences' as const,
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

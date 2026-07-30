import { Question } from '../../types';

/**
 * Table française et belge — dernier abaissement du plafond en gastronomie.
 *
 * La catégorie comptait encore une vingtaine de cartes de condiments et de
 * préparations que l'on ne croise pas dans une cuisine d'ici : dashi, tare,
 * ponzu, nam pla, nước mắm, kecap manis, gochujang, natto, tempeh, żurek,
 * khinkali, sinigang, nasi lemak, malva pudding, dukkah, yuzu kosho. Les plats
 * du monde réellement connus — sushi, ceviche, tequila, harissa, tandoori, dim
 * sum, phở, bánh mì, miso, goulasch, feijoada — restent en place : ce n'est pas
 * « le monde » qu'il fallait retirer, c'est la longue traîne.
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
  ['Quel fromage belge à pâte molle et à l’odeur puissante est protégé par une AOP ?', 'Le Herve', 'Le Passendale', 'Le Maredsous', 'Le Vieux Bruges', 'C’est le seul fromage belge sous appellation d’origine protégée ; il s’affine en cave humide pendant plusieurs semaines.'],
  ['Quelle bière belge blonde forte est brassée à l’abbaye de Westmalle ?', 'La Tripel', 'La Kriek', 'La Gueuze', 'La Faro', 'C’est cette bière qui a donné son nom au style « triple », aujourd’hui brassé dans le monde entier.'],
  ['Quelle spécialité belge se compose de pommes de terre écrasées avec des légumes ?', 'Le stoemp', 'La carbonnade', 'Le waterzooi', 'Le filet américain', 'Carottes, poireaux ou chicons selon la saison : c’est un plat d’hiver bruxellois par excellence.'],
  ['Quelle salade wallonne associe pommes de terre tièdes, haricots verts et lardons ?', 'La salade liégeoise', 'La salade ardennaise', 'La salade namuroise', 'La salade brabançonne', 'Un filet de vinaigre chaud versé sur les haricots lui donne son goût caractéristique.'],
  ['Quel plat gantois mijote de la volaille dans un bouillon crémeux aux légumes ?', 'Le waterzooi', 'La carbonnade', 'Le stoemp', 'Le hochepot', 'Sa version d’origine se faisait au poisson de rivière, avant que la volaille ne prenne le dessus.'],
  ['Quelle pâtisserie belge est une brioche ronde fourrée de crème pâtissière et de raisins ?', 'Le craquelin ou la couque suisse', 'Le speculoos', 'Le cuberdon', 'La tarte al djote', 'On la trouve chez les boulangers le dimanche matin, souvent parfumée à la fleur d’oranger.'],
  ['Quelle tarte wallonne de Nivelles est garnie de bettes et de fromage fort ?', 'La tarte al djote', 'La tarte au riz', 'La tarte au sucre', 'La flamiche', 'Elle se mange tiède, largement beurrée, et bénéficie d’une indication géographique protégée.'],
  ['Quel plat français fait mijoter du bœuf dans du vin rouge avec lardons et champignons ?', 'Le bœuf bourguignon', 'Le pot-au-feu', 'La blanquette', 'Le baeckeoffe', 'La viande gagne à mariner la veille dans le vin, ce qui l’attendrit et parfume la sauce.'],
  ['Quel plat français est un ragoût de veau à la sauce blanche liée au jaune d’œuf ?', 'La blanquette de veau', 'Le bœuf bourguignon', 'Le navarin', 'La daube', 'La viande n’est jamais colorée : c’est ce qui distingue une blanquette d’un ragoût classique.'],
  ['Quelle pâtisserie française est une pâte à choux garnie de crème et glacée au fondant ?', 'L’éclair', 'Le mille-feuille', 'Le paris-brest', 'Le saint-honoré', 'Son nom viendrait de la rapidité avec laquelle on le mange.'],
  ['Quel dessert français fait flotter des blancs d’œufs pochés sur une crème anglaise ?', 'L’île flottante', 'La panna cotta', 'Le bavarois', 'La charlotte', 'On l’appelle aussi œufs à la neige, avec des blancs pochés plutôt que cuits au four.'],
  ['Quel fromage français à pâte pressée cuite est affiné dans le massif du Jura sous AOP ?', 'Le comté', 'Le cantal', 'Le beaufort', 'Le reblochon', 'Il faut environ cinq cents litres de lait pour une seule meule de quarante kilos.'],
  ['Quelle boisson normande obtient-on en faisant fermenter du jus de pomme ?', 'Le cidre', 'Le calvados', 'Le pommeau', 'Le poiré', 'Le poiré suit le même principe avec des poires ; le calvados, lui, est distillé.'],
  ['Quel vin blanc sec d’Alsace est issu d’un cépage au nom parfumé ?', 'Le gewurztraminer', 'Le chablis', 'Le sancerre', 'Le muscadet', 'Son nom vient de l’allemand « Gewürz », l’épice, en raison de ses arômes de litchi et de rose.'],
  ['Quel vin de Loire accompagne classiquement les fruits de mer et se boit très jeune ?', 'Le muscadet', 'Le sauternes', 'Le pomerol', 'Le gewurztraminer', 'Élevé sur lie, il garde une légère effervescence et une vivacité qui tranche avec l’iode.'],
  ['Quelle région française produit le fromage de brebis appelé ossau-iraty ?', 'Le Pays basque et le Béarn', 'La Savoie', 'La Normandie', 'La Bourgogne', 'Les bergers le fabriquaient en estive, dans des cabanes de montagne, pendant la belle saison.'],
  ['Quel plat lyonnais est une quenelle servie avec une sauce à base d’écrevisses ?', 'La quenelle sauce Nantua', 'La cervelle de canut', 'Le tablier de sapeur', 'La rosette', 'La quenelle, à base de semoule ou de panade, gonfle fortement à la cuisson.'],
  ['Quelle pâtisserie française est un chou garni de crème pralinée en forme d’anneau ?', 'Le paris-brest', 'L’éclair', 'La religieuse', 'Le puits d’amour', 'Sa forme évoque la roue d’un vélo, en hommage à la course cycliste qui lui a donné son nom.'],
  ['Quel plat du Nord de la France et de Belgique mijote du bœuf dans de la bière ?', 'La carbonnade flamande', 'Le hochepot', 'Le potjevleesch', 'La ficelle picarde', 'Une tranche de pain d’épices tartinée de moutarde, fondue dans la sauce, la lie et l’adoucit.'],
  ['Quelle terrine du Nord réunit plusieurs viandes blanches prises en gelée ?', 'Le potjevleesch', 'La carbonnade', 'Le hochepot', 'Le waterzooi', 'Son nom signifie « petit pot de viande » en flamand ; on le sert froid, souvent avec des frites.'],
  ['Quel fromage savoyard fondu constitue la base d’une raclette ?', 'La raclette de Savoie', 'Le reblochon', 'Le beaufort', 'L’abondance', 'Le mot vient du verbe racler : on grattait le fromage chauffé devant la braise.'],
  ['Quelle boisson anisée du sud de la France se trouble à l’eau et se boit à l’apéritif ?', 'Le pastis', 'Le vermouth', 'Le picon', 'Le vin cuit', 'Le trouble vient de l’anéthol, soluble dans l’alcool mais pas dans l’eau.'],
];

export const GASTRONOMIE_FRANCOPHONE_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `gas_adulte_francophone_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'gastronomie' as const,
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

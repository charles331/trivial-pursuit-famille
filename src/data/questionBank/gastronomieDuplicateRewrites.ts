import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Le fromage de Herve, posé trois fois au niveau adulte.
 *
 * Repéré en relisant la catégorie gastronomie après une partie :
 *
 *   gas_adulte_francophone_001  fromage belge à pâte molle, odeur puissante, AOP → Le Herve
 *   gas_adulte_curated_01_007   quelle protection européenne pour le Herve ?     → Une AOP
 *   gas_adulte_curated_03_006   fromage belge affiné en croûte lavée orangée     → Le Herve
 *
 * Trois cartes, un seul fromage — et deux d'entre elles avec exactement la même
 * réponse, dans la même catégorie et au même niveau : elles peuvent donc tomber
 * dans la même partie, pour le même joueur, la seconde étant offerte à qui a vu
 * la première.
 *
 * Le dédoublonnage de l'audit ne les voit pas, et **ce n'est pas un défaut à
 * corriger dans le détecteur**. `restatesSameFact` exige un recouvrement de
 * vocabulaire avant de comparer les réponses, et cette garde a été mesurée :
 * s'en passer remonte 534 paires, la resserrer à l'égalité stricte des réponses
 * en remonte encore 295 — et dans les deux cas la majorité sont de faux
 * positifs. « Qui était Toutânkhamon ? » et « Cléopâtre était reine de quel
 * pays ? » partagent une réponse sans poser le même fait ; l'Exposition
 * universelle de la tour Eiffel n'est pas celle de l'Atomium. Relâcher la règle
 * rendrait l'audit faux, pas plus juste. C'est donc la grappe qu'on corrige.
 *
 * On garde la plus évocatrice des trois — celle qui fait sentir le fromage — et
 * l'on réécrit les deux autres sur des faits neufs. Neufs pour de bon : dix
 * autres idées ont été essayées d'abord (cuberdon, peket, double cuisson des
 * frites, mayonnaise, risotto, déglaçage, carbonnade, bulles du champagne…) et
 * toutes étaient déjà posées ailleurs. C'est bien pourquoi gastronomie est la
 * catégorie la mieux notée du jeu : elle est dense.
 */
const REWRITES: CardRewrite[] = [
  {
    id: 'gas_adulte_curated_01_007',
    question: 'Pourquoi le boulanger entaille-t-il la pâte à la lame juste avant d’enfourner sa baguette ?',
    answer: 'Pour choisir l’endroit où la croûte s’ouvrira à la cuisson',
    distractors: [
      'Pour laisser s’échapper la levure en excès',
      'Pour répartir le sel à la surface',
      'Pour que la pâte colle moins à la sole du four',
    ],
    explanation: 'Ces entailles s’appellent la grigne : leur nombre et leur inclinaison sont la signature du boulanger.',
  },
  {
    id: 'gas_adulte_curated_03_006',
    question: 'Pourquoi la tradition veut-elle qu’on ne mange les moules que les mois dont le nom contient un R ?',
    answer: 'En été elles frayent, et leur chair devient maigre et laiteuse',
    distractors: [
      'La pêche est fermée l’été pour laisser grandir les jeunes',
      'Les tempêtes d’hiver les rendent plus charnues',
      'Leur coquille n’est assez épaisse qu’en hiver',
    ],
    explanation: 'L’élevage sur cordes et la chaîne du froid ont largement effacé la règle : on en sert désormais de bonnes toute l’année.',
  },
];

export function applyGastronomieDuplicateRewrites(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

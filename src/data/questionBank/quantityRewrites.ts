import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Cartes de quantité dont l'énoncé portait déjà le nombre demandé.
 *
 * Signalé en partie par le propriétaire du projet, sur « Combien de joueurs
 * compte une équipe de rugby à sept sur le terrain ? » : « la réponse est dans
 * la question ». Il n'y a rien à savoir, on recopie — et le joueur qui recopie
 * n'apprend rien, ce qui est le contraire de ce que la carte sert à faire.
 *
 * Le défaut prenait trois formes, que le nouveau détecteur
 * `promptGivesAwayQuantity` réunit : le nombre écrit en lettres dans le nom de
 * la discipline (« rugby à sept »), en chiffres romains (« rugby à XV »), et en
 * chiffres dans le nom de l'épreuve ou du jeu (« relais 4 x 100 »,
 * « Puissance 4 »). Quatre cartes sur les 5 400, toutes réécrites ici.
 *
 * Chacune reste sur son sujet et à son niveau : on ne change que ce qui est
 * demandé. Deux d'entre elles gardent même une quantité pour réponse, mais une
 * quantité que l'énoncé ne donne pas — et que l'on peut déduire, ce qui est le
 * chemin de raisonnement qui manquait.
 */
const REWRITES: CardRewrite[] = [
  {
    // « rugby à XV » donnait 15. Le geste qui définit le sport, lui, se décrit :
    // l'énoncé décrit sa réponse, et c'est ce qui la rend trouvable.
    id: 'spo_075',
    question: 'Au rugby, comment appelle-t-on le geste qui fait tomber le porteur du ballon pour l’arrêter ?',
    answer: 'Un plaquage',
    distractors: ['Une passe', 'Une feinte', 'Un dégagement'],
    explanation: 'Un plaquage doit viser sous les épaules : au-dessus, l’arbitre siffle une faute, car c’est là que se produisent les commotions.',
  },
  {
    // « rugby à sept » donnait 7. La durée, elle, se déduit sans être donnée :
    // deux périodes de sept minutes. Le chemin existe, la réponse n'est pas là.
    id: 'spo_207',
    question: 'Combien de temps dure un match de rugby à sept, hors prolongations ?',
    answer: '14 minutes',
    distractors: ['20 minutes', '40 minutes', '80 minutes'],
    explanation: 'Des matchs si courts permettent de jouer un tournoi entier en deux ou trois jours : c’est ce format qui a fait entrer le rugby aux Jeux olympiques de Rio, en 2016.',
  },
  {
    // « relais 4 x 100 » donnait 4. Le témoin est déjà la carte enfant spo_067 :
    // le niveau ado demande donc la règle qui va avec, pas l'objet.
    id: 'spo_215',
    question: 'En athlétisme, que risque une équipe de relais dont le témoin change de main hors de la zone prévue ?',
    answer: 'La disqualification',
    distractors: ['Un simple avertissement', 'Une pénalité de temps', 'Un nouveau départ'],
    explanation: 'La zone est tracée sur la piste et se travaille à l’entraînement : une équipe bien réglée y bat régulièrement des sprinteurs plus rapides qu’elle.',
  },
  {
    // « Puissance 4 » donnait 4. La carte reste sur le jeu, mais demande ce qui
    // se voit sur la boîte plutôt que ce qui est écrit dans son nom.
    id: 'pop_099',
    question: 'De quelle couleur sont les jetons des deux joueurs au Puissance 4 ?',
    answer: 'Rouge et jaune',
    distractors: ['Noir et blanc', 'Bleu et vert', 'Rouge et bleu'],
    explanation: 'On gagne aussi en diagonale, ce que beaucoup de joueurs oublient de surveiller — le jeu est sorti en 1974 sous le nom de Connect Four.',
  },
];

export function applyQuantityRewrites(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

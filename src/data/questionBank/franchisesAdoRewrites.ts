import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Deux franchises demandées par la fille du propriétaire du projet : les cinq
 * films Descendants, et la série Vampire Diaries.
 *
 * Les volumes de la banque sont figés — 135 cartes ado par catégorie, l'audit le
 * vérifie —, donc ces huit cartes en remplacent huit. Le choix des sortantes suit
 * les deux reproches les plus fréquents en partie : elles sont toutes
 * anglo-saxonnes et lointaines, et trois d'entre elles étaient des loteries
 * d'attribution (« quel acteur incarne… », « qui a créé… »), la forme dont l'ADR
 * 0004 dit qu'elle n'offre aucun chemin de raisonnement. Aucune carte ancrée en
 * francophonie n'a été touchée.
 *
 * Un fan répond de mémoire, et c'est le but ; mais chaque carte offre en plus une
 * prise à qui n'a pas vu le film. « Quelle sorcière des mers » désigne Ursula sans
 * la nommer, « quel dieu des Enfers » désigne Hadès, et le Pays des merveilles est
 * le royaume de la Reine de Cœur. C'est la règle de l'énoncé qui décrit sa réponse.
 *
 * Deux faits sont déjà pris par le pool de formats variés adultes — Vampire Diaries
 * est adaptée de romans, et son intrigue se noue à Mystic Falls — et ne sont donc
 * pas reposés ici.
 */
const REWRITES: CardRewrite[] = [
  // --- Descendants, un film par carte ---------------------------------------
  {
    // Remplace « le café des héros de Friends » (47 % de fun, la plus basse du
    // niveau ado en cinéma).
    id: 'cin_216',
    question: 'Dans Descendants, sur quelle île le royaume d’Auradon a-t-il enfermé les grands méchants de Disney ?',
    answer: 'L’Île de l’Oubli',
    distractors: ['L’Île du Crâne', 'L’Île de la Tortue', 'L’Île au Trésor'],
    explanation: 'C’est la Bête qui l’a créée en devenant roi d’Auradon : aucune magie n’y fonctionne, et c’est pour cela que les enfants des méchants y grandissent sans pouvoirs.',
  },
  {
    // Remplace « quel acteur incarne Jack Sparrow », une loterie entre quatre noms.
    id: 'cin_205',
    question: 'Dans Descendants 2, de quelle sorcière des mers la pirate Uma est-elle la fille ?',
    answer: 'Ursula',
    distractors: ['Maléfique', 'Cruella d’Enfer', 'La Méchante Reine'],
    explanation: 'Uma commande la bande de pirates du port de l’Île de l’Oubli, et c’est sa rivalité avec Mal qui mène tout le film.',
  },
  {
    // Remplace la réplique culte de Terminator 2 (1991, et rien à en déduire).
    id: 'cin_238',
    question: 'Dans Descendants 3, quel dieu des Enfers se révèle être le père de Mal ?',
    answer: 'Hadès',
    distractors: ['Zeus', 'Poséidon', 'Cronos'],
    explanation: 'C’est sa braise magique qui permet de réveiller Audrey, endormie par le sort qu’elle avait elle-même lancé.',
  },
  {
    // Remplace « qu'est-ce que Jumanji exactement » (film de 1995).
    id: 'cin_202',
    question: 'Dans le quatrième film de Descendants, quel objet Red et Chloé utilisent-elles pour remonter dans le temps ?',
    answer: 'Une montre à gousset',
    distractors: ['Un miroir magique', 'Une clé d’or', 'Un chapeau haut-de-forme'],
    explanation: 'Elles visent l’époque du coup d’État de la Reine de Cœur et remontent bien plus loin : elles tombent sur leurs propres mères adolescentes.',
  },
  {
    // Remplace « qui invente la machine à voyager dans le temps » (1985).
    id: 'cin_192',
    question: 'Dans le cinquième film de Descendants, dans quel monde Red et Chloé partent-elles délivrer sa mère la Reine de Cœur ?',
    answer: 'Le Pays des merveilles',
    distractors: ['Le royaume d’Arendelle', 'La forêt de Sherwood', 'Le pays imaginaire'],
    explanation: 'Sorti en juillet 2026, ce cinquième film introduit un nouveau méchant : Maddox, le fils du Chapelier fou, celui-là même qui avait fabriqué leur montre.',
  },

  // --- Vampire Diaries ------------------------------------------------------
  {
    // Remplace « que provoque le masque vert dans The Mask » (1994).
    id: 'cin_241',
    question: 'Dans Vampire Diaries, quelle plante empêche un vampire d’hypnotiser un humain ?',
    answer: 'La verveine',
    distractors: ['La lavande', 'L’aconit', 'Le gui'],
    explanation: 'Les habitants en glissent dans leur thé ou en portent un brin dans un bijou : c’est ainsi qu’ils se protègent de la manipulation, y compris de celle des frères Salvatore.',
  },
  {
    // Remplace « le thème principal de Fast and Furious », carte presque tautologique.
    id: 'cin_265',
    question: 'Dans Vampire Diaries, quel bijou serti de lapis-lazuli permet à un vampire de sortir en plein soleil ?',
    answer: 'Une bague',
    distractors: ['Un collier', 'Un bracelet', 'Une broche'],
    explanation: 'C’est une sorcière qui l’enchante, et le vampire ne peut plus la quitter : la lui retirer revient à le condamner au lever du jour.',
  },
  {
    // Remplace « qui a créé la saga Star Wars », encore une loterie d'attribution.
    id: 'cin_158',
    question: 'Quelle série dérivée de Vampire Diaries suit la famille Mikaelson à La Nouvelle-Orléans ?',
    answer: 'The Originals',
    distractors: ['True Blood', 'Teen Wolf', 'Supernatural'],
    explanation: 'Les Mikaelson sont les tout premiers vampires de l’histoire, d’où le titre : la série leur consacre cinq saisons, de 2013 à 2018.',
  },
];

export function applyFranchisesAdoRewrites(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

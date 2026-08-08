import { Question } from '../../types';
import { CardRewrite, applyCardRewrites } from './cardRewrites';

/**
 * Cartes signalées en partie comme « impossibles », niveau adulte.
 *
 * Quatre captures d'écran, quatre défauts différents — c'est ce qui rend le lot
 * instructif. Aucune de ces cartes n'était fausse ; toutes les quatre laissaient
 * le joueur sans prise, chacune à sa façon.
 *
 * 1. **Le catalogue d'auteur.** « Quel opéra de Moussorgski… » entre quatre
 *    opéras de Moussorgski, « Quel film de Joachim Trier… » entre quatre films
 *    de Joachim Trier. C'est le miroir exact de l'attribution nue que l'audit
 *    refuse déjà (« Qui a composé La Flûte enchantée ? » entre quatre noms) :
 *    là on demandait la signature, ici on demande le catalogue. Dans les deux
 *    cas on sait, ou l'on tire au sort.
 *
 *    Attention : toutes les cartes « quel film de X » ne sont pas fautives, loin
 *    de là. « Quel film de Sidney Lumet réunit douze jurés dans une salle de
 *    délibération ? » décrit son film, et cette description **est** le chemin.
 *    Ce qu'on corrige, c'est l'énoncé qui ne dit rien de l'œuvre elle-même.
 *
 * 2. **Le piège.** La carte Joachim Trier cumulait : son énoncé situait le film
 *    « à Oslo », et l'un des trois distracteurs s'appelait *Oslo, 31 août*. Le
 *    seul indice de l'énoncé désignait la mauvaise réponse.
 *
 * 3. **Le vocabulaire fermé.** La carte d'optique, elle, avait bien un chemin —
 *    « réflexion totale interne » décrit ce qui arrive au rayon. Mais il fallait
 *    d'abord franchir « au-delà d'un angle critique », « diffusion Rayleigh » et
 *    « interférence destructive ». Le fait est gardé, l'entrée devient concrète :
 *    tout le monde a vu la surface d'une piscine se changer en miroir.
 *
 * 4. **La catégorie qui ne tient pas sa promesse.** L'opéra de Moussorgski
 *    tombait sur une case « Pop Culture & Musique », dont la description annonce
 *    « chansons à succès, bandes dessinées, jeux vidéo et tendances web ». Le
 *    bloc popculture/adulte est d'ailleurs le plus mal noté de toute la banque
 *    (67,6 % à `npm run score:fun`), et la musique savante y pèse trente-deux
 *    cartes. Celle-ci est remplacée par de la pop belge — et par une carte dont
 *    les distracteurs sont chacun rattachés à un autre pays, si bien que
 *    « née dans les discothèques belges » les élimine un à un. Le chemin est là.
 *
 * Les deux cartes remplacées entièrement le sont vers la Belgique et la
 * francophonie, comme le veut la règle d'ancrage : un film norvégien d'auteur et
 * une archéologue britannique de 1914 cumulaient les deux reproches les plus
 * fréquents en partie — lointain et anglo-saxon.
 */
const REWRITES: CardRewrite[] = [
  // Sciences — le fait est conservé, l'entrée devient concrète.
  {
    id: 'sci_adulte_editorial_final_038',
    question: 'Vue de dessous, la surface d’une piscine devient un miroir dès qu’on la regarde de biais : pourquoi ?',
    // Les quatre choix commencent par les mêmes mots : sinon la bonne réponse se
    // reconnaît à sa forme, seule à nommer son sujet là où les autres disent « elle ».
    answer: 'La lumière y subit une réflexion totale interne',
    distractors: [
      'La lumière y est absorbée par le chlore',
      'La lumière y est polarisée par l’eau',
      'La lumière y est diffractée par les vaguelettes',
    ],
    explanation: 'C’est ce même piège à lumière qui la retient dans une fibre optique sur des centaines de kilomètres.',
  },

  // Histoire — l'archéologue britannique cède la place à une carte qui se
  // raisonne : la forme des tranchées se déduit de ce qu'elles protègent.
  {
    id: 'his_adulte_editorial_05_004',
    question: 'Pourquoi les tranchées de 14-18 étaient-elles creusées en zigzag plutôt qu’en ligne droite ?',
    answer: 'Pour qu’un obus ou un tir en enfilade ne balaie qu’une courte section',
    distractors: [
      'Pour tromper les avions de reconnaissance',
      'Pour suivre le tracé des anciens chemins',
      'Pour évacuer l’eau de pluie vers l’arrière',
    ],
    explanation: 'Ces coudes s’appelaient des traverses. Sur l’Yser, la nappe d’eau était si haute qu’on ne creusait pas : on empilait des sacs de terre.',
  },

  // Cinéma — le catalogue de Joachim Trier, et son piège « Oslo », cèdent la
  // place à un film belge que son énoncé décrit assez pour qu'on le retrouve.
  {
    id: 'cin_adulte_editorial_02_028',
    question: 'Quel film belge suit un couple de musiciens de bluegrass que la maladie de leur petite fille déchire ?',
    answer: 'Alabama Monroe',
    distractors: ['Bullhead', 'Le Gamin au vélo', 'Dikkenek'],
    explanation: 'Son titre original, The Broken Circle Breakdown, est le nom du groupe que forment les deux héros.',
  },

  // Pop culture — l'opéra russe cède la place à ce que la catégorie promet, et
  // les trois distracteurs sont chacun rattachés à un autre pays.
  {
    id: 'pop_adulte_musique_classique_021',
    question: 'Quel courant électronique est né dans les discothèques belges des années 1980, en ralentissant les disques ?',
    answer: 'La new beat',
    distractors: ['La house de Chicago', 'La techno de Detroit', 'La jungle britannique'],
    explanation: 'Le déclic vint d’un maxi passé à 33 tours au lieu de 45, pitch poussé : ce tempo traînant fit danser toute l’Europe.',
  },
];

export function applyDeadEndCardRewrites(questions: Question[]): Question[] {
  return applyCardRewrites(questions, REWRITES);
}

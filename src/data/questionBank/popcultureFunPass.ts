import { Question } from '../../types';

type Replacement = [
  id: string,
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

/**
 * Passe de fun sur la catégorie « Pop Culture & Musique », niveau adulte.
 *
 * La note de fun (`npm run score:fun`) a désigné cette catégorie comme la plus
 * faible du corpus, et son niveau adulte comme le bloc le plus faible tous
 * niveaux confondus. Le diagnostic, bloc par bloc, tenait à une seule forme : la
 * carte d'attribution servie entre quatre noms — « Quelle chanteuse britannique a
 * publié l'album 21 ? » entre Jessie Ware, Adele, Duffy et Emeli Sandé.
 *
 * Toutes les attributions n'ont pas été converties, et c'est volontaire. Celles
 * qui portent une signature belge ou française sont précisément ce que la table
 * veut voir : Brel et « Le Plat Pays », Brassens, Aznavour, Arno, Hergé, Simenon,
 * Franquin, Roba, Angèle, Stromae, Gainsbourg. Elles restent.
 *
 * Ce lot reprend les onze attributions anglo-saxonnes ou lointaines, celles qui
 * cumulaient les deux reproches les plus fréquents en partie : aucun chemin de
 * raisonnement, et un ancrage que personne à table ne partage. Comme ailleurs, le
 * sujet est conservé et c'est l'angle qui change — on interroge l'œuvre, le genre
 * ou l'image plutôt que la signature.
 */
const REPLACEMENTS: Replacement[] = [
  // Musique anglo-saxonne : le nom de l'interprète devient l'objet de l'énoncé.
  ['pop_adulte_editorial_05_007', 'De quoi le titre des albums d’Adele — 19, 21, 25, 30 — s’inspire-t-il ?', 'De son âge au moment de l’écriture', 'Du nombre de titres du disque', 'De son adresse à Londres', 'De l’année de sortie', 'Elle a ainsi tenu une sorte de journal chiffré de sa vie.'],
  ['pop_adulte_editorial_016', 'Que désigne un « album concept » dans la musique populaire ?', 'Un disque dont les titres racontent une même histoire', 'Un disque enregistré en public', 'Un disque de reprises', 'Un disque vendu par abonnement', 'Starmania, de Michel Berger et Luc Plamondon, en est un exemple francophone.'],
  ['pop_adulte_editorial_04_009', 'Quel genre musical né en Jamaïque se reconnaît à son rythme accentué sur les temps faibles ?', 'Le reggae', 'Le calypso', 'La salsa', 'Le zouk', 'Bob Marley l’a diffusé dans le monde entier depuis Kingston.'],
  ['pop_adulte_editorial_037', 'De quelle ville industrielle américaine le label Motown tire-t-il son nom ?', 'Detroit', 'Chicago', 'Memphis', 'La Nouvelle-Orléans', 'Motown est la contraction de « Motor Town », la ville de l’automobile.'],
  ['pop_adulte_editorial_05_010', 'Quel art andalou fait de chant, de guitare et de danse la chanteuse Rosalía revisite-t-elle ?', 'Le flamenco', 'Le fado', 'Le tango', 'La rumba cubaine', 'Elle l’a étudié pendant des années avant de le mêler à la pop urbaine.'],
  ['pop_adulte_editorial_04_005', 'De quel archipel atlantique la morna, chantée par Cesária Évora, est-elle originaire ?', 'Le Cap-Vert', 'Les Açores', 'Les Canaries', 'Madère', 'Ses dix îles se trouvent à environ cinq cents kilomètres des côtes du Sénégal.'],
  ['pop_adulte_editorial_02_032', 'Dans quelle langue Cesária Évora chantait-elle la morna de son pays ?', 'Le créole capverdien', 'Le portugais', 'L’espagnol', 'Le français', 'Ce créole mêle le portugais et des langues d’Afrique de l’Ouest.'],

  // Littérature et séries de langue anglaise : on garde l'œuvre, on donne une prise.
  ['pop_adulte_editorial_final_016', 'Qu’est-ce que l’afrofuturisme, courant présent en littérature comme en musique ?', 'Un imaginaire qui mêle cultures africaines et science-fiction', 'Un retour aux contes traditionnels', 'Un style de danse urbaine', 'Un mouvement de peinture abstraite', 'Le film Black Panther en est la vitrine la plus connue.'],
  ['pop_adulte_editorial_021', 'Sur quoi repose le monde imaginaire du Disque-monde, de Terry Pratchett ?', 'Quatre éléphants posés sur une tortue géante', 'Une pile de nuages', 'Un serpent enroulé sur lui-même', 'Un arbre sans fin', 'Pratchett y parodie les codes de la fantasy en une quarantaine de romans.'],
  ['pop_adulte_editorial_final_021', 'À quoi ressemble le TARDIS, la machine à voyager dans le temps de Doctor Who ?', 'À une cabine de police bleue', 'À une horloge de gare', 'À un ascenseur doré', 'À une cabine téléphonique rouge', 'Plus vaste au-dedans qu’au-dehors, elle est restée bloquée sous cette apparence.'],
  ['pop_adulte_editorial_05_030', 'Quelle héroïne de Gotham, bibliothécaire le jour, seconde Batman la nuit ?', 'Batgirl', 'Catwoman', 'Harley Quinn', 'Poison Ivy', 'Devenue paraplégique, elle poursuit son travail sous le nom d’Oracle.'],
];

const BY_ID = new Map(REPLACEMENTS.map((replacement) => [replacement[0], replacement]));

/** Applique la passe en conservant les identifiants et en répartissant les réponses. */
export function applyPopcultureFunPass(questions: Question[]): Question[] {
  let sequence = 0;

  return questions.map((question) => {
    const replacement = BY_ID.get(question.id);
    if (!replacement) return question;

    const [, prompt, answer, distractor1, distractor2, distractor3, explanation] = replacement;
    const options = [answer, distractor1, distractor2, distractor3];
    const targetIndex = sequence % 4;
    sequence += 1;

    return {
      ...question,
      question: prompt,
      options: options.map(
        (_, index) => options[(index + options.length - targetIndex) % options.length],
      ),
      correctAnswerIndex: targetIndex,
      explanation,
    };
  });
}

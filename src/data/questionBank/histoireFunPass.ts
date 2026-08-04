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
 * Passe de fun sur l'histoire, niveau adulte.
 *
 * La note de fun (`npm run score:fun`) a désigné l'histoire comme la dernière
 * catégorie du corpus, et le diagnostic bloc par bloc a isolé un seul coupable :
 * les 40 cartes de `histoireAdultPilot.ts`, à 62,1 %, dix points sous tous les
 * autres lots. C'est le lot pilote, écrit avant l'ADR 0001 et jamais relu depuis.
 *
 * Son défaut est un style, pas un sujet : l'énoncé télégraphique de livre-quiz,
 * qui pose un fait nu et aligne quatre noms propres. « Quel amiral britannique
 * mourut à Trafalgar ? », « Quelle reine britannique régna de 1837 à 1901 ? »
 * cumulent les deux reproches les plus fréquents en partie — aucune prise, et un
 * ancrage anglo-saxon lointain que personne à table ne partage.
 *
 * Le même fichier montre pourtant ce qui marche : ses meilleures cartes (65 à
 * 71 %) portent un indice déductible — « Quel canal inauguré en 1869 relie
 * Méditerranée et mer Rouge ? » se raisonne par la géographie.
 *
 * Les dix-huit cartes reprises ici gardent donc leur sujet historique, mais
 * passent du nom à sa **conséquence** ou à sa **substance** : ce que Colomb
 * cherchait plutôt que son nom, ce que la révocation de l'édit de Nantes a
 * provoqué plutôt que le roi qui l'a signée. Deux cartes purement britanniques et
 * interchangeables sont recentrées sur la Belgique.
 */
const REPLACEMENTS: Replacement[] = [
  // Antiquité et Moyen Âge : la conséquence plutôt que le nom.
  ['his_adulte_pilot_002', 'Quels mois de notre calendrier portent encore le nom d’empereurs romains ?', 'Juillet et août', 'Mars et mai', 'Janvier et février', 'Septembre et octobre', 'Juillet vient de Jules César, et août de son successeur Auguste.'],
  ['his_adulte_pilot_003', 'Quelle langue Cléopâtre parlait-elle à la cour d’Égypte, en plus de l’égyptien ?', 'Le grec', 'Le latin', 'L’araméen', 'Le perse', 'La dynastie des Ptolémées, d’origine macédonienne, gouvernait en grec depuis Alexandre.'],
  ['his_adulte_pilot_008', 'En quoi l’édit de Milan, en 313, changea-t-il le sort des chrétiens de l’Empire romain ?', 'Il mit fin aux persécutions', 'Il leur imposa un impôt spécial', 'Il leur interdit les charges publiques', 'Il les expulsa de Rome', 'L’empereur Constantin se fit lui-même baptiser sur son lit de mort.'],
  ['his_adulte_pilot_010', 'Dans quelle ville Charlemagne fut-il couronné empereur en l’an 800 ?', 'Rome', 'Aix-la-Chapelle', 'Reims', 'Constantinople', 'Le pape Léon III le couronna dans la basilique Saint-Pierre, le jour de Noël.'],
  ['his_adulte_pilot_011', 'Quelle conséquence eut la victoire de Guillaume le Conquérant en 1066 ?', 'Un duc normand devint roi d’Angleterre', 'La France annexa la Normandie', 'L’Angleterre devint une république', 'Le Danemark prit le contrôle de Londres', 'Le français resta la langue de la cour anglaise pendant près de trois siècles.'],

  // Temps modernes.
  ['his_adulte_pilot_019', 'Que cherchait Christophe Colomb en traversant l’Atlantique vers l’ouest en 1492 ?', 'Une route maritime vers les Indes', 'Un continent encore inconnu', 'Des terres à peupler', 'Un passage vers le pôle Nord', 'Il mourut convaincu d’avoir atteint l’Asie.'],
  ['his_adulte_pilot_021', 'Que contestaient les 95 thèses affichées par Martin Luther en 1517 ?', 'La vente des indulgences par l’Église', 'La langue latine des messes', 'Le célibat des rois', 'L’existence même des monastères', 'Leur diffusion foudroyante doit beaucoup à l’imprimerie.'],
  ['his_adulte_pilot_022', 'Pourquoi Henri VIII rompit-il avec le pape au XVIe siècle ?', 'Pour pouvoir divorcer et se remarier', 'Pour récupérer des reliques', 'Pour éviter de partir en croisade', 'Pour épouser une princesse française', 'Cette rupture donna naissance à l’Église anglicane.'],
  ['his_adulte_pilot_023', 'Quel principe, encore invoqué aujourd’hui, les traités de Westphalie ont-ils posé en 1648 ?', 'La souveraineté des États sur leur territoire', 'La liberté de circulation en mer', 'L’interdiction des armées permanentes', 'Le libre-échange entre royaumes', 'Ils mirent fin à la guerre de Trente Ans, qui avait ravagé l’Europe centrale.'],
  ['his_adulte_pilot_024', 'Quelle conséquence eut la révocation de l’édit de Nantes, en 1685 ?', 'Des centaines de milliers de protestants quittèrent la France', 'La guerre reprit avec l’Espagne', 'Le pape excommunia le roi', 'Les impôts furent supprimés', 'Beaucoup s’établirent aux Pays-Bas, en Prusse et en Angleterre.'],

  // XIXe siècle : deux cartes britanniques interchangeables recentrées.
  ['his_adulte_pilot_026', 'Combien de mandats George Washington accepta-t-il d’exercer, fixant une tradition durable ?', 'Deux', 'Un', 'Quatre', 'Six', 'La limite ne fut inscrite dans la Constitution américaine qu’en 1951.'],
  ['his_adulte_pilot_027', 'À quoi servirent les forts de Liège et de Namur en août 1914 ?', 'À retarder l’avance allemande vers la France', 'À protéger le port d’Anvers', 'À couvrir la retraite britannique', 'À défendre la frontière néerlandaise', 'La résistance de Liège coûta aux Allemands une dizaine de jours précieux.'],
  ['his_adulte_pilot_028', 'Pourquoi les Britanniques choisirent-ils Sainte-Hélène pour exiler Napoléon en 1815 ?', 'Parce que l’île est perdue au milieu de l’Atlantique', 'Parce qu’elle appartenait encore à la France', 'Parce qu’une forteresse y était déjà bâtie', 'Parce qu’elle était proche de Paris', 'Il y mourut six ans plus tard, à cinquante-et-un ans.'],
  ['his_adulte_pilot_030', 'Quel nom donne-t-on au XIXe siècle britannique, marqué par l’industrie et l’Empire ?', 'L’époque victorienne', 'L’époque édouardienne', 'L’ère georgienne', 'La Régence', 'Il vient de la reine Victoria, qui régna soixante-trois ans.'],
  ['his_adulte_pilot_032', 'Quelle ville devint la capitale de l’Empire allemand proclamé en 1871 ?', 'Berlin', 'Vienne', 'Francfort', 'Munich', 'L’Empire fut proclamé dans la galerie des Glaces du château de Versailles.'],

  // XXe siècle.
  ['his_adulte_pilot_033', 'Dans quelle ville l’archiduc François-Ferdinand fut-il assassiné en juin 1914 ?', 'Sarajevo', 'Vienne', 'Belgrade', 'Budapest', 'L’attentat enclencha le jeu des alliances qui mena à la guerre en cinq semaines.'],
  ['his_adulte_pilot_034', 'Quelle conséquence eut le torpillage du paquebot Lusitania, en 1915 ?', 'Il poussa l’opinion américaine vers la guerre', 'Il provoqua un armistice immédiat', 'Il fit renoncer l’Allemagne aux sous-marins', 'Il déclencha la bataille de Verdun', 'Près de 1 200 personnes périrent, dont plus de cent ressortissants américains.'],
  ['his_adulte_pilot_036', 'Quel événement financier de 1929 marqua le début de la Grande Dépression ?', 'Le krach de la Bourse de New York', 'La faillite d’une grande banque allemande', 'L’effondrement du cours du blé', 'La dévaluation de la livre sterling', 'Le jeudi noir du 24 octobre 1929 vit les cours s’effondrer à Wall Street.'],
];

const BY_ID = new Map(REPLACEMENTS.map((replacement) => [replacement[0], replacement]));

/** Applique la passe en conservant les identifiants et en répartissant les réponses. */
export function applyHistoireFunPass(questions: Question[]): Question[] {
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

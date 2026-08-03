import { Question } from '../../types';

type EditorialFact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: EditorialFact[] = [
  [
    'Quel souverain babylonien a fait graver l’un des plus anciens codes de lois conservés ?',
    'Hammurabi', 'Sargon d’Akkad', 'Assurbanipal', 'Nabuchodonosor II',
    'Le Code de Hammurabi fut gravé au XVIIIe siècle av. J.-C. sur une stèle aujourd’hui conservée au Louvre.',
  ],
  [
    'Quelle bataille de 490 av. J.-C. opposa les Athéniens aux Perses ?',
    'Marathon', 'Salamine', 'Platées', 'Chéronée',
    'À Marathon, l’armée athénienne commandée notamment par Miltiade repoussa les troupes de Darius Ier.',
  ],
  [
    'Quel homme d’État athénien donna son nom au « siècle » qui vit construire le Parthénon ?',
    'Périclès', 'Solon', 'Thémistocle', 'Alcibiade',
    'Périclès domina la vie politique d’Athènes au Ve siècle av. J.-C. et soutint son grand programme monumental.',
  ],
  [
    'Quelle dynastie chinoise fit construire l’essentiel de l’armée en terre cuite de Xi’an ?',
    'Les Qin', 'Les Han', 'Les Tang', 'Les Ming',
    'Les soldats de terre cuite protégeaient le mausolée de Qin Shi Huang, premier empereur de Chine.',
  ],
  [
    'Quel conflit opposa Rome et Carthage pendant plus d’un siècle ?',
    'Les guerres puniques', 'Les guerres médiques', 'Les guerres samnites', 'Les guerres serviles',
    'Les trois guerres puniques se déroulèrent entre 264 et 146 av. J.-C. et s’achevèrent par la destruction de Carthage.',
  ],
  [
    'Quel tribun romain fut assassiné avec de nombreux partisans en 133 av. J.-C. ?',
    'Tiberius Gracchus', 'Caton l’Ancien', 'Marius', 'Cicéron',
    'Tiberius Gracchus défendait une réforme agraire qui provoqua une violente crise politique à Rome.',
  ],
  [
    'Quel empereur romain fit édifier un mur défensif dans le nord de la Bretagne ?',
    'Hadrien', 'Trajan', 'Claude', 'Dioclétien',
    'Le mur d’Hadrien, commencé en 122, traversait le nord de l’actuelle Angleterre.',
  ],
  [
    'Quelle bataille de 378 vit les Wisigoths vaincre l’empereur romain Valens ?',
    'Andrinople', 'Milvius', 'Châlons', 'Zama',
    'Valens mourut à Andrinople, défaite majeure de l’Empire romain face aux Goths.',
  ],
  [
    'Quel empereur byzantin fit compiler le Corpus juris civilis au VIe siècle ?',
    'Justinien Ier', 'Héraclius', 'Basile II', 'Alexis Ier',
    'La compilation juridique de Justinien exerça une influence durable sur les droits civils européens.',
  ],
  [
    'Quelle bataille de 732 est traditionnellement associée à Charles Martel ?',
    'Poitiers', 'Bouvines', 'Fontenoy', 'Roncevaux',
    'Charles Martel arrêta près de Poitiers une armée venue d’al-Andalus, même si la portée exacte de l’affrontement est discutée.',
  ],
  [
    'Quel califat fonda Bagdad et en fit sa capitale au VIIIe siècle ?',
    'Le califat abbasside', 'Le califat omeyyade', 'Le califat fatimide', 'Le califat almohade',
    'Le calife abbasside Al-Mansur fonda Bagdad en 762 pour en faire le centre de son empire.',
  ],
  [
    'Quelle révolte éclata à Constantinople contre Justinien Ier en 532 ?',
    'La sédition Nika', 'La révolte des Turbans jaunes', 'La révolte de Spartacus', 'La révolte des Zanj',
    'La sédition Nika menaça le trône de Justinien et causa de vastes destructions dans Constantinople.',
  ],
  [
    'Quelle bataille de 1071 ouvrit l’Anatolie aux conquêtes des Turcs seldjoukides ?',
    'Manzikert', 'Hattin', 'Dorylée', 'Nicopolis',
    'À Manzikert, le sultan Alp Arslan vainquit et captura l’empereur byzantin Romain IV Diogène.',
  ],
  [
    'Quelle révolte paysanne anglaise de 1381 fut menée notamment par Wat Tyler ?',
    'La révolte des paysans', 'La révolte des Boxers', 'La Fronde', 'La Jacquerie',
    'La révolte de 1381 protesta entre autres contre la capitation et les contraintes du servage.',
  ],
  [
    'Quel empire mésoaméricain avait Tenochtitlan pour capitale ?',
    'L’Empire aztèque', 'L’Empire inca', 'L’Empire maya', 'L’Empire olmèque',
    'Tenochtitlan se trouvait sur le site de l’actuelle Mexico et tomba aux mains de Cortés en 1521.',
  ],
  [
    'Quel conquistador renversa l’Empire inca au XVIe siècle ?',
    'Francisco Pizarro', 'Hernán Cortés', 'Pedro de Alvarado', 'Vasco Núñez de Balboa',
    'Pizarro captura l’empereur Atahualpa à Cajamarca en 1532 avant la prise de Cuzco.',
  ],
  [
    'Quelle paix de 1555 consacra le principe « tel prince, telle religion » dans l’Empire ?',
    'La paix d’Augsbourg', 'La paix de Westphalie', 'La paix de Cateau-Cambrésis', 'La paix de Nimègue',
    'La paix d’Augsbourg permit aux princes du Saint-Empire de choisir entre catholicisme et luthéranisme.',
  ],
  [
    'Quelle bataille navale de 1571 opposa la Sainte Ligue à l’Empire ottoman ?',
    'Lépante', 'Trafalgar', 'Actium', 'Navarin',
    'La flotte de la Sainte Ligue remporta à Lépante une victoire majeure en Méditerranée.',
  ],
  [
    'Quel traité de 1529 partagea les zones d’influence ibériques en Asie ?',
    'Le traité de Saragosse', 'Le traité de Tordesillas', 'Le traité d’Alcáçovas', 'Le traité de Madrid',
    'Le traité de Saragosse compléta le partage hispano-portugais en fixant une limite dans l’hémisphère oriental.',
  ],
  [
    'Quel roi d’Angleterre fut exécuté à Londres en 1649 ?',
    'Charles Ier', 'Jacques II', 'Henri VIII', 'Guillaume III',
    'Charles Ier fut jugé pour haute trahison après sa défaite dans la guerre civile anglaise.',
  ],
  [
    'Quel siège de 1683 marqua l’échec d’une armée ottomane devant une capitale européenne ?',
    'Le siège de Vienne', 'Le siège de Prague', 'Le siège de Varsovie', 'Le siège de Budapest',
    'Une armée de secours menée par Jean III Sobieski contribua à lever le second siège ottoman de Vienne.',
  ],
  [
    'Quel traité de 1713 attribua notamment les Pays-Bas espagnols aux Habsbourg d’Autriche ?',
    'Le traité d’Utrecht', 'Le traité de Rastatt', 'Le traité de Ryswick', 'Le traité des Pyrénées',
    'Les accords d’Utrecht remodelèrent l’Europe à la fin de la guerre de Succession d’Espagne.',
  ],
  [
    'Quelle révolte d’esclaves aboutit à l’indépendance d’Haïti en 1804 ?',
    'La révolution haïtienne', 'La révolte de Nat Turner', 'La révolte des Cipayes', 'La guerre des Farrapos',
    'Commencée en 1791 à Saint-Domingue, la révolution haïtienne créa le premier État issu d’une insurrection d’esclaves victorieuse.',
  ],
  [
    'Quel congrès redessina l’Europe après la chute de Napoléon Ier ?',
    'Le congrès de Vienne', 'Le congrès de Berlin', 'Le congrès de Paris', 'Le congrès de Vérone',
    'Réuni en 1814-1815, le congrès de Vienne restaura un équilibre entre les grandes puissances.',
  ],
  [
    'Combien de temps dura le conflit anglo-zanzibarite de 1896, la plus courte guerre connue ?',
    'Environ quarante minutes', 'Environ trois jours', 'Environ deux semaines', 'Environ six mois',
    'Le bombardement britannique du palais du sultan écrasa la résistance avant même la première heure.',
  ],
  [
    'Quel texte de 1830 proclama l’indépendance de la Belgique ?',
    'Le décret du 4 octobre', 'Le traité des XXIV articles', 'La Constitution de 1831', 'Le serment de Léopold Ier',
    'Le Gouvernement provisoire proclama l’indépendance belge par un décret daté du 4 octobre 1830.',
  ],
  [
    'Quelle bataille de 1836 devint un symbole de la révolution texane ?',
    'Fort Alamo', 'Little Bighorn', 'Gettysburg', 'Wounded Knee',
    'Le siège de Fort Alamo se termina par la mort des défenseurs texans face à l’armée mexicaine.',
  ],
  [
    'Quel traité de 1842 mit fin à la première guerre de l’opium ?',
    'Le traité de Nankin', 'Le traité de Shimonoseki', 'Le traité de Tianjin', 'Le traité de Portsmouth',
    'Le traité de Nankin força notamment la Chine des Qing à céder Hong Kong au Royaume-Uni.',
  ],
  [
    'Quelle guerre opposa la Russie à une coalition incluant Ottomans, Britanniques et Français de 1853 à 1856 ?',
    'La guerre de Crimée', 'La guerre russo-japonaise', 'La guerre du Caucase', 'La guerre de Livonie',
    'La guerre de Crimée se déroula principalement autour de Sébastopol et de la mer Noire.',
  ],
  [
    'Quel mouvement insurrectionnel secoua l’Inde britannique en 1857 ?',
    'La révolte des Cipayes', 'La révolte des Boxers', 'Le mouvement swadeshi', 'La Marche du sel',
    'La révolte de 1857 entraîna la fin du pouvoir de la Compagnie des Indes et l’administration directe par la Couronne.',
  ],
  [
    'Quelle constitution transforma le Japon en monarchie constitutionnelle en 1889 ?',
    'La Constitution de Meiji', 'La Constitution de Taishō', 'La Charte impériale', 'La Constitution Shōwa',
    'Promulguée par l’empereur Meiji, elle institua une Diète tout en maintenant de larges pouvoirs impériaux.',
  ],
  [
    'Quelle conférence de 1884-1885 fixa des règles de colonisation européenne en Afrique ?',
    'La conférence de Berlin', 'La conférence d’Algésiras', 'La conférence de Bandung', 'La conférence de Bruxelles',
    'La conférence de Berlin organisa notamment le principe d’occupation effective des territoires revendiqués.',
  ],
  [
    'Quelle défaite italienne de 1896 préserva l’indépendance de l’Éthiopie ?',
    'Adoua', 'Isandhlwana', 'Omdurman', 'Magenta',
    'À Adoua, les forces de l’empereur Ménélik II vainquirent l’armée coloniale italienne.',
  ],
  [
    'Quel incident de 1898 opposa symboliquement la France et le Royaume-Uni au Soudan ?',
    'La crise de Fachoda', 'La crise d’Agadir', 'L’affaire de Tanger', 'L’incident de Dogger Bank',
    'La crise de Fachoda se résolut par le retrait français et précéda le rapprochement franco-britannique.',
  ],
  [
    'Quel traité mit fin à la guerre russo-japonaise en 1905 ?',
    'Le traité de Portsmouth', 'Le traité de Brest-Litovsk', 'Le traité de Shimonoseki', 'Le traité de San Francisco',
    'Négocié sous la médiation de Theodore Roosevelt, le traité de Portsmouth consacra la victoire japonaise.',
  ],
  [
    'Quelle révolution renversa la dynastie Qing en Chine en 1911 ?',
    'La révolution Xinhai', 'La révolution culturelle', 'La révolte des Boxers', 'La révolution des Taiping',
    'La révolution Xinhai conduisit à la proclamation de la République de Chine en 1912.',
  ],
  [
    'Quelle bataille de 1916 symbolise la guerre d’usure sur le front occidental ?',
    'Verdun', 'Tannenberg', 'Caporetto', 'Gallipoli',
    'La bataille de Verdun opposa Français et Allemands pendant près de dix mois en 1916.',
  ],
  [
    'Quel accord secret de 1916 prévoyait un partage de zones d’influence au Proche-Orient ottoman ?',
    'Les accords Sykes-Picot', 'Les accords de Locarno', 'Les accords de Munich', 'Les accords d’Évian',
    'Mark Sykes et François Georges-Picot négocièrent ce projet au nom du Royaume-Uni et de la France.',
  ],
  [
    'Quelle marche menée par Gandhi en 1930 dénonça le monopole britannique sur un produit courant ?',
    'La Marche du sel', 'La Longue Marche', 'La Marche sur Rome', 'La Marche de la faim',
    'Gandhi parcourut environ 380 kilomètres jusqu’à Dandi pour défier la taxe britannique sur le sel.',
  ],
  [
    'Quel bombardement de 1937 inspira un célèbre tableau de Picasso ?',
    'Guernica', 'Dresde', 'Rotterdam', 'Coventry',
    'La ville basque de Guernica fut bombardée par la Légion Condor durant la guerre civile espagnole.',
  ],
  [
    'Quelle conférence de 1945 réunit Roosevelt, Churchill et Staline en Crimée ?',
    'Yalta', 'Potsdam', 'Téhéran', 'Casablanca',
    'À Yalta, les trois dirigeants discutèrent de l’Europe d’après-guerre et de la future Organisation des Nations unies.',
  ],
  [
    'Quel événement de 1948-1949 constitua la première grande crise de la guerre froide en Europe ?',
    'Le blocus de Berlin', 'La crise de Suez', 'Le printemps de Prague', 'La crise des missiles de Cuba',
    'Les Occidentaux répondirent au blocus soviétique des secteurs ouest de Berlin par un pont aérien.',
  ],
  [
    'Quelle conférence de 1955 réunit en Indonésie des États d’Afrique et d’Asie récemment indépendants ?',
    'La conférence de Bandung', 'La conférence de Belgrade', 'La conférence de Genève', 'La conférence d’Accra',
    'Bandung favorisa l’émergence du non-alignement et la coopération entre pays anciennement colonisés.',
  ],
  [
    'Quel dirigeant soviétique dénonça le culte de Staline lors d’un rapport secret en 1956 ?',
    'Nikita Khrouchtchev', 'Léonid Brejnev', 'Mikhaïl Gorbatchev', 'Gueorgui Malenkov',
    'Khrouchtchev présenta son rapport au XXe congrès du Parti communiste de l’Union soviétique.',
  ],
  [
    'Quel accord de 1998 contribua à mettre fin aux violences en Irlande du Nord ?',
    'L’accord du Vendredi saint', 'L’accord de Dayton', 'L’accord d’Oslo', 'L’accord de Schengen',
    'Signé à Belfast, l’accord du Vendredi saint organisa un partage du pouvoir en Irlande du Nord.',
  ],
  [
    'Quel tribunal international jugea des responsables du génocide rwandais à partir de 1995 ?',
    'Le TPIR', 'La Cour pénale internationale', 'Le tribunal de Nuremberg', 'Le TPIY',
    'Le Tribunal pénal international pour le Rwanda siégeait à Arusha, en Tanzanie.',
  ],
  [
    'Quelle révolution de 1974 mit fin à la dictature de l’Estado Novo au Portugal ?',
    'La révolution des Œillets', 'La révolution de Velours', 'La révolution orange', 'La révolution des Roses',
    'Le mouvement militaire du 25 avril 1974 provoqua une transition démocratique et accéléra la décolonisation portugaise.',
  ],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL: Question[] = FACTS.map(
  ([question, answer, distractor1, distractor2, distractor3, explanation], index) => {
    const options = rotate([answer, distractor1, distractor2, distractor3], index % 4);
    return {
      id: `his_adulte_editorial_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

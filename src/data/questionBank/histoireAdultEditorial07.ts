import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quelle éruption minoenne détruisit une grande partie de l’île de Théra ?', 'L’éruption de Santorin', 'L’éruption de l’Etna', 'L’éruption du Vésuve', 'L’éruption du Stromboli', 'L’éruption de l’âge du bronze ensevelit Akrotiri et provoqua un tsunami en mer Égée.'],
  ['Quel événement climatique de 536 obscurcit durablement le ciel dans l’hémisphère Nord ?', 'Un voile de poussières volcaniques', 'Une tempête solaire', 'Une inversion magnétique', 'Un impact météoritique certain', 'Des carottes de glace indiquent de grandes éruptions autour de 536 et 540, suivies d’un refroidissement.'],
  ['Quelle période froide européenne s’étend approximativement du XIVe au XIXe siècle ?', 'Le Petit Âge glaciaire', 'Le Dryas récent', 'L’Optimum médiéval', 'L’Holocène ancien', 'Le Petit Âge glaciaire connut des avancées glaciaires et des hivers rigoureux, avec de fortes variations régionales.'],
  ['Quelle éruption de 1783 affecta récoltes et qualité de l’air en Europe ?', 'L’éruption du Laki', 'L’éruption du Krakatoa', 'L’éruption du Tambora', 'L’éruption du Pinatubo', 'Les fissures du Laki en Islande libérèrent pendant des mois des gaz soufrés et de la lave.'],
  ['Quelle éruption de 1815 provoqua « l’année sans été » ?', 'Le Tambora', 'Le Krakatoa', 'Le mont Pelée', 'Le Novarupta', 'Les aérosols du Tambora refroidirent temporairement le climat mondial et perturbèrent les récoltes en 1816.'],
  ['Quelle catastrophe irlandaise fut aggravée par le mildiou de la pomme de terre ?', 'La Grande Famine', 'La famine des Highlands', 'La crise du phylloxéra', 'La famine de Bengale', 'Entre 1845 et 1852, mortalité et émigration transformèrent durablement la population irlandaise.'],
  ['Quelle tempête de poussière frappa les Grandes Plaines américaines dans les années 1930 ?', 'Le Dust Bowl', 'Le Great Blizzard', 'Le Black Fog', 'Le Prairie Crash', 'Sécheresse et pratiques agricoles favorisant l’érosion provoquèrent exode rural et tempêtes de poussière.'],
  ['Quel brouillard toxique londonien de 1952 causa des milliers de décès ?', 'Le Grand Smog', 'Le brouillard de la Tamise', 'Le smog de Donora', 'Le nuage brun', 'Le charbon, le froid et une inversion de température emprisonnèrent les polluants sur Londres.'],
  ['Quelle marée noire de 1967 suivit le naufrage d’un pétrolier près des Cornouailles ?', 'Le Torrey Canyon', 'L’Amoco Cadiz', 'L’Exxon Valdez', 'Le Prestige', 'Le Torrey Canyon libéra une grande quantité de pétrole et révéla l’impréparation aux marées noires.'],
  ['Quelle catastrophe industrielle indienne de 1984 libéra un gaz toxique ?', 'Bhopal', 'Seveso', 'Minamata', 'Love Canal', 'Une fuite d’isocyanate de méthyle dans une usine Union Carbide tua et blessa des milliers de personnes.'],
  ['Quelle maladie décima une partie de l’armée athénienne pendant la guerre du Péloponnèse ?', 'La peste d’Athènes', 'La peste antonine', 'La peste de Justinien', 'Le typhus de Sparte', 'Thucydide décrivit l’épidémie de 430 av. J.-C., dont l’agent exact reste discuté.'],
  ['Quelle pandémie frappa l’Empire romain sous Marc Aurèle ?', 'La peste antonine', 'La peste de Cyprien', 'La peste de Justinien', 'La peste noire', 'L’épidémie apparue vers 165 est souvent attribuée à la variole, sans certitude absolue.'],
  ['Quelle pandémie du VIe siècle porte le nom d’un empereur byzantin ?', 'La peste de Justinien', 'La peste antonine', 'La peste de Cyprien', 'La peste de Marseille', 'La première pandémie de peste documentée atteignit Constantinople en 541-542.'],
  ['Quelle maladie arriva en Europe lors de la pandémie de 1832 ?', 'Le choléra', 'La fièvre jaune', 'La variole', 'La grippe', 'Venue d’Asie, la deuxième pandémie de choléra frappa Paris, Londres et de nombreuses villes européennes.'],
  ['Quel médecin introduisit la vaccination contre la variole en 1796 ?', 'Edward Jenner', 'Louis Pasteur', 'Robert Koch', 'Ignace Semmelweis', 'Jenner utilisa la vaccine bovine pour protéger contre la variole, pratique à l’origine du mot vaccination.'],
  ['Quel chercheur identifia le bacille de la tuberculose en 1882 ?', 'Robert Koch', 'Louis Pasteur', 'Émile Roux', 'Paul Ehrlich', 'Koch présenta sa découverte à Berlin et développa des critères reliant microbes et maladies.'],
  ['Quel antibiotique fut découvert après l’observation d’une moisissure en 1928 ?', 'La pénicilline', 'La streptomycine', 'La tétracycline', 'Le chloramphénicol', 'Alexander Fleming observa l’effet antibactérien de Penicillium ; Florey et Chain développèrent ensuite le traitement.'],
  ['Quelle organisation mondiale mena la campagne ayant éradiqué la variole ?', 'L’Organisation mondiale de la santé', 'L’UNICEF', 'La Croix-Rouge', 'La Société des Nations', 'L’OMS certifia l’éradication mondiale de la variole en 1980.'],
  ['Quelle épidémie fut identifiée pour la première fois en 1976 près d’une rivière d’Afrique centrale ?', 'La maladie à virus Ebola', 'La fièvre de Lassa', 'La maladie de Marburg', 'La fièvre jaune', 'Deux flambées presque simultanées eurent lieu au Soudan et au Zaïre en 1976.'],
  ['Quelle voie romaine reliait Rome à Brindisi ?', 'La Via Appia', 'La Via Flaminia', 'La Via Aurelia', 'La Via Cassia', 'Commencée en 312 av. J.-C., la Via Appia facilita mouvements militaires et échanges vers le sud.'],
  ['Quel réseau de routes impériales perses comprenait la Route royale ?', 'Le réseau achéménide', 'Le réseau parthe', 'Le réseau sassanide', 'Le réseau séleucide', 'La Route royale reliait notamment Suse à Sardes et disposait de relais.'],
  ['Quel canal chinois relie depuis des siècles le bassin du Yangzi à celui du fleuve Jaune ?', 'Le Grand Canal', 'Le canal de Lingqu', 'Le canal de Zhengguo', 'Le canal de Dujiangyan', 'Développé sur plusieurs dynasties, le Grand Canal transportait notamment les céréales vers les capitales du nord.'],
  ['Quel empire andin utilisait un vaste réseau routier appelé Qhapaq Ñan ?', 'L’Empire inca', 'L’Empire chimú', 'L’Empire tiwanaku', 'L’Empire wari', 'Le Qhapaq Ñan reliait territoires, entrepôts et relais sur des dizaines de milliers de kilomètres.'],
  ['Quel service postal mongol reposait sur un réseau de relais ?', 'Le yam', 'Le cursus publicus', 'Le barid', 'Le pony express', 'Le yam permettait aux messagers officiels de changer de monture et de se ravitailler.'],
  ['Quel canal inauguré en 1869 réduisit la route maritime vers l’Asie ?', 'Le canal de Suez', 'Le canal de Panama', 'Le canal de Kiel', 'Le canal de Corinthe', 'Le canal de Suez relie Méditerranée et mer Rouge sans système d’écluses.'],
  ['Quel chemin de fer américain fut achevé par la jonction de Promontory en 1869 ?', 'Le premier transcontinental', 'Le Northern Pacific', 'Le Santa Fe', 'Le Great Northern', 'Union Pacific et Central Pacific relièrent leurs voies dans l’Utah avec le Golden Spike.'],
  ['Quel tunnel ferroviaire relia la France et l’Italie sous les Alpes en 1871 ?', 'Le tunnel du Fréjus', 'Le tunnel du Simplon', 'Le tunnel du Saint-Gothard', 'Le tunnel du Mont-Blanc', 'Le tunnel du Fréjus, ou du Mont-Cenis, fut une prouesse d’ingénierie longue de près de quatorze kilomètres.'],
  ['Quelle ligne ferroviaire relia Constantinople à Paris à partir de 1883 ?', 'L’Orient-Express', 'Le Transsibérien', 'Le Sud-Express', 'Le Train Bleu', 'La Compagnie internationale des wagons-lits lança l’Orient-Express, dont l’itinéraire évolua.'],
  ['Quel avion assura le premier vol commercial à réaction transatlantique régulier ?', 'Le de Havilland Comet', 'Le Boeing 707', 'La Caravelle', 'Le Douglas DC-8', 'Le Comet 4 de la BOAC ouvrit en 1958 un service à réaction transatlantique, avant le Boeing 707.'],
  ['Quel mouvement indien lança une campagne de désobéissance en août 1942 ?', 'Quit India', 'Swadeshi', 'Khilafat', 'Non-Cooperation', 'Le Congrès national indien demanda le départ immédiat des Britanniques pendant la Seconde Guerre mondiale.'],
  ['Quel accord de 1949 reconnut la souveraineté de l’Indonésie ?', 'La conférence de la Table ronde', 'Les accords de Linggadjati', 'L’accord de Renville', 'La conférence de Bandung', 'Les Pays-Bas transférèrent la souveraineté aux États-Unis d’Indonésie en décembre 1949.'],
  ['Quel conflit de 1954 à 1962 s’acheva par les accords d’Évian ?', 'La guerre d’Algérie', 'La guerre du Rif', 'La crise de Bizerte', 'La guerre des Sables', 'Les accords d’Évian mirent fin aux combats et furent suivis d’un référendum d’autodétermination.'],
  ['Quel mouvement mena la lutte d’indépendance en Guinée-Bissau ?', 'Le PAIGC', 'Le MPLA', 'Le FRELIMO', 'L’UNITA', 'Amílcar Cabral fonda le PAIGC, qui combattit le pouvoir colonial portugais.'],
  ['Quelle rébellion de 1952-1960 secoua le Kenya colonial ?', 'La révolte des Mau Mau', 'La révolte Maji-Maji', 'La révolte des Herero', 'La révolte du Rif', 'L’insurrection, principalement kikuyu, fut combattue par un état d’urgence et une répression massive.'],
  ['Quel parti mena le Ghana à l’indépendance en 1957 ?', 'Le Convention People’s Party', 'L’African National Congress', 'Le United Gold Coast Convention', 'Le National Council of Nigeria', 'Le CPP de Kwame Nkrumah mobilisa autour du mot d’ordre « Self-government now ».'],
  ['Quelle colonie britannique devint la Tanzanie après son union avec Zanzibar ?', 'Le Tanganyika', 'Le Nyassaland', 'Le Bechuanaland', 'La Rhodésie du Nord', 'Le Tanganyika et Zanzibar s’unirent en 1964 pour former la République unie de Tanzanie.'],
  ['Quel accord de 1960 accorda l’indépendance à Chypre ?', 'Les accords de Zurich et de Londres', 'Les accords de Lancaster House', 'Les accords de Genève', 'Les accords de Camp David', 'Le Royaume-Uni, la Grèce, la Turquie et les représentants chypriotes établirent le cadre du nouvel État.'],
  ['Quelle guerre de 1971 sépara le Pakistan oriental du Pakistan occidental ?', 'La guerre de libération du Bangladesh', 'La première guerre du Cachemire', 'La guerre sino-indienne', 'La guerre civile sri-lankaise', 'L’intervention de l’Inde accompagna la défaite des forces pakistanaises au Pakistan oriental.'],
  ['Quel pays du Pacifique devint indépendant de l’Australie en 1975 ?', 'La Papouasie-Nouvelle-Guinée', 'Les Fidji', 'Le Vanuatu', 'Les Samoa', 'La Papouasie-Nouvelle-Guinée accéda pacifiquement à l’indépendance le 16 septembre 1975.'],
  ['Quel territoire africain devint le Zimbabwe en 1980 ?', 'La Rhodésie du Sud', 'La Rhodésie du Nord', 'Le Nyassaland', 'Le Bechuanaland', 'Les accords de Lancaster House préparèrent des élections et l’indépendance reconnue du Zimbabwe.'],
  ['Quelle révolte d’esclaves éclata en Jamaïque à Noël 1831 ?', 'La guerre baptiste', 'La rébellion de Morant Bay', 'La révolte de Tackey', 'La guerre des Marrons', 'Samuel Sharpe organisa une grève qui devint une révolte et accéléra le débat abolitionniste britannique.'],
  ['Quelle loi britannique abolit l’esclavage dans la plupart de l’Empire en 1833 ?', 'Le Slavery Abolition Act', 'Le Slave Trade Act', 'Le Reform Act', 'Le Combination Act', 'La loi de 1833 prévit une période d’« apprentissage » et indemnisa les propriétaires, non les anciens esclaves.'],
  ['Quel pays abolit en dernier l’esclavage dans les Amériques en 1888 ?', 'Le Brésil', 'Cuba', 'Les États-Unis', 'Porto Rico', 'La princesse Isabelle signa la Lei Áurea qui abolit l’esclavage au Brésil.'],
  ['Quelle conférence panafricaine de 1945 réunit des militants à Manchester ?', 'Le cinquième Congrès panafricain', 'La conférence de Bandung', 'Le congrès de Bruxelles', 'La conférence d’Accra', 'Nkrumah, Kenyatta et W. E. B. Du Bois participèrent au congrès de Manchester.'],
  ['Quel accord de 1988 ouvrit la voie à l’indépendance de la Namibie ?', 'Les accords de New York', 'Les accords de Lusaka', 'Les accords de Brazzaville', 'Les accords de Pretoria', 'L’accord entre Angola, Cuba et Afrique du Sud permit l’application du plan de l’ONU pour la Namibie.'],
  ['Quel référendum de 1999 conduisit à l’indépendance du Timor oriental ?', 'Le référendum d’autodétermination', 'Le référendum d’intégration', 'Le référendum de fédération', 'Le référendum constitutionnel', 'Une large majorité rejeta l’autonomie au sein de l’Indonésie malgré les violences entourant le scrutin.'],
  ['Quel territoire chinois fut rétrocédé par le Portugal en 1999 ?', 'Macao', 'Hong Kong', 'Taïwan', 'Hainan', 'Macao devint une région administrative spéciale de la Chine le 20 décembre 1999.'],
  ['Quel État africain devint indépendant en 2011 après un référendum ?', 'Le Soudan du Sud', 'L’Érythrée', 'Le Somaliland', 'Le Sahara occidental', 'Le référendum prévu par l’accord de paix de 2005 donna une très large majorité à l’indépendance.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL_07: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `his_adulte_editorial_07_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

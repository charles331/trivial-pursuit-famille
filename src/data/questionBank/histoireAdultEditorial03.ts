import { Question } from '../../types';

type HistoryFact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: HistoryFact[] = [
  ['Quel duc de Bourgogne fut tué sur le pont de Montereau en 1419 ?', 'Jean sans Peur', 'Philippe le Hardi', 'Charles le Téméraire', 'Philippe le Bon', 'Jean sans Peur fut assassiné lors d’une entrevue avec le dauphin Charles, aggravant la guerre civile française.'],
  ['Quelle alliance de 1579 unit les provinces du nord révoltées contre Philippe II ?', 'L’Union d’Utrecht', 'L’Union d’Arras', 'La Ligue de Cambrai', 'La Pacification de Gand', 'Signée le 23 janvier dans la ville qui lui donne son nom, elle prépara la naissance des Provinces-Unies.'],
  ['Quel gouverneur des Pays-Bas espagnols était surnommé le « duc de Fer » ?', 'Le duc d’Albe', 'Alexandre Farnèse', 'Don Juan d’Autriche', 'Luis de Requesens', 'Envoyé en 1567, le duc d’Albe créa le Conseil des troubles pour réprimer la révolte.'],
  ['Quelle ville belge fut le centre d’une principauté épiscopale jusqu’en 1795 ?', 'Liège', 'Namur', 'Anvers', 'Malines', 'La principauté de Liège appartenait au Saint-Empire et était gouvernée par un prince-évêque.'],
  ['Quel traité de 1715 organisa la défense des Pays-Bas autrichiens face à la France ?', 'Le traité de la Barrière', 'Le traité d’Aix-la-Chapelle', 'Le traité de Rastatt', 'Le traité de Fontainebleau', 'Le traité permit aux Provinces-Unies de tenir des garnisons dans plusieurs forteresses des Pays-Bas autrichiens.'],
  ['Quel souverain des Pays-Bas créa le Royaume uni des Pays-Bas en 1815 ?', 'Guillaume Ier', 'Guillaume II', 'Léopold Ier', 'Louis Bonaparte', 'Guillaume Ier régna sur les provinces du nord et du sud réunies par le congrès de Vienne.'],
  ['Quelle bataille de septembre 1830 accéléra le départ des troupes néerlandaises de Bruxelles ?', 'Les Journées de Septembre', 'La bataille de Louvain', 'La campagne des Dix-Jours', 'La bataille de Wavre', 'Du 23 au 27 septembre, des insurgés combattirent l’armée du prince Frédéric dans Bruxelles.'],
  ['Quel protocole international reconnut l’indépendance et la neutralité de la Belgique en 1831 ?', 'Le traité des XVIII articles', 'Le traité des XXIV articles', 'Le protocole de Londres de 1839', 'Le traité de Maastricht', 'Les XVIII articles offrirent en 1831 des conditions que le roi des Pays-Bas refusa après la campagne des Dix-Jours.'],
  ['Quel roi belge régna pendant la Première Guerre mondiale ?', 'Albert Ier', 'Léopold II', 'Léopold III', 'Baudouin', 'Albert Ier resta à la tête de l’armée belge sur le front de l’Yser.'],
  ['Quelle bataille de 1914 stabilisa le front belge grâce à l’inondation de la plaine ?', 'La bataille de l’Yser', 'La bataille de Liège', 'La bataille de Mons', 'La bataille de Passchendaele', 'L’ouverture des écluses de Nieuport contribua à arrêter l’avancée allemande sur l’Yser.'],
  ['Quel accord de 1944 prépara l’union douanière entre Belgique, Pays-Bas et Luxembourg ?', 'La convention Benelux', 'Le traité de Bruxelles', 'Les accords de La Haye', 'Le pacte de Luxembourg', 'Les trois gouvernements en exil signèrent à Londres la convention douanière Benelux.'],
  ['Quelle crise politique belge de 1950 concerna le retour de Léopold III ?', 'La Question royale', 'La guerre scolaire', 'La Question linguistique', 'La crise de Louvain', 'Après une consultation populaire et de fortes tensions, Léopold III transmit ses pouvoirs à Baudouin.'],
  ['Quelle catastrophe minière de 1956 fit 262 morts près de Charleroi ?', 'Le Bois du Cazier', 'La catastrophe de Courrières', 'La catastrophe de Marcinelle-Nord', 'Le charbonnage d’Anderlues', 'L’incendie du Bois du Cazier à Marcinelle tua des mineurs de douze nationalités.'],
  ['Quelle université francophone quitta la Flandre après la crise linguistique de 1968 ?', 'L’Université catholique de Louvain', 'L’Université libre de Bruxelles', 'L’Université de Liège', 'L’Université de Mons', 'L’UCL s’installa progressivement à Louvain-la-Neuve, ville créée en Brabant wallon.'],
  ['Quelle réforme de 1993 fit officiellement de la Belgique un État fédéral ?', 'La quatrième réforme de l’État', 'La première réforme de l’État', 'Le pacte scolaire', 'La loi unique', 'L’article premier révisé de la Constitution définit depuis 1993 la Belgique comme un État fédéral.'],
  ['Quel chef taïno résista aux Espagnols sur Hispaniola au début du XVIe siècle ?', 'Enriquillo', 'Hatuey', 'Caonabo', 'Guacanagarí', 'Enriquillo mena dans les montagnes de Bahoruco une révolte qui aboutit à une paix négociée.'],
  ['Quelle cité maya fut la capitale du royaume de Kaan au VIIe siècle ?', 'Calakmul', 'Palenque', 'Copán', 'Uxmal', 'Calakmul rivalisa avec Tikal pour la domination politique des basses terres mayas.'],
  ['Quel chef inca résista aux Espagnols depuis Vilcabamba jusqu’en 1572 ?', 'Túpac Amaru', 'Manco Cápac', 'Huayna Cápac', 'Huáscar', 'Túpac Amaru, dernier souverain de Vilcabamba, fut capturé puis exécuté à Cuzco.'],
  ['Quelle révolte brésilienne de 1835 fut menée principalement par des musulmans africains ?', 'La révolte des Malês', 'La Cabanagem', 'La Balaiada', 'La Sabinada', 'À Salvador de Bahia, des Africains musulmans organisèrent l’insurrection dite des Malês.'],
  ['Quel libérateur proclama l’indépendance du Chili en 1818 ?', 'Bernardo O’Higgins', 'José de San Martín', 'Simón Bolívar', 'Antonio José de Sucre', 'O’Higgins fut directeur suprême du Chili après la victoire indépendantiste de Chacabuco.'],
  ['Quelle guerre civile américaine commença par l’attaque de Fort Sumter ?', 'La guerre de Sécession', 'La guerre américano-mexicaine', 'La guerre de 1812', 'La guerre hispano-américaine', 'Les forces confédérées ouvrirent le feu sur Fort Sumter en avril 1861.'],
  ['Quel amendement abolit l’esclavage aux États-Unis en 1865 ?', 'Le treizième amendement', 'Le quatorzième amendement', 'Le quinzième amendement', 'Le dix-neuvième amendement', 'Ratifié en décembre 1865, le treizième amendement interdit esclavage et servitude involontaire.'],
  ['Quel massacre de 1890 marqua la fin des grandes guerres indiennes aux États-Unis ?', 'Wounded Knee', 'Sand Creek', 'Bear River', 'Washita', 'Des soldats américains tuèrent plusieurs centaines de Lakotas à Wounded Knee dans le Dakota du Sud.'],
  ['Quel président mexicain nationalisa l’industrie pétrolière en 1938 ?', 'Lázaro Cárdenas', 'Plutarco Elías Calles', 'Álvaro Obregón', 'Manuel Ávila Camacho', 'Cárdenas expropria les compagnies étrangères et favorisa la création de Pemex.'],
  ['Quelle opération de 1961 tenta sans succès de renverser Fidel Castro ?', 'Le débarquement de la baie des Cochons', 'L’opération Just Cause', 'L’opération Mongoose', 'L’invasion de Grenade', 'Des exilés cubains soutenus par la CIA débarquèrent à Playa Girón et furent rapidement vaincus.'],
  ['Quel coup d’État de 1973 renversa Salvador Allende ?', 'Le coup d’État chilien', 'Le coup d’État argentin', 'Le coup d’État uruguayen', 'Le coup d’État bolivien', 'Le général Augusto Pinochet prit le pouvoir au Chili le 11 septembre 1973.'],
  ['Quelle dictature argentine mena la « guerre sale » de 1976 à 1983 ?', 'Le Processus de réorganisation nationale', 'La Décennie infâme', 'Le régime justicialiste', 'La Révolution libératrice', 'La junte militaire fit disparaître des milliers d’opposants pendant le Processus.'],
  ['Quel mouvement sud-africain fut fondé en 1912 sous le nom de SANNC ?', 'Le Congrès national africain', 'Le Congrès panafricain', 'Inkatha', 'Le Parti communiste sud-africain', 'Le SANNC prit en 1923 le nom d’African National Congress, ou ANC.'],
  ['Quelle révolte de 1905 opposa les Maji-Maji au pouvoir colonial allemand ?', 'La révolte en Afrique orientale allemande', 'La révolte au Sud-Ouest africain', 'La révolte au Cameroun', 'La révolte au Togo', 'La révolte Maji-Maji éclata dans l’actuelle Tanzanie contre les politiques coloniales allemandes.'],
  ['Quel pays africain obtint son indépendance en 1957 sous la direction de Kwame Nkrumah ?', 'Le Ghana', 'Le Nigeria', 'La Sierra Leone', 'La Gambie', 'L’ancienne Côte-de-l’Or devint le Ghana, premier pays d’Afrique subsaharienne coloniale à accéder alors à l’indépendance.'],
  ['Quelle guerre opposa le Nigeria à une région pétrolière du sud-est entrée en sécession ?', 'La guerre du Biafra', 'La guerre de l’Ogaden', 'La guerre du Shaba', 'La guerre du Kivu', 'Le conflit de 1967 à 1970 provoqua une famine qui suscita une vaste mobilisation humanitaire.'],
  ['Quel dirigeant congolais fut assassiné en janvier 1961 ?', 'Patrice Lumumba', 'Joseph Kasa-Vubu', 'Moïse Tshombe', 'Cyrille Adoula', 'Premier ministre à l’indépendance, Lumumba fut tué au Katanga après son transfert forcé.'],
  ['Quelle colonie portugaise devint indépendante sous le nom de Mozambique en 1975 ?', 'L’Afrique orientale portugaise', 'La Guinée portugaise', 'L’Angola portugais', 'São Tomé-et-Príncipe', 'Le FRELIMO prit le pouvoir au Mozambique après la révolution des Œillets au Portugal.'],
  ['Quel changement législatif de 1991 mit fin à l’essentiel de l’apartheid juridique ?', 'L’abrogation des dernières lois d’apartheid', 'L’adoption d’une monarchie constitutionnelle', 'La création d’un État fédéral', 'L’abolition du parlement', 'Le parlement sud-africain abrogea en 1991 les principales lois restantes de ségrégation raciale.'],
  ['Quelle dynastie coréenne régna de 1392 à 1910 ?', 'La dynastie Joseon', 'La dynastie Goryeo', 'La dynastie Silla', 'La dynastie Balhae', 'Joseon établit sa capitale à Hanyang, l’actuelle Séoul, et adopta le néoconfucianisme.'],
  ['Quel empereur chinois lança les grandes expéditions maritimes de Zheng He ?', 'Yongle', 'Hongwu', 'Xuande', 'Wanli', 'L’empereur Yongle ordonna les premières flottes de trésor et transféra la capitale à Pékin.'],
  ['Quelle guerre du XIXe siècle opposa la Chine des Qing au Japon au sujet de la Corée ?', 'La première guerre sino-japonaise', 'La guerre russo-japonaise', 'La seconde guerre de l’opium', 'La guerre des Boxers', 'La victoire japonaise de 1895 fut consacrée par le traité de Shimonoseki.'],
  ['Quel mouvement chinois de 1919 protesta contre les décisions du traité de Versailles ?', 'Le Mouvement du 4 Mai', 'Le Mouvement d’auto-renforcement', 'La révolte des Boxers', 'Le Grand Bond en avant', 'Des étudiants manifestèrent à Pékin contre le transfert au Japon des droits allemands au Shandong.'],
  ['Quelle campagne communiste chinoise de 1934-1935 parcourut des milliers de kilomètres ?', 'La Longue Marche', 'La campagne des Cent Fleurs', 'Le Grand Bond en avant', 'La Marche vers le Nord', 'La Longue Marche permit aux communistes d’échapper à l’encerclement nationaliste et renforça Mao.'],
  ['Quel accord de 1954 partagea provisoirement le Viêt Nam au 17e parallèle ?', 'Les accords de Genève', 'Les accords de Paris', 'Le traité de San Francisco', 'Les accords de Bandung', 'Les accords de Genève suivirent la défaite française de Điện Biên Phủ.'],
  ['Quel général indonésien remplaça progressivement Sukarno après 1965 ?', 'Suharto', 'Nasution', 'Habibie', 'Subandrio', 'Suharto établit l’« Ordre nouveau » après les violences anticommunistes de 1965-1966.'],
  ['Quelle révolution iranienne renversa le chah en 1979 ?', 'La révolution islamique', 'La révolution blanche', 'La révolution constitutionnelle', 'La révolution verte', 'Le retour de l’ayatollah Khomeini accompagna la chute de la monarchie Pahlavi.'],
  ['Quel mouvement birman mena un soulèvement démocratique en août 1988 ?', 'Le mouvement 8888', 'La Révolution safran', 'La Ligue de Panglong', 'Le mouvement Dobama', 'Les manifestations du 8 août 1988 furent réprimées par l’armée, qui conserva le pouvoir.'],
  ['Quelle partition de 1947 créa l’Inde et le Pakistan indépendants ?', 'La partition des Indes britanniques', 'La partition du Bengale de 1905', 'La ligne Durand', 'Le plan Wavell', 'La frontière dessinée par Cyril Radcliffe provoqua des déplacements massifs et des violences.'],
  ['Quel accord de 1972 normalisa les relations entre les deux Allemagnes ?', 'Le Traité fondamental', 'Le traité de Moscou', 'Le traité de Varsovie', 'Les accords d’Helsinki', 'Le Traité fondamental permit à la RFA et à la RDA d’entrer toutes deux à l’ONU en 1973.'],
  ['Quelle charte de 1977 inspira l’opposition tchécoslovaque ?', 'La Charte 77', 'La Charte 08', 'La Charte de Prague', 'La Charte civique', 'Václav Havel figura parmi les premiers porte-parole de la Charte 77.'],
  ['Quel syndicat libre remporta les élections partiellement libres de Pologne en 1989 ?', 'Solidarność', 'OPZZ', 'KOR', 'ZSL', 'La victoire des candidats soutenus par Solidarność ouvrit la voie au premier gouvernement non communiste du bloc.'],
  ['Quelle chaîne humaine relia les capitales baltes en août 1989 ?', 'La Voie balte', 'La Route de la liberté', 'La Chaîne du Nord', 'La Marche chantante', 'Environ deux millions de personnes relièrent Tallinn, Riga et Vilnius sur près de 600 kilomètres.'],
  ['Quel accord de 1995 mit fin à la guerre de Bosnie ?', 'Les accords de Dayton', 'Les accords d’Ohrid', 'Les accords de Rambouillet', 'Les accords de Brioni', 'Négociés aux États-Unis, les accords de Dayton furent signés à Paris en décembre 1995.'],
  ['Quelle révolution pacifique de 2003 entraîna le départ d’Edouard Chevardnadze en Géorgie ?', 'La révolution des Roses', 'La révolution orange', 'La révolution des Tulipes', 'La révolution de Velours', 'Les manifestations menées notamment par Mikheïl Saakachvili suivirent des élections contestées.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL_03: Question[] = FACTS.map(
  ([question, answer, distractor1, distractor2, distractor3, explanation], index) => {
    const options = rotate([answer, distractor1, distractor2, distractor3], index % 4);
    return {
      id: `his_adulte_editorial_03_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

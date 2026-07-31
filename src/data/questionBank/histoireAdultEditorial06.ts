import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel corpus juridique babylonien est antérieur de plusieurs siècles au Code de Hammurabi ?', 'Le Code d’Ur-Nammu', 'Les lois de Dracon', 'Les Douze Tables', 'Le Code de Gortyne', 'Le Code d’Ur-Nammu fut rédigé en sumérien vers 2100-2050 av. J.-C.'],
  ['Quelle loi romaine de 451-450 av. J.-C. fut affichée sur des tables ?', 'La Loi des Douze Tables', 'La Lex Hortensia', 'La Lex Canuleia', 'La Lex Aquilia', 'Les Douze Tables rendirent publiques des règles fondamentales du droit romain.'],
  ['Quelle basilique Justinien Ier fit-il élever à Constantinople au VIe siècle ?', 'Sainte-Sophie', 'Saint-Marc', 'Saint-Vital de Ravenne', 'Saint-Serge', 'Sa coupole de 31 mètres est restée la plus vaste du monde pendant près de mille ans.'],
  ['Quel document de 1215 garantit notamment le jugement légal des hommes libres anglais ?', 'La Magna Carta', 'La Charte des forêts', 'Les Provisions d’Oxford', 'Le Statut de Westminster', 'La Magna Carta imposée à Jean sans Terre devint un symbole durable de limitation du pouvoir.'],
  ['Quel texte anglais de 1679 renforça la protection contre la détention arbitraire ?', 'L’Habeas Corpus Act', 'Le Bill of Rights', 'L’Act of Settlement', 'Le Triennial Act', 'L’Habeas Corpus Act facilita le contrôle judiciaire de la légalité d’une détention.'],
  ['Quel texte de 1689 limita le pouvoir royal après la Glorieuse Révolution ?', 'Le Bill of Rights anglais', 'La Petition of Right', 'La Magna Carta', 'Le Test Act', 'Le Bill of Rights affirma des droits du Parlement et interdit certaines prérogatives royales.'],
  ['Quel édit prussien de 1807 amorça l’abolition du servage ?', 'L’édit d’Octobre', 'L’édit de Potsdam', 'L’édit de Nantes', 'L’édit de Restitution', 'L’édit d’Octobre de Stein et Hardenberg permit notamment aux paysans de changer de statut et de métier.'],
  ['Quel code civil entra en vigueur en France en 1804 ?', 'Le Code Napoléon', 'Le Code noir', 'Le Code pénal', 'Le Code de commerce', 'Le Code civil unifia une grande partie du droit privé français et influença de nombreux pays.'],
  ['Quel amendement constitutionnel américain garantit une égale protection des lois ?', 'Le quatorzième amendement', 'Le dixième amendement', 'Le douzième amendement', 'Le dix-septième amendement', 'Ratifié en 1868, le quatorzième amendement définit aussi la citoyenneté nationale.'],
  ['Quel procès de 1894 condamna injustement un officier français pour trahison ?', 'Le procès Dreyfus', 'Le procès Zola', 'Le procès Boulanger', 'Le procès Caillaux', 'La condamnation d’Alfred Dreyfus déclencha une crise politique et antisémite durable.'],
  ['Quelle loi française de 1905 établit la séparation des Églises et de l’État ?', 'La loi du 9 décembre 1905', 'La loi Falloux', 'La loi Ferry', 'La loi Combes', 'La loi garantit la liberté de conscience tout en mettant fin au régime concordataire dans la plupart du pays.'],
  ['Quel procès international jugea les principaux dirigeants nazis en 1945-1946 ?', 'Le procès de Nuremberg', 'Le procès de Tokyo', 'Le procès d’Eichmann', 'Le procès de Francfort', 'Le tribunal militaire international de Nuremberg formula notamment la notion de crime contre l’humanité.'],
  ['Quelle convention de 1948 définit juridiquement le génocide ?', 'La Convention pour la prévention et la répression du génocide', 'La Convention de Genève IV', 'La Convention contre la torture', 'Le Pacte relatif aux droits civils', 'Le juriste Raphael Lemkin joua un rôle majeur dans l’adoption de la convention par l’ONU.'],
  ['Quel arrêt américain de 1954 déclara inconstitutionnelle la ségrégation scolaire ?', 'Brown v. Board of Education', 'Plessy v. Ferguson', 'Roe v. Wade', 'Miranda v. Arizona', 'La Cour suprême jugea que des écoles séparées sont intrinsèquement inégales.'],
  ['Quelle juridiction permanente créée par le Statut de Rome siège à La Haye ?', 'La Cour pénale internationale', 'La Cour internationale de Justice', 'La Cour permanente d’arbitrage', 'La Cour européenne des droits de l’homme', 'La CPI juge depuis 2002 des individus accusés de crimes internationaux relevant de sa compétence.'],
  ['Quelle école fondée par Platon enseignait près d’Athènes ?', 'L’Académie', 'Le Lycée', 'Le Portique', 'Le Jardin', 'Platon fonda son école au IVe siècle av. J.-C. dans un sanctuaire consacré au héros Académos.'],
  ['Quelle université marocaine fondée au IXe siècle est liée à Fatima al-Fihri ?', 'Al Quaraouiyine', 'Al-Azhar', 'La Zitouna', 'La Mustansiriya', 'La mosquée et institution d’enseignement Al Quaraouiyine fut fondée à Fès en 859 selon la tradition.'],
  ['Quelle université italienne est traditionnellement considérée comme la plus ancienne d’Europe ?', 'L’université de Bologne', 'L’université de Padoue', 'L’université de Naples', 'L’université de Salerne', 'La communauté de maîtres et d’étudiants de Bologne est conventionnellement datée de 1088.'],
  ['Quel collège parisien fondé en 1257 donna son nom à une université ?', 'La Sorbonne', 'Le Collège de Navarre', 'Le Collège des Bernardins', 'Le Collège de France', 'Robert de Sorbon fonda un collège destiné à des maîtres et étudiants en théologie.'],
  ['Quel souverain créa le Collège royal, futur Collège de France, en 1530 ?', 'François Ier', 'Henri II', 'Charles IX', 'Louis XII', 'Les lecteurs royaux enseignaient des disciplines comme le grec et l’hébreu hors du cadre de la Sorbonne.'],
  ['Quel pédagogue morave écrivit « La Grande Didactique » au XVIIe siècle ?', 'Comenius', 'Pestalozzi', 'Froebel', 'Herbart', 'Comenius défendit une éducation progressive et largement accessible dans sa Didactica magna.'],
  ['Quel éducateur suisse fonda des écoles basées sur l’observation et l’activité ?', 'Johann Heinrich Pestalozzi', 'Friedrich Froebel', 'Maria Montessori', 'Célestin Freinet', 'Pestalozzi chercha à développer tête, cœur et main chez l’enfant.'],
  ['Qui créa le premier « jardin d’enfants » en Allemagne ?', 'Friedrich Froebel', 'Johann Herbart', 'Rudolf Steiner', 'Adolphe Ferrière', 'Froebel ouvrit en 1840 un Kindergarten fondé sur le jeu et des matériels éducatifs.'],
  ['Quelle médecin italienne développa une méthode éducative portant son nom ?', 'Maria Montessori', 'Giuseppina Pizzigoni', 'Rita Levi-Montalcini', 'Sibilla Aleramo', 'Montessori ouvrit sa première Casa dei Bambini à Rome en 1907.'],
  ['Quel pédagogue français développa l’imprimerie à l’école et le texte libre ?', 'Célestin Freinet', 'Ferdinand Buisson', 'Jules Ferry', 'Paul Robin', 'Freinet fit de la production coopérative de textes et de journaux un outil d’apprentissage.'],
  ['Quel périodique publié à Strasbourg dès 1605 est souvent présenté comme le premier journal imprimé ?', 'La Relation', 'Le Mercure galant', 'The Spectator', 'Le Daily Courant', 'Johann Carolus publia la Relation aller Fürnemmen und gedenckwürdigen Historien à Strasbourg.'],
  ['Quel périodique fondé en 1665 est l’un des plus anciens journaux scientifiques ?', 'Philosophical Transactions', 'The Spectator', 'Le Journal des savants', 'Nature', 'La Royal Society publia Philosophical Transactions sous l’impulsion de Henry Oldenburg.'],
  ['Quel quotidien britannique fut fondé en 1785 sous le nom de Daily Universal Register ?', 'The Times', 'The Guardian', 'The Daily Telegraph', 'The Observer', 'Le journal prit le nom The Times en 1788 sous son fondateur John Walter.'],
  ['Quel éditeur américain lança le New York World en misant sur une presse populaire ?', 'Joseph Pulitzer', 'William Randolph Hearst', 'Adolph Ochs', 'Henry Luce', 'Pulitzer racheta le New York World en 1883 et développa reportages, illustrations et campagnes.'],
  ['Quelle agence de presse française, fondée en 1835, est un ancêtre de l’AFP ?', 'L’agence Havas', 'Reuters', 'Associated Press', 'Wolffs Telegraphisches Bureau', 'Son fondateur Charles-Louis Havas partait de bulletins traduits de la presse étrangère.'],
  ['Quel événement fut le premier couronnement britannique largement télévisé ?', 'Le couronnement d’Élisabeth II', 'Le couronnement de George VI', 'Le couronnement d’Édouard VIII', 'Le couronnement de George V', 'La cérémonie de 1953 accéléra l’équipement des foyers britanniques en téléviseurs.'],
  ['Quelle chaîne d’information en continu fut lancée par Ted Turner en 1980 ?', 'CNN', 'BBC News', 'MSNBC', 'Fox News', 'CNN inaugura un modèle de couverture télévisée de l’actualité vingt-quatre heures sur vingt-quatre.'],
  ['Quel réseau informatique relia quatre universités américaines en 1969 ?', 'ARPANET', 'BITNET', 'NSFNET', 'CYCLADES', 'Le premier message ARPANET fut envoyé de l’UCLA au Stanford Research Institute.'],
  ['Quel informaticien proposa le World Wide Web au CERN en 1989 ?', 'Tim Berners-Lee', 'Vint Cerf', 'Robert Kahn', 'Marc Andreessen', 'Berners-Lee combina URL, HTTP et HTML pour créer un système hypertexte distribué.'],
  ['Quelle bataille de 216 av. J.-C. fut une victoire écrasante d’Hannibal ?', 'Cannes', 'Trasimène', 'Zama', 'Métauro', 'À Cannes, l’encerclement carthaginois détruisit une armée romaine très supérieure en nombre.'],
  ['Quelle bataille de 451 opposa une coalition romaine à Attila en Gaule ?', 'Les Champs Catalauniques', 'Adrianople', 'Frigidus', 'Vouillé', 'Le général Aetius et ses alliés, dont les Wisigoths, affrontèrent les Huns en Champagne.'],
  ['Quelle bataille de 955 vit Otton Ier vaincre les Magyars ?', 'Lechfeld', 'Mersebourg', 'Bouvines', 'Mohács', 'La victoire du Lechfeld près d’Augsbourg mit fin aux grandes incursions magyares en Occident.'],
  ['Quelle bataille de 1214 renforça la monarchie de Philippe Auguste ?', 'Bouvines', 'Muret', 'Las Navas de Tolosa', 'Taillebourg', 'À Bouvines, Philippe Auguste vainquit une coalition comprenant l’empereur Otton IV.'],
  ['Quelle bataille de 1389 occupe une place centrale dans la mémoire serbe ?', 'La bataille de Kosovo Polje', 'La bataille de Maritsa', 'La bataille de Nicopolis', 'La bataille de Varna', 'Serbes et Ottomans subirent de lourdes pertes à Kosovo Polje, où moururent leurs deux souverains.'],
  ['Quelle bataille de 1526 livra une grande partie de la Hongrie aux Ottomans ?', 'Mohács', 'Varna', 'Kosovo', 'Belgrade', 'Le roi Louis II mourut après la défaite hongroise face à Soliman le Magnifique.'],
  ['Quelle bataille de 1704 fut une victoire de Marlborough et du prince Eugène ?', 'Blenheim', 'Ramillies', 'Malplaquet', 'Oudenarde', 'La victoire de Blenheim empêcha une avancée franco-bavaroise vers Vienne.'],
  ['Quelle bataille de 1757 vit Frédéric II vaincre une armée autrichienne plus nombreuse ?', 'Leuthen', 'Rossbach', 'Lobositz', 'Kolin', 'À Leuthen, l’ordre oblique prussien permit de concentrer les forces contre l’aile autrichienne.'],
  ['Quelle bataille de 1813 est surnommée la « bataille des Nations » ?', 'Leipzig', 'Dresde', 'Lützen', 'Bautzen', 'La coalition infligea à Napoléon une défaite majeure à Leipzig en octobre 1813.'],
  ['Quelle bataille de 1859 opposa Français et Piémontais aux Autrichiens en Lombardie ?', 'Solferino', 'Magenta', 'Novare', 'Custoza', 'Le spectacle des blessés de Solferino inspira à Henry Dunant la création de la Croix-Rouge.'],
  ['Quelle bataille navale de 1905 anéantit la flotte russe de la Baltique ?', 'Tsushima', 'Port-Arthur', 'Jutland', 'Manille', 'L’amiral Tōgō remporta à Tsushima une victoire décisive pour le Japon.'],
  ['Quelle bataille de 1942 stoppa l’expansion japonaise vers l’Australie ?', 'La mer de Corail', 'Midway', 'Guadalcanal', 'Leyte', 'La bataille de la mer de Corail fut le premier grand affrontement naval où les flottes ne se virent pas directement.'],
  ['Quelle bataille de 1943 vit échouer l’offensive allemande Citadelle face aux défenses soviétiques ?', 'Koursk', 'Kharkov', 'Smolensk', 'Kiev', 'Les combats autour du saillant de Koursk comptèrent parmi les plus grandes confrontations blindées de la guerre.'],
  ['Quelle bataille de 1954 mit fin à la domination française en Indochine ?', 'Điện Biên Phủ', 'Khe Sanh', 'Saïgon', 'Hué', 'Le camp retranché français capitula face au Việt Minh de Võ Nguyên Giáp le 7 mai 1954.'],
  ['Quelle bataille de 1968 dura plusieurs mois autour d’une base américaine au Viêt Nam ?', 'Khe Sanh', 'Ia Drang', 'Ap Bac', 'Hamburger Hill', 'Le siège de Khe Sanh coïncida avec l’offensive du Têt et mobilisa d’importants moyens aériens américains.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL_06: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `his_adulte_editorial_06_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

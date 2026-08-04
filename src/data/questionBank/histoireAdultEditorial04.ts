import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quelle reine castillane finança le voyage de Christophe Colomb en 1492 ?', 'Isabelle Ire', 'Jeanne Ire', 'Marie de Molina', 'Urraque Ire', 'Isabelle de Castille et Ferdinand d’Aragon accordèrent leur soutien au projet de Colomb.'],
  ['Quelle reine anglaise rétablit le protestantisme après son accession en 1558 ?', 'Élisabeth Ire', 'Marie Ire', 'Anne', 'Marie II', 'Le règlement religieux élisabéthain de 1559 rétablit l’Église d’Angleterre sous autorité royale.'],
  ['Quelle impératrice de Russie prit le pouvoir à la suite d’un coup d’État en 1762 ?', 'Catherine II', 'Élisabeth Ire', 'Anna Ivanovna', 'Catherine Ire', 'Catherine II renversa son époux Pierre III et régna pendant trente-quatre ans.'],
  ['Quelle militante rédigea en 1791 la « Déclaration des droits de la femme » ?', 'Olympe de Gouges', 'Madame Roland', 'Théroigne de Méricourt', 'Germaine de Staël', 'Olympe de Gouges répondit à la Déclaration de 1789 en revendiquant une citoyenneté égale.'],
  ['Quelle ancienne esclave mena des missions pour libérer des fugitifs par l’Underground Railroad ?', 'Harriet Tubman', 'Sojourner Truth', 'Ida B. Wells', 'Mary McLeod Bethune', 'Harriet Tubman retourna plusieurs fois dans le Sud et guida des dizaines de personnes vers la liberté.'],
  ['Quelle suffragiste néo-zélandaise contribua à obtenir le vote des femmes en 1893 ?', 'Kate Sheppard', 'Vida Goldstein', 'Emmeline Pankhurst', 'Millicent Fawcett', 'La Nouvelle-Zélande devint en 1893 le premier pays autonome à accorder le vote aux femmes.'],
  ['Quelle révolutionnaire allemande fut assassinée à Berlin en janvier 1919 ?', 'Rosa Luxemburg', 'Clara Zetkin', 'Emma Goldman', 'Louise Michel', 'Luxemburg, cofondatrice du Parti communiste allemand, fut tuée après l’insurrection spartakiste.'],
  ['Quelle diplomate américaine présida la commission ayant préparé la Déclaration universelle des droits de l’homme ?', 'Eleanor Roosevelt', 'Frances Perkins', 'Jeannette Rankin', 'Pearl Buck', 'Eleanor Roosevelt joua un rôle central dans l’adoption de la Déclaration par l’ONU en 1948.'],
  ['Quelle militante refusa de céder son siège dans un bus de Montgomery en 1955 ?', 'Rosa Parks', 'Ella Baker', 'Fannie Lou Hamer', 'Dorothy Height', 'L’arrestation de Rosa Parks déclencha le boycott des bus de Montgomery, long de plus d’un an.'],
  ['Quel mouvement ouvrier anglais du XIXe siècle réclamait le suffrage masculin ?', 'Le chartisme', 'Le luddisme', 'Le fabianisme', 'Le trade-unionisme', 'La Charte du peuple de 1838 formulait six revendications de réforme parlementaire.'],
  ['Quel instrument d’exécution, adopté en 1792, se voulait plus égalitaire et rapide ?', 'La guillotine', 'La potence', 'Le bûcher', 'La roue', 'Proposée au nom de l’égalité devant la mort, elle remplaça des supplices jusque-là choisis selon le rang social.'],
  ['Quel massacre de 1886 marqua le mouvement ouvrier à Chicago ?', 'L’affaire de Haymarket', 'Le massacre de Ludlow', 'La grève de Pullman', 'L’incendie de Triangle Shirtwaist', 'Une bombe lancée lors d’un rassemblement à Haymarket entraîna une répression et des procès controversés.'],
  ['Quelle catastrophe industrielle new-yorkaise de 1911 tua 146 ouvriers ?', 'L’incendie de Triangle Shirtwaist', 'L’incendie de General Slocum', 'La catastrophe de Monongah', 'L’explosion de Halifax', 'Les portes verrouillées de l’usine Triangle aggravèrent le bilan et stimulèrent les réformes de sécurité.'],
  ['Quel accord social belge de 1944 posa les bases de la sécurité sociale moderne ?', 'Le Projet d’accord de solidarité sociale', 'Le Pacte scolaire', 'Le Pacte d’Egmont', 'La loi unique', 'Négocié clandestinement entre représentants patronaux et syndicaux, le pacte inspira les arrêtés de décembre 1944.'],
  ['Quelle grève belge de 1960-1961 combattit la « loi unique » ?', 'La grève du Siècle', 'La grève des 100 000', 'La grève de 1936', 'La grève des médecins', 'La grève générale contre le programme d’austérité fut particulièrement forte en Wallonie.'],
  ['Quel soulèvement parisien de 1871 instaura un gouvernement révolutionnaire municipal ?', 'La Commune de Paris', 'La révolution de Février', 'Les Trois Glorieuses', 'La Fronde', 'La Commune gouverna Paris pendant un peu plus de deux mois avant la Semaine sanglante.'],
  ['Quel système d’organisation scientifique du travail porte le nom d’un ingénieur américain ?', 'Le taylorisme', 'Le fordisme', 'Le toyotisme', 'Le fayolisme', 'Frederick Winslow Taylor exposa ses principes de gestion scientifique au début du XXe siècle.'],
  ['Quelle marche de chômeurs de 1936 relia le nord-est de l’Angleterre à Londres ?', 'La Jarrow Crusade', 'La Marche de la faim de Cork', 'La Marche de Tolpuddle', 'La Marche de Glasgow', 'Des chômeurs de Jarrow marchèrent pour alerter le gouvernement sur la désindustrialisation de leur ville.'],
  ['Quelle convention de 1919 fixa notamment la journée de travail de huit heures dans l’industrie ?', 'La première convention de l’OIT', 'La convention de Genève', 'La Charte de l’Atlantique', 'Le traité de Rome', 'La convention no 1 de l’Organisation internationale du travail limita la durée quotidienne et hebdomadaire.'],
  ['Quel savant persan dirigea l’observatoire de Maragha au XIIIe siècle ?', 'Nasir al-Din al-Tusi', 'Al-Khwarizmi', 'Avicenne', 'Al-Biruni', 'Al-Tusi développa à Maragha des modèles mathématiques qui influencèrent l’astronomie ultérieure.'],
  ['Quel médecin du XIIIe siècle décrivit la circulation pulmonaire avant William Harvey ?', 'Ibn al-Nafis', 'Averroès', 'Maïmonide', 'Al-Zahrawi', 'Ibn al-Nafis expliqua que le sang passe du cœur droit aux poumons puis au cœur gauche.'],
  ['Quel scientifique publia « De revolutionibus orbium coelestium » en 1543 ?', 'Nicolas Copernic', 'Galilée', 'Johannes Kepler', 'Giordano Bruno', 'Copernic plaça le Soleil au centre des mouvements planétaires dans son modèle héliocentrique.'],
  ['Quelle institution scientifique anglaise reçut une charte royale en 1662 ?', 'La Royal Society', 'La Royal Institution', 'La Lunar Society', 'La British Association', 'La Royal Society adopta pour devise « Nullius in verba », soulignant l’importance de l’expérience.'],
  ['Quel naturaliste suédois établit la nomenclature binominale moderne ?', 'Carl von Linné', 'Georges-Louis Leclerc', 'Jean-Baptiste Lamarck', 'Joseph Banks', 'Linné généralisa les noms latins en deux parties dans Species Plantarum et Systema Naturae.'],
  ['Quelle expédition mesura un arc de méridien au Pérou au XVIIIe siècle ?', 'La mission géodésique française', 'L’expédition de La Pérouse', 'L’expédition Malaspina', 'La mission de Vénus', 'La mission menée près de l’équateur contribua à confirmer l’aplatissement de la Terre aux pôles.'],
  ['Qui démontra l’existence d’une planète en prédisant la position de Neptune ?', 'Urbain Le Verrier', 'François Arago', 'Pierre-Simon de Laplace', 'Joseph Fourier', 'Les calculs de Le Verrier guidèrent Johann Galle vers l’observation de Neptune en 1846.'],
  ['Quel médecin relia une épidémie de choléra londonienne à une pompe à eau en 1854 ?', 'John Snow', 'Joseph Lister', 'Robert Koch', 'Edward Jenner', 'La carte de John Snow autour de Broad Street est devenue emblématique de l’épidémiologie.'],
  ['Quel traité de 1494 partagea les terres à découvrir entre Espagne et Portugal ?', 'Le traité de Tordesillas', 'Le traité d’Alcáçovas', 'Le traité de Saragosse', 'Le traité de Cateau-Cambrésis', 'La ligne de Tordesillas fut déplacée à l’ouest, permettant au Portugal de revendiquer le futur Brésil.'],
  ['Quelle paix de 1763 mit fin à la guerre de Sept Ans entre grandes puissances coloniales ?', 'Le traité de Paris', 'Le traité d’Hubertsbourg', 'Le traité de Versailles', 'Le traité d’Aix-la-Chapelle', 'Le traité de Paris transféra notamment le Canada de la France au Royaume-Uni.'],
  ['Quel congrès de 1878 révisa le traité de San Stefano dans les Balkans ?', 'Le congrès de Berlin', 'Le congrès de Vienne', 'Le congrès de Paris', 'Le congrès de La Haye', 'Sous la présidence de Bismarck, le congrès limita l’expansion russe et redessina plusieurs frontières balkaniques.'],
  ['Quelle conférence de 1906 régla provisoirement la première crise marocaine ?', 'La conférence d’Algésiras', 'La conférence de Tanger', 'La conférence de Berlin', 'La conférence de Fès', 'La conférence confirma l’indépendance formelle du Maroc tout en renforçant l’influence française et espagnole.'],
  ['Quel accord de 1925 garantit les frontières occidentales de l’Allemagne ?', 'Les accords de Locarno', 'Le pacte Briand-Kellogg', 'Le traité de Rapallo', 'Le traité de Lausanne', 'À Locarno, Allemagne, France et Belgique acceptèrent notamment une garantie britannique et italienne.'],
  ['Quel pacte de 1928 prétendit mettre la guerre hors la loi ?', 'Le pacte Briand-Kellogg', 'Le pacte de Varsovie', 'Le pacte de l’Atlantique', 'Le pacte de Locarno', 'De nombreux États signèrent ce pacte sans mécanisme efficace de sanction.'],
  ['Quelle conférence de 1944 créa les bases du FMI et de la Banque mondiale ?', 'La conférence de Bretton Woods', 'La conférence de Dumbarton Oaks', 'La conférence de San Francisco', 'La conférence de Potsdam', 'Les délégués réunis dans le New Hampshire conçurent un nouvel ordre monétaire international.'],
  ['Quel traité de 1951 créa la Communauté européenne du charbon et de l’acier ?', 'Le traité de Paris', 'Le traité de Rome', 'Le traité de Bruxelles', 'Le traité de Luxembourg', 'La CECA associa six pays européens et entra en vigueur en 1952.'],
  ['Quel record du monde la Belgique a-t-elle battu après les élections de 2010 ?', 'La plus longue absence de gouvernement', 'Le plus grand nombre de ministres', 'La plus longue campagne électorale', 'Le plus faible taux de participation', 'Faute d’accord entre partis flamands et francophones, le pays resta 541 jours en affaires courantes.'],
  ['Quel traité de 1963 interdit les essais nucléaires dans l’atmosphère, l’espace et sous l’eau ?', 'Le Traité d’interdiction partielle des essais', 'Le Traité de non-prolifération', 'Le traité SALT I', 'Le traité ABM', 'Les États-Unis, l’Union soviétique et le Royaume-Uni furent les premiers signataires du traité de Moscou.'],
  ['Quel acte de 1975 consacra les principes de la détente en Europe ?', 'L’Acte final d’Helsinki', 'Le traité de Vienne', 'La Charte de Paris', 'L’Acte unique européen', 'Les accords d’Helsinki lièrent sécurité, coopération et respect des droits humains.'],
  ['Quel traité de 1987 élimina une catégorie de missiles nucléaires terrestres ?', 'Le traité FNI', 'Le traité START I', 'Le traité ABM', 'Le traité Ciel ouvert', 'Reagan et Gorbatchev signèrent le traité sur les forces nucléaires à portée intermédiaire.'],
  ['Quel accord de 1993 institua l’Autorité palestinienne ?', 'Les accords d’Oslo', 'Les accords de Camp David', 'La conférence de Madrid', 'Le plan de partage de l’ONU', 'La Déclaration de principes signée à Washington prévoyait une autonomie palestinienne intérimaire.'],
  ['Quel traité de 2002 créa officiellement l’Union africaine ?', 'L’Acte constitutif de l’Union africaine', 'Le traité d’Abuja', 'La Charte de l’OUA', 'Le protocole de Maputo', 'L’Union africaine succéda à l’Organisation de l’unité africaine lors du sommet de Durban.'],
  ['Quel accord climatique adopté en 2015 vise à contenir le réchauffement mondial ?', 'L’Accord de Paris', 'Le protocole de Kyoto', 'L’Accord de Copenhague', 'Le pacte de Glasgow', 'L’Accord de Paris engage les États à présenter et renforcer régulièrement leurs contributions climatiques.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL_04: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `his_adulte_editorial_04_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

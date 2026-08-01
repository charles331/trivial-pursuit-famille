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
 * Remplacements issus des tests en famille.
 *
 * Ces cartes conservent l'identifiant de la carte écartée : elles peuvent donc
 * corriger les lots historiques sans modifier le volume des banques ni les
 * références déjà utilisées par le jeu.
 */
const REPLACEMENTS: Replacement[] = [
  // Histoire : davantage de Belgique et de grands repères européens.
  ['his_adulte_editorial_02_001', 'Quelle bataille de 1302 est aussi appelée la bataille des Éperons d’or ?', 'La bataille de Courtrai', 'La bataille de Waterloo', 'La bataille de Lépante', 'La bataille de Verdun', 'Des milices flamandes y vainquirent l’armée du roi de France près de Courtrai.'],
  ['his_adulte_editorial_02_004', 'Quel souverain prêta serment comme premier roi des Belges en 1831 ?', 'Léopold Ier', 'Léopold II', 'Albert Ier', 'Guillaume Ier', 'Léopold Ier prêta serment sur la Constitution le 21 juillet 1831.'],
  ['his_adulte_editorial_02_005', 'Quelle bataille de 1815 mit définitivement fin au règne de Napoléon Ier ?', 'Waterloo', 'Austerlitz', 'Iéna', 'Wagram', 'Napoléon fut vaincu à Waterloo par les armées de Wellington et de Blücher.'],
  ['his_adulte_editorial_02_006', 'Quel traité de 1839 reconnut définitivement l’indépendance et la neutralité de la Belgique ?', 'Le traité de Londres', 'Le traité de Versailles', 'Le traité de Rome', 'Le traité d’Utrecht', 'Le traité des XXIV articles fut signé à Londres en 1839.'],
  ['his_adulte_editorial_02_008', 'Entre quelles villes circula en 1835 le premier train de voyageurs de Belgique ?', 'Bruxelles et Malines', 'Bruxelles et Liège', 'Anvers et Gand', 'Mons et Charleroi', 'Cette ligne fut aussi la première ligne ferroviaire publique du continent européen.'],
  ['his_adulte_editorial_02_009', 'Quel fleuve l’armée belge défendit-elle pendant la bataille de 1914 qui porte son nom ?', 'L’Yser', 'La Meuse', 'L’Escaut', 'La Sambre', 'L’ouverture des écluses permit d’inonder la plaine de l’Yser et de stopper l’avancée allemande.'],
  ['his_adulte_editorial_02_011', 'En quelle année l’Allemagne envahit-elle la Belgique au début de la Première Guerre mondiale ?', '1914', '1912', '1916', '1918', 'L’invasion commença le 4 août 1914 malgré la neutralité belge.'],
  ['his_adulte_editorial_02_013', 'Qui fut la première femme médecin belge ?', 'Isala Van Diest', 'Marie Popelin', 'Marguerite Yourcenar', 'Gabrielle Petit', 'Isala Van Diest dut étudier en Suisse avant de pouvoir exercer en Belgique.'],
  ['his_adulte_editorial_02_016', 'Dans quelle ville Christophe Plantin installa-t-il sa célèbre imprimerie au XVIe siècle ?', 'Anvers', 'Bruges', 'Louvain', 'Namur', 'L’atelier Plantin-Moretus d’Anvers est aujourd’hui un musée classé par l’UNESCO.'],
  ['his_adulte_editorial_02_017', 'En quelle année les femmes belges votèrent-elles pour la première fois aux élections législatives ?', '1949', '1919', '1930', '1968', 'Le suffrage législatif fut accordé aux femmes en 1948 et exercé pour la première fois en 1949.'],
  ['his_adulte_editorial_02_018', 'Pour quelle exposition internationale l’Atomium fut-il construit ?', 'L’Expo 58', 'L’Expo 67', 'L’Expo 70', 'L’Expo 92', 'L’Atomium était le pavillon vedette de l’Exposition universelle de Bruxelles en 1958.'],
  ['his_adulte_editorial_02_020', 'Comment s’appelait la première reine des Belges, épouse de Léopold Ier ?', 'Louise-Marie d’Orléans', 'Marie-Henriette d’Autriche', 'Élisabeth en Bavière', 'Astrid de Suède', 'Louise-Marie d’Orléans devint reine des Belges en 1832.'],
  ['his_adulte_editorial_02_022', 'Qui devint en 2019 la première femme Première ministre de Belgique ?', 'Sophie Wilmès', 'Laurette Onkelinx', 'Joëlle Milquet', 'Miet Smet', 'Sophie Wilmès dirigea le gouvernement fédéral de 2019 à 2020.'],
  ['his_adulte_editorial_02_023', 'Quel roi des Belges régna pendant la Seconde Guerre mondiale ?', 'Léopold III', 'Albert Ier', 'Baudouin', 'Albert II', 'La conduite de Léopold III pendant et après la guerre provoqua la Question royale.'],
  ['his_adulte_editorial_02_024', 'Dans quelle commune eut lieu la catastrophe minière du Bois du Cazier en 1956 ?', 'Marcinelle', 'Blegny', 'Genk', 'Frameries', 'La catastrophe de Marcinelle causa la mort de 262 mineurs.'],
  ['his_adulte_editorial_02_028', 'En quelle année les pièces et billets en euros ont-ils remplacé le franc belge ?', '2002', '1999', '2004', '2007', 'L’euro existait comme monnaie scripturale dès 1999, mais les espèces arrivèrent en 2002.'],
  ['his_adulte_editorial_02_030', 'Quelle assemblée rédigea la Constitution belge après la révolution de 1830 ?', 'Le Congrès national de 1830-1831', 'Le Parlement européen', 'La Société des Nations', 'Le Conseil de l’Europe', 'Cette assemblée choisit aussi la monarchie constitutionnelle et Léopold Ier.'],
  ['his_adulte_editorial_02_031', 'Quel homme d’État français proposa en 1950 de mettre en commun le charbon et l’acier européens ?', 'Robert Schuman', 'Charles de Gaulle', 'Jean Jaurès', 'Georges Clemenceau', 'La déclaration Schuman du 9 mai 1950 mena à la CECA, ancêtre de l’Union européenne.'],
  ['his_adulte_editorial_02_033', 'Dans quelle ville se trouve le siège politique de l’OTAN ?', 'Bruxelles', 'Genève', 'Strasbourg', 'Luxembourg', 'Le siège politique de l’Alliance atlantique est établi à Bruxelles depuis 1967.'],
  ['his_adulte_editorial_02_037', 'Quel religieux belge reçut le prix Nobel de la paix en 1958 ?', 'Georges Pire', 'Damien de Veuster', 'Joseph Cardijn', 'Edward Poppe', 'Le dominicain belge Georges Pire fut récompensé pour son aide aux réfugiés.'],

  ['his_adulte_editorial_06_001', 'Quelle Belge fut la première femme à siéger au Sénat, en 1921 ?', 'Marie Janson', 'Marie Popelin', 'Isala Van Diest', 'Émilie Claeys', 'Marie Janson entra au Sénat comme membre cooptée avant le suffrage féminin complet.'],
  ['his_adulte_editorial_06_002', 'Quelle réforme électorale la Belgique adopta-t-elle en 1893 pour les hommes ?', 'Le suffrage universel tempéré par le vote plural', 'Le vote obligatoire des femmes', 'Le scrutin majoritaire à un tour', 'Le vote dès seize ans', 'Tous les hommes adultes obtinrent une voix, certains en disposant de voix supplémentaires.'],
  ['his_adulte_editorial_06_007', 'Quel accord de 1958 apaisa le conflit entre enseignement catholique et enseignement officiel en Belgique ?', 'Le Pacte scolaire', 'Le Pacte d’Egmont', 'Le Compromis des Belges', 'Le Traité Benelux', 'Le Pacte scolaire organisa le financement et la liberté de choix entre réseaux d’enseignement.'],
  ['his_adulte_editorial_06_009', 'À partir de quel âge les Belges peuvent-ils voter aux élections fédérales ?', '18 ans', '16 ans', '21 ans', '25 ans', 'Le droit de vote fédéral s’exerce à partir de dix-huit ans.'],
  ['his_adulte_editorial_06_013', 'Dans quelle ville siège la Cour européenne des droits de l’homme ?', 'Strasbourg', 'Bruxelles', 'La Haye', 'Luxembourg', 'La Cour dépend du Conseil de l’Europe et siège à Strasbourg.'],
  ['his_adulte_editorial_06_014', 'Dans quelle ville siège la Cour de justice de l’Union européenne ?', 'Luxembourg', 'Bruxelles', 'Francfort', 'Strasbourg', 'La Cour de justice veille à l’application uniforme du droit de l’Union européenne.'],
  ['his_adulte_editorial_06_016', 'Quelle université belge francophone s’installa à Louvain-la-Neuve après la crise de 1968 ?', 'L’UCLouvain', 'L’ULB', 'L’Université de Liège', 'L’Université de Mons', 'La section francophone de l’université de Louvain créa une ville universitaire nouvelle.'],
  ['his_adulte_editorial_06_017', 'Quelle phrase symbolisa la crise linguistique de l’université de Louvain en 1968 ?', 'Leuven Vlaams', 'Walen buiten Brussel', 'België barst', 'Vive le roi', 'Le slogan réclamait une université néerlandophone à Louvain et entraîna la scission de l’institution.'],
  ['his_adulte_editorial_06_021', 'En quelle année l’instruction obligatoire fut-elle instaurée en Belgique ?', '1914', '1830', '1884', '1958', 'La loi du 19 mai 1914 rendit l’instruction obligatoire et gratuite pour les enfants.'],
  ['his_adulte_editorial_06_022', 'Quel grand humaniste né à Rotterdam publia « Éloge de la folie » ?', 'Érasme', 'Thomas More', 'Montaigne', 'Comenius', 'Érasme séjourna notamment à Louvain et défendit une pensée humaniste européenne.'],
  ['his_adulte_editorial_06_023', 'Quel philosophe genevois écrivit le traité d’éducation « Émile » ?', 'Jean-Jacques Rousseau', 'Voltaire', 'Denis Diderot', 'Montesquieu', 'Publié en 1762, « Émile ou De l’éducation » expose les principes éducatifs de Rousseau.'],
  ['his_adulte_editorial_06_025', 'Quel médecin belge donna son nom à une pédagogie fondée sur l’observation et les centres d’intérêt ?', 'Ovide Decroly', 'Érasme', 'Adolphe Quetelet', 'André Vésale', 'Ovide Decroly fonda à Bruxelles l’école de l’Ermitage au début du XXe siècle.'],
  ['his_adulte_editorial_06_026', 'Quel quotidien belge Émile Rossel fonda-t-il à Bruxelles en 1887 ?', 'Le Soir', 'La Libre Belgique', 'L’Écho', 'La Dernière Heure', 'Le premier numéro du Soir parut le 17 décembre 1887.'],
  ['his_adulte_editorial_06_027', 'Quel journal clandestin belge fut publié durant les deux guerres mondiales ?', 'La Libre Belgique', 'Le Peuple', 'Le Drapeau rouge', 'Le Courrier de l’Escaut', 'Le titre « La Libre Belgique » devint un symbole de résistance à l’occupation.'],
  ['his_adulte_editorial_06_035', 'Quelle offensive allemande de l’hiver 1944-1945 toucha durement Bastogne ?', 'La bataille des Ardennes', 'La bataille de la Somme', 'La bataille de Dunkerque', 'La bataille de Normandie', 'Bastogne fut encerclée pendant l’offensive allemande dans les Ardennes.'],

  // Arts : patrimoine belge et références européennes reconnaissables.
  ['art_adulte_editorial_06_001', 'Quel architecte belge conçut l’Hôtel Tassel, bâtiment majeur de l’Art nouveau ?', 'Victor Horta', 'Henry van de Velde', 'Joseph Poelaert', 'Renaat Braem', 'Construit à Bruxelles, l’Hôtel Tassel est souvent considéré comme un acte fondateur de l’Art nouveau.'],
  ['art_adulte_editorial_06_002', 'Quel peintre belge plaça un homme au chapeau melon devant son visage dans « Le Fils de l’homme » ?', 'René Magritte', 'Paul Delvaux', 'James Ensor', 'Constant Permeke', 'Magritte peignit en 1964 cette silhouette dont le visage est caché par une pomme.'],
  ['art_adulte_editorial_06_003', 'Quel artiste d’Ostende peignit « L’Entrée du Christ à Bruxelles » ?', 'James Ensor', 'René Magritte', 'Léon Spilliaert', 'Paul Delvaux', 'La vaste toile d’Ensor mêle foule, masques et satire sociale.'],
  ['art_adulte_editorial_06_004', 'Quel peintre flamand réalisa « La Descente de croix » visible dans la cathédrale d’Anvers ?', 'Pierre Paul Rubens', 'Antoine van Dyck', 'Jan van Eyck', 'Pieter Bruegel', 'Le triptyque de Rubens est conservé dans la cathédrale Notre-Dame d’Anvers.'],
  ['art_adulte_editorial_06_005', 'Dans quelle commune se trouve le Musée royal de l’Afrique centrale ?', 'Tervuren', 'Waterloo', 'Meise', 'Laeken', 'Le musée est installé dans un vaste palais et parc à Tervuren.'],
  ['art_adulte_editorial_06_006', 'Quel peintre belge est célèbre pour ses gares peuplées de femmes mystérieuses ?', 'Paul Delvaux', 'René Magritte', 'Félicien Rops', 'Théo van Rysselberghe', 'Les gares, les trains et les personnages féminins reviennent souvent dans l’univers onirique de Delvaux.'],
  ['art_adulte_editorial_06_007', 'Quel dessinateur belge créa le personnage-poète Monsieur Plume ?', 'Henri Michaux', 'Jean-Michel Folon', 'Philippe Geluck', 'François Schuiten', 'L’écrivain et artiste belge Henri Michaux créa Monsieur Plume dans les années 1930.'],
  ['art_adulte_editorial_06_008', 'Quel artiste belge est connu pour ses silhouettes au chapeau et ses oiseaux bleus ?', 'Jean-Michel Folon', 'Pierre Alechinsky', 'Panamarenko', 'Arno Quinze', 'Les silhouettes, flèches et oiseaux sont caractéristiques de l’univers poétique de Folon.'],
  ['art_adulte_editorial_06_011', 'Quel mouvement artistique bruxellois comptait Christian Dotremont et Pierre Alechinsky ?', 'CoBrA', 'Le surréalisme', 'Le futurisme', 'Le Bauhaus', 'Le nom CoBrA réunit les initiales de Copenhague, Bruxelles et Amsterdam.'],
  ['art_adulte_editorial_06_013', 'Quel bâtiment bruxellois abrite le Centre belge de la bande dessinée ?', 'Les anciens magasins Waucquez', 'Le Palais Stoclet', 'La Maison du Peuple', 'Le Musée Horta', 'Victor Horta conçut les magasins Waucquez, devenus le musée de la bande dessinée.'],
  ['art_adulte_editorial_06_014', 'Quel monument occupe le centre du square du Petit Sablon à Bruxelles ?', 'La fontaine des comtes d’Egmont et de Hornes', 'Une statue de René Magritte', 'Une copie du Manneken-Pis', 'Un buste de Victor Horta', 'La grande fontaine du square rend hommage aux comtes d’Egmont et de Hornes, exécutés en 1568.'],
  ['art_adulte_editorial_06_015', 'Quel musée bruxellois occupe une maison Art nouveau de la rue Américaine à Saint-Gilles ?', 'Le musée Horta', 'Le musée Magritte', 'Le musée BELvue', 'La Maison du Roi', 'Victor Horta conçut cette maison et son atelier, aujourd’hui ouverts au public.'],
  ['art_adulte_editorial_06_016', 'Qui a peint le paysage hivernal « Chasseurs dans la neige » ?', 'Pieter Bruegel', 'Pierre Paul Rubens', 'Jan van Eyck', 'Quentin Metsys', 'Pieter Bruegel l’Ancien réalisa ce tableau en 1565.'],
  ['art_adulte_editorial_06_017', 'Quel musée anversois est consacré à l’imprimeur Christophe Plantin ?', 'Le musée Plantin-Moretus', 'Le MAS', 'Le KMSKA', 'La Maison de Rubens', 'Le musée conserve une imprimerie historique et des archives classées par l’UNESCO.'],
  ['art_adulte_editorial_06_020', 'Quel sculpteur réalisa « Le Penseur » ?', 'Auguste Rodin', 'Antoine Bourdelle', 'Camille Claudel', 'Alberto Giacometti', '« Le Penseur » fut d’abord imaginé pour « La Porte de l’Enfer » de Rodin.'],
  ['art_adulte_editorial_06_021', 'Quel musée parisien expose « La Joconde » ?', 'Le Louvre', 'Le musée d’Orsay', 'Le Centre Pompidou', 'Le musée Rodin', 'Le portrait de Léonard de Vinci est exposé au Louvre.'],
  ['art_adulte_editorial_06_022', 'Quel peintre belge fut l’un des principaux représentants du pointillisme ?', 'Théo van Rysselberghe', 'James Ensor', 'Constant Permeke', 'Antoine Wiertz', 'Théo van Rysselberghe appliquait de petites touches colorées séparées, notamment dans ses portraits.'],
  ['art_adulte_editorial_06_023', 'À quel peintre doit-on le plafond de la chapelle Sixtine ?', 'Michel-Ange', 'Raphaël', 'Léonard de Vinci', 'Botticelli', 'Michel-Ange peignit le plafond de la chapelle Sixtine entre 1508 et 1512.'],
  ['art_adulte_editorial_06_024', 'Quel artiste espagnol peignit « Guernica » ?', 'Pablo Picasso', 'Salvador Dalí', 'Joan Miró', 'Francisco de Goya', 'Picasso réalisa cette toile monumentale après le bombardement de Guernica en 1937.'],
  ['art_adulte_editorial_06_037', 'Quel musée d’Amsterdam est entièrement consacré au peintre des « Tournesols » ?', 'Le musée Van Gogh', 'Le Rijksmuseum', 'Le musée Stedelijk', 'La Maison de Rembrandt', 'Le musée conserve des centaines de peintures et dessins de Vincent van Gogh.'],

  ['art_adulte_editorial_07_001', 'Quel dessinateur belge créa le gros chien blanc Cubitus ?', 'Dupa', 'Morris', 'Peyo', 'Jean Roba', 'Luc Dupanloup, dit Dupa, créa Cubitus en 1968.'],
  ['art_adulte_editorial_07_002', 'Quel auteur belge imagina les Schtroumpfs ?', 'Peyo', 'Morris', 'Rob-Vel', 'Willy Vandersteen', 'Peyo fit apparaître les Schtroumpfs dans une aventure de Johan et Pirlouit en 1958.'],
  ['art_adulte_editorial_07_003', 'Quel auteur belge créa le lérot détective Chlorophylle ?', 'Raymond Macherot', 'André Franquin', 'Maurice Tillieux', 'Jean Roba', 'Raymond Macherot lança la série « Chlorophylle » dans le Journal de Tintin en 1954.'],
  ['art_adulte_editorial_07_004', 'Quel auteur belge créa Boule et Bill ?', 'Jean Roba', 'François Walthéry', 'Raoul Cauvin', 'Raymond Macherot', 'Jean Roba lança Boule et Bill dans le journal Spirou en 1959.'],
  ['art_adulte_editorial_07_005', 'Quel dessinateur belge créa Natacha, l’hôtesse de l’air ?', 'François Walthéry', 'Jean Graton', 'Tibet', 'Dany', 'Natacha apparut pour la première fois dans Spirou en 1970.'],
  ['art_adulte_editorial_07_006', 'Quel auteur belge créa le pilote automobile Michel Vaillant ?', 'Jean Graton', 'Maurice Tillieux', 'Roger Leloup', 'Greg', 'Michel Vaillant fit ses débuts dans le Journal de Tintin en 1957.'],
  ['art_adulte_editorial_07_028', 'Dans quelle ville belge se trouve le musée consacré à Félicien Rops ?', 'Namur', 'Mons', 'Tournai', 'Liège', 'Le musée Félicien Rops occupe un ancien hôtel de maître du vieux Namur.'],
  ['art_adulte_editorial_07_033', 'Quel architecte conçut le palais de justice de Bruxelles ?', 'Joseph Poelaert', 'Victor Horta', 'Henry van de Velde', 'Alphonse Balat', 'Le gigantesque palais de justice domine le quartier des Marolles depuis la place Poelaert.'],

  ['art_adulte_editorial_final_011', 'Quel chanteur belge interprète « Formidable » et « Papaoutai » ?', 'Stromae', 'Arno', 'Jacques Brel', 'Salvatore Adamo', 'Ces deux titres figurent sur l’album « Racine carrée » de Stromae.'],
  ['art_adulte_editorial_final_012', 'Quel ingénieur belge conçut l’Atomium pour l’Expo 58 ?', 'André Waterkeyn', 'Victor Horta', 'Joseph Poelaert', 'Henry van de Velde', 'André Waterkeyn imagina la structure représentant un cristal de fer agrandi.'],
  ['art_adulte_editorial_final_013', 'Quel artiste américain transforma des boîtes de soupe Campbell en icônes du pop art ?', 'Andy Warhol', 'Roy Lichtenstein', 'Keith Haring', 'Jackson Pollock', 'Warhol sérigraphia les boîtes Campbell au début des années 1960.'],
  ['art_adulte_editorial_final_014', 'Quel artiste anonyme est célèbre pour ses pochoirs satiriques dans l’espace public ?', 'Banksy', 'JR', 'Invader', 'Shepard Fairey', 'L’identité de Banksy reste inconnue malgré sa renommée internationale.'],
  ['art_adulte_editorial_final_015', 'Quel peintre utilisa la technique du dripping, en projetant la peinture sur la toile ?', 'Jackson Pollock', 'Mark Rothko', 'Edward Hopper', 'Andy Warhol', 'Pollock posait souvent ses grandes toiles au sol pour y faire couler la peinture.'],
  ['art_adulte_editorial_final_016', 'Quel artiste réalisa les mobiles composés de formes colorées en équilibre ?', 'Alexander Calder', 'Henry Moore', 'César', 'Niki de Saint Phalle', 'Calder rendit célèbre la sculpture mobile au XXe siècle.'],
  ['art_adulte_editorial_final_017', 'Quelle artiste franco-américaine créa les sculptures colorées appelées « Nanas » ?', 'Niki de Saint Phalle', 'Louise Bourgeois', 'Sonia Delaunay', 'Camille Claudel', 'Les Nanas sont de grandes figures féminines joyeuses aux couleurs vives.'],
  ['art_adulte_editorial_final_018', 'Quel artiste peignit le plafond de l’Opéra Garnier en 1964 ?', 'Marc Chagall', 'Henri Matisse', 'Joan Miró', 'Pablo Picasso', 'Le plafond coloré de Chagall rend hommage à plusieurs compositeurs.'],
  ['art_adulte_editorial_final_023', 'Quel artiste belge a représenté un tuyau avec la phrase « Ceci n’est pas une pipe » ?', 'René Magritte', 'Marcel Broodthaers', 'Paul Delvaux', 'James Ensor', '« La Trahison des images » distingue la représentation d’un objet de l’objet lui-même.'],
  ['art_adulte_editorial_final_024', 'Quel artiste a placé une fontaine en forme de chien géant fleuri devant le musée Guggenheim de Bilbao ?', 'Jeff Koons', 'Damien Hirst', 'Anish Kapoor', 'Ai Weiwei', '« Puppy » est recouvert de milliers de fleurs vivantes.'],
  ['art_adulte_editorial_05_034', 'Depuis sa rénovation, quel matériau recouvre les neuf sphères de l’Atomium ?', 'L’acier inoxydable', 'Le cuivre', 'Le bronze', 'Le verre', 'Les anciennes plaques d’aluminium ont été remplacées par de l’acier inoxydable lors de la rénovation achevée en 2006.'],

  // Géographie et sciences : faits utiles et formulés concrètement.
  ['geo_adulte_editorial_final_002', 'Quel pays européen a la forme caractéristique d’une botte ?', 'L’Italie', 'La Grèce', 'Le Portugal', 'La Croatie', 'La péninsule italienne s’avance dans la Méditerranée avec une forme de botte.'],
  ['geo_adulte_editorial_final_003', 'Quelle mer borde la Belgique ?', 'La mer du Nord', 'La mer Baltique', 'La Manche', 'La mer d’Irlande', 'Le littoral belge s’étend sur environ 67 kilomètres le long de la mer du Nord.'],
  ['geo_adulte_editorial_final_008', 'Quelle station balnéaire belge jouxte la réserve naturelle du Zwin ?', 'Knokke-Heist', 'Ostende', 'La Panne', 'Middelkerke', 'Le Zwin s’étend à la frontière entre Knokke-Heist et les Pays-Bas.'],
  ['geo_adulte_editorial_final_009', 'Quelle est la plus petite province belge par sa superficie ?', 'Le Brabant wallon', 'Le Brabant flamand', 'Le Limbourg', 'Namur', 'Le Brabant wallon couvre un peu moins de 1 100 kilomètres carrés.'],
  ['geo_adulte_editorial_final_010', 'Quelle province belge est la seule à avoir une frontière avec l’Allemagne ?', 'Liège', 'Le Luxembourg', 'Limbourg', 'Namur', 'La province de Liège comprend notamment les communes germanophones proches de la frontière.'],
  ['geo_adulte_editorial_final_011', 'Quelle rivière rejoint la Meuse à Namur après avoir traversé Charleroi ?', 'La Sambre', 'La Lesse', 'L’Ourthe', 'La Dendre', 'La Sambre traverse Charleroi puis conflue avec la Meuse au pied de la citadelle de Namur.'],
  ['geo_adulte_editorial_final_012', 'Dans quelle province belge se trouve la ville de Durbuy ?', 'Le Luxembourg', 'Namur', 'Liège', 'Le Brabant wallon', 'Durbuy se situe dans la province de Luxembourg, au bord de l’Ourthe.'],
  ['geo_adulte_editorial_final_013', 'Quelle rivière a creusé les grottes de Han ?', 'La Lesse', 'La Semois', 'L’Amblève', 'La Dyle', 'À Han-sur-Lesse, la rivière traverse le massif calcaire sous terre.'],
  ['geo_adulte_editorial_final_014', 'Quel massif boisé couvre une grande partie du sud-est de la Belgique ?', 'Les Ardennes', 'Les Vosges', 'Le Jura', 'Les Fagnes', 'Les Ardennes s’étendent aussi au Luxembourg et en France.'],
  ['geo_adulte_editorial_final_018', 'Quelle ville belge est célèbre pour son carnaval et ses Gilles ?', 'Binche', 'Alost', 'Malmedy', 'Stavelot', 'Les Gilles de Binche sortent notamment le mardi gras.'],
  ['geo_adulte_editorial_final_020', 'Quelle ville belge est surnommée la Cité ardente ?', 'Liège', 'Charleroi', 'Mons', 'Namur', 'Le surnom de Liège évoque un épisode de résistance au XVe siècle.'],
  ['geo_adulte_editorial_final_023', 'Quelle capitale européenne est traversée par la Seine ?', 'Paris', 'Bruxelles', 'Vienne', 'Prague', 'La Seine traverse Paris avant de se jeter dans la Manche au Havre.'],
  ['geo_adulte_editorial_final_024', 'Quel fleuve traverse Londres ?', 'La Tamise', 'La Seine', 'Le Rhin', 'Le Shannon', 'La Tamise traverse Londres et se jette dans la mer du Nord.'],
  ['geo_adulte_editorial_final_025', 'Dans quelle province se trouve l’enclave belge de Baarle-Hertog ?', 'Anvers', 'Limbourg', 'Le Brabant flamand', 'La Flandre-Orientale', 'Baarle-Hertog forme un étonnant puzzle d’enclaves belges aux Pays-Bas.'],
  ['geo_adulte_editorial_final_026', 'Quelle rivière, aujourd’hui en grande partie voûtée, traverse le centre de Bruxelles ?', 'La Senne', 'La Dyle', 'La Dendre', 'La Woluwe', 'La Senne fut couverte au XIXe siècle lors des grands travaux du centre de Bruxelles.'],
  ['geo_adulte_editorial_final_027', 'Quel grand fleuve traverse l’Égypte du sud vers le nord ?', 'Le Nil', 'Le Congo', 'Le Niger', 'Le Zambèze', 'Le Nil forme un vaste delta avant de se jeter dans la Méditerranée.'],
  ['geo_adulte_editorial_final_028', 'À la frontière de quels deux pays se trouvent les chutes du Niagara ?', 'Le Canada et les États-Unis', 'Le Canada et le Groenland', 'Les États-Unis et le Mexique', 'Le Canada et la Russie', 'La rivière Niagara relie les lacs Érié et Ontario.'],
  ['geo_adulte_editorial_final_029', 'Quelle ville belge célèbre chaque année le Doudou et le combat de saint Georges ?', 'Mons', 'Ath', 'Nivelles', 'Tournai', 'La Ducasse de Mons, appelée le Doudou, est reconnue par l’UNESCO.'],
  ['sci_adulte_editorial_final_028', 'Quelle grandeur mesure-t-on en watts ?', 'La puissance', 'La tension électrique', 'La température', 'La masse', 'Un watt correspond à un joule d’énergie transféré par seconde.'],
  ['sci_adulte_editorial_final_029', 'Quelle unité utilise-t-on pour mesurer la tension électrique ?', 'Le volt', 'Le watt', 'L’ampère', 'L’ohm', 'Le volt mesure la différence de potentiel électrique.'],

  // Sports : grands repères belges et disciplines connues.
  ['sport_adulte_curated_06_012', 'Quelle judokate belge remporta l’or olympique à Atlanta en 1996 ?', 'Ulla Werbrouck', 'Gella Vandecaveye', 'Ingrid Berghmans', 'Ilse Heylen', 'Ulla Werbrouck devint championne olympique dans la catégorie des moins de 72 kg.'],
  ['sport_adulte_curated_06_013', 'Quel surnom donne-t-on à Eddy Merckx en raison de son appétit de victoires ?', 'Le Cannibale', 'Le Lion des Flandres', 'Le Blaireau', 'Le Pirate', 'Eddy Merckx a remporté cinq Tours de France et de très nombreuses classiques.'],
  ['sport_adulte_curated_06_014', 'Quel pilote belge a remporté dix titres mondiaux de motocross ?', 'Stefan Everts', 'Joël Smets', 'Roger De Coster', 'Jacky Ickx', 'Stefan Everts détient dix titres mondiaux remportés entre 1991 et 2006.'],
  ['sport_adulte_curated_06_021', 'Quelle joueuse belge a remporté sept titres du Grand Chelem en simple ?', 'Justine Henin', 'Kim Clijsters', 'Yanina Wickmayer', 'Dominique Monami', 'Justine Henin a notamment gagné quatre fois Roland-Garros.'],
  ['sport_adulte_curated_06_022', 'Quelle joueuse belge a remporté l’US Open en 2005, 2009 et 2010 ?', 'Kim Clijsters', 'Justine Henin', 'Elise Mertens', 'Sabine Appelmans', 'Kim Clijsters remporta deux de ces titres après son premier retour sur le circuit.'],
  ['sport_adulte_curated_06_027', 'Quel grand meeting d’athlétisme se déroule au stade Roi Baudouin ?', 'Le Mémorial Van Damme', 'Les 20 km de Bruxelles', 'La Flèche wallonne', 'Le CrossCup', 'Le Mémorial Van Damme fait partie des grands meetings internationaux d’athlétisme.'],
  ['sport_adulte_curated_06_033', 'Dans quelle discipline Tia Hellebaut fut-elle championne olympique en 2008 ?', 'Le saut en hauteur', 'L’heptathlon', 'Le saut à la perche', 'Le triple saut', 'Tia Hellebaut franchit 2,05 mètres à Pékin pour remporter l’or.'],
  ['sport_adulte_curated_06_037', 'Quel coureur belge a remporté le championnat du monde sur route en 2022 ?', 'Remco Evenepoel', 'Wout van Aert', 'Philippe Gilbert', 'Greg Van Avermaet', 'Remco Evenepoel s’imposa en solitaire à Wollongong en Australie.'],
  ['sport_adulte_curated_06_044', 'Quel sport pratique l’équipe nationale belge surnommée les Red Lions ?', 'Le hockey sur gazon', 'Le rugby', 'Le handball', 'Le volley-ball', 'Les Red Lions ont été champions olympiques à Tokyo.'],
  ['sport_adulte_curated_06_046', 'Quel gardien belge joua au Bayern Munich dans les années 1980 ?', 'Jean-Marie Pfaff', 'Michel Preud’homme', 'Thibaut Courtois', 'Geert De Vlieger', 'Jean-Marie Pfaff remporta notamment trois championnats d’Allemagne avec le Bayern.'],
];

const BY_ID = new Map(REPLACEMENTS.map((replacement) => [replacement[0], replacement]));

export function applyFamilyAdultReplacements(questions: Question[]): Question[] {
  return questions.map((question) => {
    const replacement = BY_ID.get(question.id);
    if (!replacement) return question;

    const [, prompt, answer, distractor1, distractor2, distractor3, explanation] = replacement;
    return {
      ...question,
      question: prompt,
      options: [answer, distractor1, distractor2, distractor3],
      correctAnswerIndex: 0,
      explanation,
    };
  });
}

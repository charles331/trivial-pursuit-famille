import { Question } from '../../types';

/**
 * Sport francophone et belge.
 *
 * La catégorie sports était la mieux calibrée du corpus en difficulté, mais la
 * moins ancrée : 45 cartes francophones sur 400. En parallèle, elle consacrait
 * six cartes au cricket, six au baseball, cinq au water-polo, quatre au hockey
 * sur glace et quatre aux fléchettes — des sports très peu suivis ici, traités
 * dans un détail réglementaire que même un amateur ne connaît pas.
 *
 * Ces trente-cinq cartes prennent leur place. Les bases de chacun de ces sports
 * restent en banque : ce sont les subtilités de règlement qui partent, pas les
 * sports eux-mêmes.
 */
type Fact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: Fact[] = [
  // ---- Cyclisme ----------------------------------------------------------
  ['Quelle classique belge est surnommée « la Doyenne » ?', 'Liège-Bastogne-Liège', 'Le Tour des Flandres', 'Paris-Roubaix', 'Gand-Wevelgem', 'Courue pour la première fois en 1892, c’est la plus ancienne des cinq classiques monuments.'],
  ['Quelle course belge est surnommée « le Ronde » par les Flamands ?', 'Le Tour des Flandres', 'Liège-Bastogne-Liège', 'Le Grand Prix E3', 'La Flèche brabançonne', 'Le Vieux Quaremont et le Paterberg, pavés et très pentus, y font la sélection.'],
  ['Combien de classiques « monuments » le calendrier cycliste compte-t-il ?', 'Cinq', 'Trois', 'Sept', 'Quatre', 'Milan-San Remo, le Tour des Flandres, Paris-Roubaix, Liège-Bastogne-Liège et le Tour de Lombardie.'],
  ['Quel coureur belge a remporté le Tour de France, le Giro et la Vuelta ?', 'Eddy Merckx', 'Johan Museeuw', 'Tom Boonen', 'Philippe Gilbert', 'Il a aussi gagné les cinq classiques monuments, un doublé que personne n’a réédité.'],
  ['Quel jeune coureur belge a remporté la Vuelta en 2022 et le Tour de France 2024 ?', 'Remco Evenepoel', 'Wout van Aert', 'Jasper Philipsen', 'Tiesj Benoot', 'Il vient du football : il a joué en équipes nationales de jeunes avant de passer au vélo.'],
  ['Quel Belge domine régulièrement le cyclo-cross en plus de la route ?', 'Wout van Aert', 'Remco Evenepoel', 'Jasper Stuyven', 'Yves Lampaert', 'Le cyclo-cross, très populaire en Flandre, se court en hiver sur des parcours boueux.'],
  ['Quel maillot distingue le meilleur grimpeur du Tour de France ?', 'Le maillot à pois rouges', 'Le maillot vert', 'Le maillot blanc', 'Le maillot arc-en-ciel', 'Le maillot vert récompense le classement par points, le blanc le meilleur jeune.'],
  ['Quelle épreuve sur piste se court par équipes de deux pendant plusieurs nuits à Gand ?', 'Les Six Jours', 'Le keirin', 'L’omnium', 'La course aux points', 'Le vélodrome Kuipke, en plein cœur de Gand, en accueille l’édition la plus réputée.'],

  // ---- Football ----------------------------------------------------------
  ['Comment surnomme-t-on l’équipe nationale de football de Belgique ?', 'Les Diables rouges', 'Les Lions', 'Les Rouges', 'Les Aiglons', 'Le surnom date de 1906, après une victoire contre trois adversaires en quelques jours.'],
  ['À quelle place la Belgique a-t-elle terminé la Coupe du monde 2018 ?', 'Troisième', 'Deuxième', 'Quatrième', 'Championne', 'C’est son meilleur résultat, après une demi-finale perdue contre la France.'],
  ['Quel gardien belge a longtemps gardé les buts du Real Madrid ?', 'Thibaut Courtois', 'Simon Mignolet', 'Koen Casteels', 'Jean-Marie Pfaff', 'Il a été élu meilleur gardien de la Coupe du monde 2018.'],
  ['Quel milieu de terrain belge a été élu meilleur joueur du championnat anglais ?', 'Kevin De Bruyne', 'Eden Hazard', 'Youri Tielemans', 'Axel Witsel', 'Il détient le record de passes décisives sur une saison de Premier League, à égalité.'],
  ['Comment s’appelle le championnat de première division de football en Belgique ?', 'La Jupiler Pro League', 'La Ligue 1', 'L’Eredivisie', 'La Bundesliga', 'Elle compte parmi les championnats les plus formateurs d’Europe pour les jeunes joueurs.'],
  ['Quel club belge joue au stade Constant Vanden Stock à Bruxelles ?', 'Le RSC Anderlecht', 'Le Club Bruges', 'L’Union Saint-Gilloise', 'Le Sporting Charleroi', 'C’est le club le plus titré du championnat belge.'],
  ['Quel club bruxellois est remonté en première division en 2021 après cinquante ans d’absence ?', 'L’Union Saint-Gilloise', 'Le RWDM', 'Le Racing White', 'Le Daring Club', 'Son stade Joseph Marien, adossé au parc Duden, est l’un des plus anciens du pays.'],
  ['Quel gardien belge a été élu meilleur gardien du monde en 1987 ?', 'Jean-Marie Pfaff', 'Michel Preud’homme', 'Thibaut Courtois', 'Gilbert Bodart', 'Il avait porté la Belgique en demi-finale de la Coupe du monde 1986.'],
  ['Quel trophée récompense chaque année le meilleur joueur européen depuis 1956 ?', 'Le Ballon d’or', 'Le Soulier d’or', 'La Coupe Henri Delaunay', 'Le trophée Yachine', 'Le Soulier d’or, lui, est une récompense belge décernée au meilleur joueur du championnat.'],

  // ---- Tennis, athlétisme, gymnastique -----------------------------------
  ['Combien de tournois composent le Grand Chelem de tennis ?', 'Quatre', 'Trois', 'Cinq', 'Six', 'Melbourne sur dur, Roland-Garros sur terre battue, Wimbledon sur gazon et l’US Open sur dur.'],
  ['Quelle Belge est revenue de sa retraite pour gagner l’US Open en 2009 ?', 'Kim Clijsters', 'Justine Henin', 'Elise Mertens', 'Yanina Wickmayer', 'Elle est devenue la première mère de famille à gagner un Grand Chelem depuis 1980.'],
  ['Quel Français a remporté Roland-Garros en 1983 ?', 'Yannick Noah', 'Henri Leconte', 'Guy Forget', 'Cédric Pioline', 'C’est la dernière victoire française chez les hommes dans ce tournoi.'],
  ['Quelle épreuve combinée masculine réunit dix disciplines d’athlétisme ?', 'Le décathlon', 'L’heptathlon', 'Le pentathlon', 'Le triathlon', 'Elle se dispute sur deux jours et son vainqueur olympique est traditionnellement appelé le roi des athlètes.'],
  ['Quel meeting international d’athlétisme se tient chaque année à Bruxelles ?', 'Le Mémorial Van Damme', 'Le Golden Gala', 'L’Athletissima', 'Le Weltklasse', 'Il porte le nom du coureur belge Ivo Van Damme, mort à vingt-deux ans dans un accident.'],
  ['Quelle gymnaste belge a été championne olympique aux barres asymétriques en 2021 ?', 'Nina Derwael', 'Aagje Vanwalleghem', 'Gaëlle Mys', 'Julie Croket', 'C’est la première médaille d’or olympique belge en gymnastique.'],
  ['Quelle épreuve reine de l’athlétisme se court sur 42,195 kilomètres ?', 'Le marathon', 'Le semi-marathon', 'Le dix mille mètres', 'Le steeple', 'La distance exacte a été fixée aux Jeux de Londres en 1908, pour finir devant la loge royale.'],

  // ---- Hockey sur gazon, basket, sports moteurs, divers -------------------
  ['Comment surnomme-t-on l’équipe nationale féminine belge de hockey sur gazon ?', 'Les Red Panthers', 'Les Belgian Cats', 'Les Red Lions', 'Les Red Flames', 'Les Red Flames, elles, sont les footballeuses de l’équipe nationale.'],
  ['Comment surnomme-t-on l’équipe nationale belge féminine de basket-ball ?', 'Les Belgian Cats', 'Les Red Panthers', 'Les Red Lions', 'Les Belgian Bulls', 'Elles ont atteint les demi-finales de l’Euro et se sont qualifiées pour les Jeux.'],
  ['Sur quel circuit belge se court le Grand Prix de Formule 1 de Belgique ?', 'Spa-Francorchamps', 'Zolder', 'Nivelles', 'Chimay', 'Son virage du Raidillon de l’Eau Rouge est considéré comme l’un des plus exigeants du calendrier.'],
  ['Quel pilote belge a couru en Formule 1 chez McLaren à partir de 2016 ?', 'Stoffel Vandoorne', 'Jacky Ickx', 'Thierry Boutsen', 'Jérôme d’Ambrosio', 'Il est ensuite devenu champion du monde de Formule E.'],
  ['Quelle course d’endurance se déroule chaque année sur le circuit de la Sarthe ?', 'Les 24 Heures du Mans', 'Les 12 Heures de Sebring', 'Les 24 Heures de Spa', 'Le Petit Le Mans', 'Les 24 Heures de Spa, elles, sont l’épreuve d’endurance belge de référence.'],
  ['Quelle course automobile d’endurance belge se dispute sur le circuit de Spa ?', 'Les 24 Heures de Spa', 'Les 6 Heures de Francorchamps', 'Le Grand Prix des Ardennes', 'Le Rallye de Wallonie', 'Elle se court depuis 1924, souvent sous la pluie caractéristique de la région.'],
  ['Quel jeu de balle traditionnel se pratique encore dans les villages de Wallonie ?', 'La balle pelote', 'La pétanque', 'Le jeu de paume', 'Le tamis', 'Elle se joue sur un « ballodrome » tracé à même la place du village.'],
  ['Quelle discipline olympique consiste à descendre une piste glacée sur un traîneau, tête la première ?', 'Le skeleton', 'Le bobsleigh', 'La luge', 'Le snowboard cross', 'En luge on descend sur le dos, les pieds devant ; en skeleton à plat ventre, tête en avant.'],
  ['Quelle compétition de football réunit les clubs européens les mieux classés chaque saison ?', 'La Ligue des champions', 'La Ligue Europa', 'La Supercoupe', 'La Ligue des nations', 'Elle a succédé en 1992 à la Coupe des clubs champions, créée en 1955.'],
  ['Dans quelle ville se sont tenus les Jeux olympiques d’été de 1920 ?', 'Anvers', 'Bruxelles', 'Paris', 'Amsterdam', 'C’est à Anvers que le drapeau olympique et le serment olympique ont été utilisés pour la première fois.'],
  ['Combien de finales de Coupe du monde de football la Belgique a-t-elle jouées ?', 'Aucune', 'Une', 'Deux', 'Trois', 'Son meilleur parcours reste la troisième place obtenue en 2018, après une demi-finale en 1986.'],
];

export const SPORTS_FRANCOPHONE_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `sport_adulte_francophone_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'sports' as const,
      question,
      options: options.map(
        (_, position) => options[(position + options.length - rotation) % options.length],
      ),
      correctAnswerIndex: rotation,
      difficulty: 'adulte' as const,
      explanation,
    };
  },
);

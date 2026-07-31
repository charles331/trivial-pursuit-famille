import { Question } from '../../types';

/**
 * Deuxième abaissement du plafond d’« Art & Littérature » : le nom d’auteur
 * comme seule réponse possible.
 *
 * Après la passe menée sur le cinéma, la mesure a été refaite avec un
 * détecteur correct — le premier ne voyait que « qui a peint / réalisé / signé »
 * et ratait « qui a créé », « quel est l’auteur de », « à quel artiste doit-on ».
 * La catégorie ne comptait donc pas 104 cartes d’attribution mais **249 sur
 * 400** : près de deux cartes d’art sur trois attendent un patronyme. (Une
 * mesure intermédiaire a annoncé 257 : elle comptait aussi des cartes dont la
 * réponse est un personnage ou une marque, pas un auteur.)
 *
 * Une réponse-patronyme n’a qu’une porte : la connaître. Encore faut-il
 * qu’elle soit citable. 61 cartes attendaient Bronislava Nijinska, Jiří Kylián,
 * Merce Cunningham, Max Miedinger, Jean-Henri Riesener, Joseph Kosuth,
 * Michelangelo Pistoletto, Marcel Broodthaers, Panamarenko, George Minne,
 * Giambologna, Jean-Baptiste Carpeaux, Andrea Palladio ou Charles Rennie
 * Mackintosh. Ce sont ces 61 qui sont remplacées ici.
 *
 * Deux principes de remplacement :
 *
 * 1. quand le sujet est célèbre et seul son auteur est inconnu, la carte est
 *    retournée — le Crystal Palace, l’Opéra de Sydney, le Centre Pompidou, le
 *    Burj Khalifa, Helvetica, « I ♥ NY », Cloud Gate et la fontaine Stravinsky
 *    remplacent Paxton, Utzon, Piano et Rogers, Adrian Smith, Miedinger,
 *    Glaser, Kapoor et Tinguely ;
 * 2. sinon la carte change de sujet pour un fait grand public, et de format :
 *    regarder un tableau, reconnaître un personnage de roman ou de bande
 *    dessinée, nommer un métier, une technique, un musée.
 *
 * Ce qui reste de la famille « attribution » est ce qu’un foyer peut nommer :
 * Léonard, Rembrandt, Renoir, Monet, Van Gogh, Picasso, Dalí, Magritte,
 * Delvaux, Ensor, Rubens, Horta, Hergé, Franquin, Peyo, Chanel, Dior,
 * Saint Laurent, Simenon, Hugo, Dumas, Verne.
 *
 * Le reliquat reste important : 192 cartes de la catégorie attendent encore un
 * nom d’auteur, contre 53 en cinéma. La monotonie du format est un chantier
 * distinct de celui de la notoriété — voir la section 10 de
 * `docs/analyse-niveaux-difficulte.md`.
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
  // ---- Bâtiments et lieux célèbres, sans passer par l’architecte ----------
  ['Quel palais de verre et de fonte abrita l’Exposition universelle de Londres en 1851 ?', 'Le Crystal Palace', 'Le palais de Westminster', 'Le Royal Albert Hall', 'La Tate Gallery', 'Démonté puis rebâti au sud de Londres, il a été détruit par un incendie en 1936.'],
  ['Quel bâtiment australien dresse au-dessus d’un port des coques blanches en éventail ?', 'L’Opéra de Sydney', 'Le Parlement de Canberra', 'La tour de Melbourne', 'Le musée de Brisbane', 'Ses voiles sont couvertes de plus d’un million de tuiles de céramique claire.'],
  ['Quel musée parisien montre à l’extérieur ses tuyaux et ses escaliers colorés ?', 'Le Centre Pompidou', 'Le musée d’Orsay', 'Le palais de Tokyo', 'La Fondation Cartier', 'Les couleurs codent les fonctions : bleu pour l’air, vert pour l’eau, jaune pour l’électricité.'],
  ['Quel château bavarois bâti pour Louis II a inspiré les châteaux de contes de fées ?', 'Neuschwanstein', 'Le château de Schönbrunn', 'La forteresse de Wartburg', 'Le château de Heidelberg', 'Le roi n’y a séjourné que quelques mois avant sa mort, en 1886.'],
  ['Quelle tour de Dubaï est le plus haut bâtiment du monde depuis 2010 ?', 'Le Burj Khalifa', 'La tour Taipei 101', 'La Shanghai Tower', 'La tour Willis', 'Elle dépasse 828 mètres, soit près du double de l’Empire State Building.'],
  ['Quelle formule de trois mots résume l’architecture moderne selon Mies van der Rohe ?', '« Less is more »', '« Form follows function »', '« Ornament is crime »', '« Small is beautiful »', 'Il l’appliquait à des bâtiments d’acier et de verre réduits à leur ossature.'],
  ['Quelle ville lorraine a donné son nom à une école de l’Art nouveau, verrerie et mobilier ?', 'Nancy', 'Metz', 'Reims', 'Épinal', 'Verriers et ébénistes y ont couvert vases et meubles de motifs de plantes.'],
  ['Quel monument parisien abrite les tombeaux des grands personnages de la République ?', 'Le Panthéon', 'Les Invalides', 'La Madeleine', 'Le Val-de-Grâce', 'Marie Curie y est entrée en 1995, première femme honorée pour son œuvre.'],
  ['Quel palais londonien accueille les débats des Communes et des Lords ?', 'Le palais de Westminster', 'Le palais de Buckingham', 'Le palais de Kensington', 'Le palais de Hampton Court', 'Sa tour de l’horloge, rebaptisée tour Elizabeth, abrite la cloche Big Ben.'],
  ['Quel pont de Prague bordé de statues baroques franchit la Vltava ?', 'Le pont Charles', 'Le pont des Chaînes', 'Le pont Saint-Ange', 'Le pont des Soupirs', 'Les trente statues visibles aujourd’hui sont pour la plupart des copies.'],

  // ---- Regarder l’œuvre plutôt que nommer son auteur ----------------------
  ['Quel détail du visage manque à La Joconde ?', 'Les sourcils', 'Les cils', 'La bouche', 'Le menton', 'Le tableau est peint sur un panneau de bois de peuplier de moins de 80 centimètres de haut.'],
  ['Quelle immense fresque Michel-Ange a-t-il peinte au-dessus de l’autel de la chapelle Sixtine ?', 'Le Jugement dernier', 'La Création d’Adam', 'La Pietà', 'L’Annonciation', 'Peinte vingt-cinq ans après la voûte, elle compte plus de trois cents figures.'],
  ['Avec quel outil le sculpteur frappe-t-il pour tailler un bloc de pierre ?', 'Un maillet', 'Une lime', 'Une truelle', 'Une gouge', 'Il le tient d’une main et pousse le ciseau de l’autre, sans jamais frapper la pierre directement.'],
  ['Quel couvre-chef porte l’homme anonyme qui revient dans les tableaux de René Magritte ?', 'Le chapeau melon', 'Le béret', 'Le haut-de-forme', 'La casquette', 'Le peintre le portait lui-même et refusait qu’on y lise un autoportrait.'],
  ['De quelle couleur est le ciel qui domine Le Cri d’Edvard Munch ?', 'Rouge orangé', 'Bleu nuit', 'Vert pâle', 'Gris argenté', 'Le peintre disait avoir vu le ciel devenir « rouge sang » lors d’une promenade à Oslo.'],
  ['Quelle pierre bleue broyée coûtait plus cher que l’or dans les ateliers de la Renaissance ?', 'Le lapis-lazuli', 'La turquoise', 'L’améthyste', 'Le jaspe', 'Importée d’Afghanistan, elle était réservée au manteau de la Vierge.'],
  ['Comment appelle-t-on un tableau composé de trois panneaux articulés ?', 'Un triptyque', 'Un diptyque', 'Un polyptyque', 'Un cartouche', 'Les volets latéraux se refermaient sur le panneau central hors des jours de fête.'],
  ['Dans quelle ville flamande peut-on visiter la maison et l’atelier de Rubens ?', 'Anvers', 'Bruges', 'Malines', 'Louvain', 'Le peintre y employait des dizaines de collaborateurs pour ses grandes commandes.'],
  ['Combien de tableaux de Vermeer connaît-on aujourd’hui ?', 'Une trentaine', 'Une dizaine', 'Environ deux cents', 'Plus de mille', 'Sa production lente et sa mort à quarante-trois ans expliquent ce très petit nombre.'],
  ['Quelle couleur domine la série de fleurs peinte par Van Gogh pour décorer sa maison d’Arles ?', 'Le jaune', 'Le bleu', 'Le rouge', 'Le violet', 'Il préparait une chambre d’ami pour Gauguin, qu’il attendait comme un compagnon d’atelier.'],
  ['Quel marbre italien les sculpteurs de la Renaissance recherchaient-ils pour sa blancheur ?', 'Le marbre de Carrare', 'Le marbre de Vérone', 'Le marbre de Sienne', 'Le marbre de Naples', 'Michel-Ange allait choisir ses blocs lui-même dans les carrières de Toscane.'],
  ['Combien de convives Léonard de Vinci a-t-il rassemblés autour du Christ dans La Cène ?', 'Douze apôtres', 'Six apôtres', 'Vingt apôtres', 'Quatre évangélistes', 'Ils sont répartis en quatre groupes de trois, de part et d’autre de la table.'],
  ['Vers quel élément convergent les lignes d’une perspective en peinture ?', 'Le point de fuite', 'Le premier plan', 'La ligne d’horizon', 'Le cadre', 'La règle, formulée à Florence au XVe siècle, a transformé la peinture occidentale.'],
  ['Quel objet du quotidien Marcel Duchamp a-t-il exposé en 1917 comme une œuvre d’art ?', 'Un urinoir', 'Une roue de vélo', 'Un porte-bouteilles', 'Une pelle à neige', 'Il l’avait signé d’un faux nom, R. Mutt, et le comité d’exposition l’a écarté.'],

  // ---- Sculptures et lieux d’art que l’on a vus ---------------------------
  ['Quelle sculpture réfléchissante de Chicago est surnommée « le haricot » ?', 'Cloud Gate', 'Spiral Jetty', 'Angel of the North', 'The Gates', 'Ses plaques d’acier polies ne laissent apparaître aucune soudure.'],
  ['Quelle fontaine mécanique et colorée voisine le Centre Pompidou à Paris ?', 'La fontaine Stravinsky', 'La fontaine Médicis', 'La fontaine des Innocents', 'La fontaine Saint-Michel', 'Ses machines qui crachent l’eau ont été conçues avec Niki de Saint Phalle.'],
  ['Comment appelle-t-on la petite étiquette qui donne le titre et l’auteur d’une œuvre exposée ?', 'Le cartel', 'Le colophon', 'Le socle', 'Le passe-partout', 'Il porte aussi la date, la technique et le nom du donateur ou du prêteur.'],
  ['Comment appelle-t-on la personne qui conçoit et organise une exposition ?', 'Un commissaire d’exposition', 'Un galeriste', 'Un régisseur', 'Un médiateur', 'Il choisit les œuvres, leur ordre et le texte qui les accompagne.'],
  ['Où un musée conserve-t-il les œuvres qu’il n’expose pas ?', 'Dans ses réserves', 'Dans ses ateliers', 'Dans sa galerie', 'Dans son cabinet', 'La plupart des grands musées n’exposent qu’une petite part de leurs collections.'],
  ['Comment appelle-t-on l’inventaire de toutes les œuvres connues d’un artiste ?', 'Un catalogue raisonné', 'Un cartel', 'Un répertoire', 'Un florilège', 'Une œuvre absente de ce recensement devient très difficile à vendre.'],
  ['Quelle bibliothèque reçoit un exemplaire de chaque livre publié en France ?', 'La Bibliothèque nationale', 'La Sorbonne', 'La bibliothèque Mazarine', 'L’Institut de France', 'Cette obligation de dépôt remonte à une ordonnance de François Ier, en 1537.'],

  // ---- Personnages et œuvres de la littérature ---------------------------
  ['Dans quel roman Edmond Dantès s’évade du château d’If pour préparer sa vengeance ?', 'Le Comte de Monte-Cristo', 'Les Trois Mousquetaires', 'Vingt Ans après', 'La Reine Margot', 'Il devient immensément riche grâce à un trésor caché sur une île de Méditerranée.'],
  ['Quel personnage de Molière se fait passer pour un dévot afin de s’installer chez Orgon ?', 'Tartuffe', 'Harpagon', 'Scapin', 'Dom Juan', 'La pièce fut interdite cinq ans avant d’être enfin jouée publiquement.'],
  ['Quelle héroïne de Tolstoï se jette sous un train à la fin du roman ?', 'Anna Karénine', 'Nathacha Rostov', 'Emma Bovary', 'Nana', 'Le romancier alterne son destin avec la vie rurale du propriétaire Lévine.'],
  ['Dans quel roman de Stevenson un médecin respectable se transforme en criminel ?', 'Docteur Jekyll et M. Hyde', 'L’Île au trésor', 'Le Maître de Ballantrae', 'Enlevé !', 'L’auteur affirmait avoir trouvé l’intrigue dans un cauchemar.'],
  ['Dans quel roman d’Orwell les bêtes d’une exploitation chassent leur maître avant que les cochons règnent ?', 'La Ferme des animaux', '1984', 'Le Meilleur des mondes', 'Fahrenheit 451', 'La devise finale devient : « tous les animaux sont égaux, mais certains le sont plus que d’autres ».'],
  ['Dans quel roman de Zola la blanchisseuse Gervaise sombre dans la misère et l’alcool ?', 'L’Assommoir', 'Germinal', 'Nana', 'La Bête humaine', 'Le titre désigne le débit de boisson où les ouvriers du quartier s’étourdissent.'],
  ['Dans quel roman de Dostoïevski l’étudiant Raskolnikov assassine une vieille usurière ?', 'Crime et Châtiment', 'Les Frères Karamazov', 'L’Idiot', 'Les Démons', 'Le récit suit moins l’enquête que l’effondrement intérieur du meurtrier.'],
  ['Quel écuyer accompagne Don Quichotte sur son âne ?', 'Sancho Pança', 'Rossinante', 'Dulcinée', 'Cervantès', 'Il rêve de gouverner une île en récompense de ses services.'],
  ['Dans quel conte de Voltaire le héros conclut qu’il faut cultiver son jardin ?', 'Candide', 'Zadig', 'Micromégas', 'L’Ingénu', 'Le personnage traverse guerres, séismes et bûchers avant cette conclusion très sobre.'],
  ['En combien de volumes se déploie À la recherche du temps perdu ?', 'Sept', 'Trois', 'Douze', 'Vingt', 'Les trois derniers ont paru après la mort de leur auteur, en 1922.'],
  ['Combien de vers compte un sonnet ?', 'Quatorze', 'Huit', 'Douze', 'Vingt', 'Deux quatrains suivis de deux tercets en forment la disposition la plus courante.'],
  ['Quel vers de douze syllabes domine la poésie classique française ?', 'L’alexandrin', 'L’octosyllabe', 'Le décasyllabe', 'L’hendécasyllabe', 'Une césure le coupe le plus souvent en deux moitiés de six syllabes.'],
  ['Comment appelle-t-on un poème très court de trois vers venu du Japon ?', 'Un haïku', 'Un tanka', 'Un rondeau', 'Un madrigal', 'Il saisit une saison ou un instant en dix-sept syllabes réparties en 5, 7 et 5.'],
  ['Comment appelle-t-on la première phrase d’un roman ?', 'L’incipit', 'Le prologue', 'L’exergue', 'La préface', '« Aujourd’hui, maman est morte » est l’un des plus commentés de la littérature française.'],

  // ---- Bande dessinée --------------------------------------------------
  ['Quel ennemi juré revient dans presque tous les albums de Blake et Mortimer ?', 'Le colonel Olrik', 'Le professeur Septimus', 'Lady Rowana', 'Le docteur Fu Manchu', 'Il change de camp et d’identité au fil des albums sans jamais disparaître.'],
  ['Quelle série de bande dessinée suit un amnésique tatoué d’un chiffre romain ?', 'XIII', 'Largo Winch', 'Alpha', 'IR$', 'Jean Van Hamme et William Vance l’ont lancée en 1984.'],
  ['Combien d’albums de Tintin Hergé a-t-il achevés ?', 'Vingt-trois', 'Douze', 'Trente-quatre', 'Quarante-huit', 'Un vingt-quatrième, resté inachevé, a été publié tel quel après sa mort.'],
  ['Quelle marque de whisky le capitaine Haddock consomme-t-il dans les albums de Tintin ?', 'Le Loch Lomond', 'Le Glenfiddich', 'Le Old Crow', 'Le Bell’s', 'La marque, imaginaire à l’époque, existe réellement depuis les années 1960.'],
  ['Quel visiteur de Gaston Lagaffe ne parvient jamais à faire signer ses contrats ?', 'Monsieur De Mesmaeker', 'Monsieur Boulier', 'Le prunier Longtarin', 'Monsieur Dupuis', 'Les contrats finissent presque toujours en avion de papier ou en confettis.'],
  ['Quels deux gamins de Bruxelles Hergé a-t-il créés en 1930 ?', 'Quick et Flupke', 'Boule et Bill', 'Bob et Bobette', 'Sylvain et Sylvette', 'Leurs très courtes histoires se déroulent dans les rues des Marolles.'],
  ['Dans quel journal de bande dessinée Astérix est-il apparu pour la première fois en 1959 ?', 'Pilote', 'Spirou', 'Tintin', 'Vaillant', 'Le magazine avait été fondé la même année par René Goscinny et ses associés.'],
  ['Dans quel pays imaginaire d’Amérique du Sud Spirou rencontre-t-il le Marsupilami ?', 'La Palombie', 'La Sylvanie', 'Le Bordurie', 'La Syldavie', 'La jungle de ce pays inventé sert de décor à plusieurs albums de Franquin.'],

  // ---- Danse, théâtre, métiers de la scène -------------------------------
  ['Comment appelle-t-on les chaussons à bout rigide des danseuses classiques ?', 'Les pointes', 'Les demi-pointes', 'Les claquettes', 'Les brodequins', 'Le bout est durci par des couches de toile et de colle, et s’use en quelques représentations.'],
  ['Comment appelle-t-on le saut où le danseur croise rapidement les jambes en l’air ?', 'Un entrechat', 'Un jeté', 'Un plié', 'Un fouetté', 'On compte les croisements : entrechat quatre, six, parfois huit chez les virtuoses.'],
  ['Quelle danse de couple née dans les faubourgs de Buenos Aires se danse joue contre joue ?', 'Le tango', 'La rumba', 'Le paso doble', 'Le fandango', 'Le bandonéon, arrivé d’Allemagne, en est devenu l’instrument emblématique.'],
  ['Comment appelle-t-on le texte qu’un acteur dit seul en scène ?', 'Un monologue', 'Un aparté', 'Une réplique', 'Une didascalie', 'Quand il s’adresse au public par-dessus l’action, on parle plutôt d’aparté.'],
  ['Que se souhaitent traditionnellement les comédiens avant d’entrer en scène ?', '« Merde ! »', '« Bonne chance ! »', '« Bon vent ! »', '« Rideau ! »', 'La superstition remonte au temps où le succès se mesurait au crottin laissé par les fiacres.'],
  ['Combien d’actes compte traditionnellement une tragédie classique française ?', 'Cinq', 'Deux', 'Trois', 'Sept', 'La règle des trois unités — action, lieu, temps — encadrait aussi ce découpage.'],

  // ---- Objets et images entrés dans le quotidien -------------------------
  ['Quelle police de caractères suisse de 1957 est devenue l’une des plus utilisées au monde ?', 'L’Helvetica', 'Le Times New Roman', 'Le Futura', 'Le Baskerville', 'Les signalisations d’aéroports et de métros l’ont répandue sur toute la planète.'],
  ['Quel logo dessiné en 1977 associe un cœur rouge aux initiales d’une ville américaine ?', '« I ♥ NY »', '« Keep calm »', '« Just do it »', '« Think different »', 'Son auteur l’a croqué au crayon rouge dans un taxi et n’a rien touché pour ce travail.'],
];

export const ART_GRAND_PUBLIC_ADULTE_02: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `art_adulte_grand_public_02_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art' as const,
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

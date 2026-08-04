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
 * Reprise éditoriale du niveau ado.
 *
 * Le niveau ado n'avait jamais été relu : l'audit ne lui imposait qu'une seule
 * règle (ne pas recopier la banque enfant), là où le niveau adulte en compte une
 * douzaine. Les lots générés avaient donc laissé passer un défaut de forme
 * massif — la carte qui transforme un sujet culturel en loterie de quatre noms
 * propres, où celui qui ne sait pas ne peut rien déduire :
 *
 *     « Quelle infirmière britannique... ? » → Barton / Cavell / Curie / Nightingale
 *     « Comment s'appelle l'ancien forçat des Misérables ? » → Javert / Marius /
 *       Thénardier / Jean Valjean
 *
 * Le parti pris de cette reprise n'est pas de retirer les sujets exigeants :
 * Hugo, Carmen ou Tchaïkovski restent au programme. C'est de **changer l'angle**
 * pour qu'un chemin de raisonnement existe. On demande donc ce que Jean Valjean
 * a volé plutôt que son nom, dans quel pays se déroule Carmen plutôt que son
 * compositeur, la position du Penseur plutôt que son sculpteur. Le joueur
 * apprend le même nom — il le lit dans l'énoncé — mais il peut jouer.
 *
 * Cible : jouable vers dix à douze ans, en gardant une vraie marche au-dessus du
 * niveau enfant. Les cartes conservent l'identifiant de celle qu'elles
 * remplacent, si bien que le volume des banques et l'invariant de 135 cartes ado
 * par catégorie restent inchangés.
 */
const REPLACEMENTS: Replacement[] = [
  // --- Art : peinture et sculpture ------------------------------------------
  // Les maîtres anciens servaient de loterie à quatre noms. On garde l'œuvre et
  // on interroge ce que l'on peut voir ou déduire d'elle.
  ['art_137', 'Quel sentiment le tableau Le Cri, d’Edvard Munch, cherche-t-il à faire ressentir ?', 'L’angoisse', 'La joie', 'L’ennui', 'La fierté', 'Munch a peint plusieurs versions de cette silhouette qui se bouche les oreilles sous un ciel orange.'],
  ['art_138', 'De quel pays venait Johannes Vermeer, le peintre de La Jeune Fille à la perle ?', 'Les Pays-Bas', 'L’Italie', 'L’Espagne', 'La Grèce', 'Vermeer a passé toute sa vie à Delft et n’a laissé qu’une trentaine de tableaux.'],
  ['art_146', 'Dans quelle position Auguste Rodin a-t-il représenté Le Penseur ?', 'Assis, le menton appuyé sur la main', 'Debout, les bras levés au ciel', 'Couché sur le côté', 'À genoux, la tête baissée', 'Cette sculpture devait d’abord surplomber une grande porte inspirée de L’Enfer de Dante.'],
  ['art_147', 'Dans La Naissance de Vénus, de Botticelli, sur quoi la déesse se tient-elle debout ?', 'Un grand coquillage', 'Un rocher', 'Un nuage', 'Une barque', 'Le tableau a été peint à Florence vers 1485 pour la famille Médicis.'],
  ['art_238', 'Quel métal précieux, posé en fines feuilles, fait scintiller le tableau Le Baiser de Gustav Klimt ?', 'L’or', 'L’argent', 'Le cuivre', 'Le bronze', 'Klimt a utilisé l’or pendant plusieurs années, après avoir vu les mosaïques de Ravenne.'],
  ['art_239', 'Que tient la statue de la Liberté dans sa main levée ?', 'Une torche', 'Une épée', 'Un drapeau', 'Une couronne', 'Son autre main serre une tablette portant la date du 4 juillet 1776.'],
  ['art_249', 'Que manque-t-il à la célèbre Vénus de Milo exposée au Louvre ?', 'Les deux bras', 'La tête', 'Les jambes', 'Le nez', 'La statue a été découverte en 1820 sur l’île grecque de Milo, déjà mutilée.'],

  // --- Art : littérature ----------------------------------------------------
  // On interroge l'histoire plutôt que le nom de l'auteur ou du personnage.
  ['art_156', 'Pour quel vol Jean Valjean est-il envoyé au bagne, au début des Misérables ?', 'Un morceau de pain', 'Un cheval', 'Une bourse d’or', 'Une paire de chandeliers', 'Ce vol lui coûte cinq ans de bagne, portés à dix-neuf après ses tentatives d’évasion.'],
  ['art_158', 'Dans Le Tour du monde en 80 jours, quel animal Phileas Fogg achète-t-il pour traverser une partie de l’Inde ?', 'Un éléphant', 'Un chameau', 'Un cheval de course', 'Un buffle', 'Jules Verne s’était documenté sur les horaires réels des paquebots et des trains de son époque.'],
  ['art_160', 'Quelle devise résume l’amitié des Trois Mousquetaires ?', '« Un pour tous, tous pour un »', '« À nous la victoire »', '« L’honneur avant tout »', '« Toujours plus haut »', 'Alexandre Dumas s’est inspiré d’un vrai mousquetaire gascon, Charles de Batz-Castelmore.'],
  ['art_204', 'Dans L’Avare de Molière, où Harpagon cache-t-il son argent ?', 'Dans une cassette enterrée au jardin', 'Sous son lit', 'Dans la cave d’un voisin', 'Dans un coffre à la banque', 'Quand la cassette disparaît, il hurle « Ma cassette ! » dans une scène restée célèbre.'],
  ['art_206', 'Au théâtre, comment appelle-t-on le texte qu’un personnage se dit à lui-même, seul sur scène ?', 'Un monologue', 'Un dialogue', 'Une réplique', 'Un entracte', 'Le monologue permet au public d’entendre les hésitations d’un personnage.'],
  ['art_208', 'Quel talent, autant que son épée, rend Cyrano de Bergerac redoutable ?', 'Son génie des mots et des vers', 'Sa force physique', 'Sa fortune', 'Ses talents de cavalier', 'Cyrano écrit en secret les lettres d’amour que Roxane croit recevoir d’un autre.'],
  ['art_210', 'Qu’est-ce qu’un recueil, comme Les Fleurs du mal de Baudelaire ?', 'Un livre qui rassemble des poèmes', 'Une pièce de théâtre en vers', 'Un roman en plusieurs tomes', 'Un carnet de notes de voyage', 'Les Fleurs du mal rassemble une centaine de poèmes publiés en 1857.'],
  ['art_211', 'Comment appelle-t-on, comme dans un célèbre poème de Jacques Prévert, un élève qui ne travaille pas à l’école ?', 'Un cancre', 'Un cuistre', 'Un bachelier', 'Un pion', 'Dans le poème, le cancre dit non de la tête mais dessine le visage du bonheur.'],
  ['art_212', 'Que découvre-t-on au dernier vers du Dormeur du val, à propos du jeune soldat étendu dans l’herbe ?', 'Qu’il est mort', 'Qu’il dort profondément', 'Qu’il s’est enfui', 'Qu’il chante', 'Rimbaud a écrit ce poème à seize ans, pendant la guerre de 1870.'],
  ['art_213', 'Comment appelle-t-on un récit court comme Le Horla, de Maupassant ?', 'Une nouvelle', 'Un roman', 'Une fable', 'Une tragédie', 'Une nouvelle se lit d’une traite et compte peu de personnages.'],
  ['art_215', 'Quel animal est le héros de Croc-Blanc, le roman de Jack London ?', 'Un chien-loup', 'Un ours', 'Un cheval', 'Un aigle', 'Jack London avait lui-même vécu la ruée vers l’or du Klondike, au Canada.'],
  ['art_217', 'Dans le roman de Mary Shelley, grâce à quoi le savant Frankenstein donne-t-il vie à sa créature ?', 'À l’électricité', 'À une potion magique', 'À une formule mathématique', 'À la lumière du soleil', 'Mary Shelley avait dix-huit ans quand elle a imaginé cette histoire au bord d’un lac suisse.'],
  ['art_221', 'Quelle particularité physique a le pirate Long John Silver, dans L’Île au trésor ?', 'Il n’a qu’une jambe', 'Il n’a qu’un œil', 'Il a un crochet à la place de la main', 'Il est bossu', 'Il se déplace avec une béquille, un perroquet sur l’épaule.'],
  ['art_222', 'Dans quelle ville se déroulent les aventures d’Oliver Twist, orphelin entraîné dans une bande de pickpockets ?', 'Londres', 'New York', 'Paris', 'Dublin', 'Charles Dickens avait lui-même travaillé en usine à douze ans.'],
  ['art_223', 'Comment appelle-t-on un livre dans lequel l’auteur raconte sa propre vie ?', 'Une autobiographie', 'Une biographie', 'Un roman policier', 'Un dictionnaire', 'Quand c’est quelqu’un d’autre qui raconte cette vie, on parle de biographie.'],
  ['art_227', 'Dans Hunger Games, que doivent faire les jeunes tirés au sort pour les Jeux ?', 'S’affronter jusqu’à ce qu’il n’en reste qu’un', 'Résoudre une série d’énigmes', 'Traverser un désert à pied', 'Gagner une course de chars', 'La série de Suzanne Collins compte trois tomes, tous adaptés au cinéma.'],
  ['art_229', 'Dans Le Club des Cinq, qui est le cinquième membre de la bande, aux côtés des quatre enfants ?', 'Le chien Dagobert', 'Un cousin plus âgé', 'Le garde champêtre', 'Une voisine', 'Enid Blyton a écrit vingt-et-un tomes de la série à partir de 1942.'],
  ['art_230', 'Pourquoi le héros du roman de Jules Renard est-il surnommé Poil de carotte ?', 'À cause de ses cheveux roux', 'Parce qu’il adore les carottes', 'Parce qu’il est très maigre', 'Parce qu’il travaille au potager', 'Le livre raconte l’enfance d’un garçon mal aimé par sa mère.'],

  // --- Art : musique --------------------------------------------------------
  // Les compositeurs classiques étaient la pire loterie du lot : quatre noms de
  // la même époque, indépartageables. On interroge l'œuvre elle-même.
  ['art_168', 'Quel instrument tient le rôle principal dans Les Quatre Saisons de Vivaldi ?', 'Le violon', 'Le piano', 'La flûte', 'L’orgue', 'Chaque saison est un concerto pour violon qui imite les oiseaux, l’orage ou le froid.'],
  ['art_170', 'Pendant quelle fête se déroule le ballet Casse-Noisette ?', 'Noël', 'Pâques', 'Le Nouvel An chinois', 'La fête nationale', 'L’histoire commence autour du sapin, la nuit où les jouets s’animent.'],
  ['art_171', 'De quel pays vient la danse qui a donné son nom au Boléro de Ravel ?', 'L’Espagne', 'L’Italie', 'La Russie', 'Le Brésil', 'Ravel répète la même mélodie du début à la fin, en ajoutant peu à peu tous les instruments.'],
  ['art_172', 'Dans quel pays se déroule l’opéra Carmen ?', 'L’Espagne', 'L’Italie', 'La Grèce', 'L’Autriche', 'L’action se passe à Séville, entre une manufacture de tabac et des arènes.'],
  ['art_174', 'Combien de symphonies Ludwig van Beethoven a-t-il composées ?', 'Neuf', 'Quatre', 'Quinze', 'Vingt-sept', 'La Neuvième se termine par l’Hymne à la joie, devenu l’hymne de l’Union européenne.'],
  ['art_255', 'Comment appelle-t-on la personne qui dirige un orchestre ?', 'Le chef d’orchestre', 'Le premier violon', 'Le compositeur', 'Le régisseur', 'Il donne le tempo et fait entrer chaque famille d’instruments au bon moment.'],
  ['art_257', 'Quelle danse à trois temps a fait la gloire des bals de Vienne ?', 'La valse', 'Le tango', 'Le flamenco', 'La samba', 'Le Beau Danube bleu, de Johann Strauss, en est la plus célèbre.'],
  ['art_258', 'Dans Le Carnaval des animaux, quel animal est évoqué par un violoncelle à la mélodie lente et glissante ?', 'Le cygne', 'Le lion', 'Le kangourou', 'L’éléphant', 'Le Cygne est devenu la page la plus jouée de l’œuvre de Camille Saint-Saëns.'],

  // --- Art : bande dessinée -------------------------------------------------
  // La BD franco-belge est le terrain le plus proche des enfants d'ici : on
  // interroge ce qu'ils ont sous les yeux, pas le nom du dessinateur.
  ['art_187', 'Chez les Schtroumpfs, à quoi reconnaît-on tout de suite le chef du village ?', 'À son bonnet et son pantalon rouges', 'À ses lunettes rondes', 'À sa très grande taille', 'À sa barbe noire', 'Les autres Schtroumpfs sont habillés de blanc ; Peyo les a créés en 1958.'],
  ['art_190', 'Comment appelle-t-on une bande dessinée venue du Japon ?', 'Un manga', 'Un comic', 'Un strip', 'Un fanzine', 'Les mangas se lisent traditionnellement de droite à gauche.'],
  ['art_262', 'Dans quelle langue la bande dessinée Bob et Bobette a-t-elle d’abord été publiée ?', 'En néerlandais', 'En français', 'En allemand', 'En anglais', 'Créée en Flandre en 1945 sous le titre Suske en Wiske, elle est l’une des BD les plus lues du pays.'],
  ['art_263', 'Quel est le juron favori du capitaine Haddock, dans les albums de Tintin ?', '« Mille millions de mille sabords ! »', '« Sacrebleu de sacrebleu ! »', '« Par tous les diables des mers ! »', '« Tonnerre de Zeus ! »', 'Hergé lui a inventé des centaines d’insultes, de « bachi-bouzouk » à « moule à gaufres ».'],
  ['art_264', 'Quelle est l’expression favorite de Titeuf, le héros de la BD de Zep ?', '« C’est pô juste ! »', '« Ça craint un max ! »', '« Oh la vache ! »', '« Tout roule ! »', 'Titeuf est né en 1992 sous le crayon du dessinateur suisse Zep.'],
  ['art_265', 'Quel est le métier de Tintin, dans les albums d’Hergé ?', 'Reporter', 'Policier', 'Médecin', 'Explorateur', 'On le voit pourtant très rarement écrire un article.'],

  // --- Cinéma ---------------------------------------------------------------
  // Le cinéma n'avait pas besoin d'être allégé partout : « qui est le père de
  // Luke Skywalker ? » ou « la véritable identité de Batman » se jouent très
  // bien à dix ans. Le défaut y était plus étroit — la distribution d'un film
  // d'avant 2000 servie comme quatre noms d'acteurs, les compositeurs de
  // musiques de film, et deux devinettes de millésime. On garde le film et on
  // interroge son histoire ou son image.
  ['cin_150', 'Dans Harry Potter, quelle matière le professeur Rogue enseigne-t-il à Poudlard ?', 'Les potions', 'La métamorphose', 'La divination', 'Le vol sur balai', 'Il rêve pourtant depuis toujours d’enseigner la défense contre les forces du Mal.'],
  ['cin_157', 'Quelle arme lumineuse les chevaliers Jedi manient-ils dans Star Wars ?', 'Le sabre laser', 'L’arc à plasma', 'Le fouet électrique', 'La lance à photons', 'Sa couleur indique souvent le camp : bleue ou verte chez les Jedi, rouge chez leurs ennemis.'],
  ['cin_183', 'Dans les films Marvel, qu’est-ce qui maintient Iron Man en vie et alimente son armure ?', 'Un réacteur dans sa poitrine', 'Un sérum injecté', 'Un marteau magique', 'Une morsure d’araignée', 'Tony Stark construit son premier réacteur en captivité, avec des pièces récupérées.'],
  ['cin_185', 'Dans le film Mon voisin Totoro, qu’est-ce que Totoro ?', 'Un gros esprit de la forêt', 'Un ours de cirque', 'Un robot abandonné', 'Un chat errant', 'Le studio Ghibli, au Japon, a fait de ce personnage son emblème.'],
  ['cin_191', 'Dans Retour vers le futur, quel véhicule sert de machine à voyager dans le temps ?', 'Une voiture DeLorean', 'Un vieux bus scolaire', 'Une moto', 'Un train à vapeur', 'Il lui faut atteindre 88 miles à l’heure pour effectuer le saut.'],
  ['cin_201', 'Quels deux accessoires reconnaît-on immédiatement chez Indiana Jones ?', 'Un chapeau et un fouet', 'Une cape et une épée', 'Un arc et un carquois', 'Des lunettes et une canne', 'Son métier officiel est professeur d’archéologie.'],
  ['cin_204', 'Dans Matrix, entre quelles deux pilules le héros doit-il choisir ?', 'La rouge et la bleue', 'La noire et la blanche', 'La verte et la jaune', 'La dorée et l’argentée', 'L’une fait découvrir la vérité, l’autre ramène à la vie ordinaire.'],
  ['cin_208', 'Quelle arme Katniss maîtrise-t-elle dans Hunger Games ?', 'L’arc', 'L’épée', 'La lance', 'Le fouet', 'Elle a appris à chasser pour nourrir sa famille avant d’être choisie pour les Jeux.'],
  ['cin_215', 'Dans Forrest Gump, quelle activité le héros pratique-t-il pendant des années à travers les États-Unis ?', 'La course à pied', 'La natation', 'Le vélo', 'L’escalade', 'Sa traversée du pays finit par lui attirer une foule de suiveurs.'],
  ['cin_237', 'Quel sport pratique Rocky Balboa ?', 'La boxe', 'Le catch', 'L’haltérophilie', 'Le judo', 'Son entraînement dans les rues de Philadelphie est resté une scène culte.'],
  ['cin_239', 'Qu’est-ce que le Terminator, dans le film qui porte son nom ?', 'Un robot venu du futur', 'Un extraterrestre', 'Un savant fou', 'Un soldat amnésique', 'Sous son apparence humaine se cache un squelette de métal.'],
  ['cin_241', 'Dans le film The Mask, que provoque le masque vert quand le héros le met ?', 'Il le transforme en personnage déchaîné', 'Il le rend invisible', 'Il lui fait lire les pensées', 'Il le fait rajeunir', 'Le film mêle acteurs réels et effets numériques, encore rares en 1994.'],
  ['cin_255', 'Dans Fantasia, quel rôle Mickey Mouse tient-il, entouré de balais qu’il n’arrive plus à arrêter ?', 'L’apprenti sorcier', 'Le chef d’orchestre', 'Le capitaine d’un navire', 'Le dompteur d’un cirque', 'La séquence illustre une musique de Paul Dukas, L’Apprenti sorcier.'],
  ['cin_259', 'Comment appelle-t-on la musique composée spécialement pour accompagner un film ?', 'La bande originale', 'Le générique', 'Le playback', 'Le doublage', 'Certains thèmes, comme celui de Star Wars, sont devenus plus connus que les films.'],
  ['cin_260', 'Dans Le Roi Lion, quel est le lien de parenté entre Simba et Mufasa ?', 'Mufasa est son père', 'Mufasa est son frère', 'Mufasa est son oncle', 'Mufasa est son grand-père', 'C’est son oncle Scar qui complote contre eux deux.'],
  ['cin_264', 'Dans la saga Mission : Impossible, comment les agents reçoivent-ils traditionnellement leurs ordres ?', 'Par un message qui s’autodétruit', 'Par une lettre cachetée', 'Par un télégramme', 'Par une annonce dans le journal', 'La formule « Ce message s’autodétruira dans cinq secondes » vient de la série des années 1960.'],
  ['cin_266', 'À quelle époque se déroule la comédie musicale Grease, avec ses blousons et ses grosses voitures américaines ?', 'Les années 1950', 'Les années 1920', 'Les années 1980', 'Les années 2000', 'Le film est sorti en 1978, vingt ans après l’époque qu’il met en scène.'],
  ['cin_267', 'Que vient apprendre l’héroïne de Dirty Dancing pendant ses vacances en famille ?', 'La danse', 'L’équitation', 'La voile', 'Le piano', 'Le porté final du film est devenu l’une des images les plus imitées du cinéma.'],

  // --- Histoire -------------------------------------------------------------
  // C'est la catégorie la plus délicate : l'histoire est faite de noms et de
  // dates. On garde donc les figures que l'école rend familières — Churchill,
  // Anne Frank, Mandela, Gagarine, Clovis — et on retire deux choses : les neuf
  // devinettes de millésime entre quatre années proches, et les figures que
  // rien ne permet de départager (cinq navigateurs de suite, quatre généraux
  // français, quatre rois médiévaux). L'événement reste, on interroge sa
  // substance plutôt que son année.
  ['his_136', 'Comment appelle-t-on les longs fossés creusés où les soldats vivaient et combattaient pendant la Première Guerre mondiale ?', 'Les tranchées', 'Les casemates', 'Les remparts', 'Les douves', 'Sur le front belge, l’armée inonda la plaine de l’Yser pour stopper l’avance allemande.'],
  ['his_139', 'Quel pays l’Allemagne a-t-elle envahi en 1939, déclenchant la Seconde Guerre mondiale en Europe ?', 'La Pologne', 'La Norvège', 'La Grèce', 'L’Italie', 'La France et le Royaume-Uni déclarèrent la guerre à l’Allemagne deux jours plus tard.'],
  ['his_157', 'Que séparait le mur de Berlin ?', 'Les deux moitiés de la ville, entre l’Est et l’Ouest', 'L’Allemagne et la Pologne', 'Deux quartiers religieux', 'La ville et son aéroport', 'Il fut construit en 1961 pour empêcher les habitants de l’Est de passer à l’Ouest.'],
  ['his_158', 'Que firent les Berlinois dans la nuit du 9 novembre 1989 ?', 'Ils abattirent le mur à coups de pioche', 'Ils élurent un nouveau maire', 'Ils fermèrent les frontières', 'Ils organisèrent un référendum', 'L’Allemagne fut officiellement réunifiée moins d’un an plus tard.'],
  ['his_165', 'Quel titre portait Nicolas II, renversé par la révolution russe de 1917 ?', 'Tsar', 'Sultan', 'Kaiser', 'Doge', 'Il fut le dernier souverain de l’empire russe.'],
  ['his_168', 'De quel pays les treize colonies d’Amérique ont-elles proclamé leur indépendance en 1776 ?', 'La Grande-Bretagne', 'L’Espagne', 'La France', 'Les Pays-Bas', 'La France soutint les insurgés américains contre les troupes britanniques.'],
  ['his_196', 'Dans quelle cathédrale Napoléon Bonaparte s’est-il fait sacrer empereur en 1804 ?', 'Notre-Dame de Paris', 'La cathédrale de Reims', 'La basilique Saint-Denis', 'La cathédrale de Chartres', 'Rompant avec la tradition des rois sacrés à Reims, il posa lui-même la couronne sur sa tête.'],
  ['his_203', 'De quel pays le Congo était-il la colonie avant son indépendance en 1960 ?', 'La Belgique', 'La France', 'Le Portugal', 'Le Royaume-Uni', 'Le Congo devint indépendant le 30 juin 1960.'],
  ['his_221', 'Quel nom porte aujourd’hui la ville autrefois appelée Constantinople ?', 'Istanbul', 'Athènes', 'Ankara', 'Le Caire', 'Sa chute en 1453 marque souvent la fin du Moyen Âge.'],
  ['his_171', 'Que cherchaient les navigateurs portugais en contournant l’Afrique au XVe siècle ?', 'La route maritime des épices vers l’Inde', 'Un passage vers le pôle Nord', 'De nouvelles terres à cultiver', 'Une route vers l’Australie', 'Les épices valaient alors presque leur poids en or en Europe.'],
  ['his_173', 'Quel continent les navigateurs européens ont-ils cartographié en dernier, au XVIIIe siècle ?', 'L’Australie', 'L’Afrique', 'L’Asie', 'L’Amérique du Sud', 'James Cook en cartographia la côte est lors de ses voyages dans le Pacifique.'],
  ['his_174', 'D’où vient le nom du continent américain ?', 'Du prénom du navigateur Amerigo Vespucci', 'D’un mot amérindien', 'Du nom d’un roi espagnol', 'Du latin « terre nouvelle »', 'Vespucci comprit le premier qu’il s’agissait d’un continent inconnu, et non des Indes.'],
  ['his_148', 'Dans quelle ville d’eaux du centre de la France s’installa, en 1940, le régime qui collabora avec l’Allemagne ?', 'Vichy', 'Lyon', 'Bordeaux', 'Tours', 'Le maréchal Pétain y dirigea l’État français jusqu’en 1944.'],
  ['his_149', 'Comment appelait-on, en France, les mouvements clandestins qui luttaient contre l’occupation allemande ?', 'La Résistance', 'La Milice', 'La Légion', 'La Garde nationale', 'Jean Moulin unifia ces mouvements avant d’être arrêté en 1943.'],
  ['his_201', 'Que fit adopter Victor Schoelcher en 1848, comme sous-secrétaire d’État aux colonies ?', 'L’abolition de l’esclavage', 'La gratuité de l’école', 'La liberté de la presse', 'Le droit de grève', 'Le décret fut signé le 27 avril 1848.'],
  ['his_200', 'Quelle sorte de bataille fut Trafalgar, en 1805 ?', 'Une bataille navale', 'Un siège de ville', 'Une bataille de cavalerie', 'Une guerre de tranchées', 'La défaite de la flotte franco-espagnole mit fin au projet d’invasion de l’Angleterre.'],
  ['his_187', 'Quelle langue François Ier imposa-t-il en 1539 pour remplacer le latin dans les actes officiels ?', 'Le français', 'L’italien', 'L’occitan', 'Le breton', 'L’ordonnance de Villers-Cotterêts fit du français la langue de l’administration.'],
  ['his_213', 'Quelle religion, longtemps persécutée, fut autorisée dans l’Empire romain au début du IVe siècle ?', 'Le christianisme', 'L’islam', 'Le bouddhisme', 'L’hindouisme', 'L’empereur Constantin mit fin aux persécutions et se convertit lui-même.'],
  ['his_217', 'Quel empereur, couronné en l’an 800, régna sur un vaste empire depuis Aix-la-Chapelle ?', 'Charlemagne', 'Clovis', 'Napoléon', 'Jules César', 'Sa capitale se trouve aujourd’hui en Allemagne, tout près de la frontière belge.'],
  ['his_220', 'Que fit construire Philippe Auguste à Paris, qui devint plus tard un palais puis un musée ?', 'Le Louvre', 'Notre-Dame', 'Les Invalides', 'Le Panthéon', 'La forteresse médiévale est encore visible dans les sous-sols du musée.'],
  ['his_208', 'Quel animal fut envoyé dans l’espace avant les premiers êtres humains ?', 'Une chienne', 'Un chat', 'Un cheval', 'Un dauphin', 'La chienne Laïka fut lancée par l’URSS en 1957.'],

  // La carte de la capture d'écran, et les deux figures médicales que rien ne
  // permettait de départager. Fleming faisait de surcroît doublon avec la banque
  // ado de sciences, qui pose déjà la découverte de la pénicilline.
  ['his_265', 'Que réclama l’infirmière Florence Nightingale pour faire chuter la mortalité dans les hôpitaux militaires ?', 'De l’hygiène et de l’air pur dans les salles', 'Des uniformes plus élégants', 'Des horaires de visite plus larges', 'Des lits individuels en fer', 'Ses relevés chiffrés convainquirent l’armée britannique de réformer ses hôpitaux.'],
  ['his_226', 'Contre quelle maladie le tout premier vaccin de l’histoire a-t-il été mis au point ?', 'La variole', 'La grippe', 'La tuberculose', 'Le tétanos', 'Edward Jenner remarqua que les vachers ayant attrapé la variole des vaches ne tombaient pas malades.'],
  ['his_237', 'Quel événement de 1830 a donné naissance à la Belgique indépendante ?', 'Une révolution contre le roi des Pays-Bas', 'Un mariage royal', 'Un traité signé à Vienne', 'Une guerre contre la France', 'Les combats du parc de Bruxelles menèrent à une indépendance reconnue en 1839.'],

  // Cinéma : trois dernières loteries, dont Tolkien qui faisait doublon avec la
  // banque ado d'art.
  ['cin_146', 'Dans quelle maison de Poudlard Harry Potter et ses amis sont-ils répartis ?', 'Gryffondor', 'Serpentard', 'Poufsouffle', 'Serdaigle', 'Le Choixpeau magique hésite pourtant à envoyer Harry chez Serpentard.'],
  ['cin_163', 'Où l’anneau doit-il être jeté pour être détruit, dans Le Seigneur des Anneaux ?', 'Dans les feux de la Montagne du Destin', 'Au fond de la Grande Mer', 'Dans les mines de la Moria', 'Sous les racines de l’Arbre blanc', 'Frodon et Sam mettent trois tomes à y parvenir.'],
  ['cin_164', 'Dans quel pays la trilogie du Seigneur des Anneaux a-t-elle été tournée ?', 'La Nouvelle-Zélande', 'L’Irlande', 'La Norvège', 'Le Canada', 'Ses paysages en ont fait une destination touristique majeure.'],

  // --- Dernières devinettes de millésime ------------------------------------
  // Ces sept cartes fermaient la liste des tirages entre quatre années voisines,
  // toutes catégories confondues. L'année passe dans l'énoncé, la substance de
  // l'événement devient la question.
  ['his_249', 'Quel droit les femmes françaises ont-elles obtenu en 1944, après en avoir été longtemps écartées ?', 'Le droit de vote', 'Le droit de travailler', 'Le droit d’aller à l’école', 'Le droit d’hériter', 'Elles votèrent pour la première fois aux élections municipales de 1945.'],
  ['his_251', 'En quoi l’URSS s’est-elle transformée en cessant d’exister, fin 1991 ?', 'En une quinzaine de pays indépendants', 'En deux États rivaux', 'En une monarchie', 'En une colonie chinoise', 'La Russie est le plus vaste des États nés de cette dissolution.'],
  ['his_263', 'Que cherchaient les dizaines de milliers de personnes parties en Californie à partir de 1848 ?', 'De l’or', 'Du pétrole', 'Des diamants', 'Des terres à blé', 'San Francisco passa de mille à vingt-cinq mille habitants en deux ans.'],
  ['spo_137', 'Contre quelle équipe la France a-t-elle gagné la finale de la Coupe du monde de football en 1998 ?', 'Le Brésil', 'L’Italie', 'L’Allemagne', 'L’Argentine', 'Zinédine Zidane marqua deux buts de la tête au Stade de France.'],
  ['spo_166', 'Dans quel sport le Français Victor Wembanyama s’est-il imposé aux États-Unis ?', 'Le basket-ball', 'Le football américain', 'Le hockey sur glace', 'Le baseball', 'Sa très grande taille en fait l’un des joueurs les plus surveillés de la NBA.'],
  ['spo_198', 'Pourquoi les Jeux olympiques de Tokyo, prévus en 2020, ont-ils été reportés d’un an ?', 'À cause de la pandémie de Covid-19', 'À cause d’un tremblement de terre', 'À cause d’un boycott', 'À cause de travaux inachevés', 'C’était le premier report de Jeux olympiques en temps de paix.'],
  ['pop_172', 'Qu’est-ce qui rendait le jeu Pokémon GO différent des jeux vidéo classiques ?', 'Il fallait se déplacer dehors pour jouer', 'Il se jouait uniquement à deux', 'Il n’avait aucune image', 'Il exigeait une console spéciale', 'Sorti en 2016, il utilise la réalité augmentée et la position du téléphone.'],

  // --- Cartes d'attribution : « qui a fait cette œuvre ? » -------------------
  // Forme la plus pure du défaut, et la seule qui n'offre aucune prise : l'énoncé
  // ne dit rien de la personne, seulement ce qu'elle a produit. On sait qui a
  // composé, ou l'on tire au sort entre quatre contemporains.
  //
  // Quatre cartes d'attribution restent permises par catégorie, réservées aux
  // signatures que la maison rend familières — et de préférence belges : Magritte,
  // Morris, Franquin, Brel, Simenon, Uderzo. Les vingt-et-une suivantes basculent
  // vers l'œuvre elle-même.

  // Art
  ['art_136', 'Que représente le premier plan de La Nuit étoilée, sous le ciel tourbillonnant de Van Gogh ?', 'Un village avec un clocher', 'Une plage déserte', 'Une gare', 'Un port de pêche', 'Van Gogh l’a peinte depuis sa chambre d’hôpital, à Saint-Rémy-de-Provence.'],
  ['art_139', 'Qu’ont de particulier les couleurs de Guernica, la grande toile de Picasso ?', 'Il n’y a que du noir, du blanc et du gris', 'Il n’y a que du rouge', 'Les couleurs sont très vives', 'La toile est dorée à la feuille', 'Picasso l’a peinte après le bombardement d’une ville basque, en 1937.'],
  ['art_144', 'Dans quelle position Michel-Ange a-t-il dû travailler pour peindre le plafond de la chapelle Sixtine ?', 'Couché sur un échafaudage, les bras en l’air', 'Assis sur un tabouret', 'Debout sur le sol', 'Suspendu par des cordes', 'Le chantier lui prit quatre ans et lui abîma durablement le cou.'],
  ['art_145', 'Quelle arme le David de Michel-Ange tient-il, prêt à affronter Goliath ?', 'Une fronde', 'Une épée', 'Une lance', 'Un arc', 'La statue mesure plus de cinq mètres et se visite à Florence.'],
  ['art_150', 'Qu’a de très inhabituel le chantier de la Sagrada Família, à Barcelone ?', 'Il n’est toujours pas terminé après plus d’un siècle', 'Il a été bâti en un an', 'Il est entièrement souterrain', 'Il a été déplacé pierre par pierre', 'Commencé en 1882, il est financé par les visites.'],
  ['art_159', 'Dans quel pays se déroulent les aventures des Trois Mousquetaires ?', 'En France', 'En Angleterre', 'En Espagne', 'En Italie', 'Alexandre Dumas situe l’intrigue sous le règne de Louis XIII.'],
  ['art_161', 'Dans quelle rue de Londres Sherlock Holmes a-t-il son appartement ?', 'Baker Street', 'Oxford Street', 'Abbey Road', 'Downing Street', 'Un musée s’y visite aujourd’hui, au numéro 221B.'],
  ['art_163', 'Pourquoi Roméo et Juliette ne peuvent-ils pas s’aimer librement ?', 'Leurs deux familles se haïssent', 'Ils vivent dans deux pays différents', 'Juliette est déjà mariée', 'Roméo est banni depuis l’enfance', 'Shakespeare situe la pièce à Vérone, en Italie.'],
  ['art_165', 'En combien de tomes Le Seigneur des anneaux a-t-il été publié ?', 'Trois', 'Un', 'Cinq', 'Sept', 'Tolkien l’avait pourtant écrit comme un seul livre, découpé par son éditeur.'],
  ['art_169', 'Qu’est-ce qu’un opéra, comme La Flûte enchantée ?', 'Une pièce entièrement chantée, accompagnée d’un orchestre', 'Un concert de piano seul', 'Un ballet sans musique', 'Une pièce de théâtre parlée', 'Mozart y mêle le chant, l’orchestre et de vraies machines de scène.'],

  // Popculture
  ['pop_144', 'Que cherchent les héros de Dragon Ball en parcourant le monde ?', 'Sept boules de cristal', 'Sept épées sacrées', 'Sept parchemins', 'Sept pierres de lune', 'Réunies, elles invoquent un dragon qui exauce un vœu.'],
  ['pop_155', 'Que deviennent les parents de Chihiro au début du Voyage de Chihiro ?', 'Ils sont transformés en cochons', 'Ils sont enlevés par un dragon', 'Ils rajeunissent', 'Ils deviennent invisibles', 'Le film du studio Ghibli a reçu l’Oscar du meilleur film d’animation.'],
  ['pop_162', 'Que cherche Luffy, le héros de One Piece, en parcourant les mers ?', 'Le trésor du roi des pirates', 'Une île volante', 'Un dragon endormi', 'Une carte du monde perdue', 'Le manga d’Eiichiro Oda dépasse la centaine de tomes.'],
  ['pop_165', 'Quel est le principe du mode le plus joué de Fortnite ?', 'Cent joueurs s’affrontent jusqu’au dernier survivant', 'Deux équipes se passent un ballon', 'On bâtit une ville en coopération', 'On résout des énigmes à deux', 'Ses concerts virtuels ont réuni des dizaines de millions de joueurs.'],
  ['pop_167', 'De quoi le monde de Minecraft est-il entièrement fait ?', 'De blocs cubiques', 'De sphères', 'De pixels plats', 'De triangles', 'C’est le jeu vidéo le plus vendu de toute l’histoire.'],
  ['pop_186', 'Dans Clash of Clans, à quoi le joueur passe-t-il son temps entre deux attaques ?', 'À bâtir et défendre son village', 'À collectionner des cartes', 'À courir dans un labyrinthe', 'À élever des animaux', 'Le studio finlandais Supercell édite aussi Brawl Stars.'],
  ['pop_ado_editorial_026', 'Que fait un auteur-compositeur lorsqu’il écrit pour un autre artiste ?', 'Il compose une chanson qu’un autre interprétera', 'Il chante à la place de l’autre', 'Il dessine la pochette du disque', 'Il organise la tournée', 'Jean-Jacques Goldman a ainsi écrit un album entier pour Céline Dion.'],

  // Cinéma
  ['cin_148', 'De quelle voie de la gare de King’s Cross le train de Poudlard part-il ?', 'La voie 9 ¾', 'La voie 13', 'La voie 7', 'La voie 21', 'Un morceau du décor se visite aujourd’hui à Londres.'],
  ['cin_194', 'Comment les dinosaures sont-ils recréés dans Jurassic Park ?', 'À partir d’ADN conservé dans de l’ambre', 'Par des robots télécommandés', 'En clonant des lézards actuels', 'En les ramenant du passé', 'Le film de 1993 a mêlé animatroniques et images de synthèse.'],
  ['cin_212', 'De quelle couleur est la peau des Na’vi, les habitants de Pandora dans Avatar ?', 'Bleue', 'Verte', 'Dorée', 'Grise', 'James Cameron a attendu des années que la technologie permette de les filmer.'],

  // Histoire : cette carte posait le même fait que la banque d'art (le plafond
  // de la chapelle Sixtine). Remplacée par un repère belge.
  ['his_188', 'Que célèbre la fête nationale belge, le 21 juillet ?', 'Le serment du premier roi des Belges', 'La fin de la Seconde Guerre mondiale', 'La signature d’un traité européen', 'L’indépendance du Congo', 'Léopold Ier prêta serment sur la Constitution le 21 juillet 1831.'],
];

const BY_ID = new Map(REPLACEMENTS.map((replacement) => [replacement[0], replacement]));

/**
 * Applique les remplacements ado en conservant les identifiants.
 *
 * La bonne réponse est écrite en premier dans le tableau ci-dessus, par confort
 * de relecture ; sa position est ensuite répartie entre A, B, C et D. Le serveur
 * remélange de toute façon les options à chaque tirage, mais un lot relu à la
 * main ne doit pas concentrer ses réponses sur une position — c'est ce que
 * l'audit vérifie et ce qui compte si l'on exporte les cartes pour les imprimer.
 */
export function applyAdoReplacements(questions: Question[]): Question[] {
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

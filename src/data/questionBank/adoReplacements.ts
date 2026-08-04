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

import { Question } from '../../types';

/**
 * Culture populaire réellement partagée dans un salon francophone.
 *
 * Ces quarante-cinq cartes remplacent, à volume égal, la longue traîne de
 * « Pop Culture & Musique » : studios de jeux vidéo, jeux de société d'auteur,
 * musique indépendante et littérature de genre anglo-saxonne, dont les réponses
 * n'existaient nulle part ailleurs dans le jeu. C'était la catégorie la plus
 * hors cible du corpus, avec 36 % de bonnes réponses inconnues du foyer contre
 * 15 % en sports.
 *
 * Le remplacement fait deux choses à la fois : il abaisse le plafond et il
 * remonte l'ancrage francophone, qui plafonnait à 28 % au niveau adulte alors
 * que le niveau ado atteignait 33 %.
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
  // ---- Chanson francophone ----------------------------------------------
  ['Quel chanteur français a écrit « La Bohème » et « Emmenez-moi » ?', 'Charles Aznavour', 'Yves Montand', 'Gilbert Bécaud', 'Serge Reggiani', 'D’origine arménienne, il a chanté en huit langues et vendu plus de cent millions de disques.'],
  ['Quelle chanteuse à la voix grave a interprété « L’Aigle noir » ?', 'Barbara', 'Juliette Gréco', 'Édith Piaf', 'Catherine Sauvage', 'Elle écrivait paroles et musique et s’accompagnait au piano, ce qui était rare pour une femme de sa génération.'],
  ['Quel chanteur français a interprété « La Montagne » et « Nuit et brouillard » ?', 'Jean Ferrat', 'Georges Moustaki', 'Léo Ferré', 'Claude Nougaro', 'Plusieurs de ses chansons ont été écartées des radios pour des raisons politiques.'],
  ['Quel artiste toulousain mêlait jazz et chanson dans « Toulouse » et « Le Jazz et la Java » ?', 'Claude Nougaro', 'Michel Jonasz', 'Bernard Lavilliers', 'Alain Souchon', 'Il posait ses textes sur des standards de jazz, dont certains de Dave Brubeck.'],
  ['Quel chanteur a marqué la scène française avec « Gaby oh Gaby » et l’album Osez Joséphine ?', 'Alain Bashung', 'Étienne Daho', 'Christophe', 'Jacques Higelin', 'Il détient le record de Victoires de la musique remportées par un artiste masculin.'],
  ['Quel auteur-compositeur a écrit « Je l’aime à mourir » et « La Corrida » ?', 'Francis Cabrel', 'Jean-Jacques Goldman', 'Michel Berger', 'Yves Duteil', 'Il vit toujours à Astaffort, le village du Lot-et-Garonne où il est né.'],
  ['Quel chanteur français est associé aux titres « Mistral gagnant » et « Morgane de toi » ?', 'Renaud', 'Alain Souchon', 'Julien Clerc', 'Bernard Lavilliers', '« Mistral gagnant » est régulièrement élue chanson préférée des Français.'],
  ['Quel compositeur a écrit pour France Gall « Il jouait du piano debout » et l’opéra-rock Starmania ?', 'Michel Berger', 'Serge Gainsbourg', 'Jean-Jacques Goldman', 'Didier Barbelivien', 'Starmania, écrit avec Luc Plamondon, a été monté sans interruption depuis 1979.'],
  ['Quel chanteur belge a connu un succès mondial en 1977 avec « Ça plane pour moi » ?', 'Plastic Bertrand', 'Adamo', 'Frédéric François', 'Lou Deprijck seul', 'Il a été révélé bien plus tard que la voix du disque n’était pas la sienne.'],
  ['Quelle chanteuse belge a remporté le Concours Eurovision en 1986, à seulement treize ans ?', 'Sandra Kim', 'Lara Fabian', 'Maurane', 'Axelle Red', 'C’est la seule victoire de la Belgique à l’Eurovision ; elle avait déclaré avoir quinze ans.'],
  ['Quelle chanteuse belge à la voix rauque a interprété « Sensualité » ?', 'Axelle Red', 'Maurane', 'Lara Fabian', 'Viktor Lazlo', 'Avocate de formation, elle chante en français, en néerlandais et en anglais.'],
  ['Quel groupe belge des années 1980 a chanté « Nah Neh Nah » et « Puerto Rico » ?', 'Vaya Con Dios', 'Front 242', 'The Scabs', 'Clouseau', 'La voix de Dani Klein a porté le groupe jusqu’aux classements américains.'],
  ['Quel groupe gantois mené par les frères Dewaele mêle rock et musique électronique ?', 'Soulwax', 'dEUS', 'Balthazar', 'Girls in Hawaii', 'Sous le nom de 2manydjs, ils ont popularisé le mix continu de morceaux hétéroclites.'],
  ['Quel rappeur belge d’origine congolaise a publié les albums Ipséité et Lithopédion ?', 'Damso', 'Roméo Elvis', 'Caballero', 'Hamza', 'Il a co-écrit l’hymne des Diables rouges pour la Coupe du monde 2018, finalement écarté.'],
  ['Quel rappeur français a écrit « Basique » et milite pour l’écologie dans ses textes ?', 'Orelsan', 'Nekfeu', 'Vald', 'Bigflo', 'Il est aussi passé derrière la caméra pour réaliser films et séries documentaires.'],
  ['Quelle chanteuse a révélé « La Grenade » et « Tout oublier » avant Nonante-Cinq ?', 'Angèle', 'Clara Luciani', 'Pomme', 'Juliette Armanet', 'Elle a d’abord été repérée en publiant de courtes reprises au piano sur les réseaux sociaux.'],
  ['Quelle chanteuse française a interprété « Le Reste » et « Respire encore » ?', 'Clara Luciani', 'Angèle', 'Louane', 'Hoshi', 'Elle a commencé comme choriste et guitariste du groupe La Femme avant sa carrière solo.'],
  ['Quel chanteur français des « Mots bleus » et d’« Aline » est mort en 2020 ?', 'Christophe', 'Alain Bashung', 'Daniel Balavoine', 'Michel Delpech', 'Collectionneur de juke-box et de voitures anciennes, il enregistrait surtout la nuit.'],

  // ---- Télévision et radio francophones ----------------------------------
  ['Quelle émission de la RTBF filmait sans commentaire le quotidien des Belges ?', 'Strip-Tease', 'Les Niouzz', 'Signé Taloche', 'Devoir d’enquête', 'Son principe — aucune voix off, aucun jugement — en a fait une référence du documentaire télévisé.'],
  ['Quel jeu télévisé français, diffusé depuis 1988, fait s’affronter des candidats sur la culture générale ?', 'Questions pour un champion', 'Le Juste Prix', 'Des chiffres et des lettres', 'Motus', 'Julien Lepers l’a présenté pendant vingt-huit ans avant de passer la main.'],
  ['Quelle émission française associe une forteresse, des épreuves et des clés depuis 1990 ?', 'Fort Boyard', 'La Carte au trésor', 'Intervilles', 'Koh-Lanta', 'Le fort, construit sous Napoléon, était à l’abandon avant d’être racheté par le département.'],
  ['Quelle émission scientifique française a expliqué le monde à coups de maquettes et de camion ?', 'C’est pas sorcier', 'E = M6', 'Il était une fois la vie', 'Archimède', 'Fred, Jamy et Sabine ont tourné près de six cents épisodes entre 1993 et 2014.'],
  ['Quelle émission satirique de Canal+ mettait en scène des marionnettes de personnalités ?', 'Les Guignols de l’info', 'Groland', 'Le Bébête Show', 'Nulle part ailleurs', 'La marionnette de Johnny Hallyday, transformée en vendeur de voitures, est restée célèbre.'],
  ['Quelle chaîne publique belge francophone diffuse La Une et La Deux ?', 'La RTBF', 'La VRT', 'RTL-TVI', 'BX1', 'Elle est financée par la Fédération Wallonie-Bruxelles ; son équivalent néerlandophone est la VRT.'],
  ['Quel journal télévisé belge est présenté depuis Bruxelles sur RTL-TVI ?', 'Le RTL info', 'Le Journal de 20 heures', 'Le Soir info', 'Le 19/45', 'RTL-TVI est la principale chaîne privée en Belgique francophone.'],
  ['Quelle opération de solidarité annuelle mobilise la RTBF au profit de la recherche contre le cancer ?', 'Le Télévie', 'Cap 48', 'Viva for Life', 'Les Restos du cœur', 'Lancée en 1989, elle a récolté plus de deux cents millions d’euros depuis sa création.'],

  // ---- Jeux de société et jeux vidéo grand public -------------------------
  ['Dans le Trivial Pursuit classique, que faut-il réunir pour gagner ?', 'Six camemberts de couleurs différentes', 'Quatre pions', 'Douze cartes', 'Trois dés', 'Le jeu a été inventé en 1979 par deux Canadiens, un journaliste et un photographe, lors d’une partie de Scrabble.'],
  ['Quel jeu de lettres consiste à former des mots sur une grille en marquant des points par lettre ?', 'Le Scrabble', 'Le Boggle', 'Le Mot le plus long', 'Les Chiffres et les Lettres', 'La lettre la plus chère du Scrabble français vaut dix points : le K, le W, le X, le Y et le Z.'],
  ['Dans le Cluedo, que doit-on découvrir pour l’emporter ?', 'Le coupable, l’arme et le lieu', 'Le mobile seul', 'L’heure du crime', 'Le nom de la victime', 'Le jeu a été imaginé en Angleterre pendant la Seconde Guerre mondiale, durant les alertes aériennes.'],
  ['Quel jeu de plateau consiste à conquérir des territoires du monde avec des armées ?', 'Le Risk', 'Le Monopoly', 'Le Stratego', 'Les Échecs chinois', 'Il a été inventé par le cinéaste français Albert Lamorisse, auteur du film Le Ballon rouge.'],
  ['Combien de pièces différentes le jeu de dames compte-t-il par joueur au départ ?', 'Un seul type, vingt pions', 'Six types', 'Quatre types', 'Deux types', 'La version internationale se joue sur un damier de cent cases, la version anglaise sur soixante-quatre.'],
  ['Quel jeu vidéo de course de Nintendo fait s’affronter Mario et ses amis à coups de carapaces ?', 'Mario Kart', 'Sonic Racing', 'Crash Team Racing', 'F-Zero', 'La carapace bleue, qui frappe le joueur en tête, est devenue un symbole de l’injustice ludique.'],
  ['Quel jeu vidéo demande d’aligner des blocs de formes différentes qui tombent ?', 'Tetris', 'Columns', 'Puyo Puyo', 'Dr. Mario', 'Créé en 1984 par le Soviétique Alexeï Pajitnov, il est devenu l’un des jeux les plus vendus au monde.'],
  ['Quel personnage jaune de jeu vidéo avale des pastilles en fuyant des fantômes ?', 'Pac-Man', 'Q*bert', 'Dig Dug', 'Bubble Bobble', 'Sa forme vient, selon son créateur, d’une pizza à laquelle il manquait une part.'],
  ['Quelle série de jeux vidéo de football est éditée depuis les années 1990 par Electronic Arts ?', 'FIFA, devenue EA Sports FC', 'Pro Evolution Soccer', 'Football Manager', 'Sensible Soccer', 'La licence FIFA a été abandonnée en 2023 après trente ans de partenariat.'],
  ['Quel jeu vidéo français mêle plateforme et humour autour d’un héros sans bras ni jambes ?', 'Rayman', 'Oddworld', 'Little Big Planet', 'Sonic', 'Michel Ancel l’a créé chez Ubisoft, entreprise fondée par la famille Guillemot en Bretagne.'],

  // ---- Bandes dessinées, comics et divers --------------------------------
  ['Quel super-héros Marvel est un milliardaire dans une armure de métal ?', 'Iron Man', 'Batman', 'Green Arrow', 'Black Panther', 'Le film de 2008 a lancé l’univers cinématographique Marvel, qui compte depuis plus de trente longs métrages.'],
  ['Quel groupe de super-héros Marvel réunit Iron Man, Thor, Hulk et Captain America ?', 'Les Avengers', 'La Ligue des justiciers', 'Les Quatre Fantastiques', 'Les X-Men', 'En français, le groupe a longtemps été appelé « Les Vengeurs ».'],
  ['Quel héros de comics protège la ville de Gotham sans aucun super-pouvoir ?', 'Batman', 'Superman', 'Daredevil', 'Green Lantern', 'Ses créateurs se sont inspirés du dessin d’une machine volante de Léonard de Vinci pour sa cape.'],
  ['Quelle plateforme suédoise a imposé l’écoute de musique en flux par abonnement ?', 'Spotify', 'Deezer', 'Tidal', 'Napster', 'Deezer, son concurrent, est français et a été lancé la même année, en 2007.'],
  ['Quelle plateforme française de musique en ligne a été lancée en 2007 à Paris ?', 'Deezer', 'Spotify', 'Qobuz', 'Napster', 'Elle est née d’un site de partage de reprises, Blogmusik, fermé pour des raisons de droits.'],
  ['Quel format de fichier a bouleversé la diffusion de la musique dans les années 1990 ?', 'Le MP3', 'Le WAV', 'Le FLAC', 'Le MIDI', 'Il a été mis au point par l’institut allemand Fraunhofer, qui en détenait les brevets.'],
  ['Quel chanteur belge a écrit « Les Filles du bord de mer » et « Amour, anarchie » ?', 'Arno', 'Adamo', 'Marka', 'Jean-Louis Daulne', 'Il chantait dans un français rocailleux mêlé d’anglais et de flamand, et vivait à Ostende.'],
  ['Quelle messagerie rachetée par Facebook en 2014 compte parmi les plus utilisées au monde ?', 'WhatsApp', 'Telegram', 'Signal', 'Viber', 'Signal, son concurrent, est géré par une fondation à but non lucratif.'],
  ['Dans quelle ville de Charente se tient chaque hiver le grand festival de la bande dessinée ?', 'Angoulême', 'Poitiers', 'Limoges', 'Niort', 'Depuis 1974, la ville accueille en janvier plus de deux cents mille visiteurs en quatre jours.'],
];

export const POPCULTURE_FRANCOPHONE_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `pop_adulte_francophone_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'popculture' as const,
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

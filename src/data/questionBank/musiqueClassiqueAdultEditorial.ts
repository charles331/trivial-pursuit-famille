import { Question } from '../../types';

/**
 * Musique classique, opéra et art lyrique — catégorie « Pop Culture & Musique ».
 *
 * Ces cartes vivaient dans « Art & Littérature », dont le nom ne promet ni
 * opéra ni symphonie, tandis que la catégorie explicitement intitulée
 * « Musique » n'en comptait presque aucune. Le joueur qui tombait sur la case
 * art se voyait demander un librettiste ; celui qui connaissait la musique n'en
 * tirait aucun bénéfice. Les cartes sont déplacées telles quelles, sans
 * modification de leur contenu : seule leur catégorie change.
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
  ['Quel oratorio de Haendel s’achève sur un « Alléluia » que le public écoute traditionnellement debout ?', 'Le Messie', 'Israël en Égypte', 'Judas Macchabée', 'Samson', 'La tradition de se lever remonterait au roi George II, à Londres en 1743.'],
  ['Quelle œuvre inachevée de Bach explore une à une toutes les ressources de la fugue ?', 'L’Art de la fugue', 'Le Clavier bien tempéré', 'Les Variations Goldberg', 'L’Offrande musicale', 'Le manuscrit s’interrompt au milieu d’une fugue à quatre sujets.'],
  ['Quel oratorio de Haydn raconte les six jours de la Genèse, en ouvrant sur le chaos ?', 'La Création', 'Les Saisons', 'Le Retour de Tobie', 'Les Sept Dernières Paroles', 'L’orchestre y peint le lever du soleil, le vol des oiseaux et le rugissement du lion.'],
  ['Quel est l’unique opéra achevé de Beethoven ?', 'Fidelio', 'Euryanthe', 'Der Freischütz', 'Alfonso und Estrella', 'Beethoven remania plusieurs fois Fidelio, dont la version définitive fut créée en 1814.'],
  ['Quel cycle de lieder de Schubert suit un marcheur solitaire dans un paysage gelé ?', 'Le Voyage d’hiver', 'La Belle Meunière', 'Le Chant du cygne', 'Les Nuits d’été', 'Ses vingt-quatre lieder s’enchaînent comme le journal d’une rupture.'],
  ['Quelle symphonie de Berlioz s’achève par une marche au supplice et un sabbat de sorcières ?', 'La Symphonie fantastique', 'Harold en Italie', 'Roméo et Juliette', 'Le Carnaval romain', 'Berlioz y raconte sa passion pour l’actrice irlandaise Harriet Smithson.'],
  ['Quelle œuvre de Brahms met en musique des textes bibliques en allemand, et non la messe latine ?', 'Un requiem allemand', 'La Rhapsodie pour alto', 'Le Chant du destin', 'Les Liebeslieder', 'Brahms y console les vivants au lieu de prier pour les morts.'],
  ['Quel opéra de Verdi raconte l’amour de Violetta, courtisane emportée par la tuberculose ?', 'La Traviata', 'Aïda', 'Le Trouvère', 'Un bal masqué', 'Le livret s’inspire de La Dame aux camélias, d’Alexandre Dumas fils.'],
  ['Quel opéra de Wagner s’ouvre sur un accord resté célèbre pour son harmonie irrésolue ?', 'Tristan et Isolde', 'Parsifal', 'Lohengrin', 'Tannhäuser', 'Cet accord initial a ouvert la voie à l’harmonie du XXe siècle.'],
  ['Quel opéra de Puccini réunit quatre artistes sans le sou dans un grenier parisien ?', 'La Bohème', 'Tosca', 'Madame Butterfly', 'Turandot', 'Le livret vient des Scènes de la vie de bohème d’Henry Murger.'],
  ['Quel ballet de Tchaïkovski met en scène la fée Carabosse et un sortilège de cent ans ?', 'La Belle au bois dormant', 'Le Lac des cygnes', 'Casse-Noisette', 'Giselle', 'Sa valse et sa marche sont devenues des classiques du répertoire.'],
  ['Qui a composé la valse « Le Beau Danube bleu » ?', 'Johann Strauss fils', 'Johann Strauss père', 'Josef Lanner', 'Franz von Suppé', 'Devenue un hymne officieux de l’Autriche, la valse accompagne aussi une scène célèbre de « 2001, l’Odyssée de l’espace ».'],
  ['Quelle symphonie Dvořák a-t-il composée pendant son séjour aux États-Unis ?', 'La Symphonie du Nouveau Monde', 'La Symphonie pastorale', 'La Symphonie inachevée', 'La Symphonie du destin', 'Neil Armstrong en avait emporté un enregistrement lors du vol d’Apollo 11.'],
  ['Pour quelle pièce de théâtre d’Ibsen Grieg a-t-il composé une musique de scène célèbre ?', 'Peer Gynt', 'Maison de poupée', 'Hedda Gabler', 'Les Revenants', 'On y trouve « Le Matin » et « Dans l’antre du roi de la montagne ».'],
  ['Quel poème symphonique de Sibelius est devenu un chant de résistance nationale ?', 'Finlandia', 'Le Cygne de Tuonela', 'Kullervo', 'Tapiola', 'Il fut joué sous des titres déguisés pour échapper à la censure russe.'],
  ['Quelle œuvre de Debussy, inspirée d’un poème de Mallarmé, s’ouvre sur un solo de flûte ?', 'Prélude à l’Après-midi d’un faune', 'La Mer', 'Nuages', 'Jeux', 'Nijinski en tira un ballet qui scandalisa Paris en 1912.'],
  ['Quel ballet de Stravinsky provoqua un chahut mémorable dans la salle lors de sa création ?', 'Le Sacre du printemps', 'L’Oiseau de feu', 'Petrouchka', 'Pulcinella', 'Ses rythmes heurtés et sa chorégraphie brutale déclenchèrent des huées en 1913.'],
  ['Quelle œuvre de Gershwin s’ouvre sur un glissando de clarinette immédiatement reconnaissable ?', 'Rhapsody in Blue', 'Un Américain à Paris', 'Cuban Overture', 'Concerto en fa', 'Ce glissando était une plaisanterie du clarinettiste, conservée à la création.'],
  ['Quel opéra de Rossini met en scène Figaro et le comte Almaviva ?', 'Le Barbier de Séville', 'Guillaume Tell', 'La Cenerentola', 'L’Italienne à Alger', 'Le Barbier de Séville fut créé à Rome en 1816 d’après la comédie de Beaumarchais.'],
  ['Quel opéra de Donizetti raconte l’amour de Nemorino pour Adina ?', 'L’Élixir d’amour', 'Lucia di Lammermoor', 'Don Pasquale', 'La Favorite', 'L’Élixir d’amour est un opéra comique créé à Milan en 1832.'],
  ['Quel opéra de Moussorgski met en scène un tsar rongé par le remords ?', 'Boris Godounov', 'La Khovanchtchina', 'La Foire de Sorotchintsy', 'Salammbô', 'Le livret est tiré d’une tragédie historique de Pouchkine.'],
  ['Quel opéra de Bizet se déroule principalement à Séville ?', 'Carmen', 'Les Pêcheurs de perles', 'Djamileh', 'La Jolie Fille de Perth', 'Carmen fut créé à l’Opéra-Comique de Paris en 1875, d’après une nouvelle de Mérimée.'],
  ['Quel opéra de Verdi est inspiré du drame « Le Roi s’amuse » de Victor Hugo ?', 'Rigoletto', 'Nabucco', 'Otello', 'Falstaff', 'Rigoletto fut créé à Venise en 1851 après des négociations avec la censure.'],
  ['Quel opéra de Leoncavallo contient l’air « Vesti la giubba » ?', 'Pagliacci', 'Zazà', 'La Bohème', 'Chatterton', 'Dans Pagliacci, le ténor Canio doit jouer la comédie malgré sa jalousie et son désespoir.'],
  ['Quel unique opéra achevé de Debussy adapte une pièce du Belge Maurice Maeterlinck ?', 'Pelléas et Mélisande', 'Rodrigue et Chimène', 'La Chute de la maison Usher', 'Le Diable dans le beffroi', 'Maeterlinck reçut le prix Nobel de littérature en 1911.'],
  ['Quel opéra de Gershwin se déroule dans la communauté de Catfish Row ?', 'Porgy and Bess', 'Treemonisha', 'Street Scene', 'Show Boat', 'Porgy and Bess fut créé en 1935 et contient la chanson « Summertime ».'],
  ['Quel opéra de Britten se déroule dans un village de pêcheurs anglais hostile à l’un des siens ?', 'Peter Grimes', 'Billy Budd', 'Albert Herring', 'Le Tour d’écrou', 'Britten le composa juste après la Seconde Guerre mondiale.'],
  ['Quel opéra de Poulenc raconte le martyre de carmélites sous la Révolution française ?', 'Dialogues des Carmélites', 'La Voix humaine', 'Les Mamelles de Tirésias', 'Saint François d’Assise', 'Poulenc adapta un texte de Georges Bernanos ; l’opéra fut créé en 1957.'],
];

export const MUSIQUE_CLASSIQUE_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `pop_adulte_musique_classique_${String(index + 1).padStart(3, '0')}`,
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

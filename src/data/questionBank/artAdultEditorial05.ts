import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quelle technique de peinture utilise des pigments délayés dans de l’eau sur un enduit frais ?', 'La fresque', 'La tempera', 'L’encaustique', 'La détrempe', 'Dans la fresque, les pigments se fixent chimiquement dans l’enduit à mesure qu’il sèche.'],
  ['Quel procédé pictural emploie de la cire chauffée comme liant ?', 'L’encaustique', 'La gouache', 'La grisaille', 'Le pastel', 'L’encaustique était notamment utilisée dans les portraits funéraires du Fayoum.'],
  ['Comment nomme-t-on une peinture réalisée principalement en nuances de gris ?', 'Une grisaille', 'Une sanguine', 'Une pochade', 'Une enluminure', 'La grisaille peut imiter la sculpture ou servir d’étude préparatoire des valeurs.'],
  ['Quelle technique d’estampe consiste à graver une plaque de cuivre avec un acide ?', 'L’eau-forte', 'La xylographie', 'La lithographie', 'La pointe sèche', 'L’aquafortiste protège la plaque avec un vernis puis laisse l’acide mordre les traits découverts.'],
  ['Quel procédé d’impression repose sur la répulsion entre graisse et eau sur une pierre ?', 'La lithographie', 'La sérigraphie', 'La linogravure', 'La manière noire', 'Alois Senefelder mit au point la lithographie à la fin du XVIIIe siècle.'],
  ['Comment appelle-t-on une estampe gravée dans une planche de bois ?', 'Une xylographie', 'Un monotype', 'Une aquatinte', 'Une héliogravure', 'La xylographie se développe largement en Europe avec l’impression des images et des livres.'],
  ['Quelle technique permet d’imprimer une image à travers un écran de soie ou de tissu ?', 'La sérigraphie', 'La lithographie', 'La taille-douce', 'La collagraphie', 'La sérigraphie utilise un pochoir sur un écran ; Andy Warhol en fit un outil emblématique.'],
  ['Quel terme désigne un dessin préparatoire grandeur nature pour une fresque ou une tapisserie ?', 'Un carton', 'Un repentir', 'Un camaïeu', 'Un poncif', 'Les cartons de Raphaël pour des tapisseries du Vatican sont conservés au Victoria and Albert Museum.'],
  ['Comment nomme-t-on une correction visible apportée par un peintre à sa composition ?', 'Un repentir', 'Un rehaut', 'Un glacis', 'Un cerne', 'Les repentirs peuvent apparaître avec le vieillissement de la peinture ou grâce à l’imagerie scientifique.'],
  ['Quel vernis coloré transparent appliqué en couche mince modifie la profondeur d’une peinture ?', 'Un glacis', 'Un empâtement', 'Un lavis', 'Un gesso', 'Les glacis superposés permettent d’obtenir des couleurs lumineuses sans masquer les couches inférieures.'],
  ['Quel courant du XIXe siècle privilégia sujets médiévaux et précision avant Raphaël ?', 'Le préraphaélisme', 'Le symbolisme', 'Le nabisme', 'Le vorticisme', 'La confrérie préraphaélite fut fondée à Londres en 1848 par de jeunes artistes dont Rossetti et Millais.'],
  ['Quel mouvement français réunit Bonnard, Vuillard, Sérusier et Maurice Denis ?', 'Les Nabis', 'Les Fauves', 'Les Incohérents', 'Les Orphistes', 'Le nom Nabi vient d’un mot hébreu signifiant prophète ; le groupe défendait la surface décorative.'],
  ['Quel mouvement italien exalta vitesse, machines et modernité au début du XXe siècle ?', 'Le futurisme', 'Le vérisme', 'La métaphysique', 'Le spatialisme', 'Filippo Tommaso Marinetti publia le premier manifeste futuriste en 1909.'],
  ['Quel mouvement russe de Malevitch privilégia des formes géométriques élémentaires ?', 'Le suprématisme', 'Le constructivisme', 'Le rayonnisme', 'Le productivisme', 'Malevitch présenta en 1915 des œuvres suprématistes dominées par carrés, cercles et croix.'],
  ['Quel mouvement néerlandais associa Mondrian, Van Doesburg et la revue De Stijl ?', 'Le néoplasticisme', 'Le luminisme', 'Le précisionnisme', 'Le cloisonnisme', 'De Stijl réduisait souvent formes et couleurs aux verticales, horizontales et tons primaires.'],
  ['Quel groupe expressionniste allemand fut fondé à Dresde en 1905 ?', 'Die Brücke', 'Der Blaue Reiter', 'Neue Sachlichkeit', 'Der Sturm', 'Kirchner, Heckel et Schmidt-Rottluff comptaient parmi les fondateurs de Die Brücke.'],
  ['Quel groupe réunit Kandinsky et Franz Marc à Munich ?', 'Der Blaue Reiter', 'Die Brücke', 'Die Neue Gruppe', 'Novembergruppe', 'L’almanach Der Blaue Reiter parut en 1912 et rapprocha différentes formes d’art.'],
  ['Quel courant allemand des années 1920 porta un regard froid et critique sur la société ?', 'La Nouvelle Objectivité', 'Le romantisme tardif', 'Le Jugendstil', 'Le tachisme', 'Otto Dix et George Grosz sont souvent associés à la Neue Sachlichkeit.'],
  ['Quel mouvement américain peignit avec précision machines, silos et paysages urbains ?', 'Le précisionnisme', 'Le régionalisme', 'L’expressionnisme abstrait', 'Le color field', 'Charles Sheeler et Charles Demuth figurent parmi les principaux précisionnistes.'],
  ['Quel mouvement japonais d’après-guerre mena des expérimentations avec matière et performance ?', 'Gutai', 'Mono-ha', 'Mingei', 'Ukiyo-e', 'L’association Gutai fut fondée en 1954 autour de Jirō Yoshihara.'],
  ['Quel musée londonien conserve la pierre de Rosette ?', 'Le British Museum', 'Le Victoria and Albert Museum', 'La National Gallery', 'La Wallace Collection', 'La pierre de Rosette entra au British Museum en 1802 après la capitulation française en Égypte.'],
  ['Quel musée madrilène conserve « Les Ménines » ?', 'Le musée du Prado', 'Le musée Thyssen-Bornemisza', 'Le musée Reina Sofía', 'L’Académie San Fernando', 'Les Ménines de Velázquez appartiennent aux collections royales devenues le cœur du Prado.'],
  ['Quel musée new-yorkais est installé dans un bâtiment en spirale de Frank Lloyd Wright ?', 'Le musée Guggenheim', 'Le Whitney Museum', 'Le New Museum', 'La Frick Collection', 'Le bâtiment du Guggenheim sur la Cinquième Avenue ouvrit en 1959, après la mort de Wright.'],
  ['Quelle institution parisienne occupe l’ancienne gare d’Orsay ?', 'Le musée d’Orsay', 'Le musée de l’Orangerie', 'Le musée Guimet', 'Le musée Jacquemart-André', 'La gare construite pour l’Exposition de 1900 fut transformée en musée ouvert en 1986.'],
  ['Quel musée d’Amsterdam est consacré à Vincent van Gogh ?', 'Le Van Gogh Museum', 'Le Stedelijk Museum', 'Le Rijksmuseum', 'La maison de Rembrandt', 'Ouvert en 1973, le musée conserve la plus grande collection d’œuvres de Van Gogh.'],
  ['Quel musée de Saint-Pétersbourg occupe en partie le palais d’Hiver ?', 'Le musée de l’Ermitage', 'Le Musée russe', 'Le musée Fabergé', 'La Kunstkamera', 'Les collections de l’Ermitage trouvent leur origine dans les acquisitions de Catherine II.'],
  ['Quel musée florentin expose « La Naissance de Vénus » de Botticelli ?', 'La galerie des Offices', 'Le palais Pitti', 'Le Bargello', 'La galerie de l’Académie', 'Les Offices occupent un bâtiment conçu par Giorgio Vasari pour les administrations médicéennes.'],
  ['Quel musée de Mexico abrite « Les Deux Fridas » ?', 'Le Museo de Arte Moderno', 'Le Museo Frida Kahlo', 'Le Museo Soumaya', 'Le Museo Nacional de Arte', 'La grande toile de 1939 appartient à la collection du musée d’Art moderne de Mexico.'],
  ['Quelle galerie londonienne conserve « Les Époux Arnolfini » ?', 'La National Gallery', 'La Tate Britain', 'La Courtauld Gallery', 'La Dulwich Picture Gallery', 'Le tableau de Jan van Eyck fut acheté par la National Gallery en 1842.'],
  ['Quel musée belge conserve « La Mort de Marat » de David ?', 'Les Musées royaux des Beaux-Arts', 'Le musée Groeninge', 'Le musée Mayer van den Bergh', 'La Boverie', 'David remit cette version de La Mort de Marat à la Convention ; elle entra ensuite dans les collections belges.'],
  ['Quel peintre belge est l’auteur de « L’Entrée du Christ à Bruxelles » ?', 'James Ensor', 'Théo van Rysselberghe', 'Constant Permeke', 'Eugène Laermans', 'Ensor acheva cette vaste satire en 1888 ; elle est aujourd’hui conservée au Getty Museum.'],
  ['Quel artiste belge cofonda le groupe néo-impressionniste Les XX ?', 'Théo van Rysselberghe', 'Fernand Khnopff', 'Léon Spilliaert', 'George Minne', 'Van Rysselberghe adopta la division des couleurs après sa rencontre avec Seurat et Signac.'],
  ['Qui a peint « Des caresses », tableau symboliste représentant un sphinx ?', 'Fernand Khnopff', 'Jean Delville', 'Félicien Rops', 'William Degouve de Nuncques', 'Khnopff réalisa Des caresses en 1896 ; l’œuvre est conservée aux Musées royaux des Beaux-Arts.'],
  ['Quel peintre ostendais réalisa de nombreux autoportraits aux atmosphères nocturnes ?', 'Léon Spilliaert', 'James Ensor', 'Henri Evenepoel', 'Rik Wouters', 'Spilliaert utilisa encre, lavis et pastel pour explorer solitude et espaces d’Ostende.'],
  ['Quel sculpteur belge créa la « Fontaine des agenouillés » à Gand ?', 'George Minne', 'Constantin Meunier', 'Jef Lambeaux', 'Eugène Dodeigne', 'Les adolescents agenouillés de Minne expriment l’intériorité propre au symbolisme.'],
  ['Quel sculpteur belge représenta fréquemment ouvriers, mineurs et dockers ?', 'Constantin Meunier', 'George Minne', 'Jef Lambeaux', 'Victor Rousseau', 'Meunier donna une dignité monumentale au travail industriel dans la Belgique du XIXe siècle.'],
  ['Quel artiste belge peignit « La Maison bleue » et des scènes fauves brabançonnes ?', 'Rik Wouters', 'Jean Brusselmans', 'Edgard Tytgat', 'Auguste Oleffe', 'Rik Wouters associa couleur vive et sujets intimes avant sa mort précoce en 1916.'],
  ['Quel peintre expressionniste belge est associé au village de Laethem-Saint-Martin ?', 'Constant Permeke', 'Paul Delvaux', 'René Magritte', 'Pierre Alechinsky', 'Permeke peignit paysans, pêcheurs et paysages dans des formes massives et sombres.'],
  ['Quel peintre belge représenta des gares et des femmes dans des paysages oniriques ?', 'Paul Delvaux', 'René Magritte', 'Marcel Broodthaers', 'Raoul Ubac', 'Delvaux combina architecture classique, trains et figures silencieuses dans un univers surréaliste personnel.'],
  ['Quel artiste belge transforma un musée fictif en œuvre conceptuelle dès 1968 ?', 'Marcel Broodthaers', 'Panamarenko', 'Jacques Charlier', 'Jef Geys', 'Broodthaers fonda son Musée d’Art Moderne, Département des Aigles dans sa maison bruxelloise.'],
  ['Quel artiste anversois conçut des machines volantes poétiques souvent incapables de voler ?', 'Panamarenko', 'Jan Fabre', 'Wim Delvoye', 'Guillaume Bijl', 'Panamarenko mêla art, ingénierie imaginaire et fascination pour le vol.'],
  ['Quel membre belge de CoBrA est connu pour ses encres et ses marges illustrées ?', 'Pierre Alechinsky', 'Christian Dotremont', 'Corneille', 'Karel Appel', 'Alechinsky rejoignit CoBrA en 1949 et combina souvent dessin calligraphique et prédelles.'],
  ['Quel artiste belge inventa les « logogrammes », peintures-écritures spontanées ?', 'Christian Dotremont', 'Pierre Alechinsky', 'Asger Jorn', 'Pol Bury', 'Dotremont, cofondateur de CoBrA, transforma l’écriture manuscrite en image poétique.'],
  ['Quel artiste belge utilisa le bleu de stylo Bic dans de vastes dessins ?', 'Jan Fabre', 'Luc Tuymans', 'Francis Alÿs', 'Michaël Borremans', 'Jan Fabre recouvrit notamment d’immenses surfaces de hachures au stylo à bille bleu.'],
  ['Quel peintre belge contemporain est connu pour ses images pâles inspirées de photographies ?', 'Luc Tuymans', 'Michaël Borremans', 'Raoul De Keyser', 'Walter Swennen', 'Tuymans peint à partir d’images médiatiques ou historiques en interrogeant mémoire et pouvoir.'],
  ['Quel artiste belge réalisa la machine gothique « Cloaca » ?', 'Wim Delvoye', 'Jan Fabre', 'Panamarenko', 'Marcel Broodthaers', 'Cloaca reproduit en plusieurs étapes le fonctionnement d’un appareil digestif humain.'],
  ['Quel artiste né en Belgique mène des actions poétiques dans l’espace urbain de Mexico ?', 'Francis Alÿs', 'Johan Grimonprez', 'David Claerbout', 'Hans Op de Beeck', 'Installé à Mexico, Alÿs explore marche, travail et politique par vidéos et performances.'],
  ['Quel vidéaste belge a réalisé « Dial H-I-S-T-O-R-Y » ?', 'Johan Grimonprez', 'David Claerbout', 'Chantal Akerman', 'Koen Theys', 'Le film de Grimonprez, présenté à documenta X, examine détournements d’avion et rôle des médias.'],
  ['Quel artiste belge crée des installations monochromes évoquant des décors figés ?', 'Hans Op de Beeck', 'Berlinde De Bruyckere', 'Ann Veronica Janssens', 'Edith Dekyndt', 'Op de Beeck construit des environnements gris à échelle réelle qui troublent perception et mémoire.'],
  ['Quelle artiste belge réalise des sculptures de cire autour de corps vulnérables ?', 'Berlinde De Bruyckere', 'Lili Dujourie', 'Ann Veronica Janssens', 'Sophie Kuijken', 'De Bruyckere emploie cire, bois et textiles pour créer des formes corporelles fragmentées.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_05: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `art_adulte_editorial_05_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

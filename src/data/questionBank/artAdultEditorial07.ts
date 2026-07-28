import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel graveur allemand créa la série de bois « L’Apocalypse » en 1498 ?', 'Albrecht Dürer', 'Martin Schongauer', 'Lucas Cranach', 'Hans Holbein', 'Les quinze grandes xylographies de Dürer renouvelèrent l’ambition artistique du livre illustré.'],
  ['Quel artiste réalisa la gravure « Melencolia I » ?', 'Albrecht Dürer', 'Albrecht Altdorfer', 'Hans Baldung', 'Matthias Grünewald', 'Datée de 1514, Melencolia I associe instruments de mesure, polyèdre et carré magique.'],
  ['Qui grava la série « Les Désastres de la guerre » ?', 'Francisco de Goya', 'Giovanni Battista Piranesi', 'Honoré Daumier', 'William Hogarth', 'Goya dénonça les violences de la guerre d’indépendance espagnole dans cette série publiée après sa mort.'],
  ['Quel artiste japonais influença Van Gogh avec ses estampes de paysages ?', 'Utagawa Hiroshige', 'Tōshūsai Sharaku', 'Suzuki Harunobu', 'Torii Kiyonaga', 'Van Gogh copia en peinture deux estampes de Hiroshige provenant des Cent vues d’Edo.'],
  ['Quel caricaturiste français créa le personnage de Ratapoil ?', 'Honoré Daumier', 'Grandville', 'Gustave Doré', 'Cham', 'Ratapoil incarnait pour Daumier la propagande bonapartiste précédant le Second Empire.'],
  ['Qui illustra une célèbre édition de « La Divine Comédie » au XIXe siècle ?', 'Gustave Doré', 'J. J. Grandville', 'Tony Johannot', 'Félicien Rops', 'Les gravures de Doré pour Dante furent publiées à partir de 1861.'],
  ['Quel artiste belge illustra « Les Épaves » de Baudelaire ?', 'Félicien Rops', 'James Ensor', 'Fernand Khnopff', 'George Minne', 'Rops réalisa le frontispice des Épaves, recueil contenant les pièces condamnées des Fleurs du mal.'],
  ['Quel affichiste créa le personnage féminin de la Goulue pour le Moulin Rouge ?', 'Henri de Toulouse-Lautrec', 'Jules Chéret', 'Alphonse Mucha', 'Théophile Steinlen', 'L’affiche Moulin Rouge : La Goulue de 1891 lança la carrière d’affichiste de Toulouse-Lautrec.'],
  ['Quel artiste tchèque conçut des affiches Art nouveau pour Sarah Bernhardt ?', 'Alphonse Mucha', 'Koloman Moser', 'Aubrey Beardsley', 'Jan Toorop', 'L’affiche Gismonda de 1894 rendit Mucha célèbre à Paris.'],
  ['Qui créa l’affiche au chat noir pour la tournée du cabaret de Rodolphe Salis ?', 'Théophile Steinlen', 'Jules Chéret', 'Eugène Grasset', 'Adolphe Willette', 'Steinlen dessina en 1896 le célèbre chat auréolé de rouge du cabaret montmartrois.'],
  ['Quel créateur dessina la police de caractères Garamond au XVIe siècle ?', 'Claude Garamont', 'Geoffroy Tory', 'Robert Granjon', 'Simon de Colines', 'Les caractères romains de Claude Garamont inspirèrent de nombreuses familles typographiques modernes.'],
  ['Quel imprimeur vénitien utilisa l’italique créé avec Francesco Griffo ?', 'Alde Manuce', 'Nicolas Jenson', 'Giambattista Bodoni', 'Christophe Plantin', 'Alde Manuce lança au début du XVIe siècle de petits livres utilisant le caractère italique de Griffo.'],
  ['Quel typographe anglais conçut le caractère Baskerville ?', 'John Baskerville', 'William Caslon', 'Stanley Morison', 'Eric Gill', 'Baskerville améliora aussi presse, papier et encre pour obtenir une impression très nette.'],
  ['Quel imprimeur italien donna son nom au caractère Bodoni ?', 'Giambattista Bodoni', 'Alde Manuce', 'Francesco Griffo', 'Arrighi', 'Bodoni dirigea l’imprimerie ducale de Parme et publia son Manuale tipografico.'],
  ['Qui conçut la police Johnston pour le métro de Londres ?', 'Edward Johnston', 'Eric Gill', 'Harry Beck', 'Herbert Bayer', 'La police sans empattement de Johnston fut commandée en 1913 par Frank Pick.'],
  ['Quel typographe conçut la police Futura en 1927 ?', 'Paul Renner', 'Jan Tschichold', 'Herbert Bayer', 'Max Miedinger', 'Renner construisit Futura à partir de formes géométriques tout en conservant sa lisibilité.'],
  ['Qui créa Helvetica avec Eduard Hoffmann ?', 'Max Miedinger', 'Adrian Frutiger', 'Hermann Zapf', 'Josef Müller-Brockmann', 'La police suisse s’appelait d’abord Neue Haas Grotesk avant d’être renommée Helvetica.'],
  ['Quel typographe suisse conçut Univers et Frutiger ?', 'Adrian Frutiger', 'Max Miedinger', 'Emil Ruder', 'Armin Hofmann', 'Frutiger développa Univers comme une famille cohérente numérotée de variantes.'],
  ['Quel graphiste américain créa les logos IBM, UPS et ABC ?', 'Paul Rand', 'Saul Bass', 'Milton Glaser', 'Herb Lubalin', 'Paul Rand imposa une identité moderniste simple à plusieurs grandes entreprises américaines.'],
  ['Qui conçut de nombreux génériques de films pour Hitchcock et Preminger ?', 'Saul Bass', 'Paul Rand', 'Kyle Cooper', 'Alexey Brodovitch', 'Bass transforma le générique en séquence graphique autonome, notamment pour Sueurs froides.'],
  ['Quel auteur suisse créa la bande dessinée « Histoire de M. Vieux Bois » ?', 'Rodolphe Töpffer', 'Wilhelm Busch', 'Gustave Doré', 'Caran d’Ache', 'Les récits en estampes de Töpffer au XIXe siècle sont souvent vus comme des précurseurs de la BD.'],
  ['Qui créa « Little Nemo in Slumberland » ?', 'Winsor McCay', 'George Herriman', 'Lyonel Feininger', 'Richard Outcault', 'La planche dominicale de McCay explorait format, couleur et architecture des rêves dès 1905.'],
  ['Quel auteur est le créateur de « Krazy Kat » ?', 'George Herriman', 'Winsor McCay', 'Cliff Sterrett', 'E. C. Segar', 'Krazy Kat jouait avec langage, décor changeant et triangle amoureux entre Krazy, Ignatz et Offisa Pupp.'],
  ['Qui créa le reporter Tintin en 1929 ?', 'Hergé', 'Edgar P. Jacobs', 'Jijé', 'André Franquin', 'Tintin apparut dans Le Petit Vingtième ; Hergé développa ensuite la ligne claire.'],
  ['Quel auteur belge créa Blake et Mortimer ?', 'Edgar P. Jacobs', 'Hergé', 'Jacques Martin', 'Bob de Moor', 'Jacobs publia Le Secret de l’Espadon dès le premier numéro du journal Tintin en 1946.'],
  ['Qui créa Gaston Lagaffe ?', 'André Franquin', 'Morris', 'Peyo', 'Will', 'Gaston apparut dans Spirou en 1957 comme « héros sans emploi ».'],
  ['Quel dessinateur belge créa Lucky Luke ?', 'Morris', 'Jijé', 'Will', 'Eddy Paape', 'Maurice De Bevere, dit Morris, fit apparaître Lucky Luke dans Spirou en 1946.'],
  ['Qui créa les Schtroumpfs ?', 'Peyo', 'Franquin', 'Macherot', 'Rob-Vel', 'Les Schtroumpfs apparurent en 1958 dans une aventure de Johan et Pirlouit.'],
  ['Quel auteur italien créa Corto Maltese ?', 'Hugo Pratt', 'Guido Crepax', 'Dino Battaglia', 'Sergio Toppi', 'Corto Maltese apparaît dans La Ballade de la mer salée, publiée à partir de 1967.'],
  ['Qui est l’auteur de « Maus » ?', 'Art Spiegelman', 'Will Eisner', 'Robert Crumb', 'Harvey Pekar', 'Maus raconte la Shoah vécue par le père de Spiegelman en représentant les groupes sous forme animale.'],
  ['Quel auteur japonais créa « Astro Boy » ?', 'Osamu Tezuka', 'Shigeru Mizuki', 'Leiji Matsumoto', 'Gō Nagai', 'Tezuka lança Astro Boy en 1952 et influença profondément le manga moderne.'],
  ['Qui a écrit et dessiné « Akira » ?', 'Katsuhiro Otomo', 'Hayao Miyazaki', 'Jirō Taniguchi', 'Naoki Urasawa', 'Le manga Akira fut publié de 1982 à 1990 et adapté par Otomo en film d’animation.'],
  ['Quel auteur français créa « Blueberry » avec Jean-Michel Charlier ?', 'Jean Giraud', 'Enki Bilal', 'Philippe Druillet', 'Jacques Tardi', 'Jean Giraud dessina Blueberry sous son nom, tout en signant Mœbius ses œuvres de science-fiction.'],
  ['Qui est l’auteur de la série « Les Cités obscures » avec Benoît Peeters ?', 'François Schuiten', 'Enki Bilal', 'Yslaire', 'Andreas', 'Schuiten et Peeters développent depuis 1983 un univers d’architectures et de villes parallèles.'],
  ['Quel auteur belge créa « Le Chat » ?', 'Philippe Geluck', 'Pierre Kroll', 'François Walthéry', 'Midam', 'Le Chat apparut dans le journal Le Soir en 1983 sous la plume de Geluck.'],
  ['Quel ébéniste français créa des meubles marquetés pour Louis XV et Louis XVI ?', 'Jean-Henri Riesener', 'André-Charles Boulle', 'Georges Jacob', 'Charles Cressent', 'Riesener réalisa notamment le célèbre bureau à cylindre commencé pour Louis XV.'],
  ['Quel artisan donna son nom à une marqueterie d’écaille et de laiton ?', 'André-Charles Boulle', 'Jean-François Oeben', 'Jean-Henri Riesener', 'Bernard van Risenburgh', 'Boulle perfectionna des décors où métal et écaille étaient découpés simultanément.'],
  ['Quelle manufacture française est célèbre pour sa porcelaine tendre puis dure ?', 'Sèvres', 'Aubusson', 'Beauvais', 'Les Gobelins', 'La manufacture installée à Sèvres bénéficia du patronage royal et produisit une porcelaine dure dès 1769.'],
  ['Quelle ville allemande accueillit la première grande manufacture européenne de porcelaine dure ?', 'Meissen', 'Dresde', 'Berlin', 'Nymphenburg', 'La manufacture de Meissen fut fondée en 1710 après les expériences de Böttger et Tschirnhaus.'],
  ['Quel centre français est célèbre pour ses émaux peints sur cuivre ?', 'Limoges', 'Nevers', 'Rouen', 'Moustiers', 'Les ateliers de Limoges produisirent des émaux champlevés médiévaux puis des émaux peints à la Renaissance.'],
  ['Quelle technique décorative incruste de fines pièces de bois, nacre ou métal ?', 'La marqueterie', 'Le repoussé', 'Le damasquinage', 'La niellure', 'La marqueterie compose un décor en assemblant des placages découpés sur un support.'],
  ['Quel procédé métallique consiste à marteler une feuille par l’envers pour créer un relief ?', 'Le repoussé', 'La fonte à cire perdue', 'Le guillochage', 'La granulation', 'Le repoussé est souvent complété par une reprise des détails au ciselet sur l’endroit.'],
  ['Quelle technique de joaillerie soude de minuscules grains de métal sur une surface ?', 'La granulation', 'Le cloisonné', 'La niellure', 'Le filigrane', 'Les orfèvres étrusques maîtrisaient particulièrement la granulation d’or.'],
  ['Quel procédé d’émail sépare les couleurs par de fines cloisons métalliques ?', 'Le cloisonné', 'Le champlevé', 'La grisaille', 'Le plique-à-jour', 'Dans le cloisonné, des fils métalliques dessinent les compartiments remplis de pâte d’émail.'],
  ['Quelle technique creuse le métal pour recevoir une pâte noire à base de sulfures ?', 'La niellure', 'La damasquinure', 'La dorure au mercure', 'Le guillochage', 'Le nielle noir contraste avec l’argent et fut largement utilisé dans l’orfèvrerie médiévale.'],
  ['Quel verrier français fonda l’École de Nancy avec des meubles et verreries Art nouveau ?', 'Émile Gallé', 'René Lalique', 'Daum', 'Louis Majorelle', 'Gallé associa recherches botaniques, marqueterie et verre multicouche gravé.'],
  ['Quel créateur français réalisa des bijoux puis des verreries Art déco ?', 'René Lalique', 'Georges Fouquet', 'Louis Comfort Tiffany', 'Jean Puiforcat', 'Lalique passa de la joaillerie Art nouveau à une production de verre moulé à grande échelle.'],
  ['Quel verrier américain est associé aux lampes à abat-jour de verre coloré ?', 'Louis Comfort Tiffany', 'John La Farge', 'Dale Chihuly', 'Frederick Carder', 'Les studios Tiffany employèrent le verre opalescent dans vitraux, lampes et objets décoratifs.'],
  ['Quelle créatrice irlandaise conçut des meubles laqués pour l’appartement de la rue de Lota ?', 'Eileen Gray', 'Charlotte Perriand', 'Sonia Delaunay', 'Lilly Reich', 'Eileen Gray combina laque, textiles et mobilier moderniste avant de se tourner vers l’architecture.'],
  ['Quel orfèvre Art déco créa des services en argent aux formes géométriques ?', 'Jean Puiforcat', 'René Lalique', 'Jean Dunand', 'Georg Jensen', 'Puiforcat privilégia volumes purs, surfaces polies et parfois ivoire dans son argenterie.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_07: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `art_adulte_editorial_07_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);


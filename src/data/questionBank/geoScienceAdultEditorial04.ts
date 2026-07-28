import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const GEOGRAPHY: Fact[] = [
  ['Quelle capitale est traversée par le fleuve Daugava ?', 'Riga', 'Tallinn', 'Vilnius', 'Minsk', 'La Daugava traverse Riga avant de se jeter dans le golfe du même nom.'],
  ['Dans quel pays se trouve la région historique de la Moravie ?', 'La Tchéquie', 'La Slovaquie', 'La Pologne', 'La Hongrie', 'La Moravie occupe l’est de la Tchéquie autour de villes comme Brno et Olomouc.'],
  ['Quel fleuve traverse Porto avant d’atteindre l’Atlantique ?', 'Le Douro', 'Le Tage', 'Le Guadiana', 'Le Minho', 'Le Douro sépare Porto de Vila Nova de Gaia, connue pour ses chais.'],
  ['Quelle île italienne est séparée de la Corse par les bouches de Bonifacio ?', 'La Sardaigne', 'La Sicile', 'Elbe', 'Capri', 'Les bouches de Bonifacio relient les mers Tyrrhénienne et Méditerranée occidentale.'],
  ['Quel pays possède l’archipel du Svalbard ?', 'La Norvège', 'Le Danemark', 'La Finlande', 'La Russie', 'Le traité du Svalbard reconnaît la souveraineté norvégienne sur cet archipel arctique.'],
  ['Quelle province belge a Mons pour chef-lieu ?', 'Le Hainaut', 'Namur', 'Liège', 'Le Brabant wallon', 'Mons est le chef-lieu du Hainaut et se situe près des bassins de la Haine et de l’Escaut.'],
  ['Quel canal belge est célèbre pour ses quatre ascenseurs hydrauliques historiques ?', 'Le canal du Centre', 'Le canal Albert', 'Le canal de Willebroek', 'Le canal de Gand-Terneuzen', 'Les ascenseurs historiques du canal du Centre sont inscrits au patrimoine mondial de l’UNESCO.'],
  ['Quelle rivière traverse la ville belge de Malines ?', 'La Dyle', 'La Lys', 'La Sambre', 'La Vesdre', 'La Dyle traverse Malines avant de contribuer, avec la Nèthe, à la formation du Rupel.'],
  ['Quel désert couvre une grande partie du Botswana ?', 'Le Kalahari', 'Le Namib', 'Le Sahara', 'Le Danakil', 'Le Kalahari est un vaste bassin sableux semi-aride partagé avec la Namibie et l’Afrique du Sud.'],
  ['Quel fleuve forme une partie de la frontière entre la Zambie et le Zimbabwe ?', 'Le Zambèze', 'Le Limpopo', 'L’Orange', 'Le Congo', 'Le Zambèze franchit les chutes Victoria sur cette frontière.'],
  ['Quelle capitale africaine se trouve sur l’île de Santiago ?', 'Praia', 'Bissau', 'São Tomé', 'Malabo', 'Praia est la capitale du Cap-Vert et la principale ville de l’île de Santiago.'],
  ['Quel pays a pour capitale Antananarivo ?', 'Madagascar', 'Maurice', 'Les Comores', 'Les Seychelles', 'Antananarivo est bâtie sur les hauts plateaux du centre de Madagascar.'],
  ['Quel fleuve traverse la ville canadienne de Montréal ?', 'Le Saint-Laurent', 'Le Fraser', 'Le Mackenzie', 'Le Yukon', 'Montréal occupe une île située au confluent du Saint-Laurent et de la rivière des Outaouais.'],
  ['Quel pays possède la Terre de Feu orientale, partagée avec le Chili ?', 'L’Argentine', 'L’Uruguay', 'Le Pérou', 'La Bolivie', 'La frontière argentino-chilienne partage la grande île de la Terre de Feu.'],
  ['Quelle capitale se trouve au pied du mont Wellington, en Tasmanie ?', 'Hobart', 'Canberra', 'Adélaïde', 'Darwin', 'Le kunanyi/Mont Wellington domine Hobart et l’estuaire de la Derwent.'],
  ['Quel détroit sépare l’île du Sud et l’île du Nord de la Nouvelle-Zélande ?', 'Le détroit de Cook', 'Le détroit de Bass', 'Le détroit de Torres', 'Le détroit de Foveaux', 'Le détroit de Cook relie la mer de Tasman à l’océan Pacifique.'],
  ['Quelle mer borde la Jordanie au sud par le golfe d’Aqaba ?', 'La mer Rouge', 'La mer Morte', 'La mer d’Arabie', 'La Méditerranée', 'Le court littoral jordanien donne sur le golfe d’Aqaba, branche nord de la mer Rouge.'],
  ['Quel fleuve traverse la capitale thaïlandaise Bangkok ?', 'Le Chao Phraya', 'Le Mékong', 'L’Irrawaddy', 'Le Salouen', 'Le delta du Chao Phraya constitue le cœur historique et agricole de la Thaïlande centrale.'],
  ['Quelle île chinoise se trouve face au golfe du Tonkin ?', 'Hainan', 'Taïwan', 'Hong Kong', 'Macao', 'Hainan est séparée de la péninsule de Leizhou par le détroit de Qiongzhou.'],
  ['Quel massif comprend le mont Everest ?', 'L’Himalaya', 'Le Karakoram', 'L’Hindou Kouch', 'Le Pamir', 'L’Everest se dresse dans le Mahalangur Himal, à la frontière entre Népal et Chine.'],
];

const SCIENCE: Fact[] = [
  ['Quel compartiment cellulaire contient l’essentiel de l’ADN d’une cellule humaine ?', 'Le noyau', 'L’appareil de Golgi', 'Le lysosome', 'Le réticulum endoplasmique', 'Une petite quantité d’ADN se trouve aussi dans les mitochondries.'],
  ['Quel neurotransmetteur est libéré à la jonction neuromusculaire ?', 'L’acétylcholine', 'La dopamine', 'La sérotonine', 'La mélatonine', 'L’acétylcholine déclenche une dépolarisation de la fibre musculaire.'],
  ['Quelle structure de l’œil règle principalement la quantité de lumière entrant par la pupille ?', 'L’iris', 'La rétine', 'Le cristallin', 'La cornée', 'Les muscles de l’iris modifient le diamètre de la pupille.'],
  ['Quel groupe animal comprend les grenouilles, salamandres et tritons ?', 'Les amphibiens', 'Les reptiles', 'Les poissons cartilagineux', 'Les mammifères', 'La plupart des amphibiens ont une peau perméable et un cycle lié à l’eau.'],
  ['Quel processus permet aux bactéries d’échanger directement de l’ADN par un pilus ?', 'La conjugaison', 'La traduction', 'La sporulation', 'La mitose', 'La conjugaison peut transférer des plasmides portant notamment des résistances aux antibiotiques.'],
  ['Quelle loi relie l’allongement d’un ressort à la force appliquée dans son domaine élastique ?', 'La loi de Hooke', 'La loi d’Ohm', 'La loi de Gauss', 'La loi de Wien', 'Dans ce domaine, la force de rappel est proportionnelle à l’allongement.'],
  ['Quelle unité mesure une capacité électrique ?', 'Le farad', 'Le henry', 'Le tesla', 'Le weber', 'Un condensateur d’un farad stocke un coulomb sous une tension d’un volt.'],
  ['Quel rayonnement électromagnétique possède une longueur d’onde plus courte que la lumière visible ?', 'L’ultraviolet', 'L’infrarouge', 'Les micro-ondes', 'Les ondes radio', 'L’ultraviolet est plus énergétique que le visible mais moins que les rayons X.'],
  ['Quel métal est le principal constituant de l’acier ?', 'Le fer', 'L’aluminium', 'Le cuivre', 'Le titane', 'L’acier est un alliage de fer contenant du carbone et parfois d’autres éléments.'],
  ['Quel gaz produit l’odeur caractéristique des œufs pourris ?', 'Le sulfure d’hydrogène', 'Le monoxyde de carbone', 'Le méthane', 'Le dioxyde d’azote', 'Le sulfure d’hydrogène est détectable à faible concentration mais devient toxique à dose élevée.'],
  ['Quelle planète est entourée des anneaux les plus visibles depuis la Terre ?', 'Saturne', 'Jupiter', 'Uranus', 'Neptune', 'Les anneaux de Saturne sont surtout constitués de particules de glace.'],
  ['Quel nom donne-t-on à l’explosion lumineuse produite à la surface d’une naine blanche en système binaire ?', 'Une nova', 'Une supernova', 'Un pulsar', 'Un quasar', 'Une nova thermonucléaire n’anéantit généralement pas la naine blanche, contrairement à une supernova de type Ia.'],
  ['Quel corps du Système solaire présente une atmosphère dense dominée par l’azote et des lacs de méthane ?', 'Titan', 'Europe', 'Io', 'La Lune', 'Titan, satellite de Saturne, possède un cycle météorologique d’hydrocarbures.'],
  ['Quelle frontière tectonique crée généralement une fosse océanique ?', 'Une zone de subduction', 'Une dorsale divergente', 'Un rift continental jeune', 'Une marge passive', 'La plaque plongeante courbe la lithosphère et forme une fosse profonde.'],
  ['Quel phénomène transforme les sédiments meubles en roche sédimentaire ?', 'La diagenèse', 'La fusion partielle', 'La subduction', 'La sublimation', 'Compaction et cimentation sont deux processus majeurs de la diagenèse.'],
  ['Quel instrument mesure la pression atmosphérique ?', 'Le baromètre', 'L’hygromètre', 'Le pyranomètre', 'L’anémomètre', 'La pression atmosphérique standard au niveau de la mer vaut environ 1 013 hectopascals.'],
  ['Quel gaz volcanique est généralement le plus abondant dans un magma riche en volatils ?', 'La vapeur d’eau', 'Le chlore', 'L’hélium', 'Le néon', 'La vapeur d’eau domine souvent les émissions volcaniques, devant le dioxyde de carbone et le dioxyde de soufre.'],
  ['Quelle couche océanique connaît une chute rapide de température avec la profondeur ?', 'La thermocline', 'La halocline', 'La pycnocline', 'La zone abyssale', 'La thermocline sépare souvent les eaux superficielles chaudes des eaux profondes froides.'],
  ['Quel biome est caractérisé par un pergélisol et une végétation basse sans arbres ?', 'La toundra', 'La taïga', 'La prairie tempérée', 'La savane', 'Le pergélisol limite l’enracinement et le drainage dans la toundra.'],
  ['Quel mécanisme astronomique produit les marées terrestres ?', 'Les différences d’attraction gravitationnelle de la Lune et du Soleil', 'La pression du vent solaire', 'Le champ magnétique terrestre', 'La rotation de la Lune seule', 'La Lune exerce l’effet dominant; le Soleil renforce ou atténue les marées selon l’alignement.'],
];

function build(categoryId: 'geographie' | 'sciences', prefix: string, facts: Fact[]): Question[] {
  return facts.map(([question, answer, a, b, c, explanation], i) => {
    const source = [answer, a, b, c];
    const options = source.map((_, j) => source[(j + i) % 4]);
    return { id: `${prefix}_${String(i + 1).padStart(3, '0')}`, categoryId, question, options,
      correctAnswerIndex: options.indexOf(answer), difficulty: 'adulte', explanation };
  });
}

export const GEOGRAPHIE_ADULTE_EDITORIAL_04 = build('geographie', 'geo_adulte_editorial_04', GEOGRAPHY);
export const SCIENCES_ADULTE_EDITORIAL_04 = build('sciences', 'sci_adulte_editorial_04', SCIENCE);

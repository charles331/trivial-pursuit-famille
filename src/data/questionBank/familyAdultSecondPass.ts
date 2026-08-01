import { CategoryId, Question } from '../../types';
import {
  echoesCorrectAnswer,
  normalize,
  paraphrasesSameFact,
  quotesAnswerProperName,
} from '../questionRules';

type Fact = [question: string, answer: string, extra: string];
type Card = [question: string, answer: string, distractor1: string, distractor2: string, distractor3: string, explanation: string];

function makeGroup(facts: Fact[]): Card[] {
  if (facts.length !== 10) throw new Error('Chaque groupe éditorial doit contenir dix faits.');
  return facts.map(([question, answer, extra], index) => [
    question,
    answer,
    facts[(index + 1) % facts.length][1],
    facts[(index + 3) % facts.length][1],
    facts[(index + 7) % facts.length][1],
    extra,
  ]);
}

function makeCategory(groups: Fact[][]): Card[] {
  return groups.flatMap(makeGroup);
}

const HISTORY = makeCategory([
  [
    ['Quel événement de 1789 marque symboliquement le début de la Révolution française ?', 'La prise de la Bastille', 'La forteresse parisienne fut prise le 14 juillet 1789.'],
    ['Quelle bataille de 1815 met définitivement fin au règne de Napoléon Ier ?', 'Waterloo', 'Elle se déroula dans l’actuelle Belgique, au sud de Bruxelles.'],
    ['Quel mur tombé en 1989 symbolisait la division de l’Europe ?', 'Le mur de Berlin', 'Sa chute précéda la réunification allemande de 1990.'],
    ['Quel paquebot sombra lors de son voyage inaugural en 1912 ?', 'Le Titanic', 'Le navire heurta un iceberg dans l’Atlantique Nord.'],
    ['Quel événement déclencha directement la Première Guerre mondiale ?', 'L’assassinat de François-Ferdinand', 'L’archiduc austro-hongrois fut tué à Sarajevo en juin 1914.'],
    ['Quelle opération alliée débuta sur les plages normandes le 6 juin 1944 ?', 'Le débarquement de Normandie', 'Cinq secteurs de plage furent utilisés par les forces alliées.'],
    ['Quelle révolution de 1830 donna naissance à la Belgique indépendante ?', 'La révolution belge', 'Les combats commencèrent à Bruxelles après une représentation de La Muette de Portici.'],
    ['Quel mouvement américain lutta contre la ségrégation raciale dans les années 1950 et 1960 ?', 'Le mouvement des droits civiques', 'Martin Luther King en fut l’une des grandes figures.'],
    ['Quelle catastrophe nucléaire survint en Ukraine soviétique en 1986 ?', 'Tchernobyl', 'L’accident toucha le réacteur numéro 4 de la centrale.'],
    ['Quel mouvement social français de 1968 mêla révolte étudiante et grève générale ?', 'Mai 68', 'Des millions de salariés participèrent aux grèves.'],
  ],
  [
    ['Quel roi des Belges était surnommé le Roi-Chevalier ?', 'Albert Ier', 'Il commanda l’armée belge durant la Première Guerre mondiale.'],
    ['Quelle souveraine donna son nom à l’époque victorienne au Royaume-Uni ?', 'La reine Victoria', 'Son règne dura de 1837 à 1901.'],
    ['Quel dirigeant britannique promettait du sang, du labeur, des larmes et de la sueur en 1940 ?', 'Winston Churchill', 'Il devint Premier ministre au moment de l’offensive allemande à l’ouest.'],
    ['Quel président français lança l’appel du 18 Juin depuis Londres ?', 'Charles de Gaulle', 'Cet appel de 1940 invitait à poursuivre le combat contre l’Allemagne nazie.'],
    ['Quel militant sud-africain devint président après vingt-sept ans de prison ?', 'Nelson Mandela', 'Il fut élu président en 1994 après la fin de l’apartheid.'],
    ['Quelle reine de France fut guillotinée pendant la Révolution ?', 'Marie-Antoinette', 'Épouse de Louis XVI, elle fut exécutée en octobre 1793.'],
    ['Quel empereur français fut sacré à Notre-Dame de Paris en 1804 ?', 'Napoléon Ier', 'Jacques-Louis David a représenté la cérémonie dans un célèbre tableau.'],
    ['Quel navigateur atteignit les Antilles en 1492 au service de l’Espagne ?', 'Christophe Colomb', 'Son expédition traversa l’Atlantique avec trois navires.'],
    ['Quel dirigeant soviétique lança la perestroïka dans les années 1980 ?', 'Mikhaïl Gorbatchev', 'Il associa cette réforme à la glasnost, une politique d’ouverture.'],
    ['Quel pharaon possède la tombe découverte presque intacte par Howard Carter ?', 'Toutânkhamon', 'La découverte de 1922 eut lieu dans la Vallée des Rois.'],
  ],
  [
    ['Quel traité signé en 1957 créa la Communauté économique européenne ?', 'Le traité de Rome', 'Six pays, dont la Belgique, en furent les signataires fondateurs.'],
    ['Quel accord de 1992 transforma la CEE en Union européenne ?', 'Le traité de Maastricht', 'Il posa aussi les bases de la monnaie unique.'],
    ['Quel traité de 1919 régla le sort de l’Allemagne après la Première Guerre mondiale ?', 'Le traité de Versailles', 'Il fut signé dans la galerie des Glaces du château.'],
    ['Quel accord mit officiellement fin à la Première Guerre mondiale le 11 novembre 1918 ?', 'L’armistice de Compiègne', 'Il fut signé dans un wagon en forêt de Compiègne.'],
    ['Quel plan américain aida à reconstruire l’Europe occidentale après 1945 ?', 'Le plan Marshall', 'Il porte le nom du secrétaire d’État américain George Marshall.'],
    ['Quelle alliance militaire occidentale fut fondée en 1949 ?', 'L’OTAN', 'Son siège politique se trouve aujourd’hui à Bruxelles.'],
    ['Quelle organisation internationale fut créée en 1945 pour préserver la paix ?', 'L’ONU', 'Sa Charte fut signée à San Francisco.'],
    ['Quel accord supprima progressivement les contrôles aux frontières entre plusieurs pays européens ?', 'L’accord de Schengen', 'Il fut signé en 1985 dans un village luxembourgeois.'],
    ['Quel pacte réunit la Belgique, les Pays-Bas et le Luxembourg ?', 'Le Benelux', 'Cette coopération précéda la construction européenne.'],
    ['Quel programme américain permit les premiers pas humains sur la Lune ?', 'Le programme Apollo', 'Apollo 11 se posa sur la Lune en juillet 1969.'],
  ],
  [
    ['Quelle civilisation construisit le Machu Picchu ?', 'Les Incas', 'La cité se trouve dans les Andes péruviennes.'],
    ['Quel peuple de l’Antiquité inventa une démocratie directe à Athènes ?', 'Les Grecs', 'Les citoyens athéniens votaient eux-mêmes certaines décisions.'],
    ['Quelle civilisation édifia le Colisée ?', 'Les Romains', 'L’amphithéâtre fut inauguré au Ier siècle à Rome.'],
    ['Quel peuple bâtit les pyramides de Gizeh ?', 'Les Égyptiens', 'Ces tombeaux royaux datent de l’Ancien Empire.'],
    ['Quelle civilisation utilisait les glyphes et construisait Chichén Itzá ?', 'Les Mayas', 'Elle se développa en Mésoamérique.'],
    ['Quel empire avait Constantinople pour capitale ?', 'L’Empire byzantin', 'La ville fut conquise par les Ottomans en 1453.'],
    ['Quel peuple scandinave mena des expéditions en Europe du VIIIe au XIe siècle ?', 'Les Vikings', 'Ils furent à la fois navigateurs, commerçants et guerriers.'],
    ['Quelle civilisation développa une vaste route entre Cuzco et les Andes ?', 'L’Empire inca', 'Son réseau routier reliait des régions sans utiliser la roue pour le transport.'],
    ['Quel empire domina une grande partie de l’Europe sous Charlemagne ?', 'L’Empire carolingien', 'Charlemagne fut couronné empereur à Rome en l’an 800.'],
    ['Quelle puissance contrôla une grande partie des Balkans jusqu’au XIXe siècle ?', 'L’Empire ottoman', 'Sa capitale européenne était Constantinople.'],
  ],
  [
    ['Quelle invention de Gutenberg accéléra la diffusion des livres en Europe ?', 'L’imprimerie à caractères mobiles', 'Sa Bible imprimée date du milieu du XVe siècle.'],
    ['Quelle machine de James Watt devint essentielle à la révolution industrielle ?', 'La machine à vapeur', 'Watt améliora fortement des modèles déjà existants.'],
    ['Quel moyen de transport relia Bruxelles à Malines dès 1835 ?', 'Le chemin de fer', 'Cette ligne fut la première ligne publique de voyageurs du continent européen.'],
    ['Quelle découverte de Fleming conduisit au premier antibiotique largement utilisé ?', 'La pénicilline', 'Fleming observa en 1928 qu’une moisissure empêchait des bactéries de pousser.'],
    ['Quelle invention des frères Lumière fut présentée au public en 1895 ?', 'Le cinématographe', 'L’appareil servait à filmer et à projeter des images animées.'],
    ['Quel appareil de Bell transmit la voix à distance ?', 'Le téléphone', 'Bell déposa un brevet célèbre en 1876.'],
    ['Quelle invention permit à Marconi de développer les communications sans fil ?', 'La radio', 'Ses expériences utilisaient les ondes électromagnétiques.'],
    ['Quel réseau informatique issu d’ARPANET s’ouvrit largement au public dans les années 1990 ?', 'Internet', 'Le Web de Tim Berners-Lee facilita ensuite la navigation entre les pages.'],
    ['Quel vaccin de Jenner protégeait contre une maladie aujourd’hui éradiquée ?', 'Le vaccin contre la variole', 'Jenner utilisa la vaccine pour provoquer une protection.'],
    ['Quel appareil des frères Wright réalisa un vol motorisé contrôlé en 1903 ?', 'L’avion', 'Le vol eut lieu à Kitty Hawk, aux États-Unis.'],
  ],
]);

const GEOGRAPHY = makeCategory([
  [
    ['Quelle ville est la capitale des Pays-Bas ?', 'Amsterdam', 'Le gouvernement et le Parlement néerlandais siègent toutefois à La Haye.'],
    ['Quelle capitale européenne est traversée par le Danube et divisée par le fleuve en Buda et Pest ?', 'Budapest', 'Les deux anciennes villes furent réunies en 1873.'],
    ['Quelle capitale portugaise se situe à l’embouchure du Tage ?', 'Lisbonne', 'La ville s’étend sur plusieurs collines près de l’Atlantique.'],
    ['Quelle capitale irlandaise est traversée par la Liffey ?', 'Dublin', 'La rivière sépare traditionnellement le nord et le sud de la ville.'],
    ['Quelle capitale finlandaise fait face au golfe de Finlande ?', 'Helsinki', 'Elle se trouve sur une péninsule entourée de nombreuses îles.'],
    ['Quelle capitale slovène est traversée par la Ljubljanica ?', 'Ljubljana', 'Son centre est dominé par un château installé sur une colline.'],
    ['Quelle capitale slovaque se trouve au bord du Danube près de l’Autriche ?', 'Bratislava', 'Vienne n’est située qu’à une soixantaine de kilomètres.'],
    ['Quelle capitale croate n’est pas située sur la côte adriatique ?', 'Zagreb', 'La ville se trouve au nord du pays, près de la Save.'],
    ['Quelle capitale européenne est bâtie sur quatorze îles entre le lac Mälar et la Baltique ?', 'Stockholm', 'Des dizaines de ponts relient ses quartiers centraux.'],
    ['Quelle capitale norvégienne se trouve au fond d’un fjord portant son nom ?', 'Oslo', 'L’Oslofjord ouvre la ville vers la mer du Nord.'],
  ],
  [
    ['Quel fleuve traverse Liège ?', 'La Meuse', 'Il traverse aussi Namur avant de gagner les Pays-Bas.'],
    ['Quel fleuve européen passe par Vienne, Bratislava, Budapest et Belgrade ?', 'Le Danube', 'Il se jette dans la mer Noire par un vaste delta.'],
    ['Quel fleuve traverse Cologne et Rotterdam avant de rejoindre la mer du Nord ?', 'Le Rhin', 'Il constitue un axe majeur du transport européen.'],
    ['Quel fleuve traverse Paris ?', 'La Seine', 'Elle se jette dans la Manche près du Havre.'],
    ['Quel fleuve traverse Londres ?', 'La Tamise', 'Son estuaire débouche dans la mer du Nord.'],
    ['Quel fleuve traverse Rome ?', 'Le Tibre', 'La ville antique s’est développée sur ses rives.'],
    ['Quel fleuve traverse Prague ?', 'La Vltava', 'Le pont Charles relie les deux rives dans le centre historique.'],
    ['Quel fleuve forme une partie de la frontière entre l’Allemagne et la Pologne ?', 'L’Oder', 'Il rejoint la mer Baltique par la lagune de Szczecin.'],
    ['Quel fleuve arrose Bordeaux avant de rejoindre l’estuaire de la Gironde ?', 'La Garonne', 'Elle rencontre la Dordogne au bec d’Ambès.'],
    ['Quel fleuve traverse Séville ?', 'Le Guadalquivir', 'Il est navigable jusqu’à l’océan Atlantique.'],
  ],
  [
    ['Quel massif sépare en grande partie la France et l’Espagne ?', 'Les Pyrénées', 'La principauté d’Andorre se trouve au cœur de ce massif.'],
    ['Quelle chaîne montagneuse traverse notamment la Suisse et l’Autriche ?', 'Les Alpes', 'Le mont Blanc en est le sommet le plus élevé d’Europe occidentale.'],
    ['Quel massif belge abrite le signal de Botrange ?', 'Les Hautes Fagnes', 'Le signal de Botrange est le point culminant de Belgique.'],
    ['Quelle chaîne longe l’ouest de l’Amérique du Sud ?', 'Les Andes', 'Elle s’étend sur environ sept mille kilomètres.'],
    ['Quel sommet est le plus élevé du monde au-dessus du niveau de la mer ?', 'L’Everest', 'Il se situe dans l’Himalaya, à la frontière du Népal et de la Chine.'],
    ['Quel volcan domine la baie de Naples ?', 'Le Vésuve', 'Son éruption de 79 ensevelit Pompéi et Herculanum.'],
    ['Quel volcan sicilien est le plus actif d’Europe ?', 'L’Etna', 'Il domine la côte orientale de la Sicile.'],
    ['Quel sommet japonais est reconnaissable à son cône presque symétrique ?', 'Le mont Fuji', 'Ce volcan culmine à 3 776 mètres.'],
    ['Quel désert couvre une grande partie de l’Afrique du Nord ?', 'Le Sahara', 'Il s’étend de l’Atlantique à la mer Rouge.'],
    ['Quelle plaine belge est connue pour ses paysages agricoles au sud de Bruxelles ?', 'La Hesbaye', 'Ses sols limoneux comptent parmi les plus fertiles du pays.'],
  ],
  [
    ['Quelle mer borde la côte belge ?', 'La mer du Nord', 'Le littoral belge mesure environ 67 kilomètres.'],
    ['Quelle mer sépare l’Europe de l’Afrique ?', 'La Méditerranée', 'Le détroit de Gibraltar la relie à l’Atlantique.'],
    ['Quelle mer se trouve entre la Suède, la Finlande et les pays baltes ?', 'La mer Baltique', 'Sa faible salinité vient des nombreux fleuves qui l’alimentent.'],
    ['Quel océan borde la côte ouest de l’Europe ?', 'L’océan Atlantique', 'Il sépare l’Europe et l’Afrique des Amériques.'],
    ['Quelle mer borde notamment la Bulgarie, la Roumanie et l’Ukraine ?', 'La mer Noire', 'Le Danube y forme un vaste delta.'],
    ['Quel détroit sépare l’Espagne du Maroc ?', 'Le détroit de Gibraltar', 'Il relie l’Atlantique à la Méditerranée.'],
    ['Quelle étendue d’eau sépare la Grande-Bretagne de la France ?', 'La Manche', 'Le tunnel sous la Manche relie les deux pays par voie ferrée.'],
    ['Quel golfe baigne Venise et la côte orientale italienne ?', 'La mer Adriatique', 'Cette mer étroite sépare l’Italie des Balkans.'],
    ['Quelle mer intérieure borde Israël et la Jordanie à très basse altitude ?', 'La mer Morte', 'Sa salinité est si forte que les baigneurs y flottent facilement.'],
    ['Quel canal relie la Méditerranée à la mer Rouge ?', 'Le canal de Suez', 'Ouvert en 1869, il évite aux navires de contourner l’Afrique.'],
  ],
  [
    ['À quelle province belge appartient la ville de Dinant ?', 'Namur', 'La ville s’étire le long de la Meuse au pied de sa citadelle.'],
    ['Spa est une commune de quelle province belge ?', 'Liège', 'La ville a donné son nom international aux établissements thermaux.'],
    ['Dans quelle province situer Bastogne ?', 'Luxembourg', 'La ville fut un lieu majeur de la bataille des Ardennes.'],
    ['Dans quelle province belge se trouve Waterloo ?', 'Le Brabant wallon', 'La célèbre bataille eut lieu en 1815.'],
    ['Dans quelle province belge se trouve Tongres ?', 'Le Limbourg', 'Elle est souvent présentée comme la plus ancienne ville de Belgique.'],
    ['Dans quelle province belge se trouve Ypres ?', 'La Flandre-Occidentale', 'La ville fut durement touchée pendant la Première Guerre mondiale.'],
    ['Dans quelle province belge se trouve Alost ?', 'La Flandre-Orientale', 'Son carnaval est inscrit au patrimoine culturel flamand.'],
    ['Dans quelle province belge se trouve Malines ?', 'Anvers', 'La ville se situe entre Bruxelles et Anvers.'],
    ['Dans quelle province belge se trouve Louvain ?', 'Le Brabant flamand', 'La ville accueille la KU Leuven.'],
    ['Dans quelle province belge se trouve La Louvière ?', 'Le Hainaut', 'Le canal du Centre et ses ascenseurs historiques se trouvent à proximité.'],
  ],
]);

const SCIENCE = makeCategory([
  [
    ['Quel organe filtre le sang et produit l’urine ?', 'Les reins', 'Chaque rein contient environ un million de néphrons.'],
    ['Quel organe fabrique l’insuline ?', 'Le pancréas', 'Les cellules bêta des îlots de Langerhans sécrètent cette hormone.'],
    ['Quel organe humain consomme environ un cinquième de l’énergie au repos ?', 'Le cerveau', 'Il utilise principalement du glucose et de l’oxygène.'],
    ['Quel organe propulse le sang dans tout le corps ?', 'Le cœur', 'Ses quatre cavités fonctionnent comme deux pompes coordonnées.'],
    ['Quel organe produit la bile ?', 'Le foie', 'La bile est ensuite stockée dans la vésicule biliaire.'],
    ['Dans quel organe les échanges d’oxygène ont-ils lieu dans les alvéoles ?', 'Les poumons', 'Les alvéoles offrent une très grande surface d’échange.'],
    ['Quel organe absorbe l’essentiel des nutriments ?', 'L’intestin grêle', 'Ses villosités augmentent fortement la surface d’absorption.'],
    ['Quel organe protège l’organisme et régule sa température par la transpiration ?', 'La peau', 'C’est le plus grand organe du corps humain.'],
    ['Quel organe stocke l’urine avant son évacuation ?', 'La vessie', 'Ses parois musculaires se contractent lors de la miction.'],
    ['Quel organe contient l’acide chlorhydrique utile à la digestion ?', 'L’estomac', 'Sa muqueuse le protège contre sa propre acidité.'],
  ],
  [
    ['Quel symbole chimique désigne l’or ?', 'Au', 'Il vient du latin aurum.'],
    ['Quel symbole chimique désigne le fer ?', 'Fe', 'Il vient du latin ferrum.'],
    ['Quel symbole chimique désigne l’argent ?', 'Ag', 'Il vient du latin argentum.'],
    ['Quel symbole chimique désigne le cuivre ?', 'Cu', 'Il vient du latin cuprum.'],
    ['Quel symbole chimique désigne le sodium ?', 'Na', 'Il vient du latin natrium.'],
    ['Quel symbole chimique désigne le potassium ?', 'K', 'Il vient du latin kalium.'],
    ['Quel symbole chimique désigne le plomb ?', 'Pb', 'Il vient du latin plumbum.'],
    ['Quel symbole chimique désigne le mercure ?', 'Hg', 'Il vient du grec hydrargyrum, qui évoque un argent liquide.'],
    ['Quel symbole chimique désigne l’étain ?', 'Sn', 'Il vient du latin stannum.'],
    ['Quel symbole chimique désigne le tungstène ?', 'W', 'La lettre vient de son autre nom, wolfram.'],
  ],
  [
    ['Quelle unité mesure une force ?', 'Le newton', 'Un newton accélère une masse d’un kilogramme d’un mètre par seconde carrée.'],
    ['Quelle unité mesure une puissance ?', 'Le watt', 'Un watt correspond à un joule par seconde.'],
    ['Quelle unité mesure une fréquence ?', 'Le hertz', 'Un hertz correspond à un cycle par seconde.'],
    ['Quelle unité mesure une résistance électrique ?', 'L’ohm', 'Son symbole est la lettre grecque oméga.'],
    ['Quelle unité mesure une tension électrique ?', 'Le volt', 'Elle porte le nom du savant italien Alessandro Volta.'],
    ['Quelle unité mesure une intensité électrique ?', 'L’ampère', 'Elle porte le nom du physicien André-Marie Ampère.'],
    ['Quelle unité mesure une énergie dans le Système international ?', 'Le joule', 'On utilise aussi le kilowattheure pour l’électricité domestique.'],
    ['Quelle unité mesure une pression dans le Système international ?', 'Le pascal', 'La pression atmosphérique vaut environ cent mille pascals.'],
    ['Quelle unité mesure une température absolue ?', 'Le kelvin', 'Zéro kelvin correspond au zéro absolu.'],
    ['Quelle unité mesure une charge électrique ?', 'Le coulomb', 'Elle porte le nom du physicien Charles-Augustin de Coulomb.'],
  ],
  [
    ['Quel phénomène décompose la lumière blanche en couleurs dans un prisme ?', 'La dispersion', 'Les différentes longueurs d’onde sont déviées différemment.'],
    ['Quel phénomène fait paraître un bâton cassé lorsqu’il plonge dans l’eau ?', 'La réfraction', 'La lumière change de direction en passant de l’air à l’eau.'],
    ['Quel phénomène renvoie la lumière sur un miroir ?', 'La réflexion', 'L’angle réfléchi est égal à l’angle d’incidence.'],
    ['Quel phénomène transforme directement un solide en gaz ?', 'La sublimation', 'La glace carbonique en fournit un exemple visible.'],
    ['Quel phénomène transforme un gaz en liquide ?', 'La condensation', 'La vapeur d’eau forme ainsi des gouttelettes sur une surface froide.'],
    ['Quel phénomène entraîne la chute des objets vers la Terre ?', 'La gravitation', 'Elle dépend de la masse des objets et de leur distance.'],
    ['Quel phénomène explique l’attraction de petits papiers par une règle frottée ?', 'L’électricité statique', 'Le frottement déplace des charges électriques.'],
    ['Quel phénomène protège partiellement la Terre du vent solaire ?', 'Le champ magnétique terrestre', 'Il guide aussi l’aiguille d’une boussole.'],
    ['Quel phénomène produit un son plus aigu quand une ambulance approche ?', 'L’effet Doppler', 'La fréquence perçue change avec le mouvement de la source.'],
    ['Quel phénomène courbe la trajectoire apparente des vents sur une Terre en rotation ?', 'L’effet Coriolis', 'Il influence notamment le sens de rotation des grands cyclones.'],
  ],
  [
    ['Quelle planète est la plus proche du Soleil ?', 'Mercure', 'Elle effectue une révolution en seulement 88 jours terrestres.'],
    ['Quelle planète possède la Grande Tache rouge ?', 'Jupiter', 'Cette tache est une gigantesque tempête.'],
    ['Quelle planète est célèbre pour ses anneaux visibles ?', 'Saturne', 'Ses anneaux sont surtout composés de glace et de roche.'],
    ['Quelle planète est surnommée la planète rouge ?', 'Mars', 'La couleur vient d’oxydes de fer présents dans son sol.'],
    ['Quelle planète tourne presque couchée sur son orbite ?', 'Uranus', 'Son axe de rotation est incliné d’environ 98 degrés.'],
    ['Quelle planète est la plus chaude du Système solaire ?', 'Vénus', 'Son épaisse atmosphère provoque un effet de serre extrême.'],
    ['Quelle planète est la plus éloignée du Soleil depuis le reclassement de Pluton ?', 'Neptune', 'Elle met près de 165 ans à faire le tour du Soleil.'],
    ['Quel astre provoque principalement les marées sur Terre ?', 'La Lune', 'Son attraction crée deux renflements dans les océans.'],
    ['Quelle étoile est la plus proche de la Terre ?', 'Le Soleil', 'Sa lumière met un peu plus de huit minutes à nous parvenir.'],
    ['Dans quelle galaxie se trouve le Système solaire ?', 'La Voie lactée', 'Le Soleil se trouve dans l’un de ses bras spiraux.'],
  ],
]);

const CINEMA = makeCategory([
  [
    ['Dans quel film un archéologue affronte-t-il les nazis pour retrouver l’Arche d’alliance ?', 'Les Aventuriers de l’arche perdue', 'Le film de Steven Spielberg sortit en 1981.'],
    ['Dans quel film un requin terrorise-t-il la station balnéaire d’Amity ?', 'Les Dents de la mer', 'La musique menaçante est signée John Williams.'],
    ['Dans quel film Marty McFly voyage-t-il en 1955 à bord d’une DeLorean ?', 'Retour vers le futur', 'Le véhicule est transformé en machine temporelle par Doc Brown.'],
    ['Dans quel film un extraterrestre veut-il téléphoner chez lui ?', 'E.T.', 'Le jeune Elliott aide la créature à retourner auprès des siens.'],
    ['Dans quel film Rocky Balboa affronte-t-il Apollo Creed ?', 'Rocky', 'Le premier film de la saga sortit en 1976.'],
    ['Dans quel film Jack et Rose voyagent-ils sur un paquebot promis au naufrage ?', 'Titanic', 'James Cameron mêle une histoire fictive au naufrage de 1912.'],
    ['Dans quel film un parc expose-t-il des dinosaures recréés par génétique ?', 'Jurassic Park', 'Le parc se trouve sur l’île fictive d’Isla Nublar.'],
    ['Dans quel film Neo découvre-t-il que sa réalité est une simulation ?', 'Matrix', 'Morpheus lui propose de choisir entre une pilule rouge et une bleue.'],
    ['Dans quel film un gladiateur nommé Maximus cherche-t-il à venger sa famille ?', 'Gladiator', 'L’intrigue se déroule sous le règne fictif de Commode.'],
    ['Dans quel film Forrest raconte-t-il sa vie depuis un banc public ?', 'Forrest Gump', 'Le personnage traverse plusieurs décennies de l’histoire américaine.'],
  ],
  [
    ['Quel acteur belge joue un soldat américain dans « Universal Soldier » ?', 'Jean-Claude Van Damme', 'Le Bruxellois est surnommé JCVD.'],
    ['Quel acteur incarne Jack Sparrow dans « Pirates des Caraïbes » ?', 'Johnny Depp', 'Le personnage commande notamment le Black Pearl.'],
    ['Quelle actrice joue Hermione Granger dans les films « Harry Potter » ?', 'Emma Watson', 'Elle avait onze ans à la sortie du premier film.'],
    ['Quel acteur incarne Iron Man dans l’univers Marvel ?', 'Robert Downey Jr.', 'Son premier film dans ce rôle sortit en 2008.'],
    ['Quelle actrice incarne Katniss Everdeen dans « Hunger Games » ?', 'Jennifer Lawrence', 'Katniss vient du district 12 de Panem.'],
    ['Quel acteur joue le Joker dans « The Dark Knight » ?', 'Heath Ledger', 'Son interprétation lui valut un Oscar posthume.'],
    ['Quelle actrice interprète Mary Poppins dans le film de 1964 ?', 'Julie Andrews', 'Elle reçut l’Oscar de la meilleure actrice pour ce rôle.'],
    ['Quel acteur incarne le boxeur Rocky Balboa ?', 'Sylvester Stallone', 'Stallone écrivit aussi le scénario du premier film.'],
    ['Quelle actrice joue Vivian dans « Pretty Woman » ?', 'Julia Roberts', 'Elle partage l’affiche avec Richard Gere.'],
    ['Quel acteur incarne le professeur Indiana Jones ?', 'Harrison Ford', 'Le personnage enseigne l’archéologie entre ses aventures.'],
  ],
  [
    ['Quel réalisateur a tourné « Jurassic Park » et « E.T. » ?', 'Steven Spielberg', 'Il a aussi réalisé La Liste de Schindler.'],
    ['Quel réalisateur a signé « Titanic » et « Avatar » ?', 'James Cameron', 'Ses films utilisent souvent des innovations techniques majeures.'],
    ['Quel réalisateur néo-zélandais a porté « Le Seigneur des anneaux » au cinéma ?', 'Peter Jackson', 'La trilogie fut largement tournée en Nouvelle-Zélande.'],
    ['Quel réalisateur français a créé « Le Cinquième Élément » ?', 'Luc Besson', 'Le film réunit Bruce Willis et Milla Jovovich.'],
    ['Quel réalisateur est connu pour « Pulp Fiction » ?', 'Quentin Tarantino', 'Le film remporta la Palme d’or en 1994.'],
    ['Quel réalisateur a créé la trilogie « Retour vers le futur » ?', 'Robert Zemeckis', 'Il réalisa également Forrest Gump.'],
    ['Quel réalisateur a signé « Inception » et la trilogie « The Dark Knight » ?', 'Christopher Nolan', 'Il privilégie souvent les effets réalisés directement sur le plateau.'],
    ['Quel réalisateur français a tourné « Bienvenue chez les Ch’tis » ?', 'Dany Boon', 'Le film se déroule principalement à Bergues.'],
    ['Quel réalisateur italien a signé « La vie est belle » ?', 'Roberto Benigni', 'Il y tient aussi le rôle principal.'],
    ['Quel réalisateur a créé « Edward aux mains d’argent » ?', 'Tim Burton', 'Son univers mêle souvent gothique, humour et personnages marginaux.'],
  ],
  [
    ['Quel film belge suit deux tueurs accompagnés par une équipe de tournage ?', 'C’est arrivé près de chez vous', 'Ce faux documentaire noir révéla Benoît Poelvoorde.'],
    ['Quel film belge des frères Dardenne remporta la Palme d’or en 1999 ?', 'Rosetta', 'Émilie Dequenne y joue une jeune femme cherchant un emploi.'],
    ['Quel film français raconte l’amitié entre Philippe et Driss ?', 'Intouchables', 'François Cluzet et Omar Sy tiennent les rôles principaux.'],
    ['Quel film de Dany Boon se déroule dans un bureau de poste du Nord ?', 'Bienvenue chez les Ch’tis', 'Le personnage principal est muté à Bergues.'],
    ['Quel film met en scène les visiteurs médiévaux Godefroy et Jacquouille ?', 'Les Visiteurs', 'Jean Reno et Christian Clavier forment le duo central.'],
    ['Quel film de Louis de Funès se déroule dans une brigade de Saint-Tropez ?', 'Le Gendarme de Saint-Tropez', 'Le maréchal des logis Cruchot y rejoint la brigade.'],
    ['Quel film musical français suit le professeur Clément Mathieu dans un pensionnat ?', 'Les Choristes', 'La chanson Vois sur ton chemin y est interprétée par la chorale.'],
    ['Quel film raconte la résistance d’un village gaulois à Jules César ?', 'Astérix et Obélix : Mission Cléopâtre', 'Alain Chabat réalisa cette comédie sortie en 2002.'],
    ['Quel film belge met en scène Dieu vivant à Bruxelles avec sa fille Ea ?', 'Le Tout Nouveau Testament', 'Le film de Jaco Van Dormael sortit en 2015.'],
    ['Quel film français suit Amélie Poulain dans le quartier de Montmartre ?', 'Le Fabuleux Destin d’Amélie Poulain', 'Audrey Tautou incarne l’héroïne du film.'],
  ],
  [
    ['Comment appelle-t-on un film qui poursuit l’histoire d’un précédent épisode ?', 'Une suite', 'Une suite reprend le même univers après les événements du premier récit.'],
    ['Comment appelle-t-on un film qui raconte ce qui s’est passé avant une œuvre connue ?', 'Une préquelle', 'Le récit revient aux origines des personnages ou de l’intrigue.'],
    ['Quel travail remplace les voix originales d’un film par celles d’une autre langue ?', 'Le doublage', 'Les comédiens adaptent leur jeu au mouvement des lèvres.'],
    ['Quel document décrit les scènes et les dialogues avant le tournage ?', 'Le scénario', 'Il sert de base de travail aux acteurs et à l’équipe technique.'],
    ['Quelle séquence présente les noms de l’équipe au début ou à la fin d’un film ?', 'Le générique', 'Sa conception peut elle-même être très créative.'],
    ['Quelle étape assemble les plans tournés pour construire le rythme du film ?', 'Le montage', 'Le monteur choisit l’ordre et la durée des plans.'],
    ['Quel terme désigne les images tournées mais coupées au montage ?', 'Les scènes supprimées', 'Elles figurent parfois parmi les bonus d’une édition vidéo.'],
    ['Quel métier coordonne les cascades et veille à leur sécurité ?', 'Le coordinateur de cascades', 'Il prépare les mouvements avec les comédiens et cascadeurs.'],
    ['Quel terme désigne une courte apparition surprise d’une personnalité dans un film ?', 'Un caméo', 'Alfred Hitchcock en faisait souvent dans ses propres films.'],
    ['Quel document dessiné prépare les plans d’une scène avant le tournage ?', 'Le storyboard', 'Il ressemble à une bande dessinée technique du futur film.'],
  ],
]);

const ART = makeCategory([
  [
    ['Dans quel musée bruxellois peut-on voir de nombreuses œuvres de René Magritte ?', 'Le musée Magritte', 'Il occupe une partie des Musées royaux des Beaux-Arts.'],
    ['Quel musée parisien expose « La Joconde » ?', 'Le Louvre', 'Le tableau est protégé derrière une vitre dans la salle des États.'],
    ['Quel musée d’Amsterdam conserve « La Ronde de nuit » ?', 'Le Rijksmuseum', 'Cette grande toile de Rembrandt date du XVIIe siècle.'],
    ['Quel musée de Paris occupe une ancienne gare et présente les impressionnistes ?', 'Le musée d’Orsay', 'L’horloge de l’ancienne gare est toujours visible.'],
    ['Quel musée madrilène expose « Les Ménines » de Velázquez ?', 'Le Prado', 'Le musée possède une importante collection royale espagnole.'],
    ['Quel musée londonien expose la pierre de Rosette ?', 'Le British Museum', 'La pierre permit de déchiffrer les hiéroglyphes égyptiens.'],
    ['Quel musée anversois est consacré à l’imprimeur Christophe Plantin ?', 'Le musée Plantin-Moretus', 'Ses archives et anciennes presses sont classées par l’UNESCO.'],
    ['Quel musée de Bilbao est célèbre pour son bâtiment couvert de titane ?', 'Le Guggenheim', 'Frank Gehry conçut ce bâtiment inauguré en 1997.'],
    ['Quel musée florentin conserve « La Naissance de Vénus » ?', 'La galerie des Offices', 'La collection occupe un palais proche de l’Arno.'],
    ['Quel musée new-yorkais est couramment appelé le MoMA ?', 'Le Museum of Modern Art', 'Il conserve notamment La Nuit étoilée de Van Gogh.'],
  ],
  [
    ['Quel peintre belge a représenté une pipe avec la phrase « Ceci n’est pas une pipe » ?', 'René Magritte', 'L’œuvre s’intitule La Trahison des images.'],
    ['Quel peintre a réalisé « La Nuit étoilée » ?', 'Vincent van Gogh', 'Il peignit cette vue en 1889 depuis Saint-Rémy-de-Provence.'],
    ['Quel artiste espagnol a peint « Guernica » ?', 'Pablo Picasso', 'La toile dénonce le bombardement de la ville basque en 1937.'],
    ['Quel peintre a représenté « La Persistance de la mémoire » et ses montres molles ?', 'Salvador Dalí', 'Cette petite toile surréaliste date de 1931.'],
    ['Quel peintre français a créé la série des « Nymphéas » ?', 'Claude Monet', 'Son jardin de Giverny lui servit de modèle.'],
    ['Quel artiste a peint le plafond de la chapelle Sixtine ?', 'Michel-Ange', 'Il travailla au plafond entre 1508 et 1512.'],
    ['Quel peintre norvégien a créé « Le Cri » ?', 'Edvard Munch', 'Le paysage rougeoyant s’inspire d’une promenade près d’Oslo.'],
    ['Quel peintre néerlandais a réalisé « La Jeune Fille à la perle » ?', 'Johannes Vermeer', 'Le tableau est parfois surnommé la Joconde du Nord.'],
    ['Quel peintre flamand a réalisé « La Descente de croix » de la cathédrale d’Anvers ?', 'Pierre Paul Rubens', 'Ce triptyque monumental date du début du XVIIe siècle.'],
    ['Quel artiste américain a transformé les boîtes de soupe Campbell en icônes ?', 'Andy Warhol', 'Ses sérigraphies sont emblématiques du pop art.'],
  ],
  [
    ['Quel style architectural reconnaît-on aux arcs brisés et aux grandes rosaces ?', 'Le gothique', 'Les arcs-boutants permettent d’élever de hauts murs percés de vitraux.'],
    ['Quel mouvement artistique privilégiait la lumière et les impressions fugitives ?', 'L’impressionnisme', 'Son nom vient d’un tableau de Claude Monet.'],
    ['Quel mouvement de Magritte et Dalí explorait les rêves et l’inconscient ?', 'Le surréalisme', 'André Breton en publia le manifeste en 1924.'],
    ['Quel mouvement artistique décompose les formes en facettes géométriques ?', 'Le cubisme', 'Picasso et Braque en furent deux pionniers.'],
    ['Quel style bruxellois de Victor Horta privilégie courbes végétales et fer forgé ?', 'L’Art nouveau', 'Il s’épanouit autour de 1900.'],
    ['Quel mouvement utilise les images de publicité et de consommation ?', 'Le pop art', 'Il se développa surtout au Royaume-Uni et aux États-Unis.'],
    ['Quel style du XVIIe siècle recherche mouvement, contraste et théâtralité ?', 'Le baroque', 'Rubens et Le Bernin en sont des figures majeures.'],
    ['Quel mouvement peint les émotions avec des couleurs intenses et des formes déformées ?', 'L’expressionnisme', 'Il se développa notamment en Allemagne au début du XXe siècle.'],
    ['Quel courant représente des scènes de la vie quotidienne sans les idéaliser ?', 'Le réalisme', 'Courbet en fut une figure importante au XIXe siècle.'],
    ['Quel style né au XVe siècle redécouvrit les modèles de l’Antiquité ?', 'La Renaissance', 'La perspective mathématique transforma notamment la peinture.'],
  ],
  [
    ['Quel héros de bande dessinée belge voyage avec le capitaine Haddock ?', 'Tintin', 'Hergé créa le reporter en 1929.'],
    ['Quel cow-boy de bande dessinée tire plus vite que son ombre ?', 'Lucky Luke', 'Morris créa le personnage en 1946.'],
    ['Quel groom travaille au Moustic Hôtel avant de vivre de nombreuses aventures ?', 'Spirou', 'Le costume rouge rappelle son premier métier.'],
    ['Quel jeune Gaulois accompagne Obélix et le chien Idéfix ?', 'Astérix', 'René Goscinny et Albert Uderzo lancèrent la série en 1959.'],
    ['Quel petit garçon belge est accompagné de son chien Bill ?', 'Boule', 'Jean Roba créa cette série humoristique.'],
    ['Quel chat philosophe a été créé par Philippe Geluck ?', 'Le Chat', 'Le personnage apparut dans le journal Le Soir en 1983.'],
    ['Quel marin mange des épinards pour devenir très fort ?', 'Popeye', 'Le personnage apparut d’abord dans un comic strip américain.'],
    ['Quel reporter du journal Spirou est l’ami du Marsupilami ?', 'Fantasio', 'Il forme avec Spirou un duo d’aventuriers.'],
    ['Quel milliardaire écossais de Disney nage dans son coffre-fort ?', 'Picsou', 'Carl Barks créa l’oncle de Donald en 1947.'],
    ['Quel héros de BD recueilli par les Vikings vient en réalité des étoiles ?', 'Thorgal', 'La série mêle mythologie nordique et science-fiction.'],
  ],
  [
    ['Quel monument bruxellois représente un cristal de fer agrandi ?', 'L’Atomium', 'Il fut construit pour l’Expo 58.'],
    ['Quelle statue antique sans bras est exposée au Louvre ?', 'La Vénus de Milo', 'Elle fut découverte sur l’île grecque de Milos en 1820.'],
    ['Quelle sculpture de Rodin représente un homme assis, le menton sur la main ?', 'Le Penseur', 'Elle fut conçue à l’origine pour La Porte de l’Enfer.'],
    ['Quel monument parisien fut construit pour l’Exposition universelle de 1889 ?', 'La tour Eiffel', 'Gustave Eiffel dirigea sa construction.'],
    ['Quel bâtiment romain possède une coupole percée d’un oculus ?', 'Le Panthéon', 'Son intérieur reçoit la lumière par une ouverture centrale.'],
    ['Quel palais andalou est célèbre pour ses décors islamiques à Grenade ?', 'L’Alhambra', 'Son nom arabe évoque la couleur rouge de ses murs.'],
    ['Quelle cathédrale espagnole est toujours en construction à Barcelone ?', 'La Sagrada Família', 'Antoni Gaudí consacra une grande partie de sa vie au projet.'],
    ['Quel monument indien en marbre blanc fut construit par Shah Jahan ?', 'Le Taj Mahal', 'Ce mausolée se trouve à Agra.'],
    ['Quel arc parisien domine la place Charles-de-Gaulle ?', 'L’Arc de Triomphe', 'Napoléon en ordonna la construction en 1806.'],
    ['Quel palais bruxellois domine le quartier des Marolles depuis la place Poelaert ?', 'Le palais de justice', 'Joseph Poelaert conçut cet immense édifice du XIXe siècle.'],
  ],
]);

const SPORTS = makeCategory([
  [
    ['Quel coureur belge est surnommé le Cannibale ?', 'Eddy Merckx', 'Il a remporté cinq Tours de France et cinq Tours d’Italie.'],
    ['Quelle joueuse belge a remporté quatre fois Roland-Garros ?', 'Justine Henin', 'Elle a gagné sept titres du Grand Chelem en simple.'],
    ['Quelle joueuse belge a remporté l’US Open en 2005, 2009 et 2010 ?', 'Kim Clijsters', 'Elle retrouva la première place mondiale après être devenue mère.'],
    ['Quel gardien belge a remporté la Ligue des champions 2022 avec le Real Madrid ?', 'Thibaut Courtois', 'Il fut élu meilleur joueur de la finale.'],
    ['Quel cycliste belge devint champion du monde sur route en 2022 ?', 'Remco Evenepoel', 'Il s’imposa en solitaire à Wollongong.'],
    ['Quel gardien belge joua au Bayern Munich dans les années 1980 ?', 'Jean-Marie Pfaff', 'Il fut élu meilleur gardien du Mondial 1986.'],
    ['Quelle athlète belge fut championne olympique du saut en hauteur en 2008 ?', 'Tia Hellebaut', 'Elle franchit 2,05 mètres à Pékin.'],
    ['Quel footballeur belge détient le record de sélections chez les Diables Rouges ?', 'Jan Vertonghen', 'Le défenseur a dépassé les 150 sélections.'],
    ['Quelle judokate belge remporta l’or olympique à Atlanta en 1996 ?', 'Ulla Werbrouck', 'Elle combattait dans la catégorie des moins de 72 kg.'],
    ['Quel pilote belge termina deuxième des 24 Heures du Mans à trois reprises ?', 'Jacky Ickx', 'Il a remporté la course six fois au total.'],
  ],
  [
    ['Combien de joueurs une équipe de football aligne-t-elle au coup d’envoi ?', 'Onze', 'Ce total comprend le gardien de but.'],
    ['Combien de points vaut un essai au rugby à XV ?', 'Cinq', 'Une transformation réussie ajoute deux points.'],
    ['Combien de sets faut-il gagner dans un match de tennis masculin du Grand Chelem ?', 'Trois', 'Ces rencontres se jouent au meilleur des cinq sets.'],
    ['Combien de joueurs une équipe de basket aligne-t-elle sur le terrain ?', 'Cinq', 'Les remplacements sont illimités lors des arrêts de jeu.'],
    ['Combien de trous compte un parcours complet de golf ?', 'Dix-huit', 'Un demi-parcours en compte généralement neuf.'],
    ['Combien de points vaut un tir réussi derrière la grande ligne au basket ?', 'Trois', 'La ligne à trois points varie légèrement selon les compétitions.'],
    ['Combien de joueurs une équipe de volley aligne-t-elle sur le terrain ?', 'Six', 'Les joueurs tournent de position après avoir gagné le service adverse.'],
    ['Combien de minutes dure normalement un match de handball senior ?', 'Soixante', 'La rencontre comporte deux périodes de trente minutes.'],
    ['Combien de pierres chaque équipe lance-t-elle par manche au curling ?', 'Huit', 'Une partie internationale compte généralement dix manches.'],
    ['Combien de tours de piste représentent 1 500 mètres sur une piste de 400 mètres ?', 'Trois tours et trois quarts', 'Le départ est placé trois cents mètres avant la ligne.'],
  ],
  [
    ['Quel tournoi de tennis se joue sur terre battue à Paris ?', 'Roland-Garros', 'Il se déroule près de la porte d’Auteuil.'],
    ['Quelle course cycliste belge relie généralement Liège à Bastogne puis revient ?', 'Liège-Bastogne-Liège', 'Surnommée la Doyenne, elle fut créée en 1892.'],
    ['Quel Grand Prix de Formule 1 se déroule à Spa-Francorchamps ?', 'Le Grand Prix de Belgique', 'Le circuit est célèbre pour le raidillon de l’Eau Rouge.'],
    ['Quelle classique cycliste se termine sur le vélodrome de Roubaix ?', 'Paris-Roubaix', 'Ses secteurs pavés lui valent le surnom d’Enfer du Nord.'],
    ['Quel tournoi de tennis londonien se joue sur gazon ?', 'Wimbledon', 'Les joueurs y portent traditionnellement une tenue blanche.'],
    ['Quelle course automobile française dure une journée et une nuit ?', 'Les 24 Heures du Mans', 'Elle se dispute en grande partie sur des routes habituellement ouvertes.'],
    ['Quelle course populaire belge traverse chaque année plusieurs communes de la capitale ?', 'Les 20 km de Bruxelles', 'Le départ et l’arrivée se situent au parc du Cinquantenaire.'],
    ['Quelle compétition cycliste attribue un maillot jaune à son leader ?', 'Le Tour de France', 'Le classement général se calcule au temps cumulé.'],
    ['Quel tournoi de rugby réunit chaque année six nations européennes ?', 'Le Tournoi des Six Nations', 'Il rassemble Angleterre, Écosse, Galles, Irlande, France et Italie.'],
    ['Quelle course cycliste flamande est surnommée le Ronde ?', 'Le Tour des Flandres', 'Elle est célèbre pour ses monts pavés.'],
  ],
  [
    ['Quel sport pratiquent les Red Lions belges ?', 'Le hockey sur gazon', 'Ils ont remporté l’or olympique à Tokyo.'],
    ['Quel sport utilise un volant ?', 'Le badminton', 'Le volant peut dépasser 300 km/h lors d’un smash.'],
    ['Quel sport se joue avec une pierre et des balais sur la glace ?', 'Le curling', 'Les balais modifient légèrement la trajectoire de la pierre.'],
    ['Quel sport combine ski de fond et tir à la carabine ?', 'Le biathlon', 'Chaque erreur au tir entraîne une pénalité.'],
    ['Quel sport utilise un fleuret, une épée ou un sabre ?', 'L’escrime', 'Les trois armes ont des surfaces valables différentes.'],
    ['Quelle discipline olympique combine course, natation, escrime, tir et obstacles ?', 'Le pentathlon moderne', 'L’équitation a été remplacée par une course d’obstacles dans le nouveau format.'],
    ['Quel sport oppose deux équipes dans une piscine avec un ballon ?', 'Le water-polo', 'Les joueurs n’ont pas le droit de toucher le fond.'],
    ['Quel sport de combat japonais cherche souvent à marquer un ippon ?', 'Le judo', 'Un ippon met immédiatement fin au combat.'],
    ['Quel sport se pratique sur une table avec de petites raquettes ?', 'Le tennis de table', 'Une manche se joue généralement en onze points.'],
    ['Quel sport de glace se danse en couple avec portés et figures ?', 'Le patinage artistique', 'Les juges évaluent difficulté technique et présentation.'],
  ],
  [
    ['Quel pays a remporté la Coupe du monde de football 2018 ?', 'La France', 'La finale contre la Croatie se termina sur le score de 4-2.'],
    ['Quel pays a remporté l’Euro de football 2016 ?', 'Le Portugal', 'La finale fut gagnée contre la France après prolongation.'],
    ['Quel pays a accueilli les Jeux olympiques d’été de 2016 ?', 'Le Brésil', 'Les compétitions se déroulèrent principalement à Rio de Janeiro.'],
    ['Quel pays a remporté la première Coupe du monde de football en 1930 ?', 'L’Uruguay', 'Le pays accueillait également le tournoi.'],
    ['Quel pays est à l’origine du sumo ?', 'Le Japon', 'Les combats professionnels suivent de nombreux rituels shinto.'],
    ['Quel pays est associé à la haka de l’équipe de rugby des All Blacks ?', 'La Nouvelle-Zélande', 'Cette danse māorie précède de nombreux matchs.'],
    ['Quel pays a inventé le curling moderne ?', 'L’Écosse', 'Des pierres anciennes y ont été retrouvées avec des dates gravées.'],
    ['Quel pays a accueilli les Jeux olympiques antiques ?', 'La Grèce', 'Ils se déroulaient à Olympie.'],
    ['Quel pays a remporté la Coupe du monde de rugby 2023 ?', 'L’Afrique du Sud', 'Les Springboks battirent les All Blacks d’un point en finale.'],
    ['Quel pays accueille chaque année le tournoi de tennis de l’Open d’Australie ?', 'L’Australie', 'Le tournoi se déroule à Melbourne en janvier.'],
  ],
]);

const POPCULTURE = makeCategory([
  [
    ['Quel chanteur belge interprète « Alors on danse » ?', 'Stromae', 'Le titre connut un succès international en 2010.'],
    ['Quel chanteur belge a écrit « Ne me quitte pas » ?', 'Jacques Brel', 'La chanson fut enregistrée pour la première fois en 1959.'],
    ['Quelle chanteuse belge interprète « Balance ton quoi » ?', 'Angèle', 'Le titre figure sur son album Brol.'],
    ['Quel chanteur belge est connu pour « Tombe la neige » ?', 'Salvatore Adamo', 'Né en Sicile, il a grandi en Belgique.'],
    ['Quel groupe britannique a enregistré « Bohemian Rhapsody » ?', 'Queen', 'Freddie Mercury en écrivit l’essentiel.'],
    ['Quelle chanteuse est surnommée la reine de la pop ?', 'Madonna', 'Elle connut notamment le succès avec Like a Virgin.'],
    ['Quel groupe suédois a remporté l’Eurovision avec « Waterloo » ?', 'ABBA', 'Cette victoire eut lieu en 1974.'],
    ['Quel chanteur français est surnommé le Taulier ?', 'Johnny Hallyday', 'Sa carrière discographique s’étend sur près de soixante ans.'],
    ['Quelle chanteuse britannique a sorti l’album « 21 » ?', 'Adele', 'L’album contient Rolling in the Deep.'],
    ['Quel duo français de musique électronique portait des casques de robots ?', 'Daft Punk', 'Le duo annonça sa séparation en 2021.'],
  ],
  [
    ['Dans quelle série six amis se retrouvent-ils au café Central Perk ?', 'Friends', 'La série se déroule principalement à New York.'],
    ['Dans quelle série une lycéenne anonyme signe-t-elle ses messages par « A » ?', 'Pretty Little Liars', 'L’intrigue commence après la disparition d’Alison.'],
    ['Dans quelle série Serena van der Woodsen vit-elle dans l’Upper East Side ?', 'Gossip Girl', 'Une blogueuse anonyme révèle les secrets des adolescents.'],
    ['Dans quelle série des survivants affrontent-ils des rôdeurs ?', 'The Walking Dead', 'La série est adaptée de comics de Robert Kirkman.'],
    ['Dans quelle série Eleven combat-elle des créatures venues du Monde à l’envers ?', 'Stranger Things', 'L’action commence dans la ville fictive de Hawkins.'],
    ['Dans quelle série la famille Crawley vit-elle dans un domaine anglais ?', 'Downton Abbey', 'L’histoire débute peu après le naufrage du Titanic.'],
    ['Dans quelle série Walter White devient-il fabricant de méthamphétamine ?', 'Breaking Bad', 'Le professeur de chimie travaille avec Jesse Pinkman.'],
    ['Dans quelle série les élèves de Las Encinas cachent-ils plusieurs crimes ?', 'Élite', 'La série espagnole se déroule dans un lycée privé.'],
    ['Dans quelle série Claire voyage-t-elle de 1945 à l’Écosse du XVIIIe siècle ?', 'Outlander', 'Elle rencontre le Highlander Jamie Fraser.'],
    ['Dans quelle série Meredith Grey travaille-t-elle dans un hôpital de Seattle ?', 'Grey’s Anatomy', 'L’établissement change plusieurs fois de nom.'],
  ],
  [
    ['Quel plombier moustachu est la mascotte de Nintendo ?', 'Mario', 'Il apparut d’abord sous le nom de Jumpman.'],
    ['Quel jeu consiste à empiler des blocs qui tombent pour former des lignes ?', 'Tetris', 'Alexeï Pajitnov le créa en Union soviétique.'],
    ['Dans quel jeu capture-t-on Pikachu et d’autres créatures ?', 'Pokémon', 'La première génération comptait 151 créatures.'],
    ['Quel jeu de construction utilise des blocs dans un monde cubique ?', 'Minecraft', 'Le mode survie ajoute ressources, monstres et fabrication.'],
    ['Quel hérisson bleu court à grande vitesse dans les jeux Sega ?', 'Sonic', 'Il fut créé comme rival de Mario.'],
    ['Quel jeu de football annuel est devenu EA Sports FC ?', 'FIFA', 'EA a changé le nom de la série en 2023.'],
    ['Dans quel jeu Link doit-il souvent sauver la princesse Zelda ?', 'The Legend of Zelda', 'Le royaume d’Hyrule sert fréquemment de décor.'],
    ['Quel jeu de société demande d’acheter des rues et de construire des hôtels ?', 'Monopoly', 'Le but classique est de ruiner ses adversaires.'],
    ['Quel jeu oppose des villageois à des loups durant la nuit ?', 'Les Loups-Garous de Thiercelieux', 'Les rôles sont cachés et les éliminations se décident par vote.'],
    ['Quel jeu de cartes utilise les couleurs rouge, jaune, verte et bleue ?', 'Uno', 'Une carte spéciale permet de changer la couleur en cours.'],
  ],
  [
    ['Quel super-héros est l’alter ego de Bruce Wayne ?', 'Batman', 'Il protège Gotham sans posséder de super-pouvoir.'],
    ['Quel super-héros vient de la planète Krypton ?', 'Superman', 'Il grandit sur Terre sous le nom de Clark Kent.'],
    ['Quel héros Marvel utilise un bouclier aux couleurs américaines ?', 'Captain America', 'Steve Rogers reçoit un sérum de super-soldat.'],
    ['Quel héros devient vert et surpuissant lorsqu’il se met en colère ?', 'Hulk', 'Le scientifique Bruce Banner fut exposé aux rayons gamma.'],
    ['Quelle héroïne amazone manie un lasso de vérité ?', 'Wonder Woman', 'Elle vient de l’île de Themyscira.'],
    ['Quel héros de Marvel lance des toiles entre les immeubles ?', 'Spider-Man', 'Peter Parker acquiert ses pouvoirs après une morsure d’araignée.'],
    ['Quel dieu nordique de Marvel manie le marteau Mjolnir ?', 'Thor', 'Le marteau ne peut être soulevé que par une personne jugée digne.'],
    ['Quel milliardaire construit l’armure d’Iron Man ?', 'Tony Stark', 'Il dirige l’entreprise Stark Industries.'],
    ['Quel mutant des X-Men possède des griffes en adamantium ?', 'Wolverine', 'Son pouvoir principal est une guérison accélérée.'],
    ['Quel anti-héros porte un costume rouge et parle souvent au public ?', 'Deadpool', 'Le personnage brise régulièrement le quatrième mur.'],
  ],
  [
    ['Quel sorcier porte une cicatrice en forme d’éclair ?', 'Harry Potter', 'Il étudie à l’école de Poudlard.'],
    ['Quel hobbit doit détruire l’Anneau unique ?', 'Frodon Sacquet', 'Il quitte la Comté avec plusieurs compagnons.'],
    ['Quel détective habite au 221B Baker Street ?', 'Sherlock Holmes', 'Le docteur Watson raconte de nombreuses enquêtes.'],
    ['Quel petit prince vit sur l’astéroïde B 612 ?', 'Le Petit Prince', 'Il rencontre notamment un renard qui lui parle de l’amitié.'],
    ['Quel personnage de Roald Dahl visite une chocolaterie extraordinaire ?', 'Charlie Bucket', 'Willy Wonka organise la visite grâce à des tickets d’or.'],
    ['Quel héros grec combat un cyclope lors de son retour vers Ithaque ?', 'Ulysse', 'Son voyage est raconté dans l’Odyssée.'],
    ['Quel ours amateur de miel vit dans la Forêt des Rêves Bleus ?', 'Winnie l’Ourson', 'Jean-Christophe est son ami humain.'],
    ['Quel garçon refuse de grandir et vit au Pays imaginaire ?', 'Peter Pan', 'La fée Clochette l’accompagne.'],
    ['Quelle orpheline rousse grandit à Green Gables ?', 'Anne Shirley', 'Le roman se déroule sur l’Île-du-Prince-Édouard.'],
    ['Quel héros belge est accompagné du chien Milou ?', 'Tintin', 'Le reporter voyage dans le monde entier avec ses amis.'],
  ],
]);

const GASTRONOMY = makeCategory([
  [
    ['Quel plat belge associe moules et pommes de terre frites ?', 'Les moules-frites', 'Les moules sont souvent cuites au céleri, à l’oignon et au vin blanc.'],
    ['Quel plat belge mijote du bœuf dans une bière brune ?', 'La carbonnade flamande', 'Une tartine de moutarde et de pain d’épices peut épaissir la sauce.'],
    ['Quelle spécialité liégeoise mélange salade, pommes de terre, haricots et lardons ?', 'La salade liégeoise', 'Elle se sert généralement tiède avec une vinaigrette.'],
    ['Quelle croquette belge contient une farce aux crevettes grises ?', 'La croquette aux crevettes', 'Elle est souvent servie avec du persil frit et du citron.'],
    ['Quel plat bruxellois marie boulettes de viande et sauce tomate ?', 'Les boulettes sauce tomate', 'Les frites constituent un accompagnement fréquent.'],
    ['Quelle spécialité de Gand prépare le poulet ou le poisson dans un bouillon crémeux ?', 'Le waterzooi', 'Le nom vient d’un verbe flamand évoquant la cuisson dans l’eau.'],
    ['Quel plat belge gratine des endives roulées dans du jambon et nappées de béchamel ?', 'Les chicons au gratin', 'En Belgique, les endives sont couramment appelées chicons.'],
    ['Quelle purée belge mélange pommes de terre et légumes ?', 'Le stoemp', 'Carottes, poireaux ou choux peuvent entrer dans sa composition.'],
    ['Quelle préparation namuroise associe escargots et beurre à l’ail ?', 'Les petits-gris de Namur', 'La recette met à l’honneur des escargots élevés localement.'],
    ['Quel plat de poisson est traditionnel à Ostende ?', 'La sole ostendaise', 'Elle est servie avec crevettes grises et sauce crémeuse.'],
  ],
  [
    ['Quel fromage italien entre dans la recette classique du tiramisu ?', 'Le mascarpone', 'Sa texture riche vient d’une crème coagulée.'],
    ['Quel fromage grec accompagne souvent tomates, concombre et olives ?', 'La feta', 'Il est traditionnellement fabriqué avec du lait de brebis ou de chèvre.'],
    ['Quel fromage fond-on dans le caquelon d’une raclette ?', 'Le fromage à raclette', 'On le sert avec pommes de terre et charcuterie.'],
    ['Quel fromage italien râpe-t-on souvent sur les pâtes ?', 'Le parmesan', 'Le Parmigiano Reggiano bénéficie d’une appellation protégée.'],
    ['Quel fromage français persillé est fabriqué avec du lait de brebis ?', 'Le roquefort', 'Il mûrit traditionnellement dans les caves du Combalou.'],
    ['Quel fromage normand à croûte fleurie se présente en petite boîte ronde ?', 'Le camembert', 'Le lait de vache donne sa pâte molle.'],
    ['Quel fromage belge à pâte molle est lié à l’abbaye d’Orval ?', 'L’Orval', 'Il est lavé avec une saumure pendant l’affinage.'],
    ['Quel fromage néerlandais est reconnaissable à sa forme de boule ?', 'L’edam', 'Sa croûte est souvent recouverte de cire rouge.'],
    ['Quel fromage anglais bleu accompagne parfois le porto ?', 'Le stilton', 'Son appellation est protégée au Royaume-Uni.'],
    ['Quel fromage chypriote peut être grillé sans fondre facilement ?', 'Le halloumi', 'Sa structure ferme supporte une cuisson à la poêle.'],
  ],
  [
    ['Quelle pâte italienne en forme de petits grains ressemble à du riz ?', 'L’orzo', 'Elle se sert en soupe, en salade ou comme accompagnement.'],
    ['Quelle pâte en rubans accompagne traditionnellement la sauce bolognaise en Italie ?', 'Les tagliatelles', 'À Bologne, elles sont préférées aux spaghettis pour le ragù.'],
    ['Quelle pâte farcie a souvent la forme d’un petit anneau ?', 'Les tortellini', 'Une tradition de Bologne les compare au nombril de Vénus.'],
    ['Quelle pâte en tubes striés retient bien les sauces ?', 'Les penne rigate', 'Leur nom évoque la pointe d’une plume.'],
    ['Quelle pâte longue et plate est utilisée dans les linguine alle vongole ?', 'Les linguine', 'Elles sont plus étroites que les tagliatelles.'],
    ['Quelle pâte en papillon porte un nom signifiant papillons ?', 'Les farfalle', 'On pince le centre d’un rectangle de pâte pour leur donner cette forme.'],
    ['Quelle pâte en forme d’oreille est typique des Pouilles ?', 'Les orecchiette', 'On les sert souvent avec des feuilles de navet.'],
    ['Quelle pâte large est superposée en couches avec sauce et béchamel ?', 'Les lasagnes', 'Le mot désigne aussi le plat complet cuit au four.'],
    ['Quelle pâte courte en spirale porte un nom évoquant un fusil ?', 'Les fusilli', 'Les rainures retiennent particulièrement bien les sauces épaisses.'],
    ['Quelle pâte creuse et coudée est utilisée dans le macaroni au fromage ?', 'Les macaronis', 'Leur forme tubulaire laisse entrer la sauce.'],
  ],
  [
    ['Quel dessert belge cuit une pâte quadrillée entre deux plaques ?', 'La gaufre', 'Les versions de Bruxelles et de Liège ont des textures différentes.'],
    ['Quel dessert italien alterne café, biscuits et mascarpone ?', 'Le tiramisu', 'Son nom signifie littéralement remonte-moi le moral.'],
    ['Quel dessert français caramélise le dessus d’une crème à la vanille ?', 'La crème brûlée', 'La fine couche de sucre doit casser sous la cuillère.'],
    ['Quel dessert autrichien roule pommes, cannelle et raisins dans une pâte fine ?', 'L’apfelstrudel', 'Le mot Strudel évoque un tourbillon.'],
    ['Quel dessert portugais est une petite tartelette à la crème ?', 'Le pastel de nata', 'Les plus célèbres sont associés au quartier de Belém.'],
    ['Quel dessert britannique associe génoise, crème, fruits et gelée en couches ?', 'Le trifle', 'Il est servi dans un récipient transparent.'],
    ['Quel dessert espagnol frit se trempe souvent dans du chocolat chaud ?', 'Les churros', 'La pâte est poussée dans l’huile à travers une douille cannelée.'],
    ['Quel dessert grec feuilleté contient noix, miel ou sirop ?', 'Le baklava', 'De nombreuses cuisines de l’est méditerranéen en proposent des variantes.'],
    ['Quel dessert français renverse des pommes caramélisées sous une pâte ?', 'La tarte Tatin', 'La tarte est retournée après cuisson.'],
    ['Quel dessert glacé italien est généralement moins gras qu’une crème glacée ?', 'Le gelato', 'Il est servi légèrement moins froid pour renforcer ses arômes.'],
  ],
  [
    ['Quelle bière belge utilise une fermentation spontanée dans la vallée de la Senne ?', 'Le lambic', 'Les levures présentes dans l’air ensemencent naturellement le moût.'],
    ['Quel alcool donne sa base au gin ?', 'Un alcool neutre aromatisé au genièvre', 'Le genièvre est l’arôme indispensable du gin.'],
    ['Quel vin effervescent français vient de la région du même nom ?', 'Le champagne', 'Sa seconde fermentation se déroule en bouteille.'],
    ['Quelle boisson espagnole mélange souvent vin rouge, fruits et épices ?', 'La sangria', 'Elle se sert généralement fraîche.'],
    ['Quel café italien très court est extrait sous pression ?', 'L’espresso', 'Une fine crema apparaît à sa surface.'],
    ['Quelle eau-de-vie de genièvre est traditionnelle à Liège ?', 'Le peket', 'Son nom wallon viendrait d’un mot signifiant piquant.'],
    ['Quel thé vert japonais est réduit en poudre ?', 'Le matcha', 'La feuille entière est consommée après avoir été fouettée dans l’eau.'],
    ['Quelle boisson indienne associe thé, lait et épices ?', 'Le masala chai', 'Cardamome, gingembre et cannelle sont souvent utilisés.'],
    ['Quel cocktail mélange rhum blanc, menthe, citron vert et eau gazeuse ?', 'Le mojito', 'Cette boisson est originaire de Cuba.'],
    ['Quelle boisson fermentée à base de pommes est typique de Normandie ?', 'Le cidre', 'Les pommes sont pressées puis leur jus fermente.'],
  ],
  [
    ['Quel geste consiste à dissoudre les sucs de cuisson avec un liquide ?', 'Déglacer', 'Le liquide versé dans la poêle permet de préparer une sauce.'],
    ['Quelle cuisson plonge brièvement un aliment dans l’eau bouillante avant de le refroidir ?', 'Blanchir', 'Le refroidissement stoppe immédiatement la cuisson.'],
    ['Quelle cuisson lente se fait dans un liquide maintenu juste sous l’ébullition ?', 'Pocher', 'Les œufs, poissons et fruits peuvent être pochés.'],
    ['Quel geste fait brûler rapidement un alcool versé sur un plat ?', 'Flamber', 'La flamme consume une partie de l’alcool tout en laissant ses arômes.'],
    ['Quelle opération fait épaissir une sauce par évaporation ?', 'Réduire', 'Une casserole large accélère l’évaporation du liquide.'],
    ['Quel geste incorpore de l’air dans des blancs d’œufs avec un fouet ?', 'Monter en neige', 'Les protéines forment un réseau qui retient les bulles d’air.'],
    ['Quelle découpe transforme un légume en fins bâtonnets réguliers ?', 'Tailler en julienne', 'Cette coupe facilite une cuisson rapide et uniforme.'],
    ['Quel geste passe un liquide à travers une passoire fine ?', 'Filtrer', 'Il permet de retirer les morceaux ou les impuretés.'],
    ['Quelle cuisson douce place un récipient dans de l’eau chaude ?', 'Le bain-marie', 'La chaleur indirecte limite le risque de brûler les préparations fragiles.'],
    ['Quel geste mélange vivement deux liquides qui se séparent naturellement ?', 'Émulsionner', 'La moutarde aide par exemple à stabiliser une vinaigrette.'],
  ],
  [
    ['Quel ingrédient fait lever une pâte à pain traditionnelle ?', 'La levure boulangère', 'Elle produit du gaz carbonique en fermentant les sucres.'],
    ['Quelle farine riche en gluten convient particulièrement au pain ?', 'La farine de blé', 'Le gluten forme un réseau qui retient les gaz de fermentation.'],
    ['Quel terme désigne le repos d’une pâte pendant lequel elle gonfle ?', 'La pousse', 'La température influence fortement la vitesse de fermentation.'],
    ['Quel geste travaille une pâte pour développer son réseau de gluten ?', 'Pétrir', 'Le pétrissage donne de l’élasticité à la pâte.'],
    ['Quelle étape dore la croûte et développe des arômes pendant la cuisson ?', 'La réaction de Maillard', 'Elle se produit entre certains sucres et acides aminés sous l’effet de la chaleur.'],
    ['Quel ingrédient remplace souvent une partie du beurre dans une pâte à pizza ?', 'L’huile d’olive', 'Elle apporte souplesse et arôme à la pâte.'],
    ['Quelle poudre fait gonfler rapidement un gâteau sans fermentation longue ?', 'La levure chimique', 'Elle libère du gaz au contact de l’humidité et de la chaleur.'],
    ['Quel terme désigne la fine partie colorée de la peau d’un agrume ?', 'Le zeste', 'Il contient des huiles essentielles très aromatiques.'],
    ['Quel geste recouvre une pâte d’un linge pendant son repos ?', 'Couvrir', 'Cela évite que sa surface ne sèche et forme une croûte.'],
    ['Quelle technique étale plusieurs couches de beurre entre des couches de pâte ?', 'Le tourage', 'Elle crée le feuilletage des croissants et de la pâte feuilletée.'],
  ],
]);

const TARGETS: Record<CategoryId, string[]> = {
  histoire: ['his_adulte_editorial_03', 'his_adulte_editorial_04'],
  geographie: ['geo_adulte_editorial_02'],
  cinema: ['cin_adulte_editorial_04', 'cin_adulte_editorial_06'],
  sciences: ['sci_adulte_editorial_02', 'sci_adulte_editorial_03'],
  art: ['art_adulte_editorial_03', 'art_adulte_editorial_04'],
  sports: ['sport_adulte_curated_final'],
  popculture: ['pop_adulte_editorial_04', 'pop_adulte_editorial_06'],
  gastronomie: ['gastronomie_adulte_curated_final'],
};

const BANKS: Partial<Record<CategoryId, Card[]>> = {
  histoire: HISTORY,
  geographie: GEOGRAPHY,
  cinema: CINEMA,
  sciences: SCIENCE,
  art: ART,
  sports: SPORTS,
  popculture: POPCULTURE,
  gastronomie: GASTRONOMY,
};

export const FAMILY_SECOND_PASS_PROMPTS = new Set(
  Object.values(BANKS).flatMap((cards) => cards?.map((card) => card[0]) ?? []),
);

export function applyFamilyAdultSecondPass(questions: Question[]): Question[] {
  const replacements = new Map<string, Card>();
  const allTargetIds = new Set<string>();
  const blockedIds = new Set([
    // Une carte adulte ne doit pas rejouer un fait déjà posé au niveau ado.
    'his_adulte_editorial_03_009',
    'his_adulte_editorial_03_011',
    'his_adulte_editorial_03_023',
    'his_adulte_editorial_03_042',
    'geo_adulte_editorial_02_002',
    'geo_adulte_editorial_02_019',
    'geo_adulte_editorial_02_040',
    'cin_adulte_editorial_04_012',
    'cin_adulte_editorial_04_014',
    'cin_adulte_editorial_04_015',
    'cin_adulte_editorial_04_018',
    'cin_adulte_editorial_04_020',
    'cin_adulte_editorial_04_021',
    'cin_adulte_editorial_04_022',
    'cin_adulte_editorial_04_023',
    'cin_adulte_editorial_04_028',
    'sci_adulte_editorial_02_002',
    'sci_adulte_editorial_02_027',
    'sci_adulte_editorial_02_029',
    'sci_adulte_editorial_02_041',
    'art_adulte_editorial_03_017',
    'art_adulte_editorial_03_023',
    'art_adulte_editorial_03_024',
    'pop_adulte_editorial_04_007',
    'pop_adulte_editorial_04_021',
    'pop_adulte_editorial_06_015',
    'gastronomie_adulte_curated_final_011',
    // Ces propositions recoupaient un autre fait adulte conservé.
    'geo_adulte_editorial_02_011',
    'geo_adulte_editorial_02_012',
    'geo_adulte_editorial_02_013',
    'geo_adulte_editorial_02_018',
    'geo_adulte_editorial_02_048',
    'geo_adulte_editorial_02_050',
    'sci_adulte_editorial_02_022',
    'sci_adulte_editorial_02_023',
    'sci_adulte_editorial_02_020',
    'sci_adulte_editorial_02_031',
    'sport_adulte_curated_final_004',
    'sport_adulte_curated_final_010',
    'pop_adulte_editorial_04_004',
    'pop_adulte_editorial_04_008',
    'gastronomie_adulte_curated_final_002',
  ]);

  for (const [categoryId, prefixes] of Object.entries(TARGETS) as [CategoryId, string[]][]) {
    const bank = BANKS[categoryId];
    if (!bank) continue;
    questions.filter((question) => question.categoryId === categoryId
      && question.difficulty === 'adulte'
      && prefixes.some((prefix) => question.id.startsWith(`${prefix}_`)))
      .slice(0, bank.length)
      .forEach((question) => allTargetIds.add(question.id));
  }

  const protectedQuestions = questions.filter((question) => !allTargetIds.has(question.id));
  const lowerLevelFacts = new Set(questions
    .filter((question) => question.difficulty !== 'adulte')
    .map((question) => `${normalize(question.question)}|${normalize(question.options[question.correctAnswerIndex] ?? '')}`));
  const accepted: Question[] = [];

  for (const [categoryId, prefixes] of Object.entries(TARGETS) as [CategoryId, string[]][]) {
    const bank = BANKS[categoryId];
    if (!bank) continue;
    const targets = questions.filter((question) => question.categoryId === categoryId
      && question.difficulty === 'adulte'
      && prefixes.some((prefix) => question.id.startsWith(`${prefix}_`)))
      .slice(0, bank.length);
    if (targets.length !== bank.length) {
      throw new Error(`${categoryId}: ${targets.length} cartes cibles pour ${bank.length} remplacements.`);
    }
    targets.forEach((question, index) => {
      if (blockedIds.has(question.id)) return;
      const card = bank[index];
      const [prompt, answer, distractor1, distractor2, distractor3, explanation] = card;
      const candidate: Question = {
        ...question,
        question: prompt,
        options: [answer, distractor1, distractor2, distractor3],
        correctAnswerIndex: 0,
        explanation,
      };
      const optionsAreUnique = new Set(candidate.options.map(normalize)).size === 4;
      const repeatsLowerLevel = lowerLevelFacts.has(`${normalize(prompt)}|${normalize(answer)}`);
      const comparisonPool = [...protectedQuestions, ...accepted].filter((other) =>
        other.difficulty === 'adulte' && other.categoryId === categoryId);
      const repeatsAdultFact = comparisonPool.some((other) => {
        const otherAnswer = other.options[other.correctAnswerIndex] ?? '';
        return normalize(other.question) === normalize(prompt) && normalize(otherAnswer) === normalize(answer)
          || normalize(otherAnswer) === normalize(answer) && paraphrasesSameFact(other.question, prompt);
      });
      if (!optionsAreUnique || repeatsLowerLevel || repeatsAdultFact
        || echoesCorrectAnswer(prompt, candidate.options, 0)
        || quotesAnswerProperName(prompt, candidate.options, 0)) return;
      replacements.set(question.id, card);
      accepted.push(candidate);
    });
  }

  return questions.map((question) => {
    const replacement = replacements.get(question.id);
    if (!replacement) return question;
    const [prompt, answer, distractor1, distractor2, distractor3, explanation] = replacement;
    return {
      ...question,
      question: prompt,
      options: [answer, distractor1, distractor2, distractor3],
      correctAnswerIndex: 0,
      explanation,
    };
  });
}

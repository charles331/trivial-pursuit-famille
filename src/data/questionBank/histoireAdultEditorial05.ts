import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel archéologue mit au jour Troie sur la colline d’Hisarlık au XIXe siècle ?', 'Heinrich Schliemann', 'Arthur Evans', 'Flinders Petrie', 'Leonard Woolley', 'Schliemann fouilla Hisarlık à partir de 1870, avec des méthodes qui détruisirent une partie des niveaux du site.'],
  ['Qui découvrit la tombe de Toutânkhamon en 1922 ?', 'Howard Carter', 'Gaston Maspero', 'Auguste Mariette', 'William Flinders Petrie', 'Carter ouvrit la tombe presque intacte dans la Vallée des Rois grâce au financement de Lord Carnarvon.'],
  ['Quel archéologue fouilla le palais de Cnossos et nomma la civilisation minoenne ?', 'Arthur Evans', 'Heinrich Schliemann', 'Mortimer Wheeler', 'John Garstang', 'Evans entreprit les fouilles de Cnossos en 1900 et reconstruisit certaines parties du palais.'],
  ['Quelle archéologue britannique cartographia de nombreux sites d’Irak avant 1914 ?', 'Gertrude Bell', 'Kathleen Kenyon', 'Dorothy Garrod', 'Agatha Christie', 'Gertrude Bell fut aussi diplomate et participa à la formation de l’État irakien moderne.'],
  ['Qui dirigea les fouilles stratigraphiques de Jéricho dans les années 1950 ?', 'Kathleen Kenyon', 'Dorothy Garrod', 'Gertrude Caton-Thompson', 'Tessa Wheeler', 'Kenyon appliqua une méthode stratigraphique rigoureuse et identifia les fortifications néolithiques de Jéricho.'],
  ['Quel site péruvien de la civilisation inca fut révélé au grand public par Hiram Bingham ?', 'Machu Picchu', 'Chan Chan', 'Tiahuanaco', 'Chavín de Huántar', 'Bingham atteignit Machu Picchu en 1911, guidé par des habitants qui connaissaient déjà le site.'],
  ['Quelle cité de la vallée de l’Indus fut fouillée à partir des années 1920 ?', 'Mohenjo-daro', 'Pataliputra', 'Taxila', 'Sanchi', 'Mohenjo-daro possédait un urbanisme en grille, des égouts et le bâtiment appelé Grand Bain.'],
  ['Quel site nigérian a donné son nom à une culture célèbre pour ses terres cuites ?', 'Nok', 'Ifé', 'Benin City', 'Igbo-Ukwu', 'Les sculptures de la culture Nok comptent parmi les plus anciennes grandes terres cuites d’Afrique subsaharienne.'],
  ['Quel tombeau anglo-saxon fut découvert à Sutton Hoo en 1939 ?', 'Un navire funéraire', 'Une pyramide à degrés', 'Un hypogée romain', 'Un dolmen néolithique', 'Le navire de Sutton Hoo contenait de riches objets liés probablement à un roi d’Est-Anglie.'],
  ['Quel site français donna son nom à la culture magdalénienne ?', 'La Madeleine', 'Le Moustier', 'Aurignac', 'Solutré', 'L’abri de La Madeleine en Dordogne a servi de site éponyme au Magdalénien.'],
  ['Quel roi indien patronna la diffusion du bouddhisme au IIIe siècle av. J.-C. ?', 'Ashoka', 'Chandragupta Maurya', 'Kanishka', 'Harsha', 'Les édits gravés d’Ashoka proclament une politique morale inspirée du dharma après la guerre du Kalinga.'],
  ['Quel concile de 325 formula une première version du credo de Nicée ?', 'Le premier concile de Nicée', 'Le concile de Chalcédoine', 'Le concile d’Éphèse', 'Le concile de Constantinople', 'Convoqué par Constantin, Nicée condamna notamment l’enseignement d’Arius sur la nature du Christ.'],
  ['Quel schisme de 1054 sépara traditionnellement Églises d’Orient et d’Occident ?', 'Le Grand Schisme', 'Le schisme d’Occident', 'Le schisme acacien', 'Le schisme des Trois Chapitres', 'Les excommunications de 1054 symbolisent une rupture issue de divergences accumulées sur plusieurs siècles.'],
  ['Quel mouvement chrétien médiéval fut réprimé lors de la croisade des Albigeois ?', 'Le catharisme', 'Le hussitisme', 'Le lollardisme', 'Le vaudisme', 'La croisade lancée en 1209 visa les cathares et transforma l’équilibre politique du Languedoc.'],
  ['Quel réformateur tchèque fut brûlé au concile de Constance en 1415 ?', 'Jan Hus', 'Jérôme Savonarole', 'John Wyclif', 'Philippe Mélanchthon', 'La condamnation de Jan Hus alimenta ensuite les guerres hussites en Bohême.'],
  ['Quel empereur moghol organisa des débats religieux dans l’Ibadat Khana ?', 'Akbar', 'Jahangir', 'Shah Jahan', 'Aurangzeb', 'Akbar invita à Fatehpur-Sikri musulmans, hindous, jaïns, chrétiens et zoroastriens à débattre.'],
  ['Quel édit de 1598 accorda des droits limités aux protestants français ?', 'L’édit de Nantes', 'L’édit de Fontainebleau', 'L’édit de Saint-Germain', 'L’édit de Beaulieu', 'Henri IV promulgua l’édit de Nantes pour pacifier le royaume après les guerres de Religion.'],
  ['Quel mouvement religieux américain fut fondé par Joseph Smith en 1830 ?', 'L’Église de Jésus-Christ des saints des derniers jours', 'Les Adventistes du septième jour', 'La Science chrétienne', 'Les Témoins de Jéhovah', 'Joseph Smith publia le Livre de Mormon et organisa son Église dans l’État de New York.'],
  ['Quel mouvement indien fondé par Ram Mohan Roy combattit notamment la sati ?', 'Le Brahmo Samaj', 'L’Arya Samaj', 'La Société théosophique', 'Le mouvement Aligarh', 'Le Brahmo Samaj défendit au XIXe siècle un monothéisme réformateur et des changements sociaux.'],
  ['Quel concile catholique se déroula de 1962 à 1965 ?', 'Le concile Vatican II', 'Le concile Vatican I', 'Le concile de Trente', 'Le concile de Latran V', 'Vatican II réforma la liturgie et redéfinit notamment les relations de l’Église avec le monde moderne.'],
  ['Quel navigateur portugais atteignit l’Inde par mer en 1498 ?', 'Vasco de Gama', 'Bartolomeu Dias', 'Pedro Álvares Cabral', 'Afonso de Albuquerque', 'Vasco de Gama arriva à Calicut après avoir contourné le cap de Bonne-Espérance.'],
  ['Quel navigateur traversa le premier le détroit portant son nom en 1520 ?', 'Fernand de Magellan', 'Juan Sebastián Elcano', 'Francis Drake', 'Amerigo Vespucci', 'Magellan franchit le détroit au sud de l’Amérique avant d’entrer dans l’océan qu’il nomma Pacifique.'],
  ['Qui acheva la première circumnavigation après la mort de Magellan ?', 'Juan Sebastián Elcano', 'Álvaro de Mendaña', 'García Jofre de Loaísa', 'Andrés de Urdaneta', 'Elcano ramena la Victoria en Espagne en 1522 avec dix-sept autres survivants européens.'],
  ['Quel explorateur français remonta le Saint-Laurent et nomma le Canada ?', 'Jacques Cartier', 'Samuel de Champlain', 'René-Robert Cavelier de La Salle', 'Pierre Dugua de Mons', 'Cartier effectua trois voyages entre 1534 et 1542 et reprit le mot iroquoien kanata.'],
  ['Quel navigateur néerlandais donna son nom européen à la Tasmanie ?', 'Abel Tasman', 'Willem Janszoon', 'Jacob Roggeveen', 'Willem Barents', 'Tasman atteignit l’île en 1642 et la nomma d’abord Terre de Van Diemen.'],
  ['Quel explorateur parcourut le Mississippi jusqu’à son embouchure en 1682 ?', 'René-Robert Cavelier de La Salle', 'Louis Jolliet', 'Jacques Marquette', 'Pierre Le Moyne d’Iberville', 'La Salle revendiqua le bassin du Mississippi pour la France sous le nom de Louisiane.'],
  ['Quelle expédition scientifique mesura un arc de méridien en Laponie ?', 'L’expédition de Maupertuis', 'L’expédition de Bougainville', 'L’expédition de Cook', 'L’expédition de Humboldt', 'Les mesures de 1736-1737 confirmèrent que la Terre est aplatie aux pôles.'],
  ['Quel capitaine cartographia la côte orientale de l’Australie en 1770 ?', 'James Cook', 'Matthew Flinders', 'George Vancouver', 'Arthur Phillip', 'Cook longea la côte à bord de l’Endeavour et la revendiqua pour la Couronne britannique.'],
  ['Quel naturaliste voyagea en Amérique avec Aimé Bonpland de 1799 à 1804 ?', 'Alexander von Humboldt', 'Charles Darwin', 'Alfred Russel Wallace', 'Joseph Banks', 'Humboldt étudia géographie, climat et biodiversité dans une approche globale de la nature.'],
  ['Quel explorateur norvégien atteignit le premier le pôle Sud en 1911 ?', 'Roald Amundsen', 'Robert Falcon Scott', 'Ernest Shackleton', 'Fridtjof Nansen', 'Amundsen et quatre compagnons atteignirent le pôle le 14 décembre 1911 avec des chiens de traîneau.'],
  ['Quelle innovation britannique permit de filer plusieurs fils à la fois au XVIIIe siècle ?', 'La spinning jenny', 'La mule-jenny', 'La navette volante', 'Le métier Jacquard', 'James Hargreaves breveta la spinning jenny en 1770, accélérant la production de fil.'],
  ['Quel inventeur améliora la machine à vapeur grâce au condenseur séparé ?', 'James Watt', 'Thomas Newcomen', 'Richard Arkwright', 'George Stephenson', 'Le condenseur de Watt réduisit fortement la consommation de combustible des machines à vapeur.'],
  ['Quel entrepreneur développa le procédé Bessemer de fabrication de l’acier ?', 'Henry Bessemer', 'Andrew Carnegie', 'Abraham Darby', 'Robert Mushet', 'Le convertisseur Bessemer permit une production rapide et moins coûteuse d’acier au XIXe siècle.'],
  ['Quel système monétaire international reposait sur la convertibilité en or ?', 'L’étalon-or', 'Le bimétallisme latin', 'Le système de Bretton Woods', 'Le cours forcé', 'Sous l’étalon-or, les monnaies étaient définies par un poids d’or et convertibles à taux fixe.'],
  ['Quelle crise bancaire américaine déboucha sur la création de la Réserve fédérale ?', 'La panique de 1907', 'La panique de 1893', 'Le krach de 1929', 'La récession de 1920', 'L’intervention privée de J. P. Morgan en 1907 convainquit de la nécessité d’une banque centrale.'],
  ['Quel plan de 1924 rééchelonna les réparations allemandes ?', 'Le plan Dawes', 'Le plan Young', 'Le plan Marshall', 'Le plan Schacht', 'Le plan Dawes associa calendrier de paiements et prêts internationaux à l’Allemagne.'],
  ['Quelle décision de 1971 suspendit la convertibilité du dollar en or ?', 'Le choc Nixon', 'L’accord du Plaza', 'Le Smithsonian Agreement', 'Le choc Volcker', 'Nixon ferma le « guichet de l’or », mettant fin au pilier central du système de Bretton Woods.'],
  ['Quelle crise pétrolière suivit l’embargo arabe d’octobre 1973 ?', 'Le premier choc pétrolier', 'Le second choc pétrolier', 'La crise de Suez', 'La crise asiatique', 'Le prix du pétrole augmenta fortement après les restrictions décidées par des producteurs arabes.'],
  ['Quel accord de 1985 visa à faire baisser le dollar face aux autres grandes monnaies ?', 'L’accord du Plaza', 'L’accord du Louvre', 'L’accord Smithsonian', 'L’accord de Bâle', 'Les cinq grandes puissances économiques coordonnèrent leurs interventions après une réunion à New York.'],
  ['Quelle crise financière de 1997 commença par la dévaluation du baht ?', 'La crise asiatique', 'La crise russe', 'La crise tequila', 'La crise des subprimes', 'La Thaïlande abandonna l’ancrage du baht en juillet 1997, déclenchant une contagion régionale.'],
  ['Quel économiste formula la théorie des avantages comparatifs ?', 'David Ricardo', 'Adam Smith', 'Thomas Malthus', 'John Stuart Mill', 'Ricardo montra qu’un échange peut bénéficier à deux pays même si l’un est plus productif partout.'],
  ['Quel ouvrage de 1776 analyse la division du travail et les marchés ?', 'La Richesse des nations', 'Le Capital', 'Principes d’économie politique', 'Théorie générale', 'Adam Smith ouvre La Richesse des nations par l’exemple célèbre d’une manufacture d’épingles.'],
  ['Quel économiste publia « Le Capital » à partir de 1867 ?', 'Karl Marx', 'Friedrich Engels', 'Pierre-Joseph Proudhon', 'Ferdinand Lassalle', 'Le premier livre du Capital parut du vivant de Marx ; Engels édita les suivants après sa mort.'],
  ['Quel économiste britannique donna son nom à une politique de soutien à la demande ?', 'John Maynard Keynes', 'Alfred Marshall', 'Arthur Pigou', 'Joan Robinson', 'La Théorie générale de Keynes, publiée en 1936, défend l’action publique face au sous-emploi.'],
  ['Quelle organisation créée en 1947 encadra le commerce avant l’OMC ?', 'Le GATT', 'L’OCDE', 'La CNUCED', 'La Banque mondiale', 'L’Accord général sur les tarifs douaniers et le commerce entra en vigueur en 1948.'],
  ['Quel traité de 1957 créa la Communauté économique européenne ?', 'Le traité de Rome', 'Le traité de Paris', 'Le traité de Maastricht', 'Le traité de Bruxelles', 'Six États signèrent à Rome les traités instituant la CEE et Euratom.'],
  ['Quelle politique économique chinoise fut lancée par Deng Xiaoping à partir de 1978 ?', 'La réforme et l’ouverture', 'Le Grand Bond en avant', 'La campagne des Cent Fleurs', 'La Nouvelle Politique économique', 'Les réformes introduisirent progressivement mécanismes de marché et zones économiques spéciales.'],
  ['Quel programme soviétique des années 1920 réintroduisit partiellement le marché ?', 'La Nouvelle Politique économique', 'La collectivisation', 'Le communisme de guerre', 'La perestroïka', 'Lénine lança la NEP en 1921 après les réquisitions et la crise du communisme de guerre.'],
  ['Quelle union douanière européenne entra pleinement en vigueur en 1968 ?', 'L’union douanière de la CEE', 'L’Association européenne de libre-échange', 'Le Benelux', 'L’Espace économique européen', 'Les six pays de la CEE supprimèrent les droits de douane internes avec avance sur le calendrier.'],
  ['Quelle monnaie scripturale européenne précéda l’euro ?', 'L’écu', 'Le florin européen', 'Le franc-or', 'Le mark commun', 'L’European Currency Unit était un panier de monnaies utilisé dans le Système monétaire européen.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL_05: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `his_adulte_editorial_05_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);


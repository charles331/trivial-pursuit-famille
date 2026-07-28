import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const G = (raw: string): Fact[] => raw.trim().split('\n').map(line => line.split('|') as Fact);

const GEOGRAPHY = G(`
Quelle région historique occupe le centre de la Roumanie, à l’intérieur de l’arc des Carpates ?|La Transylvanie|La Valachie|La Moldavie|La Dobroudja|Longtemps hongroise puis autrichienne, elle est rattachée à la Roumanie après 1918.
Dans quel pays fouille-t-on le site néolithique de Çatal Höyük ?|La Turquie|La Géorgie|L’Arménie|La Grèce|Ses habitants circulaient sur les toits : les maisons, mitoyennes, n’avaient pas de rue entre elles.
Quelle plaine agricole s’étend entre le Mont-Liban et l’Anti-Liban ?|La Bekaa|La Bekaa du Nord seule|La plaine de Homs|La plaine d’Akkar|Elle fournit l’essentiel de la production viticole libanaise, une tradition vieille de plusieurs millénaires.
Quelle particularité rend le delta de l’Okavango unique au monde ?|Il se perd dans les sables sans atteindre la mer|Il compte sept bras navigables|Il gèle chaque hiver|Il se jette dans deux océans|Ses eaux venues d’Angola s’évaporent et s’infiltrent dans le Kalahari botswanais.
Sur quel haut plateau le salar d’Uyuni s’étend-il ?|L’Altiplano bolivien|Le plateau du Deccan|La puna argentine|L’Altiplano péruvien|À plus de 3 600 mètres, ce désert de sel sert aussi de miroir géant pour calibrer les satellites.
Quel pays abrite la majeure partie de la zone humide du Pantanal ?|Le Brésil|La Colombie|Le Venezuela|L’Équateur|Le Pantanal s’étend aussi sur la Bolivie et le Paraguay ; il inonde chaque saison des pluies.
Quel sommet marque la frontière entre le Népal et la Chine ?|L’Everest|L’Annapurna|Le Dhaulagiri|Le Manaslu|Les Népalais l’appellent Sagarmatha et les Tibétains Chomolungma ; la frontière passe par son sommet.
Quel vaste plateau occupe la péninsule indienne au sud du fleuve Narmada ?|Le Deccan|Le Ladakh|Le Terai|Le Chota Nagpur|Ses coulées de basalte, les trapps du Deccan, comptent parmi les plus vastes épanchements volcaniques du globe.
À quel pays appartient le territoire de haute altitude du Ladakh ?|L’Inde|Le Népal|Le Bhoutan|L’Afghanistan|Coincé entre Karakoram et Himalaya, il est surnommé le petit Tibet.
Dans quel bassin chinois s’étend le désert du Taklamakan ?|Le bassin du Tarim|Le bassin du Sichuan|Le bassin de Tsaïdam|Le bassin de Dzoungarie|Les routes de la soie le contournaient par le nord et par le sud, jamais en son centre.
Dans quel golfe émergent les pitons calcaires de la baie d’Ha Long ?|Le golfe du Tonkin|Le golfe de Thaïlande|Le golfe du Bengale|Le golfe de Martaban|Près de deux mille îlots karstiques y ont été sculptés par la mer.
Sur quelle île indonésienne se trouve le lac de caldeira Toba ?|Sumatra|Java|Bornéo|Célèbes|L’éruption qui l’a formé, il y a environ 74 000 ans, est l’une des plus violentes connues.
Quelle immense plaine calcaire aride borde la Grande Baie australienne ?|Le Nullarbor|Le Gibson|Le Simpson|Le Tanami|Son nom vient du latin nulla arbor, sans arbre ; la voie ferrée y file droit sur 478 kilomètres.
Dans quel pays entaille le fjord de Milford Sound ?|La Nouvelle-Zélande|La Norvège|Le Canada|Le Chili|Appelé Piopiotahi en maori, il reçoit plus de six mètres de pluie par an.
Dans quel État américain se trouve la vallée de la Mort ?|La Californie|L’Arizona|Le Nevada|L’Utah|On y a relevé 56,7 °C en 1913, l’une des températures les plus élevées jamais mesurées sur Terre.
Quel pays occupe la majeure partie de la péninsule du Yucatán ?|Le Mexique|Le Guatemala|Le Honduras|Le Costa Rica|Elle est partagée au sud avec le Belize et le Guatemala, et n’a presque aucune rivière de surface.
Pour quoi la baie de Fundy, au Canada, est-elle célèbre ?|Ses marées parmi les plus fortes du monde|Ses icebergs permanents|Son eau douce en surface|Son absence totale de marée|L’amplitude y dépasse seize mètres entre le Nouveau-Brunswick et la Nouvelle-Écosse.
Dans quelle province canadienne le parc national de Banff protège-t-il les Rocheuses ?|L’Alberta|La Colombie-Britannique|Le Manitoba|Le Saskatchewan|Créé en 1885, c’est le premier parc national du Canada.
À quel pays l’archipel des Galápagos appartient-il ?|L’Équateur|Le Pérou|La Colombie|Le Costa Rica|Ses pinsons, aux becs adaptés à chaque île, ont nourri la réflexion de Darwin.
À quel archipel le cap Horn appartient-il ?|La Terre de Feu chilienne|Les Malouines|L’archipel des Chonos|La Géorgie du Sud|Doubler le Horn, réputé pour ses tempêtes, était le rite de passage des marins avant le canal de Panama.
Quel fleuve sépare historiquement Buda de Pest ?|Le Danube|La Vistule|L’Elbe|Le Dniepr|Les deux villes, sur chaque rive, n’ont été réunies administrativement qu’en 1873.
Quelle capitale européenne est la seule à border trois pays ?|Bratislava|Vienne|Luxembourg|Ljubljana|Elle touche presque l’Autriche et la Hongrie : son aéroport est à quelques kilomètres de deux frontières.
Au confluent de quels cours d’eau Belgrade est-elle bâtie ?|Le Danube et la Save|Le Danube et la Tisza|La Save et la Drave|La Morava et le Danube|La forteresse de Kalemegdan surveille ce confluent stratégique depuis l’Antiquité.
Quelle ville s’étend de part et d’autre du Nil, juste au sud de son delta ?|Le Caire|Louxor|Assouan|Alexandrie|C’est la plus grande agglomération du monde arabe et d’Afrique.
Sur quel fleuve irakien la ville de Samarra est-elle établie ?|Le Tigre|L’Euphrate|Le Jourdain|L’Oronte|Samarra fut une capitale du califat abbasside au IXe siècle.
Quel fleuve arrose Hanoï et son vaste delta du nord du Viêt Nam ?|Le fleuve Rouge|Le Mékong|Le Salouen|L’Irrawaddy|Ses alluvions ferrugineuses lui donnent la couleur qui lui vaut son nom.
Quel lac cambodgien inverse son cours deux fois par an au contact du Mékong ?|Le Tonlé Sap|Le lac Inle|Le lac Toba|Le lac Poyang|À la saison des pluies, le Mékong le gonfle et il quintuple de surface.
Que se rejoint exactement à Khartoum ?|Le Nil Blanc et le Nil Bleu|Le Nil et l’Atbara|Le Nil Blanc et le Sobat|Le Nil Bleu et l’Atbara|Le Nil Bleu, venu d’Éthiopie, fournit l’essentiel de la crue annuelle.
Quel fleuve décrit une large boucle avant d’arroser Niamey ?|Le Niger|Le Sénégal|La Volta|Le Chari|Il coule d’abord vers le Sahara, puis rebrousse chemin vers le golfe de Guinée.
Quelles deux capitales se font face de part et d’autre du fleuve Congo ?|Kinshasa et Brazzaville|Luanda et Kinshasa|Libreville et Brazzaville|Bangui et Kinshasa|Ce sont les deux capitales les plus proches du monde, hormis Rome et le Vatican.
Quel fleuve andalou fut une grande voie d’échange jusqu’à Cordoue et Séville ?|Le Guadalquivir|Le Tage|L’Èbre|Le Douro|Son nom vient de l’arabe al-wadi al-kabir, la grande rivière.
Quel fleuve espagnol se jette dans la Méditerranée par un vaste delta ?|L’Èbre|Le Tage|Le Douro|Le Guadiana|Il traverse Saragosse et a donné son nom, via les Ibères, à la péninsule Ibérique.
Quels deux fleuves s’unissent en aval de Bordeaux pour former la Gironde ?|La Garonne et la Dordogne|La Garonne et l’Adour|La Dordogne et la Charente|La Loire et la Garonne|La Gironde est le plus vaste estuaire d’Europe occidentale.
Près de quel estuaire atlantique la ville de Nantes est-elle établie ?|Celui de la Loire|Celui de la Seine|Celui de la Garonne|Celui de la Charente|La Loire est le plus long fleuve de France, avec plus de mille kilomètres.
Quel fleuve traverse la Saxe et Dresde avant de rejoindre la mer du Nord ?|L’Elbe|Le Rhin|L’Oder|Le Main|Il rejoint la mer près de Hambourg, dont il fait l’un des grands ports européens.
Sur les bras et les îles de quel fleuve la ville de Wrocław est-elle bâtie ?|L’Oder|La Vistule|L’Elbe|Le Niémen|Une centaine de ponts lui valent le surnom de Venise polonaise.
Quel fleuve partage Kyiv entre une rive droite historique et une vaste rive gauche ?|Le Dniepr|Le Don|La Volga|Le Dniestr|Troisième fleuve d’Europe par la longueur, il traverse la Biélorussie et l’Ukraine.
Quel fleuve traverse la Géorgie et l’Azerbaïdjan avant d’atteindre la Caspienne ?|La Koura|Le Rioni|L’Araxe|Le Don|Tbilissi s’est développée sur ses rives, autour de sources chaudes sulfureuses.
Sur les deux rives de quel fleuve la ville de Mossoul s’étend-elle ?|Le Tigre|L’Euphrate|L’Oronte|Le Jourdain|Les ruines de Ninive, capitale assyrienne, se trouvent sur la rive opposée à la vieille ville.
Combien de cours d’eau ont donné son nom à la région du Pendjab ?|Cinq|Trois|Sept|Neuf|Pendjab signifie « cinq eaux » en persan ; la Ravi, qui arrose Lahore, en fait partie.
Quel détroit sépare l’Espagne du Maroc ?|Le détroit de Gibraltar|Le Bosphore|Le détroit de Messine|Le Pas-de-Calais|À son point le plus étroit, Europe et Afrique ne sont séparées que par environ quatorze kilomètres.
Quel passage maritime sépare la Sicile de la Tunisie ?|Le canal de Sicile|Le canal d’Otrante|Le détroit de Bonifacio|Le détroit de Messine|Le canal de Sicile relie les bassins oriental et occidental de la Méditerranée.
Quel détroit sépare la Crimée de la péninsule de Taman ?|Le détroit de Kertch|Le Bosphore|Les Dardanelles|Le canal de Corinthe|Il commande l’accès à la mer d’Azov, la mer la moins profonde du monde.
Comment appelait-on les Dardanelles dans l’Antiquité grecque ?|L’Hellespont|Le Pont-Euxin|Le Propontide|Le Chersonèse|Ce passage vers la mer Égée fut le théâtre de la sanglante campagne de 1915.
Quelle part du pétrole transporté par mer franchit le détroit d’Ormuz ?|Environ un cinquième|Environ la moitié|Environ un centième|La quasi-totalité|Sa largeur navigable réduite en fait le point de passage le plus stratégique du commerce pétrolier.
Quel détroit commande l’entrée de la mer Rouge depuis le golfe d’Aden ?|Bab-el-Mandeb|Ormuz|Malacca|Le Bosphore|Son nom arabe signifie « la porte des lamentations », en raison de ses naufrages.
Quel détroit sépare l’île russe de Sakhaline du Japon ?|Le détroit de La Pérouse|Le détroit de Béring|Le détroit de Davis|Le détroit de Bass|Ce passage sépare Sakhaline de l’île japonaise de Hokkaidō.
Quel détroit sépare le Groenland de l’île de Baffin ?|Le détroit de Davis|Le détroit d’Hudson|Le détroit de Béring|Le détroit de Fram|Le détroit de Davis relie la baie de Baffin à la mer du Labrador.
Quel détroit sépare la Terre de Feu du continent sud-américain ?|Le détroit de Magellan|Le canal de Beagle|Le passage de Drake|Le détroit de Le Maire|Magellan emprunta ce passage lors de la première circumnavigation.
Quel passage maritime sépare le cap Horn de l’Antarctique ?|Le passage de Drake|Le détroit de Magellan|Le canal de Beagle|Le passage du Nord-Ouest|Le passage de Drake relie les océans Atlantique et Pacifique au sud de l’Amérique.
Quel État minuscule est niché dans les Pyrénées entre la France et l’Espagne ?|L’Andorre|Le Liechtenstein|Saint-Marin|Monaco|Ses coprinces sont l’évêque d’Urgell et le président de la République française.
Quel massif abrite la plus grande population d’ours bruns d’Europe hors Russie ?|Les Carpates|Les Alpes|Les Pyrénées|Les Balkans|La Roumanie à elle seule en compte plusieurs milliers.
Quel massif borde la côte adriatique des Balkans ?|Les Alpes dinariques|Les Balkans proprement dits|Le Pinde|Les Carpates|Ses calcaires ont donné leur nom au relief karstique, d’après la région du Karst.
Quelle chaîne occupe l’axe de la péninsule italienne ?|Les Apennins|Les Alpes|Les Pyrénées|Les Sudètes|Les Apennins s’étendent de la Ligurie à la Calabre.
Quelle chaîne sépare la Russie européenne de la Sibérie occidentale ?|L’Oural|Le Caucase|L’Altaï|Le Tian Shan|L’Oural sert traditionnellement de limite entre l’Europe et l’Asie.
Quelle chaîne comprend l’Elbrouz ?|Le Caucase|L’Oural|Les Carpates|L’Hindou Kouch|L’Elbrouz est un volcan endormi du Grand Caucase.
Quelle chaîne comprend le K2 ?|Le Karakoram|L’Himalaya|Le Pamir|Le Tian Shan|Le K2 se situe à la frontière entre le Pakistan et la Chine.
Quelle chaîne s’étend entre le Kazakhstan, le Kirghizistan et la Chine ?|Le Tian Shan|L’Altaï|Le Zagros|Le Kunlun|Le nom Tian Shan signifie « montagnes célestes ».
Quelle chaîne borde le plateau tibétain au nord ?|Le Kunlun|Le Karakoram|Le Caucase|Le Zagros|Les monts Kunlun forment un long arc à travers l’ouest de la Chine.
Quel massif iranien borde la plaine mésopotamienne à l’est ?|Le Zagros|L’Elbourz|L’Hindou Kouch|Le Kopet-Dag|Il s’est plissé sous la poussée de la plaque arabique contre l’Eurasie.
Quelle chaîne domine le sud de la Turquie ?|Le Taurus|Le Zagros|Le Caucase|Les Balkans|Les monts Taurus séparent le plateau anatolien du littoral méditerranéen.
Quelle chaîne forme l’épine dorsale de la péninsule Malaise ?|Les monts Titiwangsa|Les monts Arakan|Les Ghâts occidentaux|Les monts Annamites|Les Titiwangsa prolongent vers le sud le relief de la Thaïlande péninsulaire.
Quel massif sépare la côte occidentale de l’Inde du plateau du Deccan ?|Les Ghâts occidentaux|Les Ghâts orientaux|Les Vindhya|Les Aravalli|Ils bloquent la mousson et arrosent la côte de Malabar de plusieurs mètres de pluie.
Quelle cordillère suit la frontière entre le Viêt Nam et le Laos ?|La cordillère annamitique|Les monts Cardamomes|Les monts Arakan|Le plateau de Khorat|La piste Hô Chi Minh en franchissait les cols pendant la guerre du Viêt Nam.
Quelle chaîne sépare le nord et le sud de la Chine sur le plan biogéographique ?|Les monts Qinling|Le Kunlun|Le Tian Shan|L’Altaï|Avec la rivière Huai, les Qinling marquent une grande limite climatique chinoise.
Quelle est la plus longue chaîne de montagnes émergée du monde ?|Les Andes|L’Himalaya|Les Rocheuses|Le Grand Rift|Elles s’étirent sur environ 7 000 kilomètres du Venezuela à la Terre de Feu.
Quelle chaîne domine l’ouest de l’Amérique du Nord ?|Les Rocheuses|Les Appalaches|Les Adirondacks|Les Ozarks|Les Rocheuses s’étendent du Canada au Nouveau-Mexique.
Quelle chaîne volcanique s’étend de la Colombie-Britannique à la Californie du Nord ?|La chaîne des Cascades|La Sierra Nevada|La chaîne Côtière|Les monts Olympiques|Le mont Saint Helens, qui a explosé en 1980, en fait partie.
Quelle chaîne borde l’est de la Californie ?|La Sierra Nevada|Les Cascades|Les Appalaches|La chaîne Brooks|Le mont Whitney, point culminant des États-Unis contigus, appartient à la Sierra Nevada.
Quelle chaîne traverse le nord de l’Alaska ?|La chaîne Brooks|Les Cascades|Les Adirondacks|La Sierra Madre|La chaîne Brooks sépare le versant arctique de l’intérieur de l’Alaska.
Quelle chaîne mexicaine longe le golfe du Mexique ?|La Sierra Madre orientale|La Sierra Madre occidentale|La Sierra Madre del Sur|La cordillère Blanche|Elle borde le plateau mexicain sur son flanc oriental.
Quelle chaîne péruvienne comprend le Huascarán ?|La cordillère Blanche|La cordillère Noire|La cordillère Royale|La Sierra Nevada|La cordillère Blanche est la plus vaste chaîne tropicale englacée.
Quel lac est le plus profond du monde ?|Le lac Baïkal|Le lac Tanganyika|La mer Caspienne|Le lac Malawi|Le Baïkal atteint environ 1 642 mètres et contient une part majeure de l’eau douce liquide de surface.
Quel lac africain est le plus vaste par sa superficie ?|Le lac Victoria|Le lac Tanganyika|Le lac Malawi|Le lac Turkana|Le Victoria est partagé entre la Tanzanie, l’Ouganda et le Kenya.
Quel lac se trouve entre le Pérou et la Bolivie ?|Le lac Titicaca|Le lac Poopó|Le lac Maracaibo|Le salar d’Uyuni|Le Titicaca est navigué commercialement à plus de 3 800 mètres d’altitude.
Quel lac salé borde Israël et la Jordanie ?|La mer Morte|Le lac de Tibériade|Le lac d’Ourmia|Le lac Van|Sa surface se situe à plus de 400 mètres sous le niveau marin.
Quel lac se trouve entièrement en Hongrie ?|Le lac Balaton|Le lac de Constance|Le lac d’Ohrid|Le lac de Garde|Le Balaton est le plus grand lac d’Europe centrale.
Quelle particularité juridique distingue le lac de Constance de tout autre lac européen ?|Aucune frontière n’y est officiellement tracée|Il appartient à un seul pays|Il est administré par l’ONU|Il est interdit à la navigation|Allemagne, Suisse et Autriche se le partagent sans avoir jamais fixé de limites précises.
Quel est le lac le plus ancien et le plus profond des Balkans ?|Le lac d’Ohrid|Le lac de Skadar|Le lac Prespa|Le lac de Constance|Partagé entre Albanie et Macédoine du Nord, il abrite des espèces qu’on ne trouve nulle part ailleurs.
Quel est le plus grand lac de la péninsule balkanique ?|Le lac de Skadar|Le lac d’Ohrid|Le lac Prespa|Le lac Vrana|Partagé entre l’Albanie et le Monténégro, il accueille une importante population de pélicans.
Quel grand lac du Sahel a perdu la quasi-totalité de sa surface depuis les années 1960 ?|Le lac Tchad|Le lac Victoria|Le lac Turkana|Le lac Volta|Sécheresses et prélèvements pour l’irrigation l’ont réduit à une fraction de son étendue.
Quel lac occupe une partie du rift entre la Tanzanie et la RDC ?|Le lac Tanganyika|Le lac Victoria|Le lac Turkana|Le lac Tchad|Le Tanganyika est le deuxième lac le plus profond du monde.
Quelle mer sépare l’Italie des Balkans ?|La mer Adriatique|La mer Égée|La mer Ionienne|La mer Tyrrhénienne|L’Adriatique est reliée à la mer Ionienne par le canal d’Otrante.
Quelle particularité rend les profondeurs de la mer Noire presque sans vie ?|Elles sont dépourvues d’oxygène|Elles sont trop froides|Elles sont trop salées|Elles sont trop acides|L’eau douce des fleuves flotte sur l’eau salée et bloque le brassage : sous 150 mètres, le sulfure d’hydrogène domine.
Quelle mer borde la Suède à l’est ?|La mer Baltique|La mer du Nord|La mer de Norvège|La mer de Barents|Le golfe de Botnie constitue le bras nord de la Baltique.
Quelle mer borde la Roumanie ?|La mer Noire|La mer Adriatique|La mer Égée|La mer Caspienne|Le delta du Danube atteint la mer Noire entre Roumanie et Ukraine.
Quelle mer parsemée d’îles sépare la Grèce de la Turquie ?|La mer Égée|La mer de Marmara|La mer Ionienne|La mer Noire|Elle compte plusieurs milliers d’îles et d’îlots, dont les Cyclades et le Dodécanèse.
Quelle mer borde l’Arabie saoudite à l’ouest ?|La mer Rouge|La mer d’Arabie|La mer Caspienne|La Méditerranée|La mer Rouge occupe un rift entre les plaques africaine et arabique.
Quelle mer sépare l’Afrique de la péninsule Arabique ?|La mer Rouge|La mer d’Oman|Le golfe Persique|La mer d’Arabie|Elle s’élargit de quelques millimètres par an : c’est un océan en formation.
Quelle mer borde le Pakistan au sud ?|La mer d’Arabie|La mer Rouge|La mer d’Andaman|La mer de Chine|Karachi est le principal port pakistanais sur cette mer.
Quelle mer borde le Bangladesh au sud ?|Le golfe du Bengale|La mer d’Arabie|La mer d’Andaman|Le golfe de Thaïlande|Le Gange et le Brahmapoutre forment un immense delta sur ce golfe.
Quelle mer sépare Sumatra de la péninsule Malaise ?|Le détroit de Malacca|La mer de Java|La mer de Banda|Le golfe de Thaïlande|Ce couloir maritime relie l’océan Indien à la mer de Chine méridionale.
Quelle mer borde la côte nord de Java ?|La mer de Java|La mer de Banda|La mer de Timor|La mer des Célèbes|La mer de Java, peu profonde, appartient au plateau continental de la Sonde.
De quel navigateur la mer située entre l’Australie et la Nouvelle-Zélande porte-t-elle le nom ?|Abel Tasman|James Cook|Willem Janszoon|Matthew Flinders|Ce Néerlandais l’a franchie en 1642 et a laissé son nom à la mer comme à la Tasmanie.
Quelle mer borde le nord de l’Australie et le sud de la Nouvelle-Guinée ?|La mer d’Arafura|La mer de Tasman|La mer de Corail|La mer de Bismarck|La mer d’Arafura recouvre un plateau continental relativement peu profond.
`);

const SCIENCE = G(`
Quelle enzyme commence la digestion de l’amidon dans la bouche ?|L’amylase salivaire|La pepsine|La lipase pancréatique|La trypsine|L’amylase salivaire hydrolyse l’amidon en sucres plus courts avant son inactivation dans l’estomac acide.
Quelle enzyme de l’estomac digère principalement les protéines ?|La pepsine|L’amylase|La lactase|La lipoprotéine lipase|La pepsine est activée à partir du pepsinogène dans le milieu acide gastrique.
Quelle hormone favorise la réabsorption d’eau par les reins ?|L’hormone antidiurétique|L’insuline|La thyroxine|La calcitonine|L’ADH augmente la perméabilité à l’eau des tubes collecteurs rénaux.
Quelle hormone stimule principalement la production de globules rouges ?|L’érythropoïétine|La mélatonine|L’ocytocine|La gastrine|L’érythropoïétine est surtout produite par les reins en réponse à un manque d’oxygène.
Quelle glande produit principalement la thyroxine ?|La thyroïde|L’hypophyse|La glande pinéale|Le pancréas|La thyroxine contient de l’iode et contribue au réglage du métabolisme.
Quelle est la seule artère du corps à transporter du sang pauvre en oxygène ?|L’artère pulmonaire|L’aorte|La carotide|L’artère fémorale|Artère se définit par le sens du flux, du cœur vers les organes, et non par la teneur en oxygène.
Quelle cavité cardiaque propulse le sang dans l’aorte ?|Le ventricule gauche|Le ventricule droit|L’oreillette droite|L’oreillette gauche|Sa paroi musculaire est plus épaisse car elle alimente la circulation générale.
Quel type de cellule produit les anticorps ?|Le plasmocyte|Le globule rouge|Le neutrophile|La plaquette|Le plasmocyte est issu de la différenciation d’un lymphocyte B activé.
Quelle molécule transporte principalement l’oxygène dans le sang ?|L’hémoglobine|L’albumine|Le fibrinogène|L’insuline|Chaque molécule d’hémoglobine possède quatre groupes hème capables de fixer l’oxygène.
Quelle partie du néphron crée un gradient osmotique par un trajet en épingle ?|L’anse de Henlé|Le glomérule|Le tube proximal|La capsule de Bowman|Ses branches ont des perméabilités différentes qui permettent de concentrer l’urine.
Quel pigment visuel est présent dans les bâtonnets de la rétine ?|La rhodopsine|La mélanine|L’hémoglobine|La kératine|La rhodopsine est très sensible à la lumière et participe à la vision nocturne.
Quelle structure de l’oreille interne détecte les accélérations angulaires ?|Les canaux semi-circulaires|La cochlée|Le tympan|La trompe d’Eustache|Le déplacement de l’endolymphe dans ces canaux informe le cerveau sur les rotations de la tête.
Quel lobe cérébral traite principalement les informations visuelles ?|Le lobe occipital|Le lobe frontal|Le lobe temporal|Le lobe pariétal|Le cortex visuel primaire se situe à l’arrière du cerveau.
Quel organe lymphoïde, très actif chez l’enfant, régresse à l’âge adulte ?|Le thymus|La thyroïde|Le pancréas|La rate|C’est là que les lymphocytes T achèvent leur maturation, d’où leur nom.
Quelle protéine fibreuse domine dans les tendons ?|Le collagène|L’élastine|La kératine|La myosine|Les fibres de collagène sont alignées pour résister aux fortes tractions.
Quel type d’articulation est celle de l’épaule ?|Une énarthrose|Une charnière|Un pivot|Une suture|L’énarthrose permet des mouvements autour de plusieurs axes, au prix d’une stabilité moindre.
Quel ion déclenche l’interaction des protéines contractiles dans le muscle ?|Le calcium|Le sodium|Le chlorure|Le fer|Le calcium se fixe à la troponine et déplace la tropomyosine sur l’actine.
Quelle vitamine est nécessaire à la synthèse de plusieurs facteurs de coagulation ?|La vitamine K|La vitamine C|La vitamine B12|La vitamine E|La vitamine K permet une modification chimique indispensable à l’activité de certains facteurs.
Quelle carence provoque classiquement le scorbut ?|La vitamine C|La vitamine D|La vitamine A|La vitamine B1|La vitamine C est nécessaire à la synthèse normale du collagène.
Quel micro-organisme est responsable du paludisme ?|Un Plasmodium|Une Salmonella|Un Trypanosoma|Un Candida|Le parasite est transmis à l’être humain par des moustiques Anopheles femelles.
Quel vecteur transmet la maladie de Lyme en Europe ?|Une tique du genre Ixodes|Un moustique Aedes|Une puce|Une mouche tsé-tsé|Les tiques peuvent transmettre des bactéries du complexe Borrelia burgdorferi.
Quelle structure bactérienne assure principalement la propulsion de nombreuses espèces ?|Le flagelle|Le plasmide|La capsule|Le ribosome|Un moteur moléculaire fait tourner le flagelle bactérien.
Quel mécanisme permet à une cellule d’engloutir une grosse particule ?|La phagocytose|L’osmose|La diffusion simple|L’exocytose|La membrane entoure la particule et forme une vésicule appelée phagosome.
Quelle étape de la respiration cellulaire se déroule dans le cytosol ?|La glycolyse|Le cycle de Krebs|La chaîne respiratoire|La bêta-oxydation uniquement|La glycolyse transforme une molécule de glucose en deux molécules de pyruvate.
Dans quelle structure végétale ont lieu les réactions lumineuses de la photosynthèse ?|Les thylakoïdes|Le noyau|La vacuole|La paroi cellulaire|Les membranes des thylakoïdes portent les photosystèmes et la chaîne de transport d’électrons.
Quel tissu végétal produit les nouvelles cellules du bois et du liber ?|Le cambium|Le xylème|Le phloème|L’épiderme|Le cambium vasculaire assure la croissance en épaisseur des tiges et des racines.
Quel tissu végétal transporte principalement l’eau depuis les racines ?|Le xylème|Le phloème|Le parenchyme|Le liège|La transpiration foliaire contribue à tirer la colonne d’eau dans les vaisseaux du xylème.
Quel gaz les stomates absorbent-ils pour la photosynthèse ?|Le dioxyde de carbone|Le dioxygène|Le diazote|L’ozone|L’ouverture des stomates permet l’entrée du CO₂ mais entraîne aussi une perte d’eau.
Quel groupe végétal produit des graines sans fruits ?|Les gymnospermes|Les angiospermes|Les bryophytes|Les fougères|Chez les gymnospermes, les graines ne sont pas enfermées dans un ovaire devenu fruit.
Quel processus évolutif favorise les individus les mieux adaptés à leur environnement ?|La sélection naturelle|La dérive génétique uniquement|La mutation dirigée|L’hérédité des caractères acquis|La sélection modifie les fréquences de caractères héréditaires au fil des générations.
Quelle interaction avantage une espèce sans affecter sensiblement l’autre ?|Le commensalisme|Le mutualisme|Le parasitisme|La compétition|Dans le mutualisme, les deux partenaires tirent au contraire un bénéfice.
Quel niveau trophique occupent les organismes autotrophes ?|Les producteurs primaires|Les consommateurs primaires|Les décomposeurs uniquement|Les prédateurs supérieurs|Ils convertissent une source d’énergie en matière organique utilisable par l’écosystème.
Quelle grandeur est conservée dans un système isolé selon le premier principe de la thermodynamique ?|L’énergie|La température|L’entropie locale|La puissance|L’énergie peut changer de forme mais sa quantité totale reste constante.
Quelle grandeur mesure le désordre statistique d’un système thermodynamique ?|L’entropie|L’enthalpie|La pression|La viscosité|Dans un système isolé, l’entropie ne peut pas diminuer lors d’un processus spontané.
Quel transfert thermique s’effectue par ondes électromagnétiques ?|Le rayonnement|La conduction|La convection|L’advection seule|Le rayonnement peut transporter de l’énergie à travers le vide.
Quelle loi relie pression et volume d’un gaz parfait à température constante ?|La loi de Boyle-Mariotte|La loi de Charles|La loi de Faraday|La loi de Snell-Descartes|Pour une quantité fixe de gaz, le produit de la pression par le volume reste constant.
Quelle grandeur correspond à l’énergie transférée par unité de temps ?|La puissance|Le travail|La force|La quantité de mouvement|Dans le Système international, la puissance s’exprime en watts.
Quelle unité mesure une inductance électrique ?|Le henry|Le farad|Le weber|Le tesla|Une bobine de un henry s’oppose fortement aux variations rapides de courant.
Quelle unité mesure une pression ?|Le pascal|Le newton|Le tesla|Le watt|Un pascal équivaut à une force d’un newton répartie sur un mètre carré.
Quelle particule élémentaire appartient à la famille des leptons chargés et est la plus légère ?|L’électron|Le muon|Le tau|Le neutrino tau|Le muon et le tau ont la même charge que l’électron mais sont beaucoup plus massifs.
Quelle particule est l’antiparticule de l’électron ?|Le positon|Le proton|Le neutrino|Le muon|Le positon a la même masse que l’électron mais une charge positive.
Quelle interaction maintient les quarks liés dans les protons ?|L’interaction forte|L’interaction faible|L’électromagnétisme|La gravitation|Les gluons sont les bosons médiateurs de l’interaction forte.
Quelle interaction est responsable de la désintégration bêta ?|L’interaction faible|L’interaction forte|La gravitation|L’électromagnétisme|La désintégration bêta transforme notamment un neutron en proton ou inversement.
Quel effet décrit l’émission d’électrons par un matériau éclairé ?|L’effet photoélectrique|L’effet Doppler|L’effet Hall|L’effet Joule|L’énergie des électrons émis dépend de la fréquence de la lumière incidente.
À quoi sert un radar de contrôle routier fondé sur l’effet Doppler ?|À mesurer la vitesse d’un véhicule|À lire une plaque d’immatriculation|À peser un camion|À compter les passagers|L’écho renvoyé par le véhicule revient à une fréquence légèrement décalée, proportionnelle à sa vitesse.
À quelle condition la lumière reste-t-elle piégée dans une fibre optique ?|Quand elle frappe la paroi sous un angle suffisant|Quand la fibre est refroidie|Quand elle est polarisée|Quand la gaine est métallique|Au-delà de l’angle critique, la lumière est intégralement renvoyée : c’est la réflexion totale interne.
Quel phénomène empêche un rayon de sortir d’un milieu au-delà d’un angle critique ?|La réflexion totale interne|La réfraction simple|La diffusion Rayleigh|L’interférence destructive|Les fibres optiques guident la lumière grâce à cette réflexion.
Quelle loi donne la force électrique entre deux charges ponctuelles ?|La loi de Coulomb|La loi d’Ampère|La loi de Lenz|La loi de Kepler|La force varie comme l’inverse du carré de la distance entre les charges.
Quelle règle donne le sens du courant induit qui s’oppose à sa cause ?|La loi de Lenz|La loi d’Ohm|La loi de Gauss|La loi de Wien|Cette opposition traduit la conservation de l’énergie dans l’induction.
Quel composant électronique ne laisse idéalement passer le courant que dans un sens ?|La diode|La résistance|Le condensateur|La bobine|Une jonction p-n constitue le cœur de nombreuses diodes semi-conductrices.
Quel composant stocke de l’énergie dans un champ magnétique ?|La bobine|Le condensateur|La diode|Le fusible|L’énergie d’une inductance dépend de sa valeur et du carré du courant.
Quel composant stocke de l’énergie dans un champ électrique ?|Le condensateur|La bobine|Le transistor|Le transformateur|Deux armatures séparées par un isolant accumulent des charges opposées.
Quel élément chimique porte le numéro atomique 26 ?|Le fer|Le cobalt|Le nickel|Le manganèse|Le numéro atomique indique le nombre de protons du noyau.
Quel élément chimique porte le numéro atomique 79 ?|L’or|Le platine|Le mercure|L’argent|L’or a pour symbole Au, issu du latin aurum.
Quel halogène se présente comme un liquide rouge-brun à température ambiante ?|Le brome|Le chlore|L’iode|Le fluor|Le brome est le seul élément non métallique liquide dans les conditions ambiantes usuelles.
Quel gaz noble est utilisé dans de nombreuses enseignes lumineuses rouges-orangé ?|Le néon|L’argon|Le krypton|Le xénon|Une décharge électrique excite les atomes de néon, qui émettent leur couleur caractéristique.
Quel acide donne principalement son acidité au vinaigre ?|L’acide acétique|L’acide citrique|L’acide lactique|L’acide carbonique|Le vinaigre alimentaire est une solution diluée d’acide acétique issue d’une fermentation.
Quel acide minéral les cellules pariétales de l’estomac sécrètent-elles ?|L’acide chlorhydrique|L’acide sulfurique|L’acide nitrique|L’acide phosphorique|Cette sécrétion abaisse fortement le pH et contribue à activer la pepsine.
Quel polymère naturel constitue la paroi des cellules végétales ?|La cellulose|Le glycogène|La chitine|Le collagène|La cellulose est un polymère de glucose organisé en fibres résistantes.
Pourquoi les arthropodes doivent-ils muer pour grandir ?|Leur carapace rigide ne s’étire pas|Leurs pattes se renouvellent chaque an|Ils changent de régime alimentaire|Leur sang doit être remplacé|Juste après la mue, l’animal est mou et vulnérable jusqu’au durcissement de sa nouvelle cuticule.
Quel procédé transforme une huile insaturée en graisse plus solide par ajout d’hydrogène ?|L’hydrogénation|L’estérification|La saponification|La polymérisation|Une hydrogénation partielle peut aussi produire des acides gras trans.
Quel nombre indique l’acidité d’une solution aqueuse ?|Le pH|Le nombre d’Avogadro|L’indice de réfraction|Le potentiel redox seul|Une diminution d’une unité de pH correspond approximativement à dix fois plus d’ions oxonium.
Combien de degrés compte l’échelle de dureté de Mohs ?|Dix|Sept|Douze|Cinq|Elle va du talc, rayé à l’ongle, au diamant, que rien d’autre ne raye.
Quel minéral définit la valeur 1 sur l’échelle de Mohs ?|Le talc|Le gypse|La calcite|La fluorite|Le talc peut être rayé très facilement, même avec un ongle.
Quelle roche magmatique se forme par refroidissement lent en profondeur ?|Le granite|Le basalte|L’obsidienne|La pierre ponce|Le refroidissement lent permet la croissance de cristaux visibles dans le granite.
Quelle roche volcanique vitreuse résulte d’un refroidissement très rapide ?|L’obsidienne|Le granite|Le gneiss|Le calcaire|L’obsidienne se forme lorsque la lave refroidit trop vite pour cristalliser.
Quelle onde sismique arrive la première sur un sismographe ?|L’onde P|L’onde S|L’onde de Love|L’onde de Rayleigh|Plus rapide, elle précède l’onde S : l’écart entre les deux donne la distance de l’épicentre.
Quelle discontinuité sépare le manteau terrestre du noyau externe ?|La discontinuité de Gutenberg|La discontinuité de Mohorovičić|La discontinuité de Lehmann|La limite de Roche|À environ 2 900 kilomètres de profondeur, les ondes S cessent de se propager dans le noyau externe liquide.
Quelle échelle moderne mesure la magnitude d’un séisme à partir de son moment sismique ?|La magnitude de moment|L’échelle de Beaufort|L’échelle de Saffir-Simpson|L’échelle de Mohs|Elle évite la saturation de l’ancienne magnitude de Richter pour les très grands séismes.
Quel nuage en forme d’enclume atteint souvent la tropopause ?|Le cumulonimbus|Le cirrus|Le stratus|L’altocumulus|Ses puissants courants ascendants peuvent produire grêle, éclairs et fortes précipitations.
Quel instrument enregistre la durée d’ensoleillement ?|L’héliographe|Le baromètre|L’anémomètre|Le pluviomètre|L’héliographe traditionnel concentre les rayons du Soleil pour marquer une bande de papier.
Quelle échelle classe la force du vent d’après ses effets observés ?|L’échelle de Beaufort|L’échelle de Mercalli|L’échelle de Mohs|L’échelle de pH|Elle va traditionnellement de 0 pour le calme à 12 pour l’ouragan.
Quel gaz est le principal responsable naturel de l’effet de serre terrestre ?|La vapeur d’eau|Le méthane|L’ozone|Le protoxyde d’azote|La vapeur d’eau contribue fortement à l’effet de serre naturel et agit surtout comme rétroaction climatique.
Quelle couche de l’atmosphère les avions de ligne survolent-ils le plus souvent ?|La basse stratosphère|La mésosphère|La thermosphère|L’exosphère|Ils volent juste au-dessus de la troposphère pour éviter les turbulences et économiser du carburant.
Quelle couche atmosphérique abrite l’essentiel des phénomènes météorologiques ?|La troposphère|La stratosphère|La mésosphère|L’exosphère|La troposphère contient la majorité de la masse et presque toute la vapeur d’eau atmosphériques.
Quel objet stellaire reste après l’effondrement d’une étoile de masse comparable au Soleil ?|Une naine blanche|Une étoile à neutrons|Un trou noir|Un pulsar massif|Après avoir expulsé ses couches externes, le cœur dégénéré se refroidit lentement.
Quel processus alimente l’énergie du Soleil ?|La fusion nucléaire|La fission nucléaire|La combustion chimique|La contraction gravitationnelle seule|Dans son cœur, des noyaux d’hydrogène fusionnent principalement en hélium.
Quelle limite autour d’un trou noir empêche toute information de ressortir ?|L’horizon des événements|La photosphère|La magnétosphère|La limite de Roche|À l’intérieur de cet horizon, toutes les trajectoires futures conduisent vers l’intérieur.
Quel type de galaxie est la Voie lactée ?|Une spirale barrée|Une elliptique géante|Une irrégulière|Une lenticulaire sans barre|Une barre centrale d’étoiles relie les bras spiraux internes de notre galaxie.
`);

function build(categoryId: 'geographie' | 'sciences', prefix: string, facts: Fact[]): Question[] {
  return facts.map(([question, answer, d1, d2, d3, explanation], index) => {
    const source = [answer, d1, d2, d3];
    const options = source.map((_, i) => source[(i + index) % 4]);
    return { id: `${prefix}_${String(index + 1).padStart(3, '0')}`, categoryId, question, options,
      correctAnswerIndex: options.indexOf(answer), difficulty: 'adulte', explanation };
  });
}

export const GEOGRAPHIE_ADULTE_EDITORIAL_FINAL = build('geographie', 'geo_adulte_editorial_final', GEOGRAPHY);
export const SCIENCES_ADULTE_EDITORIAL_FINAL = build('sciences', 'sci_adulte_editorial_final', SCIENCE);

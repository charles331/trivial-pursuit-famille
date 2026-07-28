import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const G = (raw: string): Fact[] => raw.trim().split('\n').map(line => line.split('|') as Fact);

const GEOGRAPHY = G(`
Dans quel pays se trouve la Transylvanie ?|La Roumanie|La Bulgarie|La Hongrie|La Serbie|Cette région historique occupe le centre de la Roumanie, à l’intérieur de l’arc des Carpates.
Dans quel pays se trouve la Cappadoce ?|La Turquie|La Géorgie|L’Arménie|La Grèce|La Cappadoce est un plateau d’Anatolie centrale célèbre pour ses formations volcaniques.
Dans quel pays se trouve la vallée de la Bekaa ?|Le Liban|La Jordanie|La Syrie|Israël|La Bekaa s’étend entre les chaînes du Mont-Liban et de l’Anti-Liban.
Dans quel pays se trouve le delta de l’Okavango ?|Le Botswana|La Namibie|La Zambie|Le Zimbabwe|L’Okavango se disperse dans les sables du Kalahari sans atteindre la mer.
Dans quel pays se trouve le salar d’Uyuni ?|La Bolivie|Le Chili|Le Pérou|L’Argentine|Ce désert de sel occupe l’Altiplano bolivien à plus de 3 600 mètres d’altitude.
Dans quel pays se trouve la région du Pantanal ?|Le Brésil|La Colombie|Le Venezuela|L’Équateur|La majeure partie de cette vaste zone humide se situe au Brésil, avec des extensions en Bolivie et au Paraguay.
Dans quel pays se trouve la vallée de Kathmandu ?|Le Népal|Le Bhoutan|L’Inde|Le Pakistan|La vallée, entourée par les contreforts himalayens, abrite la capitale népalaise.
Dans quel pays se trouve le plateau du Deccan ?|L’Inde|Le Pakistan|Le Bangladesh|Le Népal|Le Deccan occupe une grande partie de la péninsule indienne au sud du fleuve Narmada.
Dans quel pays se trouve la région du Ladakh ?|L’Inde|Le Népal|Le Bhoutan|L’Afghanistan|Le Ladakh est un territoire de haute altitude situé entre le Karakoram et l’Himalaya.
Dans quel pays se trouve le désert du Taklamakan ?|La Chine|La Mongolie|Le Kazakhstan|L’Ouzbékistan|Le Taklamakan occupe le bassin du Tarim, dans la région chinoise du Xinjiang.
Dans quel pays se trouve la baie d’Ha Long ?|Le Viêt Nam|La Thaïlande|Le Cambodge|La Malaisie|Ses pitons calcaires émergent du golfe du Tonkin, dans le nord du Viêt Nam.
Dans quel pays se trouve le lac Toba ?|L’Indonésie|La Malaisie|Les Philippines|Le Timor oriental|Ce lac de caldeira se trouve sur l’île indonésienne de Sumatra.
Dans quel pays se trouve la plaine de Nullarbor ?|L’Australie|La Nouvelle-Zélande|L’Afrique du Sud|La Namibie|Cette vaste plaine calcaire aride borde la Grande Baie australienne.
Dans quel pays se trouve le fjord de Milford Sound ?|La Nouvelle-Zélande|La Norvège|Le Canada|Le Chili|Milford Sound, appelé Piopiotahi en maori, entaille le sud-ouest de l’île du Sud.
Dans quel pays se trouve la vallée de la Mort ?|Les États-Unis|Le Mexique|Le Chili|L’Australie|Cette dépression désertique appartient principalement au parc national californien du même nom.
Dans quel pays se trouve la péninsule du Yucatán ?|Le Mexique|Le Guatemala|Le Honduras|Le Costa Rica|Le Mexique occupe la majeure partie du Yucatán, partagé au sud avec le Belize et le Guatemala.
Dans quel pays se trouve la baie de Fundy ?|Le Canada|Les États-Unis|L’Islande|Le Groenland|Cette baie entre le Nouveau-Brunswick et la Nouvelle-Écosse connaît des marées parmi les plus fortes du monde.
Dans quel pays se trouve le parc national de Banff ?|Le Canada|Les États-Unis|La Suisse|La Norvège|Banff protège une partie des Rocheuses dans la province canadienne de l’Alberta.
Dans quel pays se trouve l’archipel des Galápagos ?|L’Équateur|Le Pérou|La Colombie|Le Costa Rica|Les Galápagos forment une province équatorienne située dans le Pacifique oriental.
Dans quel pays se trouve le cap Horn ?|Le Chili|L’Argentine|L’Uruguay|Le Pérou|Le cap Horn appartient à l’archipel chilien de la Terre de Feu.
Quel fleuve traverse Budapest ?|Le Danube|La Vistule|L’Elbe|Le Dniepr|Le Danube sépare historiquement Buda, sur la rive droite, de Pest, sur la rive gauche.
Quel fleuve traverse Bratislava ?|Le Danube|Le Rhin|La Save|La Drave|Bratislava se trouve près du point de rencontre des frontières slovaque, autrichienne et hongroise.
Quel fleuve traverse Belgrade ?|Le Danube|La Tisza|La Morava|Le Prout|Belgrade s’élève au confluent du Danube et de la Save.
Quel fleuve traverse Le Caire ?|Le Nil|Le Niger|Le Sénégal|Le Congo|Le Caire s’étend de part et d’autre du Nil, au sud de son delta.
Sur quel fleuve irakien la ville de Samarra est-elle établie ?|Le Tigre|L’Euphrate|Le Jourdain|L’Oronte|Samarra fut une capitale du califat abbasside au IXe siècle.
Quel fleuve traverse Hanoï ?|Le fleuve Rouge|Le Mékong|Le Salouen|L’Irrawaddy|Le fleuve Rouge apporte des alluvions à son vaste delta du nord du Viêt Nam.
Quel fleuve traverse Phnom Penh ?|Le Mékong|Le Chao Phraya|Le fleuve Rouge|Le Yangtsé|À Phnom Penh, le Mékong rencontre le Tonlé Sap et se divise vers son delta.
Quel fleuve traverse Khartoum ?|Le Nil|Le Congo|Le Zambèze|Le Limpopo|Le Nil Blanc et le Nil Bleu se rejoignent à Khartoum.
Quel fleuve traverse Niamey ?|Le Niger|Le Sénégal|La Volta|Le Chari|Le Niger décrit une large boucle avant de traverser la capitale du Niger.
Quel fleuve traverse Kinshasa ?|Le Congo|Le Niger|L’Ogooué|Le Zambèze|Kinshasa fait face à Brazzaville sur la rive opposée du fleuve Congo.
Quel fleuve traverse Séville ?|Le Guadalquivir|Le Tage|L’Èbre|Le Douro|Le Guadalquivir est navigable jusqu’à Séville depuis l’Atlantique.
Quel fleuve traverse Saragosse ?|L’Èbre|Le Tage|Le Douro|Le Guadiana|L’Èbre traverse le nord-est de l’Espagne avant de former un delta méditerranéen.
Quel fleuve traverse Bordeaux ?|La Garonne|La Loire|La Dordogne|L’Adour|En aval de Bordeaux, la Garonne rejoint la Dordogne pour former l’estuaire de la Gironde.
Quel fleuve traverse Nantes ?|La Loire|La Seine|La Garonne|La Charente|Nantes se situe près de l’estuaire de la Loire, ouvert sur l’Atlantique.
Quel fleuve traverse Dresde ?|L’Elbe|Le Rhin|L’Oder|Le Main|L’Elbe traverse la Saxe puis rejoint la mer du Nord près de Hambourg.
Quel fleuve traverse Wrocław ?|L’Oder|La Vistule|L’Elbe|Le Niémen|Wrocław est bâtie sur plusieurs bras et îles de l’Oder.
Quel fleuve traverse Kyiv ?|Le Dniepr|Le Don|La Volga|Le Dniestr|Le Dniepr partage Kyiv entre une rive droite historique et une vaste rive gauche.
Quel fleuve traverse Tbilissi ?|La Koura|Le Rioni|L’Araxe|Le Don|La Koura traverse la Géorgie puis l’Azerbaïdjan avant d’atteindre la Caspienne.
Quel fleuve traverse Mossoul ?|Le Tigre|L’Euphrate|L’Oronte|Le Jourdain|Mossoul s’étend sur les deux rives du Tigre dans le nord de l’Irak.
Quel fleuve traverse Lahore ?|La Ravi|L’Indus|Le Gange|La Sutlej|La Ravi est l’un des cinq cours d’eau qui ont donné son nom au Pendjab.
Quel détroit sépare l’Espagne du Maroc ?|Le détroit de Gibraltar|Le Bosphore|Le détroit de Messine|Le Pas-de-Calais|À son point le plus étroit, Europe et Afrique ne sont séparées que par environ quatorze kilomètres.
Quel passage maritime sépare la Sicile de la Tunisie ?|Le canal de Sicile|Le canal d’Otrante|Le détroit de Bonifacio|Le détroit de Messine|Le canal de Sicile relie les bassins oriental et occidental de la Méditerranée.
Quel détroit relie la mer Noire à la mer d’Azov ?|Le détroit de Kertch|Le Bosphore|Les Dardanelles|Le canal de Corinthe|La péninsule de Kertch fait face à celle de Taman de part et d’autre du passage.
Quel détroit relie la mer de Marmara à la mer Égée ?|Les Dardanelles|Le Bosphore|Le détroit d’Ormuz|Le canal d’Otrante|Les Dardanelles longent la péninsule turque de Gallipoli.
Quel détroit sépare l’Iran de la péninsule d’Arabie ?|Le détroit d’Ormuz|Bab-el-Mandeb|Le Bosphore|Le détroit de Malacca|Ce passage relie le golfe Persique au golfe d’Oman.
Quel détroit relie la mer Rouge au golfe d’Aden ?|Bab-el-Mandeb|Le détroit d’Ormuz|Le canal de Mozambique|Le Bosphore|Bab-el-Mandeb sépare Djibouti et l’Érythrée du Yémen.
Quel détroit sépare l’île russe de Sakhaline du Japon ?|Le détroit de La Pérouse|Le détroit de Béring|Le détroit de Davis|Le détroit de Bass|Ce passage sépare Sakhaline de l’île japonaise de Hokkaidō.
Quel détroit sépare le Groenland de l’île de Baffin ?|Le détroit de Davis|Le détroit d’Hudson|Le détroit de Béring|Le détroit de Fram|Le détroit de Davis relie la baie de Baffin à la mer du Labrador.
Quel détroit sépare la Terre de Feu du continent sud-américain ?|Le détroit de Magellan|Le canal de Beagle|Le passage de Drake|Le détroit de Le Maire|Magellan emprunta ce passage lors de la première circumnavigation.
Quel passage maritime sépare le cap Horn de l’Antarctique ?|Le passage de Drake|Le détroit de Magellan|Le canal de Beagle|Le passage du Nord-Ouest|Le passage de Drake relie les océans Atlantique et Pacifique au sud de l’Amérique.
Quelle chaîne sépare en partie la France et l’Espagne ?|Les Pyrénées|Les Alpes|Les Carpates|Les Apennins|Les Pyrénées s’étirent de la Méditerranée au golfe de Gascogne.
Quelle chaîne traverse la Slovaquie, l’Ukraine et la Roumanie ?|Les Carpates|Les Balkans|Les Alpes dinariques|Le Caucase|L’arc carpatique entoure en grande partie le bassin de Pannonie.
Quelle chaîne longe la côte adriatique des Balkans ?|Les Alpes dinariques|Les Carpates|Les Apennins|Les monts Taurus|Ce relief karstique s’étend de la Slovénie à l’Albanie.
Quelle chaîne occupe l’axe de la péninsule italienne ?|Les Apennins|Les Alpes|Les Pyrénées|Les Sudètes|Les Apennins s’étendent de la Ligurie à la Calabre.
Quelle chaîne sépare la Russie européenne de la Sibérie occidentale ?|L’Oural|Le Caucase|L’Altaï|Le Tian Shan|L’Oural sert traditionnellement de limite entre l’Europe et l’Asie.
Quelle chaîne comprend l’Elbrouz ?|Le Caucase|L’Oural|Les Carpates|L’Hindou Kouch|L’Elbrouz est un volcan endormi du Grand Caucase.
Quelle chaîne comprend le K2 ?|Le Karakoram|L’Himalaya|Le Pamir|Le Tian Shan|Le K2 se situe à la frontière entre le Pakistan et la Chine.
Quelle chaîne s’étend entre le Kazakhstan, le Kirghizistan et la Chine ?|Le Tian Shan|L’Altaï|Le Zagros|Le Kunlun|Le nom Tian Shan signifie « montagnes célestes ».
Quelle chaîne borde le plateau tibétain au nord ?|Le Kunlun|Le Karakoram|Le Caucase|Le Zagros|Les monts Kunlun forment un long arc à travers l’ouest de la Chine.
Quelle chaîne longe l’ouest de l’Iran ?|Le Zagros|Le Taurus|L’Hindou Kouch|Le Caucase|Le Zagros résulte de la collision des plaques arabique et eurasienne.
Quelle chaîne domine le sud de la Turquie ?|Le Taurus|Le Zagros|Le Caucase|Les Balkans|Les monts Taurus séparent le plateau anatolien du littoral méditerranéen.
Quelle chaîne forme l’épine dorsale de la péninsule Malaise ?|Les monts Titiwangsa|Les monts Arakan|Les Ghâts occidentaux|Les monts Annamites|Les Titiwangsa prolongent vers le sud le relief de la Thaïlande péninsulaire.
Quelle chaîne longe l’ouest de l’Inde ?|Les Ghâts occidentaux|Les Ghâts orientaux|Les monts Arakan|Les monts Annamites|Les Ghâts occidentaux interceptent la mousson et abritent une forte biodiversité.
Quelle chaîne longe la frontière entre le Viêt Nam et le Laos ?|La cordillère annamitique|Les monts Arakan|Les monts Titiwangsa|Les monts Qinling|Cette chaîne tropicale s’étire parallèlement à la côte vietnamienne.
Quelle chaîne sépare le nord et le sud de la Chine sur le plan biogéographique ?|Les monts Qinling|Le Kunlun|Le Tian Shan|L’Altaï|Avec la rivière Huai, les Qinling marquent une grande limite climatique chinoise.
Quelle chaîne longe la côte pacifique de l’Amérique du Sud ?|Les Andes|Les Rocheuses|La Sierra Madre|Les Appalaches|Les Andes constituent la plus longue chaîne de montagnes continentale émergée.
Quelle chaîne domine l’ouest de l’Amérique du Nord ?|Les Rocheuses|Les Appalaches|Les Adirondacks|Les Ozarks|Les Rocheuses s’étendent du Canada au Nouveau-Mexique.
Quelle chaîne longe la côte pacifique du Canada et des États-Unis ?|La chaîne des Cascades|Les Appalaches|La Sierra Madre orientale|Les monts Ozark|Les Cascades comprennent plusieurs volcans, dont le mont Rainier.
Quelle chaîne borde l’est de la Californie ?|La Sierra Nevada|Les Cascades|Les Appalaches|La chaîne Brooks|Le mont Whitney, point culminant des États-Unis contigus, appartient à la Sierra Nevada.
Quelle chaîne traverse le nord de l’Alaska ?|La chaîne Brooks|Les Cascades|Les Adirondacks|La Sierra Madre|La chaîne Brooks sépare le versant arctique de l’intérieur de l’Alaska.
Quelle chaîne mexicaine longe le golfe du Mexique ?|La Sierra Madre orientale|La Sierra Madre occidentale|La Sierra Madre del Sur|La cordillère Blanche|Elle borde le plateau mexicain sur son flanc oriental.
Quelle chaîne péruvienne comprend le Huascarán ?|La cordillère Blanche|La cordillère Noire|La cordillère Royale|La Sierra Nevada|La cordillère Blanche est la plus vaste chaîne tropicale englacée.
Quel lac est le plus profond du monde ?|Le lac Baïkal|Le lac Tanganyika|La mer Caspienne|Le lac Malawi|Le Baïkal atteint environ 1 642 mètres et contient une part majeure de l’eau douce liquide de surface.
Quel lac africain est le plus vaste par sa superficie ?|Le lac Victoria|Le lac Tanganyika|Le lac Malawi|Le lac Turkana|Le Victoria est partagé entre la Tanzanie, l’Ouganda et le Kenya.
Quel lac se trouve entre le Pérou et la Bolivie ?|Le lac Titicaca|Le lac Poopó|Le lac Maracaibo|Le salar d’Uyuni|Le Titicaca est navigué commercialement à plus de 3 800 mètres d’altitude.
Quel lac salé borde Israël et la Jordanie ?|La mer Morte|Le lac de Tibériade|Le lac d’Ourmia|Le lac Van|Sa surface se situe à plus de 400 mètres sous le niveau marin.
Quel lac se trouve entièrement en Hongrie ?|Le lac Balaton|Le lac de Constance|Le lac d’Ohrid|Le lac de Garde|Le Balaton est le plus grand lac d’Europe centrale.
Quel lac est partagé par l’Allemagne, la Suisse et l’Autriche ?|Le lac de Constance|Le lac Léman|Le lac Majeur|Le lac Balaton|Le Rhin traverse le lac de Constance avant de poursuivre vers l’ouest.
Quel lac est partagé par l’Albanie et la Macédoine du Nord ?|Le lac d’Ohrid|Le lac Prespa uniquement|Le lac Skadar|Le lac Balaton|Ohrid est l’un des lacs les plus anciens et les plus profonds d’Europe.
Quel lac est partagé par l’Albanie et le Monténégro ?|Le lac de Skadar|Le lac d’Ohrid|Le lac Prespa|Le lac de Bled|Le lac de Skadar est le plus vaste lac des Balkans.
Quel lac est la principale source du Nil Blanc ?|Le lac Victoria|Le lac Albert|Le lac Édouard|Le lac Kivu|Le Nil Victoria quitte le lac près de Jinja, en Ouganda.
Quel lac occupe une partie du rift entre la Tanzanie et la RDC ?|Le lac Tanganyika|Le lac Victoria|Le lac Turkana|Le lac Tchad|Le Tanganyika est le deuxième lac le plus profond du monde.
Quelle mer sépare l’Italie des Balkans ?|La mer Adriatique|La mer Égée|La mer Ionienne|La mer Tyrrhénienne|L’Adriatique est reliée à la mer Ionienne par le canal d’Otrante.
Quelle mer borde la Bulgarie à l’est ?|La mer Noire|La mer Égée|La mer Adriatique|La mer Caspienne|Le littoral bulgare s’étend entre la Roumanie et la Turquie.
Quelle mer borde la Suède à l’est ?|La mer Baltique|La mer du Nord|La mer de Norvège|La mer de Barents|Le golfe de Botnie constitue le bras nord de la Baltique.
Quelle mer borde la Roumanie ?|La mer Noire|La mer Adriatique|La mer Égée|La mer Caspienne|Le delta du Danube atteint la mer Noire entre Roumanie et Ukraine.
Quelle mer se trouve entre la Grèce et la Turquie ?|La mer Égée|La mer Ionienne|La mer Adriatique|La mer Tyrrhénienne|La mer Égée est parsemée de nombreuses îles grecques.
Quelle mer borde l’Arabie saoudite à l’ouest ?|La mer Rouge|La mer d’Arabie|La mer Caspienne|La Méditerranée|La mer Rouge occupe un rift entre les plaques africaine et arabique.
Quelle mer se trouve entre l’Afrique et la péninsule Arabique ?|La mer Rouge|La mer d’Arabie|La mer Noire|La mer Caspienne|Elle communique avec la Méditerranée par le canal de Suez.
Quelle mer borde le Pakistan au sud ?|La mer d’Arabie|La mer Rouge|La mer d’Andaman|La mer de Chine|Karachi est le principal port pakistanais sur cette mer.
Quelle mer borde le Bangladesh au sud ?|Le golfe du Bengale|La mer d’Arabie|La mer d’Andaman|Le golfe de Thaïlande|Le Gange et le Brahmapoutre forment un immense delta sur ce golfe.
Quelle mer sépare Sumatra de la péninsule Malaise ?|Le détroit de Malacca|La mer de Java|La mer de Banda|Le golfe de Thaïlande|Ce couloir maritime relie l’océan Indien à la mer de Chine méridionale.
Quelle mer borde la côte nord de Java ?|La mer de Java|La mer de Banda|La mer de Timor|La mer des Célèbes|La mer de Java, peu profonde, appartient au plateau continental de la Sonde.
Quelle mer se trouve entre l’Australie et la Nouvelle-Zélande ?|La mer de Tasman|La mer de Corail|La mer d’Arafura|La mer de Timor|Elle porte le nom du navigateur néerlandais Abel Tasman.
Quelle mer borde le nord de l’Australie et le sud de la Nouvelle-Guinée ?|La mer d’Arafura|La mer de Tasman|La mer de Corail|La mer de Bismarck|La mer d’Arafura recouvre un plateau continental relativement peu profond.
`);

const SCIENCE = G(`
Quelle enzyme commence la digestion de l’amidon dans la bouche ?|L’amylase salivaire|La pepsine|La lipase pancréatique|La trypsine|L’amylase salivaire hydrolyse l’amidon en sucres plus courts avant son inactivation dans l’estomac acide.
Quelle enzyme de l’estomac digère principalement les protéines ?|La pepsine|L’amylase|La lactase|La lipoprotéine lipase|La pepsine est activée à partir du pepsinogène dans le milieu acide gastrique.
Quelle hormone favorise la réabsorption d’eau par les reins ?|L’hormone antidiurétique|L’insuline|La thyroxine|La calcitonine|L’ADH augmente la perméabilité à l’eau des tubes collecteurs rénaux.
Quelle hormone stimule principalement la production de globules rouges ?|L’érythropoïétine|La mélatonine|L’ocytocine|La gastrine|L’érythropoïétine est surtout produite par les reins en réponse à un manque d’oxygène.
Quelle glande produit principalement la thyroxine ?|La thyroïde|L’hypophyse|La glande pinéale|Le pancréas|La thyroxine contient de l’iode et contribue au réglage du métabolisme.
Quel vaisseau apporte le sang oxygéné des poumons au cœur ?|La veine pulmonaire|L’artère pulmonaire|La veine cave|L’aorte|Les veines pulmonaires se jettent dans l’oreillette gauche.
Quelle cavité cardiaque propulse le sang dans l’aorte ?|Le ventricule gauche|Le ventricule droit|L’oreillette droite|L’oreillette gauche|Sa paroi musculaire est plus épaisse car elle alimente la circulation générale.
Quel type de cellule produit les anticorps ?|Le plasmocyte|Le globule rouge|Le neutrophile|La plaquette|Le plasmocyte est issu de la différenciation d’un lymphocyte B activé.
Quelle molécule transporte principalement l’oxygène dans le sang ?|L’hémoglobine|L’albumine|Le fibrinogène|L’insuline|Chaque molécule d’hémoglobine possède quatre groupes hème capables de fixer l’oxygène.
Quelle partie du néphron crée un gradient osmotique par un trajet en épingle ?|L’anse de Henlé|Le glomérule|Le tube proximal|La capsule de Bowman|Ses branches ont des perméabilités différentes qui permettent de concentrer l’urine.
Quel pigment visuel est présent dans les bâtonnets de la rétine ?|La rhodopsine|La mélanine|L’hémoglobine|La kératine|La rhodopsine est très sensible à la lumière et participe à la vision nocturne.
Quelle structure de l’oreille interne détecte les accélérations angulaires ?|Les canaux semi-circulaires|La cochlée|Le tympan|La trompe d’Eustache|Le déplacement de l’endolymphe dans ces canaux informe le cerveau sur les rotations de la tête.
Quel lobe cérébral traite principalement les informations visuelles ?|Le lobe occipital|Le lobe frontal|Le lobe temporal|Le lobe pariétal|Le cortex visuel primaire se situe à l’arrière du cerveau.
Quelle partie du cerveau coordonne finement les mouvements et l’équilibre ?|Le cervelet|Le thalamus|L’hypothalamus|Le bulbe olfactif|Le cervelet compare les mouvements prévus aux informations sensorielles reçues.
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
Quel tissu végétal transporte principalement les sucres ?|Le phloème|Le xylème|Le cambium|L’épiderme|Le phloème distribue notamment le saccharose des organes sources vers les organes consommateurs.
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
Quelle unité mesure une fréquence ?|Le hertz|Le joule|Le pascal|Le lumen|Un hertz correspond à un cycle par seconde.
Quelle unité mesure une pression ?|Le pascal|Le newton|Le tesla|Le watt|Un pascal équivaut à une force d’un newton répartie sur un mètre carré.
Quelle particule élémentaire appartient à la famille des leptons chargés et est la plus légère ?|L’électron|Le muon|Le tau|Le neutrino tau|Le muon et le tau ont la même charge que l’électron mais sont beaucoup plus massifs.
Quelle particule est l’antiparticule de l’électron ?|Le positon|Le proton|Le neutrino|Le muon|Le positon a la même masse que l’électron mais une charge positive.
Quelle interaction maintient les quarks liés dans les protons ?|L’interaction forte|L’interaction faible|L’électromagnétisme|La gravitation|Les gluons sont les bosons médiateurs de l’interaction forte.
Quelle interaction est responsable de la désintégration bêta ?|L’interaction faible|L’interaction forte|La gravitation|L’électromagnétisme|La désintégration bêta transforme notamment un neutron en proton ou inversement.
Quel effet décrit l’émission d’électrons par un matériau éclairé ?|L’effet photoélectrique|L’effet Doppler|L’effet Hall|L’effet Joule|L’énergie des électrons émis dépend de la fréquence de la lumière incidente.
Quel effet modifie la fréquence perçue quand une source se déplace ?|L’effet Doppler|L’effet Zeeman|L’effet Compton|L’effet tunnel|Une source qui approche produit généralement une fréquence perçue plus élevée.
Quel phénomène sépare la lumière blanche en couleurs dans un prisme ?|La dispersion|La diffraction|La polarisation|La réflexion totale|L’indice du verre varie avec la longueur d’onde, déviant différemment chaque couleur.
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
Quel polymère naturel constitue l’exosquelette des arthropodes ?|La chitine|La cellulose|L’amidon|La kératine|La chitine est aussi présente dans la paroi de nombreux champignons.
Quel procédé transforme une huile insaturée en graisse plus solide par ajout d’hydrogène ?|L’hydrogénation|L’estérification|La saponification|La polymérisation|Une hydrogénation partielle peut aussi produire des acides gras trans.
Quel nombre indique l’acidité d’une solution aqueuse ?|Le pH|Le nombre d’Avogadro|L’indice de réfraction|Le potentiel redox seul|Une diminution d’une unité de pH correspond approximativement à dix fois plus d’ions oxonium.
Quel minéral définit la valeur 10 sur l’échelle de Mohs ?|Le diamant|Le quartz|Le corindon|La topaze|L’échelle de Mohs compare la résistance des minéraux à la rayure.
Quel minéral définit la valeur 1 sur l’échelle de Mohs ?|Le talc|Le gypse|La calcite|La fluorite|Le talc peut être rayé très facilement, même avec un ongle.
Quelle roche magmatique se forme par refroidissement lent en profondeur ?|Le granite|Le basalte|L’obsidienne|La pierre ponce|Le refroidissement lent permet la croissance de cristaux visibles dans le granite.
Quelle roche volcanique vitreuse résulte d’un refroidissement très rapide ?|L’obsidienne|Le granite|Le gneiss|Le calcaire|L’obsidienne se forme lorsque la lave refroidit trop vite pour cristalliser.
Quel type d’onde sismique ne traverse pas les liquides ?|L’onde S|L’onde P|L’onde sonore dans l’air|L’onde de marée|L’absence d’ondes S dans le noyau externe a montré que celui-ci est liquide.
Quelle discontinuité sépare le manteau terrestre du noyau externe ?|La discontinuité de Gutenberg|La discontinuité de Mohorovičić|La discontinuité de Lehmann|La limite de Roche|À environ 2 900 kilomètres de profondeur, les ondes S cessent de se propager dans le noyau externe liquide.
Quelle échelle moderne mesure la magnitude d’un séisme à partir de son moment sismique ?|La magnitude de moment|L’échelle de Beaufort|L’échelle de Saffir-Simpson|L’échelle de Mohs|Elle évite la saturation de l’ancienne magnitude de Richter pour les très grands séismes.
Quel nuage est typiquement associé aux orages ?|Le cumulonimbus|Le cirrus|Le stratus|L’altocumulus|Un cumulonimbus peut s’étendre jusqu’à la tropopause et produire grêle ou éclairs.
Quel instrument mesure l’humidité de l’air ?|L’hygromètre|Le baromètre|L’anémomètre|Le pluviomètre|L’humidité relative compare la vapeur présente à la quantité maximale possible à cette température.
Quelle échelle classe la force du vent d’après ses effets observés ?|L’échelle de Beaufort|L’échelle de Mercalli|L’échelle de Mohs|L’échelle de pH|Elle va traditionnellement de 0 pour le calme à 12 pour l’ouragan.
Quel gaz est le principal responsable naturel de l’effet de serre terrestre ?|La vapeur d’eau|Le méthane|L’ozone|Le protoxyde d’azote|La vapeur d’eau contribue fortement à l’effet de serre naturel et agit surtout comme rétroaction climatique.
Quelle couche atmosphérique contient la majeure partie de l’ozone protecteur ?|La stratosphère|La troposphère|La mésosphère|La thermosphère|La couche d’ozone absorbe une grande partie du rayonnement ultraviolet solaire.
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

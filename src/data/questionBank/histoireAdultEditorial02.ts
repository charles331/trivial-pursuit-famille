import { Question } from '../../types';

type HistoryFact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: HistoryFact[] = [
  ['Quelle cité sumérienne est associée au roi légendaire Gilgamesh ?', 'Uruk', 'Ur', 'Lagash', 'Nippur', 'L’Épopée de Gilgamesh présente son héros comme roi d’Uruk, grande cité de Mésopotamie.'],
  ['Quel peuple fonda des comptoirs comme Carthage autour de la Méditerranée ?', 'Les Phéniciens', 'Les Hittites', 'Les Étrusques', 'Les Parthes', 'Carthage fut fondée par des colons phéniciens venus de Tyr, selon la tradition au IXe siècle av. J.-C.'],
  ['Quel pharaon imposa temporairement le culte d’Aton au XIVe siècle av. J.-C. ?', 'Akhenaton', 'Ramsès II', 'Thoutmôsis III', 'Psammétique Ier', 'Akhenaton fonda une nouvelle capitale à Akhetaton, sur le site actuel d’Amarna.'],
  ['Quelle bataille opposa Ramsès II aux Hittites vers 1274 av. J.-C. ?', 'Qadesh', 'Megiddo', 'Péluse', 'Karkemish', 'La bataille de Qadesh fut suivie des années plus tard par un célèbre traité de paix égypto-hittite.'],
  ['Quel roi perse autorisa le retour d’exil de populations déportées à Babylone ?', 'Cyrus II', 'Xerxès Ier', 'Darius III', 'Artaxerxès III', 'Le cylindre de Cyrus décrit sa politique de restauration de sanctuaires après la prise de Babylone en 539 av. J.-C.'],
  ['Quel législateur athénien abolit l’esclavage pour dettes au début du VIe siècle av. J.-C. ?', 'Solon', 'Dracon', 'Clisthène', 'Lycurgue', 'Les réformes de Solon, appelées seisachtheia, supprimèrent les dettes qui asservissaient des citoyens athéniens.'],
  ['Quel royaume hellénistique avait Alexandrie pour capitale ?', 'Le royaume lagide', 'Le royaume séleucide', 'Le royaume antigonide', 'Le royaume de Pergame', 'La dynastie lagide, issue de Ptolémée, régna sur l’Égypte jusqu’à Cléopâtre VII.'],
  ['Quel chef gaulois pilla Rome vers 390 av. J.-C. selon la tradition romaine ?', 'Brennus', 'Vercingétorix', 'Ambiorix', 'Diviciacos', 'Brennus commandait les Sénons qui vainquirent les Romains à l’Allia avant d’entrer dans Rome.'],
  ['Quelle guerre civile romaine opposa Octave à Marc Antoine ?', 'La dernière guerre civile de la République', 'La guerre sociale', 'La guerre de Jugurtha', 'La guerre des Alliés', 'Le conflit culmina à Actium en 31 av. J.-C. et permit à Octave de rester seul maître de Rome.'],
  ['Quel empereur divisa l’administration romaine en tétrarchie ?', 'Dioclétien', 'Vespasien', 'Septime Sévère', 'Julien', 'Dioclétien instaura en 293 un gouvernement de deux Augustes assistés de deux Césars.'],
  ['Quel roi vandale prit Carthage en 439 ?', 'Genséric', 'Alaric', 'Théodoric', 'Odoacre', 'Genséric fit de Carthage la capitale d’un royaume vandale qui domina une partie de la Méditerranée occidentale.'],
  ['Quelle impératrice exerça le pouvoir à Constantinople avec Justinien Ier ?', 'Théodora', 'Irène', 'Pulchérie', 'Zoé', 'Théodora joua un rôle politique important, notamment pendant la sédition Nika de 532.'],
  ['Quel royaume africain adopta officiellement le christianisme sous le roi Ezana ?', 'Aksoum', 'Koush', 'Ghana', 'Kanem', 'Le royaume d’Aksoum, centré sur l’Éthiopie et l’Érythrée actuelles, se christianisa au IVe siècle.'],
  ['Quelle dynastie régna sur un âge d’or culturel chinois de 618 à 907 ?', 'Les Tang', 'Les Song', 'Les Yuan', 'Les Qing', 'La capitale Tang, Chang’an, était un vaste centre cosmopolite relié aux routes de la soie.'],
  ['Quel souverain anglo-saxon résista aux Vikings et favorisa l’instruction au IXe siècle ?', 'Alfred le Grand', 'Æthelred le Malavisé', 'Édouard le Confesseur', 'Harold Godwinson', 'Alfred, roi du Wessex, conclut un accord avec Guthrum et encouragea la traduction de textes latins.'],
  ['Quel empire ouest-africain avait Koumbi Saleh pour grand centre commercial ?', 'L’Empire du Ghana', 'L’Empire du Mali', 'L’Empire songhaï', 'L’Empire du Bornou', 'Le Ghana médiéval contrôlait une partie du commerce transsaharien de l’or et du sel.'],
  ['Quel souverain normand fit rédiger le Domesday Book en 1086 ?', 'Guillaume le Conquérant', 'Henri Ier', 'Étienne de Blois', 'Richard Ier', 'Le Domesday Book dressait un inventaire fiscal détaillé des terres anglaises.'],
  ['Quel empire andin précéda les Incas autour du lac Titicaca ?', 'Tiwanaku', 'Chimú', 'Moche', 'Nazca', 'Tiwanaku rayonna sur une grande partie des Andes centrales avant son déclin vers l’an 1000.'],
  ['Quel sultan reprit Jérusalem aux croisés en 1187 ?', 'Saladin', 'Baybars', 'Nur ad-Din', 'Mehmed II', 'Après sa victoire à Hattin, Saladin obtint la reddition de Jérusalem en octobre 1187.'],
  ['Quel roi promulgua la Bulle d’or de Hongrie en 1222 ?', 'André II', 'Béla IV', 'Étienne Ier', 'Matthias Corvin', 'La Bulle d’or limita certains pouvoirs royaux et confirma les privilèges de la noblesse hongroise.'],
  ['Quel empire d’Asie du Sud-Est construisit Angkor Wat ?', 'L’Empire khmer', 'L’Empire srivijaya', 'Le royaume de Pagan', 'Le royaume de Champa', 'Angkor Wat fut édifié au XIIe siècle sous Suryavarman II, d’abord comme temple hindou.'],
  ['Quelle bataille de 1242 stoppa l’avancée des chevaliers Teutoniques face à Novgorod ?', 'La bataille du lac Peïpous', 'La bataille de Grunwald', 'La bataille de Legnica', 'La bataille de la Neva', 'Alexandre Nevski vainquit sur la glace du lac Peïpous, épisode appelé « bataille sur la glace ».'],
  ['Quel souverain fonda la dynastie Yuan en Chine ?', 'Kubilaï Khan', 'Ögödei Khan', 'Tamerlan', 'Hongwu', 'Kubilaï, petit-fils de Gengis Khan, proclama la dynastie Yuan en 1271.'],
  ['Quelle ville était la capitale de l’Empire aztèque ?', 'Tenochtitlan', 'Teotihuacan', 'Tikal', 'Chichén Itzá', 'Tenochtitlan fut construite sur des îles du lac Texcoco, à l’emplacement de Mexico.'],
  ['Quel prince russe remporta la bataille de Koulikovo contre la Horde d’Or en 1380 ?', 'Dmitri Donskoï', 'Ivan le Terrible', 'Alexandre Nevski', 'Iaroslav le Sage', 'La victoire de Dmitri Donskoï eut une grande portée symbolique malgré le maintien du tribut à la Horde.'],
  ['Dans quel pays actuel se trouvent les ruines de pierre sèche de Grand Zimbabwe ?', 'Le Zimbabwe', 'Le Mozambique', 'La Zambie', 'Le Botswana', 'Ses murailles sont montées sans mortier ; le site a donné son nom au pays lors de l’indépendance en 1980.'],
  ['Quel explorateur portugais franchit le cap de Bonne-Espérance en 1488 ?', 'Bartolomeu Dias', 'Vasco de Gama', 'Pedro Álvares Cabral', 'Diogo Cão', 'Dias nomma d’abord le promontoire cap des Tempêtes ; le roi Jean II le renomma cap de Bonne-Espérance.'],
  ['Quelle dynastie fonda l’Empire moghol en Inde ?', 'La dynastie timouride de Babur', 'La dynastie des Gupta', 'La dynastie Chola', 'La dynastie Lodi', 'Babur vainquit le sultan de Delhi à Panipat en 1526 et établit le pouvoir moghol.'],
  ['Quel chef cosaque mena une grande révolte en Ukraine à partir de 1648 ?', 'Bohdan Khmelnytsky', 'Stenka Razine', 'Iemelian Pougatchev', 'Ivan Mazepa', 'La révolte de Khmelnytsky bouleversa la république des Deux Nations et mena à l’Hetmanat cosaque.'],
  ['Quel empereur moghol fit construire le Taj Mahal ?', 'Shah Jahan', 'Akbar', 'Aurangzeb', 'Humayun', 'Shah Jahan fit élever le mausolée à Agra pour son épouse Mumtaz Mahal, morte en 1631.'],
  ['Quel chef marathe fut couronné souverain en 1674 ?', 'Shivaji', 'Baji Rao Ier', 'Tipû Sâhib', 'Ranjît Singh', 'Shivaji fonda un État marathe qui contesta durablement la domination moghole.'],
  ['Quelle guerre nordique consacra la Russie comme grande puissance baltique ?', 'La grande guerre du Nord', 'La guerre de Livonie', 'La guerre de Scanie', 'La guerre des Duchés', 'La victoire russe sur la Suède dans la grande guerre du Nord fut entérinée par la paix de Nystad en 1721.'],
  ['Quel souverain afghan fonda l’Empire durrani en 1747 ?', 'Ahmad Shah Durrani', 'Dost Mohammed Khan', 'Mahmud de Ghazni', 'Sher Shah Suri', 'Élu par une assemblée tribale à Kandahar, Ahmad Shah étendit son empire de l’Iran oriental à l’Inde.'],
  ['Quelle révolte andine fut menée par Túpac Amaru II en 1780 ?', 'Une insurrection contre le pouvoir colonial espagnol', 'Une guerre contre l’Empire portugais', 'Une révolte contre les Incas', 'Une invasion britannique du Pérou', 'José Gabriel Condorcanqui prit le nom de Túpac Amaru II et mobilisa des dizaines de milliers d’insurgés.'],
  ['Quel royaume africain vainquit les Britanniques à Isandhlwana en 1879 ?', 'Le royaume zoulou', 'Le royaume ashanti', 'Le royaume du Dahomey', 'Le royaume sotho', 'À Isandhlwana, l’armée de Cetshwayo infligea une lourde défaite à une colonne britannique.'],
  ['Quelle restauration politique débuta au Japon en 1868 ?', 'La restauration de Meiji', 'La restauration de Kemmu', 'La réforme Taika', 'La période Taishō', 'La restauration de Meiji mit fin au shogunat Tokugawa et recentra officiellement le pouvoir sur l’empereur.'],
  ['Quel canal ouvert en 1914 relie l’Atlantique au Pacifique ?', 'Le canal de Panama', 'Le canal de Suez', 'Le canal de Kiel', 'Le canal de Corinthe', 'Les États-Unis achevèrent le canal de Panama après l’échec d’une première entreprise française.'],
  ['Quelle révolution de 1910 renversa progressivement le régime de Porfirio Díaz ?', 'La révolution mexicaine', 'La révolution cubaine', 'La révolution sandiniste', 'La révolution libérale équatorienne', 'Le conflit mexicain fit émerger des figures comme Francisco Madero, Emiliano Zapata et Pancho Villa.'],
  ['Quel mouvement coréen réclama l’indépendance face au Japon le 1er mars 1919 ?', 'Le Mouvement du 1er Mars', 'Le Mouvement du 4 Mai', 'Le Tonghak', 'Le Saemaul Undong', 'Les manifestations pacifiques furent réprimées mais renforcèrent le nationalisme coréen.'],
  ['Quel dirigeant turc abolit le sultanat en 1922 ?', 'Mustafa Kemal Atatürk', 'İsmet İnönü', 'Enver Pacha', 'Mehmed VI', 'L’assemblée d’Ankara abolit le sultanat ; la République de Turquie fut proclamée l’année suivante.'],
  ['Quelle guerre opposa la Bolivie et le Paraguay de 1932 à 1935 ?', 'La guerre du Chaco', 'La guerre du Pacifique', 'La guerre de la Triple-Alliance', 'La guerre des Mille Jours', 'Le conflit portait sur le Chaco boréal ; le Paraguay obtint la plus grande partie du territoire disputé.'],
  ['Quel empereur d’Éthiopie s’adressa à la Société des Nations après l’invasion italienne ?', 'Haïlé Sélassié', 'Ménélik II', 'Téwodros II', 'Yohannes IV', 'Haïlé Sélassié dénonça l’agression italienne devant la Société des Nations à Genève en 1936.'],
  ['Quelle opération soviétique détruisit une grande partie du groupe d’armées Centre en 1944 ?', 'L’opération Bagration', 'L’opération Uranus', 'L’opération Koutouzov', 'L’opération Tempête d’hiver', 'Lancée en juin 1944 en Biélorussie, Bagration fut l’une des plus grandes défaites allemandes de la guerre.'],
  ['Quel plan américain finança la reconstruction de l’Europe occidentale après 1947 ?', 'Le plan Marshall', 'Le plan Dawes', 'Le plan Young', 'Le plan Schuman', 'Le programme de relèvement européen proposé par George Marshall distribua une aide jusqu’en 1952.'],
  ['Quelle révolution égyptienne renversa le roi Farouk en 1952 ?', 'La révolution des Officiers libres', 'La révolution du Nil', 'La révolution verte', 'La révolution du 23 mars', 'Les Officiers libres, dont Nasser, mirent fin à la monarchie et proclamèrent ensuite la république.'],
  ['Quel soulèvement de 1956 fut écrasé par l’intervention soviétique ?', 'L’insurrection de Budapest', 'Le printemps de Prague', 'Le soulèvement de Poznań', 'La révolution de Velours', 'L’insurrection hongroise réclama des réformes et le retrait soviétique avant l’entrée des chars à Budapest.'],
  ['Quelle crise politique éclata après l’indépendance du Congo belge en 1960 ?', 'La crise congolaise', 'La crise de Bizerte', 'La crise du Katanga oriental', 'La crise d’Oka', 'Mutineries, sécessions et rivalités internationales marquèrent les premières années du Congo indépendant.'],
  ['Quel conflit de 1967 dura six jours au Proche-Orient ?', 'La guerre des Six Jours', 'La guerre du Kippour', 'La guerre d’Attrition', 'La guerre du Liban', 'Israël affronta l’Égypte, la Jordanie et la Syrie et occupa plusieurs territoires à l’issue du conflit.'],
  ['Quelle révolution renversa l’empereur Haïlé Sélassié en 1974 ?', 'La révolution éthiopienne', 'La révolution soudanaise', 'La révolution de Zanzibar', 'La révolution somalienne', 'Le Derg, comité militaire marxiste, déposa l’empereur et abolit la monarchie éthiopienne.'],
  ['Quel mouvement polonais né en 1980 fut dirigé par Lech Wałęsa ?', 'Solidarność', 'Charte 77', 'KORONA', 'Printemps 80', 'Le syndicat Solidarność naquit dans les chantiers navals de Gdańsk et joua un rôle majeur dans la transition de 1989.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const HISTOIRE_ADULTE_EDITORIAL_02: Question[] = FACTS.map(
  ([question, answer, distractor1, distractor2, distractor3, explanation], index) => {
    const options = rotate([answer, distractor1, distractor2, distractor3], index % 4);
    return {
      id: `his_adulte_editorial_02_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

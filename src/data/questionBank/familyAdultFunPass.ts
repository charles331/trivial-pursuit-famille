import { Question } from '../../types';

type Card = [string, string, string, string, string, string];

/**
 * Le lot « arts du monde » contenait de bons faits, mais demandait presque
 * toujours le terme de spécialiste. Ces cartes partent désormais d'un pays,
 * d'une forme ou d'un usage que l'on peut reconnaître. Le nom savant reste
 * dans l'explication : il devient la découverte offerte après la réponse.
 */
const WORLD_ART_CARDS: Card[] = [
  ['Avec quel matériau est construite la célèbre Grande Mosquée de Djenné, au Mali ?', 'De la terre crue', 'Du marbre blanc', 'Du bois peint', 'De la brique vernissée', 'La Grande Mosquée de Djenné est le plus célèbre exemple d’architecture en banco ; ses enduits de terre sont régulièrement renouvelés.'],
  ['Dans quel pays d’Afrique de l’Ouest vit le peuple dogon, connu pour ses villages de falaise et ses masques ?', 'Au Mali', 'Au Ghana', 'Au Sénégal', 'Au Bénin', 'Les Dogon vivent principalement au Mali ; le masque kanaga intervient notamment dans leurs cérémonies funéraires dama.'],
  ['Dans quel pays actuel furent créés les célèbres « bronzes du Bénin » qui décoraient un palais royal ?', 'Au Nigeria', 'Au Bénin actuel', 'Au Mali', 'En Éthiopie', 'Le royaume historique du Bénin avait sa capitale à Benin City, dans l’actuel Nigeria, sans lien direct avec l’État moderne du Bénin.'],
  ['Les anciennes têtes en laiton très réalistes d’Ifé ont été découvertes dans quel pays ?', 'Au Nigeria', 'Au Kenya', 'Au Maroc', 'En Afrique du Sud', 'Ifé, au Nigeria, fut un grand centre yoruba ; ses têtes des XIIe-XVe siècles représentent probablement des personnages de haut rang.'],
  ['Les masques-portraits mblo sont associés aux Baoulé de quel pays ?', 'La Côte d’Ivoire', 'Le Cameroun', 'Le Rwanda', 'La Namibie', 'Chez les Baoulé de Côte d’Ivoire, les masques mblo idéalisent une personne connue de la communauté.'],
  ['Pourquoi certaines sculptures rituelles kongo sont-elles couvertes de clous ?', 'Pour sceller des serments ou des accords', 'Pour compter les récoltes', 'Pour fixer des plumes décoratives', 'Pour indiquer leur prix', 'Ces figures, appelées nkisi nkondi, pouvaient servir à sceller un accord ou à poursuivre symboliquement un malfaiteur.'],
  ['Le kente, tissu royal aux bandes très colorées, est surtout associé à quel pays ?', 'Au Ghana', 'À l’Égypte', 'À Madagascar', 'À la Tunisie', 'Le kente est particulièrement associé aux traditions ashanti et ewe du Ghana.'],
  ['Avec quelle matière végétale les Kuba du Congo réalisent-ils leurs textiles géométriques ?', 'Du raphia', 'Du lin', 'Du coton denim', 'Du chanvre', 'Les textiles kuba associent broderie, appliqué et velours réalisé à partir de fibres de raphia.'],
  ['Que signifie approximativement le terme japonais « ukiyo-e » ?', 'Images du monde flottant', 'Peinture à l’encre noire', 'Art des fleurs coupées', 'Écriture des samouraïs', 'Les estampes ukiyo-e représentent le « monde flottant » des acteurs, courtisanes et paysages de l’époque d’Edo.'],
  ['La Grande Vague de Kanagawa appartient à une série consacrée à quelle montagne japonaise ?', 'Le mont Fuji', 'Le mont Aso', 'Le mont Koya', 'Le mont Unzen', 'Hokusai l’intégra à ses Trente-six vues du mont Fuji, publiées au début des années 1830.'],
  ['L’ancienne route du Tōkaidō, immortalisée par Hiroshige, reliait Edo à quelle ville impériale ?', 'Kyoto', 'Osaka', 'Nagasaki', 'Sapporo', 'Les Cinquante-trois Stations du Tōkaidō montrent les étapes de la route reliant Edo, l’actuelle Tokyo, à Kyoto.'],
  ['Dans l’art japonais du kintsugi, que met-on volontairement en valeur ?', 'Les fissures d’un objet réparé', 'Le grain du bois neuf', 'Les traces de pinceau', 'Les plis d’un tissu', 'Le kintsugi répare la céramique avec une laque souvent poudrée d’or : la cassure devient une partie visible de son histoire.'],
  ['Quelle dynastie chinoise a rendu célèbres les porcelaines bleues et blanches exportées dans le monde ?', 'La dynastie Ming', 'La dynastie Qin', 'La dynastie Han', 'La dynastie Zhou', 'Les fours de Jingdezhen produisirent sous les Ming de grandes quantités de porcelaines bleues et blanches.'],
  ['Quel métal donne leur bleu aux porcelaines chinoises dites « bleu et blanc » ?', 'Le cobalt', 'Le cuivre', 'Le fer', 'L’étain', 'Le cobalt conserve sa couleur lors de la cuisson à très haute température sous la couche de glaçure.'],
  ['À quelle religion est lié le grand stupa de Sanchi, en Inde ?', 'Au bouddhisme', 'À l’islam', 'Au sikhisme', 'Au judaïsme', 'Le stupa de Sanchi est un monument bouddhique agrandi sous les dynasties Maurya et Shunga.'],
  ['Les grottes peintes d’Ajanta se trouvent dans quel pays ?', 'En Inde', 'En Chine', 'Au Népal', 'Au Sri Lanka', 'Les peintures bouddhiques d’Ajanta, en Inde, illustrent notamment les vies antérieures du Bouddha.'],
  ['Quel empereur moghol, bâtisseur du Taj Mahal, fit aussi construire le Fort Rouge de Delhi ?', 'Shah Jahan', 'Akbar', 'Babur', 'Aurangzeb', 'Shah Jahan transféra sa capitale à Delhi et fit bâtir le Fort Rouge à partir de 1639.'],
  ['La miniature moghole mêle une tradition venue de Perse à l’observation de quel pays ?', 'L’Inde', 'Le Japon', 'La Russie', 'Le Mexique', 'Dans les ateliers des empereurs moghols, des artistes persans et indiens développèrent un style commun très détaillé.'],
  ['Quel immense temple cambodgien apparaît sur le drapeau national du pays ?', 'Angkor Wat', 'Borobudur', 'Bagan', 'Prambanan', 'Angkor Wat, construit au XIIe siècle, figure au centre du drapeau cambodgien.'],
  ['Sur quelle île indonésienne se trouve le grand monument bouddhique de Borobudur ?', 'Java', 'Bali', 'Sumatra', 'Bornéo', 'Borobudur forme un vaste mandala de pierre en terrasses au cœur de l’île de Java.'],
  ['Bagan, plaine couverte de milliers de temples, se trouve dans quel pays ?', 'En Birmanie', 'En Thaïlande', 'Au Laos', 'Au Vietnam', 'La plupart des temples de Bagan, en Birmanie, furent construits entre les XIe et XIIIe siècles.'],
  ['Prambanan, plus grand sanctuaire hindou d’Indonésie, honore notamment quel dieu ?', 'Shiva', 'Bouddha', 'Confucius', 'Zoroastre', 'Les principaux temples de Prambanan sont dédiés à Shiva, Vishnou et Brahma.'],
  ['Dans quel pays actuel peut-on visiter les ruines de Persépolis ?', 'En Iran', 'En Irak', 'En Turquie', 'En Jordanie', 'Persépolis fut une capitale cérémonielle de l’Empire perse achéménide.'],
  ['Le zellige, décor de petits morceaux de faïence géométriques, est typique de quelle région ?', 'Du Maghreb', 'De Scandinavie', 'Des Andes', 'De Polynésie', 'Le zellige s’est particulièrement développé dans l’architecture du Maghreb et d’al-Andalus.'],
  ['Sur quel support les Mayas fabriquaient-ils leurs livres pliés appelés codex ?', 'De l’écorce enduite de chaux', 'Du papyrus égyptien', 'Du parchemin de mouton', 'Des plaques de cuivre', 'Les codex mayas utilisaient un papier d’écorce de figuier enduit ; seuls quatre exemplaires ont survécu.'],
  ['Quelle ancienne civilisation du Mexique a sculpté de gigantesques têtes en basalte ?', 'Les Olmèques', 'Les Incas', 'Les Mayas', 'Les Aztèques', 'Les têtes colossales olmèques représentent probablement des dirigeants portant une coiffe.'],
  ['El Castillo, pyramide où une ombre semble dessiner un serpent aux équinoxes, se trouve sur quel site maya ?', 'Chichén Itzá', 'Tikal', 'Palenque', 'Copán', 'El Castillo est la pyramide de Kukulcán à Chichén Itzá, dans la péninsule du Yucatán.'],
  ['Tikal, cité de hauts temples-pyramides au cœur de la forêt, se trouve dans quel pays ?', 'Au Guatemala', 'Au Pérou', 'Au Brésil', 'À Cuba', 'Tikal fut l’un des plus puissants centres des basses terres mayas, dans l’actuel Guatemala.'],
  ['Quel peuple du Pérou a tracé dans le désert d’immenses figures visibles surtout depuis le ciel ?', 'Les Nazcas', 'Les Incas', 'Les Aztèques', 'Les Olmèques', 'Les lignes de Nazca furent créées en retirant les pierres sombres de la surface du désert.'],
  ['Chan Chan, immense ville précolombienne construite en adobe, se trouve dans quel pays ?', 'Au Pérou', 'Au Chili', 'En Colombie', 'Au Mexique', 'Chan Chan fut la capitale de la civilisation chimú sur la côte nord du Pérou.'],
  ['Dans la technique textile de l’ikat, à quel moment les fils sont-ils teints ?', 'Avant le tissage', 'Après le tissage', 'Pendant la tonte', 'Après la couture du vêtement', 'Les fils sont teints par réserve avant d’être tissés, ce qui produit les contours légèrement floutés de l’ikat.'],
  ['À quoi servaient surtout les cordelettes nouées appelées quipus chez les Incas ?', 'À enregistrer des informations', 'À jouer de la musique', 'À fabriquer des sandales', 'À mesurer la pluie', 'La position, la couleur et le type des nœuds permettaient notamment de coder des données numériques.'],
  ['Que racontent principalement les grands mâts sculptés des peuples haïdas et tlingits ?', 'Des lignages et des droits familiaux', 'La météo de l’année', 'Les règles d’un jeu', 'Les recettes du village', 'Ces mâts héraldiques montrent des emblèmes, des histoires familiales et des droits transmis.'],
  ['Quelle pierre tendre, aussi appelée pierre à savon, est souvent sculptée par les artistes inuits ?', 'La stéatite', 'Le diamant', 'Le granite', 'Le silex', 'La stéatite se taille facilement au couteau puis se polit à la main.'],
  ['Quel peuple du Sud-Ouest des États-Unis est célèbre pour ses tapis aux motifs géométriques ?', 'Les Navajos', 'Les Inuits', 'Les Maoris', 'Les Samis', 'Le tissage navajo a développé plusieurs styles régionaux après l’introduction du mouton par les Espagnols.'],
  ['Les peintures aborigènes du désert central australien évoquent souvent quels récits fondateurs ?', 'Le Temps du Rêve', 'Les Mille et Une Nuits', 'L’Iliade', 'La Table ronde', 'Ces œuvres transposent des itinéraires, des êtres ancestraux et des récits du Temps du Rêve.'],
  ['Sur quel support naturel les artistes de Terre d’Arnhem, en Australie, peignent-ils traditionnellement ?', 'De l’écorce d’eucalyptus', 'De la soie', 'Du papyrus', 'De la peau de renne', 'Les peintures sur écorce utilisent des pigments naturels et souvent de fines hachures croisées.'],
  ['Dans quelle culture le tatouage traditionnel du visage porte-t-il le nom de « tā moko » ?', 'Chez les Maoris', 'Chez les Mayas', 'Chez les Dogon', 'Chez les Samis', 'Le tā moko maori inscrit identité, statut et généalogie dans des motifs propres à chaque personne.'],
  ['Le tapa polynésien est fabriqué en battant quelle matière ?', 'De l’écorce', 'De la laine', 'Du cuir', 'Des algues', 'Le tapa est obtenu en battant l’écorce interne du mûrier à papier avant de la décorer.'],
  ['Les sculptures malagan de Nouvelle-Irlande sont créées pour quel type de cérémonie ?', 'Des cérémonies funéraires', 'Des couronnements royaux', 'Des mariages civils', 'Des compétitions sportives', 'Les sculptures ajourées malagan honorent les morts avant d’être souvent abandonnées ou détruites.'],
  ['Sur quelle île du Pacifique se dressent les grandes statues appelées moai ?', 'Rapa Nui', 'Tahiti', 'Fidji', 'Hawaï', 'Les moai de Rapa Nui furent pour la plupart taillés dans le tuf volcanique de Rano Raraku.'],
  ['Quel objet en bronze a rendu célèbre l’ancienne culture vietnamienne de Đông Sơn ?', 'Des tambours', 'Des couronnes', 'Des armures complètes', 'Des miroirs de poche', 'Les tambours de Đông Sơn portent des bateaux, des oiseaux et des scènes cérémonielles.'],
  ['Le céladon coréen de Goryeo est surtout connu pour quelle couleur ?', 'Un vert doux', 'Un rouge vif', 'Un noir profond', 'Un jaune citron', 'Les potiers de Goryeo perfectionnèrent une glaçure vert jade et des motifs incrustés blancs ou noirs.'],
];

const DIRECT_WORKS: Record<string, string> = {
  art_adulte_editorial_02_002: 'Le dôme de la cathédrale de Florence',
  art_adulte_editorial_02_003: 'Le Tempietto de San Pietro in Montorio',
  art_adulte_editorial_02_005: 'L’Altes Museum de Berlin',
  art_adulte_editorial_02_006: 'La Sagrada Família',
  art_adulte_editorial_02_007: 'L’hôtel Tassel',
  art_adulte_editorial_02_008: 'Le pavillon de la Sécession',
  art_adulte_editorial_02_009: 'La villa Savoye',
  art_adulte_editorial_02_010: 'Le Bauhaus de Dessau',
  art_adulte_editorial_02_011: 'La maison sur la cascade',
  art_adulte_editorial_02_012: 'La pyramide du Louvre',
  art_adulte_editorial_02_013: 'Le Guggenheim de Bilbao',
  art_adulte_editorial_02_014: 'Le musée juif de Berlin',
  art_adulte_editorial_02_015: 'Le Heydar Aliyev Center',
  art_adulte_editorial_02_016: 'Le Louvre Abu Dhabi',
  art_adulte_editorial_07_001: 'Cubitus',
  art_adulte_editorial_07_002: 'Les Schtroumpfs',
  art_adulte_editorial_07_003: 'Chlorophylle',
  art_adulte_editorial_07_004: 'Boule et Bill',
  art_adulte_editorial_07_005: 'Natacha',
  art_adulte_editorial_07_006: 'Michel Vaillant',
  art_adulte_editorial_07_008: 'Les affiches de Sarah Bernhardt',
  art_adulte_editorial_07_009: 'L’affiche du Chat Noir',
  art_adulte_editorial_07_014: 'Blake et Mortimer',
  art_adulte_editorial_07_016: 'Lucky Luke',
  art_adulte_editorial_07_033: 'Le palais de justice de Bruxelles',
};

const SPECIAL_CARDS: Record<string, Card> = {
  his_adulte_editorial_05_008: ['Dans quel pays d’Afrique furent découvertes les anciennes terres cuites de la culture Nok ?', 'Au Nigeria', 'Au Kenya', 'Au Ghana', 'Au Maroc', 'La culture Nok, apparue il y a plus de 2 000 ans dans l’actuel Nigeria, est célèbre pour ses sculptures en terre cuite.'],
  geo_adulte_editorial_04_016: ['Quel détroit portant le nom d’un explorateur britannique sépare les deux grandes îles de Nouvelle-Zélande ?', 'Le détroit de Cook', 'Le détroit de Magellan', 'Le détroit de Drake', 'Le détroit de Tasman', 'Le détroit de Cook sépare l’île du Nord de l’île du Sud et relie la mer de Tasman à l’océan Pacifique.'],
  art_adulte_editorial_07_018: ['Quel type de héros est Corto Maltese dans la bande dessinée d’Hugo Pratt ?', 'Un marin aventurier', 'Un cow-boy solitaire', 'Un détective privé', 'Un reporter belge', 'Corto Maltese est un marin aventurier créé par l’auteur italien Hugo Pratt dans La Ballade de la mer salée.'],
  pop_adulte_editorial_02_022: ['De quel pays venait Hugo Pratt, le créateur de Corto Maltese ?', 'D’Italie', 'De Belgique', 'De France', 'D’Espagne', 'Hugo Pratt était un auteur italien ; son marin Corto Maltese voyage dans de nombreux pays au début du XXe siècle.'],
};

function creatorCredit(name: string): string {
  if (name.startsWith('Le ')) return `du ${name.slice(3)}`;
  if (/^[AEIOUYÉÈÊËÀÂÄÎÏÔÖÙÛÜ]/i.test(name)) return `d’${name}`;
  return `de ${name}`;
}

const INVERSE_PROMPTS = [
  (name: string) => `Laquelle de ces œuvres doit-on à ${name} ?`,
  (name: string) => `Quelle création est associée à ${name} ?`,
  (name: string) => `Parmi ces œuvres, laquelle a été créée par ${name} ?`,
  (name: string) => `${name} est à l’origine de quelle œuvre ?`,
  (name: string) => `Quelle œuvre permet d’associer correctement le nom ${creatorCredit(name)} ?`,
  (name: string) => `Que trouve-t-on parmi les créations ${creatorCredit(name)} ?`,
  (name: string) => `Quel titre complète correctement l’association avec ${name} ?`,
  (name: string) => `Si l’on cite ${name}, à quelle œuvre faut-il penser ici ?`,
  (name: string) => `Quelle œuvre de cette liste porte la signature de ${name} ?`,
  (name: string) => `Quel choix correspond à une création de ${name} ?`,
  (name: string) => `Quelle œuvre relie-t-on à ${name} ?`,
  (name: string) => `Parmi ces titres, lequel appartient à l’univers ${creatorCredit(name)} ?`,
];

function quotedWork(question: Question): string | undefined {
  const match = question.question.match(/[«"]([^»"]+)[»"]/);
  return match?.[1].trim();
}

function looksLikeAttribution(question: Question): boolean {
  return /\b(a (?:écrit|réalisé|créé|composé|conçu|peint|sculpté)|auteur|autrice|artiste|architecte|compositeur|créateur|créatrice|dessinateur|écrivain|peintre|photographe|sculpteur|signé)\b/i.test(question.question);
}

function shouldInvert(question: Question): boolean {
  return Boolean(DIRECT_WORKS[question.id])
    || /^art_adulte_editorial_(?:0[2-5]|07|final)_/.test(question.id);
}

export function applyFamilyAdultFunPass(questions: Question[]): Question[] {
  const worldById = new Map(
    WORLD_ART_CARDS.map((card, index) => [
      `art_adulte_editorial_06_${String(index + 1).padStart(3, '0')}`,
      card,
    ]),
  );
  const specialById = new Map(Object.entries(SPECIAL_CARDS));

  const invertible = questions
    .filter((question) => question.categoryId === 'art' && question.difficulty === 'adulte')
    .map((question) => ({
      question,
      work: DIRECT_WORKS[question.id] ?? quotedWork(question),
    }))
    .filter(({ question, work }) => work
      && shouldInvert(question)
      && looksLikeAttribution(question)
      && !worldById.has(question.id)
      && !specialById.has(question.id));
  const workPool = [...new Set(invertible.map(({ work }) => work as string))];
  const indexById = new Map(invertible.map(({ question }, index) => [question.id, index]));

  return questions.map((question) => {
    const specialCard = specialById.get(question.id);
    if (specialCard) {
      const [prompt, answer, d1, d2, d3, explanation] = specialCard;
      return { ...question, question: prompt, options: [answer, d1, d2, d3], correctAnswerIndex: 0, explanation };
    }

    const worldCard = worldById.get(question.id);
    if (worldCard) {
      const [prompt, answer, d1, d2, d3, explanation] = worldCard;
      return { ...question, question: prompt, options: [answer, d1, d2, d3], correctAnswerIndex: 0, explanation };
    }

    const work = DIRECT_WORKS[question.id] ?? quotedWork(question);
    const index = indexById.get(question.id);
    if (!work || index === undefined) return question;

    const creator = question.options[question.correctAnswerIndex];
    const distractors: string[] = [];
    for (let step = 1; distractors.length < 3; step += 1) {
      const candidate = workPool[(index + step * 17) % workPool.length];
      if (candidate !== work && !distractors.includes(candidate)) distractors.push(candidate);
    }
    return {
      ...question,
      question: INVERSE_PROMPTS[index % INVERSE_PROMPTS.length](creator),
      options: [work, ...distractors],
      correctAnswerIndex: 0,
      explanation: `${creator} est bien associé à « ${work} ». ${question.explanation ?? ''}`,
    };
  });
}

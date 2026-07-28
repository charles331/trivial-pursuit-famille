import { Question } from '../../types';

type ElementFact = [name: string, symbol: string];

const ELEMENTS: ElementFact[] = [
  ['hydrogène', 'H'], ['hélium', 'He'], ['lithium', 'Li'], ['béryllium', 'Be'],
  ['bore', 'B'], ['carbone', 'C'], ['azote', 'N'], ['oxygène', 'O'],
  ['fluor', 'F'], ['néon', 'Ne'], ['sodium', 'Na'], ['magnésium', 'Mg'],
  ['aluminium', 'Al'], ['silicium', 'Si'], ['phosphore', 'P'], ['soufre', 'S'],
  ['chlore', 'Cl'], ['argon', 'Ar'], ['potassium', 'K'], ['calcium', 'Ca'],
  ['scandium', 'Sc'], ['titane', 'Ti'], ['vanadium', 'V'], ['chrome', 'Cr'],
  ['manganèse', 'Mn'], ['fer', 'Fe'], ['cobalt', 'Co'], ['nickel', 'Ni'],
  ['cuivre', 'Cu'], ['zinc', 'Zn'], ['gallium', 'Ga'], ['germanium', 'Ge'],
  ['arsenic', 'As'], ['sélénium', 'Se'], ['brome', 'Br'], ['krypton', 'Kr'],
  ['rubidium', 'Rb'], ['strontium', 'Sr'], ['yttrium', 'Y'], ['zirconium', 'Zr'],
  ['niobium', 'Nb'], ['molybdène', 'Mo'], ['technétium', 'Tc'], ['ruthénium', 'Ru'],
  ['rhodium', 'Rh'], ['palladium', 'Pd'], ['argent', 'Ag'], ['cadmium', 'Cd'],
  ['indium', 'In'], ['étain', 'Sn'], ['antimoine', 'Sb'], ['tellure', 'Te'],
  ['iode', 'I'], ['xénon', 'Xe'], ['césium', 'Cs'], ['baryum', 'Ba'],
  ['lanthane', 'La'], ['cérium', 'Ce'], ['praséodyme', 'Pr'], ['néodyme', 'Nd'],
  ['prométhium', 'Pm'], ['samarium', 'Sm'], ['europium', 'Eu'], ['gadolinium', 'Gd'],
  ['terbium', 'Tb'], ['dysprosium', 'Dy'], ['holmium', 'Ho'], ['erbium', 'Er'],
  ['thulium', 'Tm'], ['ytterbium', 'Yb'], ['lutécium', 'Lu'], ['hafnium', 'Hf'],
  ['tantale', 'Ta'], ['tungstène', 'W'], ['rhénium', 'Re'], ['osmium', 'Os'],
];

function rotate<T>(values: T[], offset: number): T[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

function elementWithArticle(name: string): string {
  return /^[aeiouyéh]/i.test(name) ? `de l’${name}` : `du ${name}`;
}

function elementWithDefiniteArticle(name: string): string {
  return /^[aeiouyéh]/i.test(name) ? `L’${name}` : `Le ${name}`;
}

function symbolQuestion(element: ElementFact, index: number): Question {
  const symbols = [
    element[1],
    ELEMENTS[(index + 11) % ELEMENTS.length][1],
    ELEMENTS[(index + 29) % ELEMENTS.length][1],
    ELEMENTS[(index + 47) % ELEMENTS.length][1],
  ];
  const rotation = index % 4;
  return {
    id: `sci_adulte_symbole_${index + 1}`,
    categoryId: 'sciences',
    question: `Quel est le symbole chimique ${elementWithArticle(element[0])} ?`,
    options: rotate(symbols, rotation),
    correctAnswerIndex: (4 - rotation) % 4,
    difficulty: 'adulte',
    explanation: `Dans le tableau périodique, ${elementWithDefiniteArticle(element[0]).toLowerCase()} est noté ${element[1]}.`,
  };
}

function atomicNumberQuestion(element: ElementFact, index: number): Question {
  const atomicNumber = index + 1;
  const numbers = [
    String(atomicNumber),
    String(((atomicNumber + 10) % ELEMENTS.length) + 1),
    String(((atomicNumber + 28) % ELEMENTS.length) + 1),
    String(((atomicNumber + 46) % ELEMENTS.length) + 1),
  ];
  const rotation = (index + 2) % 4;
  return {
    id: `sci_adulte_numero_atomique_${atomicNumber}`,
    categoryId: 'sciences',
    question: `Quel est le numéro atomique ${elementWithArticle(element[0])} ?`,
    options: rotate(numbers, rotation),
    correctAnswerIndex: (4 - rotation) % 4,
    difficulty: 'adulte',
    explanation: `${element[0][0].toUpperCase()}${element[0].slice(1)} occupe la place ${atomicNumber} dans le tableau périodique.`,
  };
}

const SCIENCE_SUPPLEMENT: Question[] = [
  ...ELEMENTS.map(symbolQuestion),
  ...ELEMENTS.slice(0, 75).map(atomicNumberQuestion),
];

const POP_CULTURE_SUPPLEMENT: Question[] = [
  {
    id: 'pop_adulte_complement_001',
    categoryId: 'popculture',
    question: 'Quel groupe a chanté « Dancing Queen » ?',
    options: ['ABBA', 'Queen', 'Boney M.', 'Bee Gees'],
    correctAnswerIndex: 0,
    difficulty: 'adulte',
    explanation: 'ABBA a publié « Dancing Queen » en 1976.',
  },
  {
    id: 'pop_adulte_complement_002',
    categoryId: 'popculture',
    question: 'Dans quel jeu vidéo rencontre-t-on la princesse Zelda ?',
    options: ['Final Fantasy', 'The Legend of Zelda', 'Minecraft', 'Sonic'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'La princesse Zelda donne son nom à la série de Nintendo.',
  },
  {
    id: 'pop_adulte_complement_003',
    categoryId: 'popculture',
    question: 'Quel chanteur est surnommé « The Boss » ?',
    options: ['Elton John', 'David Bowie', 'Bruce Springsteen', 'Sting'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Bruce Springsteen est surnommé « The Boss » depuis ses débuts.',
  },
  {
    id: 'pop_adulte_complement_004',
    categoryId: 'popculture',
    question: 'Quel personnage jaune vit dans un ananas sous la mer ?',
    options: ['Pikachu', 'Bart Simpson', 'Bob l’éponge', 'Titi'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'Bob l’éponge habite un ananas à Bikini Bottom.',
  },
  {
    id: 'pop_adulte_complement_005',
    categoryId: 'popculture',
    question: 'Quel groupe britannique a enregistré « Wonderwall » ?',
    options: ['Blur', 'Oasis', 'Muse', 'Coldplay'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Oasis a sorti « Wonderwall » sur l’album Morning Glory.',
  },
];

type ShortFact = [question: string, answer: string];

function compactFactQuestions(
  categoryId: 'popculture' | 'gastronomie',
  prefix: string,
  facts: ShortFact[],
): Question[] {
  return facts.map(([question, answer], index) => {
    const choices = [
      answer,
      facts[(index + 7) % facts.length][1],
      facts[(index + 13) % facts.length][1],
      facts[(index + 19) % facts.length][1],
    ];
    const uniqueChoices = [...new Set(choices)];
    for (let offset = 1; uniqueChoices.length < 4; offset += 1) {
      const candidate = facts[(index + offset) % facts.length][1];
      if (!uniqueChoices.includes(candidate)) uniqueChoices.push(candidate);
    }
    const rotation = index % 4;
    return {
      id: `${prefix}_${String(index + 1).padStart(3, '0')}`,
      categoryId,
      question,
      options: rotate(uniqueChoices, rotation),
      correctAnswerIndex: (4 - rotation) % 4,
      difficulty: 'adulte',
      explanation: `La bonne réponse est ${answer}.`,
    };
  });
}

const POP_MUSIC_FACTS: ShortFact[] = [
  ['Qui interprète « Like a Prayer » ?', 'Madonna'],
  ['Qui chante « Purple Rain » ?', 'Prince'],
  ['Qui interprète « Rolling in the Deep » ?', 'Adele'],
  ['Qui chante « Shape of You » ?', 'Ed Sheeran'],
  ['Qui interprète « Rehab » ?', 'Amy Winehouse'],
  ['Qui chante « Poker Face » ?', 'Lady Gaga'],
  ['Qui interprète « Blinding Lights » ?', 'The Weeknd'],
  ['Qui chante « Toxic » ?', 'Britney Spears'],
  ['Qui interprète « Firework » ?', 'Katy Perry'],
  ['Qui chante « Happy » ?', 'Pharrell Williams'],
  ['Qui interprète « Hips Don’t Lie » ?', 'Shakira'],
  ['Qui chante « Lose Yourself » ?', 'Eminem'],
  ['Qui interprète « Halo » ?', 'Beyoncé'],
  ['Qui chante « Chandelier » ?', 'Sia'],
  ['Qui interprète « Take on Me » ?', 'a-ha'],
  ['Qui chante « Girls Just Want to Have Fun » ?', 'Cyndi Lauper'],
  ['Qui interprète « Careless Whisper » ?', 'George Michael'],
  ['Qui chante « Nothing Compares 2 U » ?', 'Sinéad O’Connor'],
  ['Qui interprète « Fast Car » à l’origine ?', 'Tracy Chapman'],
  ['Qui chante « You’re Beautiful » ?', 'James Blunt'],
  ['Qui interprète « Whenever, Wherever » ?', 'Shakira'],
  ['Qui chante « Bad Guy » ?', 'Billie Eilish'],
  ['Qui interprète « Complicated » ?', 'Avril Lavigne'],
  ['Qui chante « Dilemma » avec Kelly Rowland ?', 'Nelly'],
  ['Qui interprète « Unwritten » ?', 'Natasha Bedingfield'],
  ['Qui chante « As It Was » ?', 'Harry Styles'],
];

const DISH_ORIGINS: ShortFact[] = [
  ['De quel pays vient la paella ?', 'Espagne'],
  ['De quel pays vient le pho ?', 'Vietnam'],
  ['De quel pays vient le ceviche ?', 'Pérou'],
  ['De quel pays vient la moussaka ?', 'Grèce'],
  ['De quel pays vient le goulasch ?', 'Hongrie'],
  ['De quel pays vient le bibimbap ?', 'Corée du Sud'],
  ['De quel pays vient la poutine ?', 'Canada'],
  ['De quel pays vient le nasi goreng ?', 'Indonésie'],
  ['De quel pays vient le pad thaï ?', 'Thaïlande'],
  ['De quel pays vient le couscous ?', 'Maghreb'],
  ['De quel pays vient le fish and chips ?', 'Royaume-Uni'],
  ['De quel pays vient la feijoada ?', 'Brésil'],
  ['De quel pays vient le dhal ?', 'Inde'],
  ['De quel pays vient le chili con carne ?', 'États-Unis'],
  ['De quel pays vient le rösti ?', 'Suisse'],
  ['De quel pays vient la bacalhau ?', 'Portugal'],
  ['De quel pays vient la soupe tom yum ?', 'Thaïlande'],
  ['De quel pays vient le kimchi ?', 'Corée du Sud'],
  ['De quel pays vient le tajine ?', 'Maroc'],
  ['De quel pays vient le Wiener Schnitzel ?', 'Autriche'],
  ['De quel pays vient le bœuf bourguignon ?', 'France'],
  ['De quel pays vient le satay ?', 'Indonésie'],
  ['De quel pays vient le haggis ?', 'Écosse'],
  ['De quel pays vient le pierogi ?', 'Pologne'],
  ['De quel pays vient l’asado ?', 'Argentine'],
  ['De quel pays vient le mole poblano ?', 'Mexique'],
  ['De quel pays vient le bobotie ?', 'Afrique du Sud'],
  ['De quel pays vient le koshari ?', 'Égypte'],
  ['De quel pays vient la salade fattouche ?', 'Liban'],
  ['De quel pays vient le smørrebrød ?', 'Danemark'],
];

const SPORTS_SUPPLEMENT: Question[] = [
  {
    id: 'sport_adulte_complement_001',
    categoryId: 'sports',
    question: 'Sur quelle surface joue-t-on Roland-Garros ?',
    options: ['Terre battue', 'Gazon', 'Moquette', 'Parquet'],
    correctAnswerIndex: 0,
    difficulty: 'adulte',
    explanation: 'Roland-Garros est le tournoi du Grand Chelem joué sur terre battue.',
  },
  {
    id: 'sport_adulte_complement_002',
    categoryId: 'sports',
    question: 'Combien de joueurs une équipe de volley aligne-t-elle sur le terrain ?',
    options: ['5', '6', '7', '8'],
    correctAnswerIndex: 1,
    difficulty: 'adulte',
    explanation: 'Une équipe de volley-ball compte six joueurs sur le terrain.',
  },
  {
    id: 'sport_adulte_complement_003',
    categoryId: 'sports',
    question: 'Dans quel sport remporte-t-on la Coupe Davis ?',
    options: ['Golf', 'Rugby', 'Tennis', 'Hockey'],
    correctAnswerIndex: 2,
    difficulty: 'adulte',
    explanation: 'La Coupe Davis est une compétition internationale masculine de tennis.',
  },
];

export const ADULT_KNOWLEDGE_SUPPLEMENT: Question[] = [
  ...SCIENCE_SUPPLEMENT,
  ...POP_CULTURE_SUPPLEMENT,
  ...compactFactQuestions('popculture', 'pop_adulte_musique', POP_MUSIC_FACTS),
  ...compactFactQuestions('gastronomie', 'gas_adulte_origine', DISH_ORIGINS),
  ...SPORTS_SUPPLEMENT,
];

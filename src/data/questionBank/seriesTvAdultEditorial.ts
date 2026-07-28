import { Question } from '../../types';

/**
 * Séries télévisées — catégorie « Cinéma & Séries ».
 *
 * La catégorie s'intitule « Cinéma & Séries » mais ne comptait que trois cartes
 * de séries sur quatre cents : les quatre-vingt-onze autres vivaient dans
 * « Pop Culture & Musique ». Un joueur qui connaissait ses séries n'en tirait
 * donc aucun bénéfice sur la case censée les couvrir. Les trente-huit séries les
 * plus largement vues sont déplacées ici, sans modification de leur contenu.
 *
 * Les séries plus confidentielles restent pour l'instant en popculture ; elles
 * relèvent du travail d'abaissement du plafond, pas de ce déplacement.
 */
type Fact = [
  question: string,
  answer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
  explanation: string,
];

const FACTS: Fact[] = [
  ["Dans quelle ville se déroule principalement la série The Wire ?", "Baltimore", "Chicago", "Philadelphie", "Boston", "Créée par David Simon, la série explore successivement plusieurs institutions de Baltimore."],
  ["Qui interprète Villanelle dans la série Killing Eve ?", "Jodie Comer", "Phoebe Waller-Bridge", "Fiona Shaw", "Sandra Oh", "Jodie Comer a reçu un Emmy Award pour son interprétation de la tueuse Villanelle."],
  ["Dans la série belge La Trêve, quel est le métier de Yoann Peeters ?", "Policier", "Journaliste", "Juge", "Médecin", "Yoann Peeters, incarné par Yoann Blanc, enquête dans une petite ville des Ardennes belges."],
  ["Quelle série met en scène l'avocate Diane Lockhart après les événements de The Good Wife ?", "The Good Fight", "Suits", "How to Get Away with Murder", "Damages", "The Good Fight reprend plusieurs personnages de The Good Wife et débute sur une fraude financière."],
  ["Quelle série se déroule dans le parc d'attractions peuplé d'androïdes de Delos ?", "Westworld", "Severance", "Black Mirror", "Devs", "Westworld adapte un film écrit et réalisé par Michael Crichton en 1973."],
  ["Quelle série d'animation satirique a été créée par Trey Parker et Matt Stone ?", "South Park", "BoJack Horseman", "Futurama", "Family Guy", "South Park est diffusée depuis 1997 et produite avec une esthétique inspirée du papier découpé."],
  ["Qui a créé la série télévisée Atlanta ?", "Donald Glover", "Ava DuVernay", "Issa Rae", "Jordan Peele", "Donald Glover est aussi l'interprète d'Earn et un musicien connu sous le nom Childish Gambino."],
  ["Quelle série suit les employés de la société Lumon soumis à une séparation de mémoire ?", "Severance", "Homecoming", "Devs", "Mr. Robot", "La procédure de dissociation sépare leurs souvenirs professionnels et privés."],
  ["Quel scénariste a créé la série The Office dans sa version britannique avec Stephen Merchant ?", "Ricky Gervais", "Graham Linehan", "Armando Iannucci", "Jesse Armstrong", "Ricky Gervais y interprète également le patron David Brent."],
  ["Dans la série The Bear, quel est le métier de Carmen Berzatto ?", "Chef cuisinier", "Musicien", "Avocat", "Médecin", "Carmy revient à Chicago reprendre la sandwicherie familiale après une carrière en haute gastronomie."],
  ["Quelle série d'espionnage met en scène les agents soviétiques Elizabeth et Philip Jennings ?", "The Americans", "Deutschland 83", "Homeland", "Slow Horses", "Les Jennings vivent sous couverture comme un couple américain près de Washington."],
  ["Quelle série française suit les agents de l'agence artistique ASK ?", "Dix pour cent", "Plan cœur", "Le Bureau des légendes", "Drôle", "La série mêle personnages fictifs et vedettes jouant leur propre rôle."],
  ["Quelle série allemande relie quatre familles de la ville fictive de Winden ?", "Dark", "1899", "Babylon Berlin", "Biohackers", "Dark construit son intrigue autour de voyages temporels et de plusieurs générations."],
  ["Quelle série norvégienne pour adolescents a connu de nombreuses adaptations internationales ?", "Skam", "Beforeigners", "Ragnarök", "Lilyhammer", "Chaque saison de Skam adopte le point de vue d'un personnage différent."],
  ["Quelle série italienne adapte les romans d'Elena Ferrante ?", "L'Amie prodigieuse", "Romanzo criminale", "Gomorra", "Suburra", "L'histoire suit l'amitié de Lenù et Lila dans un quartier populaire de Naples."],
  ["Quelle série britannique met en scène la famille criminelle Shelby ?", "Peaky Blinders", "Taboo", "Gangs of London", "Boardwalk Empire", "Peaky Blinders se déroule principalement à Birmingham après la Première Guerre mondiale."],
  ["Quelle série d'animation suit un ancien acteur de sitcom qui est un cheval anthropomorphe ?", "BoJack Horseman", "F Is for Family", "Archer", "Big Mouth", "La série utilise Hollywood pour traiter la dépression, l'addiction et la célébrité."],
  ["Quelle série suit l'agente Carrie Mathison ?", "Homeland", "The Americans", "Alias", "24 Heures chrono", "Claire Danes joue cette spécialiste de la CIA atteinte de trouble bipolaire."],
  ["Quelle série se déroule dans le cabinet Sterling Cooper ?", "Mad Men", "Suits", "Halt and Catch Fire", "The Newsroom", "Sterling Cooper est une agence publicitaire de Madison Avenue."],
  ["Dans quelle série trouve-t-on l'entreprise Waystar Royco ?", "Succession", "Billions", "Industry", "The Morning Show", "Le conglomérat médiatique appartient à la famille Roy."],
  ["Quelle série suit la famille Fisher, propriétaire d'une entreprise funéraire ?", "Six Feet Under", "Parenthood", "Brothers & Sisters", "This Is Us", "Chaque épisode commence généralement par un décès."],
  ["Quelle série anthologique a été créée par Charlie Brooker ?", "Black Mirror", "Inside No. 9", "Electric Dreams", "Room 104", "Black Mirror examine les effets sociaux de technologies souvent proches des nôtres."],
  ["Quelle série met en scène le détective Rust Cohle ?", "True Detective", "Mindhunter", "Fargo", "The Night Of", "Matthew McConaughey incarne Cohle dans la première saison."],
  ["Quelle série raconte la catastrophe nucléaire de 1986 en cinq épisodes ?", "Chernobyl", "The Days", "The Hot Zone", "Years and Years", "La mini-série a été créée par Craig Mazin."],
  ["Quelle série suit une partie d'échecs prodige nommée Beth Harmon ?", "Le Jeu de la dame", "Unorthodox", "Godless", "Alias Grace", "Anya Taylor-Joy incarne Beth dans cette mini-série."],
  ["Quelle série met en scène une dystopie nommée Gilead ?", "The Handmaid's Tale", "Years and Years", "3%", "The Man in the High Castle", "La série adapte le roman de Margaret Atwood."],
  ["Quelle série suit un enseignant de chimie devenu fabricant de méthamphétamine ?", "Breaking Bad", "Ozark", "Weeds", "Narcos", "Walter White s'associe à son ancien élève Jesse Pinkman."],
  ["Quelle série se déroule autour du restaurant Original Beef of Chicagoland ?", "The Bear", "Shameless", "Atlanta", "Reservation Dogs", "Carmy Berzatto reprend la sandwicherie familiale après la mort de son frère."],
  ["Quel créateur est à l'origine de la série The Wire ?", "David Simon", "David Chase", "Vince Gilligan", "Matthew Weiner", "La série examine Baltimore à travers police, trafic, politique, école et médias."],
  ["Quelle série de David Chase suit le mafieux Tony Soprano ?", "Les Soprano", "Ray Donovan", "Boardwalk Empire", "Oz", "Tony consulte une psychiatre tout en dirigeant une organisation criminelle du New Jersey."],
  ["Quelle série imagine la disparition soudaine de 2 % de la population mondiale ?", "The Leftovers", "Severance", "Devs", "The OA", "Les habitants de Mapleton tentent de vivre après un événement mondial sans explication."],
  ["Quelle série allemande suit l'inspecteur Gereon Rath dans le Berlin de Weimar ?", "Babylon Berlin", "Dark", "Deutschland 83", "Charité", "L'enquête policière croise conflits politiques, cabarets et crise sociale à la fin des années 1920."],
  ["Quel créateur belge a lancé la série Ennemi public ?", "Antoine Bours, Fred Castadot et Gilles de Voghel", "Jaco Van Dormael", "Thomas Gunzig", "Lukas Dhont", "La série belge suit un meurtrier libéré placé dans une abbaye des Ardennes."],
  ["Quelle série belge suit une famille qui se lance dans la culture de cannabis en Flandre occidentale ?", "Eigen Kweek", "Callboys", "De Dag", "Undercover", "La comédie mêle difficultés financières, secrets familiaux et trafic improvisé."],
  ["Quelle série suit les habitantes d’un quartier de Wisteria Lane ?", "Desperate Housewives", "Why Women Kill", "Big Little Lies", "Devious Maids", "La série créée par Marc Cherry débute par le suicide de Mary Alice Young."],
  ["Quelle série met en scène l’hacker Elliot Alderson ?", "Mr. Robot", "Devs", "Halt and Catch Fire", "Person of Interest", "Rami Malek incarne Elliot dans la série créée par Sam Esmail."],
  ["Quelle série sud-coréenne met en scène un concours mortel pour personnes endettées ?", "Squid Game", "Sweet Home", "Hellbound", "Alice in Borderland", "Squid Game oppose 456 candidats dans des versions meurtrières de jeux d’enfants."],
  ["Quelle série canadienne suit la famille Rose contrainte de vivre dans une petite ville ?", "Schitt’s Creek", "Workin’ Moms", "Kim’s Convenience", "Letterkenny", "Eugene et Dan Levy ont créé Schitt’s Creek et y jouent Johnny et David Rose."],
];

export const SERIES_TV_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `cin_adulte_series_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'cinema' as const,
      question,
      options: options.map(
        (_, position) => options[(position + options.length - rotation) % options.length],
      ),
      correctAnswerIndex: rotation,
      difficulty: 'adulte' as const,
      explanation,
    };
  },
);

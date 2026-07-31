import { Question } from '../../types';

/**
 * Quatrième passe de la série « une carte doit pouvoir se gagner », après le
 * cinéma, l'art et la pop culture. Signalée par une carte qui, elle, allait
 * très bien : « Quel explorateur français remonta le Saint-Laurent et nomma le
 * Canada ? » — Jacques Cartier, face à Dugua de Mons, Cavelier de La Salle et
 * Champlain. Un seul nom connu parmi quatre : la carte se gagne, et elle a été
 * gagnée.
 *
 * C'est exactement l'inverse du défaut. Le problème n'est pas que la réponse
 * soit un nom de personne, c'est que **personne à table ne puisse le produire
 * ni le reconnaître**. En histoire, 84 cartes adultes demandent de nommer une
 * personne — roi, empereur, explorateur, savant, dirigeant, militante — et 71
 * d'entre elles attendent un nom qui n'apparaît nulle part ailleurs dans le
 * jeu.
 *
 * 36 sont remplacées ici : Cyrus II, Brennus, Genséric, Théodora, Alfred le
 * Grand, André II de Hongrie, Kubilaï Khan, Bartolomeu Dias, Bohdan
 * Khmelnytsky, Shivaji, Ahmad Shah Durrani, Haïlé Sélassié, Enriquillo, Túpac
 * Amaru, Lázaro Cárdenas, l'empereur Yongle, Suharto, Hatchepsout, Zénobie, Wu
 * Zetian, la reine Tamar, Njinga, Emmeline Pankhurst, Tycho Brahe, Annie Jump
 * Cannon, Ashoka, Akbar, Abel Tasman, Cavelier de La Salle, David Ricardo,
 * Reginald Fessenden, Ignace Semmelweis, Habib Bourguiba, Mansa Moussa, Zheng
 * He, Tokugawa Ieyasu.
 *
 * Ce qui reste de la famille est ce qu'un foyer nomme ou reconnaît : Cléopâtre,
 * Hannibal, Clovis, Charlemagne, Gengis Khan, Colomb, Henri VIII, Louis XIV,
 * Bismarck, de Gaulle, Saladin, Guillaume le Conquérant, Élisabeth Ire,
 * Catherine II, Olympe de Gouges, Rosa Parks, Copernic, Magellan, Cartier,
 * Amundsen, Marx, Keynes, Montessori, Jenner, Atatürk, Lumumba, Albert Ier.
 *
 * Les remplaçantes déplacent la question du nom vers le fait : un événement,
 * une date-repère, une conséquence, un mot d'histoire — et surtout l'histoire
 * belge, que la catégorie couvrait moins bien que l'histoire de France. Sept
 * des cartes retirées portaient sur des femmes ; deux remplaçantes prennent le
 * relais sans exiger un patronyme inconnu, sur les suffragettes britanniques et
 * sur le droit de vote des femmes en Belgique.
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
  // ---- Histoire de Belgique ----------------------------------------------
  ['Quelle représentation d’opéra donna le signal de la révolution belge, en août 1830 ?', 'La Muette de Portici', 'Guillaume Tell', 'Les Huguenots', 'La Traviata', 'Un air appelant à mourir pour la patrie a enflammé le public du théâtre de la Monnaie, à Bruxelles.'],
  ['Combien de jours l’armée belge a-t-elle résisté à l’invasion allemande en mai 1940 ?', 'Dix-huit jours', 'Trois jours', 'Quarante jours', 'Cent jours', 'La capitulation du 28 mai a laissé le gouvernement partir à Londres et le roi rester au pays.'],
  ['Combien de régions la Belgique fédérale compte-t-elle ?', 'Trois', 'Deux', 'Quatre', 'Dix', 'Flandre, Wallonie et Bruxelles-Capitale, auxquelles s’ajoutent trois communautés linguistiques.'],
  ['En quelle année les femmes belges ont-elles obtenu le droit de vote aux élections législatives ?', 'En 1948', 'En 1919', 'En 1936', 'En 1971', 'Elles votaient déjà aux élections communales depuis 1921.'],
  ['Qu’ont fixé les lois belges de 1962 et 1963 entre le nord et le sud du pays ?', 'La frontière linguistique', 'La limite des provinces', 'Le tarif douanier intérieur', 'Le tracé du canal Albert', 'Les communes à facilités ont été créées à cette occasion, de part et d’autre du tracé.'],
  ['Quel territoire africain fut la propriété personnelle de Léopold II jusqu’en 1908 ?', 'L’État indépendant du Congo', 'Le Rwanda', 'Le Katanga', 'Le Congo-Brazzaville', 'Le Parlement belge en a repris l’administration après les révélations sur le travail forcé.'],
  ['Quelle dynastie règne sur la Belgique depuis 1831 ?', 'Les Saxe-Cobourg', 'Les Orange-Nassau', 'Les Habsbourg', 'Les Bourbons', 'Le premier roi, un prince allemand, a été choisi par le Congrès national.'],
  ['Quelle première continentale la Belgique a-t-elle réalisée entre Bruxelles et Malines en 1835 ?', 'La première ligne de chemin de fer', 'Le premier télégraphe', 'Le premier tramway électrique', 'Le premier canal à écluses', 'Trois locomotives venues d’Angleterre ont tiré les convois inauguraux.'],
  ['Quelle bibliothèque universitaire belge fut incendiée par les troupes allemandes en août 1914 ?', 'Celle de Louvain', 'Celle de Gand', 'Celle de Liège', 'Celle de Namur', 'La destruction de ses milliers de manuscrits a nourri la propagande alliée sur les atrocités allemandes.'],
  ['Que commémore la fête nationale belge du 21 juillet ?', 'Le serment du premier roi des Belges', 'La bataille des Éperons d’or', 'La libération de Bruxelles', 'La signature de la Constitution', 'Léopold Ier a prêté serment sur la Constitution en 1831, à Bruxelles.'],
  ['Quel bâtiment bruxellois abrite les deux chambres du Parlement fédéral belge ?', 'Le palais de la Nation', 'Le palais d’Egmont', 'Le palais de Justice', 'Le palais des Académies', 'Il fait face au parc de Bruxelles, en vis-à-vis du palais royal.'],

  // ---- Europe et monde : l’événement plutôt que le nom -------------------
  ['Quel drame a fait trente-neuf morts au stade du Heysel, à Bruxelles, en 1985 ?', 'L’effondrement d’un mur d’enceinte', 'Un incendie de tribune', 'Un orage sur la pelouse', 'Une panne de tourniquets', 'La finale de Coupe d’Europe a été jouée malgré tout, et les clubs anglais furent bannis cinq ans.'],
  ['Quels accords signés en 1985 ont supprimé les contrôles aux frontières intérieures européennes ?', 'Les accords de Schengen', 'Les accords d’Helsinki', 'Les accords de Yalta', 'Les accords de Locarno', 'Ils ont été signés à bord d’un bateau, sur la Moselle, au large d’un village luxembourgeois.'],
  ['Quelle alliance militaire regroupait les pays de l’Est face à l’OTAN ?', 'Le pacte de Varsovie', 'Le Comecon', 'Le Kominform', 'L’Entente balkanique', 'Créé en 1955, il a été dissous en 1991, quelques mois avant la fin de l’URSS.'],
  ['Combien de temps a duré la guerre de Cent Ans ?', 'Cent seize ans', 'Cent ans tout juste', 'Quatre-vingts ans', 'Cent quarante ans', 'De 1337 à 1453, entrecoupée de longues trêves et de plusieurs traités.'],
  ['Quel événement de 1492 acheva la reconquête chrétienne de la péninsule ibérique ?', 'La prise de Grenade', 'La bataille de Lépante', 'La chute de Tolède', 'Le sac de Séville', 'La même année, les Rois catholiques ordonnaient l’expulsion des juifs d’Espagne.'],
  ['Quelle assemblée proclama la République française en septembre 1792 ?', 'La Convention', 'Les États généraux', 'Le Directoire', 'Le Consulat', 'Elle a jugé puis condamné Louis XVI quelques mois plus tard.'],
  ['Comment appelle-t-on la déportation de millions d’Africains vers les Amériques ?', 'La traite atlantique', 'L’exode rural', 'Le grand tour', 'La diaspora antique', 'Elle s’est étendue sur près de quatre siècles avant les abolitions du XIXe siècle.'],
  ['Quelle pandémie a suivi la Première Guerre mondiale, en 1918 et 1919 ?', 'La grippe espagnole', 'Le choléra asiatique', 'La peste de Marseille', 'La fièvre jaune', 'Son nom vient de la presse espagnole, seule à en parler librement puisque le pays n’était pas en guerre.'],
  ['En combien de républiques indépendantes l’URSS s’est-elle dissoute fin 1991 ?', 'Quinze', 'Cinq', 'Neuf', 'Vingt-deux', 'La Russie a hérité du siège soviétique au Conseil de sécurité des Nations unies.'],
  ['Quel empire de six siècles a disparu à l’issue de la Première Guerre mondiale ?', 'L’Empire ottoman', 'L’Empire perse', 'L’Empire moghol', 'L’Empire byzantin', 'Son démembrement a dessiné une grande partie des frontières actuelles du Proche-Orient.'],
  ['Quelle guerre opposa la Grande-Bretagne à ses colonies d’Amérique de 1775 à 1783 ?', 'La guerre d’indépendance américaine', 'La guerre de Sept Ans', 'La guerre de 1812', 'La guerre du Canada', 'La France y est entrée aux côtés des insurgés, avec une flotte et un corps expéditionnaire.'],
  ['Quel traité de 1992 a créé l’Union européenne et préparé la monnaie unique ?', 'Le traité de Maastricht', 'Le traité de Nice', 'Le traité d’Amsterdam', 'Le traité de Lisbonne', 'Il a aussi instauré la citoyenneté européenne, qui s’ajoute à la nationalité de chacun.'],
  ['Quel événement de 1990 a mis fin à la division de l’Allemagne ?', 'La réunification allemande', 'Le pont aérien de Berlin', 'Le traité de Rapallo', 'La conférence de Potsdam', 'Les quatre puissances occupantes ont renoncé à leurs droits par un traité signé à Moscou.'],
  ['Quelle guerre suivit l’invasion du Koweït par l’Irak en 1990 ?', 'La guerre du Golfe', 'La guerre des Six Jours', 'La guerre Iran-Irak', 'La guerre du Kippour', 'Une coalition de plus de trente pays est intervenue sous mandat des Nations unies.'],

  // ---- Mots et institutions d’histoire ------------------------------------
  ['Comment appelle-t-on un régime où le souverain partage le pouvoir avec un parlement élu ?', 'Une monarchie constitutionnelle', 'Une monarchie absolue', 'Une oligarchie', 'Un despotisme éclairé', 'La Belgique en est une depuis 1831, comme le Royaume-Uni, l’Espagne ou la Suède.'],
  ['Quelle période historique s’ouvre avec la chute de l’Empire romain d’Occident ?', 'Le Moyen Âge', 'L’Antiquité tardive', 'La Renaissance', 'Les Temps modernes', 'Les historiens la font durer environ mille ans, jusqu’au XVe siècle.'],
  ['Comment appelle-t-on le texte qui fixe les règles fondamentales et les droits dans un État ?', 'La Constitution', 'Le code civil', 'Le décret-loi', 'La charte communale', 'Celle de la Belgique, adoptée en 1831, a servi de modèle à plusieurs pays européens.'],
  ['Comment appelle-t-on l’accès à l’indépendance des anciennes colonies, surtout après 1945 ?', 'La décolonisation', 'La partition', 'L’émancipation civile', 'La sécularisation', 'Une trentaine de pays africains y sont parvenus pendant la seule décennie 1960.'],
  ['Comment appelle-t-on la convention par laquelle deux armées arrêtent les combats ?', 'Un armistice', 'Un ultimatum', 'Un protectorat', 'Un plébiscite', 'Il suspend les hostilités sans régler la paix, qui demande ensuite un traité.'],
  ['Comment appelait-on les militantes britanniques du droit de vote des femmes avant 1914 ?', 'Les suffragettes', 'Les chartistes', 'Les luddites', 'Les fabiennes', 'Grèves de la faim et vitres brisées leur ont valu la prison, puis l’alimentation forcée.'],

  // ---- Repères et chiffres -----------------------------------------------
  ['Combien d’étoiles figurent sur le drapeau européen ?', 'Douze', 'Neuf', 'Quinze', 'Vingt-sept', 'Leur nombre ne dépend pas de celui des États membres : il symbolise l’unité.'],
  ['Combien d’États ont fondé la Communauté économique européenne en 1957 ?', 'Six', 'Trois', 'Neuf', 'Douze', 'La Belgique, les Pays-Bas et le Luxembourg y formaient déjà une union douanière.'],
  ['Combien d’États membres compte l’Union européenne depuis le départ du Royaume-Uni ?', 'Vingt-sept', 'Vingt-cinq', 'Vingt-huit', 'Trente', 'Le retrait britannique est devenu effectif le 31 janvier 2020.'],
  ['Quelle catastrophe maritime de 1912 fit plus de mille cinq cents morts dans l’Atlantique Nord ?', 'Le naufrage du Titanic', 'Le naufrage du Lusitania', 'Le naufrage de l’Empress of Ireland', 'Le naufrage du Wilhelm Gustloff', 'Le nombre de canots était conforme aux règles de l’époque, calculées sur le tonnage et non sur les passagers.'],
  ['Que retransmirent en direct des centaines de millions de téléviseurs en juillet 1969 ?', 'Les premiers pas sur la Lune', 'Le vol de Gagarine', 'Le lancement de Spoutnik', 'La sortie de la station Mir', 'Les images ont été relayées notamment par la station australienne de Honeysuckle Creek.'],
];

export const HISTOIRE_GRAND_PUBLIC_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `his_adulte_grand_public_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'histoire' as const,
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

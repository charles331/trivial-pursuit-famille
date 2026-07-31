import { Question } from '../../types';

/**
 * Abaissement du plafond de « Cinéma & Séries » : l’attribution d’un film à son
 * auteur.
 *
 * La catégorie posait 85 fois la question « qui a réalisé ce film ? », et la
 * réponse attendue était le plus souvent un nom qu’un foyer ne peut pas citer :
 * Fruit Chan, Amir Naderi, Otar Iosseliani, Béla Tarr, Jonas Mekas, Rainer
 * Sarnet, Cristi Puiu, Roberto Gavaldón, Jiří Menzel. Une carte que personne ne
 * peut gagner ne se joue pas, elle se subit : le lecteur énumère quatre noms
 * inconnus et la table attend la révélation.
 *
 * 60 de ces cartes sont remplacées, ainsi que 8 cartes de métiers de l’ombre
 * dont la réponse était un nom de compositeur ou de chef opérateur invisible du
 * grand public (Anton Karas, Tan Dun, Mica Levi, Vittorio Storaro, Germaine
 * Dulac, Kinuyo Tanaka).
 *
 * Ce qui reste de la famille « attribution » est ce qu’un foyer peut nommer :
 * Truffaut, Godard, Tati, Clouzot, Bergman, Almodóvar, Spielberg, del Toro,
 * Villeneuve, Dolan, Sciamma, Triet, Van Dormael, Dhont, les Dardenne.
 *
 * Les remplaçantes couvrent trois terrains volontairement grand public : les
 * séries que la catégorie promet dans son nom, la comédie et le cinéma
 * francophones — dont la Belgique — et les grands succès que tout le monde a
 * vus. Le format varie aussi : personnages, répliques, objets, chansons,
 * récompenses, plutôt qu’une nouvelle liste de quatre noms de réalisateurs.
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
  // ---- Séries : ce que le nom de la catégorie promet ----------------------
  ['Quelle série suit les survivants du vol Oceanic 815 sur une île du Pacifique ?', 'Lost', 'Manifest', 'Yellowjackets', 'The 100', 'Une trappe, une écoutille et une suite de six chiffres ont nourri les théories des spectateurs.'],
  ['Quelle série suit une équipe de police scientifique de Las Vegas ?', 'Les Experts', 'Cold Case', 'Bones', 'New York, police judiciaire', 'Deux séries dérivées ont repris le principe à Miami puis à New York.'],
  ['Quelle série d’animation suit une famille jaune de la ville de Springfield ?', 'Les Simpson', 'Les Griffin', 'American Dad', 'Futurama', 'Commencée en 1989, elle est la série animée américaine la plus longue jamais diffusée.'],
  ['Quelle série des années 1980 tourne autour du ranch Southfork et du clan Ewing ?', 'Dallas', 'Dynastie', 'Falcon Crest', 'Côte Ouest', 'Le monde entier a passé un été à se demander qui avait tiré sur J. R.'],
  ['Quelle sitcom envoie un adolescent de Philadelphie vivre chez son oncle richissime de Los Angeles ?', 'Le Prince de Bel-Air', 'Cosby Show', 'Ma famille d’abord', 'Notre belle famille', 'Will Smith y portait son propre prénom, avant de devenir une vedette du cinéma d’action.'],
  ['Quelle série médicale a révélé George Clooney dans le rôle du docteur Doug Ross ?', 'Urgences', 'Chicago Hope', 'Grey’s Anatomy', 'Docteur Quinn', 'Son pilote a été écrit par Michael Crichton, romancier et auteur de Jurassic Park.'],
  ['Quelle série suit les internes en chirurgie du Seattle Grace Hospital ?', 'Grey’s Anatomy', 'Urgences', 'Dr House', 'The Good Doctor', 'Créée par Shonda Rhimes en 2005, elle a dépassé les vingt saisons.'],
  ['Quel inspecteur en imperméable froissé roule dans une vieille Peugeot 403 décapotable ?', 'Columbo', 'Kojak', 'Maigret', 'Derrick', 'Le coupable est montré dès le début : tout l’intérêt est de voir comment il se fera coincer.'],
  ['Quelle série espagnole a fait du chant Bella ciao l’hymne de ses braqueurs ?', 'La Casa de Papel', 'Élite', 'Vis a vis', 'Alta Mar', 'Le premier braquage vise la Fabrique nationale de la monnaie, à Madrid.'],
  ['Quelle série de sauveteurs en maillot rouge a fait de Pamela Anderson une vedette mondiale ?', 'Alerte à Malibu', 'Les Dessous de Palm Beach', 'Hawaï police d’État', 'Santa Barbara', 'Diffusée dans plus de cent pays, elle a longtemps été la série la plus regardée au monde.'],
  ['Quelle série suit quatre anciens militaires en fuite, menés par Hannibal Smith ?', 'L’Agence tous risques', 'Les Têtes brûlées', 'Supercopter', 'Deux flics à Miami', 'Barracuda refusant de prendre l’avion, ses équipiers devaient l’endormir à chaque voyage.'],
  ['Quel capitaine commande le vaisseau Enterprise dans la série originale de Star Trek ?', 'James T. Kirk', 'Jean-Luc Picard', 'Benjamin Sisko', 'Kathryn Janeway', 'William Shatner tenait le rôle, face au Vulcain Spock joué par Leonard Nimoy.'],
  ['Quelle série de sketches très courts se déroule autour d’une machine à café d’entreprise ?', 'Caméra café', 'Un gars, une fille', 'Palace', 'Scènes de ménages', 'La caméra occupe la place de la machine et ne bouge jamais d’un plan à l’autre.'],
  ['Quelle série de sketches a révélé Jean Dujardin et Alexandra Lamy en couple ?', 'Un gars, une fille', 'Caméra café', 'Nos chers voisins', 'Fais pas ci, fais pas ça', 'Le format est adapté d’une série québécoise créée par Guy A. Lepage.'],
  ['Quelle série lance deux agents du FBI sur des affaires classées inexpliquées ?', 'X-Files', 'Fringe', 'Supernatural', 'Warehouse 13', 'Le duo Mulder–Scully oppose systématiquement la croyance et la méthode scientifique.'],
  ['Quelle série britannique installe le détective de Baker Street dans le Londres d’aujourd’hui ?', 'Sherlock', 'Elementary', 'Luther', 'Whitechapel', 'Chaque saison ne compte que trois épisodes, longs de quatre-vingt-dix minutes.'],
  ['Quel médecin boiteux et cynique diagnostique des cas rares dans un hôpital du New Jersey ?', 'Dr House', 'Urgences', 'The Good Doctor', 'Nip/Tuck', 'Le personnage est calqué sur Sherlock Holmes, jusqu’au numéro de son appartement.'],
  ['Quelle série suit deux frères qui préparent une évasion du pénitencier de Fox River ?', 'Prison Break', 'Oz', 'Alcatraz', 'Escape at Dannemora', 'Le héros se fait tatouer sur le torse les plans du bâtiment à percer.'],
  ['Quel héros de série se sortait de tout avec un couteau suisse et du ruban adhésif ?', 'MacGyver', 'Hannibal Smith', 'Thomas Magnum', 'Michael Knight', 'Le personnage refusait les armes à feu, ce qui obligeait les scénaristes à inventer des bricolages.'],
  ['Quelle série suit le shérif adjoint Rick Grimes après une épidémie de morts-vivants ?', 'The Walking Dead', 'Z Nation', 'Les Revenants', 'Black Summer', 'Elle adapte une bande dessinée de Robert Kirkman publiée en noir et blanc.'],
  ['Quel agent joué par Kiefer Sutherland vit chaque saison en une seule journée ?', 'Jack Bauer', 'Jason Bourne', 'Michael Westen', 'Sydney Bristow', 'Chaque épisode couvre une heure de l’intrigue, montre à l’écran comprise.'],

  // ---- Comédie et cinéma francophones, dont la Belgique -------------------
  ['Quel film de Dany Boon se déroule dans un poste de douane franco-belge en 1993 ?', 'Rien à déclarer', 'Radin !', 'Le Boulet', 'La Ch’tite Famille', 'Benoît Poelvoorde y joue un douanier belge francophobe au moment de l’ouverture des frontières.'],
  ['Quel film de Jean-Marie Poiré envoie un chevalier et son écuyer Jacquouille au XXe siècle ?', 'Les Visiteurs', 'Hibernatus', 'Papy fait de la résistance', 'L’Aile ou la Cuisse', 'Christian Clavier et Jean Reno ont repris leurs rôles dans deux suites et un remake américain.'],
  ['Dans quel film de Francis Veber un éditeur invite-t-il François Pignon pour se moquer de lui ?', 'Le Dîner de cons', 'La Chèvre', 'Les Compères', 'Le Placard', 'La pièce de théâtre, jouée pendant des années, a précédé l’adaptation au cinéma.'],
  ['Quel espion maladroit joué par Jean Dujardin parodie les films d’agents secrets des années 1960 ?', 'OSS 117', 'Le Magnifique', 'Fantômas', 'Le Gendarme à New York', 'Le personnage vient d’une série de romans de Jean Bruce, antérieure à James Bond.'],
  ['Quel film de Philippe de Chauveron confronte un couple catholique aux mariages de ses quatre filles ?', 'Qu’est-ce qu’on a fait au Bon Dieu ?', 'Le Prénom', 'La Première Étoile', 'Neuilly sa mère !', 'Son succès a donné deux suites, sorties en 2019 et en 2022.'],
  ['Quelle troupe de théâtre est à l’origine du Père Noël est une ordure et des Bronzés ?', 'Le Splendid', 'Les Nuls', 'Les Robins des Bois', 'Les Inconnus', 'Josiane Balasko, Michel Blanc, Gérard Jugnot et Thierry Lhermitte y ont débuté ensemble.'],
  ['Quelle comédie des Nuls se déroule pendant le Festival de Cannes ?', 'La Cité de la peur', 'Les Trois Frères', 'Didier', 'Le Pari', 'Alain Chabat, Chantal Lauby et Dominique Farrugia y font la promotion d’un film d’horreur.'],
  ['Quel humoriste a reçu le César du meilleur acteur pour son rôle dans Tchao Pantin ?', 'Coluche', 'Michel Blanc', 'Patrick Dewaere', 'Jacques Villeret', 'Il y joue un pompiste taciturne et alcoolique, très loin de ses personnages comiques.'],
  ['Quel film de 1980 a révélé Sophie Marceau, alors âgée de treize ans ?', 'La Boum', 'Diabolo menthe', 'L’Effrontée', 'La Petite Voleuse', 'Sa chanson Reality, interprétée par Richard Sanderson, a été un tube européen.'],
  ['Quel film d’Étienne Chatiliez met en scène un fils de vingt-huit ans qui refuse de quitter ses parents ?', 'Tanguy', 'Tatie Danielle', 'Le Bonheur est dans le pré', 'Le Cœur des hommes', 'Le prénom du personnage sert depuis à désigner un adulte resté chez ses parents.'],
  ['Quel acteur belge incarne un coureur cycliste malchanceux dans un film de Philippe Harel ?', 'Benoît Poelvoorde', 'Bouli Lanners', 'François Damiens', 'Olivier Gourmet', 'Le Vélo de Ghislain Lambert imagine un équipier resté toute sa carrière dans l’ombre de Merckx.'],
  ['Quel acteur belge piégeait des inconnus en caméra cachée sous le nom de François l’embrouille ?', 'François Damiens', 'Benoît Poelvoorde', 'Bouli Lanners', 'Jean-Luc Couchard', 'Il a ensuite tourné dans Les Émotifs anonymes et La Famille Bélier.'],
  ['Quel acteur bruxellois surnommé « les muscles de Bruxelles » est devenu une vedette du film d’action ?', 'Jean-Claude Van Damme', 'Dolph Lundgren', 'Steven Seagal', 'Chuck Norris', 'Ancien champion de karaté, il a fait du grand écart facial sa figure de style.'],
  ['Quels frères belges ont remporté deux Palmes d’or, pour Rosetta puis L’Enfant ?', 'Les frères Dardenne', 'Les frères Taviani', 'Les frères Coen', 'Les frères Larrieu', 'Ils tournent autour de Seraing et de Liège, souvent avec des comédiens débutants.'],
  ['Quel acteur belge a partagé le prix d’interprétation du Festival de Cannes avec Daniel Auteuil en 1996 ?', 'Pascal Duquenne', 'Benoît Poelvoorde', 'Olivier Gourmet', 'Jérémie Renier', 'Le Huitième Jour, de Jaco Van Dormael, lui confiait le rôle d’un homme porteur d’une trisomie 21.'],
  ['Quelle actrice belge s’est fait connaître en jouant Isabelle dans L’Auberge espagnole ?', 'Cécile de France', 'Virginie Efira', 'Marie Gillain', 'Émilie Dequenne', 'Ce rôle lui a valu le César du meilleur espoir féminin en 2003.'],
  ['Quelle actrice belge a reçu le prix d’interprétation à Cannes à dix-huit ans, pour Rosetta ?', 'Émilie Dequenne', 'Cécile de France', 'Marie Gillain', 'Virginie Efira', 'Elle a partagé la récompense avec Séverine Caneele, distinguée la même année.'],
  ['Quelle actrice bruxelloise a présenté des émissions de télévision avant de tourner Victoria et Benedetta ?', 'Virginie Efira', 'Cécile de France', 'Marie Gillain', 'Émilie Dequenne', 'Elle a animé Club RTL puis M6 avant de faire carrière dans le cinéma français.'],
  ['Quel acteur flamand joue face à Marion Cotillard dans De rouille et d’os ?', 'Matthias Schoenaerts', 'Jérémie Renier', 'Kevin Janssens', 'Jan Decleir', 'Il avait pris une vingtaine de kilos de muscle pour son rôle d’éleveur dans Rundskop.'],
  ['Quel dessin animé, César du film d’animation 2013, adapte les albums de la Belge Gabrielle Vincent ?', 'Ernest et Célestine', 'Ma vie de courgette', 'Kirikou et la Sorcière', 'Le Chat du rabbin', 'L’ours bourru et la petite souris viennent d’une série d’albums lancée en 1981.'],
  ['Quel festival bruxellois est consacré chaque printemps au cinéma fantastique ?', 'Le BIFFF', 'Le Film Fest Gent', 'Le Festival international du film francophone', 'Le Festival de Mons', 'Son public est réputé pour les cris et les répliques qu’il lance pendant les projections.'],
  ['Dans quelle ville de la Côte d’Azur Louis de Funès joue-t-il un gendarme dans six films ?', 'Saint-Tropez', 'Nice', 'Cannes', 'Antibes', 'La série de comédies s’étale de 1964 à 1982 et a beaucoup servi la réputation de la ville.'],
  ['Quel acteur français surnommé Bébel a tourné L’Homme de Rio et Le Magnifique ?', 'Jean-Paul Belmondo', 'Alain Delon', 'Lino Ventura', 'Yves Montand', 'Il exécutait lui-même ses cascades et a longtemps refusé toute doublure.'],
  ['Quel acteur français a joué Cyrano de Bergerac au cinéma en 1990 ?', 'Gérard Depardieu', 'Jean Rochefort', 'Michel Serrault', 'Philippe Noiret', 'Le rôle lui a valu le César et le prix d’interprétation à Cannes.'],

  // ---- Les grands succès que le foyer a vus -------------------------------
  ['Quel film de James Cameron de 1997 a été le premier à dépasser le milliard de dollars de recettes ?', 'Titanic', 'Jurassic Park', 'Avatar', 'Le Roi lion', 'Il a été tourné en partie dans un bassin construit au Mexique pour l’occasion.'],
  ['Quel film de 2019 conclut la saga Marvel opposant les Avengers à Thanos ?', 'Avengers: Endgame', 'Avengers: Infinity War', 'Captain Marvel', 'Black Panther', 'Il referme onze ans de films commencés en 2008 avec Iron Man.'],
  ['Dans quel film le héros devient-il champion de ping-pong puis patron d’une flotte de crevettiers ?', 'Forrest Gump', 'Seul au monde', 'Philadelphia', 'Le Terminal', 'Tom Hanks y traverse trente ans d’histoire américaine, du Vietnam à une course transcontinentale.'],
  ['Quel boxeur de fiction s’entraîne en gravissant les marches du musée d’art de Philadelphie ?', 'Rocky Balboa', 'Apollo Creed', 'Clubber Lang', 'Ivan Drago', 'Sylvester Stallone a écrit le scénario en quelques jours et exigé de tenir le rôle.'],
  ['Quel film de Luc Besson suit un tueur à gages et une fillette prénommée Mathilda ?', 'Léon', 'Nikita', 'Subway', 'Le Grand Bleu', 'Natalie Portman, âgée de douze ans, y fait ses débuts au cinéma.'],
  ['Quel film de science-fiction habille Milla Jovovich de bandes blanches dessinées par Jean-Paul Gaultier ?', 'Le Cinquième Élément', 'Valérian', 'Immortel', 'Renaissance', 'Ses décors doivent beaucoup aux dessinateurs Mœbius et Jean-Claude Mézières.'],
  ['Quelle actrice incarne l’élève du FBI Clarice Starling face à Hannibal Lecter ?', 'Jodie Foster', 'Julianne Moore', 'Sigourney Weaver', 'Michelle Pfeiffer', 'Anthony Hopkins n’apparaît à l’écran qu’un peu plus d’un quart d’heure.'],
  ['Quel film met Jack Nicholson face à l’infirmière Ratched dans un hôpital psychiatrique ?', 'Vol au-dessus d’un nid de coucou', 'Shining', 'Rain Man', 'Un homme d’exception', 'Le film de Miloš Forman a remporté les cinq principales statuettes aux Oscars de 1976.'],
  ['Quel acteur incarne le jeune Vito Corleone dans le deuxième volet du Parrain ?', 'Robert De Niro', 'Al Pacino', 'James Caan', 'John Cazale', 'Il a appris le sicilien pour ce rôle, joué presque entièrement dans cette langue.'],
  ['Quel film de 1990 suit une prostituée de Los Angeles engagée pour une semaine par un homme d’affaires ?', 'Pretty Woman', 'Working Girl', 'Coup de foudre à Notting Hill', 'Erin Brockovich', 'Julia Roberts y est devenue une vedette mondiale face à Richard Gere.'],
  ['Quel film de 1987 fait danser Baby et Johnny dans un hôtel de vacances des Catskills ?', 'Dirty Dancing', 'Grease', 'Flashdance', 'Footloose', 'La réplique « On ne laisse pas Bébé dans un coin » est devenue un classique.'],
  ['Quelle série de films policiers associe un inspecteur suicidaire à un collègue proche de la retraite ?', 'L’Arme fatale', 'L’Inspecteur Harry', 'Bad Boys', 'Le Flic de Beverly Hills', 'Mel Gibson et Danny Glover en ont tourné quatre volets entre 1987 et 1998.'],
  ['Quelle comédie fait revivre indéfiniment la même journée du 2 février à un présentateur météo ?', 'Un jour sans fin', 'Retour vers le futur', 'L’Effet papillon', 'Source Code', 'Son titre original, Groundhog Day, renvoie à la fête américaine du jour de la marmotte.'],
  ['Quel acteur se déguise en gouvernante écossaise pour rester auprès de ses enfants ?', 'Robin Williams', 'Bill Murray', 'Steve Martin', 'Danny DeVito', 'Madame Doubtfire réclamait chaque jour plusieurs heures de maquillage prothétique.'],
  ['Quel acteur d’arts martiaux est mort en 1973, peu avant la sortie d’Opération Dragon ?', 'Bruce Lee', 'Jackie Chan', 'Jet Li', 'Chuck Norris', 'Son fils Brandon est mort à son tour sur un tournage, vingt ans plus tard.'],
  ['Quelle actrice autrichienne a incarné l’impératrice Élisabeth avant de faire carrière en France ?', 'Romy Schneider', 'Maria Schell', 'Senta Berger', 'Elke Sommer', 'La trilogie des Sissi l’a rendue célèbre à seize ans et lui a longtemps collé une image sage.'],
  ['Quelle actrice voit sa robe blanche soulevée par une bouche de métro dans Sept Ans de réflexion ?', 'Marilyn Monroe', 'Jayne Mansfield', 'Kim Novak', 'Lauren Bacall', 'La scène a été retournée en studio, la foule new-yorkaise ayant rendu la prise inutilisable.'],
  ['Quel cinéaste britannique se glissait brièvement dans presque chacun de ses propres films ?', 'Alfred Hitchcock', 'David Lean', 'Carol Reed', 'Michael Powell', 'Il plaçait ces apparitions tôt dans le récit, pour que le public ne les guette pas.'],
  ['Quel acteur a reçu son premier Oscar pour The Revenant, après cinq nominations ?', 'Leonardo DiCaprio', 'Matt Damon', 'Brad Pitt', 'Johnny Depp', 'Le tournage s’est fait au froid et en lumière naturelle, ce qui a rallongé les délais.'],
  ['Quelle actrice détient le record de nominations aux Oscars d’interprétation ?', 'Meryl Streep', 'Katharine Hepburn', 'Bette Davis', 'Judi Dench', 'Elle en compte vingt et une, pour trois statuettes remportées.'],
  ['Quel film de Spielberg en noir et blanc raconte le sauvetage de juifs polonais par un industriel ?', 'La Liste de Schindler', 'Le Pianiste', 'Le Choix de Sophie', 'Jakob le menteur', 'Une fillette au manteau rouge est l’un des rares éléments colorés du film.'],
  ['Quel film de Roberto Benigni fait passer un camp de concentration pour un jeu aux yeux d’un enfant ?', 'La vie est belle', 'Le Tambour', 'Au revoir les enfants', 'Train de vie', 'Son réalisateur a escaladé les fauteuils de la salle en allant chercher son Oscar.'],
  ['Quel film suit Andy Dufresne, condamné à perpétuité dans le pénitencier de Shawshank ?', 'Les Évadés', 'La Ligne verte', 'L’Évadé d’Alcatraz', 'Papillon', 'Adapté d’un récit de Stephen King, il est resté des années premier du classement des spectateurs d’IMDb.'],
];

export const CINEMA_GRAND_PUBLIC_ADULTE: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const rotation = index % 4;
    const options = [answer, d1, d2, d3];
    return {
      id: `cin_adulte_grand_public_${String(index + 1).padStart(3, '0')}`,
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

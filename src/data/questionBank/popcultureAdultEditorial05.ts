import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel groupe a publié l’album « The Queen Is Dead » ?', 'The Smiths', 'The Cure', 'New Order', 'Echo & the Bunnymen', 'The Smiths sortirent The Queen Is Dead en 1986 avec Morrissey au chant et Johnny Marr à la guitare.'],
  ['Qui chante « Fast Car » dans sa version originale de 1988 ?', 'Tracy Chapman', 'Suzanne Vega', 'Joan Armatrading', 'Tanita Tikaram', 'Fast Car figure sur le premier album de Tracy Chapman.'],
  ['Quel groupe irlandais a enregistré « Zombie » ?', 'The Cranberries', 'U2', 'The Corrs', 'Thin Lizzy', 'Dolores O’Riordan écrivit Zombie après l’attentat de Warrington de 1993.'],
  ['Quel groupe de Seattle a publié l’album « Ten » ?', 'Pearl Jam', 'Soundgarden', 'Alice in Chains', 'Mudhoney', 'Ten, premier album de Pearl Jam, parut en 1991 et contient Alive et Jeremy.'],
  ['Quelle artiste a sorti l’album « Jagged Little Pill » ?', 'Alanis Morissette', 'Sheryl Crow', 'Fiona Apple', 'Tori Amos', 'Jagged Little Pill, publié en 1995, connut un succès mondial avec Ironic et You Oughta Know.'],
  ['Quel duo norvégien interprète « What Else Is There? » ?', 'Röyksopp', 'Kings of Convenience', 'Yello', 'Air', 'What Else Is There? figure sur The Understanding avec Karin Dreijer au chant.'],
  ['Quel groupe français a enregistré « D.A.N.C.E. » ?', 'Justice', 'Phoenix', 'Cassius', 'M83', 'D.A.N.C.E. figure sur le premier album de Justice, Cross, paru en 2007.'],
  ['Quelle chanteuse britannique a publié l’album « 21 » ?', 'Adele', 'Duffy', 'Emeli Sandé', 'Jessie Ware', '21 contient Rolling in the Deep, Someone Like You et Set Fire to the Rain.'],
  ['Quel artiste canadien a publié la mixtape « House of Balloons » ?', 'The Weeknd', 'Drake', 'Daniel Caesar', 'Kaytranada', 'House of Balloons fut mise en ligne gratuitement en 2011 avant d’intégrer la compilation Trilogy.'],
  ['Quelle artiste néo-zélandaise chante « Royals » ?', 'Lorde', 'Kimbra', 'Benee', 'Broods', 'Royals, écrite par Lorde et Joel Little, devint un succès international en 2013.'],
  ['Quel groupe australien est mené par Kevin Parker ?', 'Tame Impala', 'King Gizzard & the Lizard Wizard', 'Empire of the Sun', 'Cut Copy', 'Tame Impala est principalement le projet studio de Kevin Parker.'],
  ['Quelle chanteuse espagnole a publié l’album « El mal querer » ?', 'Rosalía', 'Aitana', 'Mala Rodríguez', 'Bebe', 'El mal querer, sorti en 2018, revisite un roman occitan médiéval dans un langage flamenco contemporain.'],
  ['Quel rappeur britannique a publié l’album « Psychodrama » ?', 'Dave', 'Stormzy', 'Skepta', 'Little Simz', 'Psychodrama reçut le Mercury Prize en 2019.'],
  ['Quelle artiste nigériane chante « Free Mind » ?', 'Tems', 'Tiwa Savage', 'Yemi Alade', 'Ayra Starr', 'Free Mind figure sur l’EP For Broken Ears de Tems, publié en 2020.'],
  ['Quel groupe belge a enregistré « Suds & Soda » ?', 'dEUS', 'Soulwax', 'Balthazar', 'Triggerfinger', 'Suds & Soda figure sur Worst Case Scenario, premier album de dEUS sorti en 1994.'],
  ['Quel créateur a signé la série « The Leftovers » avec Tom Perrotta ?', 'Damon Lindelof', 'Noah Hawley', 'Sam Esmail', 'David Simon', 'The Leftovers explore les conséquences de la disparition soudaine de 2 % de la population mondiale.'],
  ['Quel drame de HBO suit la famille dysfonctionnelle Gemstone ?', 'The Righteous Gemstones', 'The White Lotus', 'Vice Principals', 'Eastbound & Down', 'La comédie créée par Danny McBride satirise une dynastie de télévangélistes.'],
  ['Quelle série de Mike Flanagan réinvente librement le roman de Shirley Jackson ?', 'The Haunting of Hill House', 'Midnight Mass', 'The Fall of the House of Usher', 'The Midnight Club', 'La série de 2018 transforme Hill House en histoire de famille racontée sur deux époques.'],
  ['Quel créateur japonais est à l’origine de la série « Midnight Diner » adaptée en télévision ?', 'Yarō Abe', 'Naoki Urasawa', 'Taiyō Matsumoto', 'Inio Asano', 'La série télévisée adapte le manga La Cantine de minuit de Yarō Abe.'],
  ['Quelle série irlandaise adapte le roman de Sally Rooney sur Marianne et Connell ?', 'Normal People', 'Conversations with Friends', 'Bad Sisters', 'Derry Girls', 'Daisy Edgar-Jones et Paul Mescal incarnent Marianne et Connell.'],
  ['Quel feuilleton australien a lancé les carrières de Kylie Minogue et Guy Pearce ?', 'Neighbours', 'Home and Away', 'The Sullivans', 'A Country Practice', 'Kylie Minogue et Guy Pearce jouaient respectivement Charlene et Mike dans Neighbours.'],
  ['Quel jeu vidéo met en scène le chevalier solaire Solaire d’Astora ?', 'Dark Souls', 'Demon’s Souls', 'Elden Ring', 'Bloodborne', 'Solaire peut aider le joueur comme invocation et recherche sa propre lumière.'],
  ['Quel jeu de Nintendo suit Samus Aran sur la planète Zebes ?', 'Metroid', 'Star Fox', 'F-Zero', 'Kid Icarus', 'Le premier Metroid révéla à la fin que le personnage en armure était une femme.'],
  ['Dans quel jeu contrôle-t-on l’agent Solid Snake ?', 'Metal Gear Solid', 'Splinter Cell', 'Syphon Filter', 'Hitman', 'Solid Snake infiltre Shadow Moses dans Metal Gear Solid, sorti sur PlayStation en 1998.'],
  ['Quel jeu de stratégie en temps réel oppose GDI et Confrérie du Nod ?', 'Command & Conquer', 'Total Annihilation', 'Age of Empires', 'Company of Heroes', 'Le premier Command & Conquer popularisa en 1995 les cinématiques en prises de vues réelles.'],
  ['Quel jeu de rôle de Blizzard fait descendre le héros sous la cathédrale de Tristram ?', 'Diablo', 'Baldur’s Gate', 'Torchlight', 'Dungeon Siege', 'Le jeu de 1996 oppose finalement le personnage au seigneur de la Terreur.'],
  ['Quel jeu d’aventure suit Manny Calavera dans le Pays des Morts ?', 'Grim Fandango', 'Full Throttle', 'The Dig', 'Broken Sword', 'Grim Fandango combine film noir et iconographie mexicaine du Jour des morts.'],
  ['Quel jeu de Fumito Ueda demande de vaincre seize géants ?', 'Shadow of the Colossus', 'Ico', 'The Last Guardian', 'Okami', 'Wander parcourt une terre interdite pour abattre seize colosses et tenter de sauver Mono.'],
  ['Quel jeu de survie débute après le naufrage du vaisseau Aurora sur une planète océanique ?', 'Subnautica', 'Soma', 'Abzû', 'Endless Ocean', 'Subnautica se déroule sur la planète océanique 4546B, explorée en plongée par le survivant.'],
  ['Quel jeu indépendant suit un enfant tombé dans le monde des monstres ?', 'Undertale', 'Omori', 'OneShot', 'EarthBound', 'Undertale permet souvent de résoudre les combats sans tuer les adversaires.'],
  ['Quel jeu de cartes coopératif se déroule dans l’univers de Lovecraft ?', 'Horreur à Arkham : Le Jeu de Cartes', 'Marvel Champions', 'Aeon’s End', 'The Crew', 'Les joueurs construisent des decks d’investigateurs et avancent dans des campagnes narratives.'],
  ['Quel jeu de société demande de développer une cité antique en trois âges ?', '7 Wonders', 'Concordia', 'Tigris & Euphrates', 'Through the Ages', '7 Wonders de Antoine Bauza utilise un système de draft simultané de cartes.'],
  ['Quel jeu coopératif fait communiquer un fantôme sans parole avec des cartes illustrées ?', 'Mysterium', 'Dixit', 'Codenames', 'Concept', 'Dans Mysterium, un fantôme communique avec des médiums au moyen de cartes Vision.'],
  ['Quel jeu de plateau place des clans écossais sur l’île de Skye ?', 'Isle of Skye', 'Clans of Caledonia', 'Glen More', 'A Feast for Odin', 'Isle of Skye combine pose de tuiles et fixation secrète du prix des paysages.'],
  ['Quel jeu de société d’Étienne Espreman se déroule dans le Bruxelles de l’Art nouveau ?', 'Bruxelles 1893', 'Troyes', 'Ginkgopolis', 'Black Angel', 'Bruxelles 1893 mêle enchères, majorité et placement d’ouvriers autour de l’architecture.'],
  ['Quel roman graphique de Marjane Satrapi raconte son enfance en Iran ?', 'Persepolis', 'Broderies', 'Poulet aux prunes', 'L’Arabe du futur', 'Persepolis décrit la révolution iranienne, la guerre et l’exil avec un dessin noir et blanc.'],
  ['Quel personnage de comics porte le nom civil de Miles Morales ?', 'Spider-Man', 'Nova', 'Blue Beetle', 'Static', 'Miles Morales devint Spider-Man dans l’univers Ultimate en 2011.'],
  ['Quelle héroïne de comics est l’alter ego de Barbara Gordon ?', 'Batgirl', 'Supergirl', 'Huntress', 'Batwoman', 'Barbara Gordon, fille du commissaire Gordon, devient Batgirl dans les comics DC.'],
  ['Quel scénariste a créé Hellboy ?', 'Mike Mignola', 'Frank Miller', 'Todd McFarlane', 'Jeff Smith', 'Mignola fit apparaître Hellboy sous sa forme définitive en 1993.'],
  ['Quel auteur canadien a créé la série de comics « Scott Pilgrim » ?', 'Bryan Lee O’Malley', 'Jeff Lemire', 'Darwyn Cooke', 'Seth', 'Scott Pilgrim affronte les sept ex maléfiques de Ramona dans six volumes.'],
  ['Quel podcast américain raconte une enquête réelle en plusieurs épisodes autour d’Adnan Syed ?', 'Serial', 'S-Town', 'Radiolab', 'This American Life', 'La première saison de Serial, lancée en 2014, réexamina le meurtre de Hae Min Lee.'],
  ['Quel podcast français animé par Clémentine Galey recueille des récits de maternité ?', 'Bliss Stories', 'La Poudre', 'Transfert', 'Les Couilles sur la table', 'Bliss Stories donne la parole à des femmes sur grossesse, accouchement et post-partum.'],
  ['Quelle plateforme de streaming fut créée à Stockholm par Daniel Ek et Martin Lorentzon ?', 'Spotify', 'Deezer', 'SoundCloud', 'Tidal', 'Spotify fut fondée en 2006 en Suède et lancée commercialement en 2008.'],
  ['Quel site de vidéos fut fondé par Chad Hurley, Steve Chen et Jawed Karim ?', 'YouTube', 'Vimeo', 'Dailymotion', 'Veoh', 'La première vidéo de YouTube, Me at the zoo, fut mise en ligne en avril 2005.'],
  ['Quel forum communautaire organise ses discussions en « subreddits » ?', 'Reddit', 'Discord', 'Tumblr', 'Quora', 'Reddit fut fondé en 2005 et répartit ses communautés thématiques en subreddits.'],
  ['Quel service de messagerie a popularisé les serveurs communautaires vocaux pour joueurs ?', 'Discord', 'Slack', 'Telegram', 'Teamspeak', 'Discord fut lancé en 2015 avec salons textuels et vocaux organisés en serveurs.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const POPCULTURE_ADULTE_EDITORIAL_05: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `pop_adulte_editorial_05_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'popculture',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

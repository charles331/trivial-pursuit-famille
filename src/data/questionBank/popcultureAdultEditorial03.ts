import { Question } from '../../types';
type Q = [string,[string,string,string,string],number,string];
const D: Q[] = [
["Quel groupe belge a publié l'album The Ideal Crash ?",["dEUS","K's Choice","Ghinzu","Balthazar"],0,"The Ideal Crash est le troisième album de dEUS, sorti en 1999."],
["Qui interprète Fleabag ?",["Phoebe Waller-Bridge","Olivia Colman","Sharon Horgan","Aisling Bea"],0,"Waller-Bridge a aussi créé et scénarisé la série."],
["Quel jeu se déroule dans le royaume de Hyrule ?",["The Legend of Zelda","Final Fantasy","Dragon Quest","Fire Emblem"],0,"Hyrule est souvent menacé par Ganon et défendu par Link."],
["Quel auteur a créé Le Petit Nicolas avec Sempé ?",["René Goscinny","Jean-Michel Charlier","Pierre Christin","Greg"],0,"Goscinny écrivait les récits illustrés par Jean-Jacques Sempé."],
["Qui chante « Hyperballad » ?",["Björk","PJ Harvey","Tori Amos","Goldfrapp"],0,"Le titre figure sur Post, deuxième album solo de Björk."],
["Quel studio a créé Minecraft ?",["Mojang","Valve","Epic Games","Rockstar Games"],0,"Markus Persson lança le projet avant la création du studio suédois Mojang."],
["Quel héros de BD voyage avec le capitaine Haddock ?",["Tintin","Spirou","Alix","Ric Hochet"],0,"Haddock apparaît pour la première fois dans Le Crabe aux pinces d'or."],
["Quel groupe interprète « Teardrop » ?",["Massive Attack","Portishead","Morcheeba","UNKLE"],0,"Elizabeth Fraser des Cocteau Twins chante sur ce morceau."],
["Quel jeu met en scène l'androïde 2B ?",["NieR: Automata","Bayonetta","Control","Remember Me"],0,"2B combat des machines sur une Terre abandonnée par l'humanité."],
["Qui a enregistré « Superstition » ?",["Stevie Wonder","Marvin Gaye","Curtis Mayfield","Isaac Hayes"],0,"Stevie Wonder joue notamment le clavinet emblématique du morceau."],
["Quelle série met en scène l'enquêtrice Sarah Lund ?",["Forbrydelsen","Borgen","The Bridge","Trapped"],0,"Son pull en laine est devenu un élément emblématique de la série danoise."],
["Quel jeu permet d'explorer Night City ?",["Cyberpunk 2077","Watch Dogs","Deus Ex","The Outer Worlds"],0,"Night City vient de l'univers de jeu de rôle créé par Mike Pondsmith."],
["Quel personnage de BD est accompagné du chien Rantanplan ?",["Lucky Luke","Blueberry","Chick Bill","Jerry Spring"],0,"Rantanplan est un chien de prison réputé peu intelligent."],
["Quel duo a enregistré « Roads » ?",["Portishead","Everything but the Girl","Moloko","Lamb"],0,"Beth Gibbons chante ce titre de l'album Dummy."],
["Quel jeu demande de survivre dans la ville de Raccoon City ?",["Resident Evil","Silent Hill","Dead Space","The Evil Within"],0,"Umbrella y provoque une catastrophe biologique liée au virus T."],
["Quel groupe chante « Enjoy the Silence » ?",["Depeche Mode","New Order","The Cure","Pet Shop Boys"],0,"Le titre figure sur Violator, paru en 1990."],
["Quel jeu de Valve oppose l'équipe aux infectés lors d'une apocalypse ?",["Left 4 Dead","Team Fortress 2","Half-Life","Counter-Strike"],0,"La coopération à quatre est au cœur de Left 4 Dead."],
["Quel auteur belge a créé Alix ?",["Jacques Martin","Hergé","Edgar P. Jacobs","Jean Graton"],0,"Alix vit des aventures dans l'Antiquité romaine."],
["Qui interprète « Both Sides, Now » ?",["Joni Mitchell","Carole King","Joan Baez","Laura Nyro"],0,"Mitchell réenregistra la chanson dans une version orchestrale en 2000."],
["Quel jeu de stratégie se déroule dans l'univers de Warhammer 40,000 ?",["Dawn of War","StarCraft","Company of Heroes","Homeworld"],0,"Relic Entertainment a développé le premier Dawn of War."],
["Quel héros de manga veut devenir roi des pirates ?",["Monkey D. Luffy","Naruto Uzumaki","Ichigo Kurosaki","Son Goku"],0,"Luffy est le capitaine de l'équipage du Chapeau de paille."],
["Quel groupe a enregistré « Once in a Lifetime » ?",["Talking Heads","R.E.M.","Television","Blondie"],0,"Le morceau figure sur Remain in Light, produit avec Brian Eno."],
["Quel jeu suit Aloy dans un monde peuplé de machines ?",["Horizon Zero Dawn","Forspoken","Kena","Control"],0,"Aloy cherche l'origine des machines et sa propre naissance."],
["Qui chante « Glory Box » ?",["Portishead","Massive Attack","Garbage","Sneaker Pimps"],0,"Le morceau échantillonne « Ike's Rap II » d'Isaac Hayes."],
["Quel jeu met en scène le commandant Shepard ?",["Mass Effect","Halo","Destiny","Starfield"],0,"Le joueur peut importer ses choix d'un épisode de la trilogie au suivant."],
["Quel personnage de BD est journaliste au Petit Vingtième ?",["Tintin","Spirou","Fantasio","Marc Dacier"],0,"Les premières aventures de Tintin parurent dans ce supplément pour la jeunesse."],
["Quel groupe interprète « Where Is My Mind? » ?",["Pixies","Sonic Youth","Pavement","Dinosaur Jr."],0,"Le morceau clôt de façon mémorable le film Fight Club."],
["Quel jeu d'aventure suit Max Caulfield à Arcadia Bay ?",["Life Is Strange","Gone Home","Oxenfree","Tell Me Why"],0,"Max peut remonter le temps et modifier ses décisions."],
["Qui a enregistré l'album Homogenic ?",["Björk","Fiona Apple","PJ Harvey","Tori Amos"],0,"Björk y associe cordes islandaises et rythmes électroniques."],
["Quel jeu permet d'incarner Geralt de Riv ?",["The Witcher","Dragon Age","Elden Ring","Skyrim"],0,"Geralt est un sorceleur créé par l'écrivain Andrzej Sapkowski."],
["Quel héros de BD conduit une Ford T jaune et noire ?",["Gaston Lagaffe","Spirou","Michel Vaillant","Natacha"],0,"La vieille voiture de Gaston produit souvent fumée et pannes."],
["Quel groupe belge est formé autour de Tom Barman ?",["dEUS","Triggerfinger","Balthazar","Girls in Hawaii"],0,"Tom Barman est chanteur, guitariste et principal auteur de dEUS."],
["Quel jeu de rythme utilise des guitares en plastique ?",["Guitar Hero","Just Dance","Beat Saber","Rocksmith"],0,"Les notes défilent à l'écran et correspondent aux boutons de la guitare."],
["Quel dessinateur belge a créé Boule et Bill ?",["Jean Roba","Franquin","Peyo","Morris"],0,"Bill est le cocker de Boule dans cette série familiale."],
["Qui interprète « Killing Me Softly » avec les Fugees ?",["Lauryn Hill","Erykah Badu","Mary J. Blige","Alicia Keys"],0,"La reprise des Fugees paraît sur The Score en 1996."],
];
export const POPCULTURE_ADULT_EDITORIAL_03: Question[]=D.map(([question,options,,explanation],i)=>{
  const shift=i%4;
  return {id:`pop_adulte_editorial_03_${String(i+1).padStart(3,'0')}`,categoryId:'popculture',question,options:options.map((_,j)=>options[(j+shift)%4]),correctAnswerIndex:(4-shift)%4,difficulty:'adulte',explanation};
});

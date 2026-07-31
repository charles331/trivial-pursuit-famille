import { Question } from '../../types';
type Q = [string,[string,string,string,string],number,string];
const D: Q[] = [
["Qui a réalisé Les 400 Coups ?",["François Truffaut","Jean-Luc Godard","Claude Chabrol","Éric Rohmer"],0,"Jean-Pierre Léaud y incarne pour la première fois Antoine Doinel."],
["Quel film ouvre la trilogie du Parrain ?",["Le Parrain","Le Parrain 2","Les Affranchis","Il était une fois en Amérique"],0,"Francis Ford Coppola adapte le roman de Mario Puzo en 1972."],
["Qui incarne Ripley dans Alien ?",["Sigourney Weaver","Linda Hamilton","Jamie Lee Curtis","Geena Davis"],0,"Ripley est devenue une figure majeure de l'héroïne de science-fiction."],
["Quel cinéaste a réalisé PlayTime ?",["Jacques Tati","Pierre Étaix","Louis Malle","Jean Becker"],0,"Tati fit construire un vaste décor urbain surnommé Tativille."],
["Quel film de Scorsese suit le boxeur Jake LaMotta ?",["Raging Bull","Mean Streets","Casino","La Valse des pantins"],0,"Robert De Niro transforma fortement son corps pour interpréter LaMotta."],
["Quel film de Billy Wilder met en scène deux musiciens déguisés en femmes ?",["Certains l'aiment chaud","La Garçonnière","Sept Ans de réflexion","Irma la Douce"],0,"Tony Curtis et Jack Lemmon fuient des gangsters dans cette comédie."],
["Quel cinéaste a signé Le Mépris ?",["Jean-Luc Godard","François Truffaut","Agnès Varda","Alain Resnais"],0,"Brigitte Bardot et Michel Piccoli forment le couple central du film."],
["Dans quel film trouve-t-on l'ordinateur HAL 9000 ?",["2001 : l'Odyssée de l'espace","Solaris","Silent Running","Colossus"],0,"HAL contrôle le vaisseau Discovery dans le film de Kubrick."],
["Qui joue Daniel Plainview dans There Will Be Blood ?",["Daniel Day-Lewis","Joaquin Phoenix","Christian Bale","Sean Penn"],0,"Ce rôle de prospecteur pétrolier valut un deuxième Oscar à Day-Lewis."],
["Quel film de Jacques Becker raconte une tentative d'évasion de prison ?",["Le Trou","Casque d'Or","Touchez pas au grisbi","Falbalas"],0,"Le film adapte le récit de José Giovanni et emploie plusieurs non-professionnels."],
["Qui incarne Jackie Brown chez Quentin Tarantino ?",["Pam Grier","Angela Bassett","Regina King","Viola Davis"],0,"Tarantino adapte le roman Rum Punch d'Elmore Leonard."],
["Quel film de David Lean adapte Boris Pasternak ?",["Le Docteur Jivago","Brève Rencontre","La Route des Indes","Oliver Twist"],0,"Omar Sharif incarne le médecin et poète Youri Jivago."],
["Quel film de Jean-Pierre Melville réunit Delon, Bourvil et Montand ?",["Le Cercle rouge","Le Samouraï","Un flic","L'Armée des ombres"],0,"Le Cercle rouge est construit autour d'un long cambriolage presque muet."],
["Qui a réalisé Anatomie d'une chute ?",["Justine Triet","Céline Sciamma","Alice Winocour","Rebecca Zlotowski"],0,"Le film a remporté la Palme d'or 2023 puis l'Oscar du scénario original."],
["Quel film de John Carpenter se déroule dans une base antarctique ?",["The Thing","Fog","Invasion Los Angeles","Prince des ténèbres"],0,"La créature de The Thing peut imiter parfaitement les organismes."],
["Quel film d'Elia Kazan met en scène Terry Malloy ?",["Sur les quais","À l'est d'Éden","Un tramway nommé Désir","America America"],0,"Marlon Brando incarne cet ancien boxeur devenu docker."],
["Qui joue Antoine dans La Maman et la Putain ?",["Jean-Pierre Léaud","Jean Yanne","Michel Piccoli","Patrick Dewaere"],0,"Le film de Jean Eustache dure plus de trois heures et repose sur de longs dialogues."],
["Quel film de Wim Wenders suit un ange nommé Damiel ?",["Les Ailes du désir","Paris, Texas","L'Ami américain","Alice dans les villes"],0,"Bruno Ganz incarne cet ange observant les habitants de Berlin."],
["Quel film de Pedro Almodóvar met en scène Raimunda ?",["Volver","Parle avec elle","Talons aiguilles","Femmes au bord de la crise de nerfs"],0,"Penélope Cruz incarne Raimunda dans cette histoire de secrets familiaux."],
["Qui interprète Lydia Tár ?",["Cate Blanchett","Tilda Swinton","Olivia Colman","Julianne Moore"],0,"Le personnage fictif est une cheffe d'orchestre au sommet de sa carrière."],
  ["Quelle actrice française a reçu deux fois le prix d'interprétation à Cannes, en 1978 et 2001 ?", ["Isabelle Huppert", "Catherine Deneuve", "Juliette Binoche", "Emmanuelle Riva"], 0, "Elle détient aussi le record de nominations aux César, avec plus de vingt citations."],
["Quel film de Fritz Lang met en scène un réseau criminel dirigé par Mabuse ?",["Le Testament du docteur Mabuse","M le Maudit","Les Espions","La Femme sur la Lune"],0,"Le film fut interdit en Allemagne peu après l'arrivée des nazis au pouvoir."],
["Quel cinéaste a réalisé Le Guépard ?",["Luchino Visconti","Vittorio De Sica","Roberto Rossellini","Michelangelo Antonioni"],0,"Burt Lancaster incarne le prince Salina pendant le Risorgimento."],
["Qui joue l'institutrice dans The Lost Daughter ?",["Olivia Colman","Jessie Buckley","Dakota Johnson","Maggie Gyllenhaal"],0,"Colman incarne Leda adulte; Jessie Buckley joue le personnage jeune."],
["Quel film de Sembène critique une bourgeoisie corrompue par l'impuissance de son héros ?",["Xala","Ceddo","Moolaadé","Camp de Thiaroye"],0,"Le mot wolof xala désigne la malédiction frappant le personnage."],
["Quel film d'animation utilise des silhouettes découpées de Lotte Reiniger ?",["Les Aventures du prince Ahmed","Le Roman de Renard","La Bergère et le Ramoneur","Fantasmagorie"],0,"Sorti en 1926, il compte parmi les plus anciens longs métrages animés conservés."],
["Quel film de Kathryn Bigelow suit une équipe de déminage en Irak ?",["Démineurs","Zero Dark Thirty","Detroit","K-19"],0,"Bigelow fut la première femme récompensée par l'Oscar de la réalisation."],
["Qui joue la gouvernante dans Les Innocents de Jack Clayton ?",["Deborah Kerr","Julie Harris","Simone Signoret","Ingrid Bergman"],0,"Le film adapte Le Tour d'écrou de Henry James."],
["Quel réalisateur a signé Le Salaire de la peur ?",["Henri-Georges Clouzot","Julien Duvivier","Jean Grémillon","Marcel Carné"],0,"Des chauffeurs transportent de la nitroglycérine sur des routes dangereuses."],
["Quel film de Todd Haynes suit une jeune vendeuse et une cliente aisée dans le New York des années 1950 ?",["Carol","Loin du paradis","May December","Velvet Goldmine"],0,"Cate Blanchett et Rooney Mara adaptent les personnages de Patricia Highsmith."],
["Quel film de Ryūsuke Hamaguchi adapte librement Oncle Vania ?",["Drive My Car","Contes du hasard","Senses","Asako I & II"],0,"Les répétitions de Tchekhov structurent le deuil du metteur en scène Kafuku."],
["Quel film de Claire Denis se déroule dans la Légion étrangère à Djibouti ?",["Beau Travail","White Material","35 Rhums","Trouble Every Day"],0,"Le récit s'inspire librement de Billy Budd de Herman Melville."],
["Qui joue la mère dans Tout sur ma mère ?",["Cecilia Roth","Marisa Paredes","Victoria Abril","Carmen Maura"],0,"Cecilia Roth incarne Manuela, partie à Barcelone après la mort de son fils."],
["Quel film de Satoshi Kon brouille l'identité d'une chanteuse devenue actrice ?",["Perfect Blue","Paprika","Millennium Actress","Tokyo Godfathers"],0,"Perfect Blue explore la célébrité, le regard des fans et la perte de repères."],
["Quel cinéaste belge a réalisé Toto le héros ?",["Jaco Van Dormael","Bouli Lanners","Joachim Lafosse","Fabrice Du Welz"],0,"Le film reçut la Caméra d'or au Festival de Cannes 1991."],
["Quel film de Céline Sciamma suit deux fillettes liées par un étrange passage temporel ?",["Petite Maman","Tomboy","Bande de filles","Naissance des pieuvres"],0,"Nelly rencontre Marion enfant dans le bois derrière la maison familiale."],
];
export const CINEMA_ADULT_EDITORIAL_03: Question[]=D.map(([question,options,,explanation],i)=>{
  const shift=i%4;
  return {id:`cin_adulte_editorial_03_${String(i+1).padStart(3,'0')}`,categoryId:'cinema',question,options:options.map((_,j)=>options[(j+shift)%4]),correctAnswerIndex:(4-shift)%4,difficulty:'adulte',explanation};
});

# Analyse du niveau de difficulté des trois banques de questions

Date : juillet 2026 — corpus analysé : 5 360 cartes
(8 catégories × 135 enfant + 135 ado + 400 adulte).

Référence visée : **Trivial Pursuit Famille**, c'est-à-dire de la culture
générale grand public où un adulte informé répond correctement à peu près
une fois sur deux, où l'on apprend quelque chose en perdant, et où un ado
peut battre ses parents sur une carte de temps en temps.

Toutes les mesures citées sont reproductibles :

```bash
npm run analyze:difficulty   # diagnostic, ne fait jamais échouer la commande
npm run audit:questions      # contrôles bloquants existants
```

---

## 1. Ce qui va bien

- **Le volume et la structure sont sains.** 5 360 cartes, aucun identifiant
  dupliqué, 4 options partout, 100 % des cartes ont une explication
  « Le saviez-vous ? ». L'audit passe.
- **Le niveau enfant est le mieux réussi des trois.** 10,8 mots par question
  en moyenne, 23 mots au maximum, réponses concrètes et visuelles, distracteurs
  jamais méchants. Les explications apprennent réellement quelque chose
  (« la science qui étudie les blasons s'appelle l'héraldique »,
  « les Vikings ont donné leur nom à la Normandie »).
- **L'ancrage belge est déjà présent aux niveaux enfant et ado** : spéculoos,
  moules-frites, la Saint-Nicolas, le drapeau belge, Bruges et Gand, le signal
  de Botrange, Boule et Bill, les Schtroumpfs, les Tuniques bleues.
- **La catégorie « sports » adulte est la mieux calibrée de tout le corpus** :
  seulement 15 % de réponses inconnues du foyer, et beaucoup de cartes de règles
  où l'on apprend franchement quelque chose (le hors-jeu, le DRS, le cut au
  golf, le cécifoot).

Le problème n'est donc pas la quantité ni la propreté du corpus. C'est la
**calibration** : le plafond adulte est trop haut, la marche ado est absente
par endroits, et le curseur culture francophone / culture mondiale est inversé
par rapport à ce qui est voulu.

---

## 2. Le niveau ado : un trou dans l'escalier (priorité 1)

C'est le problème le plus grave, et il est structurel, pas éditorial.

| Catégorie   | Cartes ado clonées du niveau enfant | Cartes ado réelles |
|-------------|------------------------------------:|-------------------:|
| sciences    | **135 / 135**                       | **0**              |
| popculture  | 65 / 135                            | 70                 |
| gastronomie | 27 / 135                            | 108                |
| autres (5)  | 0                                   | 135                |
| **Total**   | **227 / 1 080 (21 %)**              |                    |

En sciences, **un ado reçoit exactement la banque enfant**, mot pour mot :
« Quel astre tourne autour de la Terre ? », « Quel insecte fabrique du miel ? »,
« Quel animal vit dans une coquille en spirale ? ». Ce n'est pas un hasard :
`completeTeenQuestionBank` (`src/data/adultExpansion.ts:135`) complète la
banque ado en recopiant des cartes enfant via `classicTeenVersion`, qui ne
change que l'identifiant et le champ `difficulty`.

Conséquence côté joueur, en sciences : l'ado s'ennuie sur des questions de
6 ans, puis franchit d'un coup un mur vers le niveau adulte, où l'attendent
l'énarthrose, les thylakoïdes et le symbole chimique du thulium. Il n'y a
littéralement aucune marche entre les deux.

L'audit ne détecte pas ce cas : il interdit la promotion enfant → adulte
(`Question enfant promue au niveau adulte`) mais pas enfant → ado.

**Proposition 1.** Supprimer `completeTeenQuestionBank` et son remplissage
automatique, ajouter au `audit-questions.ts` un contrôle bloquant
« carte ado identique à une carte enfant », et rédiger les 227 cartes ado
manquantes — dont les 135 de sciences, qui sont à écrire intégralement.

Repère utile pour viser juste : les catégories saines ont un niveau ado à
15,4 mots par question en histoire et 12,9 en géographie, contre 13,1 et 12,0
au niveau enfant. Le niveau ado réussi n'est pas « plus long », il est
**plus daté et plus situé** : le canal de Suez en 1869, la ligne Maginot,
Charles Quint né à Gand, le lac Titicaca, Florence Nightingale. C'est
exactement le bon ton — à reproduire en sciences (le corps humain, le système
solaire, les états de la matière, l'électricité, le climat, l'évolution).

---

## 3. Le niveau adulte : trop haut, et haut de la mauvaise manière

### 3.1 Mesure d'ensemble

Indicateur : part des bonnes réponses adultes dont **aucun mot ne figure
nulle part aux niveaux enfant ou ado** — donc dont le sujet n'existe pas
ailleurs dans l'univers du jeu. « Hapax » = ce mot n'apparaît qu'une seule
fois dans les 5 360 cartes : le fait est isolé, non réutilisable, oublié
aussitôt.

| Catégorie   | Réponse inconnue du foyer | dont hapax | Verdict |
|-------------|--------------------------:|-----------:|---------|
| sports      | 15 %                      | 5 %        | bien calibré |
| histoire    | 24 %                      | 13 %       | un cran trop haut |
| geographie  | 28 %                      | 7 %        | correct, quelques pointes |
| sciences    | 32 %                      | 9 %        | déséquilibré (voir 3.2) |
| art         | 36 %                      | 8 %        | trop expert |
| gastronomie | 39 %                      | 10 %       | trop tourné vers le monde |
| cinema      | 41 %                      | 13 %       | trop cinéphile |
| popculture  | 50 %                      | 15 %       | le plus hors cible |

Cible raisonnable pour du Trivial Famille : **≤ 20 %**. Aujourd'hui la moyenne
est à 33 %, et une carte adulte sur huit porte sur un fait qui n'apparaît
qu'une seule fois dans tout le jeu.

Attention : la difficulté n'est pas répartie régulièrement, elle est
**bimodale**. À côté des cartes expertes on trouve « Qui fut le premier
président des États-Unis ? », « Quel général mena la France libre depuis
Londres ? », « Quel film ouvre la trilogie du Parrain ? ». Le joueur alterne
donc entre cadeaux et impasses, ce qui est plus frustrant qu'une difficulté
moyenne homogène.

### 3.2 sciences : 38 % de la catégorie est un exercice de tableau périodique

C'est le point le plus spectaculaire du diagnostic.

- **154 cartes sur 400** relèvent du tableau périodique : 76 « Quel est le
  symbole chimique de X ? », 75 « Quel est le numéro atomique de X ? » et
  3 « Quel élément chimique porte le numéro atomique X ? ».
- **96 d'entre elles portent sur un élément hors des ~35 éléments
  couramment rencontrés** : thulium,
  praséodyme, prométhium, holmium, dysprosium, lutécium, ytterbium,
  gadolinium, terbium, erbium, europium, samarium, ruthénium, hafnium…
- **77 cartes de sciences ont quatre nombres nus pour options.** Exemple :
  « Quel est le numéro atomique du thulium ? » → 69 / 40 / 4 / 22. Il n'y a
  rien à raisonner, rien à retenir, rien à apprendre : c'est un tirage au sort
  à 25 %.

Ces cartes ne remplissent aucun des deux objectifs (ni agréable, ni utile) et
elles occupent plus d'un tiers de la catégorie.

**Proposition 2.** Réduire le tableau périodique à une douzaine de cartes sur
des éléments que tout le monde a croisés (H, C, N, O, Na, Cl, Fe, Cu, Ag, Au,
Pb, Ca), et réaffecter les ~140 cartes libérées à des sujets grand public où
l'on apprend vraiment quelque chose : le corps humain, la météo, l'énergie et
l'électricité du quotidien, l'espace, l'écologie et le climat, la chimie de la
cuisine, les grandes inventions, les grands noms (Pasteur, Curie, Darwin,
Einstein, Fleming). Le reste de la catégorie montre d'ailleurs déjà le bon
ton : le cumulonimbus, l'effet Doppler, la poussée d'Archimède, la rotation
synchrone de la Lune, la datation au carbone 14.

### 3.3 art : une catégorie fourre-tout, tirée vers le conservateur de musée

Sur 400 cartes : 52 sur la musique classique et l'opéra, 50 sur la
littérature, 37 sur les arts non occidentaux, 26 sur le design, la typographie
et la mode, une trentaine sur l'architecture, le reste sur la peinture et la
sculpture. C'est la catégorie la plus dispersée du jeu, et la plus dure.

Exemples caractéristiques, tous authentiquement pointus : « Le Mandarin
merveilleux » de Bartók, le vase Savoy d'Alvar Aalto, Univers et Frutiger
d'Adrian Frutiger, la granulation en joaillerie, le Gattamelata de Donatello,
« Revelations » d'Alvin Ailey, « Le Spectre de la rose » chorégraphié par
Fokine, le kare-sansui, les logogrammes de Christian Dotremont, « Formes
uniques de continuité dans l'espace » de Boccioni.

**Proposition 3.** Assumer une répartition et la tenir : peinture et sculpture
grand public 40 %, littérature 20 %, musique 15 %, architecture et patrimoine
15 %, bande dessinée et design 10 %. Dans chaque bloc, garder les œuvres qui
ont une image mentale partagée (Le Radeau de la Méduse, La Jeune Fille à la
perle, Le Déjeuner sur l'herbe, La Traviata, Les Fleurs du mal, Gaston
Lagaffe, Magritte, Panamarenko côté belge) et sortir la typographie, l'art
conceptuel et l'histoire des arts extra-européens autres que les grands sites
connus (Borobudur, Angkor).

### 3.4 cinema : festival plutôt que salon

64 cartes portent sur des auteurs non anglophones exigeants (Glauber Rocha,
Pen-ek Ratanaruang, Lucrecia Martel, Jasmila Žbanić, Souleymane Cissé, Manoel
de Oliveira, Ryūsuke Hamaguchi), et 18 cartes relèvent du vocabulaire de
métier : rolling shutter, LUT, ADR, étalonnage, fond vert, tourner en 16 mm,
enregistrer une ambiance seule.

Les cartes de technique sont, curieusement, parmi les meilleures du jeu du
point de vue « apprendre quelque chose » : la réponse est raisonnable, le
distracteur est instructif, on ressort en sachant à quoi sert un étalonnage.
Elles méritent d'être conservées, mais une quinzaine suffit — pas plus, sinon
la catégorie devient une école de cinéma.

**Proposition 4.** Descendre le cinéma d'auteur non anglophone à une vingtaine
de cartes en gardant les titres qui ont franchi le grand public (Parasite,
Drive My Car, In the Mood for Love, Les Sept Samouraïs), et réinvestir dans le
cinéma francophone, qui ne pèse aujourd'hui que **12 %** de la catégorie
adulte : la Nouvelle Vague, le patrimoine populaire français, les Dardenne,
Bouli Lanners, Jaco Van Dormael, le cinéma québécois, les grands acteurs
francophones.

### 3.5 popculture : la catégorie la plus hors cible

50 % de réponses inconnues du foyer, 15 % d'hapax : c'est le pire score du
corpus. La cause est identifiable — un remplissage massif par des niches de
connaisseurs : 25 cartes de jeux de société d'auteur (Spirit Island, Hanabi,
Decrypto, Terraforming Mars), 30 cartes de jeux vidéo (Outer Wilds, Control,
Subnautica, Oxenfree), et une pente marquée vers la musique indépendante
(The Blue Nile, Tricky/Maxinquaye, Boards of Canada) et la science-fiction
littéraire anglo-saxonne (Ann Leckie, Becky Chambers).

**Proposition 5.** Recentrer sur la culture populaire réellement partagée dans
un salon belge : la chanson française et belge (Brel, Stromae, Angèle,
Goldman, Aznavour, Indochine), les séries et émissions que tout le monde a
vues, la BD franco-belge (déjà présente : Natacha, Yoko Tsuno — à renforcer),
les grands jeux vidéo connus de tous (Mario, Zelda, Tetris, Minecraft, Fifa),
les jeux de société familiaux plutôt que d'auteur. Garder une dizaine de
cartes « pointues » par catégorie est sain — trente, non.

### 3.6 gastronomie : le monde entier sauf chez nous

95 cartes adultes portent sur des cuisines extra-européennes (vietnamienne,
coréenne, géorgienne, philippine, indonésienne, éthiopienne, chypriote…)
contre **34 cartes seulement pour la France et la Belgique**. L'ancrage
francophone tombe de 27 % au niveau ado à **13 %** au niveau adulte : la
catégorie devient plus exotique en montant en niveau, alors qu'elle devrait
devenir plus fine.

Les cartes de technique culinaire, en revanche, sont excellentes et à garder
telles quelles : pourquoi rabattre une pâte, pourquoi tempérer le chocolat, la
réaction de Maillard, le socarrat d'une paella, la carbonara sans crème.

**Proposition 6.** Inverser le rapport : viser 35 à 40 % de cartes
France/Belgique (AOP et terroirs, fromages, bière belge et trappistes, plats
régionaux, pâtisserie, vocabulaire de cuisine française qui est la langue de
référence du métier), garder une trentaine de cartes monde sur les plats que
tout le monde a déjà mangés (sushi, paella, couscous, pad thaï, tiramisu) et
sortir la longue traîne (nước mắm, makgeolli, khinkali, baharat, halo-halo).

### 3.7 histoire et géographie : à peine trop haut, rien de structurel

Ces deux catégories sont proches du but. Quelques cartes à redescendre
seulement, par exemple : la Bulle d'or de Hongrie de 1222 (André II), le
traité de Saragosse de 1529 — d'autant plus cruel que Tordesillas, le
distracteur, est le traité connu —, la bataille d'Andrinople de 378, le Traité
fondamental de 1972 entre les deux Allemagnes, le premier vol transatlantique
à réaction (de Havilland Comet), la capitale législative du Sri Lanka.

En géographie, le seul vrai défaut est la répétition : 29 cartes commencent
par « Dans quel pays se trouve… ». Le moule n'est pas mauvais, il est
sur-utilisé.

---

## 4. Défauts de fabrication, indépendants du niveau

Ces points sont à corriger quel que soit l'arbitrage sur la difficulté.

### 4.1 La bonne réponse annoncée par l'énoncé — 201 cartes adultes (6 %)

Un mot plein de la bonne réponse figure déjà dans la question **et** est absent
des trois distracteurs : il désigne donc la bonne réponse. Les plus flagrantes :

| Énoncé | Réponse |
|---|---|
| Quel type de supernova résulte de l'effondrement du cœur d'une étoile massive ? | Une supernova à effondrement de cœur |
| Quel royaume africain avait Grand Zimbabwe pour centre monumental ? | Le royaume du Zimbabwe |
| Quelle sanction au handball exclut temporairement un joueur pendant deux minutes ? | Une exclusion |
| En plongeon, que mesure le coefficient de difficulté ? | La complexité du plongeon |
| Quel fruit séché et moulu donne au sumac culinaire sa saveur acidulée ? | Les baies de sumac |
| Quel peuple inuit sculptait de petites figures dans l'ivoire, l'os et la pierre ? | Les Inuits |
| Quelle culture autochtone du nord-ouest américain érige des mâts sculptés ? | Les peuples de la côte nord-ouest |
| Quel mode de cuisson chinois consiste à saisir rapidement de petits morceaux dans un wok ? | Le sauté au wok |
| Quel nougat contient traditionnellement miel, amandes et blancs d'œufs ? | Le nougat blanc |
| Quel processus transforme l'azote atmosphérique en composés assimilables ? | Fixation de l'azote |

Le détecteur existant (`leaksCorrectAnswer`) ne les voit pas : il cherche la
réponse complète dans l'énoncé avec une formulation assertive, alors qu'ici la
fuite passe par la morphologie (« exclut » → « exclusion »).

Au niveau enfant, le même phénomène concerne 31 cartes, mais il y est
**volontaire et souhaitable** (« Où vivent les fourmis ? » → « Dans une
fourmilière ») : le contrôle doit donc ne s'appliquer qu'au niveau adulte.

### 4.2 Doublons de fait par paraphrase — 33 paires adultes + 24 reprises d'ado

L'audit compare les énoncés à l'identique, donc il laisse passer les
reformulations du même fait dans la même catégorie :

- « Quelle mer sépare l'Australie de la Nouvelle-Zélande ? » et « Quelle mer
  se trouve entre l'Australie et la Nouvelle-Zélande ? » → la mer de Tasman
- « Quelle capitale africaine se situe au confluent du Nil Blanc et du Nil
  Bleu ? » et sa jumelle → Khartoum
- « Quelle capitale des Balkans est traversée par la Save et le Danube ? » et
  « … se trouve au confluent de la Save et du Danube ? » → Belgrade
- « Quel jeu d'exploration recommence après une boucle temporelle de 22
  minutes ? » et « … place l'astronaute dans une boucle temporelle de 22
  minutes ? » → Outer Wilds
- deux cartes Magna Carta, deux cartes Rio Grande, deux cartes Java, deux
  cartes phở, deux cartes Ann Leckie, deux cartes Return of the Obra Dinn…

Et 24 cartes adultes reformulent une carte ado de la même catégorie
(« Quel studio suédois a créé Minecraft ? » ado / « Quel studio a créé
Minecraft ? » adulte — la version adulte est même plus facile).

Deux d'entre eux trahissent en plus une incohérence d'orthographe à corriger :
**Katmandou / Kathmandu** et **Sri Jayewardenepura / Sri Jayawardenepura**.

### 4.3 Une réponse discutable

« Quel royaume africain avait Grand Zimbabwe pour centre monumental ? » donne
« Le royaume du Zimbabwe » et met « Le royaume du Monomotapa » en distracteur.
Les deux appellations sont défendables selon la période retenue : la carte
punit un joueur qui en sait plus. À reformuler ou à retirer.

### 4.4 Répétition de moules d'énoncé

Au-delà des 151 cartes de sciences déjà citées : 29 « Dans quel pays se
trouve… » en géographie, 24 « Quel artiste a créé… » en art, 22 « De quel pays
vient le/la… » en gastronomie. Ce dernier moule produit aussi des doublons
mécaniques (bibimbap et kimchi → Corée du Sud ; nasi goreng et satay →
Indonésie).

### 4.5 Remarques techniques mineures

- `balanceAdultAnswerPositions` (`src/data/questions.ts:153`) équilibre les
  positions A/B/C/D des cartes adultes, mais le serveur remélange les options
  à chaque tirage (`shuffleQuestionOptions`, `server.ts`). Cet équilibrage ne
  sert donc qu'à satisfaire une règle d'audit, sans effet en jeu.
- `completeAdultQuestionBank` (`src/data/adultExpansion.ts:74`) n'est plus
  appelée nulle part depuis que les banques adultes sont complètes : code mort.

---

## 5. Niveau enfant : bien calibré, sauf sur un point

Rien à redescendre : la difficulté est juste, la lecture est accessible, et
les cartes les plus longues restent limpides (« Quelle grande découverte a
permis aux hommes préhistoriques de se chauffer, de s'éclairer et de cuire
leurs aliments ? » → le feu).

Le seul manque concerne le mélange de l'utile et de l'agréable :

- **cinema enfant et popculture enfant partagent 47 réponses identiques** et
  se recouvrent aussi avec art (19 réponses). Un enfant a l'impression de
  retomber sur la même carte selon la case où il arrive.
- Ces deux catégories, soit 270 cartes, sont presque entièrement du rappel
  Disney / Pixar / Nintendo : Simba, Olaf, Baloo, Pumbaa, Bob l'éponge,
  Luigi, Pokémon. C'est agréable, mais on n'y apprend rien, et c'est aussi la
  partie du corpus la moins francophone (8 % contre 37 % en histoire).

**Proposition 7.** Dédoublonner cinema / popculture / art au niveau enfant, et
réinvestir la moitié des cartes libérées dans la culture enfantine
francophone, qui manque : Le Petit Nicolas, Astérix, Lucky Luke, Cédric, Titeuf,
Ernest et Célestine, Kirikou, Le Petit Prince, les contes de Perrault, les
comptines, Le Chant des Wallons et la Brabançonne, Bruxelles et l'Atomium.
Et systématiser dans l'explication un fait à retenir, comme le fait déjà très
bien la catégorie histoire.

---

## 6. Récapitulatif des propositions, par priorité

| # | Proposition | Effort | Gain |
|---|-------------|--------|------|
| 1 | Supprimer le clonage enfant → ado, écrire 227 cartes ado (dont 135 en sciences) | élevé | débloque la progression, corrige le pire défaut |
| 2 | Ramener le tableau périodique à ~12 cartes, réécrire ~140 cartes de sciences adultes | élevé | supprime le tirage au sort, rend la catégorie apprenante |
| 3 | Corriger les ~15 cartes défectueuses listées en 4.1 et 4.3, fusionner les 33 doublons de 4.2, harmoniser Katmandou et Sri Jayawardenepura | faible | qualité immédiate |
| 4 | Renforcer l'audit : interdiction du clonage ado, détection des doublons par paraphrase, détection morphologique de la fuite de réponse (adulte seulement), plafond de réutilisation d'un moule, plafond de cartes à 4 nombres nus | moyen | empêche la régression |
| 5 | Faire descendre le plafond adulte vers ≤ 20 % de réponses inconnues du foyer, en commençant par popculture (50 %), cinema (41 %) et art (36 %) | élevé | recentre sur le Trivial Famille |
| 6 | Relever l'ancrage francophone du niveau adulte au niveau de l'ado : gastronomie 13 → 35 %, cinema 12 → 25 %, popculture 17 → 30 %, histoire 23 → 35 %, geographie 24 → 35 % | moyen | correspond au public visé |
| 7 | Dédoublonner cinema / popculture / art enfant et y injecter la culture enfantine francophone | moyen | rend le niveau enfant apprenant |
| 8 | Rééquilibrer la composition interne de la catégorie art (voir 3.3) | moyen | rend la catégorie lisible |
| 9 | Nettoyage technique : `completeAdultQuestionBank` (code mort), et clarifier le rôle de `balanceAdultAnswerPositions` | faible | dette |

Un mot sur la culture mondiale, puisque c'était la question posée : elle n'a
pas à disparaître. Les cartes du corpus qui la portent le mieux sont
excellentes et parfaitement à leur place — Cléopâtre et Marc Antoine, Hannibal
et ses éléphants, Amundsen au pôle Sud, le lac Titicaca, le Krakatoa, Rosa
Parks, le détroit d'Ormuz, la mer Morte, Tenochtitlan. Ce sont des repères de
culture générale partagée. Ce qu'il faut retirer, ce n'est pas « le monde »,
c'est **la longue traîne** : le nước mắm, le thulium, Pen-ek Ratanaruang, les
logogrammes de Dotremont. La distinction utile n'est pas géographique, elle
est de notoriété.

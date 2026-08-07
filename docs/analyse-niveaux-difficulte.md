# Analyse du niveau de difficulté des trois banques de questions

Date : juillet 2026 — corpus analysé : 5 360 cartes
(8 catégories × 135 enfant + 135 ado + 400 adulte).

> **État d'avancement.** Les propositions 1 à 7 et 9 de la section 6 ont été
> appliquées ; le détail des cartes modifiées figure dans l'historique git.
> La section 7 bis, en fin de document, récapitule ce qui a été fait, les
> chiffres avant/après et ce qui reste ouvert. Les constats ci-dessous
> décrivent l'état initial : ils sont conservés tels quels pour garder la
> trace du diagnostic.

Étalon visé : l'**édition Famille du Trivial Pursuit du commerce**, c'est-à-dire de la culture
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


---

## 7 bis. Ce qui a été appliqué

### Mesures avant / après

| Indicateur | Avant | Après |
|---|---:|---:|
| Cartes ado recopiées du niveau enfant | 227 / 1 080 | **0** |
| dont sciences | 135 / 135 | **0** |
| Cartes de tableau périodique en sciences adulte | 154 / 400 | **11** |
| Cartes adultes à quatre nombres nus (sciences) | 77 | **3** |
| Paires de cartes adultes reformulant le même fait | 39 | **0** |
| Cartes adultes réutilisant un moule plus de 8 fois | 205 | **0** |
| Réponses inconnues du foyer — popculture | 50 % | **36 %** |
| Réponses inconnues du foyer — cinéma | 41 % | **34 %** |
| Réponses inconnues du foyer — art | 36 % | **33 %** |
| Ancrage francophone adulte — gastronomie | 13 % | **37 %** |
| Ancrage francophone adulte — cinéma | 12 % | **37 %** |
| Ancrage francophone adulte — histoire | 23 % | **32 %** |
| Réponses partagées entre cinéma et popculture (enfant) | 47 | **0** |

Volumes inchangés : 135 enfant, 135 ado et 400 adulte par catégorie,
5 360 cartes au total.

### Travaux menés

1. **Niveau ado (proposition 1).** 227 cartes écrites : 135 en sciences
   (`sciencesAdoEditorial.ts`), 65 en popculture et 27 en gastronomie
   (`popcultureGastronomieAdoEditorial.ts`). Le remplissage automatique depuis
   la banque enfant est supprimé.
2. **Sciences adulte (proposition 2).** Les 215 cartes générées par boucle dans
   `adultKnowledgeSupplement.ts` sont réécrites une par une : douze cartes de
   tableau périodique sur des éléments familiers, puis astronomie, physique,
   chimie, corps humain, biologie, Terre et climat, technologies.
3. **Cartes défectueuses (proposition 3).** Onze cartes dont l'énoncé annonçait
   la réponse, une réponse discutable (Grand Zimbabwe), deux orthographes
   divergentes (Katmandou, Sri Jayawardenepura) et 39 paires de doublons
   reformulés sont corrigées.
4. **Audit renforcé (proposition 4).** Quatre contrôles bloquants s'ajoutent :
   carte enfant recopiée au niveau ado, fait adulte reformulé, moule d'énoncé
   réutilisé plus de huit fois, plafond de cartes à quatre nombres nus.
5. **Plafond adulte et ancrage francophone (propositions 5 et 6).** 44 cartes
   de la longue traîne remplacées par des cartes grand public francophones :
   20 en gastronomie, 24 en cinéma. Le canon international reconnu est conservé.
6. **Niveau enfant (proposition 7).** Les 43 cartes de cinéma enfant qui
   doublaient une carte de popculture sont réécrites, moitié en culture
   enfantine francophone (Petit Nicolas, Astérix, Kirikou, Ernest et Célestine,
   Belle et Sébastien, Panique au village, Le Roi et l'Oiseau), moitié en
   coulisses du cinéma — clap, bruitage, storyboard, doublage, fond vert,
   24 images par seconde. C'est la partie du corpus où l'« utile » manquait le
   plus.
7. **Dette technique (proposition 9).** `src/data/adultExpansion.ts` est
   supprimé : plus aucun module ne s'y réfère. Le rôle réel de
   `balanceAdultAnswerPositions` est documenté dans le code.

### Ce qui reste ouvert

- **Proposition 8 — composition de la catégorie art.** La répartition interne
  (52 cartes de musique classique, 50 de littérature, 26 de design et mode,
  37 d'arts non occidentaux) n'a pas été retouchée. C'est un arbitrage
  éditorial à trancher avant de déplacer des cartes : faut-il une catégorie
  « Arts & Littérature » à dominante peinture, ou assumer le fourre-tout ?
- **Plafond adulte, seconde passe.** Cinq catégories restent au-dessus de la
  cible de 20 % de réponses inconnues du foyer : popculture 36 %,
  gastronomie 35 %, cinéma 34 %, art 33 %, sciences 29 %. Descendre plus bas
  demande d'écarter des cartes correctes mais pointues, ce qui suppose de
  choisir jusqu'où l'on veut baisser le niveau.
- **Ancrage francophone de sports et popculture.** 17 % et 28 %, contre une
  cible de 30 %. Le sport se prête bien à un rattrapage (Diables rouges,
  cyclisme belge, Tour de France, Ligue 1, Jeux de Paris 2024).
- **Cartes de sports à quatre nombres nus.** 17 cartes, soit 4 % : sous la
  limite mais le plafond est presque atteint.
- **Répétition de la formule « Le saviez-vous ? »** en tête d'un grand nombre
  d'explications des niveaux enfant et ado. Sans effet sur la difficulté, mais
  lassant à la lecture à voix haute.


---

## 8. Analyse ciblée : « Art & Littérature » et « Cinéma & Séries »

Demandée après une première session de test : ces deux catégories sont ressenties
comme trop complexes. Le diagnostic isole trois causes distinctes.

### 8.1 Le problème est au niveau adulte seulement

Les niveaux enfant et ado de ces deux catégories sont bien calibrés et n'ont pas
besoin d'être touchés. Art ado tourne autour de Hamlet, Harpagon, le Boléro, Le
Cri, Dickens, Jean Valjean, Rodin, le surréalisme, Homère. Cinéma ado tourne
autour de Harry Potter, Kaamelott, Dany Boon, Peter Jackson, Star Wars, La Casa
de Papel, Totoro. C'est exactement le bon registre.

### 8.2 Les étiquettes et le contenu sont croisés

| Catégorie | Ce que le nom promet | Ce qu'elle contient (niveau adulte) |
|---|---|---|
| Cinéma & Séries | des séries | **3 cartes de séries sur 400** |
| Art & Littérature | art et littérature | **42 cartes de musique classique et d'opéra** |
| Pop Culture & Musique | de la musique | **108 cartes de séries**, 11 de classique |

Un joueur qui connaît bien les séries n'en tire aucun bénéfice sur la case
« Cinéma & Séries », et tombe sur un opéra en case « Art & Littérature ». Cette
attente déçue compte autant que la difficulté brute.

### 8.3 Les familles qui portent la difficulté

Part des cartes adultes dont la bonne réponse n'apparaît nulle part aux niveaux
enfant ou ado : **art 38 %, cinéma 42 %**, contre 15 % en sports.

**Art (181 cartes sur 400, soit 45 %, dans des familles hors sujet)**

| Famille | Cartes | Exemples |
|---|---:|---|
| mode, design, typographie, joaillerie | 66 | Rei Kawakubo, Eileen Gray, le caractère Bodoni, la granulation |
| arts non occidentaux et archéologie | 45 | Tā moko, tissage navajo, Prambanan, zellige, kare-sansui |
| musique classique, opéra, lied | 42 | livret de Don Giovanni, Má vlast, Wozzeck |
| vocabulaire d'atelier | 19 | grisaille, encaustique, aquatinte, empâtement |
| danse et chorégraphie | 18 | Alvin Ailey, Michel Fokine, Sidi Larbi Cherkaoui |
| art conceptuel et performance | 12 | Sol LeWitt, Arte Povera, Le Vide d'Yves Klein |

Ce que le nom promet ne pèse que 35 % : 81 cartes de peinture et sculpture,
58 de littérature. Et la bande dessinée franco-belge, dans un jeu destiné à un
foyer belge, ne compte que **2 cartes sur 400** au niveau adulte — contre 8 au
niveau enfant et 8 au niveau ado.

**Cinéma (230 cartes sur 400, soit 58 %)**

| Famille | Cartes | Exemples |
|---|---:|---|
| cinéma muet et classique d'avant 1960 | 88 | Dziga Vertov, De Sica, procédés Vitaphone |
| cinéma d'auteur international à festivals | 69 | Amir Naderi, Elia Suleiman, Johnnie To, Cristian Mungiu |
| technique et histoire des procédés | 48 | CinemaScope anamorphique, LUT, rolling shutter |
| métiers de l'ombre | 35 | Thelma Schoonmaker (monteuse), Eiko Ishioka (costumière) |
| documentaire | 13 | Shoah, The Thin Blue Line |

Les cartes de métiers de l'ombre sont les plus dures de tout le corpus : même un
cinéphile ne cite pas la monteuse de Scorsese.

### 8.4 Un défaut à corriger dans tous les cas

> **Réglé.** Les deux cartes La Cité de Dieu ont été retirées lors de la passe
> décrite en section 9. Les deux cas bénins subsistent.

« Qui a réalisé La Cité de Dieu ? » existe deux fois avec deux bonnes réponses
différentes : `cin_adulte_editorial_03_006` attend « Fernando Meirelles »,
`cin_adulte_editorial_04_022` attend « Fernando Meirelles et Kátia Lund » sans
proposer Meirelles seul. Un joueur qui a appris la première se trompe sur la
seconde. Deux autres cartes présentent le même défaut sous une forme bénigne
(détroit de Messine, monter une sauce au beurre). Le contrôle d'audit compare
les réponses caractère par caractère et ne voit donc pas ces cas.

### 8.5 Propositions

**A. Remettre chaque thème dans sa catégorie — une rotation à trois.**

1. Art cède ses 42 cartes de musique classique à « Pop Culture & Musique ».
2. Pop Culture cède 42 cartes de séries à « Cinéma & Séries ».
3. Cinéma écarte 42 de ses cartes les plus spécialisées.
4. Art reçoit 42 cartes neuves de peinture, littérature et BD franco-belge.

Les trois catégories restent à 400. Une seule série de 42 cartes est à écrire, et
les trois étiquettes redeviennent honnêtes.

**B. Ramener les familles hors sujet à une part raisonnable.**

| Famille | Aujourd'hui | Cible | Ce qu'on garde |
|---|---:|---:|---|
| art — mode et design | 66 | ~15 | Chanel, Dior, Saint Laurent, Bauhaus, Art nouveau |
| art — arts non occidentaux | 45 | ~12 | Angkor, Borobudur, Hokusai, masques africains |
| art — danse | 18 | ~6 | Casse-Noisette, Le Lac des cygnes, Noureev, Béjart |
| art — vocabulaire d'atelier | 19 | ~8 | fresque, aquarelle, huile, perspective |
| cinéma — muet et avant 1960 | 88 | ~25 | Chaplin, Hitchcock, Gabin, Casablanca, Autant-Lara |
| cinéma — auteur international | 69 | ~25 | ceux qui ont franchi le grand public |
| cinéma — technique | 48 | ~15 | les plus parlantes, qui apprennent quelque chose |
| cinéma — métiers de l'ombre | 35 | ~10 | compositeurs identifiables : Morricone, Legrand, Williams |

Les cartes libérées vont vers ce que le foyer connaît : comédies françaises et
belges, sagas et blockbusters, acteurs familiers, séries, romans lus à l'école,
peinture grand public, BD franco-belge.

**C. Ajouter un contrôle d'audit** « même énoncé, réponses libellées
différemment », qui aurait attrapé La Cité de Dieu.

---

## 9. Passe « on ne connaît pas les réalisateurs » (deuxième session de test)

Retour de table, sur une carte de « Cinéma & Séries » : *« Quel réalisateur a
signé Le Ruban blanc ? »* — Michael Haneke, Ulrich Seidl, Christian Petzold,
Fatih Akın. Personne ne peut répondre, et la remarque porte autant sur la
répétition que sur la difficulté : « on a eu beaucoup de questions du style quel
réalisateur ».

### 9.1 Ce que mesurait le corpus

Les deux reproches étaient exacts et se cumulaient.

| Constat | Mesure |
|---|---:|
| Cartes « qui a réalisé / signé ce film ? » en cinéma adulte | 85 / 400 |
| Toute la famille attribution d'une œuvre à son auteur (cinéma) | 104 / 400 |
| Réponses inconnues du foyer en cinéma adulte | 34 % |

La famille passait entre les mailles du contrôle 4 : « Quel cinéaste a réalisé
_ ? », « Quel réalisateur a signé _ ? », « Qui a réalisé _ ? » et « Quel
réalisateur polonais a signé _ ? » sont quatre moules distincts pour
`questionSkeleton`, aucun ne dépassant huit reprises, alors que la table entend
quatre fois la même question. La difficulté, elle, n'a qu'une porte de sortie :
connaître le nom. Un film peut se deviner par son sujet, une réplique par son
film ; un patronyme ne se déduit de rien.

### 9.2 Ce qui a été fait

68 cartes remplacées, à volume constant :

- **60 cartes d'attribution** dont la réponse ne pouvait pas être citée par le
  foyer : Fruit Chan, Amir Naderi, Otar Iosseliani, Béla Tarr, Jonas Mekas,
  Rainer Sarnet, Cristi Puiu, Miguel Gomes, Roberto Gavaldón, Jiří Menzel,
  Fernando Solanas, Julie Dash, Johnnie To, Tsai Ming-liang, Elia Suleiman,
  Mahamat-Saleh Haroun, Ousmane Sembène, Kenji Mizoguchi, Robert Wiene,
  Dziga Vertov, Albert Lamorisse, Andrew Dominik, Sebastián Lelio.
- **8 cartes de métiers de l'ombre** dont la réponse était un nom invisible du
  grand public : Anton Karas, Tan Dun, Mica Levi, Vittorio Storaro, Germaine
  Dulac, Kinuyo Tanaka.

Ce qui reste de la famille est ce qu'un foyer peut nommer : Truffaut, Godard,
Tati, Clouzot, Bergman, Visconti, Almodóvar, del Toro, Lynch, Campion,
Kassovitz, Sciamma, Triet, Villeneuve, Dolan, Arcand, Van Dormael, Dhont,
Roskam, les auteurs de *C'est arrivé près de chez vous*.

Les remplaçantes sont dans `src/data/questionBank/cinemaGrandPublicAdultEditorial.ts`
et couvrent trois terrains :

| Terrain | Cartes | Exemples |
|---|---:|---|
| séries — ce que le nom de la catégorie promet | 21 | Lost, Les Experts, Dallas, Columbo, Le Prince de Bel-Air, Star Trek, Caméra café |
| comédie et cinéma francophones, dont la Belgique | 24 | Le Splendid, Tanguy, La Cité de la peur, Coluche, Pascal Duquenne, Ernest et Célestine, le BIFFF |
| grands succès que le foyer a vus | 23 | Titanic, Rocky, Léon, Un jour sans fin, L'Arme fatale, Les Évadés |

Le format varie autant que le sujet : personnages, répliques, objets, lieux de
tournage, récompenses — plutôt qu'une nouvelle liste de quatre patronymes.

Chaque remplaçante a été confrontée au reste du corpus, pas seulement à sa
catégorie : vingt-quatre sujets d'abord retenus ont été écartés parce que le
fait était déjà posé ailleurs (Game of Thrones, The Crown, Amélie Poulain et
Intouchables en popculture adulte ; l'anneau de la Montagne du Destin, la
DeLorean, la pilule rouge, Poudlard, Dark Vador aux niveaux enfant et ado). Une
carte adulte qui répète une carte enfant produit exactement le même ennui qu'une
carte impossible.

### 9.3 Mesures avant / après

| Indicateur | Avant | Après |
|---|---:|---:|
| Cartes « qui a réalisé ce film ? » — cinéma adulte | 85 | **26** |
| Famille attribution complète — cinéma adulte | 104 | **39** |
| Réponses inconnues du foyer — cinéma adulte | 34 % | **23 %** |

Volumes inchangés : 400 cartes adultes en cinéma, 5 360 au total. `npm run check`
passe.

### 9.4 Un onzième indicateur au diagnostic

`npm run analyze:difficulty` mesure désormais la part de cartes d'attribution
par catégorie (section 11, cible ≤ 10 %).

> **Chiffres corrigés deux fois.** La première version de cet indicateur
> listait des verbes — « réalisé, signé, peint, écrit » — et annonçait art 104,
> popculture 62, cinéma 40 : elle ratait « qui a créé », « quel est l'auteur
> de », « à quel artiste doit-on », « qui a conçu ». La deuxième comptait toute
> carte dont la réponse est un nom propre, et se trompait dans l'autre sens :
> Blacksad, Bob Morane, Michel Vaillant, Pokémon, Motown et Spotify sont des
> personnages et des marques, pas des auteurs.
>
> Le critère définitif tient aux deux bouts : l'énoncé réclame **un rôle de
> créateur** et la réponse est **un nom**. Mesuré ainsi, l'état du corpus avant
> les trois passes était : art **249 / 400**, cinéma **119 / 400**,
> popculture **90 / 400**.

Le diagnostic ne bloque pas. Il rend visible ce qui reste après la passe
décrite en section 10.


---

## 10. Passe « qui a peint ceci » sur Art & Littérature

Suite directe de la section 9 : la même remarque de table vaut pour l'art, et la
mesure corrigée a montré un problème d'une autre ampleur.

### 10.1 Deux cartes d'art sur trois attendaient un patronyme

| Catégorie | Cartes réclamant un nom d'auteur | Part |
|---|---:|---:|
| art | 249 / 400 | 62 % |
| cinema | 119 / 400 | 30 % |
| popculture | 90 / 400 | 23 % |

231 noms distincts : la catégorie est un annuaire. Et sur ces
231 noms, **18 seulement** apparaissent quelque part aux niveaux enfant ou ado —
tout le reste est à produire de mémoire, sans aucun appui dans le jeu.

Les familles qui portaient le plus ce défaut sont celles que la section 8.5
signalait déjà comme surdimensionnées : la danse (chorégraphes), le design et la
typographie (dessinateurs de caractères, ébénistes, orfèvres), l'art
contemporain, et les artistes belges très spécialisés.

### 10.2 Ce qui a été fait

61 cartes remplacées, à volume constant, choisies sur un seul critère : la
réponse n'était pas citable par le foyer. Chorégraphes (Nijinska, Balanchine,
Graham, Cunningham, Ailey, Roland Petit, Kylián, Akram Khan, Cherkaoui,
Vandekeybus), typographes et designers (Garamont, Miedinger, Johnston, Saul
Bass, Milton Glaser, Harry Beck, Riesener, Puiforcat, Gallé, Lalique, Rietveld,
Breuer), art contemporain (Kosuth, Flavin, Judd, Pistoletto, Broodthaers,
Panamarenko, Gormley, Kapoor, Tinguely, Op de Beeck, De Bruyckere, Jan Fabre,
Wim Delvoye, Francis Alÿs, Dotremont, Robert Frank), Belges pointus (Khnopff,
Spilliaert, Minne, Meunier, Permeke, Tuymans, Grimonprez), sculpture (Phidias,
Donatello, Cellini, Giambologna, Carpeaux, Rude, Brâncuși, Moore) et
architecture (Palladio, Soufflot, Barry, Paxton, Mackintosh, Mies van der Rohe,
Utzon, Piano et Rogers, Adrian Smith).

Deux principes de remplacement, dans
`src/data/questionBank/artGrandPublicAdultEditorial02.ts` :

1. **retourner la carte** quand le sujet est célèbre et que seul son auteur est
   inconnu. Le Crystal Palace, l'Opéra de Sydney, le Centre Pompidou, le Burj
   Khalifa, le palais de Westminster, Helvetica, « I ♥ NY », Cloud Gate et la
   fontaine Stravinsky remplacent Paxton, Utzon, Piano et Rogers, Adrian Smith,
   Barry, Miedinger, Glaser, Kapoor et Tinguely ;
2. **changer de sujet et de format** sinon : regarder un tableau (les sourcils
   de la Joconde, le chapeau melon de Magritte, le ciel du Cri, le lapis-lazuli,
   le marbre de Carrare), reconnaître un personnage de roman (Dantès, Tartuffe,
   Gervaise, Sancho Pança, Raskolnikov, Candide) ou de bande dessinée (Olrik,
   De Mesmaeker, Quick et Flupke, le Loch Lomond de Haddock), nommer une
   technique, un métier de musée ou une forme poétique (l'alexandrin, l'incipit,
   le haïku, le cartel, les réserves, le catalogue raisonné).

Comme pour le cinéma, chaque remplaçante a été confrontée à tout le corpus :
trois sujets d'abord retenus ont été écartés parce que le fait était déjà posé
(le Prado et Les Ménines, la définition de la fresque, une troisième carte sur
la chapelle Sixtine).

### 10.3 Mesures avant / après

| Indicateur | Avant | Après |
|---|---:|---:|
| Cartes réclamant un nom d'auteur — art | 249 / 400 | **192 / 400** |
| Réponses inconnues du foyer — art | 29 % | **28 %** |

Volumes inchangés : 400 cartes adultes par catégorie, 5 360 au total.

### 10.4 Ce que cette passe ne règle pas

**La monotonie du format reste entière.** 192 cartes d'art sur 400 demandent
toujours un nom d'auteur, contre 53 en cinéma après la passe précédente. Les
noms qui restent sont ceux qu'un foyer peut produire — Léonard, Rembrandt,
Monet, Van Gogh, Picasso, Magritte, Rubens, Hergé, Franquin, Chanel, Simenon —
mais entendre cinquante fois « qui a peint ceci ? » reste lassant même quand on
répond. Descendre à la cible de 10 % demanderait de réécrire environ 160 cartes
supplémentaires, c'est-à-dire de refaire la catégorie : c'est un arbitrage
éditorial à trancher, pas un correctif.

**L'indicateur de notoriété bouge à peine** (29 → 28 %), et c'est normal : il
mesure le recouvrement lexical avec les banques enfant et ado, pas la
familiarité réelle. « Le Crystal Palace », « les sourcils » ou « le chapeau
melon » n'apparaissent nulle part aux niveaux jeunes et sont pourtant à portée
d'un adulte, là où « Bronislava Nijinska » ne l'était pas. Le progrès de cette
passe se lit dans la nature des réponses, pas dans ce pourcentage.

**Pop Culture & Musique n'a pas été touchée par cette passe** : 90 cartes sur
400 y réclament un nom d'auteur. C'est l'objet de la section 11.


---

## 11. Passe « qui a composé, qui a dessiné » sur Pop Culture & Musique

Troisième et dernière passe de la série, la plus petite des trois — et c'est la
saturation de la catégorie qui l'explique.

### 11.1 90 cartes, dont la moitié jouable

Sur les 90 cartes qui réclament un nom de créateur, une bonne moitié attend un
nom qu'un foyer produit sans peine : Hergé, Franquin, Goscinny, Simenon, Maurice
Leblanc, Jean Van Hamme, Gainsbourg, Cabrel, Michel Berger, Bowie, Prince,
Sandra Kim, Angèle. Ces cartes ne posent aucun problème et n'ont pas été
touchées.

Les autres tombaient dans deux pièges :

- **le créateur invisible** : Bill Watterson pour Calvin et Hobbes, Quino pour
  Mafalda, Katsuhiro Ōtomo, Naoki Urasawa, Grant Morrison, Frank Miller, Mike
  Mignola, Bryan Lee O'Malley, Iain M. Banks, N. K. Jemisin ;
- **le compositeur célèbre associé à une œuvre qui ne l'est pas** : Purcell et
  « Didon et Énée », Rameau et « Les Indes galantes », Schumann et « Scènes
  d'enfants », Liszt et « Les Préludes », Smetana et « Má vlast », Bartók et
  « Le Mandarin merveilleux », Bellini et « Norma », Mascagni et « Cavalleria
  rusticana », Berg et « Wozzeck », Philip Glass et « Einstein on the Beach ».
  Le nom est connu, le titre ne l'est pas : la carte se joue au hasard.

### 11.2 Ce qui a été fait

29 cartes remplacées, dans
`src/data/questionBank/popcultureGrandPublicAdultEditorial.ts`. Les
remplaçantes restent sur le terrain de la catégorie mais changent de point
d'entrée : le titre d'une chanson plutôt que son auteur (« Non, je ne regrette
rien », « Il est cinq heures, Paris s'éveille », « Comme d'habitude » devenue
« My Way »), un surnom (« le Taulier »), un emblème (la langue des Rolling
Stones), un chiffre (les quatre-vingt-huit touches du piano, les quatre cordes
du violon), une console (la Game Boy), un jeu (Catane, Pictionary, le Yam's, le
Taboo, Doom, SimCity, Yu-Gi-Oh!), une récompense (les Grammy, les Victoires de
la musique), et l'ancrage belge que la catégorie mérite (Brel né à Bruxelles,
Adamo, Lara Fabian, l'harmonica de Toots Thielemans).

Deux cartes écrites pour cette passe ont été jetées après vérification : le duo
Vaya Con Dios et la new beat belge étaient déjà posés ailleurs dans la
catégorie. La recherche par mot-clé les avait manqués à cause d'une majuscule.

### 11.3 Bilan des trois passes

| Catégorie | Cartes réclamant un nom de créateur, avant | après |
|---|---:|---:|
| cinema | 119 / 400 | **53 / 400** |
| art | 249 / 400 | **192 / 400** |
| popculture | 90 / 400 | **62 / 400** |

158 cartes réécrites au total, à volume constant : 68 en cinéma, 61 en art,
29 en pop culture.

### 11.4 Pourquoi cette passe est la plus petite

Pop Culture & Musique est déjà très fournie en chanson francophone, en bande
dessinée franco-belge, en jeux vidéo et en jeux de société. Chercher des sujets
grand public encore libres y devient difficile : sur une trentaine de candidats
retenus au départ, la moitié étaient déjà posés — Aznavour, Adamo côté Arno,
Nirvana, U2, Daft Punk, Beyoncé, Ed Sheeran, PlayStation, FIFA, Animal
Crossing, Guitar Hero, Candy Crush, Cluedo, Time's Up, Yoko Tsuno, YouTube,
l'e-sport, Queen et « Bohemian Rhapsody ».

Descendre les trois catégories à la cible de 10 % demanderait donc autre chose
qu'une passe de remplacement : ouvrir des territoires que le jeu ne couvre pas
encore, ou assumer que « qui a fait cette œuvre ? » reste une question
légitime quand la réponse est un nom que le foyer connaît. C'est un arbitrage
éditorial, pas un correctif — et il vaut d'être tranché avant la prochaine
session de test.


---

## 12. Passe « nommez la personne » sur Histoire

Signalée par une carte qui, elle, allait très bien : *« Quel explorateur français
remonta le Saint-Laurent et nomma le Canada ? »* — Jacques Cartier, face à
Pierre Dugua de Mons, Cavelier de La Salle et Champlain.

### 12.1 Ce que cette carte apprend sur le critère

Elle n'a rien à se reprocher : un seul nom connu parmi les quatre, et elle a été
gagnée à table. Le défaut n'est donc pas « la réponse est un nom de personne »,
c'est **personne ne peut le produire ni le reconnaître**. Le Ruban blanc alignait
quatre inconnus ; Cartier en aligne trois et un nom de manuel scolaire.

Cette carte-là échappait aussi aux indicateurs : la section 11 ne compte que les
rôles de créateur, et histoire y affichait 4 cartes sur 400. La famille existe
pourtant sous d'autres rôles — roi, empereur, explorateur, savant, dirigeant,
militante. Une **section 12** les mesure désormais, avec la colonne qui compte
vraiment : le nom attendu apparaît-il ailleurs dans le jeu, ou nulle part ?

### 12.2 Ce qui a été fait

36 cartes remplacées, toutes choisies parce que leur réponse est hors de portée
d'un foyer : Cyrus II, Brennus, Genséric, Théodora, Alfred le Grand, André II de
Hongrie, Kubilaï Khan, Bartolomeu Dias, Bohdan Khmelnytsky, Shivaji, Ahmad Shah
Durrani, Haïlé Sélassié, Enriquillo, Túpac Amaru, Lázaro Cárdenas, l'empereur
Yongle, Suharto, Hatchepsout, Zénobie, Wu Zetian, la reine Tamar, Njinga,
Emmeline Pankhurst, Tycho Brahe, Annie Jump Cannon, Ashoka, Akbar, Abel Tasman,
Cavelier de La Salle, David Ricardo, Reginald Fessenden, Ignace Semmelweis,
Habib Bourguiba, Mansa Moussa, Zheng He, Tokugawa Ieyasu.

Ce qui reste est ce qu'un foyer nomme ou reconnaît : Cléopâtre, Hannibal, Clovis,
Gengis Khan, Colomb, Henri VIII, Louis XIV, Bismarck, de Gaulle, Saladin,
Guillaume le Conquérant, Élisabeth Ire, Catherine II, Olympe de Gouges, Rosa
Parks, Copernic, Magellan, Cartier, Amundsen, Marx, Keynes, Montessori, Jenner,
Atatürk, Lumumba, Albert Ier — et Ambiorix, que tout écolier belge a croisé.

Les remplaçantes (`src/data/questionBank/histoireGrandPublicAdultEditorial.ts`)
déplacent la question du nom vers le fait, avec un accent belge que la catégorie
méritait : La Muette de Portici et la révolution de 1830, la fête nationale du
21 juillet, la frontière linguistique, l'État indépendant du Congo, la dynastie
de Saxe-Cobourg, la première ligne de chemin de fer du continent, les dix-huit
jours de mai 1940, la bibliothèque de Louvain incendiée en 1914, le drame du
Heysel, le palais de la Nation, le droit de vote des femmes en 1948. Puis
l'Europe et le monde par l'événement : Schengen, le pacte de Varsovie, la durée
réelle de la guerre de Cent Ans, la prise de Grenade, la Convention de 1792, la
traite atlantique, la grippe espagnole, la dissolution de l'URSS, Maastricht, la
réunification allemande. Et enfin des mots d'histoire : armistice,
décolonisation, monarchie constitutionnelle, Constitution, Moyen Âge,
suffragettes.

**Deux précautions prises.** Sept des cartes retirées portaient sur des femmes :
deux remplaçantes reprennent le sujet sans exiger un patronyme inconnu, sur les
suffragettes britanniques et sur le droit de vote des femmes en Belgique. Et
trois remplaçantes d'abord écrites ont été jetées parce que le fait existait
déjà — la question royale, la bataille des Ardennes, la crise de Cuba. Deux
d'entre elles avaient échappé à la recherche par mot-clé à cause d'une
majuscule : « Question royale » contre « question royale ». Le contrôle de
quasi-doublons, lui, les a vues.

### 12.3 Mesures avant / après

| Indicateur (section 12) | Avant | Après |
|---|---:|---:|
| Cartes « nommez la personne » — histoire | 90 / 400 | **54 / 400** |
| dont le nom n'apparaît nulle part ailleurs | 30 | **8** |

### 12.4 Bilan des quatre passes

| Catégorie | Cartes réécrites | Famille « nommez la personne », après |
|---|---:|---:|
| cinema | 68 | 56 / 400 |
| art | 61 | 194 / 400 |
| popculture | 29 | 62 / 400 |
| histoire | 36 | 54 / 400 |

194 cartes réécrites en tout, à volume constant : 5 360 cartes, 400 adultes par
catégorie, `npm run check` vert.

Ce qui reste ouvert n'a pas changé de nature : **art** garde 194 cartes de cette
famille, dont 43 dont la réponse n'apparaît nulle part ailleurs. C'est la seule
catégorie où le problème est encore structurel, et le trancher demande un choix
éditorial — réécrire environ 150 cartes, ou accepter que « qui a peint ceci ? »
reste la question centrale d'une catégorie qui s'appelle « Art & Littérature ».

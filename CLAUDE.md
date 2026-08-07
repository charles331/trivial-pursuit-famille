# Le Défi des Familles — notes pour les sessions agentiques

Jeu de quiz familial multijoueur, joué en Belgique francophone. React + TypeScript +
Vite + Tailwind v4 côté client, Express + socket.io côté serveur (`server.ts`),
déployé sur Railway. Le français est la langue du produit *et* des commentaires de
code.

## Avant de livrer

```bash
npm run check      # lint (tsc) + tests + audit des questions + build
```

`npm run check` doit passer avant tout commit. Les commandes séparées :

| Commande | Rôle |
| --- | --- |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | tests Node (`tests/*.test.ts`) |
| `npm run audit:questions` | contrat éditorial de la banque de questions |
| `npm run audit:doublons` | cartes qui reposent le même fait (analyse, non bloquante) |
| `npm run score:fun` | note de fun des cartes, en % (analyse, non bloquante) |
| `npm run score:fun -- --validate` | vérifie que le barème sépare les cartes rejetées en partie de leurs remplaçantes |

## La banque de questions a un contrat, et il est exécutable

Près de 5 500 cartes réparties en 8 catégories × 3 niveaux (`enfant`, `ado`,
`adulte`). `scripts/audit-questions.ts` **est** la spécification : volumes, unicité,
non-divulgation de la réponse, non-répétition des faits, plafonds de longueur,
budgets de formes interdites. Les détecteurs vivent dans `src/data/questionRules.ts`
et sont couverts par `tests/questionRules.test.ts`.

Voir `docs/adr/0001` (architecture éditoriale), `docs/adr/0004` (niveau ado et note
de fun) et `docs/adr/0006` (socle des niveaux jeunes) pour le *pourquoi* de chaque
règle.

### Ajouter des cartes, plutôt qu'en remplacer

Les niveaux enfant et ado ont un **plancher** de 135 cartes par catégorie, pas un
plafond : on peut donc enrichir un niveau sans sacrifier une carte saine pour chaque
carte demandée. L'audit affiche le surplus par catégorie, pour qu'un ajout reste un
geste visible. Le niveau adulte, lui, garde son compte exact de 400 QCM relus.

Un lot ajouté mélange les trois formats — QCM, Vrai/Faux, ouverte —, l'alternance
étant elle-même un critère de la note de fun. Voir
`cinemaAdoDescendantsVampire.ts` pour le modèle : un type par format, et une
fonction qui répartit la position des bonnes réponses.

Attention en revanche : une carte demandée par un joueur reste soumise au contrat.
Les vingt-sept cartes Descendants et Vampire Diaries ont demandé une vérification en
ligne de chaque fait, franchise récente comprise — c'est le seul défaut que l'audit
ne sait pas attraper — et un fait par carte, sans quoi le contrôle des formats variés
les refuse.

### Règle de conduite : ne jamais faire taire l'audit

Chaque règle de l'audit vient d'une partie réelle où une carte a gâché le jeu.
Quand `npm run audit:questions` échoue, **c'est la carte qu'on corrige, pas la
règle.** Concrètement, sont interdits :

- relâcher ou supprimer un détecteur de `questionRules.ts` pour verdir l'audit ;
- relever un plafond (`MAX_*`) pour absorber de nouvelles cartes fautives ;
- supprimer un test de `questionRules.test.ts` qui devient gênant.

Un détecteur ne se modifie que pour le rendre **plus juste** — corriger un faux
positif ou un faux négatif démontré — et alors le test qui documente le cas
s'ajoute dans le même commit. Trois exemples déjà rencontrés, tous verrouillés par
un test : `\b` ne fonctionne pas après une lettre accentuée (« composé ») ; sans
borne à droite, « la peintre » contient « a peint » ; le « qui » relatif (« la
danse qui a donné son nom ») n'est pas le « qui » interrogatif.

Si un plafond doit vraiment bouger, c'est une décision éditoriale : elle se
discute avec la personne qui tient le projet, et se documente dans un ADR.

### Ce qui rend une carte jouable

Le défaut le plus coûteux n'est pas la difficulté, c'est **l'absence de chemin de
raisonnement** — la carte qu'on sait, ou qu'on tire au sort. Signalé en partie
comme « question impossible et vraiment pas fun ».

- Interroger **l'œuvre plutôt que sa signature**. « Qui a composé La Flûte
  enchantée ? » entre quatre contemporains n'offre aucune prise ; « Qu'est-ce qu'un
  opéra ? » s'en déduit. Le nom passe dans l'énoncé : le joueur l'apprend quand
  même.
- Une carte dont l'énoncé **décrit** sa réponse est bonne, même avec quatre noms
  propres : « Quel dieu grec règne sur les mers, armé de son trident ? ». La
  description *est* le chemin. Ne pas « corriger » ces cartes.
- Jamais quatre millésimes voisins. L'année a sa place dans l'énoncé.
- Une carte de quantité ne porte pas son nombre dans l'énoncé. « Combien de joueurs
  compte une équipe de rugby à sept ? » se recopie — signalé en partie, « la réponse
  est dans la question ». Le nombre se cache sous trois formes, toutes vues :
  en lettres (« à sept »), en chiffres romains (« à XV ») et en chiffres dans un nom
  propre (« relais 4 x 100 », « Puissance 4 »). `promptGivesAwayQuantity` les refuse.
  Une quantité **déduite** de l'énoncé reste bonne, elle : « combien de temps dure un
  match de rugby à sept ? » → deux périodes de sept minutes, donc 14.
- Ancrer en Belgique et en francophonie quand le sujet est interchangeable, et
  préférer le proche dans le temps. Une carte anglo-saxonne et lointaine cumule
  les deux reproches les plus fréquents.
- Toujours un « Le saviez-vous ? » qui apprend un fait absent de l'énoncé.
- Niveaux : `enfant` ≈ jusqu'à 9 ans, `ado` **jouable vers 10-12 ans** (décision
  du propriétaire du projet), `adulte` exigeant. Aucun niveau ne se complète en
  recopiant un autre.

### Le même fait posé deux fois

Le dédoublonnage de l'audit repose sur « catégorie + bonne réponse ». Trois choses
lui échappent, et elles se voient en partie : une carte Vrai/Faux répond toujours
« Vrai » ou « Faux » et n'entre donc jamais en collision de cette façon ; une
question reformulée d'un niveau à l'autre passe, car les niveaux ne se comparent
que sur des textes identiques ; un fait posé dans les deux sens passe aussi
(« pour quel événement l'Atomium ? » et « quelle ville pour l'Exposition de
1958 ? »).

**Avant d'écrire un lot, lancer `npm run audit:doublons`** — et vérifier chaque
carte neuve contre le corpus. Sur quarante-huit cartes écrites à la main, onze
reposaient un fait déjà présent ; sur les remplaçantes, treize de plus au premier
jet.

L'audit **refuse** désormais deux cartes qui posent le même fait au même niveau et
dans la même catégorie : ce sont celles qui tombent dans la même partie, pour le
même joueur. Le rapprochement est `restatesSameFact` — recouvrement de vocabulaire
**et** réponse commune ou citée dans l'autre énoncé. La deuxième condition compte
autant que la première : sans elle, « le bébé de la vache » et « le bébé de la
grenouille » passaient pour un doublon, et une centaine de cartes saines auraient
été réécrites pour rien.

Huit paires signalées restent acceptées, listées et justifiées une par une dans
`ACCEPTED_TWIN_FACTS` (l'audit) — deux pays du même continent, une carotte et un
abricot orange. **Ajouter une entrée à cette liste est une décision éditoriale**, à
discuter avant de l'écrire.

Le report d'un niveau à l'autre est réglé : les cent quatorze cartes qui reposaient,
plus haut, un fait déjà posé plus bas sont réécrites (`crossLevelRewrites.ts`).
C'est toujours la carte du **niveau supérieur** qui cède : une carte enfant qui
demande la capitale de la France est à sa place, c'est la carte adulte qui la recopie
qui ne l'est pas.

Attention en revanche à ne pas confondre un doublon avec un **approfondissement**.
Quand la carte du haut nomme le sujet de celle du bas pour demander autre chose,
c'est l'escalier qu'on veut :

    enfant : « Quelle planète est surnommée la planète rouge ? » → Mars
    ado    : « Pourquoi Mars est-elle surnommée la planète rouge ? » → oxyde de fer

`npm run audit:doublons` compte ces paires à part et ne doit plus rien remonter
d'autre.

### Modifier des cartes

Les banques sont sous `src/data/questionBank/`, agrégées par `src/data/questions.ts`.
Pour corriger des cartes existantes sans toucher aux volumes, préférer une passe de
remplacement par identifiant — voir `adoReplacements.ts` et
`familyAdultReplacements.ts` — plutôt que d'éditer les gros lots générés.

`cardRewrites.ts` sert les passes récentes et sait aussi **changer le format** d'une
carte (`factDuplicateRewrites.ts`, `adoVariableFormats.ts`). Attention : une
conversion vers Vrai/Faux ou vers une carte ouverte ne peut viser que le niveau ado
ou enfant. Au niveau adulte elle ferait sortir la carte du quota des 400 QCM relues
par catégorie, que l'audit vérifie ; les formats variés adultes vivent dans un pool
séparé (`variableFormatPilot.ts`, `variableFormatProches.ts`).

## Le jeu est multijoueur : le tester comme tel

Plusieurs bugs ont été livrés parce qu'ils n'apparaissaient qu'à deux joueurs ou
plus : minuteur qui tourne pendant l'animation de la roue surprise, roue relancée
en phase `evaluating`, bonus invisible entre deux tours. Avant de livrer une
mécanique de jeu, se demander ce que voient **les autres** écrans, et ce qui se
passe au changement de phase et de tour.

Points de vigilance connus :

- Le dé vit dans le **repère du plateau**, comme les pions : même échelle, mêmes
  coordonnées, même caméra, même grammaire d'animation (une image-clé au sommet de
  chaque arc, une au contact, une ombre qui rétrécit avec la hauteur). Il n'a ni
  cadre ni étiquette : décision du propriétaire du projet, ADR 0005. Tout ce qui
  expliquerait le geste par du texte est à proscrire — le dé se lit à son parcours.
- Ses arêtes sont **vives**, et cela n'est pas négociable : six faces arrondies ne
  forment pas une surface fermée, et le dé se voit au travers dès qu'il se présente
  dans le plan d'une arête (ADR 0005). Son biais de repos ne porte que sur **un**
  axe : sur deux, le cube ne touche le plateau que par un sommet, et cela se voit —
  la ligne la plus basse de sa silhouette tombait à 1 % de sa largeur. Le dé se mesure sur fond magenta, en comptant
  les pixels de fond enfermés dans sa silhouette — et **à la taille du jeu** : un
  rembourrage fixe comprimait le cube à 39 px sans que rien ne se voie à 200 px.
- Il s'affiche sur tous les écrans : celui qui ne lance pas voit le même vol. La
  culbute est déjà commune sans effort — `isRollingLocally` se déclenche à
  l'arrivée de la valeur, sans condition de tour ; c'est l'affichage qui était
  réservé au lanceur. Le **parcours** l'est aussi parce qu'il ne dépend que de
  `diceThrow` (poussée + graine) retenu par le serveur : ne jamais le tirer côté
  client, les écrans divergeraient.
- La poussée du glissé vise une face **et** donne le parcours
  (`src/server/diceThrow.ts`, ADR 0005). Le client n'envoie qu'un **geste** —
  puissance et angle —, jamais un résultat, et le serveur borne les deux : toute
  nouvelle action qui dépend d'un geste doit suivre la même règle.
- `diceThrow` décrit **le lancer en cours**, et rien d'autre : tout chemin qui
  ramène en phase `rolling` doit l'effacer avec `diceValue`. La case Relancer l'a
  oublié — le dé restait posé au milieu du plateau puis sautait dans son coin au
  lancer suivant. Le client ne s'y fie plus : en phase `rolling`, il ignore la
  poussée et remet le dé dans son coin, quoi qu'ait envoyé le serveur.
- La roue surprise suit la même grammaire que le dé : le serveur retient le
  **quartier** (`surpriseWheel.slot`, décidé sur la case Surprise) et l'**instant**
  du lancer (`startedAt`, posé sur le geste du joueur). Le client ne tire rien —
  il le faisait, et deux quartiers portant le même 50/50, la roue s'arrêtait
  ailleurs selon l'écran. Elle s'affiche partout, seul le joueur actif tient les
  boutons, et tout le monde referme quand le minuteur démarre. Comme `diceThrow`,
  elle décrit *le* lancer en cours : tout chemin qui éteint `surpriseSpinThisTurn`
  doit l'effacer.
- Une transition CSS ne démarre que si sa durée existait **avant** le changement de
  valeur. React posant les deux dans le même rendu, la roue surprise sautait sur son
  quartier sans tourner — mesuré, 150° dès la cinquantième milliseconde. Pour une
  animation déclenchée par un changement d'état, passer par Motion (`animate`), et
  la mesurer : on n'anime pas ce qu'on n'a pas vu bouger dans deux images.
- Attention à `showTurnIntro` si l'on veut masquer quelque chose pendant l'écran
  « passez l'appareil » : ce drapeau ne redescend qu'au clic sur son bouton, qui
  n'existe qu'en mode local, donc il reste **vrai à jamais** en ligne. La vraie
  condition est `showPassDeviceScreen`.
- Le résultat du dé arrive **avec** la phase `moving` : tout ce qui en découle
  (cases d'arrivée, assombrissement, zoom, badge du bandeau) doit attendre que le
  dé soit posé. C'est le rôle de `isRevealingRoll`, et de `useLayoutEffect` — un
  `useEffect` laisse peindre une trame qui montre déjà le résultat.
- `src/App.tsx` monte **deux** instances de `QuestionModal` (phases `question` et
  `evaluating`). Passer de l'une à l'autre remonte le composant et réinitialise son
  état local : ce qui doit survivre au changement de phase appartient à l'état
  serveur, pas à un `useState`.
- L'état public est construit par `src/server/gameStateView.ts`, qui retire la
  solution aux clients qui ne doivent pas la voir. Toute donnée sensible ajoutée à
  `GameState` doit y être filtrée.
- Les rôles du tour (qui répond, qui lit la carte) se résolvent dans
  `src/server/turnRoles.ts`, en sautant les joueurs déconnectés.
- **L'identifiant d'un joueur *est* son identifiant de socket.** Une coupure de
  réseau lui en donne un nouveau, donc tout ce qui est indexé dessus doit se
  déplacer d'un bloc : `room.sockets`, `room.reconnectTokens`, `room.hostSocketId`,
  les lancers de `firstPlayerDraw`. C'est le rôle de `bindSeatToSocket` dans
  `server.ts` ; les trois chemins de retour (jeton de session, reprise par prénom
  dans `join-room`, fusion par l'organisateur) passent tous par là. Un seul registre
  oublié laisse un joueur visible à l'écran mais que le serveur n'autorise plus à
  agir. Le jeton de session vit dans le `localStorage` : il ne survit pas au
  changement de navigateur, d'où la reprise par prénom (`src/server/seats.ts`).

## Le nom du jeu vit dans une constante

Le jeu s'appelait « Trivial Pursuit Famille », ce qui reprenait une marque déposée
alors que le plateau et les camemberts en reprenaient déjà l'habillage. Il s'appelle
**Le Défi des Familles**, et son nom n'est plus recopié : `src/config/brand.ts` en est
la source (`GAME_NAME`, et `GAME_NAME_PARTS` pour l'affichage en deux teintes).

Quatre fichiers ne peuvent pas l'importer et le portent en clair — `index.html`,
`metadata.json`, `assets-source/*.svg` et `public/favicon.svg`. Le test de
`previewMeta` vérifie que la page servie s'accorde avec la constante, et
`npm run assets:brand` régénère les PNG après toute retouche des SVG.

En revanche, **citer le vrai Trivial Pursuit reste légitime** et ne doit pas être
« corrigé » : une carte qui demande ce qu'on réunit pour gagner au Trivial Pursuit
classique est une question de culture des jeux, et l'analyse de difficulté prend
l'édition Famille du commerce pour étalon. Ce qu'on a retiré, c'est le nom **de
notre produit**, pas les références à un jeu célèbre.

## Conventions

- Commentaires et messages de commit en français, expliquant **pourquoi** plutôt
  que quoi ; le style des fichiers existants est la référence.
- Ne jamais écrire l'identifiant du modèle dans un artefact du dépôt (commits,
  code, PR).
- Ne pas créer de pull request sans demande explicite.

# ADR 0005 — Le lancer de dé vise, mais ne commande pas

- Statut : accepté
- Date : 2026-08-06
- Portée : mécanique du lancer de dé (client et serveur)
- Révisé le 2026-08-06 : la jauge de visée est retirée, et la poussée gouverne
  aussi le parcours du dé sur le plateau (voir « Le geste se lit sur le plateau »).

## Contexte

Le dé se lance depuis toujours d'un glissé du doigt : on le tire, il s'incline, et
une jauge annonce « Puissance : 64 % ». La jauge n'a jamais rien commandé. La face
tombait d'un `Math.floor(Math.random() * 6) + 1` côté serveur, identique pour un
geste mou et pour un geste à fond.

Le propriétaire du projet, en partie : « la puissance du glissé ne peut pas être
décorative ». Le reproche est juste et il est double — la jauge promet un effet
qu'elle n'a pas, et le seul geste du jeu qui engage le corps n'engage rien.

Deux lectures possibles de la demande :

1. La force du geste habille le lancer — hauteur du saut, nombre de tours, son.
   C'est exactement le reproche : décoratif.
2. La force du geste porte le dé plus ou moins loin, donc influence la face.

## Décision

**La force du geste vise une face ; le hasard garde le dernier mot.**

Un geste au ras du seuil vise le 1, un geste à fond vise le 6. La face visée n'est
pas la face obtenue : chaque face reçoit un poids selon son écart, en crans, avec
la visée (`WEIGHT_BY_DISTANCE = [5, 4, 2, 1, 1, 1]` dans
`src/server/diceThrow.ts`). En pratique :

| Geste | Face visée | Elle sort | Espérance |
| --- | --- | --- | --- |
| au ras du seuil | 1 | 36 % | 2,4 |
| à mi-course | 4 | 28 % | 3,8 |
| à fond | 6 | 36 % | 4,6 |

Trois propriétés tenaient lieu de cahier des charges, et chacune est verrouillée
par un test de `tests/diceThrow.test.ts` :

- **la face visée est toujours la plus probable** — sinon la jauge mentirait ;
- **aucune face n'est jamais impossible** — un geste à fond peut encore donner un
  1, comme un dé qui rebondit sur le bord de la table ;
- **la visée ne dépasse jamais 40 %** — au-delà, le dé se pilote.

### Ce qui a été écarté

**Le pilotage complet** (la face visée sort toujours). Sur un plateau où l'on
choisit déjà entre deux destinations, viser sa case à coup sûr vidait le lancer de
tout enjeu : on ne tire plus un dé, on se déplace. La table l'aurait vu au
deuxième tour.

**Le repli sur le bord** (un écart qui sort du dé se réfléchit : viser 6 et forcer
donne 5). Essayé, puis abandonné : replié, viser le 1 donnait un 2 **plus souvent**
qu'un 1, et la première propriété tombait. Tronquer était pire — viser le 6 le
donnait deux fois sur trois. D'où la pondération de toutes les faces, qui
redistribue au lieu de replier.

**L'application au tirage du premier joueur** (ADR 0003). Ce tirage est une
loterie : le plus haut score ouvre la partie. Si le geste vise, tout le monde
glisse à fond et le tirage se joue au départage. Le dé du tirage reste donc un dé
nu, et sa jauge est masquée — une jauge qui n'engage rien serait le défaut qu'on
vient de corriger (`aimedThrow` sur `Dice3D`).

## Conséquences

- Le client n'envoie **qu'une puissance**, jamais une face : `roll-dice` transporte
  `power`, le serveur reste seul juge. La puissance arrive du réseau, elle est donc
  bornée à 0-100 et un `power` absent, non numérique ou sous le seuil de geste
  retombe sur un tirage au sort — c'est le cas de l'appui simple.
- Un appui simple reste un lancer valide, au hasard. Personne n'est obligé
  d'apprendre le geste, et un enfant qui tapote n'est pas pénalisé : il joue au dé
  nu, d'espérance 3,5.
- Rien de tout cela ne s'écrit à l'écran : voir la révision ci-dessous.
- `expectedFace()` existe pour régler `WEIGHT_BY_DISTANCE` sans lancer dix mille
  dés. Si le réglage doit bouger — dé plus docile ou plus sourd au geste — c'est
  cette table qu'on touche, et les trois propriétés ci-dessus qui arbitrent.

## Révision — Le geste se lit sur le plateau, pas dans une étiquette

Première version livrée : une jauge annonçait la face visée pendant le glissé
(« Visée : 4 »), et le dé sautait sur place dans un cadre posé au coin du
plateau. Trois reproches du propriétaire du projet, tous justes :

1. « Je vois "visé 6" mais je vois pas pourquoi ça doit être écrit, je sais même
   pas pourquoi c'est écrit. » La jauge expliquait la mécanique au lieu de la
   faire sentir. Un dé ne s'annonce pas, il roule.
2. « Je veux pas d'encadré autour du dé, il est présent à droite. » Le fond sombre
   et sa bordure servaient à détacher le dé des pastilles de couleur ; ils le
   posaient *au-dessus* du plateau au lieu de *sur* le plateau.
3. « J'aimerais que le dé roule sur le plateau de manière aléatoire aux mêmes
   niveaux que les pions en 3D pour ne vraiment pas avoir de différence », et
   « on le voit se déplacer de manière aléatoire mais directement lié à la
   poussée que l'utilisateur a fait ».

### Ce qui change

**La jauge disparaît.** Aucun texte n'annonce plus la visée. Le seul retour du
geste est le dé lui-même : il s'incline sous le doigt, puis part plus ou moins
loin selon la poussée.

**Le cadre disparaît.** Le dé n'a plus ni fond ni bordure. Ce qui le rend lisible
sur les pastilles de couleur, c'est désormais son ombre de contact — la même
solution que les pions, et non un panneau.

**Le dé rejoint le repère du plateau.** Il vit dans la couche des pions, à leur
échelle exacte (`Math.max(30, Math.min(68, boardPx * 0.1))`), en coordonnées de
plateau, sous la même transformation de caméra, avec la même grammaire
d'animation : une image-clé au sommet de chaque arc et une au contact, une ombre
qui rétrécit avec la hauteur, un choc sonore par rebond comme le pion fait un pas
par case. Il attend en `DICE_REST` (886, 886), hors du feutre, là où l'on pose un
dé à côté d'un plateau.

**Le parcours vient de la poussée.** Le client envoie l'angle du geste en plus de
sa puissance ; le serveur les borne, tire une graine et range les trois nombres
dans `diceThrow`. Chaque écran en déduit le même vol (`describeFlight`) : même
direction, même distance, mêmes rebonds, même culbute. La poussée gouverne donc
la distance (210 à 770 unités de plateau) et la direction ; la graine ne donne
que le grain — un écart d'angle de ±11°, le nombre de tours.

Le dé rebondit sur le bord du feutre au lieu d'y être bloqué : poussé vers son
propre coin, il revient en jeu. Et il reste là où il tombe pendant que le résultat
s'affiche — le ramener dans son coin effaçait le lancer qu'on venait de voir.

**La caméra lâche prise pendant le lancer.** Zoomée à 1,45 sur le pion, elle
sortait du cadre le coin où le dé attend — impossible de le saisir — puis la
moitié de son parcours. Le zoom garde tout son sens au moment du choix de la
destination, qui est la question qu'il aide à lire.

### Ce que cela ne change pas

La face reste décidée par le serveur, à partir de la seule puissance, selon la
pondération inchangée ci-dessus. Le parcours est de la mise en scène : il rend la
poussée visible, il ne la juge pas. Un dé dont la trajectoire déciderait de la
face serait une autre mécanique — et le client, qui connaît la trajectoire avant
le serveur, pourrait alors la choisir.

Le tirage du premier joueur garde un dé nu qui saute sur place : il se joue dans
un modal, sans plateau sous lui, et reste une loterie (`flight` absent).

## Révision — Le relief du dé était faux, et mesurable

Signalé par le propriétaire du projet : « l'effet 3D semble pas cohérent mais je
ne suis pas sûr ». Il l'était. Quatre défauts, tous chiffrés au banc sur un dé
grossi à 180 px.

**1. Le cube se peignait en entier.** Les six faces portaient
`backface-visible` (utilitaire Tailwind v4 : `backface-visibility: visible`).
Au repos, une seule face était tournée vers la caméra, et pourtant six étaient
dessinées : la face avant en 191 × 191 px, celle qui nous tournait le dos en
171 × 171 px juste derrière, et les quatre autres en bandes de 10 px — soit un
contour fantôme aux coins vifs autour d'une face arrondie. Corrigé par
`backface-hidden` : seules les faces tournées vers nous se peignent, vérifié sur
huit images de culbute (jamais une face de dos).

**2. La face gagnante était présentée pile de face**, donc le cube se réduisait à
un carré : aucun relief, aucun dessus, aucun côté. Un biais de repos
(`REST_TILT`, −17° et 21°) montre désormais la face du dessus et une face
latérale. Trois faces tournées vers la caméra pour les six valeurs, vérifié.

**3. Les six faces partageaient un seul matériau.** Trois faces de teinte
identique qui se rejoignent à un coin se lisent comme un hexagone plat. Chaque
face reçoit maintenant un voile calculé à partir de sa normale et d'une lumière
fixe dans le repère de l'écran (`faceShade`).

La direction de cette lumière a demandé un second essai. Venue d'en haut, elle
rendait le *dessus* du dé plus clair que sa valeur — voile de 0,08 contre 0,27 —
ce qui revient à éclairer un dé posé à plat comme s'il était debout contre un
mur. Le plateau est horizontal et on le regarde de dessus : la face qui porte la
valeur est celle tournée vers le ciel, donc la lumière vient surtout **de face**.
Après correction, la valeur est la face la plus éclairée pour les six valeurs.

Le voile est figé pendant la culbute (ton unique) : `rotation` est l'orientation
visée, pas celle affichée, et recalculer six voiles à chaque image coûterait
soixante rendus par seconde sur un téléphone. Les arêtes suffisent à séparer les
faces d'un cube qui file, et l'éclairage juste revient en fondu de 240 ms dès que
le dé se pose.

**4. Le rayon des coins ne suivait pas la taille.** `rounded-2xl` vaut 16 px quelle
que soit la taille : 9 % d'une face de 180 px dans le modal du tirage, mais 41 %
d'une face de 39 px en partie. Le dé du plateau — celui qu'on regarde à chaque
tour — se lisait comme une pastille ovale. Le rayon vaut désormais 11 % de la
taille du dé.

### Un tour de trop à l'atterrissage

L'inclinaison de repos a révélé une hypothèse cachée du calcul de rotation.
L'ancien code ramenait l'angle accumulé au multiple de 360 inférieur avant
d'ajouter l'orientation voulue, ce qui suppose cette orientation entre 0 et 360°.
Avec un biais négatif (−17°), le dé posé repartait d'un tour complet en arrière :
mesuré en situation, il tournait encore une seconde après avoir touché le
plateau. `settleTo` prend désormais le plus court chemin vers l'orientation
voulue, quel que soit le nombre de tours déjà accumulés. Le dé s'immobilise
183 ms après la fin du vol, le temps que son dernier rebond s'amortisse.

## Révision — Un cube ne se voit pas au travers

Signalé par le propriétaire du projet : « les coins du cube sont arrondis, ce qui
provoque un effet de transparence et on voit au travers du cube. Ce n'est pas le
but. » C'est le biais de repos de la révision précédente qui a rendu le défaut
visible : de face, un carré ne montre rien de ses arêtes ; de biais, il montre
tout.

Protocole de mesure, réutilisable : le dé est posé sur un fond magenta pur, et
l'on compte les pixels de fond **enfermés dans sa silhouette**. La silhouette
projetée d'un cube étant un hexagone convexe, tout pixel de fond situé entre le
premier et le dernier pixel du dé sur une même ligne est vu à travers lui.

### Deux causes, dont une qui n'avait rien à voir avec les coins

**Six faces arrondies ne forment pas une surface fermée.** Le congé de l'arête
manque. De face, cela ne fait qu'une échancrure de quelques pixels aux sommets ;
vu dans le plan d'une arête — ce qui arrive à chaque culbute — le congé absent
devient une large bande. Mesuré : 11 718 pixels de fuite sur les seize images
d'une culbute, dont 850 sur une seule image, et jusqu'à 15 724 sur l'image la
plus rasante. Ni le noyau opaque ni le débord des faces n'y changent grand-chose :
seule une surface réellement fermée y parvient, donc **des arêtes vives**. Le
liseré doré et l'ombre interne suffisent à suggérer le biseau. Après : 7 pixels
sur les seize images.

**Le rembourrage fixe de la zone de préhension comprimait le cube.** `p-4`, seize
pixels, quelle que soit la taille : pour un dé de 39 px la zone fait 62 px, moins
32 px de rembourrage, soit 30 px de contenu pour un cube de 39. Le flex le
comprimait donc, tandis que `translateZ` continuait de placer les faces à 19,5 px
du centre : les faces latérales sortaient de la face avant et laissaient une fente
de 4,7 px, par laquelle on voyait le plateau. À 200 px, la même zone laissait 288
px de contenu, le cube n'était pas comprimé, et le défaut n'existait pas — d'où
une fuite mesurée dix fois plus grande en jeu qu'au banc. Le rembourrage est
désormais proportionnel, et le cube porte `shrink-0`.

Ce défaut était latent depuis toujours ; il n'est apparu qu'en posant le dé sur le
plateau, à 39 px. Toute mesure de rendu doit donc se faire **à la taille du jeu**,
pas seulement sur un dé grossi.

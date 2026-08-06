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

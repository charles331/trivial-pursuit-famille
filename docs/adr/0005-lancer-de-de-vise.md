# ADR 0005 — Le lancer de dé vise, mais ne commande pas

- Statut : accepté
- Date : 2026-08-06
- Portée : mécanique du lancer de dé (client et serveur)

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
- La jauge annonce désormais la face visée (« Visée : 4 ») et non un pourcentage
  sans suite.
- `expectedFace()` existe pour régler `WEIGHT_BY_DISTANCE` sans lancer dix mille
  dés. Si le réglage doit bouger — dé plus docile ou plus sourd au geste — c'est
  cette table qu'on touche, et les trois propriétés ci-dessus qui arbitrent.

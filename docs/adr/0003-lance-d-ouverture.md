# ADR 0003 — Le lancé d'ouverture décide qui commence

- Statut : accepté
- Date : 2026-07-29
- Portée : passage du salon au premier tour

## Contexte

`start-game` fixait `activePlayerIndex = 0`, et le joueur d'indice 0 est
l'organisateur du salon. Le premier tour — qui vaut un camembert d'avance —
était donc un privilège de créateur, jamais discuté et jamais gagné.

## Décision

Le bouton de l'hôte n'ouvre plus la partie mais un **lancé d'ouverture** : une
phase `opening_roll` où chaque joueur lance un dé une fois. Le plus haut score
ouvre la partie, et `activePlayerIndex` n'est fixé qu'à ce moment-là.

En cas d'égalité, seuls les joueurs à égalité relancent, autant de manches que
nécessaire. Les joueurs écartés du départage le lisent explicitement à l'écran :
la liste se réduisant aux seuls joueurs à égalité, ils se voyaient sinon
simplement disparaître.

En ligne, chacun lance pour soi, quand il veut — tous ceux qui n'ont pas encore
lancé sont attendus en parallèle. En pass & play, l'hôte lance pour chaque siège
à son tour, l'écran indiquant à qui passer l'appareil.

L'hôte reste celui qui ferme le salon : quelqu'un doit décider que tout le monde
est là. Mais il ne décide plus qui commence.

Les règles vivent dans `src/server/openingRoll.ts`, en fonctions pures : le
hasard et les sockets restent dans `server.ts`, et le départage se teste sans
salon ni réseau.

## Conséquences

- Une partie à un seul joueur saute le lancé : il n'y a rien à départager.
- Un départ ne doit pas figer la partie sur un jet qui n'arrivera jamais, mais
  une absence passagère ne doit pas coûter sa place. Les absents ne sont donc
  écartés que **lorsqu'il ne reste plus qu'eux à lancer** : tant qu'un joueur
  présent doit encore lancer, la place de l'absent lui est gardée. Purger dès la
  déconnexion éliminait un joueur pour un simple rafraîchissement de page — et
  iOS reconnecte au moindre passage en arrière-plan.
- Le serveur réattribue `player.id` à la reconnexion. Le lancé étant indexé sur
  ces identifiants, `remapOpeningRollId` les reporte, sans quoi le revenant
  perdait son jet — et le lancé restait bloqué s'il était le dernier attendu.
- Un second appui sur le dé ne rejoue pas un jet déjà enregistré.
- `openingRoll` est optionnel dans `GameState` : les parties sauvegardées avant
  son introduction se rechargent sans lui.

# ADR 0003 — Le premier joueur est désigné par un lancer de dés

- Statut : accepté
- Date : 2026-07-30
- Portée : lancement d’une partie (`start-game`), phase `first_player_roll`

## Contexte

Le créateur du salon ouvrait la partie d’office : `start-game` posait
`activePlayerIndex = 0`, et l’organisateur occupe toujours la première place de
la table. Commencer est un avantage réel — un tour de plus, et l’accès aux
premières cases camembert avant les autres. Cet avantage revenait donc toujours
à la même personne, celle qui tient le téléphone.

## Décision

Une phase de jeu s’intercale entre le salon et le premier tour :
`lobby → first_player_roll → rolling`.

Chaque joueur y lance le dé **une seule fois**. Le plus haut résultat ouvre la
partie ; à égalité, c’est le lancer **le plus rapide** qui l’emporte, et si deux
lancers sont identiques jusqu’au dixième de seconde, le premier arrivé au
serveur tranche. Seul le point de départ du tour de table bouge : l’ordre des
joueurs, lui, ne change pas.

### « Le plus rapide » se mesure par joueur

Le temps de réaction est compté à partir du moment où le joueur a réellement pu
lancer, ce qui n’est pas le même instant selon le mode de jeu :

- **en ligne**, tout le monde lance en même temps : l’origine est l’ouverture du
  tirage ;
- **en pass & play**, les joueurs se passent le même appareil : l’origine est le
  lancer précédent. Avec une origine commune, le premier à saisir le téléphone
  aurait gagné toutes les égalités par construction.

L’organisateur lance pour chaque joueur local à son tour, dans l’ordre de la
table ; en ligne, chacun lance pour lui-même. Le chronomètre affiché à l’écran
est indicatif : celui qui fait foi est mesuré sur le serveur, à la réception du
lancer.

### Le tirage ne peut pas bloquer la partie

Une phase qui attend tout le monde est une phase qui se bloque. Trois garde-fous
la referment :

- un joueur **déconnecté** n’est plus attendu ; si les présents ont tous lancé,
  le tirage se tranche aussitôt ;
- un joueur **qui quitte** emporte son lancer avec lui ;
- l’organisateur peut **départager sans attendre** les joueurs silencieux, dès
  qu’un lancer au moins a été enregistré.

À l’inverse, une **reconnexion** — un simple rafraîchissement de page — conserve
le lancer déjà effectué : il suit le joueur vers son nouvel identifiant de
socket, qui n’a donc pas à relancer.

Une partie **solo** saute le tirage : il n’y a rien à départager.

## Conséquences

- Le dé du tirage est lancé par le serveur, comme celui du jeu : le client ne
  choisit ni sa valeur ni son horodatage. Un second lancer est refusé, ce qui
  interdit de relancer jusqu’à obtenir le 6 qui arrange.
- `GameState` porte un `firstPlayerDraw` (lancers, temps, vainqueur) qui reste
  disponible après le tirage : il alimente le bandeau du premier tour, qui
  explique en une phrase pourquoi ce joueur commence.
- La règle est écrite là où on la cherche : dans le salon avant de lancer, sur
  l’écran du tirage, et dans les règles du jeu accessibles en partie.

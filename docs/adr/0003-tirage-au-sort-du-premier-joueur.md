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

Chaque joueur y lance le dé **une seule fois**, et le plus haut résultat ouvre la
partie. Seul le point de départ du tour de table bouge : l’ordre des joueurs,
lui, ne change pas.

L’organisateur lance pour chaque joueur local à son tour, dans l’ordre de la
table ; en ligne, chacun lance pour lui-même.

### Les égalités se départagent différemment selon le mode

Reste à trancher les égalités, et la réponse dépend de la façon dont on lance :

- **en ligne**, tout le monde lance en même temps depuis son propre appareil.
  Le temps de réaction est une vraie course : le plus rapide l’emporte. Il est
  compté depuis l’ouverture du tirage, sur l’horloge du serveur ; le chronomètre
  affiché à l’écran n’est qu’indicatif.
- **en pass & play**, les joueurs se passent le même téléphone et lancent chacun
  leur tour. Le chronomètre du suivant tourne pendant qu’on lui tend l’appareil :
  il mesure la transmission, pas un réflexe, et pénalise mécaniquement tous ceux
  qui ne lancent pas en premier. Le sort tranche donc à sa place, par un tirage
  aléatoire attaché à chaque lancer.

Si deux lancers restent à égalité même après ce départage, le premier arrivé au
serveur l’emporte.

En pass & play, aucun temps n’est affiché — ni le chronomètre pendant le lancer,
ni la durée dans le tableau des lancers. Montrer une mesure qui ne décide de
rien inviterait à contester le résultat.

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
  choisit ni sa valeur, ni son horodatage, ni son tirage de départage. Un second
  lancer est refusé, ce qui interdit de relancer jusqu’à obtenir le 6 qui
  arrange.
- `GameState` porte un `firstPlayerDraw` (lancers, temps, hasard, vainqueur) qui
  reste disponible après le tirage : il alimente le bandeau du premier tour, qui
  explique en une phrase pourquoi ce joueur commence.
- La règle est écrite là où on la cherche — dans le salon avant de lancer, sur
  l’écran du tirage, et dans les règles du jeu accessibles en partie — et elle
  est formulée selon le mode de la partie, puisque le départage en dépend.

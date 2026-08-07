# ADR 0007 — Le plateau se dérive des catégories choisies

- Statut : accepté
- Date : 2026-08-07
- Portée : `src/data/boards.ts`, état de la partie, plateau et pions côté client

## Contexte

Signalé par le propriétaire du projet : « je peux normalement choisir dans les
paramètres les catégories que je veux voir sur le plateau, mais ça ne fonctionne pas.
Je peux sélectionner ce que je veux, les catégories de base restent sur le plateau. »

L'analyse (`docs/analyse-choix-des-categories.md`) a montré que le réglage ne
fonctionnait pas *presque* : `selectedCategories` n'était lu qu'à un seul endroit,
comme repli pour les cases dépourvues de catégorie. Il y en a une par plateau — la
case centrale — et aucune sur le serpentin. Le réglage changeait donc une case sur 43,
ou rien du tout.

La cause était structurelle : les catégories étaient une constante de module et
`BOARD_PRESETS` un objet **statique**, construit au chargement, donc avant qu'un
salon existe. Serveur et clients lisaient tous ce même objet.

Deux conséquences dépassaient le réglage. Pop Culture et Gastronomie n'avaient aucune
case sur aucun plateau : 1 364 cartes, un quart de la banque, ne pouvaient sortir que
sur la case centrale. Et le porte-camemberts du pion avait six emplacements dans un
ordre figé sur les mêmes six catégories, si bien qu'un camembert gagné ailleurs
n'aurait eu nulle part où s'afficher.

## Décision

**Le plateau devient une fonction pure des réglages** : `buildBoard(boardType,
categories)`. Le serveur et chaque écran en dérivent le même plateau à partir de la
même liste — c'est la grammaire déjà retenue pour le parcours du dé et pour la roue
surprise (ADR 0005) : une donnée décidée en un seul endroit, dérivée partout de la
même manière, jamais tirée localement.

**La liste vit dans l'état de la partie, pas dans les réglages.** Elle se fige au
lancement (`gameState.boardCategories`) parce que l'hôte peut encore modifier les
réglages du salon : une partie en cours ne doit pas voir ses cases changer de
catégorie sous elle.

**Six catégories, exactement six** — décision du propriétaire du projet. La roue a
six branches, le camembert six parts, le porte-camemberts six emplacements. On peut
descendre sous six le temps de composer sa sélection, le compteur passe alors à
l'orange et le bouton de lancement annonce « choisissez 6 catégories » ; le serveur
refuse de lancer, car c'est lui qui construit le plateau.

**Tout ce qui montrait les six catégories les reçoit désormais** : les cases, les
secteurs colorés du fond, les parts du médaillon central, la légende, le
porte-camemberts des pions et le badge de camemberts. Un seul de ces éléments resté
en dur et l'écart se verrait immédiatement.

## Un défaut trouvé en route : un plateau ingagnable

En vérifiant que chaque catégorie choisie recevait bien ses cases, il est apparu que
le Circuit Familial Express posait une case camembert **toutes les cinq cases**, soit
cinq cases pour six catégories. Il en manquait donc toujours une, et une partie en six
camemberts y était **ingagnable** — sauf à décrocher un joker camembert sur une case
de la bonne catégorie, ce qui suppose les bonus activés et de la chance.

Le défaut était invisible parce que la catégorie orpheline était toujours la première
de la liste, l'histoire, qu'on gagne d'ordinaire ailleurs. Les six cases camembert
sont maintenant réparties sur le trajet et chacune porte la catégorie de son rang, ce
qui garantit que les six soient gagnables. Un test le verrouille, sur les trois
plateaux.

## Conséquences

- Les 1 364 cartes de Pop Culture et de Gastronomie deviennent jouables : il suffit
  de les choisir dans le salon.
- `BOARD_PRESETS` reste la forme par défaut — aperçu du salon, tests de topologie —
  mais une partie ne s'y réfère plus.
- Une sélection incomplète (salon repris du disque, version antérieure) est complétée
  dans l'ordre par défaut par `resolveBoardCategories`, la même fonction des deux
  côtés : deux écrans ne peuvent pas en déduire deux plateaux différents.
- La forme du plateau est inchangée : mêmes identifiants, mêmes coordonnées, mêmes
  liens. Seule la catégorie des cases suit la sélection, ce qu'un test vérifie —
  sinon les chemins calculés par le serveur et ceux animés par le client cesseraient
  de correspondre.

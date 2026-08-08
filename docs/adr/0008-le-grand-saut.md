# ADR 0008 — Le Grand saut : un bonus qui se joue sur le plateau

- Statut : accepté
- Date : 2026-08-08
- Portée : bonus de la roue surprise, phase de déplacement (client et serveur)

## Contexte

La roue surprise comptait six quartiers : trois 50/50, un Joker camembert, deux
vides. Demandé par le propriétaire du projet : « analyse pour trouver un 3ᵉ bonus
fun et amusant ».

Les deux bonus existants agissent tous deux sur la **carte** — l'un retire des
mauvaises réponses, l'autre transforme une bonne réponse en camembert. Un
troisième du même genre aurait épaissi la même corde. Trois pistes ont été
présentées ; celle retenue est la seule qui agisse sur le **plateau**.

Ce qui a été écarté, et pourquoi :

- **Une deuxième chance** (la première mauvaise réponse ne compte pas). La moins
  chère à écrire, mais au ressenti c'est un 50/50 déguisé — on retire encore des
  options —, et la roue en compte déjà trois sur six.
- **Désigner quelqu'un pour répondre à sa place.** Très familial, mais en mode
  lecteur le lecteur voit la solution : lui déléguer donnerait une bonne réponse
  automatique. Reporté, pas abandonné.
- **Voler un camembert à un autre joueur.** Mécaniquement bon, humainement non
  à une table où joue une enfant de neuf ans.
- **Révéler le « Le saviez-vous ? » comme indice.** Presque gratuit, mais
  l'explication contient souvent la réponse — « La Liffey divise le centre de
  Dublin… ». Inutilisable tel quel.
- **Un vote de la famille.** Bloque dès qu'un joueur est déconnecté, et ne fait
  rien du tout à un seul appareil qu'on se passe — exactement l'écart entre le
  salon et la partie relevé dans `docs/audit-modes-de-jeu.md`.

## Décision

**Le Grand saut double le dé qui vient de tomber, et rouvre le choix de la
destination.** Il s'utilise en phase `moving`, une fois le dé posé.

Trois points qui ne se devinent pas :

**Le dé garde sa face.** On aurait pu afficher 8 sur un cube à six faces, ou le
faire rouler une seconde fois : l'un ment sur l'objet, l'autre rejouerait le
hasard qu'on vient justement de retirer du geste (ADR 0005). Le nombre de pas est
annoncé à part, et le plateau le dit en toutes lettres.

**Il prend l'un des deux quartiers vides, pas un des trois 50/50.** La roue
promet un lot deux fois sur trois, et il fallait garder cette promesse. Le 50/50
est par ailleurs le seul lot utile sur toutes les cartes : le rendre aussi rare
que les deux autres l'aurait dévalué.

**Un seul saut par tour.** Deux jetons quadrupleraient le dé et le pion
traverserait le plateau d'un bout à l'autre.

## Est-ce que ça sert vraiment ?

La promesse — « atteindre la case camembert qu'on vise depuis trois tours » — se
mesure. Sur chaque case de départ des trois plateaux, pour chacune des six faces :

| | roue | classique | serpent |
| --- | --- | --- | --- |
| ouvre au moins une case neuve | 100 % | 100 % | 100 % |
| ouvre une case camembert | 22 % | 22 % | 32 % |
| ouvre le centre, donc la victoire | 14 % | 14 % | 3 % |
| **aucun camembert n'était atteignable, le saut en met un à portée** | **30 %** | **30 %** | **34 %** |

La dernière ligne est celle qui compte : c'est le moment « j'y suis presque »,
et le saut le débloque une fois sur trois. Le reste du temps il fait ce qu'un
déplacement fait — il change la case, donc la catégorie, donc la question.

## Conséquences

- Premier bonus qui ne se dépense pas depuis la carte. Il lui faut donc son
  propre bouton, dans le sélecteur de destination, et sa propre garde de phase :
  `useLeapBonus` est séparée de `useBonus`, qui exige une question en cours.
- `bigLeapThisTurn` décrit **ce** déplacement, comme `diceThrow` décrit **ce**
  lancer : tout chemin qui ramène en phase `rolling` doit l'effacer, la case
  Relancer comprise.
- Le bouton n'appartient qu'au joueur actif, mais le résultat s'affiche partout —
  sinon les autres verraient le pion partir deux fois plus loin sans comprendre
  pourquoi, et surtout deux écrans proposeraient des destinations différentes.
  Le doublement est calculé par le serveur, jamais côté client.
- L'habillage des bonus (emoji, nom, couleur du quartier) est désormais une
  table unique, `BONUS_LOOK`. Il était recopié en ternaires à quatre endroits ;
  en oublier un donnait un quartier blanc sans emoji, indiscernable d'une case
  vide.

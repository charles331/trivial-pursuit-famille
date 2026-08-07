# Audit des modes de jeu : ce que le salon promet, ce que la partie fait

Demandé par le propriétaire du projet après la correction du choix des catégories :
« vérifie tous les modes de jeu pour voir s'il n'y a pas de failles entre la
configuration et la réalité ».

Neuf réglages, chacun suivi de l'interface jusqu'à son effet en partie, par la mesure
plutôt que par la lecture. Quatre écarts trouvés, trois corrigés, deux comportements
volontaires documentés parce qu'ils ne se devinent pas.

## Ce qui est juste

| Réglage | Vérification |
| --- | --- |
| Type de plateau | Les trois plateaux se dérivent des catégories choisies, la topologie est inchangée. |
| Catégories | Seules les six choisies sont posées, sur les trois plateaux. |
| Niveau du joueur | Sur 600 tirages par niveau, **aucune** carte d'un autre niveau. |
| Catégorie de la case | Sur 600 tirages, **aucune** carte hors catégorie. |
| Chrono à zéro | Le décompte ne démarre pas, et rien ne se soumet tout seul. |
| Camemberts pour gagner | 4 ou 6, tous deux atteignables : chaque catégorie a sa case camembert. |
| Part des formats variés | Visée 20 %, mesurée 19 % sur des parties de 20 à 80 tours. |
| Thèmes IA | Une carte sur trois au plus, et seulement si elle colle à la case et au niveau. |

Un mot sur la part des formats variés : mesurée sur 900 tirages d'affilée elle
grimpait à 91 %, ce qui a d'abord ressemblé à un défaut. C'était le régime
d'épuisement — le réservoir de vrai/faux se recycle quand tout a été vu. Sur une durée
de partie réaliste, la part tenue est bien celle annoncée. **Une mesure hors des
conditions du jeu ne prouve rien.**

## Écart 1 — Une catégorie inconnue faisait planter le plateau *(corrigé)*

`selectedCategories` arrive du client, et `update-settings` fusionnait le message tel
quel. Une catégorie inventée traversait `resolveBoardCategories`, se posait sur sept
cases, et le rendu échouait sur `CATEGORIES[tile.categoryId].color` — mesuré, « Cannot
read properties of undefined (reading 'color') ».

Non atteignable depuis l'interface, qui ne propose que les huit vraies catégories.
Mais c'est exactement pourquoi personne ne s'en apercevrait : il suffisait d'un client
obsolète, ou d'un salon repris du disque après le retrait d'une catégorie.
`resolveBoardCategories` écarte désormais tout identifiant inconnu.

## Écart 2 — Le mode lecteur sans lecteur possible *(corrigé)*

Le mode lecteur masque la carte au joueur actif : c'est tout son intérêt. Mais rien ne
vérifiait qu'il y ait quelqu'un pour la lire. En partie solo, ou dès que tous les
autres joueurs s'étaient déconnectés, le joueur actif restait devant « Option A /
Option B / Option C / Option D » sans énoncé et sans personne pour le lui lire. Sans
chrono, le tour ne pouvait plus avancer que par un choix à l'aveugle.

Les cartes ouvertes avaient déjà leur filet — un bouton « passer la question »,
comptée manquée — mais les QCM et les Vrai/Faux n'en avaient aucun. Trois corrections :

- la carte ne se masque que si un lecteur est résolu, sinon elle s'affiche
  normalement, comme hors mode lecteur ;
- l'écran « passez l'appareil » ne s'ouvre plus quand il n'y a personne à qui le
  passer — une partie solo en mode lecteur affichait « Passez l'appareil à Papa »
  alors que Papa le tenait déjà ;
- le tirage ne sert plus de carte ouverte s'il n'existe aucun lecteur, plutôt que d'en
  servir une que le joueur n'a qu'à passer.

## Écart 3 — Les réglages n'étaient pas validés *(corrigé)*

`update-settings` fusionnait n'importe quoi, sans borne et sans garde de phase :

- `wedgesToWin: 99` → partie ingagnable ;
- `timerSeconds: -5` → décompte cassé ;
- réglages modifiables **en pleine partie**, le nombre de camemberts compris.

Aucune de ces valeurs n'est atteignable par l'interface. Le point d'entrée est
désormais validé clé par clé — type de plateau connu, durée parmi celles proposées,
camemberts entre 1 et 6, catégories connues et dédoublonnées — et refusé hors du
salon. Une clé absente reste absente : on ne réécrit jamais un réglage que l'hôte n'a
pas touché.

## Comportement 1 — Les cartes ouvertes n'existent qu'en mode lecteur *(voulu)*

Mesuré : **0 %** de cartes ouvertes hors mode lecteur, contre 8 à 10 % avec. C'est
délibéré et nécessaire — hors mode lecteur, le serveur n'envoie la réponse à personne,
donc personne ne peut juger une réponse orale.

Mais rien ne le dit dans le salon, et la conséquence est lourde : **66 cartes** (24 au
niveau ado, 42 au niveau adulte) sont invisibles dans le mode par défaut, dont les huit
cartes ouvertes de Descendants et Vampire Diaries écrites à la demande. Qui veut les
trois formats doit activer le mode lecteur — ou la caméra, qui l'implique.

C'est le seul écart restant entre ce que le salon laisse espérer et ce qu'il donne. Le
corriger demanderait une décision : soit le dire dans l'interface, soit permettre au
joueur actif de juger sa propre réponse hors mode lecteur, ce qui suppose de lui
confier la solution — donc de lui faire confiance.

## Comportement 2 — Les cases Surprise sans les bonus *(mineur)*

Bonus désactivés, une case Surprise reste étiquetée « Surprise », gardant sa couleur et
son icône, et se comporte comme une case catégorie ordinaire. Rien ne casse, mais la
case promet quelque chose qui n'arrive pas.

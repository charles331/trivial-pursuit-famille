# Le choix des catégories ne change pas le plateau — analyse

Signalé par le propriétaire du projet : « je peux normalement choisir dans les
paramètres les catégories que je veux voir sur le plateau, mais ça ne fonctionne pas.
Je peux sélectionner ce que je veux, les catégories de base restent sur le plateau. »

Le constat est exact, et le réglage ne fonctionne pas *presque* : il ne fonctionne
pratiquement pas du tout.

## Ce que le réglage fait réellement

`settings.selectedCategories` existe, l'interface l'écrit, le serveur le conserve et
le diffuse à tous les clients. Il n'est lu qu'à **un seul endroit** de tout le code
(`server.ts`, tirage de la question) :

```ts
const categoryId = tile.categoryId
  || validCategories[Math.floor(Math.random() * validCategories.length)];
```

Le réglage ne sert donc que de **repli**, pour les cases qui n'ont pas de catégorie.
Or presque toutes en ont une. Mesuré sur les trois plateaux :

| Plateau | Cases | Cases sans catégorie |
| --- | --- | --- |
| Roue Classique 6 Branches | 43 | **1** (la case centrale) |
| Circuit Familial Express | 30 | **0** |
| Étoile des Champions | 37 | **1** (la case centrale) |

Le réglage change donc la catégorie d'**une case sur 43** sur la roue, et
d'**aucune** sur le circuit familial. C'est pour cela qu'il donne l'impression de ne
rien faire : il ne fait rien de visible.

## La cause

`src/data/boards.ts` porte une constante de module :

```ts
const CATEGORIES_LIST: CategoryId[] = [
  'histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports'
];
```

Les trois générateurs de plateau la lisent directement, et `BOARD_PRESETS` est un
objet **statique**, construit au chargement du module — donc avant qu'un salon
n'existe. Le serveur et chaque client lisent tous ce même objet
(`BOARD_PRESETS[settings.boardType]`). Un plateau ne peut structurellement pas
dépendre d'un réglage de salon : il est calculé une fois pour toutes.

L'interface, elle, ne mentait pas à moitié : elle laisse cocher, décocher, et affiche
fidèlement « 6/6 ». Elle promet donc quelque chose que le plateau ne lit jamais.

## Deux conséquences qui vont plus loin que le réglage

**Un quart de la banque de questions est presque injouable.** Pop Culture & Musique
et Gastronomie n'ont **aucune case** sur aucun des trois plateaux : 1 364 cartes sur
5 479, soit **24,9 %**, ne peuvent sortir que sur la case centrale. Ces deux
catégories existent dans la banque, sont relues, comptées et auditées comme les
autres — et ne se jouent quasiment jamais.

**Le pion ne saurait pas afficher un camembert gagné dans une autre catégorie.** Le
porte-camemberts a six emplacements dans un ordre figé (`PAWN_WEDGE_ORDER`), codé sur
les mêmes six catégories de base. Un camembert « gastronomie » compterait pour la
victoire sans jamais se dessiner sur le pion.

## Ce qu'une correction demande

Le plateau doit devenir une **fonction** des réglages plutôt qu'une constante :
`buildBoard(boardType, selectedCategories)`, appelée à l'identique par le serveur et
par tous les clients. C'est la grammaire déjà retenue pour le dé et pour la roue
surprise (ADR 0005) : une donnée décidée en un seul endroit, dérivée partout de la
même manière, jamais tirée localement. Deux points à trancher avec le propriétaire du
projet avant d'écrire :

1. **Les six emplacements du pion suivent-ils la sélection ?** Il le faut, sinon un
   camembert gagné reste invisible. `PAWN_WEDGE_ORDER` cesse alors d'être une
   constante et devient l'ordre choisi — ce qui touche aussi la légende des couleurs.
2. **Que faire d'une sélection de quatre ou cinq catégories ?** L'interface autorise
   descendre à quatre, la roue a six branches et le nombre de camemberts pour gagner
   se règle à 4 ou 6. Il faut une règle : soit la sélection est bornée à exactement
   six, soit les branches en surnombre rejouent une catégorie déjà choisie.

Une partie en cours ne doit pas voir son plateau changer sous elle : la sélection ne
peut être relue qu'au lancement de la partie, et le plateau construit doit alors
vivre dans l'état du salon comme n'importe quelle autre donnée partagée.

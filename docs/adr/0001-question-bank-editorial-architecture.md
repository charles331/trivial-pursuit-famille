# ADR 0001 — Architecture éditoriale de la banque de questions

- Statut : accepté
- Date : 2026-07-27
- Portée : banque de questions du Trivial Pursuit familial

## Contexte

Le jeu contient 400 cartes adultes, et conserve 135 cartes ados et 135 cartes
enfants dans chacune des huit catégories. Une première extension atteignait ce volume au
moyen de cartes d’association : le joueur devait lire quatre longues paires
« question — réponse ». Le contenu était factuellement prudent, mais le rythme
de jeu et le confort sur mobile étaient mauvais.

## Décision

Une carte jouable respecte désormais les règles suivantes :

1. une question directe, compréhensible en une lecture ;
2. exactement quatre choix brefs et distincts ;
3. une seule bonne réponse, désignée par `correctAnswerIndex` ;
4. une catégorie et un niveau explicites ;
5. un identifiant stable et unique ;
6. une question adulte de 125 caractères maximum ;
7. chaque choix adulte de 72 caractères maximum ;
8. aucun format « quelle association question–réponse est correcte ? ».
9. aucun préfixe décoratif (« Question flash », « Défi express ») ne permet de
   compter deux fois le même fait.
10. l’énoncé ne donne pas sa réponse — voir ci-dessous.

### L’énoncé ne donne pas sa réponse

Une carte doit se gagner en sachant, pas en lisant. Le premier contrôle
n’attrapait que la citation littérale suivie d’une assertion (« … est X »), et
laissait donc passer la forme la plus courante du défaut : « Quel film de 1966
montre une bataille d’Alger… ? » pour *La Bataille d’Alger*. L’article change,
la phrase exacte n’apparaît nulle part, et pourtant le joueur n’a rien à savoir.

Ce qui compte n’est pas qu’un mot de la réponse figure dans la question — face à
quatre marches, « Quelle marche de Gandhi… ? » ne désigne personne — mais que
l’énoncé reprenne ce qui **distingue** la bonne réponse des trois autres. Et
seulement elle : nommer deux candidats (« entre le lièvre et la tortue ») oblige
toujours à choisir, et reste donc permis.

Trois détails décident de la justesse du contrôle : les pluriels s’apparient
d’un choix à l’autre (« plante » et « plantes »), les accents séparent des mots
que le joueur lit comme différents (« maïs » n’est pas la conjonction « mais »),
et les mots vides des énoncés ne s’appliquent pas aux réponses — « sous » ou
« même » ne disent rien dans une question mais font toute la réponse dans « Sous
la terre ».

Les cartes rédigées et relues restent la seule source de vérité du niveau
adulte. `src/data/adultExpansion.ts` ne complète plus ce niveau à partir de
cartes enfant ou ado. Les positions des bonnes réponses sont équilibrées de
façon déterministe lors de l’assemblage, sans modifier le contenu des cartes.

`adultKnowledgeSupplement.ts` contient les faits supplémentaires nécessaires
pour garantir le quota, notamment les cartes scientifiques sur les éléments
chimiques. Ces cartes sont explicites, relisibles et ne sont pas fabriquées à
partir d’une autre question au chargement.

## Structure

- `src/data/questionBank/*.ts` : cartes rédigées et relues par catégorie ;
- `src/data/questionBank/adultKnowledgeSupplement.ts` : compléments adultes
  explicites et structurés ;
- `src/data/questions.ts` : assemblage de la banque ;
- `src/data/adultExpansion.ts` : complément du seul niveau ado ;
- `src/data/questionRules.ts` : les règles ci-dessus sous forme de fonctions,
  seule définition partagée ;
- `scripts/audit-questions.ts` : contrat automatique de volume et de qualité,
  bâti sur `questionRules.ts` ;
- `src/server/packAssembly.ts` : même contrat appliqué aux packs générés par
  l'IA.

## Packs générés par l'IA

Les cartes produites par `/api/generate-pack` sont des cartes du jeu : elles
passent les mêmes contrôles que les cartes rédigées, via
`src/server/packAssembly.ts`. Une carte non conforme est rejetée, jamais
corrigée d'office — en particulier, une explication manquante n'est plus
remplacée par un texte de remplissage, qui serait exactement l'« explication non
informative » que l'audit interdit. Le générateur demande donc plus de cartes
qu'il n'en livre, pour absorber ces rejets.

Un thème actif ne remplace pas la banque : `src/server/questionSelection.ts` lui
accorde au maximum une carte tous les trois tours, et seulement si elle
correspond au camembert de la case et au niveau du joueur. La catégorie d'une
carte n'est jamais réécrite pour la faire entrer sur une case.

Chaque carte suit l’interface `Question` de `src/types.ts`. Un agent ne doit pas
modifier le schéma sans mettre à jour l’audit et le présent ADR. Une règle
nouvelle s’écrit dans `src/data/questionRules.ts`, jamais en double dans l’audit
ou dans le générateur.

## Contrôles obligatoires

Avant tout commit touchant aux cartes :

```bash
npm run lint
npm run audit:questions
npm run build
```

L’audit doit échouer si une catégorie ne contient pas exactement 400 cartes
adultes relues, si leurs bonnes réponses ne sont pas également réparties entre
A, B, C et D, en cas d’identifiant dupliqué, fait adulte répété, promotion
enfant/ado, préfixe artificiel, choix dupliqué, index invalide, carte adulte
trop longue ou retour du format d’association.

## Guide pour les futurs agents

Pour ajouter ou remplacer des cartes :

1. travailler dans un seul fichier de catégorie ;
2. préférer une question factuelle courte à une devinette ;
3. garder les quatre choix dans la même famille sémantique ;
4. éviter les pièges orthographiques et les réponses manifestement absurdes ;
5. varier les époques, pays, disciplines et représentations ;
6. éviter un biais exclusivement français : inclure Belgique, Europe et monde ;
7. vérifier tout fait nouveau auprès d’une source fiable avant de l’intégrer ;
8. ne jamais gonfler le volume avec des cartes vrai/faux ou des associations.

Les cartes à trou générées depuis les anecdotes sont interdites. Toute
amélioration future doit remplacer une carte à volume constant, avec quatre
distracteurs crédibles et une nouvelle vérification factuelle.

## Conséquences

Le jeu retrouve des cartes nettement plus rapides à lire et l’audit empêche une
régression vers les longues associations ou les reformulations cosmétiques. Le
nombre de cartes adultes atteint désormais 400 dans chaque thème tout en
restant soumis aux contrôles d’unicité et de longueur.

# ADR 0001 — Architecture éditoriale de la banque de questions

- Statut : accepté
- Date : 2026-07-27
- Portée : banque de questions du Trivial Pursuit familial

## Contexte

Le jeu vise à terme 400 cartes adultes, et conserve 135 cartes ados et 135 cartes
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

Les cartes rédigées manuellement restent la source de vérité. Le complément
déterministe dans `src/data/adultExpansion.ts` réutilise uniquement leurs faits
et leurs choix déjà relus. Il équilibre la position de la bonne réponse par
rotation des choix. Une question source ne peut être promue qu’une seule fois.
Si le nombre de faits relus est insuffisant pour atteindre 400 cartes adultes,
la catégorie conserve son volume réel : un quota incomplet est préférable à un
doublon dissimulé.

## Structure

- `src/data/questionBank/*.ts` : cartes rédigées et relues par catégorie ;
- `src/data/questions.ts` : assemblage de la banque ;
- `src/data/adultExpansion.ts` : complément déterministe des niveaux ;
- `scripts/audit-questions.ts` : contrat automatique de volume et de qualité.

Chaque carte suit l’interface `Question` de `src/types.ts`. Un agent ne doit pas
modifier le schéma sans mettre à jour l’audit et le présent ADR.

## Contrôles obligatoires

Avant tout commit touchant aux cartes :

```bash
npm run lint
npm run audit:questions
npm run build
```

L’audit doit échouer en cas de volume adulte inférieur à 135 ou supérieur à
400, identifiant dupliqué, fait adulte répété, préfixe artificiel, choix
dupliqué, index invalide, carte adulte trop longue ou retour du format
d’association.

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

La prochaine amélioration éditoriale recommandée consiste à rédiger et vérifier
de nouveaux faits uniques, catégorie par catégorie, jusqu’à atteindre la cible
de 400 sans assouplir le contrôle d’unicité.

## Conséquences

Le jeu retrouve des cartes nettement plus rapides à lire et l’audit empêche une
régression vers les longues associations ou les reformulations cosmétiques. Le
nombre de cartes adultes reflète désormais le nombre réel de faits disponibles :
la cible de 400 reste un objectif éditorial, pas un compteur artificiel.

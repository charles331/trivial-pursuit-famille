# Trivial Pursuit Famille — notes pour les sessions agentiques

Jeu de quiz familial multijoueur, joué en Belgique francophone. React + TypeScript +
Vite + Tailwind v4 côté client, Express + socket.io côté serveur (`server.ts`),
déployé sur Railway. Le français est la langue du produit *et* des commentaires de
code.

## Avant de livrer

```bash
npm run check      # lint (tsc) + tests + audit des questions + build
```

`npm run check` doit passer avant tout commit. Les commandes séparées :

| Commande | Rôle |
| --- | --- |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | tests Node (`tests/*.test.ts`) |
| `npm run audit:questions` | contrat éditorial de la banque de questions |
| `npm run score:fun` | note de fun des cartes, en % (analyse, non bloquante) |
| `npm run score:fun -- --validate` | vérifie que le barème sépare les cartes rejetées en partie de leurs remplaçantes |

## La banque de questions a un contrat, et il est exécutable

5 400 cartes réparties en 8 catégories × 3 niveaux (`enfant`, `ado`, `adulte`).
`scripts/audit-questions.ts` **est** la spécification : volumes, unicité,
non-divulgation de la réponse, non-répétition des faits, plafonds de longueur,
budgets de formes interdites. Les détecteurs vivent dans `src/data/questionRules.ts`
et sont couverts par `tests/questionRules.test.ts`.

Voir `docs/adr/0001` (architecture éditoriale) et `docs/adr/0004` (niveau ado et
note de fun) pour le *pourquoi* de chaque règle.

### Règle de conduite : ne jamais faire taire l'audit

Chaque règle de l'audit vient d'une partie réelle où une carte a gâché le jeu.
Quand `npm run audit:questions` échoue, **c'est la carte qu'on corrige, pas la
règle.** Concrètement, sont interdits :

- relâcher ou supprimer un détecteur de `questionRules.ts` pour verdir l'audit ;
- relever un plafond (`MAX_*`) pour absorber de nouvelles cartes fautives ;
- supprimer un test de `questionRules.test.ts` qui devient gênant.

Un détecteur ne se modifie que pour le rendre **plus juste** — corriger un faux
positif ou un faux négatif démontré — et alors le test qui documente le cas
s'ajoute dans le même commit. Trois exemples déjà rencontrés, tous verrouillés par
un test : `\b` ne fonctionne pas après une lettre accentuée (« composé ») ; sans
borne à droite, « la peintre » contient « a peint » ; le « qui » relatif (« la
danse qui a donné son nom ») n'est pas le « qui » interrogatif.

Si un plafond doit vraiment bouger, c'est une décision éditoriale : elle se
discute avec la personne qui tient le projet, et se documente dans un ADR.

### Ce qui rend une carte jouable

Le défaut le plus coûteux n'est pas la difficulté, c'est **l'absence de chemin de
raisonnement** — la carte qu'on sait, ou qu'on tire au sort. Signalé en partie
comme « question impossible et vraiment pas fun ».

- Interroger **l'œuvre plutôt que sa signature**. « Qui a composé La Flûte
  enchantée ? » entre quatre contemporains n'offre aucune prise ; « Qu'est-ce qu'un
  opéra ? » s'en déduit. Le nom passe dans l'énoncé : le joueur l'apprend quand
  même.
- Une carte dont l'énoncé **décrit** sa réponse est bonne, même avec quatre noms
  propres : « Quel dieu grec règne sur les mers, armé de son trident ? ». La
  description *est* le chemin. Ne pas « corriger » ces cartes.
- Jamais quatre millésimes voisins. L'année a sa place dans l'énoncé.
- Ancrer en Belgique et en francophonie quand le sujet est interchangeable, et
  préférer le proche dans le temps. Une carte anglo-saxonne et lointaine cumule
  les deux reproches les plus fréquents.
- Toujours un « Le saviez-vous ? » qui apprend un fait absent de l'énoncé.
- Niveaux : `enfant` ≈ jusqu'à 9 ans, `ado` **jouable vers 10-12 ans** (décision
  du propriétaire du projet), `adulte` exigeant. Aucun niveau ne se complète en
  recopiant un autre.

### Modifier des cartes

Les banques sont sous `src/data/questionBank/`, agrégées par `src/data/questions.ts`.
Pour corriger des cartes existantes sans toucher aux volumes, préférer une passe de
remplacement par identifiant — voir `adoReplacements.ts` et
`familyAdultReplacements.ts` — plutôt que d'éditer les gros lots générés.

## Le jeu est multijoueur : le tester comme tel

Plusieurs bugs ont été livrés parce qu'ils n'apparaissaient qu'à deux joueurs ou
plus : minuteur qui tourne pendant l'animation de la roue surprise, roue relancée
en phase `evaluating`, bonus invisible entre deux tours. Avant de livrer une
mécanique de jeu, se demander ce que voient **les autres** écrans, et ce qui se
passe au changement de phase et de tour.

Points de vigilance connus :

- `src/App.tsx` monte **deux** instances de `QuestionModal` (phases `question` et
  `evaluating`). Passer de l'une à l'autre remonte le composant et réinitialise son
  état local : ce qui doit survivre au changement de phase appartient à l'état
  serveur, pas à un `useState`.
- L'état public est construit par `src/server/gameStateView.ts`, qui retire la
  solution aux clients qui ne doivent pas la voir. Toute donnée sensible ajoutée à
  `GameState` doit y être filtrée.
- Les rôles du tour (qui répond, qui lit la carte) se résolvent dans
  `src/server/turnRoles.ts`, en sautant les joueurs déconnectés.
- **L'identifiant d'un joueur *est* son identifiant de socket.** Une coupure de
  réseau lui en donne un nouveau, donc tout ce qui est indexé dessus doit se
  déplacer d'un bloc : `room.sockets`, `room.reconnectTokens`, `room.hostSocketId`,
  les lancers de `firstPlayerDraw`. C'est le rôle de `bindSeatToSocket` dans
  `server.ts` ; les trois chemins de retour (jeton de session, reprise par prénom
  dans `join-room`, fusion par l'organisateur) passent tous par là. Un seul registre
  oublié laisse un joueur visible à l'écran mais que le serveur n'autorise plus à
  agir. Le jeton de session vit dans le `localStorage` : il ne survit pas au
  changement de navigateur, d'où la reprise par prénom (`src/server/seats.ts`).

## Conventions

- Commentaires et messages de commit en français, expliquant **pourquoi** plutôt
  que quoi ; le style des fichiers existants est la référence.
- Ne jamais écrire l'identifiant du modèle dans un artefact du dépôt (commits,
  code, PR).
- Ne pas créer de pull request sans demande explicite.

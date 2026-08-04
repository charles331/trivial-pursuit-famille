# ADR 0004 — Niveau ado : chemin de raisonnement et note de fun

- Statut : accepté
- Date : 2026-08-04
- Portée : banque de questions, niveau ado ; outillage de mesure

## Contexte

Une enfant de dix ans jouant au niveau ado a trouvé les cartes « très complexes ».
Trois exemples relevés en partie :

- « Quelle infirmière britannique, surnommée la dame à la lampe… ? » entre Clara
  Barton, Edith Cavell, Marie Curie et Florence Nightingale ;
- « En quelle année est sorti le tout premier film Star Wars ? » entre 1971, 1977,
  1983 et 1985 ;
- « Comment s'appelle l'ancien forçat, héros des Misérables ? » entre Javert,
  Marius, Thénardier et Jean Valjean.

Le défaut commun n'est pas la difficulté du sujet : c'est qu'**aucun raisonnement
ne départage les propositions**. On sait, ou on tire au sort à une chance sur
quatre.

La cause est structurelle. L'ADR 0001 avait doté le niveau adulte d'une douzaine de
règles exécutables ; le niveau ado n'en avait qu'une — ne pas recopier la banque
enfant. Sur les 1 080 cartes ado : 133 cartes à quatre noms propres contre 40 au
niveau enfant, et 62 marqueurs anglo-saxons contre 24. Les trois catégories jamais
relues à la main (art, histoire, cinéma) concentraient le défaut, l'art culminant à
45 cartes sur 135. Les trois captures venaient précisément de ces trois catégories.

Un constat plus large : la marche entre `enfant` (Disney, Tintin) et `ado` (Pétain,
Vasco de Gama, la guerre de Crimée) était un mur.

## Décision

### 1. Le niveau ado vise dix à douze ans

Choix du propriétaire du projet, contre l'alternative « rester collège 13-17 ans »
et contre la création d'un quatrième niveau. Le niveau ado devient une vraie marche
intermédiaire : culture récente et francophone, faits situés, distracteurs
départageables.

### 2. Interroger l'œuvre, pas sa signature

Les sujets exigeants restent — Hugo, Carmen, Tchaïkovski. C'est **l'angle** qui
change, pour qu'un chemin de raisonnement existe. Le nom passe dans l'énoncé, où le
joueur l'apprend tout de même :

| Avant | Après |
| --- | --- |
| Comment s'appelle l'ancien forçat des Misérables ? | Pour quel vol Jean Valjean est-il envoyé au bagne ? → un morceau de pain |
| Quelle infirmière britannique… ? | Que réclama Florence Nightingale pour faire chuter la mortalité ? → l'hygiène |
| En quelle année est sorti le premier Star Wars ? | Quelle arme lumineuse les Jedi manient-ils ? → le sabre laser |
| Qui a composé Carmen ? | Dans quel pays se déroule Carmen ? → l'Espagne |

112 cartes ont été reprises selon ce principe, en conservant l'identifiant de la
carte remplacée (`adoReplacements.ts`), si bien que les volumes et l'invariant de
135 cartes ado par catégorie sont inchangés.

### 3. Deux règles exécutables de plus

- **Aucune devinette de millésime** au niveau ado, sans tolérance
  (`isBareYearCard`). Deux années voisines ne se déduisent jamais. Une réponse
  chiffrée qui se raisonne — « combien d'os compte le squelette ? » — reste
  permise : le contrôle est distinct de `isBareNumberCard`.
- **Au plus quatre cartes d'attribution par catégorie**
  (`isAttributionLotteryCard`). L'attribution nue — « qui a fait cette œuvre ? » —
  est la seule forme qui n'offre *aucune* prise. Les quatre cartes restantes sont
  réservées aux signatures que la maison rend familières, et de préférence belges :
  Magritte, Morris, Franquin, Brel, Simenon.

Le plafond ne vise délibérément **pas** toutes les cartes à quatre noms propres.
« Quel dieu grec règne sur les mers, armé de son trident ? » et « Quel personnage
de Nintendo est un plombier moustachu en salopette ? » décrivent leur réponse : la
description *est* le chemin de raisonnement. Les convertir appauvrirait le jeu.
`isPersonNameLotteryCard` continue de signaler cette forme plus large, mais sert
seulement à la mesure, pas à l'interdiction.

### 4. Une note de fun, comparateur et non seuil

`scripts/score-fun.ts` (`npm run score:fun`) note chaque carte en pourcentage sur
sept critères pondérés, chacun issu d'un reproche formulé en partie :

| Critère | Poids | Reproche d'origine |
| --- | --- | --- |
| Chemin de raisonnement | 30 | « impossible et vraiment pas fun », « trop évidente » |
| Explication qui apprend | 20 | le « Le saviez-vous ? » réclamé sur tous les formats |
| Ancrage culturel proche | 15 | « il faut une série belge ou française » |
| Proximité temporelle | 15 | « ou alors plus proche dans le temps » |
| Carte qui se raconte | 10 | « vraiment pas fun » |
| Lisible à voix haute | 5 | confort du lecteur en mode lecteur |
| Variété de format | 5 | ajout des vrai/faux et des questions ouvertes |

La note est un **comparateur** : « 77 % » ne signifie rien dans l'abstrait, « la
catégorie popculture est sept points sous la gastronomie » signifie quelque chose.
Elle n'est donc pas bloquante en CI.

Elle est validée (`npm run score:fun -- --validate`) contre les cartes réellement
rejetées en partie et leurs remplaçantes : 53 → 81 %, 43 → 86 %, 60 → 86 %. Sans
cette validation, la note ne mesurerait rien. C'est d'ailleurs elle qui a révélé
deux faux négatifs des détecteurs, corrigés et verrouillés par des tests.

## Conséquences

- La note moyenne du corpus est de 76,8 %, identique aux trois niveaux : la qualité
  de fun dépend de la catégorie, pas du niveau. Le critère le plus faible est le
  plus lourd — chemin de raisonnement, 67,9 %.
- Classement des catégories : gastronomie 80,4 %, sports 79,9 %, sciences 77,3 %,
  cinéma 77,0 %, art 76,6 %, géographie 76,1 %, histoire 73,8 %, popculture 73,4 %.
  Les deux dernières sont le prochain chantier ; le niveau adulte de popculture est
  le bloc le plus faible du corpus (72,3 %).
- Trois pièges de rédaction de détecteurs sont désormais couverts par des tests :
  `\b` est inopérant après une lettre accentuée (« composé ») ; sans borne à droite,
  « la peintre » contient « a peint » ; le « qui » relatif n'est pas le « qui »
  interrogatif.
- Une CI (`.github/workflows/check.yml`) lance `npm run check` sur chaque poussée,
  et un `CLAUDE.md` énonce la règle de conduite : quand l'audit échoue, on corrige
  la carte, jamais la règle.

## Suite — passe sur « Pop Culture & Musique » (août 2026)

La note de fun désignait cette catégorie comme la plus faible du corpus (73,1 %),
son niveau adulte formant le bloc le plus bas tous niveaux confondus (72,3 %). Le
diagnostic bloc par bloc a isolé un coupable net : les 28 cartes de
`musiqueClassiqueAdultEditorial.ts`, à **60,5 %**, dix points sous tout le reste,
dont 17 attributions nues entre compositeurs de la même époque.

Ce fichier contenait pourtant déjà son propre remède. Ses bonnes cartes (69 à 91 %)
donnent le compositeur dans l'énoncé et interrogent **l'œuvre**, avec un indice
qui permet de raisonner : « Quel opéra de Rossini met en scène Figaro et le comte
Almaviva ? ». Ses mauvaises faisaient l'inverse. Les 19 cartes fautives ont donc
été inversées selon le patron du fichier lui-même.

La musique classique **reste** dans cette catégorie : elle s'intitule « Pop Culture
& Musique », et ces cartes y avaient été déplacées exprès depuis « Art &
Littérature », qui ne promettait ni opéra ni symphonie.

Onze attributions supplémentaires ont été reprises (`popcultureFunPass.ts`),
choisies parce qu'elles cumulaient les deux reproches les plus fréquents en partie :
aucun chemin de raisonnement, et un ancrage anglo-saxon que personne à table ne
partage. Les attributions belges et françaises ont été **conservées** : Brel,
Brassens, Aznavour, Arno, Hergé, Simenon, Franquin, Roba, Angèle, Stromae,
Gainsbourg sont précisément ce que la table veut voir.

Résultat : popculture adulte 72,3 → 74,2 %, et la catégorie n'est plus la dernière.

### Le barème ne s'applique pas au niveau enfant comme aux autres

Le niveau enfant de popculture ressortait à 73,5 %, presque aussi bas que l'adulte.
Examen fait, ses cartes sont massivement de la forme « Comment s'appelle le bonhomme
de neige dans La Reine des Neiges ? » entre Olaf, Sven, Kristoff et Hans. Le critère
de chemin de raisonnement les condamnait comme des loteries de noms propres.

C'est le barème qui avait tort. Pour un enfant qui a vu le film vingt fois, Olaf est
immédiat : le niveau enfant repose délibérément sur la **reconnaissance de
personnages aimés**, et c'est ce qui le rend joyeux. Les réécrire aurait appauvri le
jeu — et une note laissée en l'état aurait envoyé la prochaine passe éditoriale le
faire.

Le critère est donc devenu sensible au niveau : quatre noms propres nus coûtent bien
moins cher au niveau enfant. Conséquence à retenir en lisant les tableaux : **les
notes du niveau enfant d'avant et d'après ce changement ne sont pas comparables.**
Celles des niveaux ado et adulte le restent, et la validation du barème continue de
séparer les cartes rejetées en partie de leurs remplaçantes (53/43/60 % contre
81/86/86 %).

## Suite — passe sur l'histoire (août 2026)

Même méthode, même forme de résultat : un bloc portait presque tout le déficit.
Les 40 cartes de `histoireAdultPilot.ts` — le lot pilote, écrit avant l'ADR 0001 et
jamais relu — sortaient à **62,1 %**, dix points sous tous les autres lots.

Son défaut est un style, pas un sujet : l'énoncé télégraphique de livre-quiz, qui
pose un fait nu et aligne quatre noms propres. « Quel amiral britannique mourut à
Trafalgar ? », « Quelle reine britannique régna de 1837 à 1901 ? » cumulaient les
deux reproches les plus fréquents en partie. Le même fichier montrait pourtant ce
qui marche : ses meilleures cartes portent un indice déductible — « Quel canal
inauguré en 1869 relie Méditerranée et mer Rouge ? » se raisonne par la géographie.

Dix-huit cartes adultes sont passées du nom à sa **conséquence** : ce que Colomb
cherchait plutôt que son nom, ce que la révocation de l'édit de Nantes a provoqué
plutôt que le roi qui l'a signée, pourquoi Sainte-Hélène plutôt que quelle île. Deux
cartes purement britanniques et interchangeables ont été recentrées sur la Belgique
(les forts de Liège et de Namur en 1914).

Neuf cartes ado ont suivi : ce niveau portait le pire ratio anglo-saxon du corpus,
vingt-six cartes sur cent trente-cinq.

Résultat : histoire ado 73,2 → 75,2 %, adulte 73,8 → 74,8 %.

### Le détecteur de millésimes avait deux échappatoires

`his_176` proposait « En 395 / En 800 / En 1453 / En 476 » — une devinette de
millésime que la règle ne voyait pas, parce qu'elle exigeait quatre chiffres sans
préfixe. Élargie aux trois chiffres et aux préfixes courts, elle signalait alors à
tort le matricule 007 de James Bond, les 501 points des fléchettes et les 151
Pokémon d'origine.

La bonne borne n'est pas le nombre de chiffres mais **l'énoncé** : seul « en quelle
année » réclame un millésime. `isBareYearCard` prend désormais la question en
paramètre. Les trois faux positifs sont verrouillés par des tests.

C'est le quatrième piège de rédaction de détecteur rencontré dans ce chantier, après
`\b` inopérant sur les accents, « la peintre » qui contient « a peint », et le
« qui » relatif pris pour un interrogatif. Tous sont couverts par des tests : la
leçon générale est qu'un détecteur non testé sur ses faux positifs finit par mesurer
autre chose que ce qu'il prétend.

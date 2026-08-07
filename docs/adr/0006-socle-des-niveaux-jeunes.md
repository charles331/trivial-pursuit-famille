# ADR 0006 — Le volume des niveaux enfant et ado devient un plancher

- Statut : accepté
- Date : 2026-08-07
- Portée : contrat de volume de la banque de questions ; `scripts/audit-questions.ts`

## Contexte

La fille du propriétaire du projet a demandé des cartes sur les cinq films
Descendants et sur la série Vampire Diaries. Deux franchises absentes de la banque,
demandées par une joueuse de l'âge exact que le niveau ado vise — c'est-à-dire la
meilleure source de demande qu'un jeu familial puisse avoir.

L'audit exigeait **exactement** 135 cartes enfant et 135 cartes ado par catégorie.
Ajouter vingt-sept cartes était donc impossible : la seule voie ouverte était le
remplacement. C'est ce qui a été tenté d'abord — huit cartes neuves contre huit
cartes sortantes, choisies parmi les plus faibles et les moins ancrées en
francophonie. La réponse du propriétaire du projet a été nette : « tu ne peux pas
remplacer de cartes, mais tu peux en ajouter environ 25 ».

Elle est juste, et le compte exact avait tort sur ce point précis. Une carte à 56 %
de note de fun reste une carte que quelqu'un peut aimer, et la sacrifier pour faire
place à une autre est une perte sèche. Le contrat de volume punissait
l'enrichissement.

## Décision

Le compte devient un **plancher** : au moins 135 cartes enfant et 135 cartes ado par
catégorie. Tout surplus est **affiché** par l'audit, catégorie par catégorie :

    Au-dessus du socle de 135 cartes (ajouts délibérés) : cinema : +27 ado

Le plafond adulte, lui, ne bouge pas : les 400 QCM adultes relus par catégorie
restent un compte exact, et les formats variés adultes continuent de former un pool
séparé.

## Ce que la règle protégeait, et qui reste protégé

Le compte exact garantissait deux choses, et l'audit les garantit toujours :

- **Aucune catégorie plus maigre qu'une autre.** C'est le rôle du plancher. Une
  catégorie qui tomberait à 134 cartes fait échouer l'audit, comme avant.
- **Aucun niveau complété en recopiant celui du dessous.** Ce n'est pas le compte
  qui l'assurait mais les contrôles de report entre niveaux (`sourceFactSignature`),
  et ils sont inchangés.

Ce qu'il garantissait en plus — l'égalité parfaite entre catégories — n'était pas
une propriété du jeu mais une commodité de relecture. La catégorie d'une carte est
décidée par la case sur laquelle le pion tombe, jamais par la taille du réservoir :
vingt-sept cartes de plus en cinéma ne déséquilibrent aucun tirage, elles ajoutent
de la variété là où elles sont.

Le surplus est affiché pour que la propriété perdue reste sous les yeux : un ajout
doit être un geste visible, jamais une dérive silencieuse. C'est la même logique que
`ACCEPTED_TWIN_FACTS`, où l'exception se lit dans le journal de l'audit.

## Conséquences

- Un lot peut désormais s'ajouter sans qu'on cherche des cartes à sacrifier.
- Les vingt-sept cartes du premier lot ajouté (`cinemaAdoDescendantsVampire.ts`)
  mélangent les trois formats — dix QCM, neuf Vrai/Faux, huit ouvertes — parce que
  l'alternance est elle-même un critère de la note de fun. Elles obtiennent 79 % de
  moyenne, contre 75 % pour le niveau ado dans son ensemble.
- La règle « on corrige la carte, pas la règle » vaut toujours pour les
  **détecteurs de qualité**. Ce n'en était pas un : c'était un contrat de volume, et
  seul le propriétaire du projet pouvait le déplacer. Il l'a fait, et c'est écrit ici.

# ADR 0002 — Duo caméra/micro entre le lecteur et le joueur interrogé

- Statut : accepté
- Date : 2026-07-29
- Portée : mode caméra & micro en direct (`enableLiveCamera`), parties à distance

## Contexte

Le direct visait les parties jouées à distance : on envoie le lien du salon à
des amis et chacun joue depuis chez lui. La première version diffusait la
caméra et le micro **du seul joueur actif**, en sens unique, vers tous les
autres.

À plus de deux joueurs, ce découpage produisait exactement l’inverse de ce
qu’on attend d’une partie :

1. Le micro était ouvert pour le joueur qui **répond**, donc pour celui qui n’a
   rien à lire, tandis que le joueur censé **lire la carte à voix haute** (le
   « Mode Lecteur », réglage indépendant) avait son micro fermé. Personne
   n’entendait la question.
2. Le son ne circulant que dans un sens, aucune conversation n’était possible :
   le lecteur n’entendait pas la réponse donnée de vive voix.
3. Le joueur actif ne voyait et n’entendait personne.
4. Caméra et Mode Lecteur étant deux réglages séparés, la combinaison la plus
   naturelle (caméra seule) affichait la question à l’écran de tout le monde et
   ne donnait donc aucun rôle au micro.

Côté code, le contexte `liveCamera` ne portait qu’un seul `remoteStream` et un
seul élément `<video>` distant : afficher deux personnes était impossible sans
changer sa forme.

## Décision

### Les rôles d’un tour de question

Un tour de question a désormais deux rôles parlants et des spectateurs :

- le **répondant** : le joueur actif, qui doit répondre ;
- le **lecteur** : le joueur assis **juste avant** lui, qui lui lit la carte à
  voix haute et qui, seul, reçoit la solution ;
- les **spectateurs** : tous les autres, qui voient et entendent le duo sans
  émettre.

Le lecteur est le joueur *précédent* et non le suivant : la carte passe ainsi
dans le sens de la table, le joueur qui vient de terminer son tour la tend au
suivant.

Un lecteur déconnecté est ignoré : on remonte de siège en siège jusqu’au
premier joueur connecté. Sans cela, une carte masquée pouvait rester sans
personne pour la lire.

Ces rôles sont calculés par un seul module, `src/server/turnRoles.ts`, importé
à la fois par la vue d’état serveur, par les gestionnaires de socket et par le
client. Serveur et client ne peuvent donc pas être en désaccord sur l’identité
du lecteur — un désaccord ouvrirait un micro chez quelqu’un que l’interface ne
présente pas comme lecteur.

### Le direct suit les rôles

Le répondant et le lecteur capturent tous les deux caméra et micro, et publient
chacun vers **tous** les autres membres du salon. Le duo se voit et s’entend
dans les deux sens ; le reste de la table suit la scène. Personne d’autre
n’émet.

Seul un émetteur crée une offre WebRTC. Cette règle unique évite toute collision
d’offres alors même que les deux émetteurs sont abonnés l’un à l’autre : une
connexion est entièrement identifiée par *le flux qu’elle transporte*. C’est la
raison du champ `publisherId` présent dans les messages de signalisation, et des
deux tables de connexions distinctes côté client (`outbound` pour ce que l’on
publie, `inbound` pour ce que l’on reçoit).

Le serveur reste l’autorité : `isOnAir` n’accepte une offre, une réponse ou un
candidat ICE que pendant la phase `question`, et seulement de la part du
répondant ou de son lecteur.

### Caméra et Mode Lecteur sont couplés

Activer le direct implique le Mode Lecteur (`isCardReadAloud`). Ouvrir le micro
du lecteur n’a de sens que pour une carte que le répondant ne voit pas. Le
réglage « Mode Lecteur » reste disponible seul, pour les parties sans caméra.

## Conséquences

- Deux émetteurs au lieu d’un : à quatre joueurs, chacun des deux encode trois
  flux sortants. Le plafond existant (320×240, 10 i/s, 150 kbit/s par flux)
  reste indispensable et n’a pas été relevé.
- Un serveur TURN (`VITE_TURN_URL`) reste facultatif. Les serveurs STUN publics
  suffisent dans la grande majorité des cas, y compris entre deux box internet
  différentes ; TURN ne sert que pour les réseaux qui refusent la connexion
  directe (NAT symétrique, certains opérateurs mobiles, Wi-Fi d’entreprise).
  L’échec est signalé aux joueurs concernés et la partie continue. `.env.example`
  indique où en trouver un si le besoin se présente.
- Le haut-parleur est un seul interrupteur pour tout le duo, et non un par
  participant : c’est le geste attendu sur mobile, et le déverrouillage audio
  iOS (qui exige un vrai appui) n’a ainsi qu’un seul bouton.

## Complément — La solution ne s’affiche qu’à la demande

Le lecteur voyait la bonne réponse surlignée en vert en permanence. En pratique
le téléphone finit posé sur la table, et le joueur interrogé lisait la réponse
par-dessus l’épaule du lecteur.

La solution est désormais masquée par défaut, derrière un bouton « Révéler » que
le lecteur **maintient** appuyé : elle apparaît le temps de l’appui, sous forme
de lettre et de texte, et l’option correspondante est surlignée. Chaque lecteur
gère son propre affichage, l’état étant purement local.

Le relâchement est écouté au niveau de la fenêtre, et pas seulement sur le
bouton : un doigt qui glisse, un changement d’application ou un onglet qui perd
le focus referment la réponse. Un `pointerup` qui atterrit ailleurs ne doit
jamais laisser la solution à l’écran.

## Complément — Tenir sur un iPhone sans défilement

La carte question dépassait la hauteur d’un iPhone de 667 px, et le conteneur
centrait son contenu en `flex` sans zone de défilement : le débordement partait
autant vers le haut que vers le bas, et le bas de la carte — les options et le
bouton de validation — devenait tout simplement inatteignable.

La carte est maintenant une feuille pleine page sur téléphone (`h-full`,
`max-h-dvh`, encoches respectées) et garde son aspect de carte à partir de `sm`.
Elle se découpe en trois : en-tête et bandeau lecteur fixes, zone question et
options seule région défilante, barre d’action épinglée en bas. Le bloc interne
est centré par `my-auto`, qui se réduit à zéro dès que le contenu déborde — une
question longue défile donc depuis sa première ligne au lieu d’être rognée.

Les hauteurs ont par ailleurs été resserrées : en-tête sur une ligne, bandeau
lecteur en une phrase, vignettes du direct en 72 px avec les contrôles sur leur
propre ligne pleine largeur (ils passaient à la ligne et coûtaient 55 px), et
options plus compactes.

Le même défaut touchait les autres fenêtres centrées du jeu (ajout d’un joueur
local, réglages en cours de partie, écran de victoire, confirmations) : sur un
écran de 600 px, leur bouton de validation était hors de portée. Elles défilent
désormais et se centrent par `my-auto`.

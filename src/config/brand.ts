/**
 * Le nom du jeu, en un seul endroit.
 *
 * Il était recopié dans une vingtaine de fichiers — écran d'accueil, partage,
 * règles, journal du serveur, balises de partage, favicons. Le renommer a
 * demandé de les retrouver un par un, et un oubli ne se voit que sur l'écran où
 * il se cache. Toute nouvelle apparition du nom passe par ici.
 *
 * `index.html`, les SVG de marque et `metadata.json` ne peuvent pas importer ce
 * module : ils portent le nom en clair, et le test de `previewMeta` vérifie que
 * la page servie s'accorde avec cette constante.
 */
export const GAME_NAME = 'Le Défi des Familles';

/**
 * Le nom coupé en deux pour l'affichage, la seconde moitié recevant le dégradé
 * orange de l'écran d'accueil et de l'image de partage.
 */
export const GAME_NAME_PARTS = { lead: 'Le Défi', accent: 'des Familles' } as const;

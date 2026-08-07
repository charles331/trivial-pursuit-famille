import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BOARD_CATEGORY_COUNT,
  BOARD_PRESETS,
  DEFAULT_BOARD_CATEGORIES,
  buildBoard,
  findTilePath,
  resolveBoardCategories,
} from '../src/data/boards';
import { BoardType, CategoryId } from '../src/types';

const BOARD_TYPES: BoardType[] = ['wheel', 'snake', 'star'];

test('the classic wheel has three category tiles between the hub and every camembert', () => {
  const wheel = BOARD_PRESETS.wheel;
  const camemberts = wheel.tiles.filter(tile => tile.type === 'camembert');

  assert.equal(wheel.tiles.length, 43);
  assert.equal(camemberts.length, 6);

  for (const camembert of camemberts) {
    const path = findTilePath(wheel.tiles, 0, camembert.id);
    assert.equal(path.length, 5);
    assert.equal(path[0], 0);
    assert.equal(path.at(-1), camembert.id);
    assert.ok(path.slice(1, -1).every(id =>
      wheel.tiles.find(tile => tile.id === id)?.type === 'category'
    ));
  }
});

test('new wheel tiles use fresh IDs and every connection is bidirectional', () => {
  const wheel = BOARD_PRESETS.wheel;
  const ids = wheel.tiles.map(tile => tile.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.filter(id => id >= 37).sort((a, b) => a - b), [37, 38, 39, 40, 41, 42]);

  for (const tile of wheel.tiles) {
    for (const neighbourId of tile.nextTileIds) {
      const neighbour = wheel.tiles.find(candidate => candidate.id === neighbourId);
      assert.ok(neighbour, `missing neighbour ${neighbourId} for tile ${tile.id}`);
      assert.ok(neighbour.nextTileIds.includes(tile.id), `${tile.id} -> ${neighbourId} is not bidirectional`);
    }
  }
});

test('the star preset keeps its shorter legacy branches', () => {
  const star = BOARD_PRESETS.star;
  const camemberts = star.tiles.filter(tile => tile.type === 'camembert');

  assert.equal(star.tiles.length, 37);
  for (const camembert of camemberts) {
    assert.equal(findTilePath(star.tiles, 0, camembert.id).length, 4);
  }
});

test('le plateau prend les catégories choisies, et seulement elles', () => {
  // Signalé en partie : « je peux sélectionner ce que je veux, les catégories de
  // base restent sur le plateau ». Elles restaient parce que le plateau était un
  // objet statique construit au chargement du module, avant tout salon.
  const choix: CategoryId[] = ['popculture', 'gastronomie', 'cinema', 'sciences', 'histoire', 'sports'];

  for (const type of BOARD_TYPES) {
    const board = buildBoard(type, choix);
    const posees = new Set(board.tiles.map(tile => tile.categoryId).filter(Boolean));
    assert.deepEqual([...posees].sort(), [...choix].sort(), type);
    // Et les deux catégories écartées n'apparaissent nulle part.
    assert.ok(!posees.has('geographie'), `${type} : geographie n’était pas choisie`);
    assert.ok(!posees.has('art'), `${type} : art n’était pas choisi`);
  }
});

test('changer les catégories ne change rien à la forme du plateau', () => {
  // Le parcours, les identifiants et les liens doivent rester ceux du préréglage :
  // seule la couleur des cases suit la sélection. Sans quoi les chemins calculés
  // par le serveur et ceux animés par le client cesseraient de correspondre.
  const choix: CategoryId[] = ['gastronomie', 'popculture', 'art', 'sports', 'cinema', 'sciences'];

  for (const type of BOARD_TYPES) {
    const forme = (tiles: typeof BOARD_PRESETS.wheel.tiles) =>
      tiles.map(t => [t.id, t.type, t.x, t.y, [...t.nextTileIds]]);
    assert.deepEqual(forme(buildBoard(type, choix).tiles), forme(BOARD_PRESETS[type].tiles), type);
  }
});

test('chaque catégorie du plateau a une case camembert : sinon la partie est ingagnable', () => {
  // Le serpentin en posait une toutes les cinq cases, soit cinq pour six
  // catégories : il en manquait toujours une, et une partie en six camemberts y
  // était impossible à gagner autrement qu'avec un joker bien tombé.
  for (const type of BOARD_TYPES) {
    const board = buildBoard(type, DEFAULT_BOARD_CATEGORIES);
    const gagnables = new Set(
      board.tiles.filter(t => t.type === 'camembert' || t.isCamembert).map(t => t.categoryId),
    );
    assert.equal(gagnables.size, BOARD_CATEGORY_COUNT, `${type} : ${[...gagnables].join(', ')}`);
    for (const categoryId of DEFAULT_BOARD_CATEGORIES) {
      assert.ok(gagnables.has(categoryId), `${type} : aucune case camembert pour ${categoryId}`);
    }
  }
});

test('une sélection incomplète se complète au lieu de trouer le plateau', () => {
  // Un salon repris du disque, ou une version antérieure, peut porter moins de six
  // catégories. Serveur et clients doivent en déduire la même liste, sinon ils
  // dessinent deux plateaux différents.
  assert.deepEqual(resolveBoardCategories([]), DEFAULT_BOARD_CATEGORIES);
  assert.deepEqual(resolveBoardCategories(undefined), DEFAULT_BOARD_CATEGORIES);
  assert.equal(resolveBoardCategories(['gastronomie']).length, BOARD_CATEGORY_COUNT);
  assert.equal(resolveBoardCategories(['gastronomie'])[0], 'gastronomie');
  // Les doublons ne consomment qu'une place, et le surplus est tronqué.
  assert.deepEqual(resolveBoardCategories(['art', 'art', 'art']).length, BOARD_CATEGORY_COUNT);
  assert.equal(
    resolveBoardCategories([...DEFAULT_BOARD_CATEGORIES, 'popculture', 'gastronomie']).length,
    BOARD_CATEGORY_COUNT,
  );
});

test('le plateau est une fonction pure : deux dérivations donnent le même plateau', () => {
  // C'est la grammaire du dé et de la roue surprise : une donnée décidée en un
  // endroit, dérivée partout de la même manière, jamais tirée localement.
  const choix: CategoryId[] = ['sciences', 'gastronomie', 'histoire', 'popculture', 'cinema', 'sports'];
  for (const type of BOARD_TYPES) {
    assert.deepEqual(buildBoard(type, choix), buildBoard(type, choix), type);
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { BOARD_PRESETS, findTilePath } from '../src/data/boards';

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

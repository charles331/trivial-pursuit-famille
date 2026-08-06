import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIM_MIN_DRAG_PX,
  DICE_FACES,
  aimFromDrag,
  aimedFace,
  expectedFace,
  resolveThrow,
} from '../src/server/diceThrow';

/** Un tirage prévisible : la suite de valeurs est fournie, dans l'ordre. */
function scriptedRandom(...values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

/** Distribution des faces sur un grand nombre de lancers à puissance fixe. */
function distribution(power: number | null, tirages = 60_000): Map<number, number> {
  const counts = new Map<number, number>();
  for (let i = 0; i < tirages; i++) {
    const face = resolveThrow(power);
    counts.set(face, (counts.get(face) ?? 0) + 1);
  }
  return counts;
}

test('un geste mou vise le 1, un geste à fond vise le 6', () => {
  assert.equal(aimedFace(0), 1);
  assert.equal(aimedFace(100), DICE_FACES);
  assert.equal(aimedFace(50), 4);
});

test('la puissance est bornée : le réseau peut envoyer n’importe quoi', () => {
  assert.equal(aimedFace(-500), 1);
  assert.equal(aimedFace(10_000), DICE_FACES);
});

test('en dessous du seuil, le geste n’est pas une visée', () => {
  assert.equal(aimFromDrag(AIM_MIN_DRAG_PX - 1), null);
  assert.equal(aimFromDrag(AIM_MIN_DRAG_PX), aimedFace(AIM_MIN_DRAG_PX));
});

test('sans puissance, le lancer reste un tirage au sort sur les six faces', () => {
  const faces = new Set<number>();
  for (let i = 0; i < 600; i++) faces.add(resolveThrow(null));
  assert.deepEqual([...faces].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);

  // Une puissance absente, non numérique ou trop faible passe par le même chemin :
  // le hasard, jamais la face 1 par défaut.
  assert.equal(resolveThrow(undefined, scriptedRandom(0.99)), 6);
  assert.equal(resolveThrow(Number.NaN, scriptedRandom(0.99)), 6);
  assert.equal(resolveThrow(AIM_MIN_DRAG_PX - 1, scriptedRandom(0.99)), 6);
});

test('la face visée est la plus fréquente, sans jamais être garantie', () => {
  // Le seuil de geste exclu : en dessous, il n'y a pas de visée à vérifier.
  for (const power of [AIM_MIN_DRAG_PX, 20, 40, 60, 80, 100]) {
    const cible = aimedFace(power);
    const counts = distribution(power);
    const plusFrequente = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];

    assert.equal(plusFrequente, cible, `viser ${cible} doit d'abord donner ${cible}`);
    assert.ok(
      (counts.get(cible) ?? 0) / 60_000 < 0.4,
      `viser ${cible} ne doit pas devenir un pilotage : ${((counts.get(cible) ?? 0) / 600).toFixed(1)} %`
    );
    assert.ok(
      (counts.get(cible) ?? 0) / 60_000 > 0.2,
      `viser ${cible} doit rester payant : ${((counts.get(cible) ?? 0) / 600).toFixed(1)} %`
    );
  }
});

test('le dé ne sort jamais du dé', () => {
  for (const power of [0, AIM_MIN_DRAG_PX, 25, 50, 75, 100]) {
    for (const [face] of distribution(power, 5_000)) {
      assert.ok(face >= 1 && face <= DICE_FACES, `face hors du dé : ${face}`);
    }
  }
});

test('aucune puissance ne rend une face impossible', () => {
  // Un joueur qui glisse toujours à fond ne doit pas obtenir un 6 mécanique :
  // les six faces restent atteignables, même celles à l'opposé de la visée.
  for (const power of [0, 50, 100]) {
    const counts = distribution(power, 20_000);
    assert.equal(counts.size, DICE_FACES, `puissance ${power} : ${counts.size} face(s) seulement`);
    for (const [face, vues] of counts) {
      assert.ok(vues / 20_000 > 0.02, `puissance ${power} : la face ${face} n'est qu'un accident`);
    }
  }
});

test('le geste se sent : un lancer à fond porte presque deux fois plus loin', () => {
  const mou = expectedFace(AIM_MIN_DRAG_PX);
  const fond = expectedFace(100);
  assert.ok(mou < 2.6, `un geste mou doit rester bas : ${mou.toFixed(2)}`);
  assert.ok(fond > 4.4, `un geste à fond doit porter : ${fond.toFixed(2)}`);
  assert.ok(fond - mou > 2, `l'écart doit se voir en partie : ${(fond - mou).toFixed(2)} cran(s)`);

  // Et la progression est monotone : chaque cran de geste porte plus loin.
  const paliers = [AIM_MIN_DRAG_PX, 20, 40, 60, 80, 100].map(expectedFace);
  for (let i = 1; i < paliers.length; i++) {
    assert.ok(paliers[i] > paliers[i - 1], `la puissance doit toujours porter plus loin : ${paliers}`);
  }

  // Sous le seuil, plus de visée : l'espérance retombe sur celle d'un dé nu.
  assert.equal(expectedFace(0), 3.5);
});

test('le tirage parcourt les faces dans l’ordre, du 1 au 6', () => {
  // Verrouille la lecture du ticket : un tirage au plus bas donne la face 1,
  // au plus haut la face 6, quelle que soit la visée.
  assert.equal(resolveThrow(100, scriptedRandom(0)), 1);
  assert.equal(resolveThrow(100, scriptedRandom(0.999999)), 6);
  assert.equal(resolveThrow(0, scriptedRandom(0)), 1);
  assert.equal(resolveThrow(0, scriptedRandom(0.999999)), 6);
});

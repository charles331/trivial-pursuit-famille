import assert from 'node:assert/strict';
import test from 'node:test';
import {
  THROW_MIN_DRAG_PX,
  DICE_FACES,
  DICE_REST,
  describeFlight,
  flightToPixels,
  powerFromDrag,
  DRAG_FULL_POWER_PX,
  rollDie,
} from '../src/server/diceThrow';

/** Un tirage prévisible : la suite de valeurs est fournie, dans l'ordre. */
function scriptedRandom(...values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

test('les six faces sortent à un sixième chacune', () => {
  // La face a longtemps suivi la puissance du glissé. Mesuré sur un pouce de
  // famille — autour de soixante-dix pixels —, cela concentrait 69 % des lancers
  // sur les faces 2, 3 et 4 et ne sortait un 6 qu'une fois sur seize. Le
  // propriétaire du projet a demandé « plus de hasard dans le lancer du dé, mais
  // en gardant le mouvement de l'utilisateur » : le mouvement est dans le vol,
  // la face est celle d'un dé de bois.
  const tirages = 240_000;
  const counts = new Array(DICE_FACES + 1).fill(0);
  for (let i = 0; i < tirages; i++) counts[rollDie()]++;

  const parts = counts.slice(1).map(n => (n / tirages) * 100);
  assert.equal(counts[0], 0, 'aucune face 0 ne doit sortir');
  for (const [index, part] of parts.entries()) {
    assert.ok(
      Math.abs(part - 100 / DICE_FACES) < 1,
      `la face ${index + 1} sort ${part.toFixed(2)} % : ${parts.map(p => p.toFixed(1)).join(' / ')}`
    );
  }
});

test('le tirage parcourt les faces dans l’ordre, du 1 au 6', () => {
  // Verrouille la lecture du tirage : au plus bas la face 1, au plus haut la 6,
  // et jamais 7 sur un `random()` qui frôle l'unité.
  assert.equal(rollDie(scriptedRandom(0)), 1);
  assert.equal(rollDie(scriptedRandom(0.999999)), DICE_FACES);
  assert.equal(rollDie(scriptedRandom(0.5)), 4);
});

test('le dé ne sort jamais du dé', () => {
  const faces = new Set<number>();
  for (let i = 0; i < 20_000; i++) faces.add(rollDie());
  assert.deepEqual([...faces].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);
});

test('la face ne dépend d’aucun geste : rien du réseau ne peut l’infléchir', () => {
  // La garantie est structurelle, pas statistique — `rollDie` ne prend que le
  // générateur. Deux gestes opposés, même graine : même face. C'est ce qui rend
  // inutile toute borne sur la puissance côté face, et ce que ce test verrouille
  // si quelqu'un voulait réintroduire une visée sans le dire.
  assert.equal(rollDie.length, 0, 'rollDie ne doit prendre que le générateur');
  for (const valeur of [0, 0.17, 0.42, 0.83, 0.999]) {
    assert.equal(rollDie(scriptedRandom(valeur)), rollDie(scriptedRandom(valeur)));
  }
});

/* ---------------------------------------------------- la trajectoire du dé */

/** Distance au centre du plateau, pour vérifier qu'un point y reste. */
const auCentre = (p: { x: number; y: number }) => Math.hypot(p.x - 500, p.y - 500);

test('le dé part du coin et suit la direction poussée', () => {
  const vol = describeFlight(100, 225, 7); // 225° = vers le haut à gauche
  assert.deepEqual(vol.contacts[0], DICE_REST);

  const premier = vol.contacts[1];
  assert.ok(premier.x < DICE_REST.x, `poussé vers la gauche, il doit aller à gauche : ${premier.x}`);
  assert.ok(premier.y < DICE_REST.y, `poussé vers le haut, il doit monter : ${premier.y}`);
});

test('une poussée franche envoie le dé plus loin qu’une poussée molle', () => {
  const court = describeFlight(10, 225, 7);
  const long = describeFlight(100, 225, 7);
  const parcouru = (vol: ReturnType<typeof describeFlight>) =>
    vol.contacts.slice(1).reduce(
      (total, point, i) => total + Math.hypot(point.x - vol.contacts[i].x, point.y - vol.contacts[i].y),
      0
    );
  assert.ok(
    parcouru(long) > parcouru(court) * 2,
    `${Math.round(parcouru(long))} contre ${Math.round(parcouru(court))} unités de plateau`
  );
});

test('le dé ne quitte jamais le plateau, quelle que soit la poussée', () => {
  for (let angle = 0; angle < 360; angle += 15) {
    for (const power of [0, 25, 60, 100]) {
      for (const seed of [1, 42, 9999]) {
        const vol = describeFlight(power, angle, seed);
        for (const contact of vol.contacts.slice(1)) {
          assert.ok(
            auCentre(contact) <= 406,
            `angle ${angle}, puissance ${power} : le dé atterrit à ${Math.round(auCentre(contact))} du centre`
          );
        }
      }
    }
  }
});

test('poussé vers le coin, le dé rebondit et revient en jeu', () => {
  // 45° pointe vers l'extérieur depuis le coin de repos : sans rebond sur le
  // bord, le dé resterait collé là où personne ne le lit.
  const vol = describeFlight(90, 45, 3);
  const arrivee = vol.contacts[vol.contacts.length - 1];
  assert.ok(auCentre(arrivee) <= 406, `resté hors du feutre : ${Math.round(auCentre(arrivee))}`);
  assert.ok(
    Math.hypot(arrivee.x - DICE_REST.x, arrivee.y - DICE_REST.y) > 60,
    'un dé poussé doit avoir quitté son coin'
  );
});

test('même poussée et même graine : même parcours sur tous les écrans', () => {
  assert.deepEqual(describeFlight(70, 200, 12345), describeFlight(70, 200, 12345));
  assert.notDeepEqual(describeFlight(70, 200, 12345), describeFlight(70, 200, 999));
});

test('les rebonds retombent de plus en plus bas, et le dé finit au sol', () => {
  const vol = describeFlight(100, 225, 7);
  for (let i = 1; i < vol.lifts.length; i++) {
    assert.ok(vol.lifts[i] < vol.lifts[i - 1], `rebond ${i} plus haut que le précédent : ${vol.lifts}`);
  }
  assert.ok(vol.durationMs > 500 && vol.durationMs < 1200, `durée du vol : ${vol.durationMs} ms`);
});

test('en pixels, le parcours commence au repos et finit posé', () => {
  const enPixels = flightToPixels(describeFlight(80, 225, 7), 400, 40);
  assert.equal(enPixels.x[0], 0);
  assert.equal(enPixels.y[0], 0);
  assert.equal(enPixels.lift[0], 0);
  assert.equal(enPixels.lift[enPixels.lift.length - 1], 0, 'le dé doit finir au sol');
  assert.equal(enPixels.times[0], 0);
  assert.equal(enPixels.times[enPixels.times.length - 1], 1);
  // Une image de sommet et une de contact par bond, plus le départ.
  assert.equal(enPixels.x.length, enPixels.times.length);
  assert.equal(enPixels.x.length, 1 + 2 * enPixels.bounces.length);
  // L'ombre rétrécit quand le dé monte.
  const plusHaut = enPixels.lift.indexOf(Math.min(...enPixels.lift));
  assert.ok(enPixels.shadow[plusHaut] < enPixels.shadow[0], 'l’ombre doit rétrécir en l’air');
});

test('toute la longueur du glissé se voit dans le vol', () => {
  // La face ne dépendant plus du geste, c'est le vol qui doit porter la poussée —
  // sinon la jauge redevient décorative, ce que le propriétaire du projet a
  // refusé une fois déjà. On mesure donc que chaque tranche de glissé, du seuil
  // au geste franc, envoie le dé strictement plus loin que la précédente.
  const parcouru = (vol: ReturnType<typeof describeFlight>) =>
    vol.contacts.slice(1).reduce(
      (total, point, i) => total + Math.hypot(point.x - vol.contacts[i].x, point.y - vol.contacts[i].y),
      0
    );

  // 200° pointe vers le centre du plateau : aucun rebond sur le bord ne vient
  // raboter la comparaison.
  let precedent = 0;
  for (let px = THROW_MIN_DRAG_PX; px <= DRAG_FULL_POWER_PX; px += 20) {
    const distance = parcouru(describeFlight(powerFromDrag(px), 200, 7));
    assert.ok(
      distance > precedent,
      `${px} px de glissé porte à ${Math.round(distance)}, pas plus loin que ${Math.round(precedent)}`
    );
    precedent = distance;
  }
});

test('la culbute brouille toujours la face de départ', () => {
  // Le dé annonce une face que le geste n'a pas choisie : il faut donc qu'il
  // tourne assez pour que personne ne puisse lire le résultat au décollage.
  for (const power of [0, 25, 60, 100]) {
    for (const seed of [1, 42, 9999]) {
      const { spin } = describeFlight(power, 200, seed);
      assert.ok(spin.x >= 2 && spin.y >= 2, `culbute trop courte : ${spin.x} / ${spin.y} tours`);
    }
  }
});

test('la puissance se déduit du glissé, bornée aux deux bouts', () => {
  assert.equal(powerFromDrag(0), 0);
  assert.equal(powerFromDrag(-40), 0);
  assert.equal(powerFromDrag(DRAG_FULL_POWER_PX), 100);
  assert.equal(powerFromDrag(DRAG_FULL_POWER_PX * 3), 100);
  // Et elle croît : un geste plus long ne peut pas viser plus bas.
  let precedent = -1;
  for (let px = 0; px <= DRAG_FULL_POWER_PX; px += 5) {
    const power = powerFromDrag(px);
    assert.ok(power >= precedent, `${px} px donne ${power}, moins que le glissé précédent`);
    precedent = power;
  }
});

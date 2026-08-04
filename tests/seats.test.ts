import assert from 'node:assert/strict';
import test from 'node:test';
import { describeRecoveredSeat, findAbandonedSeat, mergeSeatInto, normalizeSeatName } from '../src/server/seats';
import { createGameState, createPlayer } from './fixtures';

// La partie signalée : Christelle perd le réseau avec quatre camemberts, revient
// depuis un autre navigateur (donc sans jeton de session) et se retrouve en
// double, l'ancien siège figé pour toujours.
function tableAvecSiegeAbandonne() {
  return createGameState({
    phase: 'rolling',
    currentQuestion: null,
    players: [
      createPlayer('Charles', true),
      {
        ...createPlayer('Christelle'),
        isConnected: false,
        wedges: ['histoire', 'geographie', 'cinema', 'sciences'],
        currentTileId: 2,
        score: 400,
        correctAnswersCount: 4,
        totalAnswersCount: 6,
      },
      { ...createPlayer('Laura'), difficulty: 'ado' },
    ],
    activePlayerIndex: 0,
  });
}

test('un prénom revient malgré la casse, les accents et les espaces', () => {
  assert.equal(normalizeSeatName('  Christelle '), 'christelle');
  assert.equal(normalizeSeatName('CHRISTELLE'), 'christelle');
  assert.equal(normalizeSeatName('Chloé'), normalizeSeatName('chloe'));
  assert.equal(normalizeSeatName('Jean  Luc'), 'jean luc');
});

test('le bandeau n\'annonce des camemberts que s\'il y en a', () => {
  assert.equal(describeRecoveredSeat('Christelle', 0), 'Christelle a retrouvé sa place.');
  assert.equal(describeRecoveredSeat('Christelle', 1), 'Christelle a retrouvé sa place et son camembert.');
  assert.equal(describeRecoveredSeat('Christelle', 4), 'Christelle a retrouvé sa place et ses 4 camemberts.');
});

test('le siège abandonné se reconnaît au prénom', () => {
  const state = tableAvecSiegeAbandonne();
  const seat = findAbandonedSeat(state, 'christelle');
  assert.equal(seat?.name, 'Christelle');
  assert.equal(seat?.wedges.length, 4);
});

test('un joueur encore connecté n\'est pas un siège à reprendre', () => {
  const state = tableAvecSiegeAbandonne();
  assert.equal(findAbandonedSeat(state, 'Laura'), null);
  assert.equal(findAbandonedSeat(state, 'Charles'), null);
});

test('deux sièges déconnectés au même prénom ne se devinent pas', () => {
  // Deviner donnerait les camemberts de l'une à l'autre : on laisse
  // l'organisateur trancher avec « Fusionner ».
  const state = tableAvecSiegeAbandonne();
  state.players.push({ ...createPlayer('christelle'), id: 'autre', isConnected: false });
  assert.equal(findAbandonedSeat(state, 'Christelle'), null);
});

test('les joueurs du pass & play ne sont jamais des sièges à reprendre', () => {
  // Ils partagent l'appareil de l'organisateur : marqués déconnectés dans une
  // partie rechargée du disque, ils ne se reconnectent pourtant jamais seuls.
  const state = tableAvecSiegeAbandonne();
  state.players.push({ ...createPlayer('Mamie'), id: 'local_42', isConnected: false });
  assert.equal(findAbandonedSeat(state, 'Mamie'), null);
});

test('un prénom vide ne reprend aucun siège', () => {
  const state = tableAvecSiegeAbandonne();
  assert.equal(findAbandonedSeat(state, '   '), null);
});

test('la fusion rend au doublon les camemberts du siège d\'origine', () => {
  const state = tableAvecSiegeAbandonne();
  // Elle est revenue sous un autre prénom : la reprise automatique n'a rien vu.
  state.players.push({ ...createPlayer('Chris'), id: 'socket-neuf' });

  const merged = mergeSeatInto(state, 'socket-neuf', 'Christelle');
  assert.ok(merged, 'la fusion a échoué');
  assert.equal(merged!.previousSeatId, 'Christelle');

  assert.equal(state.players.length, 3, 'le doublon n\'a pas quitté la table');
  assert.equal(state.players.filter(p => p.name === 'Chris').length, 0);

  const seat = state.players.find(p => p.name === 'Christelle');
  assert.equal(seat?.id, 'socket-neuf', 'le siège n\'a pas suivi l\'appareil');
  assert.equal(seat?.isConnected, true);
  assert.equal(seat?.wedges.length, 4, 'les camemberts ont été perdus');
  assert.equal(seat?.currentTileId, 2, 'le pion est reparti du centre');
  assert.equal(seat?.score, 400);
});

test('la fusion refuse un siège encore connecté', () => {
  // Sinon l'organisateur pourrait « fusionner » deux personnes bien présentes et
  // en effacer une avec ses camemberts.
  const state = tableAvecSiegeAbandonne();
  assert.equal(mergeSeatInto(state, 'Charles', 'Laura'), null);
  assert.equal(state.players.length, 3);
});

test('la fusion refuse un joueur inconnu ou lui-même', () => {
  const state = tableAvecSiegeAbandonne();
  assert.equal(mergeSeatInto(state, 'fantome', 'Christelle'), null);
  assert.equal(mergeSeatInto(state, 'Christelle', 'Christelle'), null);
  assert.equal(state.players.length, 3);
});

test('fusionner le joueur dont c\'est le tour rend la main proprement', () => {
  // Le doublon disparaît : s'il tenait la carte en cours, plus personne ne
  // pourrait la trancher. On repart d'un tour neuf, comme pour un retrait.
  const state = tableAvecSiegeAbandonne();
  state.players.push({ ...createPlayer('Chris'), id: 'socket-neuf' });
  state.activePlayerIndex = 3;
  state.phase = 'question';
  state.currentQuestion = { ...createGameState().currentQuestion! };

  const merged = mergeSeatInto(state, 'socket-neuf', 'Christelle');
  assert.ok(merged);
  assert.equal(state.phase, 'rolling');
  assert.equal(state.currentQuestion, null);
  assert.ok(state.activePlayerIndex < state.players.length, 'index de joueur hors table');
});

test('le lancer d\'ouverture du siège d\'origine fait foi après fusion', () => {
  const state = tableAvecSiegeAbandonne();
  state.phase = 'first_player_roll';
  state.players.push({ ...createPlayer('Chris'), id: 'socket-neuf' });
  state.firstPlayerDraw = {
    startedAt: 0,
    winnerId: null,
    rolls: [
      { playerId: 'Christelle', value: 6, elapsedMs: 900, tieBreaker: 0.1, order: 0 },
      { playerId: 'socket-neuf', value: 2, elapsedMs: 1200, tieBreaker: 0.2, order: 1 },
    ],
  };

  mergeSeatInto(state, 'socket-neuf', 'Christelle');
  const rolls = state.firstPlayerDraw!.rolls;
  assert.equal(rolls.length, 1, 'la personne fusionnée a gardé deux lancers');
  assert.equal(rolls[0].playerId, 'socket-neuf');
  assert.equal(rolls[0].value, 6, 'ce n\'est pas le lancer du siège d\'origine qui a survécu');
});

test('sans lancer sur le siège d\'origine, celui du doublon reste valable', () => {
  // Elle a lancé le dé depuis son nouvel appareil avant qu'on ne répare : il n'y a
  // aucune raison de la faire relancer.
  const state = tableAvecSiegeAbandonne();
  state.phase = 'first_player_roll';
  state.players.push({ ...createPlayer('Chris'), id: 'socket-neuf' });
  state.firstPlayerDraw = {
    startedAt: 0,
    winnerId: null,
    rolls: [{ playerId: 'socket-neuf', value: 5, elapsedMs: 800, tieBreaker: 0.3, order: 0 }],
  };

  mergeSeatInto(state, 'socket-neuf', 'Christelle');
  const rolls = state.firstPlayerDraw!.rolls;
  assert.equal(rolls.length, 1);
  assert.equal(rolls[0].value, 5);
});

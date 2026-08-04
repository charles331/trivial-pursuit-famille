import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTurn, resolveAnswer } from '../src/server/gameEngine';
import { awardSurpriseBonus, bonusCount } from '../src/server/bonuses';
import { createGameStateView } from '../src/server/gameStateView';
import { createGameState, createPlayer, testBoard, testSettings } from './fixtures';

// Reproduit la partie signalée : deux joueurs, la fille (2ᵉ joueur, « ado »)
// tombe sur une case Surprise, gagne un bonus à la roue, puis on enchaîne les
// tours. Le bonus doit rester disponible et visible dans l'état diffusé.
function twoPlayerGame() {
  const state = createGameState({
    players: [createPlayer('papa', true), { ...createPlayer('fille'), difficulty: 'ado' }],
    settings: { ...testSettings, enableBonuses: true },
    activePlayerIndex: 1, // au tour de la fille
  });
  return state;
}

test('un bonus gagné à la roue survit aux tours suivants', () => {
  const state = twoPlayerGame();

  // La fille lance la roue et tombe sur le Joker (quartier 3).
  const won = awardSurpriseBonus(state, () => 0.55);
  assert.equal(won, 'camembert_joker');
  assert.equal(bonusCount(state.players[1], 'camembert_joker'), 1);

  // Elle répond à sa question sans utiliser le bonus, puis le tour tourne.
  resolveAnswer(state, state.settings, testBoard, 1);
  advanceTurn(state);
  assert.equal(state.activePlayerIndex, 0); // au papa

  // Tour du papa : il répond, le tour revient à la fille.
  state.currentQuestion = { ...state.currentQuestion! };
  state.phase = 'question';
  state.lastAnswerResult = null;
  resolveAnswer(state, state.settings, testBoard, 0); // mauvaise réponse
  advanceTurn(state);
  assert.equal(state.activePlayerIndex, 1); // de retour à la fille

  // Le bonus doit toujours être là.
  assert.equal(
    bonusCount(state.players[1], 'camembert_joker'),
    1,
    'le bonus a disparu entre deux tours',
  );
});

test('le bonus gagné apparaît dans l\'état diffusé à la joueuse', () => {
  const state = twoPlayerGame();
  awardSurpriseBonus(state, () => 0.55);

  // État tel qu'il part vers le client de la fille.
  const view = createGameStateView(state, 'fille', 'papa');
  const fille = view.players.find(p => p.id === 'fille');
  assert.ok(fille, 'la joueuse est absente de l\'état diffusé');
  assert.equal(bonusCount(fille!, 'camembert_joker'), 1);
});

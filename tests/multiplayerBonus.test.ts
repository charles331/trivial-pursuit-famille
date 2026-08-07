import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTurn, resolveAnswer } from '../src/server/gameEngine';
import { SURPRISE_WHEEL, awardSurpriseBonus, bonusCount } from '../src/server/bonuses';
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

test('la roue surprise part identique vers tous les écrans', () => {
  // Signalé par le propriétaire du projet : « quand l'utilisateur lance sa roue
  // tout le monde devrait le voir, et pas uniquement l'utilisateur ». Pour cela
  // il ne suffit pas d'afficher la roue partout : il faut que tous les écrans
  // reçoivent le même quartier, sinon chacun tire le sien et la roue s'arrête
  // ailleurs d'un téléphone à l'autre — deux quartiers portent le même 50/50.
  const state = twoPlayerGame();
  awardSurpriseBonus(state, () => 0.55); // le Joker, quartier 3

  const vuePapa = createGameStateView(state, 'papa', 'papa');
  const vueFille = createGameStateView(state, 'fille', 'papa');

  assert.deepEqual(vuePapa.surpriseWheel, vueFille.surpriseWheel);
  assert.equal(SURPRISE_WHEEL[vueFille.surpriseWheel!.slot], 'camembert_joker');
  // Tant que personne n'a lancé, la roue attend : aucun écran ne la fait tourner.
  assert.equal(vuePapa.surpriseWheel!.startedAt, null);
  assert.equal(vuePapa.surpriseSpinThisTurn, true);
});

test('l’instant du lancer est commun, c’est lui qui synchronise l’animation', () => {
  const state = twoPlayerGame();
  awardSurpriseBonus(state, () => 0);

  // Ce que fait le serveur en recevant le geste du joueur actif : il n'ajoute que
  // l'instant. Le quartier, lui, ne bouge plus.
  const slotAvant = state.surpriseWheel!.slot;
  state.surpriseWheel = { ...state.surpriseWheel!, startedAt: 1_700_000_000_000 };

  for (const id of ['papa', 'fille']) {
    const vue = createGameStateView(state, id, 'papa');
    assert.equal(vue.surpriseWheel!.startedAt, 1_700_000_000_000, id);
    assert.equal(vue.surpriseWheel!.slot, slotAvant, id);
  }
});

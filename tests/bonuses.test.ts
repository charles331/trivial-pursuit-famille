import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BONUS_LOOK,
  BONUS_ROSTER,
  EMPTY_SLOT_COLOR,
  SURPRISE_WHEEL,
  awardSurpriseBonus,
  bonusCount,
  fiftyFiftyCount,
  jokerCanEarnWedge,
  useBonus,
  useLeapBonus,
  wheelSlotFor,
  useFiftyFiftyBonus,
} from '../src/server/bonuses';
import { advanceTurn, calculateMoves } from '../src/server/gameEngine';
import { DEFAULT_BOARD_CATEGORIES, buildBoard } from '../src/data/boards';
import { createGameState } from './fixtures';

// Roue = [fifty_fifty, big_leap, fifty_fifty, camembert_joker, fifty_fifty, vide].
// Un tirage vise un quartier via floor(r * 6).
const rollFiftyFifty = () => 0;    // quartier 0
const rollLeap = () => 0.2;        // quartier 1
const rollJoker = () => 0.55;      // quartier 3
const rollEmpty = () => 0.9;       // quartier 5 (le seul vide)

test('bonus mode is opt-in and surprise tiles do nothing while disabled', () => {
  const state = createGameState();

  assert.equal(awardSurpriseBonus(state), null);
  assert.equal(fiftyFiftyCount(state.players[0]), 0);
  assert.equal(state.bonusAwardedThisTurn, undefined);
  assert.notEqual(state.surpriseSpinThisTurn, true);
});

test('a surprise box grants the drawn bonus to the active player', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;

  assert.equal(awardSurpriseBonus(state, rollFiftyFifty), 'fifty_fifty');
  assert.equal(awardSurpriseBonus(state, rollJoker), 'camembert_joker');
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 1);
  assert.equal(state.bonusAwardedThisTurn, 'camembert_joker');
  assert.equal(state.surpriseSpinThisTurn, true);
  assert.equal(fiftyFiftyCount(state.players[1]), 0);
});

test('an empty wheel slot spins but grants nothing', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;

  assert.equal(awardSurpriseBonus(state, rollEmpty), null);
  assert.equal(state.surpriseSpinThisTurn, true); // la roue a bien tourné
  assert.equal(state.bonusAwardedThisTurn, null);  // mais rien de gagné
  assert.equal(fiftyFiftyCount(state.players[0]), 0);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 0);
});

test('the camembert joker arms itself for the current question, whatever the format', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { camembert_joker: 1 };
  state.currentQuestion = {
    id: 'b', categoryId: 'sciences', difficulty: 'adulte', format: 'boolean',
    question: 'Le soleil est une étoile.', options: ['Vrai', 'Faux'], correctAnswerIndex: 0,
  };

  assert.equal(useBonus(state, 'camembert_joker'), true);
  assert.equal(state.activeQuestionBonus?.type, 'camembert_joker');
  assert.deepEqual(state.activeQuestionBonus?.hiddenOptionIndexes, []);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 0);
  // Un seul bonus armé par question.
  assert.equal(useBonus(state, 'camembert_joker'), false);
});

test('50/50 consumes one bonus and hides exactly two wrong answers', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { fifty_fifty: 2 };

  assert.equal(useFiftyFiftyBonus(state, () => 0), true);
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
  assert.equal(state.activeQuestionBonus?.type, 'fifty_fifty');
  assert.equal(state.activeQuestionBonus?.hiddenOptionIndexes.length, 2);
  assert.equal(
    state.activeQuestionBonus?.hiddenOptionIndexes.includes(state.currentQuestion!.correctAnswerIndex),
    false,
  );
});

test('a 50/50 cannot be reused on the same question or without inventory', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { fifty_fifty: 1 };

  assert.equal(useFiftyFiftyBonus(state), true);
  assert.equal(useFiftyFiftyBonus(state), false);
  assert.equal(fiftyFiftyCount(state.players[0]), 0);

  state.activeQuestionBonus = null;
  assert.equal(useFiftyFiftyBonus(state), false);
});

test('50/50 is available only during a live question', () => {
  const state = createGameState({ phase: 'rolling' });
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { fifty_fifty: 1 };

  assert.equal(useFiftyFiftyBonus(state), false);
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
});

// --- Un Joker qui ne peut rien rapporter --------------------------------------
// Signalé en partie : « j'ai gagné un joker pour avoir un camembert, mais je les
// ai déjà tous ». Il était alors consommé en silence, sans effet.

test('the joker is worthless once every wedge is owned', () => {
  assert.equal(jokerCanEarnWedge([], 'histoire', 6), true);
  assert.equal(
    jokerCanEarnWedge(
      ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports'],
      'popculture',
      6,
    ),
    false,
  );
});

test('the joker is worthless on a category already collected', () => {
  // Le camembert existe déjà : le rejouer ne donnerait rien, alors qu'il vaudra
  // son prix sur une autre case.
  assert.equal(jokerCanEarnWedge(['histoire'], 'histoire', 6), false);
  assert.equal(jokerCanEarnWedge(['histoire'], 'sciences', 6), true);
});

test('a joker that cannot earn anything is not consumed', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { camembert_joker: 1 };
  // La carte en cours est en histoire, catégorie déjà acquise.
  state.players[0].wedges = ['histoire'];

  assert.equal(useBonus(state, 'camembert_joker'), false);
  assert.equal(state.activeQuestionBonus, undefined);
  // Il reste en poche pour une case dont le camembert manque encore.
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 1);
});

test('the wheel hands a 50/50 instead of a dead joker', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.settings.wedgesToWin = 1;
  state.players[0].wedges = ['histoire']; // le compte est fait

  // rollJoker viserait le quartier Joker : il devient un 50/50, utile jusqu'au bout.
  assert.equal(awardSurpriseBonus(state, rollJoker), 'fifty_fifty');
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 0);
});

test('the wheel still hands a joker to a player who can use it', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.settings.wedgesToWin = 6;

  assert.equal(awardSurpriseBonus(state, rollJoker), 'camembert_joker');
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 1);
});

test('la roue décrite par le serveur porte bien le résultat annoncé', () => {
  // C'est l'invariant qui rend la roue partageable : le quartier d'arrivée est
  // décidé une fois pour toute la table, et il doit annoncer le bon lot. Chaque
  // client le tirait de son côté, et deux quartiers portent le même 50/50 — la
  // roue s'arrêtait donc ailleurs selon l'écran.
  const state = createGameState();
  state.settings.enableBonuses = true;

  for (const roll of [rollFiftyFifty, rollLeap, rollJoker, rollEmpty]) {
    const outcome = awardSurpriseBonus(state, roll);
    const wheel = state.surpriseWheel;
    assert.ok(wheel, 'la roue doit être décrite dans l’état');
    assert.equal(SURPRISE_WHEEL[wheel!.slot], outcome);
    // Elle attend son lancement : c'est le geste du joueur qui donne l'instant.
    assert.equal(wheel!.startedAt, null);
  }
});

test('les six résultats possibles trouvent tous un quartier', () => {
  // Un tirage au bord du quartier ne doit pas sortir de la roue : sans le repli,
  // `wheelSlotFor` renverrait `undefined` et la roue s'arrêterait sur le premier.
  for (const outcome of ['fifty_fifty', 'camembert_joker', 'big_leap', null] as const) {
    for (const r of [0, 0.49, 0.999]) {
      const slot = wheelSlotFor(outcome, () => r);
      assert.equal(SURPRISE_WHEEL[slot], outcome, `${outcome} à r=${r}`);
    }
  }
});

/* ------------------------------------------------------- Le Grand saut */

/**
 * Le vrai plateau, et non le plateau de test à trois cases : le Grand saut se
 * juge sur les destinations qu'il ouvre, et un plateau minuscule les ramène
 * toutes au point de départ. C'est aussi ce que joue la famille.
 */
function leapState() {
  const board = buildBoard('wheel', DEFAULT_BOARD_CATEGORIES);
  const state = createGameState({ phase: 'moving', diceValue: 3 });
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { big_leap: 1 };
  state.players[0].currentTileId = board.tiles[0].id;
  state.possibleMoves = calculateMoves(board.tiles[0].id, 3, board);
  return { state, board };
}

test('le Grand saut double le dé et rouvre le choix de la destination', () => {
  const { state, board } = leapState();
  const avant = [...state.possibleMoves];

  assert.equal(useLeapBonus(state, board), true);
  assert.equal(state.bigLeapThisTurn, 6);
  assert.deepEqual(state.possibleMoves, calculateMoves(board.tiles[0].id, 6, board));
  assert.notDeepEqual(state.possibleMoves, avant, 'le saut doit ouvrir d’autres cases');
  // Le dé garde sa face : c'est le nombre de pas qui change, pas l'objet.
  assert.equal(state.diceValue, 3);
  assert.equal(bonusCount(state.players[0], 'big_leap'), 0);
});

test('un seul Grand saut par tour, même avec deux jetons en poche', () => {
  const { state, board } = leapState();
  state.players[0].bonuses = { big_leap: 2 };

  assert.equal(useLeapBonus(state, board), true);
  // Sans cette garde, deux jetons quadruplent le dé et le pion traverse le
  // plateau d'un bout à l'autre.
  assert.equal(useLeapBonus(state, board), false);
  assert.equal(state.bigLeapThisTurn, 6);
  assert.equal(bonusCount(state.players[0], 'big_leap'), 1, 'le second jeton reste en poche');
});

test('le Grand saut ne se dépense qu’en phase de déplacement', () => {
  for (const phase of ['rolling', 'question', 'evaluating', 'game_over'] as const) {
    const { state, board } = leapState();
    state.phase = phase;
    assert.equal(useLeapBonus(state, board), false, `phase ${phase}`);
    assert.equal(bonusCount(state.players[0], 'big_leap'), 1);
  }
});

test('sans jeton, sans dé ou bonus désactivés, le Grand saut est refusé', () => {
  const sansJeton = leapState();
  sansJeton.state.players[0].bonuses = {};
  assert.equal(useLeapBonus(sansJeton.state, sansJeton.board), false);

  const sansDe = leapState();
  sansDe.state.diceValue = null;
  assert.equal(useLeapBonus(sansDe.state, sansDe.board), false);

  const sansBonus = leapState();
  sansBonus.state.settings.enableBonuses = false;
  assert.equal(useLeapBonus(sansBonus.state, sansBonus.board), false);
  assert.equal(bonusCount(sansBonus.state.players[0], 'big_leap'), 1, 'rien n’est prélevé');
});

test('un saut qui n’ouvre aucune case neuve n’est pas consommé', () => {
  // Même règle que le Joker camembert qui ne peut rien rapporter : un lot
  // dépensé sans effet est une punition déguisée en récompense.
  const { state, board } = leapState();
  state.possibleMoves = calculateMoves(state.players[0].currentTileId, 6, board);

  assert.equal(useLeapBonus(state, board), false);
  assert.equal(bonusCount(state.players[0], 'big_leap'), 1);
  assert.equal(state.bigLeapThisTurn ?? null, null);
});

test('le Grand saut ne survit pas au tour', () => {
  // `bigLeapThisTurn` décrit *ce* déplacement, comme `diceThrow` décrit *ce*
  // lancer : tout chemin qui ramène au lancer doit l'effacer, sinon le tour
  // suivant croit qu'un saut a déjà été joué et refuse le bonus.
  const { state, board } = leapState();
  useLeapBonus(state, board);
  assert.equal(state.bigLeapThisTurn, 6);

  state.lastAnswerResult = { playerId: 'host', isCorrect: false, selectedOption: 0, earnedWedge: null };
  advanceTurn(state);
  assert.equal(state.bigLeapThisTurn, null);
});

test('la roue garde un quartier vide et n’a pas retiré de 50/50', () => {
  // La roue promet un lot deux fois sur trois : le Grand saut prend l'un des
  // deux quartiers vides, pas un des trois 50/50 — seul lot utile sur tous les
  // formats de carte.
  assert.equal(SURPRISE_WHEEL.length, 6);
  assert.equal(SURPRISE_WHEEL.filter(slot => slot === 'fifty_fifty').length, 3);
  assert.equal(SURPRISE_WHEEL.filter(slot => slot === 'big_leap').length, 1);
  assert.equal(SURPRISE_WHEEL.filter(slot => slot === null).length, 1);
});

test('la roue distribue bien un Grand saut', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;

  assert.equal(awardSurpriseBonus(state, rollLeap), 'big_leap');
  assert.equal(bonusCount(state.players[0], 'big_leap'), 1);
  assert.equal(bonusCount(state.players[1], 'big_leap'), 0);
  assert.equal(SURPRISE_WHEEL[state.surpriseWheel!.slot], 'big_leap');
});

test('chaque bonus a son habillage : ni emoji manquant, ni couleur en double', () => {
  // Quatre écrans lisent cette table — la roue, son annonce, la pastille de
  // l'en-tête et la liste des joueurs. Un bonus oublié y donnait un quartier
  // blanc sans emoji, indiscernable d'une case vide.
  for (const type of BONUS_ROSTER) {
    const look = BONUS_LOOK[type];
    assert.ok(look, `bonus sans habillage : ${type}`);
    assert.ok(look.emoji.length > 0 && look.label.length > 0, type);
    assert.notEqual(look.color, EMPTY_SLOT_COLOR, `${type} porte la couleur de la case vide`);
  }
  const couleurs = new Set(BONUS_ROSTER.map(type => BONUS_LOOK[type].color));
  assert.equal(couleurs.size, BONUS_ROSTER.length, 'deux bonus partagent une couleur');
});

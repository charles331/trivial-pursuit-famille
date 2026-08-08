import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBoard, resolveBoardCategories } from '../src/data/boards';
import { CATEGORIES } from '../src/data/categories';
import { pickQuestionForPlayer } from '../src/server/questionSelection';
import { resolveReaderId } from '../src/server/turnRoles';
import { QUESTIONS_DATABASE } from '../src/data/questions';
import { CategoryId, DifficultyLevel, GameState, Player } from '../src/types';

/**
 * Écarts entre ce que le salon propose et ce que la partie fait réellement.
 *
 * Chacun de ces tests vient d'un écart mesuré, pas d'une inquiétude : ce sont les
 * cas où un réglage existait sans que le jeu le respecte, ou l'inverse.
 */

function joueur(id: string, connecte = true): Player {
  return {
    id, name: id, avatarId: 'fox', color: '#38BDF8', difficulty: 'adulte',
    wedges: [], currentTileId: 0, isHost: id === 'a', isReady: true, score: 0,
    correctAnswersCount: 0, totalAnswersCount: 0, isConnected: connecte,
  };
}

function etat(joueurs: Player[], reglages: Partial<GameState['settings']> = {}): GameState {
  return {
    roomCode: 'T', phase: 'question', activePlayerIndex: 0, players: joueurs,
    settings: {
      roomCode: 'T', boardType: 'wheel',
      selectedCategories: ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports'],
      timerSeconds: 60, wedgesToWin: 6, ...reglages,
    },
    diceValue: null, diceThrow: null, possibleMoves: [], selectedTileId: null,
    currentQuestion: null, questionStartTime: null, lastAnswerResult: null, winnerId: null,
    questionsPool: [...QUESTIONS_DATABASE], usedQuestionIds: [],
  } as unknown as GameState;
}

const formatsServis = (state: GameState, niveau: DifficultyLevel, tours = 300) => {
  const compte: Record<string, number> = { mcq: 0, boolean: 0, open: 0 };
  const cats = state.settings.selectedCategories;
  for (let i = 0; i < tours; i += 1) {
    const q = pickQuestionForPlayer(state, cats[i % cats.length], niveau);
    compte[q.format ?? 'mcq'] += 1;
  }
  return compte;
};

test('une catégorie inconnue n’atteint jamais le plateau', () => {
  // Le réglage arrive du client, et une case dont la catégorie n'existe pas dans
  // `CATEGORIES` fait planter le rendu : « Cannot read properties of undefined
  // (reading 'color') ». Un salon repris du disque après le retrait d'une
  // catégorie suffirait à l'obtenir.
  const bidon = ['pokemon', 'histoire', 'sciences'] as unknown as CategoryId[];
  const retenues = resolveBoardCategories(bidon);

  for (const categoryId of retenues) {
    assert.ok(categoryId in CATEGORIES, `${categoryId} n’est pas une catégorie connue`);
  }
  for (const tile of buildBoard('wheel', bidon).tiles) {
    if (!tile.categoryId) continue;
    assert.ok(tile.categoryId in CATEGORIES, `case ${tile.id} : ${tile.categoryId}`);
  }
});

test('une carte ouverte n’est servie que si quelqu’un peut la lire', () => {
  // Le mode lecteur ne suffit pas : il faut un lecteur réel. Une partie solo en
  // mode lecteur servait des cartes ouvertes que personne ne détenait, et le
  // joueur actif n'avait plus qu'à les passer — comptées manquées.
  const solo = formatsServis(etat([joueur('a')], { isReaderMode: true }), 'adulte');
  assert.equal(solo.open, 0, 'aucune carte ouverte sans lecteur possible');

  // Deux joueurs dont le second est déconnecté : même situation.
  const abandonne = formatsServis(
    etat([joueur('a'), joueur('b', false)], { isReaderMode: true }), 'adulte',
  );
  assert.equal(abandonne.open, 0, 'aucune carte ouverte si le seul autre joueur a quitté');

  // Avec une table qui peut lire, elles reviennent.
  const table = formatsServis(
    etat([joueur('a'), joueur('b'), joueur('c')], { isReaderMode: true }), 'adulte',
  );
  assert.ok(table.open > 0, 'les cartes ouvertes sortent quand un lecteur existe');
});

test('hors mode lecteur, aucune carte ouverte ne sort — et le reste tient sa part', () => {
  // Voulu : hors mode lecteur, personne ne reçoit la réponse d'une carte ouverte.
  // Mais les vrai/faux doivent, eux, continuer de sortir.
  const compte = formatsServis(etat([joueur('a'), joueur('b')]), 'adulte');
  assert.equal(compte.open, 0);
  assert.ok(compte.boolean > 0, 'les vrai/faux ne dépendent pas du mode lecteur');
});

test('le niveau et la catégorie demandés sont toujours respectés', () => {
  // Plutôt resservir une carte déjà vue que poser une question adulte à un enfant.
  const state = etat([joueur('a'), joueur('b')], { isReaderMode: true });
  for (const niveau of ['enfant', 'ado', 'adulte'] as DifficultyLevel[]) {
    for (const categoryId of state.settings.selectedCategories) {
      const q = pickQuestionForPlayer(state, categoryId, niveau);
      assert.equal(q.difficulty, niveau, `${categoryId} / ${niveau}`);
      assert.equal(q.categoryId, categoryId, `${categoryId} / ${niveau}`);
    }
  }
});

test('sans lecteur possible, plus rien n’annonce un lecteur', () => {
  // Vu en partie solo, capture à l'appui : le bandeau annonçait « Papa vous lit
  // la carte à voix haute » à Papa lui-même. `resolveReaderId` rend bien `null`,
  // mais le repli d'affichage retombe sur le joueur actif — c'est donc la
  // condition d'affichage qui manquait, et elle est la même que celle du
  // masquage. Les trois conditions du modal se déduisent d'ici : elles doivent
  // toutes exiger un lecteur résolu, pas seulement le réglage.
  const solo = etat([joueur('a')], { isReaderMode: true });
  assert.equal(resolveReaderId(solo.players, 0), null, 'un joueur seul n’a pas de lecteur');

  // Deux joueurs dont l'autre a quitté : même situation, autre cause.
  const abandonne = etat([joueur('a'), joueur('b', false)], { isReaderMode: true });
  assert.equal(resolveReaderId(abandonne.players, 0), null);

  // Dès qu'un second joueur est connecté, le lecteur existe et le bandeau a un sens.
  const table = etat([joueur('a'), joueur('b')], { isReaderMode: true });
  assert.equal(resolveReaderId(table.players, 0), 'b');
});

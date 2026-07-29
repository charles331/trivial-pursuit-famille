import React from 'react';
import { GameState } from '../types';
import { Dice3D } from './Dice3D';
import { openingRollStandings, pendingRollerId } from '../server/openingRoll';
import { AVATARS } from '../data/avatars';

interface OpeningRollProps {
  gameState: GameState;
  currentUserId: string;
  onRoll: () => void;
}

/**
 * Le lancé d'ouverture, joué avant le premier tour.
 *
 * Le premier tour ne revient plus au siège de l'organisateur : chacun lance un
 * dé et le plus haut score ouvre la partie. Les égalités se rejouent entre les
 * joueurs concernés, manche après manche.
 */
export const OpeningRoll: React.FC<OpeningRollProps> = ({ gameState, currentUserId, onRoll }) => {
  const state = gameState.openingRoll;
  if (!state) return null;

  const isLocalMode = gameState.settings.isLocalMode === true;
  const isHost = gameState.players.find(player => player.id === currentUserId)?.isHost === true;
  const playerOf = (id: string) => gameState.players.find(player => player.id === id);

  const standings = openingRollStandings(state);

  // En pass & play les jets se suivent : l'appareil passe de main en main et un
  // seul siège est attendu à la fois. En ligne chacun lance quand il veut, donc
  // tous ceux qui n'ont pas encore lancé sont attendus simultanément — n'en
  // désigner qu'un laissait les autres croire que leur tour n'était pas venu.
  const sequentialId = isLocalMode ? pendingRollerId(state) : null;
  const sequentialPlayer = sequentialId ? playerOf(sequentialId) : undefined;

  const hasRolled = (playerId: string) => playerId in state.rolls;
  const isAwaited = (playerId: string) =>
    isLocalMode ? playerId === sequentialId : !hasRolled(playerId);

  const mayRoll = isLocalMode
    ? isHost && sequentialId !== null
    : state.contenders.includes(currentUserId) && !hasRolled(currentUserId);

  const myRoll = state.rolls[currentUserId] ?? null;
  const stillToRoll = state.contenders
    .filter(id => !hasRolled(id) && id !== currentUserId)
    .map(id => playerOf(id)?.name ?? 'Joueur');

  // Une égalité réduit la liste aux seuls joueurs à départager. Sans un mot
  // explicite, les autres se voyaient simplement disparaître de l'écran.
  const isOut = !isLocalMode && !state.contenders.includes(currentUserId);
  const contenderNames = state.contenders.map(id => playerOf(id)?.name ?? 'Joueur');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950 p-4">
      <div className="my-auto w-full max-w-md space-y-4 rounded-3xl border-2 border-amber-500/50 bg-slate-900 p-5 text-white shadow-2xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-amber-300">
            {state.round > 1 ? `Égalité — manche ${state.round}` : 'Lancé d’ouverture'}
          </p>
          <h2 className="mt-1 text-xl font-black">Qui commence ?</h2>
          <p className="mt-1 text-sm text-slate-300">
            {state.round > 1
              ? 'Les joueurs à égalité relancent. Le plus haut dé ouvre la partie.'
              : 'Chacun lance une fois. Le plus haut dé ouvre la partie.'}
          </p>
        </div>

        {/* Le tableau des jets de la manche */}
        <ul className="space-y-1.5">
          {standings.map(({ playerId, roll }) => {
            const player = playerOf(playerId);
            const avatar = AVATARS.find(candidate => candidate.id === player?.avatarId);
            const isMe = playerId === currentUserId;
            const awaited = isAwaited(playerId);

            return (
              <li
                key={playerId}
                className={`flex items-center gap-2.5 rounded-2xl border p-2 transition-colors ${
                  awaited
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: player?.color ?? '#334155' }}
                >
                  {avatar?.emoji ?? '🎲'}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  {player?.name ?? 'Joueur'}
                  {isMe && <span className="ml-1 text-xs font-black text-amber-300">· vous</span>}
                </span>
                {roll === null ? (
                  <span
                    className={`shrink-0 text-xs font-bold ${
                      awaited ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    {isMe ? 'à vous de lancer' : awaited ? 'doit lancer' : 'en attente'}
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-base font-black text-amber-300">
                    {roll}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {/* Le dé, l'attente, ou le mot aux joueurs sortis du départage */}
        {isOut ? (
          <p className="rounded-2xl bg-slate-950/60 p-3 text-center text-sm font-bold text-slate-300">
            Vous n’êtes plus dans le départage.{' '}
            <span className="text-amber-300">{contenderNames.join(' et ')}</span> se disputent
            l’ouverture.
          </p>
        ) : mayRoll ? (
          <div className="flex flex-col items-center gap-2">
            {isLocalMode && sequentialPlayer && (
              <p className="text-center text-sm font-bold text-amber-200">
                Passez l’appareil à {sequentialPlayer.name}
              </p>
            )}
            <Dice3D value={null} isRolling={false} onRollRequest={onRoll} size={84} compact />
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-950/60 p-3 text-center text-sm font-bold text-slate-300">
            {myRoll !== null && <>Vous avez fait <strong className="text-amber-300">{myRoll}</strong>. </>}
            {stillToRoll.length > 0
              ? `On attend ${stillToRoll.join(', ')}…`
              : 'On compte les dés…'}
          </p>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Crown, Dices, Hourglass, SkipForward, Smartphone, Timer, Trophy } from 'lucide-react';
import { FirstPlayerRoll, GameState } from '../types';
import { AVATARS } from '../data/avatars';
import { Dice3D } from './Dice3D';
import { isExpectedToRoll, pendingRollers, rankDrawRolls, tieBreakOf } from '../server/firstPlayerDraw';

interface FirstPlayerDrawProps {
  gameState: GameState;
  currentUserId: string;
  isHost: boolean;
  /** Lance le dé, pour soi en ligne ou pour le joueur annoncé en pass & play. */
  onRollFirstPlayer: (playerId?: string) => void;
  /** Départage sans attendre les joueurs qui n'ont pas lancé. */
  onEndDraw: () => void;
  /** Ferme l'annonce du vainqueur et laisse la partie commencer. */
  onContinue: () => void;
}

/** Temps de réaction lisible : « 1,4 s ». */
function formatSeconds(elapsedMs: number): string {
  return `${(elapsedMs / 1000).toFixed(1).replace('.', ',')} s`;
}

/** Délai avant que l'organisateur puisse forcer le tirage, en millisecondes. */
const FORCE_DRAW_DELAY_MS = 20_000;

/** Durée de la culbute du dé avant qu'il ne montre son résultat. */
const TUMBLE_MS = 850;

/**
 * Deux mises en scène pour un même tirage.
 *
 * **En ligne**, tout le monde lance en même temps, chacun sur son téléphone :
 * le dé affiché est strictement personnel. Il ne réagit qu'au propre lancer du
 * joueur et reste à l'écran une fois lancé, posé sur son résultat, pendant que
 * les lancers des autres n'animent que le tableau en dessous. Sans cela, chaque
 * lancer reçu ferait culbuter — et bloquerait — le dé de tous les joueurs qui
 * n'ont pas encore joué.
 *
 * **En pass & play**, l'appareil est unique : le dé passe de main en main, se
 * vide entre deux joueurs, et c'est le dernier lancer de la table qui l'anime.
 */
export const FirstPlayerDraw: React.FC<FirstPlayerDrawProps> = ({
  gameState,
  currentUserId,
  isHost,
  onRollFirstPlayer,
  onEndDraw,
  onContinue,
}) => {
  const draw = gameState.firstPlayerDraw ?? null;
  const rolls = useMemo(() => draw?.rolls ?? [], [draw?.rolls]);
  const isLocalMode = gameState.settings.isLocalMode === true;
  const winnerId = draw?.winnerId ?? null;
  // En pass & play, le chronomètre mesurerait le temps de se passer l'appareil :
  // il n'est ni affiché ni utilisé, et les égalités se jouent au sort.
  const showsTiming = tieBreakOf(gameState) === 'speed';

  const [isTumbling, setIsTumbling] = useState(false);
  const [hasRequestedRoll, setHasRequestedRoll] = useState(false);
  const [recentRoll, setRecentRoll] = useState<FirstPlayerRoll | null>(null);
  const [chronoMs, setChronoMs] = useState(0);
  const [canForce, setCanForce] = useState(false);
  // Retient l'annonce du vainqueur le temps qu'un dé encore en l'air atterrisse
  // et soit lu : le dernier lancer tranche le tirage dans la même mise à jour
  // serveur, et le verdict cannibaliserait sa propre animation.
  const [holdsVerdict, setHoldsVerdict] = useState(false);
  const rollGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rollsByPlayer = useMemo(() => {
    const byPlayer = new Map<string, FirstPlayerRoll>();
    for (const roll of rolls) byPlayer.set(roll.playerId, roll);
    return byPlayer;
  }, [rolls]);

  // Même règle d'attente que le serveur : un absent ne retient pas le tirage.
  const pending = useMemo(() => pendingRollers(gameState), [gameState.players, rolls]);
  const localTurnPlayer = isLocalMode ? pending[0] ?? null : null;
  const myRoll = rollsByPlayer.get(currentUserId) ?? null;
  const isMyTurnToRoll = isLocalMode
    ? isHost && Boolean(localTurnPlayer)
    : pending.some(player => player.id === currentUserId);

  const canRollNow = !winnerId && isMyTurnToRoll && !isTumbling && !hasRequestedRoll;

  /**
   * Le vainqueur n'est annoncé qu'une fois le dé retombé et lu : le dernier
   * joueur à lancer verrait sinon le verdict s'afficher pendant que son dé
   * roule encore, et apprendrait le résultat avant son propre dé.
   */
  const announcedWinnerId = isTumbling || holdsVerdict ? null : winnerId;

  const clearRollGuard = () => {
    if (rollGuardRef.current) {
      clearTimeout(rollGuardRef.current);
      rollGuardRef.current = null;
    }
  };

  // En ligne : mon dé n'atterrit que sur MON lancer ; ceux des autres joueurs
  // ne le touchent pas. Au rechargement de page, un lancer déjà connu s'affiche
  // sans rejouer la culbute.
  useEffect(() => {
    if (isLocalMode || !myRoll) return;
    if (!isTumbling && !hasRequestedRoll) return;

    setHasRequestedRoll(false);
    clearRollGuard();
    setHoldsVerdict(true);
    const landTimer = setTimeout(() => setIsTumbling(false), TUMBLE_MS);
    const readTimer = setTimeout(() => setHoldsVerdict(false), TUMBLE_MS + 1200);
    return () => {
      clearTimeout(landTimer);
      clearTimeout(readTimer);
    };
  }, [isLocalMode, myRoll?.order]);

  // Pass & play : un lancer qui arrive fait tomber le dé partagé, puis reste
  // affiché le temps d'être lu.
  useEffect(() => {
    if (!isLocalMode) return;

    const lastRoll = rolls[rolls.length - 1] ?? null;
    if (!lastRoll) {
      setRecentRoll(null);
      return;
    }

    setHasRequestedRoll(false);
    setIsTumbling(true);
    setHoldsVerdict(true);
    const tumbleTimer = setTimeout(() => {
      setIsTumbling(false);
      setRecentRoll(lastRoll);
    }, TUMBLE_MS);
    const readTimer = setTimeout(() => setHoldsVerdict(false), TUMBLE_MS + 1200);

    return () => {
      clearTimeout(tumbleTimer);
      clearTimeout(readTimer);
    };
  }, [isLocalMode, rolls.length]);

  // Passage de relais en pass & play : le dé se vide pour le joueur suivant.
  useEffect(() => {
    if (!isLocalMode || !recentRoll || winnerId) return;

    const handoverTimer = setTimeout(() => setRecentRoll(null), 1600);
    return () => clearTimeout(handoverTimer);
  }, [isLocalMode, recentRoll?.order, winnerId]);

  /**
   * Chronomètre indicatif, réservé aux parties en ligne où la vitesse départage.
   * Il compte depuis l'affichage local — l'horloge qui fait foi est celle du
   * serveur — et ne dépend pas des lancers des autres joueurs, qui ne doivent
   * pas le remettre à zéro.
   */
  useEffect(() => {
    if (!showsTiming || winnerId || !isMyTurnToRoll) {
      setChronoMs(0);
      return;
    }

    const startedAt = Date.now();
    const ticker = setInterval(() => setChronoMs(Date.now() - startedAt), 100);
    return () => clearInterval(ticker);
  }, [showsTiming, winnerId, isMyTurnToRoll]);

  // La sortie de secours de l'organisateur n'apparaît qu'après une vraie attente.
  useEffect(() => {
    if (!isHost || winnerId) return;

    setCanForce(false);
    const delay = setTimeout(() => setCanForce(true), FORCE_DRAW_DELAY_MS);
    return () => clearTimeout(delay);
  }, [isHost, winnerId]);

  useEffect(() => () => clearRollGuard(), []);

  const handleRoll = () => {
    if (!canRollNow) return;

    setHasRequestedRoll(true);
    setIsTumbling(true);
    onRollFirstPlayer(localTurnPlayer?.id);

    // Filet de sécurité : si le serveur ne répond pas, le dé redevient jouable.
    rollGuardRef.current = setTimeout(() => {
      setHasRequestedRoll(false);
      setIsTumbling(false);
      rollGuardRef.current = null;
    }, 2500);
  };

  /**
   * À qui appartient le dé partagé du pass & play : celui qui vient de lancer
   * tant que son résultat est à l'écran, sinon celui qui doit lancer. Changer de
   * propriétaire remonte le dé, qui repart donc face neutre au lieu de garder le
   * résultat du joueur précédent — ce qui se lirait comme un résultat déjà acquis.
   */
  const dieOwnerId = isTumbling || recentRoll
    ? rolls[rolls.length - 1]?.playerId
    : localTurnPlayer?.id ?? currentUserId;

  const ranked = useMemo(() => rankDrawRolls(gameState), [rolls, showsTiming]);
  const rankOf = (playerId: string) => ranked.findIndex(roll => roll.playerId === playerId);
  const winner = announcedWinnerId
    ? gameState.players.find(player => player.id === announcedWinnerId) ?? null
    : null;
  const winnerRoll = announcedWinnerId ? rollsByPlayer.get(announcedWinnerId) ?? null : null;
  const tiedWithWinner = winnerRoll
    ? ranked.filter(roll => roll.value === winnerRoll.value && roll.playerId !== winnerRoll.playerId)
    : [];

  const orderedPlayers = announcedWinnerId
    ? [...gameState.players].sort((left, right) => {
        const leftRank = rankOf(left.id);
        const rightRank = rankOf(right.id);
        return (leftRank < 0 ? Number.MAX_SAFE_INTEGER : leftRank)
          - (rightRank < 0 ? Number.MAX_SAFE_INTEGER : rightRank);
      })
    : gameState.players;

  const headline = () => {
    if (winner) return `${winner.name} ouvre la partie !`;
    if (isLocalMode) {
      return localTurnPlayer ? `Au tour de ${localTurnPlayer.name} de lancer` : 'Tirage en cours…';
    }
    if (isTumbling) return 'Le dé roule…';
    if (myRoll) return pending.length === 0 ? 'Tout le monde a lancé !' : 'En attente des autres joueurs…';
    if (isMyTurnToRoll) return 'Lancez le dé !';
    return 'Tirage en cours…';
  };

  const pendingLine = pending.length === 0
    ? 'Tout le monde a lancé.'
    : `${pending.length} joueur${pending.length > 1 ? 's' : ''} doi${
        pending.length > 1 ? 'vent' : 't'
      } encore lancer.`;

  return (
    <div className="flex w-full flex-1 items-start justify-center p-3 sm:p-5">
      <div className="w-full max-w-lg space-y-4">
        {/* ------------------------------------------------------------- règle */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/60 to-slate-900 p-4 text-center shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
            <Dices className="h-4 w-4" />
            Qui commence ?
          </div>
          <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">{headline()}</h2>
          <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-300 sm:text-xs">
            {showsTiming ? (
              <>
                Un seul lancer chacun, tous en même temps. Le plus haut score ouvre la partie ;
                en cas d’égalité, c’est le lancer le plus rapide qui l’emporte.
              </>
            ) : (
              <>
                Un seul lancer chacun, à tour de rôle. Le plus haut score ouvre la partie ;
                en cas d’égalité, le sort tranche.
              </>
            )}
          </p>
        </div>

        {/* -------------------------------------------------------------- le dé */}
        {!announcedWinnerId && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-3 shadow-xl">
            {isLocalMode ? (
              <>
                {localTurnPlayer && (
                  <div className="mb-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950/70 px-3 py-2 text-xs font-bold text-amber-300">
                    <Smartphone className="h-4 w-4 shrink-0" />
                    <span className="truncate">Passez l’appareil à {localTurnPlayer.name}</span>
                  </div>
                )}

                {/* Le dé reste à l'écran pendant la dernière culbute, même si
                    plus personne n'est attendu : il doit atterrir avant le verdict. */}
                {isMyTurnToRoll || isTumbling || recentRoll ? (
                  <Dice3D
                    key={dieOwnerId}
                    value={isTumbling ? null : recentRoll?.value ?? null}
                    isRolling={isTumbling}
                    onRollRequest={handleRoll}
                    disabled={!canRollNow}
                    size={78}
                    compact
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Hourglass className="h-8 w-8 animate-pulse text-amber-400" />
                    <p className="text-sm font-bold text-slate-200">Le tirage est en cours.</p>
                    <p className="text-[11px] font-medium text-slate-400">{pendingLine}</p>
                  </div>
                )}
              </>
            ) : isMyTurnToRoll || myRoll ? (
              // En ligne : le dé personnel du joueur. Une fois lancé, il reste
              // posé sur son résultat pendant que le tableau vit en dessous.
              <>
                {/* Le bouton reste visible tant que le dé roule, puis s'efface
                    quand le résultat est posé : plus rien à lancer. */}
                <Dice3D
                  key="own-die"
                  value={isTumbling ? null : myRoll?.value ?? null}
                  isRolling={isTumbling}
                  onRollRequest={myRoll && !isTumbling ? undefined : handleRoll}
                  disabled={!canRollNow}
                  size={78}
                  compact
                />
                {!myRoll && showsTiming && (
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
                    <Timer className="h-3.5 w-3.5 text-amber-400" />
                    Temps de réaction : {formatSeconds(chronoMs)}
                  </div>
                )}
                {myRoll && !isTumbling && (
                  <div className="mt-1 space-y-0.5 text-center">
                    <p className="text-sm font-bold text-slate-200">
                      Vous avez fait <strong className="text-amber-300">{myRoll.value}</strong>
                      {showsTiming ? ` en ${formatSeconds(myRoll.elapsedMs)}` : ''}.
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">{pendingLine}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Hourglass className="h-8 w-8 animate-pulse text-amber-400" />
                <p className="text-sm font-bold text-slate-200">Le tirage est en cours.</p>
                <p className="text-[11px] font-medium text-slate-400">{pendingLine}</p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------ tableau des lancers */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span>Lancers du tirage</span>
            <span className="normal-case tracking-normal text-slate-500">
              {rolls.length}/{rolls.length + pending.length}
            </span>
          </div>
          <ul className="divide-y divide-slate-800/80">
            {orderedPlayers.map(player => {
              const roll = rollsByPlayer.get(player.id) ?? null;
              const isWinner = player.id === announcedWinnerId;
              const avatar = AVATARS.find(candidate => candidate.id === player.avatarId) || AVATARS[0];
              const isAway = !isExpectedToRoll(player);

              return (
                <li
                  key={player.id}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
                    isWinner ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-lg shadow-md"
                      style={{ backgroundColor: player.color }}
                    >
                      {avatar.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-100">
                        <span className="truncate">{player.name}</span>
                        {isWinner && <Crown className="h-4 w-4 shrink-0 text-amber-400" />}
                        {player.id === currentUserId && !isLocalMode && (
                          <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                            VOUS
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">
                        {roll
                          ? showsTiming
                            ? `Lancé en ${formatSeconds(roll.elapsedMs)}`
                            : 'A lancé'
                          : isAway
                          ? 'Déconnecté — hors tirage'
                          : 'N’a pas encore lancé'}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {roll ? (
                      <motion.div
                        key={`value-${roll.order}`}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 text-lg font-black ${
                          isWinner
                            ? 'border-amber-400 bg-amber-400 text-slate-950'
                            : 'border-slate-700 bg-slate-950 text-slate-200'
                        }`}
                      >
                        {roll.value}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 text-slate-600"
                      >
                        <Dices className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>

        {/* -------------------------------------------------------- verdict final */}
        {winner && winnerRoll && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-slate-900 p-4 text-center shadow-2xl"
          >
            <Trophy className="mx-auto h-8 w-8 text-amber-400" />
            <p className="text-sm font-bold leading-relaxed text-slate-100">
              {tiedWithWinner.length === 0 ? (
                <>
                  {winner.name} sort un <strong className="text-amber-300">{winnerRoll.value}</strong> et
                  ouvre la partie.
                </>
              ) : showsTiming ? (
                <>
                  Égalité à <strong className="text-amber-300">{winnerRoll.value}</strong> :{' '}
                  {winner.name} l’emporte grâce à son lancer en{' '}
                  <strong className="text-amber-300">{formatSeconds(winnerRoll.elapsedMs)}</strong>.
                </>
              ) : (
                <>
                  Égalité à <strong className="text-amber-300">{winnerRoll.value}</strong> :{' '}
                  le sort a désigné <strong className="text-amber-300">{winner.name}</strong>.
                </>
              )}
            </p>
            <button
              onClick={onContinue}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-black text-slate-950 shadow-lg transition-transform active:scale-95"
            >
              C’est parti !
            </button>
          </motion.div>
        )}

        {/* ------------------------------------------- sortie de secours organisateur */}
        {isHost && !winnerId && canForce && rolls.length > 0 && pending.length > 0 && (
          <button
            onClick={onEndDraw}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800"
          >
            <SkipForward className="h-4 w-4 text-amber-400" />
            Départager sans attendre les {pending.length} joueur{pending.length > 1 ? 's' : ''} manquant
            {pending.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
};

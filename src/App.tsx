import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  BonusType,
  GameState,
  GameSettings,
  Player,
  EmojiReaction,
  CategoryId,
  Question
} from './types';
import { BOARD_PRESETS } from './data/boards';
import { Lobby } from './components/Lobby';
import { InGameHeader } from './components/InGameHeader';
import { LiveChat } from './components/LiveChat';
import { LiveCameraStatusBar } from './components/LiveSpotlight';
import { isCardReadAloud } from './server/turnRoles';
import { questionRevealDelayMs, usePrefersReducedMotion } from './utils/motion';

const VictoryModal = React.lazy(() =>
  import('./components/VictoryModal').then(module => ({ default: module.VictoryModal }))
);
const FirstPlayerDraw = React.lazy(() =>
  import('./components/FirstPlayerDraw').then(module => ({ default: module.FirstPlayerDraw }))
);
const LiveCameraProvider = React.lazy(() =>
  import('./components/LiveCameraOverlay').then(module => ({ default: module.LiveCameraProvider }))
);
const GameCanvasBoard = React.lazy(() =>
  import('./components/GameCanvasBoard').then(module => ({ default: module.GameCanvasBoard }))
);
const QuestionModal = React.lazy(() =>
  import('./components/QuestionModal').then(module => ({ default: module.QuestionModal }))
);

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emojiEvent, setEmojiEvent] = useState<EmojiReaction | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [generationToken, setGenerationToken] = useState<string>('');
  // Le verdict du tirage d'ouverture reste affiché après la bascule en « rolling »,
  // le temps que la table voie qui commence et pourquoi.
  const [showDrawResult, setShowDrawResult] = useState<boolean>(false);
  const wasDrawingRef = useRef<boolean>(false);

  // Hold the question card back until the 3D pawn has actually hopped onto the
  // destination tile. The delay tracks the dice value, since a 6 takes longer
  // to walk than a 1 (see questionRevealDelayMs).
  useEffect(() => {
    if (gameState?.phase === 'question' && gameState?.currentQuestion) {
      const timer = setTimeout(() => {
        setShowQuestionModal(true);
      }, questionRevealDelayMs(gameState?.diceValue ?? null, reducedMotion));
      return () => clearTimeout(timer);
    } else {
      setShowQuestionModal(false);
    }
  }, [gameState?.phase, gameState?.currentQuestion?.id, gameState?.diceValue, reducedMotion]);

  // Le tirage bascule en « rolling » dès qu'il est tranché : on garde l'écran du
  // tirage quelques secondes de plus pour annoncer le vainqueur, sauf si la page
  // a été rechargée après coup — auquel cas il n'y a plus rien à annoncer.
  useEffect(() => {
    if (gameState?.phase === 'first_player_roll') {
      wasDrawingRef.current = true;
      setShowDrawResult(false);
      return;
    }

    if (wasDrawingRef.current && gameState?.firstPlayerDraw?.winnerId) {
      wasDrawingRef.current = false;
      setShowDrawResult(true);
      const timer = setTimeout(() => setShowDrawResult(false), 7000);
      return () => clearTimeout(timer);
    }

    wasDrawingRef.current = false;
  }, [gameState?.phase, gameState?.firstPlayerDraw?.winnerId]);

  // Extract URL parameter for join link
  const urlParams = new URLSearchParams(window.location.search);
  const codeFromUrl = urlParams.get('code');

  // Save session to localStorage and update browser URL
  const persistSession = (roomCode: string, playerId: string, sessionToken?: string) => {
    try {
      localStorage.setItem('tp_fam_session', JSON.stringify({ roomCode, playerId, sessionToken }));
      window.history.replaceState(null, '', `?code=${roomCode}`);
    } catch (err) {
      console.error('Failed to persist session:', err);
    }
  };

  // Clear session from localStorage and reset browser URL
  const clearSession = () => {
    localStorage.removeItem('tp_fam_session');
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(window.location.origin);

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      setCurrentUserId(newSocket.id || '');

      // Attempt session recovery on socket connect / reconnect
      const rawSession = localStorage.getItem('tp_fam_session');
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          if (session?.roomCode && session?.playerId) {
            setCurrentUserId(session.playerId);
            newSocket.emit('reconnect-session', session);
          }
        } catch (err) {
          localStorage.removeItem('tp_fam_session');
        }
      }
    });

    newSocket.on('room-created', (data: { roomCode: string; player: Player; gameState: GameState; generationToken?: string; sessionToken?: string }) => {
      setGameState(data.gameState);
      setGenerationToken(data.generationToken ?? '');
      if (data.player?.id) setCurrentUserId(data.player.id);
      setErrorMessage(null);
      persistSession(data.roomCode, data.player.id, data.sessionToken);
    });

    newSocket.on('room-joined', (data: { roomCode: string; player: Player; gameState: GameState; generationToken?: string; sessionToken?: string }) => {
      setGameState(data.gameState);
      setGenerationToken(data.generationToken ?? '');
      if (data.player?.id) setCurrentUserId(data.player.id);
      setErrorMessage(null);
      persistSession(data.roomCode, data.player.id, data.sessionToken);
    });

    newSocket.on('game-state-update', (updatedState: GameState) => {
      setGameState(updatedState);
      const rawSession = localStorage.getItem('tp_fam_session');
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          if (session?.playerId) setCurrentUserId(session.playerId);
        } catch (e) {}
      }
      if (updatedState && updatedState.roomCode) {
        window.history.replaceState(null, '', `?code=${updatedState.roomCode}`);
      }
    });

    newSocket.on('reconnect-failed', () => {
      clearSession();
      setGameState(null);
      setGenerationToken('');
    });

    newSocket.on('room-closed', (data?: { reason?: string }) => {
      clearSession();
      setGameState(null);
      setGenerationToken('');
      setCurrentUserId(newSocket.id || '');
      setShowQuestionModal(false);
      setEmojiEvent(null);
      setErrorMessage(data?.reason || 'Le salon a été fermé.');
    });

    newSocket.on('room-left', () => {
      clearSession();
      setGameState(null);
      setGenerationToken('');
      setCurrentUserId(newSocket.id || '');
      setShowQuestionModal(false);
      setEmojiEvent(null);
      setErrorMessage(null);
    });

    newSocket.on('emoji-received', (emojiData: EmojiReaction) => {
      setEmojiEvent(emojiData);
    });

    newSocket.on('error-msg', (msg: string) => {
      setErrorMessage(msg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handlers
  const handleCreateRoom = (playerData: Partial<Player>, isLocal: boolean) => {
    if (socket) {
      socket.emit('create-room', {
        player: playerData,
        settings: { isLocalMode: isLocal }
      });
    }
  };

  const handleJoinRoom = (roomCode: string, playerData: Partial<Player>) => {
    if (socket) {
      socket.emit('join-room', { roomCode, player: playerData });
    }
  };

  const handleAddLocalPlayer = (playerData: Partial<Player>) => {
    if (socket && gameState) {
      socket.emit('add-local-player', { roomCode: gameState.roomCode, player: playerData });
    }
  };

  const handleRemoveLocalPlayer = (playerId: string) => {
    if (socket && gameState) {
      socket.emit('remove-local-player', { roomCode: gameState.roomCode, playerId });
    }
  };

  const handleUpdatePlayer = (playerData: Partial<Player>) => {
    if (socket && gameState) {
      socket.emit('update-player', { roomCode: gameState.roomCode, player: playerData });
    }
  };

  const handleToggleReady = () => {
    if (socket && gameState) {
      socket.emit('toggle-ready', { roomCode: gameState.roomCode });
    }
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    if (socket && gameState) {
      socket.emit('update-settings', { roomCode: gameState.roomCode, settings: newSettings });
    }
  };

  const handleStartGame = () => {
    if (socket && gameState) {
      socket.emit('start-game', { roomCode: gameState.roomCode });
    }
  };

  const handleRollFirstPlayer = React.useCallback((playerId?: string) => {
    if (socket && gameState) {
      socket.emit('roll-first-player', { roomCode: gameState.roomCode, playerId });
    }
  }, [socket, gameState?.roomCode]);

  const handleEndFirstPlayerDraw = React.useCallback(() => {
    if (socket && gameState) {
      socket.emit('end-first-player-roll', { roomCode: gameState.roomCode });
    }
  }, [socket, gameState?.roomCode]);

  const handleRollDice = React.useCallback(() => {
    if (socket && gameState) {
      socket.emit('roll-dice', { roomCode: gameState.roomCode });
    }
  }, [socket, gameState?.roomCode]);

  const handleSelectTile = React.useCallback((tileId: number) => {
    if (socket && gameState) {
      socket.emit('move-player', { roomCode: gameState.roomCode, destinationTileId: tileId });
    }
  }, [socket, gameState?.roomCode]);

  const handleSubmitAnswer = (optionIndex: number) => {
    if (socket && gameState) {
      socket.emit('submit-answer', { roomCode: gameState.roomCode, optionIndex });
    }
  };

  const handleUseBonus = (bonusType: BonusType) => {
    if (socket && gameState) {
      socket.emit('use-bonus', { roomCode: gameState.roomCode, bonusType });
    }
  };

  const handleNextTurn = () => {
    if (socket && gameState) {
      socket.emit('next-turn', { roomCode: gameState.roomCode });
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (socket && gameState) {
      socket.emit('remove-player', { roomCode: gameState.roomCode, playerId });
    }
  };

  const handleSurpriseWheelDone = () => {
    if (socket && gameState) {
      socket.emit('start-question-timer', { roomCode: gameState.roomCode });
    }
  };

  const handleTogglePause = () => {
    if (socket && gameState) {
      socket.emit('toggle-pause', { roomCode: gameState.roomCode });
    }
  };

  const handleSendEmoji = (emoji: string) => {
    if (socket && gameState) {
      socket.emit('send-emoji', { roomCode: gameState.roomCode, emoji });
    }
  };

  const handleAddCustomPack = (themeName: string, questions: Question[]) => {
    if (socket && gameState) {
      socket.emit('add-custom-pack', {
        roomCode: gameState.roomCode,
        themeName,
        questions
      });
    }
  };

  const handleLeaveGame = () => {
    if (socket && gameState) {
      socket.emit('leave-room', { roomCode: gameState.roomCode });
    }
    clearSession();
    setGameState(null);
    setGenerationToken('');
    setCurrentUserId(socket?.id || '');
    setErrorMessage(null);
    setEmojiEvent(null);
    setShowQuestionModal(false);
  };

  // Render Lobby if not in active game or in lobby phase
  if (!gameState || gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        <Lobby
          gameState={gameState}
          currentUserId={currentUserId}
          generationToken={generationToken}
          codeFromUrl={codeFromUrl}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onAddLocalPlayer={handleAddLocalPlayer}
          onRemoveLocalPlayer={handleRemoveLocalPlayer}
          onUpdatePlayer={handleUpdatePlayer}
          onToggleReady={handleToggleReady}
          onUpdateSettings={handleUpdateSettings}
          onStartGame={handleStartGame}
          onAddCustomPack={handleAddCustomPack}
          onLeaveGame={handleLeaveGame}
          errorMessage={errorMessage}
        />
      </div>
    );
  }

  const isHostPlayer = gameState.players.find(player => player.id === currentUserId)?.isHost ?? false;

  // Tirage du premier joueur : plateau et questions n'ont rien à faire à l'écran
  // tant que la table ne sait pas qui ouvre la partie.
  if (gameState.phase === 'first_player_roll' || showDrawResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <InGameHeader
          gameState={gameState}
          onLeaveGame={handleLeaveGame}
          onTogglePause={handleTogglePause}
          isHost={isHostPlayer}
        />
        <React.Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-300">
              Préparation du tirage…
            </div>
          }
        >
          <FirstPlayerDraw
            gameState={gameState}
            currentUserId={currentUserId}
            isHost={isHostPlayer}
            onRollFirstPlayer={handleRollFirstPlayer}
            onEndDraw={handleEndFirstPlayerDraw}
            onContinue={() => setShowDrawResult(false)}
          />
        </React.Suspense>
      </div>
    );
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.players[0];
  const isMyTurn = activePlayer?.id === currentUserId || gameState.settings.isLocalMode || (activePlayer?.id?.startsWith('local_') ?? false);
  // Once a full-screen card covers the board there is no reason to keep its
  // SVG filters, Motion animations and pawn effects mounted underneath it.
  // Keep it visible only during the short pawn-arrival delay before the card.
  const isBoardCovered =
    showQuestionModal || gameState.phase === 'evaluating' || gameState.phase === 'game_over';
  // The live camera implies the card is read out loud: opening the reader's
  // microphone only makes sense for a card the answerer cannot see.
  const readAloud = isCardReadAloud(gameState.settings);

  const gameContent = (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Top Header Controls */}
      <InGameHeader
        gameState={gameState}
        onLeaveGame={handleLeaveGame}
        onTogglePause={handleTogglePause}
        isHost={isHostPlayer}
        currentUserId={currentUserId}
        onRemovePlayer={handleRemovePlayer}
      />

      {/* Main Game Stage */}
      {/* Bottom padding keeps the floating emoji bar from covering the board legend */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-4 pb-20 sm:pb-24 flex flex-col justify-center">
        <LiveCameraStatusBar />
        {!isBoardCovered && (
          <React.Suspense
            fallback={
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-sm font-bold text-slate-300">
                Préparation du plateau…
              </div>
            }
          >
            <GameCanvasBoard
              gameState={gameState}
              currentUserId={currentUserId}
              onRollDice={handleRollDice}
              onSelectTile={handleSelectTile}
            />
          </React.Suspense>
        )}
      </main>

      {/* Live Question Modal */}
      {showQuestionModal && gameState.phase === 'question' && gameState.currentQuestion && (
        <React.Suspense fallback={<div className="fixed inset-0 z-50 bg-slate-950" />}>
          <QuestionModal
            question={gameState.currentQuestion}
            activePlayer={activePlayer}
            timerSeconds={gameState.settings.timerSeconds}
            questionStartTime={gameState.questionStartTime}
            lastAnswerResult={gameState.lastAnswerResult}
            isMyTurn={isMyTurn}
            isReaderMode={readAloud}
            isLocalMode={gameState.settings.isLocalMode}
            allPlayers={gameState.players}
            currentUserId={currentUserId}
            onSubmitAnswer={handleSubmitAnswer}
            onUseBonus={handleUseBonus}
            onNextTurn={handleNextTurn}
            onSurpriseWheelDone={handleSurpriseWheelDone}
            wedgesToWin={gameState.settings.wedgesToWin}
            bonusesEnabled={gameState.settings.enableBonuses === true}
            bonusAwardedThisTurn={gameState.bonusAwardedThisTurn}
            surpriseSpinThisTurn={gameState.surpriseSpinThisTurn}
            activeQuestionBonus={gameState.activeQuestionBonus}
          />
        </React.Suspense>
      )}

      {/* Evaluating Stage Modal (when question is answered but waiting to click next) */}
      {gameState.phase === 'evaluating' && gameState.currentQuestion && (
        <React.Suspense fallback={<div className="fixed inset-0 z-50 bg-slate-950" />}>
          <QuestionModal
            question={gameState.currentQuestion}
            activePlayer={activePlayer}
            timerSeconds={0}
            questionStartTime={null}
            lastAnswerResult={gameState.lastAnswerResult}
            isMyTurn={isMyTurn}
            isReaderMode={readAloud}
            isLocalMode={gameState.settings.isLocalMode}
            allPlayers={gameState.players}
            currentUserId={currentUserId}
            onSubmitAnswer={handleSubmitAnswer}
            onUseBonus={handleUseBonus}
            onNextTurn={handleNextTurn}
            onSurpriseWheelDone={handleSurpriseWheelDone}
            wedgesToWin={gameState.settings.wedgesToWin}
            bonusesEnabled={gameState.settings.enableBonuses === true}
            bonusAwardedThisTurn={gameState.bonusAwardedThisTurn}
            surpriseSpinThisTurn={gameState.surpriseSpinThisTurn}
            activeQuestionBonus={gameState.activeQuestionBonus}
          />
        </React.Suspense>
      )}

      {/* Victory Celebration Modal */}
      {gameState.phase === 'game_over' && (
        <React.Suspense fallback={null}>
          <VictoryModal
            gameState={gameState}
            onPlayAgain={handleStartGame}
            onReturnToLobby={handleLeaveGame}
          />
        </React.Suspense>
      )}

      {/* Live Reactions Emoji Toolbar & Overlay */}
      <LiveChat onSendEmoji={handleSendEmoji} emojiEvent={emojiEvent} />
    </div>
  );

  // Camera/WebRTC code is a sizeable optional feature. The normal game never
  // downloads or parses it while live camera is disabled (the default).
  if (!gameState.settings.enableLiveCamera) return gameContent;

  return (
    <React.Suspense fallback={gameContent}>
      <LiveCameraProvider socket={socket} gameState={gameState} currentUserId={currentUserId}>
        {gameContent}
      </LiveCameraProvider>
    </React.Suspense>
  );
}

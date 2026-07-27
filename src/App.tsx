import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  GameState, 
  GameSettings, 
  Player, 
  EmojiReaction, 
  CategoryId, 
  Question 
} from './types';
import { QUESTIONS_DATABASE } from './data/questions';
import { BOARD_PRESETS } from './data/boards';
import { Lobby } from './components/Lobby';
import { InGameHeader } from './components/InGameHeader';
import { GameCanvasBoard } from './components/GameCanvasBoard';
import { QuestionModal } from './components/QuestionModal';
import { LiveChat } from './components/LiveChat';
import { VictoryModal } from './components/VictoryModal';
import { LiveCameraOverlay } from './components/LiveCameraOverlay';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emojiEvent, setEmojiEvent] = useState<EmojiReaction | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);

  // Smoothly delay question modal by 650ms so players can watch their pawn glide onto the destination tile
  useEffect(() => {
    if (gameState?.phase === 'question' && gameState?.currentQuestion) {
      const timer = setTimeout(() => {
        setShowQuestionModal(true);
      }, 650);
      return () => clearTimeout(timer);
    } else {
      setShowQuestionModal(false);
    }
  }, [gameState?.phase, gameState?.currentQuestion?.id]);

  // Extract URL parameter for join link
  const urlParams = new URLSearchParams(window.location.search);
  const codeFromUrl = urlParams.get('code');

  // Save session to localStorage and update browser URL
  const persistSession = (roomCode: string, playerId: string) => {
    try {
      localStorage.setItem('tp_fam_session', JSON.stringify({ roomCode, playerId }));
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

    newSocket.on('room-created', (data: { roomCode: string; player: Player; gameState: GameState }) => {
      setGameState(data.gameState);
      if (data.player?.id) setCurrentUserId(data.player.id);
      setErrorMessage(null);
      persistSession(data.roomCode, data.player.id);
    });

    newSocket.on('room-joined', (data: { roomCode: string; player: Player; gameState: GameState }) => {
      setGameState(data.gameState);
      if (data.player?.id) setCurrentUserId(data.player.id);
      setErrorMessage(null);
      persistSession(data.roomCode, data.player.id);
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
    });

    newSocket.on('room-closed', (data?: { reason?: string }) => {
      clearSession();
      setGameState(null);
      setCurrentUserId(newSocket.id || '');
      setShowQuestionModal(false);
      setEmojiEvent(null);
      setErrorMessage(data?.reason || 'Le salon a été fermé.');
    });

    newSocket.on('room-left', () => {
      clearSession();
      setGameState(null);
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

  const handleRollDice = () => {
    if (socket && gameState) {
      socket.emit('roll-dice', { roomCode: gameState.roomCode });
    }
  };

  const handleSelectTile = (tileId: number) => {
    if (socket && gameState) {
      socket.emit('move-player', { roomCode: gameState.roomCode, destinationTileId: tileId });
    }
  };

  const handleSubmitAnswer = (optionIndex: number) => {
    if (socket && gameState) {
      socket.emit('submit-answer', { roomCode: gameState.roomCode, optionIndex });
    }
  };

  const handleNextTurn = () => {
    if (socket && gameState) {
      socket.emit('next-turn', { roomCode: gameState.roomCode });
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

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.players[0];
  const isMyTurn = activePlayer?.id === currentUserId || gameState.settings.isLocalMode || (activePlayer?.id?.startsWith('local_') ?? false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Top Header Controls */}
      <InGameHeader gameState={gameState} onLeaveGame={handleLeaveGame} />

      {/* Main Game Stage */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-4 flex flex-col justify-center">
        <GameCanvasBoard
          gameState={gameState}
          currentUserId={currentUserId}
          onRollDice={handleRollDice}
          onSelectTile={handleSelectTile}
        />
      </main>

      {/* Live Question Modal */}
      {showQuestionModal && gameState.phase === 'question' && gameState.currentQuestion && (
        <QuestionModal
          question={gameState.currentQuestion}
          activePlayer={activePlayer}
          timerSeconds={gameState.settings.timerSeconds}
          questionStartTime={gameState.questionStartTime}
          lastAnswerResult={gameState.lastAnswerResult}
          isMyTurn={isMyTurn}
          isReaderMode={gameState.settings.isReaderMode}
          isLocalMode={gameState.settings.isLocalMode}
          allPlayers={gameState.players}
          currentUserId={currentUserId}
          onSubmitAnswer={handleSubmitAnswer}
          onNextTurn={handleNextTurn}
        />
      )}

      {/* Evaluating Stage Modal (when question is answered but waiting to click next) */}
      {gameState.phase === 'evaluating' && gameState.currentQuestion && (
        <QuestionModal
          question={gameState.currentQuestion}
          activePlayer={activePlayer}
          timerSeconds={0}
          questionStartTime={null}
          lastAnswerResult={gameState.lastAnswerResult}
          isMyTurn={isMyTurn}
          isReaderMode={gameState.settings.isReaderMode}
          isLocalMode={gameState.settings.isLocalMode}
          allPlayers={gameState.players}
          currentUserId={currentUserId}
          onSubmitAnswer={handleSubmitAnswer}
          onNextTurn={handleNextTurn}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameState.phase === 'game_over' && (
        <VictoryModal
          gameState={gameState}
          onPlayAgain={handleStartGame}
          onReturnToLobby={handleLeaveGame}
        />
      )}

      {/* Live Reactions Emoji Toolbar & Overlay */}
      <LiveChat onSendEmoji={handleSendEmoji} emojiEvent={emojiEvent} />

      {/* WebRTC Live Camera & Mic Spotlight */}
      <LiveCameraOverlay socket={socket} gameState={gameState} currentUserId={currentUserId} />
    </div>
  );
}

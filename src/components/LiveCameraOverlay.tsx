import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, Player } from '../types';
import { Camera, CameraOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Eye, ShieldCheck, Sparkles } from 'lucide-react';

interface LiveCameraOverlayProps {
  socket: Socket | null;
  gameState: GameState;
  currentUserId: string;
}

const optionalTurnServer = import.meta.env.VITE_TURN_URL
  ? [{
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL
    }]
  : [];

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...optionalTurnServer
  ]
};

export const LiveCameraOverlay: React.FC<LiveCameraOverlayProps> = ({
  socket,
  gameState,
  currentUserId
}) => {
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const isActivePlayer = activePlayer?.id === currentUserId;
  const isCameraEnabled = gameState.settings.enableLiveCamera ?? false;

  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Stop all media tracks safely
  const stopAllMediaTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);

    // Close all WebRTC peer connections
    peerConnections.current.forEach(pc => {
      try {
        pc.close();
      } catch (e) {
        console.error('Error closing peer connection:', e);
      }
    });
    peerConnections.current.clear();
    pendingCandidates.current.clear();

    setRemoteStream(null);
    setIsAudioBlocked(false);
    setIsStreaming(false);
    setIsTestMode(false);
  };

  // Cleanup on unmount, phase change away from question, or active player change
  useEffect(() => {
    if (gameState.phase !== 'question' || !isCameraEnabled) {
      stopAllMediaTracks();
    }
  }, [gameState.phase, gameState.activePlayerIndex, isCameraEnabled]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAllMediaTracks();
    };
  }, []);

  // WebRTC socket signaling listeners for viewers and broadcaster
  useEffect(() => {
    if (!socket || !isCameraEnabled) return;

    const handleOffer = async (data: { senderPlayerId: string; offer: RTCSessionDescriptionInit }) => {
      // If we are a spectator receiving an offer from active player
      if (isActivePlayer) return;

      try {
        const previousConnection = peerConnections.current.get(data.senderPlayerId);
        previousConnection?.close();

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnections.current.set(data.senderPlayerId, pc);

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc-candidate', {
              roomCode: gameState.roomCode,
              targetPlayerId: data.senderPlayerId,
              candidate: event.candidate
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        for (const candidate of pendingCandidates.current.get(data.senderPlayerId) ?? []) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current.delete(data.senderPlayerId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          roomCode: gameState.roomCode,
          targetPlayerId: data.senderPlayerId,
          answer
        });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    const handleAnswer = async (data: { senderPlayerId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.current.get(data.senderPlayerId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          for (const candidate of pendingCandidates.current.get(data.senderPlayerId) ?? []) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.current.delete(data.senderPlayerId);
        } catch (err) {
          console.error('Error setting remote answer:', err);
        }
      }
    };

    const handleCandidate = async (data: { senderPlayerId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(data.senderPlayerId);
      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        const queued = pendingCandidates.current.get(data.senderPlayerId) ?? [];
        queued.push(data.candidate);
        pendingCandidates.current.set(data.senderPlayerId, queued);
      }
    };

    const offerToViewer = async (viewerPlayerId: string) => {
      const stream = localStreamRef.current;
      if (!isActivePlayer || !stream || viewerPlayerId === currentUserId) return;

      const previousConnection = peerConnections.current.get(viewerPlayerId);
      previousConnection?.close();

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current.set(viewerPlayerId, pc);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-candidate', {
            roomCode: gameState.roomCode,
            targetPlayerId: viewerPlayerId,
            candidate: event.candidate
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', {
        roomCode: gameState.roomCode,
        targetPlayerId: viewerPlayerId,
        offer
      });
    };

    const handleBroadcasterReady = (data: { senderPlayerId: string }) => {
      if (!isActivePlayer && data.senderPlayerId === activePlayer?.id) {
        socket.emit('webrtc-viewer-ready', {
          roomCode: gameState.roomCode,
          targetPlayerId: data.senderPlayerId
        });
      }
    };

    const handleViewerReady = (data: { senderPlayerId: string }) => {
      void offerToViewer(data.senderPlayerId).catch(err => {
        console.error('Error offering to ready viewer:', err);
      });
    };

    const handleStopped = (data: { senderPlayerId: string }) => {
      const connection = peerConnections.current.get(data.senderPlayerId);
      connection?.close();
      peerConnections.current.delete(data.senderPlayerId);
      if (data.senderPlayerId === activePlayer?.id) {
        setRemoteStream(null);
      }
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-candidate', handleCandidate);
    socket.on('webrtc-stopped', handleStopped);
    socket.on('webrtc-broadcaster-ready', handleBroadcasterReady);
    socket.on('webrtc-viewer-ready', handleViewerReady);

    if (!isActivePlayer && activePlayer?.id) {
      socket.emit('webrtc-viewer-ready', {
        roomCode: gameState.roomCode,
        targetPlayerId: activePlayer.id
      });
    }

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-candidate', handleCandidate);
      socket.off('webrtc-stopped', handleStopped);
      socket.off('webrtc-broadcaster-ready', handleBroadcasterReady);
      socket.off('webrtc-viewer-ready', handleViewerReady);
    };
  }, [socket, isCameraEnabled, isActivePlayer, gameState.roomCode, activePlayer?.id]);

  // Attach local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().then(() => {
        setIsAudioBlocked(false);
      }).catch(() => {
        if (!remoteVideoRef.current) return;
        remoteVideoRef.current.muted = true;
        setIsRemoteMuted(true);
        setIsAudioBlocked(true);
        void remoteVideoRef.current.play();
      });
    }
  }, [remoteStream]);

  // Start Broadcasting Media
  const handleStartBroadcasting = async (forTest = false) => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 20 } },
        audio: true
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStreaming(true);
      setIsTestMode(forTest);

      // Connect to all other connected players in room
      if (socket && !forTest) {
        // Every viewer answers this announcement with `webrtc-viewer-ready`.
        // This handshake also covers viewers who reconnect after the stream starts.
        socket.emit('webrtc-broadcaster-ready', { roomCode: gameState.roomCode });
      }
    } catch (err: any) {
      console.error('Media stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Autorisation caméra/micro refusée par le navigateur.'
          : 'Impossible d’accéder à la caméra ou au micro.'
      );
    }
  };

  const handleStopBroadcasting = () => {
    if (socket && gameState.roomCode) {
      socket.emit('webrtc-stop', { roomCode: gameState.roomCode });
    }
    stopAllMediaTracks();
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const enableRemoteAudio = () => {
    if (!remoteVideoRef.current) return;
    remoteVideoRef.current.muted = false;
    setIsRemoteMuted(false);
    remoteVideoRef.current.play().then(() => {
      setIsAudioBlocked(false);
    }).catch(() => {
      setIsAudioBlocked(true);
    });
  };

  if (!isCameraEnabled) return null;

  return (
    <div className="w-full">
      {/* 1. Active Player View: Prompt or Control Bar */}
      {isActivePlayer && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl mb-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs">
            <Video className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Option Caméra & Micro en Direct :</span>
              <span className="text-slate-300 ml-1">
                {isStreaming
                  ? 'Vous êtes en direct auprès des autres joueurs !'
                  : 'Partagez votre visage pendant votre tour pour plus de convivialité (avec votre accord).'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isStreaming ? (
              <>
                <button
                  type="button"
                  onClick={() => handleStartBroadcasting(false)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  Activer ma Caméra & Micro
                </button>
                <button
                  type="button"
                  onClick={() => handleStartBroadcasting(true)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                  title="Aperçu local de votre vidéo"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  Tester
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-emerald-400'
                  }`}
                  title={isMuted ? 'Réactiver le micro' : 'Couper le micro'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    isVideoOff ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-emerald-400'
                  }`}
                  title={isVideoOff ? 'Réactiver la vidéo' : 'Désactiver la vidéo'}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleStopBroadcasting}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  🛑 Arrêter
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="w-full text-xs font-bold text-red-300 bg-red-950/80 p-2 rounded-xl text-center border border-red-500/40">
              {cameraError}
            </div>
          )}
        </div>
      )}

      {/* Local Video Preview for Active Player if streaming or testing */}
      {isActivePlayer && isStreaming && localStream && (
        <div className="fixed bottom-4 left-4 z-40 bg-slate-900/90 border border-amber-500/50 rounded-2xl p-2 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold mb-1 px-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {isTestMode ? '🧪 Mode Test Caméra' : '🔴 Mon Flux Direct'}
            </span>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white px-1"
            >
              {isMinimized ? '＋' : 'ー'}
            </button>
          </div>
          {!isMinimized && (
            <div className="relative w-36 h-28 bg-black rounded-xl overflow-hidden border border-slate-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            </div>
          )}
        </div>
      )}

      {/* 2. Spectator PIP Overlay (When Active Player is Broadcasting) */}
      {!isActivePlayer && (remoteStream || isTestMode) && (
        <div className="fixed top-20 right-4 z-40 bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md w-48 sm:w-56 animate-fadeIn">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="font-extrabold text-xs text-white truncate">
                {activePlayer?.name || 'Joueur Actif'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsRemoteMuted(!isRemoteMuted)}
                className="p-1 text-slate-300 hover:text-white"
                title={isRemoteMuted ? 'Activer le son du joueur' : 'Couper le son du joueur'}
              >
                {isRemoteMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-300 hover:text-white font-bold text-xs"
              >
                {isMinimized ? '＋' : 'ー'}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="relative w-full h-36 bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={isRemoteMuted}
                className="w-full h-full object-cover"
              />
              {isAudioBlocked && (
                <button
                  type="button"
                  onClick={enableRemoteAudio}
                  className="absolute inset-x-2 bottom-2 rounded-lg bg-amber-500 px-2 py-1.5 text-xs font-black text-slate-950 shadow-lg"
                >
                  🔊 Toucher pour entendre
                </button>
              )}
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-amber-300">
                🎥 Direct
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

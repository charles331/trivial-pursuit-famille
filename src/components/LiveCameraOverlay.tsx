import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../types';
import { Camera, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LiveCameraContext, LiveCameraContextValue } from '../contexts/liveCamera';
import {
  BROADCAST_CONSTRAINTS,
  PERMISSION_PROBE_CONSTRAINTS,
  describeMediaError,
  detectMediaAvailability,
  getStableClientId,
  limitOutgoingVideo,
  releaseVideoElement
} from '../utils/media';

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

export const LiveCameraProvider: React.FC<LiveCameraOverlayProps & { children?: React.ReactNode }> = ({
  socket,
  gameState,
  currentUserId,
  children
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
  const [isTestMode, setIsTestMode] = useState(false);
  const [showPermissionSetup, setShowPermissionSetup] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [permissionSetupError, setPermissionSetupError] = useState<string | null>(null);
  const [sharingPreference, setSharingPreference] = useState<'pending' | 'enabled' | 'disabled'>('pending');
  // Set when an automatic start failed: the player then needs to tap, because
  // mobile Safari is far more permissive inside a real user gesture.
  const [needsManualStart, setNeedsManualStart] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const isStartingStreamRef = useRef(false);
  const streamAttemptRef = useRef(0);
  const isMountedRef = useRef(true);
  const isBroadcastingRef = useRef(false);
  const isVideoOffRef = useRef(false);
  const socketRef = useRef<Socket | null>(socket);
  socketRef.current = socket;

  const media = useMemo(() => detectMediaAvailability(), []);
  const clientId = useMemo(() => getStableClientId(), []);
  // Keyed on a stable browser id, never on the socket id: the server rotates
  // player ids on reconnection and iOS reconnects on every backgrounding.
  const permissionStorageKey = `tp_fam_av_consent:${gameState.roomCode}:${clientId}`;

  // Ask once per player and game. The choice is retained for every turn and may
  // be changed at any time from the persistent control displayed during the game.
  useEffect(() => {
    if (!isCameraEnabled || gameState.phase === 'lobby' || gameState.phase === 'game_over') {
      setShowPermissionSetup(false);
      return;
    }

    if (!media.isAvailable) {
      // Nothing can be captured on this page: never block the game with a
      // dialog the player cannot satisfy.
      setSharingPreference('disabled');
      setShowPermissionSetup(false);
      return;
    }

    try {
      const storedPreference = localStorage.getItem(permissionStorageKey);
      if (storedPreference === 'enabled' || storedPreference === 'granted') {
        setSharingPreference('enabled');
        setShowPermissionSetup(false);
      } else if (storedPreference === 'disabled' || storedPreference === 'skipped') {
        setSharingPreference('disabled');
        setShowPermissionSetup(false);
      } else {
        setSharingPreference('pending');
        setShowPermissionSetup(true);
      }
    } catch {
      setSharingPreference('pending');
      setShowPermissionSetup(true);
    }
  }, [isCameraEnabled, gameState.phase === 'lobby', gameState.phase === 'game_over', permissionStorageKey, media.isAvailable]);

  // Stop all media tracks safely
  const stopAllMediaTracks = (options: { notifyPeers?: boolean } = {}) => {
    // Invalidate a getUserMedia call that may still be awaiting the browser.
    streamAttemptRef.current += 1;

    // Tell the viewers before dropping everything, otherwise they keep a dead
    // peer connection alive until ICE eventually times out.
    if (options.notifyPeers && isBroadcastingRef.current && socketRef.current && gameState.roomCode) {
      socketRef.current.emit('webrtc-stop', { roomCode: gameState.roomCode });
    }
    isBroadcastingRef.current = false;

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

    // WebKit keeps the capture pipeline (and the orange recording indicator)
    // alive while a <video> still references the stream, even once every track
    // is stopped. Detaching the elements is what actually powers the camera down.
    releaseVideoElement(localVideoRef.current);
    releaseVideoElement(remoteVideoRef.current);
    remoteStreamRef.current = null;
    setLocalStream(null);

    // Close all WebRTC peer connections
    peerConnections.current.forEach(pc => {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.oniceconnectionstatechange = null;
        pc.close();
      } catch (e) {
        console.error('Error closing peer connection:', e);
      }
    });
    peerConnections.current.clear();
    pendingCandidates.current.clear();

    setRemoteStream(null);
    setIsAudioBlocked(false);
    // Reset the muted fallback for the next turn. Leaving it sticky meant that a
    // single autoplay rejection (iOS refuses audible playback outside a user
    // gesture) silenced every following turn of the game.
    setIsRemoteMuted(false);
    setIsStreaming(false);
    setIsTestMode(false);
    setConnectionWarning(null);
    isStartingStreamRef.current = false;
  };

  // Cleanup on unmount, phase change away from question, or active player change
  useEffect(() => {
    if (gameState.phase !== 'question' || !isCameraEnabled) {
      stopAllMediaTracks({ notifyPeers: true });
      setNeedsManualStart(false);
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

    // Closes dead peer connections instead of letting them idle with ICE
    // keep-alives, and surfaces the failure so the room is not silently broken.
    const watchConnectionHealth = (pc: RTCPeerConnection, peerId: string, isViewer: boolean) => {
      const handleState = () => {
        const state = pc.connectionState || pc.iceConnectionState;
        if (state === 'connected' || state === 'completed') {
          setConnectionWarning(null);
          return;
        }
        if (state !== 'failed' && state !== 'closed') return;

        try {
          pc.close();
        } catch {
          // Already closed.
        }
        if (peerConnections.current.get(peerId) === pc) {
          peerConnections.current.delete(peerId);
        }
        pendingCandidates.current.delete(peerId);

        if (isViewer) {
          remoteStreamRef.current = null;
          setRemoteStream(null);
        }
        setConnectionWarning(
          'Le direct n’a pas pu s’établir entre ces appareils (réseaux différents). La partie continue normalement.'
        );
      };

      pc.onconnectionstatechange = handleState;
      pc.oniceconnectionstatechange = handleState;
    };

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
            remoteStreamRef.current = event.streams[0];
            setRemoteStream(event.streams[0]);
            setConnectionWarning(null);
          }
        };

        // Without this, a connection that never succeeds (no TURN server and a
        // player on mobile data) keeps sending STUN keep-alives forever and the
        // viewer just stares at a black frame.
        watchConnectionHealth(pc, data.senderPlayerId, true);

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
      watchConnectionHealth(pc, viewerPlayerId, false);
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
      // One encoder runs per viewer in this mesh, so capping the sender is what
      // keeps a phone from encoding the same thumbnail at several Mbps, N times.
      await limitOutgoingVideo(pc);
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

  // Callback refs rather than effects keyed on the stream: the <video> elements
  // are remounted when a spotlight is collapsed and expanded again, and an
  // effect that only watches the stream would never re-attach it (the panel
  // stayed black for the rest of the game).
  const attachLocalVideo = (element: HTMLVideoElement | null) => {
    localVideoRef.current = element;
    if (element && localStreamRef.current && element.srcObject !== localStreamRef.current) {
      element.srcObject = localStreamRef.current;
    }
  };

  const playRemote = (element: HTMLVideoElement) => {
    element
      .play()
      .then(() => setIsAudioBlocked(false))
      .catch(() => {
        // iOS refuses to autoplay audible media: fall back to muted playback and
        // offer an explicit "tap to hear" control.
        element.muted = true;
        setIsRemoteMuted(true);
        setIsAudioBlocked(true);
        void element.play().catch(() => undefined);
      });
  };

  const attachRemoteVideo = (element: HTMLVideoElement | null) => {
    remoteVideoRef.current = element;
    if (!element) return;
    const stream = remoteStreamRef.current;
    if (stream && element.srcObject !== stream) {
      element.srcObject = stream;
      playRemote(element);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream && localVideoRef.current.srcObject !== localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const element = remoteVideoRef.current;
    if (element && remoteStream && element.srcObject !== remoteStream) {
      element.srcObject = remoteStream;
      playRemote(element);
    }
  }, [remoteStream]);

  // Stop encoding while the game is in the background. iOS already throttles
  // hidden tabs, but an explicitly disabled track shuts the encoder down and is
  // the single cheapest battery win for a player who switches apps mid-turn.
  useEffect(() => {
    const handleVisibility = () => {
      const stream = localStreamRef.current;
      if (!stream || isVideoOffRef.current) return;
      const isHidden = document.visibilityState === 'hidden';
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isHidden;
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Start Broadcasting Media
  const handleStartBroadcasting = async (forTest = false) => {
    if (isStartingStreamRef.current || localStreamRef.current) return;
    if (!media.isAvailable) {
      setCameraError(media.message);
      return;
    }
    isStartingStreamRef.current = true;
    const streamAttempt = ++streamAttemptRef.current;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(BROADCAST_CONSTRAINTS);

      if (!isMountedRef.current || streamAttempt !== streamAttemptRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStreaming(true);
      setIsTestMode(forTest);
      setNeedsManualStart(false);
      setIsMuted(false);
      setIsVideoOff(false);
      isVideoOffRef.current = false;

      // Connect to all other connected players in room
      if (socket && !forTest) {
        isBroadcastingRef.current = true;
        // Every viewer answers this announcement with `webrtc-viewer-ready`.
        // This handshake also covers viewers who reconnect after the stream starts.
        socket.emit('webrtc-broadcaster-ready', { roomCode: gameState.roomCode });
      }
    } catch (err: any) {
      if (streamAttempt !== streamAttemptRef.current) return;
      console.error('Media stream error:', err);
      setCameraError(describeMediaError(err, media.isEmbedded));

      // A failed attempt must never opt the player out for the rest of the game.
      // Automatic starts happen outside a user gesture, which mobile Safari
      // often refuses even though the very same call succeeds from a tap — so
      // keep the preference and offer a manual retry instead.
      if (!forTest) {
        setNeedsManualStart(true);
      }
    } finally {
      if (streamAttempt === streamAttemptRef.current) {
        isStartingStreamRef.current = false;
      }
    }
  };

  const rememberSharingPreference = (preference: 'enabled' | 'disabled') => {
    try {
      // localStorage, not sessionStorage: iOS discards session storage when it
      // reclaims a background tab, which used to reopen this dialog mid-game.
      localStorage.setItem(permissionStorageKey, preference);
    } catch {
      // The setup still works when private browsing blocks storage.
    }
    setSharingPreference(preference);
    setShowPermissionSetup(false);
  };

  const handlePrepareCameraAndMic = async () => {
    setIsCheckingPermission(true);
    setPermissionSetupError(null);

    if (!media.isAvailable) {
      setPermissionSetupError(media.message);
      setIsCheckingPermission(false);
      return;
    }

    try {
      // This call must follow the player's click so iOS and other browsers show
      // their native permission dialog. Tracks stop immediately: nothing is sent.
      const previewStream = await navigator.mediaDevices.getUserMedia(PERMISSION_PROBE_CONSTRAINTS);
      previewStream.getTracks().forEach(track => track.stop());
      rememberSharingPreference('enabled');
    } catch (err: any) {
      setPermissionSetupError(describeMediaError(err, media.isEmbedded));
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleStopBroadcasting = () => {
    stopAllMediaTracks({ notifyPeers: true });
    setNeedsManualStart(false);
  };

  const disableSharing = () => {
    rememberSharingPreference('disabled');
    handleStopBroadcasting();
  };

  const enableSharing = async () => {
    setPermissionSetupError(null);
    setCameraError(null);

    if (!media.isAvailable) {
      setCameraError(media.message);
      return;
    }

    try {
      // Re-check access after a refusal because browsers may have had their
      // permission changed in site settings since the beginning of the game.
      const previewStream = await navigator.mediaDevices.getUserMedia(PERMISSION_PROBE_CONSTRAINTS);
      previewStream.getTracks().forEach(track => track.stop());
      rememberSharingPreference('enabled');
      setNeedsManualStart(false);
    } catch (err: any) {
      setCameraError(describeMediaError(err, media.isEmbedded));
    }
  };

  /** Retry from a real tap after an automatic start was refused by the browser. */
  const handleManualStart = () => {
    setNeedsManualStart(false);
    void handleStartBroadcasting(false);
  };

  // Once the player agreed for the game, broadcasting starts automatically on
  // each of their question turns. Leaving the turn always releases the devices.
  useEffect(() => {
    if (
      sharingPreference === 'enabled'
      && isActivePlayer
      && gameState.phase === 'question'
      && !isStreaming
      && !needsManualStart
      && media.isAvailable
      && !localStreamRef.current
    ) {
      void handleStartBroadcasting(false);
    }
  }, [sharingPreference, isActivePlayer, gameState.phase, isStreaming, needsManualStart, media.isAvailable]);

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
        // Mirrored in a ref so the visibility handler does not re-enable a track
        // the player deliberately turned off.
        isVideoOffRef.current = !videoTrack.enabled;
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

  const toggleRemoteMute = () => {
    if (isRemoteMuted) {
      enableRemoteAudio();
      return;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.muted = true;
    setIsRemoteMuted(true);
  };

  const contextValue: LiveCameraContextValue = {
    isCameraEnabled,
    mediaAvailable: media.isAvailable,
    mediaMessage: media.message,
    sharingPreference,
    isActivePlayer,
    activePlayerName: activePlayer?.name,

    isBroadcasting: isStreaming,
    localStream,
    attachLocalVideo,
    isMuted,
    toggleMic,
    isVideoOff,
    toggleVideo,
    stopBroadcast: handleStopBroadcasting,
    needsManualStart,
    startBroadcast: handleManualStart,

    remoteStream,
    attachRemoteVideo,
    isRemoteMuted,
    toggleRemoteMute,
    isAudioBlocked,
    enableRemoteAudio,

    cameraError,
    connectionWarning,
    enableSharing: () => void enableSharing(),
    disableSharing
  };

  return (
    <LiveCameraContext.Provider value={contextValue}>
      {children}

      {/* Consent dialog: the only piece that legitimately covers the game, and
          it sits above every other layer so it is always actionable. */}
      {isCameraEnabled && showPermissionSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="av-permission-title"
            className="w-full max-w-md rounded-3xl border-2 border-amber-400/70 bg-slate-900 p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/15 p-3">
                <Camera className="h-7 w-7 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-300">Avant de jouer</p>
                <h2 id="av-permission-title" className="text-xl font-black">Préparer caméra et micro</h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-200">
              Quand ce sera votre tour, les autres joueurs pourront vous voir et vous entendre
              dans un petit cadre au coin de la carte question.
            </p>

            <div className="my-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs leading-relaxed text-emerald-100">
              <ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-400" />
              Ce test ne diffuse rien. Après votre accord, le direct démarrera
              automatiquement uniquement pendant vos tours. Vous pourrez le couper à tout moment.
            </div>

            {permissionSetupError && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/70 p-3 text-xs font-bold text-red-200">
                {permissionSetupError}
              </div>
            )}

            {media.isEmbedded && (
              <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-950/60 p-3 text-xs font-bold text-amber-200">
                <AlertTriangle className="mr-1 inline h-4 w-4" />
                Le jeu est affiché dans une page intégrée. Sur iPhone, ouvrez-le dans un onglet Safari
                à part si la caméra reste bloquée.
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePrepareCameraAndMic}
                disabled={isCheckingPermission}
                className="tap-target rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-black text-slate-950 shadow-lg disabled:cursor-wait disabled:opacity-60"
              >
                {isCheckingPermission ? 'Demande d’autorisation…' : 'J’accepte pour cette partie'}
              </button>
              <button
                type="button"
                onClick={() => rememberSharingPreference('disabled')}
                disabled={isCheckingPermission}
                className="tap-target rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Jouer sans caméra ni micro
              </button>
            </div>
          </div>
        </div>
      )}
    </LiveCameraContext.Provider>
  );
};

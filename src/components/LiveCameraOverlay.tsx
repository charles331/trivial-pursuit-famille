import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../types';
import { Camera, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LiveCameraContext, LiveCameraContextValue, RemoteParticipant } from '../contexts/liveCamera';
import { resolveLiveRole, resolveOnAirIds, resolveReaderId } from '../server/turnRoles';
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

/**
 * The live duo of a question turn.
 *
 * Two players are on air: the answerer and the reader who reads their card out
 * loud. Both capture camera and microphone, and both publish to every other
 * member of the room, so the duo talk to each other while the rest of the table
 * watches and listens.
 *
 * Only a publisher ever creates an offer. That single rule keeps the handshake
 * free of glare even though the two publishers subscribe to each other: a peer
 * connection is fully identified by *which player it carries*, which is why
 * every signalling message names a `publisherId`.
 */
export const LiveCameraProvider: React.FC<LiveCameraOverlayProps & { children?: React.ReactNode }> = ({
  socket,
  gameState,
  currentUserId,
  children
}) => {
  const answerer = gameState.players[gameState.activePlayerIndex];
  const answererId = answerer?.id ?? null;
  const readerId = resolveReaderId(gameState.players, gameState.activePlayerIndex);
  const myRole = resolveLiveRole(gameState.players, gameState.activePlayerIndex, currentUserId);
  const isOnAir = myRole !== 'spectator';
  const isCameraEnabled = gameState.settings.enableLiveCamera ?? false;

  // The players whose stream we expect to receive: everyone on air but us.
  const publisherIds = resolveOnAirIds(gameState.players, gameState.activePlayerIndex)
    .filter(id => id !== currentUserId);
  // Nobody left to talk to: never light the camera up just to film ourselves.
  const hasAudience = gameState.players.some(
    player => player.id !== currentUserId && player.isConnected
  );

  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ playerId: string; stream: MediaStream }[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [showPermissionSetup, setShowPermissionSetup] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [permissionSetupError, setPermissionSetupError] = useState<string | null>(null);
  const [sharingPreference, setSharingPreference] = useState<'pending' | 'enabled' | 'disabled'>('pending');
  // Capture is off and only a tap may bring it back. Set when an automatic start
  // failed — mobile Safari is far more permissive inside a real user gesture —
  // and when the player stopped their own stream, which means "not for this
  // question" and must not be undone by the automatic start on the next render.
  const [needsManualStart, setNeedsManualStart] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  /** One <video> per player we receive, keyed on their id. */
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  /** Connections where *we* publish, keyed on the viewer. */
  const outboundConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  /** Connections where someone else publishes, keyed on that publisher. */
  const inboundConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingOutboundCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const pendingInboundCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const isStartingStreamRef = useRef(false);
  const streamAttemptRef = useRef(0);
  const isMountedRef = useRef(true);
  const isBroadcastingRef = useRef(false);
  const isVideoOffRef = useRef(false);
  const isRemoteMutedRef = useRef(false);
  isRemoteMutedRef.current = isRemoteMuted;
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

  const publishRemoteStreams = () => {
    setRemoteStreams(
      Array.from(remoteStreamsRef.current, ([playerId, stream]) => ({ playerId, stream }))
    );
  };

  const dropRemoteStream = (playerId: string) => {
    if (!remoteStreamsRef.current.delete(playerId)) return;
    releaseVideoElement(remoteVideoRefs.current.get(playerId) ?? null);
    publishRemoteStreams();
  };

  type ConnectionMap = { current: Map<string, RTCPeerConnection> };

  const closeConnection = (map: ConnectionMap, peerId: string) => {
    const pc = map.current.get(peerId);
    if (!pc) return;
    try {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.close();
    } catch (e) {
      console.error('Error closing peer connection:', e);
    }
    map.current.delete(peerId);
  };

  /**
   * Releases our own camera and microphone, and every connection we publish on.
   *
   * What we *receive* is deliberately untouched: stopping our own camera must
   * not also cut the other half of the duo off. Tapping "Arrêter" used to drop
   * everything, so the answerer stopped hearing the player reading their card.
   */
  const stopLocalBroadcast = (options: { notifyPeers?: boolean } = {}) => {
    // Invalidate a getUserMedia call that may still be awaiting the browser.
    streamAttemptRef.current += 1;

    // Tell the receivers before dropping everything, otherwise they keep a dead
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
    // is stopped. Detaching the element is what actually powers the camera down.
    releaseVideoElement(localVideoRef.current);
    setLocalStream(null);

    for (const peerId of [...outboundConnections.current.keys()]) {
      closeConnection(outboundConnections, peerId);
    }
    pendingOutboundCandidates.current.clear();

    setIsStreaming(false);
    isStartingStreamRef.current = false;
  };

  /** Ends the whole live session: what we send and what we receive. */
  const stopAllMediaTracks = (options: { notifyPeers?: boolean } = {}) => {
    stopLocalBroadcast(options);

    remoteVideoRefs.current.forEach(element => releaseVideoElement(element));
    remoteStreamsRef.current.clear();

    for (const peerId of [...inboundConnections.current.keys()]) {
      closeConnection(inboundConnections, peerId);
    }
    pendingInboundCandidates.current.clear();

    setRemoteStreams([]);
    setIsAudioBlocked(false);
    // Reset the muted fallback for the next turn. Leaving it sticky meant that a
    // single autoplay rejection (iOS refuses audible playback outside a user
    // gesture) silenced every following turn of the game.
    setIsRemoteMuted(false);
    isRemoteMutedRef.current = false;
    setConnectionWarning(null);
  };

  // Cleanup on unmount, phase change away from question, or role rotation:
  // the reader and the answerer both change on every turn.
  useEffect(() => {
    if (gameState.phase !== 'question' || !isCameraEnabled) {
      stopAllMediaTracks({ notifyPeers: true });
      // A refusal is scoped to the turn it happened in: the next one starts clean.
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

  // WebRTC socket signaling, for publishers and receivers alike.
  useEffect(() => {
    if (!socket || !isCameraEnabled) return;

    const isPublisher = (playerId: string) => playerId === answererId || playerId === readerId;

    // Closes dead peer connections instead of letting them idle with ICE
    // keep-alives, and surfaces the failure so the room is not silently broken.
    const watchConnectionHealth = (
      pc: RTCPeerConnection,
      peerId: string,
      direction: 'inbound' | 'outbound'
    ) => {
      const handleState = () => {
        const state = pc.connectionState || pc.iceConnectionState;
        if (state === 'connected' || state === 'completed') {
          setConnectionWarning(null);
          return;
        }
        if (state !== 'failed' && state !== 'closed') return;

        const map = direction === 'inbound' ? inboundConnections : outboundConnections;
        if (map.current.get(peerId) === pc) closeConnection(map, peerId);
        const pending = direction === 'inbound' ? pendingInboundCandidates : pendingOutboundCandidates;
        pending.current.delete(peerId);

        if (direction === 'inbound') dropRemoteStream(peerId);
        setConnectionWarning(
          'Le direct n’a pas pu s’établir entre ces appareils (réseaux différents). La partie continue normalement.'
        );
      };

      pc.onconnectionstatechange = handleState;
      pc.oniceconnectionstatechange = handleState;
    };

    /** Accept a publisher's offer: we only ever receive on this connection. */
    const handleOffer = async (data: { senderPlayerId: string; offer: RTCSessionDescriptionInit }) => {
      const publisherId = data.senderPlayerId;
      // Reject anything that does not come from a player currently on air, and
      // never answer an offer that claims to carry our own stream.
      if (publisherId === currentUserId || !isPublisher(publisherId)) return;

      try {
        closeConnection(inboundConnections, publisherId);

        const pc = new RTCPeerConnection(ICE_SERVERS);
        inboundConnections.current.set(publisherId, pc);

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            remoteStreamsRef.current.set(publisherId, event.streams[0]);
            publishRemoteStreams();
            setConnectionWarning(null);
          }
        };

        // Without this, a connection that never succeeds (no TURN server and a
        // player on mobile data) keeps sending STUN keep-alives forever and the
        // receiver just stares at a black frame.
        watchConnectionHealth(pc, publisherId, 'inbound');

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc-candidate', {
              roomCode: gameState.roomCode,
              targetPlayerId: publisherId,
              publisherId,
              candidate: event.candidate
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        for (const candidate of pendingInboundCandidates.current.get(publisherId) ?? []) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingInboundCandidates.current.delete(publisherId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          roomCode: gameState.roomCode,
          targetPlayerId: publisherId,
          answer
        });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    /** A viewer answered one of *our* offers. */
    const handleAnswer = async (data: { senderPlayerId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = outboundConnections.current.get(data.senderPlayerId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        for (const candidate of pendingOutboundCandidates.current.get(data.senderPlayerId) ?? []) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingOutboundCandidates.current.delete(data.senderPlayerId);
      } catch (err) {
        console.error('Error setting remote answer:', err);
      }
    };

    const handleCandidate = async (data: {
      senderPlayerId: string;
      publisherId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      // `publisherId` says which of the two possible connections with this peer
      // the candidate belongs to: the one we publish, or the one we receive.
      const isOurStream = data.publisherId === currentUserId;
      const peerId = isOurStream ? data.senderPlayerId : data.publisherId;
      const connections = isOurStream ? outboundConnections : inboundConnections;
      const pending = isOurStream ? pendingOutboundCandidates : pendingInboundCandidates;

      const pc = connections.current.get(peerId);
      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
        return;
      }

      const queued = pending.current.get(peerId) ?? [];
      queued.push(data.candidate);
      pending.current.set(peerId, queued);
    };

    const offerToViewer = async (viewerPlayerId: string) => {
      const stream = localStreamRef.current;
      if (!isOnAir || !stream || viewerPlayerId === currentUserId) return;

      closeConnection(outboundConnections, viewerPlayerId);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      outboundConnections.current.set(viewerPlayerId, pc);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      watchConnectionHealth(pc, viewerPlayerId, 'outbound');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-candidate', {
            roomCode: gameState.roomCode,
            targetPlayerId: viewerPlayerId,
            publisherId: currentUserId,
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
      if (data.senderPlayerId === currentUserId || !isPublisher(data.senderPlayerId)) return;
      socket.emit('webrtc-viewer-ready', {
        roomCode: gameState.roomCode,
        targetPlayerId: data.senderPlayerId
      });
    };

    const handleViewerReady = (data: { senderPlayerId: string }) => {
      void offerToViewer(data.senderPlayerId).catch(err => {
        console.error('Error offering to ready viewer:', err);
      });
    };

    const handleStopped = (data: { senderPlayerId: string }) => {
      closeConnection(inboundConnections, data.senderPlayerId);
      closeConnection(outboundConnections, data.senderPlayerId);
      pendingInboundCandidates.current.delete(data.senderPlayerId);
      pendingOutboundCandidates.current.delete(data.senderPlayerId);
      dropRemoteStream(data.senderPlayerId);
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-candidate', handleCandidate);
    socket.on('webrtc-stopped', handleStopped);
    socket.on('webrtc-broadcaster-ready', handleBroadcasterReady);
    socket.on('webrtc-viewer-ready', handleViewerReady);

    // Subscribe to whoever is already publishing. A publisher that has not
    // captured yet simply ignores this and re-announces itself with
    // `webrtc-broadcaster-ready` once its stream is live.
    for (const publisherId of publisherIds) {
      socket.emit('webrtc-viewer-ready', {
        roomCode: gameState.roomCode,
        targetPlayerId: publisherId
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
    // `publisherIds` is derived from the two ids below, so listing them is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isCameraEnabled, isOnAir, currentUserId, gameState.roomCode, answererId, readerId]);

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
      .then(() => {
        // Guarded on the fallback flag: with two remote videos, a stream that
        // starts fine must not clear the warning raised by the other one.
        if (!element.muted && !isRemoteMutedRef.current) setIsAudioBlocked(false);
      })
      .catch(() => {
        // iOS refuses to autoplay audible media: fall back to muted playback and
        // offer an explicit "tap to hear" control.
        element.muted = true;
        setIsRemoteMuted(true);
        isRemoteMutedRef.current = true;
        setIsAudioBlocked(true);
        void element.play().catch(() => undefined);
      });
  };

  const attachRemoteVideo = (playerId: string, element: HTMLVideoElement | null) => {
    if (!element) {
      remoteVideoRefs.current.delete(playerId);
      return;
    }
    remoteVideoRefs.current.set(playerId, element);
    const stream = remoteStreamsRef.current.get(playerId);
    if (stream && element.srcObject !== stream) {
      element.srcObject = stream;
      element.muted = isRemoteMutedRef.current;
      playRemote(element);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream && localVideoRef.current.srcObject !== localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach every stream whose <video> was mounted before the track arrived.
  useEffect(() => {
    for (const { playerId, stream } of remoteStreams) {
      const element = remoteVideoRefs.current.get(playerId);
      if (element && element.srcObject !== stream) {
        element.srcObject = stream;
        element.muted = isRemoteMutedRef.current;
        playRemote(element);
      }
    }
  }, [remoteStreams]);

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
      setNeedsManualStart(false);
      setIsMuted(false);
      setIsVideoOff(false);
      isVideoOffRef.current = false;

      if (socket && !forTest) {
        isBroadcastingRef.current = true;
        // Every other member answers this announcement with `webrtc-viewer-ready`.
        // This handshake also covers players who reconnect after the stream starts.
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

  /** Stops our own stream for this question, leaving the restart button in place. */
  const handleStopBroadcasting = () => {
    stopLocalBroadcast({ notifyPeers: true });
    setNeedsManualStart(true);
  };

  const disableSharing = () => {
    rememberSharingPreference('disabled');
    stopLocalBroadcast({ notifyPeers: true });
    setNeedsManualStart(false);
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

  /** Retry from a real tap, after a browser refusal or after "Arrêter". */
  const handleManualStart = () => {
    setNeedsManualStart(false);
    void handleStartBroadcasting(false);
  };

  // Once the player agreed for the game, capture starts automatically on every
  // turn where they are on air — answering their own card, or reading someone
  // else's. Leaving the turn always releases the devices.
  useEffect(() => {
    if (
      sharingPreference === 'enabled'
      && isOnAir
      && hasAudience
      && gameState.phase === 'question'
      && !isStreaming
      && !needsManualStart
      && media.isAvailable
      && !localStreamRef.current
    ) {
      void handleStartBroadcasting(false);
    }
  }, [
    sharingPreference,
    isOnAir,
    hasAudience,
    gameState.phase,
    isStreaming,
    needsManualStart,
    media.isAvailable
  ]);

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

  /** One speaker switch for the whole duo: unmutes everyone we receive. */
  const enableRemoteAudio = () => {
    const elements = [...remoteVideoRefs.current.values()];
    if (elements.length === 0) return;
    setIsRemoteMuted(false);
    isRemoteMutedRef.current = false;

    // `play()` resolves asynchronously, so the verdict has to be awaited: reading
    // a flag set inside the callbacks would always have reported success.
    void Promise.all(
      elements.map(element => {
        element.muted = false;
        return element.play().then(
          () => true,
          () => {
            element.muted = true;
            void element.play().catch(() => undefined);
            return false;
          }
        );
      })
    ).then(results => {
      const blocked = results.some(unlocked => !unlocked);
      setIsAudioBlocked(blocked);
      // Staying half-unmuted would leave the speaker button lying about the
      // actual state, and hide the only control that can fix it.
      setIsRemoteMuted(blocked);
      isRemoteMutedRef.current = blocked;
      if (blocked) {
        elements.forEach(element => {
          element.muted = true;
        });
      }
    });
  };

  const toggleRemoteMute = () => {
    if (isRemoteMuted) {
      enableRemoteAudio();
      return;
    }
    remoteVideoRefs.current.forEach(element => {
      element.muted = true;
    });
    setIsRemoteMuted(true);
    isRemoteMutedRef.current = true;
  };

  // Names and roles are resolved at render time, so a rename or a role rotation
  // never leaves a stale label attached to a live stream. The reader comes
  // first: they speak first.
  const remoteParticipants: RemoteParticipant[] = remoteStreams
    .filter(entry => entry.playerId === answererId || entry.playerId === readerId)
    .map(entry => ({
      playerId: entry.playerId,
      playerName: gameState.players.find(player => player.id === entry.playerId)?.name ?? 'Joueur',
      role: entry.playerId === readerId ? ('reader' as const) : ('answerer' as const),
      stream: entry.stream
    }))
    .sort((a, b) => (a.role === b.role ? 0 : a.role === 'reader' ? -1 : 1));

  const contextValue: LiveCameraContextValue = {
    isCameraEnabled,
    mediaAvailable: media.isAvailable,
    mediaMessage: media.message,
    sharingPreference,
    myRole,
    isOnAir,
    answererName: answerer?.name,
    readerName: readerId
      ? gameState.players.find(player => player.id === readerId)?.name
      : undefined,

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

    remoteParticipants,
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
              À chaque question, deux joueurs passent en direct : celui qui doit répondre,
              et le joueur juste avant lui, qui lui lit la carte à voix haute. Vous vous
              voyez et vous vous entendez tous les deux ; les autres suivent la scène.
            </p>

            <div className="my-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs leading-relaxed text-emerald-100">
              <ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-400" />
              Ce test ne diffuse rien. Après votre accord, le direct démarrera automatiquement
              uniquement quand vous répondez ou quand vous lisez. Vous pourrez le couper à tout moment.
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

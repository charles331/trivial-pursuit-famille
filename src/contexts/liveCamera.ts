import React from 'react';
import { LiveRole } from '../server/turnRoles';

/** A player whose camera and microphone reach us during the question. */
export interface RemoteParticipant {
  playerId: string;
  playerName: string;
  /** How this player takes part: they read the card, or they answer it. */
  role: Exclude<LiveRole, 'spectator'>;
  stream: MediaStream;
}

export interface LiveCameraContextValue {
  isCameraEnabled: boolean;
  mediaAvailable: boolean;
  mediaMessage: string | null;
  sharingPreference: 'pending' | 'enabled' | 'disabled';
  /** Our own part in the current turn. */
  myRole: LiveRole;
  /** True while our camera and microphone are expected to be open. */
  isOnAir: boolean;
  answererName: string | undefined;
  readerName: string | undefined;
  isBroadcasting: boolean;
  localStream: MediaStream | null;
  attachLocalVideo: (element: HTMLVideoElement | null) => void;
  isMuted: boolean;
  toggleMic: () => void;
  isVideoOff: boolean;
  toggleVideo: () => void;
  stopBroadcast: () => void;
  needsManualStart: boolean;
  startBroadcast: () => void;
  /** Everyone we currently receive, at most the reader and the answerer. */
  remoteParticipants: RemoteParticipant[];
  attachRemoteVideo: (playerId: string, element: HTMLVideoElement | null) => void;
  /** One speaker switch for the whole duo, rather than one per participant. */
  isRemoteMuted: boolean;
  toggleRemoteMute: () => void;
  isAudioBlocked: boolean;
  enableRemoteAudio: () => void;
  cameraError: string | null;
  connectionWarning: string | null;
  enableSharing: () => void;
  disableSharing: () => void;
}

const NOOP = () => undefined;

const DEFAULT_CONTEXT: LiveCameraContextValue = {
  isCameraEnabled: false,
  mediaAvailable: false,
  mediaMessage: null,
  sharingPreference: 'disabled',
  myRole: 'spectator',
  isOnAir: false,
  answererName: undefined,
  readerName: undefined,
  isBroadcasting: false,
  localStream: null,
  attachLocalVideo: NOOP,
  isMuted: false,
  toggleMic: NOOP,
  isVideoOff: false,
  toggleVideo: NOOP,
  stopBroadcast: NOOP,
  needsManualStart: false,
  startBroadcast: NOOP,
  remoteParticipants: [],
  attachRemoteVideo: NOOP,
  isRemoteMuted: false,
  toggleRemoteMute: NOOP,
  isAudioBlocked: false,
  enableRemoteAudio: NOOP,
  cameraError: null,
  connectionWarning: null,
  enableSharing: NOOP,
  disableSharing: NOOP
};

export const LiveCameraContext = React.createContext<LiveCameraContextValue>(DEFAULT_CONTEXT);

/** Safe outside a provider: camera UI simply renders nothing. */
export const useLiveCamera = (): LiveCameraContextValue => React.useContext(LiveCameraContext);

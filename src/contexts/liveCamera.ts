import React from 'react';

export interface LiveCameraContextValue {
  isCameraEnabled: boolean;
  mediaAvailable: boolean;
  mediaMessage: string | null;
  sharingPreference: 'pending' | 'enabled' | 'disabled';
  isActivePlayer: boolean;
  activePlayerName: string | undefined;
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
  remoteStream: MediaStream | null;
  attachRemoteVideo: (element: HTMLVideoElement | null) => void;
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
  isActivePlayer: false,
  activePlayerName: undefined,
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
  remoteStream: null,
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

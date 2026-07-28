import React, { useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { useLiveCamera } from './LiveCameraOverlay';

/**
 * The live camera thumbnail, rendered *inside* the question card.
 *
 * Spectators see the player who has to answer, small, on the right of the card,
 * with the controls right next to it. The broadcaster sees their own preview in
 * the same place, so muting or stopping the stream is always one tap away.
 *
 * This must stay part of the card's own layout: a floating panel ends up behind
 * the card, which is `z-50` with a backdrop blur.
 */
export const LiveSpotlight: React.FC = () => {
  const {
    isCameraEnabled,
    isActivePlayer,
    activePlayerName,
    isBroadcasting,
    attachLocalVideo,
    isMuted,
    toggleMic,
    isVideoOff,
    toggleVideo,
    stopBroadcast,
    needsManualStart,
    startBroadcast,
    remoteStream,
    attachRemoteVideo,
    isRemoteMuted,
    toggleRemoteMute,
    isAudioBlocked,
    enableRemoteAudio,
    cameraError,
    connectionWarning,
    sharingPreference
  } = useLiveCamera();

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isCameraEnabled) return null;

  const showBroadcaster = isActivePlayer && sharingPreference === 'enabled' && (isBroadcasting || needsManualStart);
  const showSpectator = !isActivePlayer && Boolean(remoteStream);

  if (!showBroadcaster && !showSpectator) return null;

  return (
    <div className="border-b border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-center gap-3">
        {/* Label + controls */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {showBroadcaster
                ? isBroadcasting
                  ? 'Vous êtes en direct'
                  : 'Caméra en attente'
                : `${activePlayerName || 'Joueur'} en direct`}
            </p>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {showBroadcaster && isBroadcasting && (
              <>
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label={isMuted ? 'Réactiver mon micro' : 'Couper mon micro'}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${
                    isMuted
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-slate-300 bg-white text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400'
                  }`}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  aria-label={isVideoOff ? 'Réactiver ma vidéo' : 'Couper ma vidéo'}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-colors ${
                    isVideoOff
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-slate-300 bg-white text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={stopBroadcast}
                  className="rounded-xl bg-red-600 px-2.5 py-2 text-[11px] font-black text-white shadow transition-colors hover:bg-red-500"
                >
                  Arrêter
                </button>
              </>
            )}

            {showBroadcaster && !isBroadcasting && needsManualStart && (
              <button
                type="button"
                onClick={startBroadcast}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-[11px] font-black text-slate-950 shadow"
              >
                📷 Activer ma caméra
              </button>
            )}

            {showSpectator && (
              <>
                <button
                  type="button"
                  onClick={toggleRemoteMute}
                  aria-label={isRemoteMuted ? 'Activer le son du joueur' : 'Couper le son du joueur'}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                    isRemoteMuted
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-slate-300 bg-white text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400'
                  }`}
                >
                  {isRemoteMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(value => !value)}
                  aria-label={isCollapsed ? 'Afficher la vidéo' : 'Masquer la vidéo'}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isCollapsed ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* The thumbnail itself, on the right of the card.
            Kept mounted while collapsed so the stream never detaches. */}
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border-2 border-slate-300 bg-black dark:border-slate-700 ${
            isCollapsed ? 'hidden' : ''
          }`}
          style={{ width: 96, height: 72 }}
        >
          {showSpectator ? (
            <video
              ref={attachRemoteVideo}
              autoPlay
              playsInline
              muted={isRemoteMuted}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              ref={attachLocalVideo}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
          )}

          {showBroadcaster && isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 text-[10px] font-bold text-slate-300">
              Vidéo coupée
            </div>
          )}
        </div>
      </div>

      {/* Audio unlock: iOS refuses audible autoplay, and this button used to be
          unreachable behind the card. */}
      {showSpectator && isAudioBlocked && (
        <button
          type="button"
          onClick={enableRemoteAudio}
          className="tap-target mt-2 w-full rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 shadow"
        >
          🔊 Toucher pour entendre {activePlayerName || 'le joueur'}
        </button>
      )}

      {(cameraError || connectionWarning) && (
        <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] font-bold text-amber-700 dark:text-amber-200">
          <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
          {cameraError || connectionWarning}
        </p>
      )}
    </div>
  );
};

/**
 * Per-game camera preference, rendered in the normal page flow above the board.
 * It used to sit at the very bottom of the document, below the board, which put
 * it off-screen on a phone — players had no way to turn the stream off.
 */
export const LiveCameraStatusBar: React.FC = () => {
  const {
    isCameraEnabled,
    mediaAvailable,
    mediaMessage,
    sharingPreference,
    enableSharing,
    disableSharing,
    cameraError,
    connectionWarning
  } = useLiveCamera();

  if (!isCameraEnabled || sharingPreference === 'pending') return null;

  const isEnabled = sharingPreference === 'enabled';

  return (
    <div className="mb-2 rounded-2xl border border-purple-400/40 bg-slate-900/90 p-2.5 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isEnabled ? (
            <Camera className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <CameraOff className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <p className="truncate text-xs">
            <span className="font-black">Mon direct pendant mes tours :</span>{' '}
            <span className={isEnabled ? 'text-emerald-300' : 'text-slate-400'}>
              {isEnabled ? 'activé' : 'désactivé'}
            </span>
          </p>
        </div>

        {mediaAvailable && (
          <button
            type="button"
            onClick={() => (isEnabled ? disableSharing() : enableSharing())}
            className={`tap-target shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition-colors ${
              isEnabled ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-purple-600 text-white hover:bg-purple-500'
            }`}
          >
            {isEnabled ? 'Désactiver' : 'Réactiver'}
          </button>
        )}
      </div>

      {!mediaAvailable && mediaMessage && (
        <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-950/60 p-2 text-xs font-bold text-amber-200">
          <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
          {mediaMessage}
        </p>
      )}

      {cameraError && (
        <p className="mt-2 rounded-xl border border-red-500/40 bg-red-950/70 p-2 text-xs font-bold text-red-200">
          {cameraError}
        </p>
      )}

      {connectionWarning && (
        <p className="mt-2 rounded-xl border border-slate-600 bg-slate-800/80 p-2 text-xs font-bold text-slate-300">
          {connectionWarning}
        </p>
      )}
    </div>
  );
};

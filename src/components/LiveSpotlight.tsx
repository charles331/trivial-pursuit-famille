import React, { useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { useLiveCamera } from '../contexts/liveCamera';

const ICON_BUTTON = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors';

/**
 * The live duo, rendered *inside* the question card.
 *
 * Two players are on air: the one who answers, and the one just before them who
 * reads the card out loud. Each of them sees the other's thumbnail next to their
 * own preview, so the pair really talk to each other. Everyone else sees both
 * thumbnails and listens.
 *
 * This must stay part of the card's own layout: a floating panel would end up
 * behind the full-screen card. It also has to stay lean — every pixel it takes
 * is a pixel the question and its four options no longer have on a phone.
 */
export const LiveSpotlight: React.FC = () => {
  const {
    isCameraEnabled,
    myRole,
    isOnAir,
    answererName,
    readerName,
    isBroadcasting,
    attachLocalVideo,
    isMuted,
    toggleMic,
    isVideoOff,
    toggleVideo,
    stopBroadcast,
    needsManualStart,
    startBroadcast,
    remoteParticipants,
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

  const showSelf = isOnAir && sharingPreference === 'enabled' && (isBroadcasting || needsManualStart);
  const hasRemotes = remoteParticipants.length > 0;

  if (!showSelf && !hasRemotes) return null;

  const headline = myRole === 'reader'
    ? `Vous lisez la carte à ${answererName || 'le joueur'}`
    : myRole === 'answerer'
      ? `${readerName || 'Un joueur'} vous lit la carte`
      : `${readerName || 'Un joueur'} lit la carte à ${answererName || 'le joueur'}`;

  return (
    <div className="shrink-0 border-b border-slate-200 bg-slate-100 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950/60">
      {/* Caption beside the thumbnails, controls on a full-width row of their own.
          Squeezed next to the thumbnails they wrapped onto a second line and ate
          another 55 px of a screen that has none to spare. */}
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {showSelf && !isBroadcasting ? 'Caméra en attente' : headline}
          </p>
        </div>

        {/* Everyone we receive, plus our own preview when we are on air.
            Kept mounted while collapsed so the streams never detach. */}
        <div className={`flex shrink-0 gap-1.5 ${isCollapsed ? 'hidden' : ''}`}>
          {remoteParticipants.map(participant => (
            <figure key={participant.playerId} className="m-0 shrink-0">
              <div
                className={`relative aspect-[4/3] w-[72px] overflow-hidden rounded-xl border-2 bg-black sm:w-24 ${
                  participant.role === 'reader'
                    ? 'border-amber-400'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <video
                  ref={element => attachRemoteVideo(participant.playerId, element)}
                  autoPlay
                  playsInline
                  muted={isRemoteMuted}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-0.5 max-w-[72px] truncate text-center text-[9px] font-black uppercase tracking-wide text-slate-500 sm:max-w-24 dark:text-slate-400">
                {participant.role === 'reader' ? '📖 ' : '🎯 '}
                {participant.playerName}
              </figcaption>
            </figure>
          ))}

          {showSelf && (
            <figure className="m-0 shrink-0">
              <div className="relative aspect-[4/3] w-[72px] overflow-hidden rounded-xl border-2 border-emerald-500 bg-black sm:w-24">
                <video
                  ref={attachLocalVideo}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 text-[10px] font-bold text-slate-300">
                    Vidéo coupée
                  </div>
                )}
              </div>
              <figcaption className="mt-0.5 max-w-[72px] truncate text-center text-[9px] font-black uppercase tracking-wide text-emerald-600 sm:max-w-24 dark:text-emerald-400">
                {myRole === 'reader' ? '📖 Vous' : '🎯 Vous'}
              </figcaption>
            </figure>
          )}
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        {showSelf && isBroadcasting && (
          <>
            <button
              type="button"
              onClick={toggleMic}
              aria-label={isMuted ? 'Réactiver mon micro' : 'Couper mon micro'}
              className={`${ICON_BUTTON} ${
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
              className={`${ICON_BUTTON} ${
                isVideoOff
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-slate-300 bg-white text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400'
              }`}
            >
              {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            </button>
          </>
        )}

        {showSelf && !isBroadcasting && needsManualStart && (
          <button
            type="button"
            onClick={startBroadcast}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-[11px] font-black text-slate-950 shadow"
          >
            📷 Reprendre ma caméra
          </button>
        )}

        {hasRemotes && (
          <>
            <button
              type="button"
              onClick={toggleRemoteMute}
              aria-label={isRemoteMuted ? 'Activer le haut-parleur' : 'Couper le haut-parleur'}
              className={`${ICON_BUTTON} ${
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
              aria-label={isCollapsed ? 'Afficher les vidéos' : 'Masquer les vidéos'}
              className={`${ICON_BUTTON} border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300`}
            >
              {isCollapsed ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
            </button>
          </>
        )}

        {/* Pushed to the far end: it is the one destructive control here. */}
        {showSelf && isBroadcasting && (
          <button
            type="button"
            onClick={stopBroadcast}
            className="ml-auto shrink-0 rounded-xl bg-red-600 px-2.5 py-2 text-[11px] font-black text-white shadow transition-colors hover:bg-red-500"
          >
            Arrêter
          </button>
        )}
      </div>

      {/* Audio unlock: iOS refuses audible autoplay, and this button used to be
          unreachable behind the card. */}
      {hasRemotes && isAudioBlocked && (
        <button
          type="button"
          onClick={enableRemoteAudio}
          className="tap-target mt-1.5 w-full rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 shadow"
        >
          🔊 Toucher pour entendre {remoteParticipants.map(p => p.playerName).join(' et ')}
        </button>
      )}

      {(cameraError || connectionWarning) && (
        <p className="mt-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] font-bold text-amber-700 dark:text-amber-200">
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
            <span className="font-black">Mon direct quand je réponds ou je lis :</span>{' '}
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

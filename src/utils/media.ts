/**
 * Camera & microphone helpers shared by the live spotlight.
 *
 * Everything here exists because mobile Safari is far stricter than desktop
 * Chrome: it hides `navigator.mediaDevices` outside a secure context, it is
 * restrictive inside third-party iframes, and it burns battery fast when a
 * WebRTC sender is left uncapped.
 */

export type MediaBlockReason = 'unsupported' | 'insecure-context' | 'embedded' | null;

export interface MediaAvailability {
  /** False when getUserMedia cannot possibly succeed on this page. */
  isAvailable: boolean;
  reason: MediaBlockReason;
  /** Player-facing explanation, already in French. */
  message: string | null;
  /** The page runs inside an iframe, which mobile Safari restricts. */
  isEmbedded: boolean;
}

/** True when the document is nested in another document. */
export function isEmbeddedPage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // A cross-origin parent throws on access, which itself proves nesting.
    return true;
  }
}

/**
 * Explains up-front why capture cannot work, instead of letting
 * `navigator.mediaDevices.getUserMedia` throw a bare TypeError that the UI then
 * reports as "your device has no camera".
 */
export function detectMediaAvailability(): MediaAvailability {
  const isEmbedded = isEmbeddedPage();

  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return { isAvailable: false, reason: 'unsupported', message: 'Caméra indisponible dans cet environnement.', isEmbedded };
  }

  const hasApi = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  if (!hasApi) {
    // Safari removes the whole API outside HTTPS, so this is the usual cause on
    // a phone reaching the game through a local IP address.
    if (window.isSecureContext === false) {
      return {
        isAvailable: false,
        reason: 'insecure-context',
        message:
          'La caméra exige une connexion sécurisée. Ouvrez le jeu via une adresse https:// (une adresse http:// en réseau local est refusée par iPhone).',
        isEmbedded
      };
    }
    return {
      isAvailable: false,
      reason: 'unsupported',
      message: 'Ce navigateur ne propose pas d’accès à la caméra et au micro.',
      isEmbedded
    };
  }

  return { isAvailable: true, reason: null, message: null, isEmbedded };
}

/**
 * Turns a getUserMedia rejection into an actionable French message.
 * `isEmbedded` matters because mobile Safari denies capture in third-party
 * iframes with the very same error name as a user refusal.
 */
export function describeMediaError(error: unknown, isEmbedded: boolean): string {
  const name = (error as { name?: string } | null)?.name ?? '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    if (isEmbedded) {
      return 'Caméra bloquée dans cette page intégrée. Ouvrez le jeu dans un onglet Safari à part, puis autorisez la caméra.';
    }
    return 'Caméra/micro bloqués par le navigateur. Autorisez-les pour ce site (Réglages ▸ Safari ▸ Caméra), puis touchez « Activer ma caméra ».';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') {
    return 'Aucune caméra ou aucun micro utilisable n’a été trouvé sur cet appareil.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return 'La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez.';
  }
  return 'Impossible de démarrer la caméra. Touchez « Activer ma caméra » pour réessayer.';
}

/**
 * Deliberately small capture profile: the spotlight is a thumbnail, so a phone
 * has no reason to grab (and then encode) a 720p stream. `max` matters as much
 * as `ideal` — `ideal` alone is only a hint and iOS happily ignores it.
 */
export const BROADCAST_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: 'user',
    width: { ideal: 320, max: 640 },
    height: { ideal: 240, max: 480 },
    frameRate: { ideal: 15, max: 20 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

/** Cheapest possible capture, only used to trigger the permission prompt. */
export const PERMISSION_PROBE_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'user', width: { ideal: 320, max: 640 }, height: { ideal: 240, max: 480 } },
  audio: true
};

export const MAX_VIDEO_BITRATE = 250_000;
export const MAX_VIDEO_FRAMERATE = 15;

/**
 * Caps an outgoing video sender. Without this, WebRTC ramps the bitrate up to
 * whatever the link allows — on home Wi-Fi that means encoding a thumbnail at
 * megabits per second, on battery, once per viewer.
 *
 * Call it after `setLocalDescription`, which is when Safari keeps the values.
 */
export async function limitOutgoingVideo(pc: RTCPeerConnection): Promise<void> {
  const videoSenders = pc.getSenders().filter(sender => sender.track?.kind === 'video');

  for (const sender of videoSenders) {
    try {
      const parameters = sender.getParameters();
      if (!parameters.encodings || parameters.encodings.length === 0) {
        parameters.encodings = [{}];
      }
      parameters.encodings[0].maxBitrate = MAX_VIDEO_BITRATE;
      parameters.encodings[0].maxFramerate = MAX_VIDEO_FRAMERATE;
      // Keep motion smooth and let resolution drop first: a talking head stays
      // readable at low resolution, and it costs the encoder much less.
      (parameters as RTCRtpSendParameters & { degradationPreference?: string }).degradationPreference =
        'maintain-framerate';
      await sender.setParameters(parameters);
    } catch (err) {
      // Older WebKit rejects some parameter shapes; an uncapped sender is still
      // better than a broken call.
      console.warn('Unable to cap outgoing video sender:', err);
    }
  }
}

/** Detaches a media element so WebKit actually releases the capture pipeline. */
export function releaseVideoElement(element: HTMLVideoElement | null): void {
  if (!element) return;
  try {
    element.pause();
  } catch {
    // Pausing a never-started element throws on some browsers; harmless.
  }
  try {
    element.srcObject = null;
  } catch {
    element.removeAttribute('src');
  }
}

const CLIENT_ID_KEY = 'tp_fam_client_id';

/**
 * Stable per-browser identifier.
 *
 * Consent must not be keyed on the socket id: the server rotates a player's id
 * on every reconnection, and mobile Safari reconnects every time the game goes
 * to the background. Keying on the socket id made the permission dialog pop up
 * again mid-game and silently stopped the automatic broadcast.
 */
export function getStableClientId(): string {
  if (typeof window === 'undefined') return 'anonymous';

  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;

    const created =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(CLIENT_ID_KEY, created);
    return created;
  } catch {
    // Private browsing blocks storage: fall back to a per-session identity.
    return 'no-storage';
  }
}

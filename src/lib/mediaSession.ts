/**
 * Lock-screen / Control Center metadata for the live stream.
 * Titles come from the Melbourne guide or Radio.co — never invented tracks.
 */

import { BRAND } from '@/lib/brand'
import { liveNowFromMetadata, type LiveNowDisplay } from '@/lib/liveNow'
import type { PlayerMetadata } from '@/lib/playerMetadata'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

export const MEDIA_SESSION_STATION = `${BRAND.fullName}`

export interface MediaSessionArtwork {
  src: string
  sizes: string
  type: string
}

export interface MediaSessionPayload {
  title: string
  artist: string
  album: string
  artwork: MediaSessionArtwork[]
}

export interface MediaSessionPosition {
  duration: number
  position: number
  playbackRate: 1
}

const LOGO_192 = '/brand/icon-192.png'
const LOGO_512 = '/brand/icon-512.png'

function absoluteUrl(origin: string, path: string): string {
  const base = origin.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/** Official station marks + one studio still. No stock or AI faces. */
export function mediaSessionArtwork(origin: string): MediaSessionArtwork[] {
  return [
    { src: absoluteUrl(origin, LOGO_192), sizes: '192x192', type: 'image/png' },
    { src: absoluteUrl(origin, LOGO_512), sizes: '512x512', type: 'image/png' },
    { src: absoluteUrl(origin, STATION_PHOTOS.studioPresenterMic), sizes: '512x512', type: 'image/jpeg' },
  ]
}

function stationArtist(presenter: string | null | undefined): string {
  const name = presenter?.trim() ?? ''
  if (!name || name === 'ONE FM' || name === 'Automated') return MEDIA_SESSION_STATION
  return name
}

/**
 * Lock-screen copy.
 * Stream title/artist only when Radio.co gave a real track — never a forecast
 * or callsign (those are already stripped in fetchStreamMetadata).
 */
export function buildMediaSessionPayload(
  live: LiveNowDisplay,
  meta: PlayerMetadata,
  origin: string,
): MediaSessionPayload {
  const artwork = mediaSessionArtwork(origin)
  const remaining = live.remainingLabel ? ` · ${live.remainingLabel}` : ''

  if (meta.nowPlaying) {
    const title = meta.title?.trim() || meta.nowPlaying
    const artist = meta.artist?.trim() || MEDIA_SESSION_STATION
    return {
      title,
      artist,
      album: `${live.program}${remaining}`,
      artwork,
    }
  }

  return {
    title: live.program,
    artist: stationArtist(live.presenter),
    album: `${MEDIA_SESSION_STATION} · ${live.programTime}${remaining}`,
    artwork,
  }
}

/** Guide-slot progress for the lock-screen bar. Live radio has no seek. */
export function mediaSessionPosition(live: LiveNowDisplay): MediaSessionPosition | null {
  const duration = Math.max(0, live.slotMinutes) * 60
  if (duration <= 0) return null
  const position = Math.min(duration, Math.max(0, live.elapsedMinutes * 60))
  return { duration, position, playbackRate: 1 }
}

export function playingDocumentTitle(live: LiveNowDisplay): string {
  return `${live.program} · ${MEDIA_SESSION_STATION}`
}

type SessionLike = {
  metadata: unknown
  playbackState: MediaSessionPlaybackState
  setActionHandler: MediaSession['setActionHandler']
  setPositionState?: MediaSession['setPositionState']
}

export function applyMediaSession(
  session: SessionLike | null | undefined,
  payload: MediaSessionPayload,
  playbackState: MediaSessionPlaybackState,
  position: MediaSessionPosition | null,
): void {
  if (!session || typeof MediaMetadata === 'undefined') return

  session.metadata = new MediaMetadata({
    title: payload.title,
    artist: payload.artist,
    album: payload.album,
    artwork: payload.artwork,
  })
  session.playbackState = playbackState

  if (position && typeof session.setPositionState === 'function') {
    try {
      session.setPositionState(position)
    } catch {
      // Safari throws if duration is 0 or the audio element has no seekable range.
    }
  }
}

export function bindMediaSessionActions(
  session: SessionLike | null | undefined,
  handlers: { play: () => void; pause: () => void },
): void {
  if (!session) return
  const set = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
    try {
      session.setActionHandler(action, fn)
    } catch {
      // Unsupported action on this browser.
    }
  }
  set('play', () => handlers.play())
  set('pause', () => handlers.pause())
  set('stop', () => handlers.pause())
  set('seekbackward', null)
  set('seekforward', null)
  set('seekto', null)
  set('previoustrack', null)
  set('nexttrack', null)
}

export function mediaSessionFromNow(
  meta: PlayerMetadata,
  origin: string,
  now: Date = new Date(),
): { payload: MediaSessionPayload; position: MediaSessionPosition | null; live: LiveNowDisplay } {
  const live = liveNowFromMetadata(meta, now)
  return {
    live,
    payload: buildMediaSessionPayload(live, meta, origin),
    position: mediaSessionPosition(live),
  }
}

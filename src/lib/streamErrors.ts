import { AUDIO_PLAYER_URL } from '@/lib/streamConfig'

/** Shown when the Radio.co element fails (network / unsupported / decode). */
export const STREAM_UNAVAILABLE = `Stream unavailable — try ${new URL(AUDIO_PLAYER_URL).host}/audio-player/`

/** Autoplay / gesture policy — not a dead stream. */
export const PLAYBACK_BLOCKED = 'Playback blocked — tap play again or open the web player.'

function errorName(err: unknown): string {
  if (err instanceof DOMException) return err.name
  if (typeof err === 'object' && err !== null && 'name' in err) {
    const name = (err as { name?: unknown }).name
    if (typeof name === 'string') return name
  }
  return ''
}

/** User hit pause before play() resolved — not a failure. */
export function isPlayAbort(err: unknown): boolean {
  return errorName(err) === 'AbortError'
}

export function isPlayBlocked(err: unknown): boolean {
  return errorName(err) === 'NotAllowedError'
}

/**
 * Classify a play() rejection.
 * Returns null when the UI must stay quiet (AbortError).
 */
export function classifyPlayFailure(err: unknown): string | null {
  if (isPlayAbort(err)) return null
  if (isPlayBlocked(err)) return PLAYBACK_BLOCKED
  return STREAM_UNAVAILABLE
}

/** HTMLMediaElement.error.code — 1 aborted, 2 network, 3 decode, 4 unsupported. */
export function classifyMediaError(code: number | undefined): string {
  if (code === 1) return STREAM_UNAVAILABLE
  return STREAM_UNAVAILABLE
}

/** Last good Radio.co now-playing. A single failed poll is not "nothing playing". */
export interface HeldTrack {
  title: string | null
  artist: string | null
  at: number
}

/** Keep a good track through Radio.co blips. Drop it after holdMs with no refresh. */
export const STREAM_HOLD_MS = 3 * 60_000

export function holdStreamTrack(
  incoming: { title: string | null; artist: string | null } | null,
  previous: HeldTrack | null,
  nowMs: number,
  holdMs: number = STREAM_HOLD_MS,
): HeldTrack | null {
  const title = incoming?.title?.trim() || null
  const artist = incoming?.artist?.trim() || null
  if (title || artist) {
    return { title, artist, at: nowMs }
  }
  if (previous && nowMs - previous.at < holdMs) {
    return previous
  }
  return null
}

/**
 * Live-now labels that tick with the real clock.
 * Remaining time and the show-progress bar must not freeze between Radio.co polls
 * (usePlayerMetadata refreshes every 60s).
 */
import { useEffect, useState } from 'react'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { liveNowFromMetadata, type LiveNowDisplay } from '@/lib/liveNow'
import type { PlayerMetadata } from '@/lib/playerMetadata'

/** Faster than the 60s Radio.co poll so remaining minutes and the bar move. */
export const LIVE_NOW_TICK_MS = 15_000

export function useLiveNow(tickMs: number = LIVE_NOW_TICK_MS): {
  meta: PlayerMetadata
  live: LiveNowDisplay
  now: Date
} {
  const meta = usePlayerMetadata()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  return { meta, live: liveNowFromMetadata(meta, now), now }
}

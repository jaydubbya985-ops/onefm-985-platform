import { useEffect, useState } from 'react'
import { getMelbourneClock, type MelbourneClock } from '@/data/programGuide'

const TICK_MS = 15_000

export type MelbourneClockState = MelbourneClock & { now: Date }

/**
 * Melbourne guide clock that advances while the page stays open.
 * Hour-level LIVE highlights must not freeze at first paint.
 */
export function useMelbourneClock(tickMs = TICK_MS): MelbourneClockState {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  return { now, ...getMelbourneClock(now) }
}

import { useCallback, useEffect, useRef } from 'react'
import { pauseLiveStream, useLiveStream } from '@/hooks/useLiveStream'
import { claimExclusivePlayback, onExclusivePlayback } from '@/lib/exclusivePlayback'

/**
 * Pause this player when the live stream starts, or when another interview
 * claims the speakers. Call `claim()` before starting local playback so the
 * Radio.co singleton yields.
 */
export function useExclusivePlayback(yieldPlay: () => void) {
  const owner = useRef({})
  const { playing } = useLiveStream()
  const yieldRef = useRef(yieldPlay)
  yieldRef.current = yieldPlay
  const wasLive = useRef(playing)

  useEffect(() => onExclusivePlayback(owner.current, () => yieldRef.current()), [])

  useEffect(() => {
    const liveStarted = playing && !wasLive.current
    wasLive.current = playing
    if (liveStarted) yieldRef.current()
  }, [playing])

  const claim = useCallback(() => {
    pauseLiveStream()
    claimExclusivePlayback(owner.current)
  }, [])

  return claim
}

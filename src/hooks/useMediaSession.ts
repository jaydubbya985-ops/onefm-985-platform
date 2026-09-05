import { useEffect, useRef } from 'react'
import { playLiveStream, pauseLiveStream, useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { liveNowFromMetadata } from '@/lib/liveNow'
import {
  applyMediaSession,
  bindMediaSessionActions,
  buildMediaSessionPayload,
  mediaSessionPosition,
  playingDocumentTitle,
} from '@/lib/mediaSession'

/**
 * Pushes the Melbourne-guide show onto the OS lock screen / Control Center
 * and names the browser tab while the stream is actually playing.
 */
export function useMediaSession() {
  const { playing } = useLiveStream()
  const meta = usePlayerMetadata()
  const live = liveNowFromMetadata(meta)
  const titleBeforePlay = useRef<string | null>(null)

  useEffect(() => {
    const session = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined
    if (!session) return

    bindMediaSessionActions(session, {
      play: () => {
        void playLiveStream()
      },
      pause: () => {
        pauseLiveStream()
      },
    })

    const origin = window.location.origin
    const payload = buildMediaSessionPayload(live, meta, origin)
    applyMediaSession(
      session,
      payload,
      playing ? 'playing' : 'paused',
      mediaSessionPosition(live),
    )
  }, [
    playing,
    live.program,
    live.presenter,
    live.programTime,
    live.remainingLabel,
    live.remainingMinutes,
    live.elapsedMinutes,
    live.slotMinutes,
    meta.nowPlaying,
    meta.title,
    meta.artist,
  ])

  useEffect(() => {
    if (playing) {
      if (titleBeforePlay.current === null) {
        titleBeforePlay.current = document.title
      }
      document.title = playingDocumentTitle(live)
      return
    }
    if (titleBeforePlay.current !== null) {
      document.title = titleBeforePlay.current
      titleBeforePlay.current = null
    }
  }, [playing, live.program])

  useEffect(() => {
    return () => {
      if (titleBeforePlay.current !== null) {
        document.title = titleBeforePlay.current
        titleBeforePlay.current = null
      }
    }
  }, [])
}

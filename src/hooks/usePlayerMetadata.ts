import { useEffect, useRef, useState } from 'react'
import {
  fetchStreamMetadata,
  getScheduleMetadata,
  mergeStreamMetadata,
  type PlayerMetadata,
} from '@/lib/playerMetadata'

/** Radio.co / stream poll — do not hammer the public status endpoint. */
const STREAM_REFRESH_MS = 60_000
/** Re-read FULL_SCHEDULE remaining time without another network call. */
const SCHEDULE_TICK_MS = 15_000

type StreamTrack = { title: string | null; artist: string | null }

function withSchedule(stream: StreamTrack | null): PlayerMetadata {
  const base = getScheduleMetadata()
  if (stream?.title || stream?.artist) {
    return mergeStreamMetadata(base, { source: 'stream', ...stream })
  }
  return base
}

export function usePlayerMetadata(streamUrl?: string) {
  const [metadata, setMetadata] = useState<PlayerMetadata>(() => getScheduleMetadata())
  const streamRef = useRef<StreamTrack | null>(null)

  useEffect(() => {
    let cancelled = false

    const tickSchedule = () => {
      if (cancelled) return
      setMetadata(withSchedule(streamRef.current))
    }

    const refreshStream = async () => {
      const stream = await fetchStreamMetadata(streamUrl)
      if (cancelled) return
      streamRef.current = stream?.title || stream?.artist ? stream : null
      tickSchedule()
    }

    refreshStream()
    const streamId = setInterval(refreshStream, STREAM_REFRESH_MS)
    const tickId = setInterval(tickSchedule, SCHEDULE_TICK_MS)
    return () => {
      cancelled = true
      clearInterval(streamId)
      clearInterval(tickId)
    }
  }, [streamUrl])

  return metadata
}

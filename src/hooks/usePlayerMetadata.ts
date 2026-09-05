import { useEffect, useState } from 'react'
import {
  fetchStreamMetadata,
  getScheduleMetadata,
  mergeStreamMetadata,
  type PlayerMetadata,
} from '@/lib/playerMetadata'
import { holdStreamTrack, type HeldTrack } from '@/lib/streamHold'

/** Melbourne guide + remaining time — cheap, local. */
const SCHEDULE_MS = 15_000
/** Radio.co now-playing. */
const STREAM_MS = 60_000

export function usePlayerMetadata(streamUrl?: string) {
  const [metadata, setMetadata] = useState<PlayerMetadata>(() => getScheduleMetadata())

  useEffect(() => {
    let cancelled = false
    let held: HeldTrack | null = null

    const apply = async (fetchStream: boolean) => {
      const base = getScheduleMetadata()
      if (fetchStream) {
        const stream = await fetchStreamMetadata(streamUrl)
        if (cancelled) return
        held = holdStreamTrack(stream, held, Date.now())
      }
      if (cancelled) return
      if (held) {
        setMetadata(mergeStreamMetadata(base, { source: 'stream', title: held.title, artist: held.artist }))
      } else {
        setMetadata(base)
      }
    }

    apply(true)
    const scheduleId = setInterval(() => {
      void apply(false)
    }, SCHEDULE_MS)
    const streamId = setInterval(() => {
      void apply(true)
    }, STREAM_MS)
    return () => {
      cancelled = true
      clearInterval(scheduleId)
      clearInterval(streamId)
    }
  }, [streamUrl])

  return metadata
}

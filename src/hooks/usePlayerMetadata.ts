import { useEffect, useState } from 'react'
import {
  fetchStreamMetadata,
  getScheduleMetadata,
  mergeStreamMetadata,
  type PlayerMetadata,
} from '@/lib/playerMetadata'

const REFRESH_MS = 60_000

export function usePlayerMetadata(streamUrl?: string) {
  const [metadata, setMetadata] = useState<PlayerMetadata>(() => getScheduleMetadata())

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      const base = getScheduleMetadata()
      const stream = await fetchStreamMetadata(streamUrl)
      if (cancelled) return

      if (stream?.title || stream?.artist) {
        setMetadata(mergeStreamMetadata(base, { source: 'stream', ...stream }))
      } else {
        setMetadata(base)
      }
    }

    refresh()
    const id = setInterval(refresh, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [streamUrl])

  return metadata
}

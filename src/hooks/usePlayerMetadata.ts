import { useEffect, useState } from 'react'
import {
  fetchStreamMetadata,
  getScheduleMetadata,
  mergeStreamMetadata,
  type PlayerMetadata,
} from '@/lib/playerMetadata'

/** Schedule ticks faster than stream so the on-air host flips at the hour. */
const REFRESH_MS = 30_000

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
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [streamUrl])

  return metadata
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { STREAM_URL } from '@/lib/streamConfig'

export function useLiveStream() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = new Audio(STREAM_URL)
    audio.preload = 'none'
    audioRef.current = audio

    const onPlay = () => {
      setPlaying(true)
      setLoading(false)
      setError(null)
    }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onError = () => {
      setPlaying(false)
      setLoading(false)
      setError('Stream unavailable — try fm985.com.au/audio-player/')
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('error', onError)
      audioRef.current = null
    }
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      return
    }

    setLoading(true)
    setError(null)
    try {
      await audio.play()
    } catch {
      setLoading(false)
      setError('Playback blocked — open the web player instead.')
    }
  }, [playing])

  return { playing, loading, error, toggle }
}

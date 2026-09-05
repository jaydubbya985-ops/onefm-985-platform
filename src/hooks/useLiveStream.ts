import { useCallback, useSyncExternalStore } from 'react'
import { STREAM_URL } from '@/lib/streamConfig'

/* ─── Module-level singleton ──────────────────────────────────────────────
   One Audio element is shared across all useLiveStream() callers.
   State changes broadcast via a CustomEvent so every subscriber re-renders.
─────────────────────────────────────────────────────────────────────────── */

type StreamState = { playing: boolean; loading: boolean; error: string | null }

export type StreamToggleResult = { playing: boolean; error: string | null }

let audio: HTMLAudioElement | null = null
let state: StreamState = { playing: false, loading: false, error: null }
const bus = typeof window !== 'undefined' ? new EventTarget() : null

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(STREAM_URL)
    audio.preload = 'none'

    audio.addEventListener('play',    () => emit({ playing: true,  loading: false, error: null }))
    audio.addEventListener('pause',   () => emit({ playing: false, loading: false, error: state.error }))
    audio.addEventListener('waiting', () => emit({ ...state, loading: true }))
    audio.addEventListener('playing', () => emit({ ...state, loading: false }))
    audio.addEventListener('error',   () => emit({ playing: false, loading: false, error: 'Stream unavailable — try fm985.com.au/audio-player/' }))
  }
  return audio
}

function emit(next: StreamState) {
  state = next
  bus?.dispatchEvent(new CustomEvent('stream-state', { detail: next }))
}

function subscribe(cb: () => void) {
  bus?.addEventListener('stream-state', cb)
  return () => bus?.removeEventListener('stream-state', cb)
}

function getSnapshot(): StreamState {
  return state
}

export function useLiveStream() {
  const local = useSyncExternalStore(subscribe, getSnapshot)

  const toggle = useCallback(async (): Promise<StreamToggleResult> => {
    const a = getAudio()

    if (state.playing) {
      a.pause()
      return { playing: false, error: null }
    }

    emit({ ...state, loading: true, error: null })
    try {
      await a.play()
      return { playing: true, error: null }
    } catch {
      const error = 'Playback blocked — open the web player instead.'
      emit({ playing: false, loading: false, error })
      return { playing: false, error }
    }
  }, [])

  return { playing: local.playing, loading: local.loading, error: local.error, toggle }
}

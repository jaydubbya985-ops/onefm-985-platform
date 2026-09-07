import { useCallback, useSyncExternalStore } from 'react'
import { STREAM_URL } from '@/lib/streamConfig'
import { STREAM_UNAVAILABLE, classifyMediaError, classifyPlayFailure } from '@/lib/streamErrors'

/* ─── Module-level singleton ──────────────────────────────────────────────
   One Audio element is shared across all useLiveStream() callers.
   State changes broadcast via a CustomEvent so every subscriber re-renders.
─────────────────────────────────────────────────────────────────────────── */

type StreamState = { playing: boolean; loading: boolean; error: string | null }

let audio: HTMLAudioElement | null = null
let state: StreamState = { playing: false, loading: false, error: null }
const bus = typeof window !== 'undefined' ? new EventTarget() : null

function forgetAudio() {
  if (!audio) return
  const dying = audio
  audio = null
  dying.pause()
  dying.removeAttribute('src')
  try {
    dying.load()
  } catch {
    // ignore — element is discarded
  }
}

function getAudio(): HTMLAudioElement {
  if (audio) return audio

  const next = new Audio(STREAM_URL)
  next.preload = 'none'
  audio = next

  next.addEventListener('play', () => {
    if (audio !== next) return
    emit({ playing: true, loading: false, error: null })
  })
  next.addEventListener('pause', () => {
    if (audio !== next) return
    emit({ playing: false, loading: false, error: state.error })
  })
  next.addEventListener('waiting', () => {
    if (audio !== next) return
    emit({ ...state, loading: true })
  })
  next.addEventListener('playing', () => {
    if (audio !== next) return
    emit({ ...state, loading: false })
  })
  next.addEventListener('error', () => {
    if (audio !== next) return
    emit({
      playing: false,
      loading: false,
      error: classifyMediaError(next.error?.code),
    })
    forgetAudio()
  })

  return next
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

  const toggle = useCallback(async () => {
    const a = getAudio()

    if (state.playing) {
      a.pause()
      return
    }

    emit({ ...state, loading: true, error: null })
    try {
      await a.play()
    } catch (err) {
      const message = classifyPlayFailure(err)
      if (message === null) return
      emit({ playing: false, loading: false, error: message })
      if (message === STREAM_UNAVAILABLE) forgetAudio()
    }
  }, [])

  return { playing: local.playing, loading: local.loading, error: local.error, toggle }
}

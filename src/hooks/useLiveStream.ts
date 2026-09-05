import { useCallback, useSyncExternalStore } from 'react'
import { STREAM_URL } from '@/lib/streamConfig'

/* ─── Module-level singleton ──────────────────────────────────────────────
   One Audio element is shared across all useLiveStream() callers.
   State changes broadcast via a CustomEvent so every subscriber re-renders.
─────────────────────────────────────────────────────────────────────────── */

const VOLUME_KEY = 'onefm-stream-volume'

export function clampStreamVolume(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.min(1, Math.max(0, n))
}

export function effectiveStreamGain(volume: number, muted: boolean): number {
  return muted ? 0 : clampStreamVolume(volume)
}

function readStoredVolume(): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY)
    if (raw == null) return 1
    return clampStreamVolume(Number(raw))
  } catch {
    return 1
  }
}

function persistVolume(volume: number) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOLUME_KEY, String(clampStreamVolume(volume)))
  } catch {
    /* private mode — volume still works for this session */
  }
}

type StreamState = {
  playing: boolean
  loading: boolean
  error: string | null
  volume: number
  muted: boolean
}

let audio: HTMLAudioElement | null = null
let state: StreamState = {
  playing: false,
  loading: false,
  error: null,
  volume: 1,
  muted: false,
}
const bus = typeof window !== 'undefined' ? new EventTarget() : null

function applyGain(a: HTMLAudioElement) {
  a.volume = effectiveStreamGain(state.volume, state.muted)
}

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(STREAM_URL)
    audio.preload = 'none'
    state = { ...state, volume: readStoredVolume() }
    applyGain(audio)

    audio.addEventListener('play', () => emit({ playing: true, loading: false, error: null }))
    audio.addEventListener('pause', () => emit({ playing: false, loading: false, error: state.error }))
    audio.addEventListener('waiting', () => emit({ loading: true }))
    audio.addEventListener('playing', () => emit({ loading: false }))
    audio.addEventListener('error', () =>
      emit({ playing: false, loading: false, error: 'Stream unavailable — try fm985.com.au/audio-player/' }),
    )
  }
  return audio
}

function emit(patch: Partial<StreamState>) {
  state = { ...state, ...patch }
  if (audio) applyGain(audio)
  bus?.dispatchEvent(new CustomEvent('stream-state', { detail: state }))
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

    emit({ loading: true, error: null })
    try {
      await a.play()
    } catch {
      emit({ playing: false, loading: false, error: 'Playback blocked — open the web player instead.' })
    }
  }, [])

  const setVolume = useCallback((next: number) => {
    getAudio()
    const volume = clampStreamVolume(next)
    persistVolume(volume)
    emit({ volume, muted: volume === 0 ? true : false })
  }, [])

  const toggleMute = useCallback(() => {
    getAudio()
    if (state.muted) {
      const volume = state.volume === 0 ? 0.7 : state.volume
      persistVolume(volume)
      emit({ muted: false, volume })
      return
    }
    emit({ muted: true })
  }, [])

  return {
    playing: local.playing,
    loading: local.loading,
    error: local.error,
    volume: local.volume,
    muted: local.muted,
    gain: effectiveStreamGain(local.volume, local.muted),
    toggle,
    setVolume,
    toggleMute,
  }
}

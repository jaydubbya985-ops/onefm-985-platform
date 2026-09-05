/** Official ONE FM live stream — same source as fm985.com.au/audio-player/ (Amrap → Radio.co) */

export const RADIO_CO_STATION_ID =
  import.meta.env.VITE_RADIO_CO_STATION_ID || 'sae3372059'

export const STREAM_URL =
  import.meta.env.VITE_STREAM_URL ||
  `https://s2.radio.co/${RADIO_CO_STATION_ID}/listen`

export const STREAM_STATUS_URL = `https://public.radio.co/stations/${RADIO_CO_STATION_ID}/status`

export const AUDIO_PLAYER_URL = 'https://fm985.com.au/audio-player/'

export const STREAM_AUDIO_MARK = 'radio.co'

/**
 * Phone Safari treats a detached Audio() as a takeover player.
 * Mark Radio.co elements playsinline and keep them in the document.
 * Leave CORS unset — the mount does not advertise it for Web Audio.
 */
function applyInline(el: HTMLAudioElement) {
  el.setAttribute('playsinline', '')
  el.setAttribute('webkit-playsinline', '')
  el.setAttribute('data-onefm-stream', STREAM_AUDIO_MARK)
}

function mountHidden(el: HTMLAudioElement) {
  if (el.isConnected) return
  el.hidden = true
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  ;(document.body ?? document.documentElement).appendChild(el)
}

function installInlineStreamAudio() {
  if (typeof window === 'undefined') return
  const w = window as Window & { __onefmStreamInline?: boolean }
  if (w.__onefmStreamInline) return
  w.__onefmStreamInline = true

  const NativeAudio = window.Audio
  const Patched = function Audio(this: unknown, src?: string) {
    const el = src === undefined ? new NativeAudio() : new NativeAudio(src)
    applyInline(el)
    if (document.body) mountHidden(el)
    else document.addEventListener('DOMContentLoaded', () => mountHidden(el), { once: true })
    return el
  } as unknown as typeof Audio
  Patched.prototype = NativeAudio.prototype
  window.Audio = Patched
}

installInlineStreamAudio()

/** Official ONE FM live stream — same source as fm985.com.au/audio-player/ (Amrap → Radio.co) */

export const RADIO_CO_STATION_ID =
  import.meta.env.VITE_RADIO_CO_STATION_ID || 'sae3372059'

export const STREAM_URL =
  import.meta.env.VITE_STREAM_URL ||
  `https://s2.radio.co/${RADIO_CO_STATION_ID}/listen`

export const STREAM_STATUS_URL = `https://public.radio.co/stations/${RADIO_CO_STATION_ID}/status`

export const AUDIO_PLAYER_URL = 'https://fm985.com.au/audio-player/'

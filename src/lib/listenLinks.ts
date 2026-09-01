import { AUDIO_PLAYER_URL, STREAM_URL } from '@/lib/streamConfig'

/**
 * Official ONE FM listening destinations.
 * Verified: 98.5 FM, Radio.co stream, fm985.com.au/audio-player/, studio phone.
 * Community Radio Plus is a national CBAA app — not a verified ONE FM listing
 * or station-specific reach figure. Do not advertise it here.
 */

export const LISTEN_LINKS = {
  fm: { label: '98.5 FM', href: null as string | null, description: 'Shepparton & Goulburn Murray' },
  stream: { label: 'Listen Live', href: STREAM_URL, description: 'Direct stream (Radio.co)' },
  web: { label: 'fm985.com.au', href: AUDIO_PLAYER_URL, description: 'Official web audio player' },
  /** Slot still named `crp` for existing consumers — values are the official web player, not Community Radio Plus. */
  crp: {
    label: 'fm985.com.au',
    href: AUDIO_PLAYER_URL,
    description: 'Official web audio player',
  },
  phone: { label: 'Studio', href: 'tel:+61358313131', description: '(03) 5831 3131' },
} as const

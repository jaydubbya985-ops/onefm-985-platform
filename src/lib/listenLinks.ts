import { AUDIO_PLAYER_URL, STREAM_URL } from '@/lib/streamConfig'

/** Official ONE FM listening destinations */

export const LISTEN_LINKS = {
  fm: { label: '98.5 FM', href: null as string | null, description: 'Shepparton & Goulburn Murray' },
  stream: { label: 'Listen Live', href: STREAM_URL, description: 'Direct stream (Radio.co)' },
  web: { label: 'fm985.com.au', href: AUDIO_PLAYER_URL, description: 'Official web audio player' },
  crp: {
    label: 'Community Radio Plus',
    href: 'https://communityradio.plus',
    description: 'ONE FM on the Community Radio Plus app',
  },
  phone: { label: 'Studio', href: 'tel:+61358313131', description: '(03) 5831 3131' },
} as const

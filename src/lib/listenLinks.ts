import { STREAM_URL } from '@/lib/streamConfig'

/**
 * Official ONE FM listening destinations.
 * Verified: 98.5 FM, Radio.co stream, this site’s Listen page, studio phone.
 * WordPress /audio-player/ is the same Radio.co stream — do not bounce listeners
 * off this site for “web” or leftover CR+ tiles.
 * Community Radio Plus is a national CBAA app — not a verified ONE FM listing
 * or station-specific reach figure. Do not advertise it here.
 */

/** React Router path (HashRouter). */
export const LISTEN_PATH = '/listen'

/** <a href> for HashRouter — `/listen` without the hash loads the SPA on `/` (home). */
export const LISTEN_HASH_HREF = '/#/listen'

export const LISTEN_LINKS = {
  fm: { label: '98.5 FM', href: null as string | null, description: 'Shepparton & Goulburn Murray' },
  stream: { label: 'Listen Live', href: STREAM_URL, description: 'Direct stream (Radio.co)' },
  web: {
    label: 'Listen Live',
    href: LISTEN_HASH_HREF,
    description: 'Stream on this site (Radio.co)',
  },
  /** Slot still named `crp` for existing consumers — same in-app listen page, not Community Radio Plus. */
  crp: {
    label: 'This site',
    href: LISTEN_HASH_HREF,
    description: 'Stream on this site (Radio.co)',
  },
  phone: { label: 'Studio', href: 'tel:+61358313131', description: '(03) 5831 3131' },
} as const

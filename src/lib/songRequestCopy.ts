import { BRAND } from '@/lib/brand'

/**
 * Song / shout-out form is mailto only.
 * Do not claim the studio received the request until the listener sends the draft.
 */
export const SONG_REQUEST_INTRO = `Opens an email draft to ${BRAND.email}. Nothing is sent until you hit send in your email app. You can also call ${BRAND.phone} while we are live.`

export const SONG_REQUEST_CTA = 'Open email draft'

export const SONG_REQUEST_OPENED = `Email draft opened — complete the send in your email app so it reaches ${BRAND.email}. You can also call the studio on ${BRAND.phone}.`

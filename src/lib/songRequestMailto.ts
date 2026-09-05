/**
 * Song / shout-out requests go out as a mailto draft.
 * Nothing is sent from this site — do not invent a "sent" or "draft opened" state.
 */
import { BRAND } from '@/lib/brand'

export const SONG_REQUEST_SUBJECT = 'ONE FM Song Request'

export function songRequestPlaintext(input: {
  name: string
  song: string
  message?: string
}): string {
  const name = input.name.trim()
  const song = input.song.trim()
  const message = input.message?.trim() || '(none)'
  return `Song request from ${name}\n\nSong: ${song}\n\nMessage: ${message}`
}

export function songRequestMailto(input: {
  name: string
  song: string
  message?: string
}): string {
  const body = encodeURIComponent(songRequestPlaintext(input))
  return `mailto:${BRAND.email}?subject=${encodeURIComponent(SONG_REQUEST_SUBJECT)}&body=${body}`
}

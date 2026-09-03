/**
 * One voice at a time. Interview players and the Radio.co live stream
 * must not talk over each other. Owners are object identities (a ref).
 */

export const EXCLUSIVE_PLAY_EVENT = 'onefm-exclusive-play'

export function claimExclusivePlayback(owner: object): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EXCLUSIVE_PLAY_EVENT, { detail: owner }))
}

export function onExclusivePlayback(owner: object, yieldPlay: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (event: Event) => {
    const other = (event as CustomEvent<object>).detail
    if (other !== owner) yieldPlay()
  }
  window.addEventListener(EXCLUSIVE_PLAY_EVENT, handler)
  return () => window.removeEventListener(EXCLUSIVE_PLAY_EVENT, handler)
}

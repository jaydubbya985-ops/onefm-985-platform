/**
 * Media kit on THIS SPA (HashRouter).
 * fm985.com.au has no HashRouter — leftover `https://fm985.com.au/#/media-kit`
 * loads WordPress home, not the kit.
 */
export const MEDIA_KIT_HASH = '/#/media-kit'

export const MEDIA_KIT_PUBLIC_URL = `https://onefmops.netlify.app${MEDIA_KIT_HASH}`

export function isLeftoverWordPressHash(url: string): boolean {
  return /fm985\.com\.au\/#\//i.test(url)
}

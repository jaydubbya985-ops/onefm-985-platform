/**
 * Where THIS SPA is served. fm985.com.au is the WordPress news / guide site —
 * it does not host `/assets/images/`. Gluing that host onto a station still
 * 404s the share card (confirmed 2026-09-04).
 */
export const PUBLIC_SITE_URL = 'https://onefmops.netlify.app'

/** WordPress news / guide — never used as the Open Graph image host. */
export const NEWS_SITE_URL = 'https://fm985.com.au'

export const SHARE_STILL_PATH = '/assets/images/studio-exterior-rainbow.jpg'

export const SHARE_STILL_URL = `${PUBLIC_SITE_URL}${SHARE_STILL_PATH}`

/** Origin of the page the listener is on. Falls back to the production SPA. */
export function siteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  return PUBLIC_SITE_URL
}

/** Prefix a same-origin asset. Never glue NEWS_SITE_URL onto `/assets/`. */
export function absoluteAsset(path: string, origin = siteOrigin()): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${origin}${p}`
}

export function absoluteShareStill(origin = siteOrigin()): string {
  return absoluteAsset(SHARE_STILL_PATH, origin)
}

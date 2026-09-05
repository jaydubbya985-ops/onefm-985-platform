/**
 * This SPA’s public origin — onefmops.netlify.app.
 * WordPress (fm985.com.au) is the live news/guide site. Its /assets/images/
 * tree is not this Vite build. Crawlers that fetch og:image from WordPress 404.
 */

export const PUBLIC_SITE_ORIGIN = 'https://onefmops.netlify.app'

/** Live WordPress — interviews, guide, news. Not OG photos for this SPA. */
export const WORDPRESS_SITE_ORIGIN = 'https://fm985.com.au'

const DEFAULT_OG_PHOTO = '/assets/images/studio-exterior-rainbow.jpg'

export function spaOrigin(origin = typeof window !== 'undefined' ? window.location.origin : ''): string {
  const trimmed = origin.replace(/\/$/, '')
  if (trimmed && trimmed !== 'null' && /^https?:\/\//.test(trimmed)) return trimmed
  return PUBLIC_SITE_ORIGIN
}

export function spaAbsoluteUrl(
  path: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  if (/^https?:\/\//.test(path)) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${spaOrigin(origin)}${p}`
}

export function spaCanonicalUrl(
  hash = typeof window !== 'undefined' ? window.location.hash : '#/',
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const raw = hash.trim() || '#/'
  const h = raw.startsWith('#') ? raw : `#${raw}`
  const normalised = h === '#' ? '#/' : h
  return `${spaOrigin(origin)}/${normalised}`
}

export function spaOgImageUrl(
  ogImage = DEFAULT_OG_PHOTO,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  return spaAbsoluteUrl(ogImage, origin)
}

export const DEFAULT_OG_IMAGE_PATH = DEFAULT_OG_PHOTO

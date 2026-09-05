/**
 * Lock: share cards point at this SPA, not leftover WordPress asset URLs.
 * Run: npx vite-node scripts/verify-seo-origin-not-wordpress.ts
 */
import { readFileSync } from 'node:fs'
import {
  PUBLIC_SITE_ORIGIN,
  WORDPRESS_SITE_ORIGIN,
  spaAbsoluteUrl,
  spaCanonicalUrl,
  spaOgImageUrl,
  spaOrigin,
} from '../src/lib/publicSite'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-seo-origin-not-wordpress FAIL: ${message}`)
    process.exit(1)
  }
}

assert(PUBLIC_SITE_ORIGIN === 'https://onefmops.netlify.app', `SPA origin: ${PUBLIC_SITE_ORIGIN}`)
assert(WORDPRESS_SITE_ORIGIN === 'https://fm985.com.au', 'WordPress origin stays the news site')

assert(spaOrigin('') === PUBLIC_SITE_ORIGIN, 'empty origin falls back to Netlify SPA')
assert(spaOrigin('null') === PUBLIC_SITE_ORIGIN, 'null origin falls back')
assert(spaOrigin('https://onefmops.netlify.app/') === PUBLIC_SITE_ORIGIN, 'trailing slash stripped')
assert(
  spaOrigin('http://localhost:3000') === 'http://localhost:3000',
  'local preview keeps localhost origin',
)

assert(
  spaCanonicalUrl('#/listen', PUBLIC_SITE_ORIGIN) === 'https://onefmops.netlify.app/#/listen',
  `canonical listen: ${spaCanonicalUrl('#/listen', PUBLIC_SITE_ORIGIN)}`,
)
assert(
  spaCanonicalUrl('#/', PUBLIC_SITE_ORIGIN) === 'https://onefmops.netlify.app/#/',
  'home hash canonical',
)

const photo = spaOgImageUrl('/assets/images/studio-exterior-rainbow.jpg', PUBLIC_SITE_ORIGIN)
assert(
  photo === 'https://onefmops.netlify.app/assets/images/studio-exterior-rainbow.jpg',
  `og image: ${photo}`,
)
assert(!photo.includes('fm985.com.au'), 'og image must not use WordPress')
assert(
  spaAbsoluteUrl('https://fm985.com.au/guide/', PUBLIC_SITE_ORIGIN) === 'https://fm985.com.au/guide/',
  'already-absolute WordPress news URLs stay untouched',
)

const seo = readFileSync(new URL('../src/components/SEO.tsx', import.meta.url), 'utf8')
assert(!seo.includes('fm985.com.au'), 'SEO.tsx must not hardcode WordPress as SITE_URL')
assert(seo.includes('spaCanonicalUrl'), 'SEO must use spaCanonicalUrl')
assert(seo.includes('spaOgImageUrl'), 'SEO must use spaOgImageUrl')

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
assert(indexHtml.includes('__ONEFM_SITE_ORIGIN__'), 'index.html crawler tags use SPA origin placeholder')
assert(
  !/og:(image|url)[^>]+fm985\.com\.au/.test(indexHtml),
  'index.html OG tags must not point at WordPress',
)
assert(
  !/twitter:image[^>]+fm985\.com\.au/.test(indexHtml),
  'index.html twitter:image must not point at WordPress',
)

const vite = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
assert(vite.includes('readPublicSiteOrigin'), 'vite injects PUBLIC_SITE_ORIGIN from publicSite.ts')
assert(vite.includes('__ONEFM_SITE_ORIGIN__'), 'vite replaces SPA origin placeholder')

console.log('verify-seo-origin-not-wordpress: share cards use this SPA origin, not WordPress assets.')

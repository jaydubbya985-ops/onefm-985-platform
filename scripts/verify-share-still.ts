/**
 * Share cards must use the live SPA host for station stills.
 * fm985.com.au/assets/images/… is leftover WordPress — it 404s.
 * Run: npx vite-node scripts/verify-share-still.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  NEWS_SITE_URL,
  PUBLIC_SITE_URL,
  SHARE_STILL_PATH,
  SHARE_STILL_URL,
  absoluteAsset,
  absoluteShareStill,
} from '../src/lib/publicSite'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-share-still FAIL: ${message}`)
    process.exit(1)
  }
}

const leftoverWordPressStill = `${NEWS_SITE_URL}/assets/images/`
const html = readFileSync(resolve('index.html'), 'utf8')
const seo = readFileSync(resolve('src/components/SEO.tsx'), 'utf8')

assert(PUBLIC_SITE_URL === 'https://onefmops.netlify.app', 'PUBLIC_SITE_URL is the live SPA')
assert(SHARE_STILL_PATH === '/assets/images/studio-exterior-rainbow.jpg', 'share still is the station exterior')
assert(SHARE_STILL_URL === `${PUBLIC_SITE_URL}${SHARE_STILL_PATH}`, 'SHARE_STILL_URL is host + path')
assert(
  absoluteShareStill(PUBLIC_SITE_URL) === SHARE_STILL_URL,
  'absoluteShareStill(production) matches SHARE_STILL_URL',
)
assert(
  absoluteShareStill('http://localhost:3000') === `http://localhost:3000${SHARE_STILL_PATH}`,
  'dev origin keeps the still on this app',
)
assert(
  absoluteAsset('/assets/images/tower-stars-night.png', PUBLIC_SITE_URL) ===
    `${PUBLIC_SITE_URL}/assets/images/tower-stars-night.png`,
  'page stills stay on this SPA host',
)
assert(
  !absoluteAsset(SHARE_STILL_PATH, PUBLIC_SITE_URL).startsWith(NEWS_SITE_URL),
  'absoluteAsset must not use leftover WordPress host',
)

assert(html.includes(`content="${SHARE_STILL_URL}"`), 'index.html og/twitter image is the live still')
assert(html.includes(`content="${PUBLIC_SITE_URL}/"`), 'index.html og:url is this SPA')
assert(!html.includes(leftoverWordPressStill), 'index.html must not glue WordPress onto /assets/images/')
assert(!html.includes('https://fm985.com.au/assets/'), 'index.html has no leftover WordPress asset host')

assert(seo.includes('from \'@/lib/publicSite\''), 'SEO reads the public site helper')
assert(!seo.includes("SITE_URL = 'https://fm985.com.au'"), 'SEO must not hardcode leftover WordPress host')
assert(seo.includes('absoluteAsset('), 'SEO prefixes same-origin stills via absoluteAsset')
assert(!seo.includes('`${SITE_URL}${ogImage}`'), 'SEO must not glue leftover host onto the still')
assert(!seo.includes(leftoverWordPressStill), 'SEO.tsx must not glue WordPress onto /assets/images/')

console.log('verify-share-still OK')

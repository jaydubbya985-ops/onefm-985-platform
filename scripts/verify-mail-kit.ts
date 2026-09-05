/**
 * Mailchimp media-kit CTA must open this SPA, not leftover WordPress hash.
 * Run: npx vite-node scripts/verify-mail-kit.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildMailchimpNewsletterSnippet } from '../src/lib/mailchimpBridge'
import {
  MEDIA_KIT_PUBLIC_URL,
  isLeftoverWordPressHash,
} from '../src/lib/mediaKitUrl'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-mail-kit FAIL: ${message}`)
    process.exit(1)
  }
}

const hub = readFileSync(resolve('src/pages/SocialHub.tsx'), 'utf8')

assert(
  MEDIA_KIT_PUBLIC_URL === 'https://onefmops.netlify.app/#/media-kit',
  'media kit URL is this SPA HashRouter route',
)
assert(!isLeftoverWordPressHash(MEDIA_KIT_PUBLIC_URL), 'public URL is not leftover WordPress hash')
assert(isLeftoverWordPressHash('https://fm985.com.au/#/media-kit'), 'detector catches leftover WordPress hash')

assert(hub.includes('MEDIA_KIT_PUBLIC_URL'), 'Social Hub snippet uses the media kit helper')
assert(!hub.includes('fm985.com.au/#/'), 'Social Hub must not paste leftover WordPress hash')

const snippet = buildMailchimpNewsletterSnippet({
  headline: 'Test',
  body: 'Body',
  ctaLabel: 'View Media Kit',
  ctaUrl: MEDIA_KIT_PUBLIC_URL,
})
assert(snippet.includes(`href="${MEDIA_KIT_PUBLIC_URL}"`), 'snippet button opens this SPA media kit')
assert(!snippet.includes('fm985.com.au/#/'), 'snippet has no leftover WordPress hash')

console.log('verify-mail-kit OK')

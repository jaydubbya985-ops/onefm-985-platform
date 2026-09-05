/**
 * Fail if the media kit leftover Interviews & Podcasts card is still on the page.
 * Run: npx vite-node scripts/verify-kit-not-podcasts.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-kit-not-podcasts FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')

assert(!/Interviews & Podcasts/.test(src), 'MediaKit must not invent leftover podcasts')
assert(src.includes('Interview archive'), 'MediaKit must name the SoundCloud interview archive')
assert(src.includes('not a separate podcast feed'), 'MediaKit must not dress the archive as a podcast feed')
assert(
  src.includes('soundcloud.com/user-570295409'),
  'MediaKit interview reach must be the sourced SoundCloud profile',
)
assert(
  BRAND.soundcloud === 'https://soundcloud.com/user-570295409',
  `BRAND.soundcloud must stay the sourced profile, got ${BRAND.soundcloud}`,
)

console.log('verify-kit-not-podcasts OK')

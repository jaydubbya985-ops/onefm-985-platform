/**
 * Lock: Social Hub hashtags are caption examples, not leftover official sets.
 * Run: npx vite-node scripts/verify-hub-not-hashtags.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')

if (/The station hashtags to use/i.test(src)) {
  throw new Error('SocialHub.tsx: leftover official hashtag-set copy is back')
}
if (/#RadioLife/.test(src) || /#LiveMusic/.test(src)) {
  throw new Error('SocialHub.tsx: leftover invented official hashtags are back')
}
if (!src.includes('not an official station hashtag set')) {
  throw new Error('SocialHub.tsx: missing honest not-an-official-set line')
}
if (!src.includes('#OneFM') || !src.includes('#GVL') || !src.includes('#Shepparton')) {
  throw new Error('SocialHub.tsx: example chips must stay sourced from caption starters')
}

console.log('verify-hub-not-hashtags: ok')

/**
 * Lock: Heritage archive GVL slide names Match of the Day on the weekly guide,
 * not leftover invented “voice of the game since the first bounce.”
 * Run: npx vite-node scripts/verify-gallery-not-bounce.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/HorizontalGallery.tsx', import.meta.url), 'utf8')

if (/first bounce/i.test(src)) {
  throw new Error('HorizontalGallery.tsx: leftover first bounce is back')
}

if (/voice of the game/i.test(src)) {
  throw new Error('HorizontalGallery.tsx: leftover voice of the game is back')
}

if (!src.includes('GVL Match of the Day · ${GVL_MATCH_HOURS ?? \'Saturday\'} on the weekly guide.')) {
  throw new Error(
    'HorizontalGallery.tsx: GVL slide must name Match of the Day on the weekly guide',
  )
}

console.log('verify-gallery-not-bounce: ok')

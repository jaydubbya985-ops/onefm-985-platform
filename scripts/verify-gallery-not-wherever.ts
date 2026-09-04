/**
 * Lock: Heritage gallery OB slide names station photography, not leftover field-everywhere.
 * Run: npx vite-node scripts/verify-gallery-not-wherever.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/HorizontalGallery.tsx', import.meta.url), 'utf8')

if (/wherever the story is/i.test(src)) {
  throw new Error('HorizontalGallery.tsx: leftover wherever-the-story-is is back')
}
if (/one broadcast team/i.test(src)) {
  throw new Error('HorizontalGallery.tsx: leftover broadcast team is back')
}
if (!src.includes('station photography')) {
  throw new Error('HorizontalGallery.tsx: missing honest station-photography line')
}
if (!src.includes('weekly guide when they are on')) {
  throw new Error('HorizontalGallery.tsx: missing weekly-guide-when-on line')
}

console.log('verify-gallery-not-wherever: ok')

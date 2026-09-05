/**
 * Lock: Story language-strands card names Monday–Wednesday evenings, not leftover weekend slots.
 * Run: npx vite-node scripts/verify-story-not-weekend.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Story.tsx', import.meta.url), 'utf8')

if (/Weekend and evening slots/.test(src)) {
  throw new Error('Story.tsx: leftover Weekend and evening slots is back')
}
if (!src.includes('Monday–Wednesday evenings')) {
  throw new Error('Story.tsx: language-strands card must name Monday–Wednesday evenings')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('APRA AMCOS Licensed')) {
  throw new Error('Story.tsx: leftover APRA AMCOS Licensed must stay')
}
if (!src.includes('Where the magic happens')) {
  throw new Error('Story.tsx: leftover Where the magic happens must stay for #474')
}
if (!src.includes('tune in anywhere')) {
  throw new Error('Story.tsx: leftover tune in anywhere must stay')
}
if (!src.includes('across the Goulburn Murray')) {
  throw new Error('Story.tsx: leftover Goulburn Murray must stay')
}
if (!src.includes('Community Radio Since 1989')) {
  throw new Error('Story.tsx: leftover Community Radio Since 1989 must stay')
}

console.log('verify-story-not-weekend: Story language-strands card names Monday–Wednesday evenings.')

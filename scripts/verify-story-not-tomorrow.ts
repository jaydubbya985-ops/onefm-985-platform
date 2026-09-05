/**
 * Lock: Story heading names live, the stream, and the licence — not leftover Looking Forward.
 * Run: npx vite-node scripts/verify-story-not-tomorrow.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Story.tsx', import.meta.url), 'utf8')

if (/Looking Forward/.test(src)) {
  throw new Error('Story.tsx: leftover Looking Forward is back')
}
if (/LOOKING AHEAD/.test(src)) {
  throw new Error('Story.tsx: leftover LOOKING AHEAD cursor label is back')
}
if (/tomorrow's technology/.test(src)) {
  throw new Error("Story.tsx: leftover tomorrow's technology is back")
}
if (/next chapter of ONE FM/.test(src)) {
  throw new Error('Story.tsx: leftover next chapter is back')
}
if (/heritage values/.test(src)) {
  throw new Error('Story.tsx: leftover heritage values is back')
}
if (!src.includes('Live, the stream, and the licence')) {
  throw new Error('Story.tsx: heading must name live, the stream, and the licence')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('APRA AMCOS Licensed')) {
  throw new Error('Story.tsx: leftover APRA AMCOS must stay')
}
if (!src.includes('Where the magic happens')) {
  throw new Error('Story.tsx: leftover magic must stay for #474')
}
if (!src.includes('Meet the Voices of the Valley')) {
  throw new Error('Story.tsx: leftover Voices heading must stay for #461')
}
if (!src.includes('Goulburn Murray')) {
  throw new Error('Story.tsx: leftover Goulburn Murray must stay for #549')
}
if (!src.includes('Community Impact')) {
  throw new Error('Story.tsx: leftover Community Impact must stay')
}
if (!src.includes('tune in anywhere')) {
  throw new Error('Story.tsx: leftover tune in anywhere must stay')
}

console.log('verify-story-not-tomorrow: Story heading names live, the stream, and the licence.')

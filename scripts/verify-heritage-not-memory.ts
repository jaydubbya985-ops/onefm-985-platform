/**
 * Lock: Heritage hero names Contact, not leftover invented memory-collect.
 * Run: npx vite-node scripts/verify-heritage-not-memory.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Heritage.tsx', import.meta.url), 'utf8')

if (/Add Your Memory/.test(src)) {
  throw new Error('Heritage.tsx: leftover invented memory-collect is back')
}
if (!src.includes('Send via Contact')) {
  throw new Error('Heritage.tsx: hero CTA must name Send via Contact')
}
if (!src.includes('to="/contact"')) {
  throw new Error('Heritage.tsx: hero CTA must open /contact')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Legends & Voices')) {
  throw new Error('Heritage.tsx: leftover Voices NameWall must stay for #461')
}
if (!src.includes('Explore the Timeline')) {
  throw new Error('Heritage.tsx: leftover Explore the Timeline must stay')
}
if (!src.includes('Search the Archive')) {
  throw new Error('Heritage.tsx: leftover Search the Archive must stay')
}
if (!src.includes('The story continues on air')) {
  throw new Error('Heritage.tsx: leftover The story continues on air must stay')
}
if (!src.includes('The 1988 Mixing Panel · Still in the studio')) {
  throw new Error('Heritage.tsx: leftover mixing panel must stay')
}

console.log('verify-heritage-not-memory: Heritage hero names Contact, not leftover invented memory-collect.')

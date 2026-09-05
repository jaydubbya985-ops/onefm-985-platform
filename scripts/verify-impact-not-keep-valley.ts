/**
 * Lock: Donate IMPACT names transmission costs, not leftover Keep the Valley on air.
 * Run: npx vite-node scripts/verify-impact-not-keep-valley.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Support.tsx', import.meta.url), 'utf8')

if (/Keep the Valley on air/.test(src)) {
  throw new Error('Support.tsx: leftover Keep the Valley on air is back')
}
if (!src.includes('Transmission, studio and programming')) {
  throw new Error('Support.tsx: IMPACT programming card must name transmission, studio and programming')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Card payments coming soon')) {
  throw new Error('Support.tsx: leftover Card payments coming soon must stay for #261')
}
if (!src.includes('Every dollar stays local')) {
  throw new Error('Support.tsx: leftover Every dollar stays local must stay for #532')
}
if (!src.includes('Get involved →')) {
  throw new Error('Support.tsx: leftover Get involved must stay')
}
if (!src.includes('View packages →')) {
  throw new Error('Support.tsx: leftover View packages must stay for #457')
}
if (!src.includes('Goulburn Murray')) {
  throw new Error('Support.tsx: leftover Goulburn Murray must stay for #549')
}

console.log('verify-impact-not-keep-valley: Donate IMPACT names transmission, studio and programming.')

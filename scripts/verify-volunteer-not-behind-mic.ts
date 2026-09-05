/**
 * Lock: Donate volunteer card names asking the station, not leftover behind the mic.
 * Run: npx vite-node scripts/verify-volunteer-not-behind-mic.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Support.tsx', import.meta.url), 'utf8')

if (/Go behind the mic/.test(src)) {
  throw new Error('Support.tsx: leftover Go behind the mic is back')
}
if (!src.includes('Ask the station about volunteering')) {
  throw new Error('Support.tsx: volunteer card must name asking the station')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('membership required')) {
  throw new Error('Support.tsx: leftover membership required must stay for #419')
}
if (!src.includes('Get involved →')) {
  throw new Error('Support.tsx: leftover Get involved must stay')
}
if (!src.includes('Keep the Valley on air')) {
  throw new Error('Support.tsx: leftover Keep the Valley on air must stay for #563')
}
if (!src.includes('Card payments coming soon')) {
  throw new Error('Support.tsx: leftover Card payments coming soon must stay for #261')
}
if (!src.includes('Goulburn Murray')) {
  throw new Error('Support.tsx: leftover Goulburn Murray must stay for #549')
}

console.log('verify-volunteer-not-behind-mic: Donate volunteer card names asking the station.')

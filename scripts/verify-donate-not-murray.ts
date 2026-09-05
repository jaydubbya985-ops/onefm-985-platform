/**
 * Lock: Donate NFP card names Goulburn Valley, not leftover Goulburn Murray.
 * Run: npx vite-node scripts/verify-donate-not-murray.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Support.tsx', import.meta.url), 'utf8')

if (/Goulburn Murray/.test(src)) {
  throw new Error('Support.tsx: leftover Goulburn Murray is back')
}
if (!src.includes('across the Goulburn Valley')) {
  throw new Error('Support.tsx: NFP card must name Goulburn Valley')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Every dollar stays local')) {
  throw new Error('Support.tsx: leftover Every dollar stays local must stay for #532')
}
if (!src.includes('View packages')) {
  throw new Error('Support.tsx: leftover View packages must stay for #457')
}
if (!src.includes('membership required')) {
  throw new Error('Support.tsx: leftover membership required must stay for #419')
}
if (!src.includes('Get involved')) {
  throw new Error('Support.tsx: leftover Get involved must stay for #419')
}
if (!src.includes('Card payments coming soon')) {
  throw new Error('Support.tsx: leftover Card payments coming soon must stay')
}

console.log('verify-donate-not-murray: Donate NFP card names Goulburn Valley, not leftover Goulburn Murray.')

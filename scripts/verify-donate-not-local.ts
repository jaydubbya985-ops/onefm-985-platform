/**
 * Lock: Donate ticker names licensed 1989 / callsign 3ONE — not leftover every-dollar-stays-local.
 * Run: npx vite-node scripts/verify-donate-not-local.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Support.tsx', import.meta.url), 'utf8')

if (/Every dollar stays local/.test(src)) {
  throw new Error('Support.tsx: leftover Every dollar stays local is back')
}
if (!src.includes('BRAND.licensed') || !src.includes('BRAND.callsign')) {
  throw new Error('Support.tsx: ticker must name licensed / callsign from BRAND')
}

// Other desks own these leftovers — do not steal their remaps.
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

console.log(
  'verify-donate-not-local: Donate ticker names licensed 1989 and callsign 3ONE, not leftover every-dollar-stays-local.',
)

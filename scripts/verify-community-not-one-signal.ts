/**
 * Lock: Community hero uses sourced coverage, not leftover one signal.
 * Run: npx vite-node scripts/verify-community-not-one-signal.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Community.tsx', import.meta.url), 'utf8')

if (/one signal/.test(src)) {
  throw new Error('Community.tsx: leftover one signal is back')
}
if (!src.includes('formatCoverageShort')) {
  throw new Error('Community.tsx: hero must use formatCoverageShort()')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('From the GVL grand final')) {
  throw new Error('Community.tsx: leftover GVL grand final must stay (sourced + Community skip)')
}
if (!src.includes('Community radio since 1989')) {
  throw new Error('Community.tsx: leftover Community radio since 1989 must stay for #529')
}
if (!src.includes('Weeknight world programs')) {
  throw new Error('Community.tsx: leftover Weeknight world programs must stay for #441')
}

console.log('verify-community-not-one-signal: Community hero uses formatCoverageShort, not leftover one signal.')

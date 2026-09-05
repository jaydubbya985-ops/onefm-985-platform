/**
 * Lock: Community ticker names licensed 1989 / established 1980 — not leftover since 1989.
 * Run: npx vite-node scripts/verify-community-not-since.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Community.tsx', import.meta.url), 'utf8')

if (/Community radio since 1989/.test(src)) {
  throw new Error('Community.tsx: leftover Community radio since 1989 is back')
}
if (
  !src.includes('BRAND.licensed') ||
  !src.includes('BRAND.established') ||
  !src.includes('BRAND.callsign')
) {
  throw new Error('Community.tsx: ticker must name licensed / established / callsign from BRAND')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Weeknight world programs')) {
  throw new Error('Community.tsx: leftover Weeknight world programs must stay for #441')
}

console.log(
  'verify-community-not-since: Community ticker names licensed 1989 and established 1980, not leftover since 1989.',
)

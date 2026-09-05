/**
 * Football "who you're sponsoring" names licensed 1989 — not leftover APRA as ACMA.
 * Rank badges, ROI alternatives, and closer thousands are different desks.
 * Run: npx vite-node scripts/verify-footy-acma.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-footy-acma FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

assert(!src.includes('1385226'), 'Football must not print leftover APRA 1385226/1')
assert(!src.includes('ACMA licence 1385226'), 'Football must not dress leftover APRA as ACMA')
assert(!src.includes('ACMA 1385226'), 'Football must not dress leftover APRA as ACMA')
assert(src.includes('licensed ${BRAND.licensed}'), 'Football must name the sourced licensed year')
assert(src.includes('${BRAND.org}'), 'Football must name the licensed entity from BRAND')
assert(BRAND.licensed === 1989, `licensed year must stay 1989, got ${BRAND.licensed}`)
assert(BRAND.callsign === '3ONE', `callsign must stay 3ONE, got ${BRAND.callsign}`)

console.log('verify-footy-acma OK')
console.log(`  ${BRAND.org} · licensed ${BRAND.licensed} · ${BRAND.callsign}`)

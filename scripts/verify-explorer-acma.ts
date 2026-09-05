/**
 * Broadcast Explorer names licensed 1989 — not leftover APRA 1385226/1 as ACMA.
 * Footer leftover is #397. Contact leftover is #398. 24/7 marquee is #290.
 * Run: npx vite-node scripts/verify-explorer-acma.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-explorer-acma FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')

assert(!src.includes('1385226'), 'Explorer must not print leftover APRA 1385226/1')
assert(!src.includes('ACMA LICENSE'), 'Explorer must not dress leftover APRA as ACMA LICENSE')
assert(!src.includes('ACMA licence'), 'Explorer must not dress leftover APRA as ACMA licence')
assert(src.includes('licensed {BRAND.licensed}'), 'Explorer body must name the sourced licensed year')
assert(src.includes('LICENSED {BRAND.licensed}'), 'Explorer marquee must name the sourced licensed year')
assert(BRAND.licensed === 1989, `licensed year must stay 1989, got ${BRAND.licensed}`)
assert(BRAND.callsign === '3ONE', `callsign must stay 3ONE, got ${BRAND.callsign}`)

console.log('verify-explorer-acma OK')
console.log(`  licensed ${BRAND.licensed} · ${BRAND.callsign}`)

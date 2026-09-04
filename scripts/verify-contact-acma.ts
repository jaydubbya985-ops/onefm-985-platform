/**
 * Contact chrome names the licensed year — not leftover APRA 1385226/1 as ACMA.
 * Footer leftover is #397. This desk is the Contact badge only.
 * Run: npx vite-node scripts/verify-contact-acma.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-contact-acma FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')

assert(!src.includes('ACMA License: {BRAND.acma}'), 'Contact must not dress leftover APRA as ACMA License')
assert(!src.includes('1385226'), 'Contact must not print leftover APRA 1385226/1')
assert(src.includes('Licensed {BRAND.licensed}'), 'Contact must name the sourced licensed year')
assert(src.includes('Callsign: {BRAND.callsign}'), 'Contact must keep callsign 3ONE')
assert(BRAND.licensed === 1989, `licensed year must stay 1989, got ${BRAND.licensed}`)
assert(BRAND.callsign === '3ONE', `callsign must stay 3ONE, got ${BRAND.callsign}`)
assert(BRAND.acma === '1385226/1', 'do not silently rewrite brand.acma on this desk')

console.log('verify-contact-acma OK')
console.log(`  Licensed ${BRAND.licensed} · ${BRAND.callsign}`)

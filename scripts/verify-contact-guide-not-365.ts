/**
 * Contact station-info tile names the weekly guide — not leftover 24/7/365 uptime.
 * ACMA leftover on this page is a different desk. FAQ studio-line is #247.
 * Run: npx vite-node scripts/verify-contact-guide-not-365.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-contact-guide-not-365 FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')

assert(!src.includes('24 / 7 / 365'), 'Contact must not invent leftover 24/7/365 uptime')
assert(!src.includes('24/7/365'), 'Contact must not invent leftover 24/7/365 uptime')
assert(src.includes('Weekly guide'), 'Contact must name the weekly guide')
assert(src.includes('{BRAND.frequency} FM · Shepparton'), 'Contact must name 98.5 FM · Shepparton')
assert(BRAND.frequency === '98.5', `frequency must stay 98.5, got ${BRAND.frequency}`)

console.log('verify-contact-guide-not-365 OK')
console.log(`  ${BRAND.frequency} FM · Shepparton`)

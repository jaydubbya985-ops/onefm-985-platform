/**
 * Fail if Contact leftover Studio Line tile invents a live studio desk.
 * Run: npx vite-node scripts/verify-contact-phone-not-line.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-contact-phone-not-line FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')

assert(!/mb-1">Studio Line</.test(src), 'Contact station-info tile must not invent leftover Studio Line')
assert(src.includes('Station phone'), 'Contact station-info tile must name the station phone')
assert(src.includes('studioTelHref()'), 'Contact phone must stay the sourced tel: link')
assert(BRAND.phone === '(03) 5831 3131', `station phone must stay (03) 5831 3131, got ${BRAND.phone}`)

console.log('verify-contact-phone-not-line OK')

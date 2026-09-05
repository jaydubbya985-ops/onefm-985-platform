/**
 * Sponsorship enquiry chrome names the station — not a leftover call centre.
 * Run: npx vite-node scripts/verify-studio-not-centre.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-studio-not-centre FAIL: ${message}`)
    process.exit(1)
  }
}

const sponsor = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')

assert(!/call centre/i.test(sponsor), 'Sponsorship must not invent a leftover call centre')
assert(sponsor.includes('Talk to the station'), 'Sponsorship must keep the station enquiry headline')
assert(sponsor.includes('InventoryLadder'), 'Sponsorship must keep the sourced rate card')
assert(sponsor.includes('submitEnquiry'), 'Sponsorship must keep the enquiry form')

console.log('verify-studio-not-centre OK')

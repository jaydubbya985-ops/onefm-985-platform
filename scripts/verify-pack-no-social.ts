/**
 * Public package cards quote the weekly range — not leftover Instagram-shaped
 * “N announcements / N social posts” counts. MediaKit does not sell those packs.
 * Run: npx vite-node scripts/verify-pack-no-social.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-pack-no-social FAIL: ${message}`)
    process.exit(1)
  }
}

const sponsor = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')
const proposal = readFileSync(new URL('../src/pages/SalesProposal.tsx', import.meta.url), 'utf8')

assert(!sponsor.includes('social posts a month'), 'Sponsorship must not print leftover monthly social-post counts')
assert(!sponsor.includes('announcements a week'), 'Sponsorship must not print leftover weekly announcement counts')
assert(sponsor.includes('Instagram, TikTok and podcast inventory are not sold'), 'Sponsorship must name that Instagram / podcast inventory is not sold')
assert(sponsor.includes('Facebook mentions'), 'Sponsorship must keep the confirmed Facebook channel')
assert(sponsor.includes('InventoryLadder'), 'Sponsorship must keep the sourced rate card')

assert(!proposal.includes('social posts a month'), 'Proposal must not print leftover monthly social-post counts')
assert(!proposal.includes('announcements a week'), 'Proposal must not print leftover weekly announcement counts')
assert(proposal.includes('Instagram and podcast inventory are not sold'), 'Proposal must name that Instagram / podcast inventory is not sold')
assert(proposal.includes('Facebook mentions'), 'Proposal must keep the confirmed Facebook channel')

console.log('verify-pack-no-social OK')

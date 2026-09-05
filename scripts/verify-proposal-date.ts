/**
 * Fail if sponsorship proposals follow the viewer clock.
 * Run: npx vite-node scripts/verify-proposal-date.ts
 */
import {
  addDaysIso,
  formatAuDate,
  melbourneIsoDate,
} from '../src/lib/proposalDocument'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-proposal-date FAIL: ${message}`)
    process.exit(1)
  }
}

const utcEvening = new Date('2026-09-03T16:00:00.000Z')
assert(
  melbourneIsoDate(utcEvening) === '2026-09-04',
  `UTC 16:00 3 Sep must be 2026-09-04 in Shepparton, got ${melbourneIsoDate(utcEvening)}`,
)
assert(
  addDaysIso(30, utcEvening) === '2026-10-04',
  `valid-until +30 from that instant: ${addDaysIso(30, utcEvening)}`,
)
assert(addDaysIso(14, '2026-06-09') === '2026-06-23', `date-only +14: ${addDaysIso(14, '2026-06-09')}`)

const printed = formatAuDate('2026-06-09')
assert(
  printed === '9 June 2026' || printed === '9 Jun 2026',
  `date-only print: ${printed}`,
)

console.log('verify-proposal-date OK')

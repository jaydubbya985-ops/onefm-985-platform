/**
 * Fail if ops ledger dates use the viewer/UTC calendar.
 * Run: npx vite-node scripts/verify-ops-ledger-date.ts
 */
import { opsLedgerAddDays, opsLedgerAddMonths, opsLedgerIsoDate } from '../src/lib/opsLedgerDate'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-ops-ledger-date FAIL: ${message}`)
    process.exit(1)
  }
}

// Melbourne morning: 07:00 AEST 4 Sep 2026 is still 3 Sep on the UTC clock.
const melbourneMorning = new Date('2026-09-03T21:00:00.000Z')
assert(
  melbourneMorning.toISOString().split('T')[0] === '2026-09-03',
  'fixture must still be 3 Sep in UTC so the leftover is visible',
)
assert(
  opsLedgerIsoDate(melbourneMorning) === '2026-09-04',
  `Melbourne 07:00 4 Sep must write 2026-09-04, got ${opsLedgerIsoDate(melbourneMorning)}`,
)

// Late Melbourne evening: 23:00 AEST 3 Sep is still 3 Sep Melbourne, already 13:00 UTC 3 Sep.
const melbourneEvening = new Date('2026-09-03T13:00:00.000Z')
assert(
  opsLedgerIsoDate(melbourneEvening) === '2026-09-03',
  `Melbourne 23:00 3 Sep must stay 2026-09-03, got ${opsLedgerIsoDate(melbourneEvening)}`,
)

// UTC afternoon that is already the next Melbourne morning (16:00 UTC 3 Sep = 02:00 4 Sep AEST).
const utcAfternoon = new Date('2026-09-03T16:00:00.000Z')
assert(
  opsLedgerIsoDate(utcAfternoon) === '2026-09-04',
  `02:00 4 Sep Melbourne must write 2026-09-04, got ${opsLedgerIsoDate(utcAfternoon)}`,
)

const plus30 = opsLedgerAddDays(30, melbourneMorning)
assert(plus30 === '2026-10-04', `+30 Melbourne days from 4 Sep must be 2026-10-04, got ${plus30}`)
const utcPlus30 = new Date(melbourneMorning.getTime() + 30 * 86400000).toISOString().split('T')[0]
assert(
  utcPlus30 === '2026-10-03',
  `leftover UTC +30ms from this fixture must be 2026-10-03 so the Melbourne write is the fix, got ${utcPlus30}`,
)

const plus13weeks = opsLedgerAddDays(13 * 7, melbourneMorning)
assert(
  plus13weeks === '2026-12-04',
  `13-week contract from 4 Sep must end 2026-12-04, got ${plus13weeks}`,
)

const plus6months = opsLedgerAddMonths(6, melbourneMorning)
assert(
  plus6months === '2027-03-04',
  `6-month fallback from 4 Sep must be 2027-03-04, got ${plus6months}`,
)

console.log('verify-ops-ledger-date OK')

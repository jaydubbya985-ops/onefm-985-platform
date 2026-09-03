/**
 * Fail if interview dates follow the viewer clock.
 * Run: npx vite-node scripts/verify-interview-date.ts
 */
import { formatInterviewDate, parseStationPostedAt } from '../src/lib/fm985Feed'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-interview-date FAIL: ${message}`)
    process.exit(1)
  }
}

// Scraped Home fallback is date-only — must stay 29 April in every viewer TZ.
assert(
  formatInterviewDate('2026-04-29') === '29 Apr 2026' ||
    formatInterviewDate('2026-04-29') === '29 April 2026',
  `date-only 2026-04-29: ${formatInterviewDate('2026-04-29')}`,
)

// Naive WordPress stamp is studio local, not the Cloud agent's UTC clock.
assert(
  formatInterviewDate('2026-09-03T16:00:00') === '3 Sept 2026' ||
    formatInterviewDate('2026-09-03T16:00:00') === '3 Sep 2026',
  `naive 16:00 studio: ${formatInterviewDate('2026-09-03T16:00:00')}`,
)

// Explicit UTC evening is already the next Shepparton morning.
assert(
  formatInterviewDate('2026-09-03T16:00:00.000Z') === '4 Sept 2026' ||
    formatInterviewDate('2026-09-03T16:00:00.000Z') === '4 Sep 2026',
  `UTC 16:00 3 Sep must print 4 Sep in Melbourne, got ${formatInterviewDate('2026-09-03T16:00:00.000Z')}`,
)

const scraped = parseStationPostedAt('2026-04-29')
assert(!Number.isNaN(scraped.getTime()), 'scraped date-only must parse')

console.log('verify-interview-date OK')

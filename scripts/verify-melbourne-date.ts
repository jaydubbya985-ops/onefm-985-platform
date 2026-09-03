/**
 * Fail the build if invoice / receipt dates follow the viewer clock.
 * Run: npx vite-node scripts/verify-melbourne-date.ts
 */
import { generateVariantInvoiceEmailHtml } from '../src/lib/invoiceVariantEmail'
import {
  addMelbourneCalendarDays,
  formatMelbourneDate,
} from '../src/lib/melbourneDate'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-melbourne-date FAIL: ${message}`)
    process.exit(1)
  }
}

// 16:00 UTC on 3 Sep 2026 is already 4 Sep 02:00 in Shepparton (AEST).
const utcEvening = new Date('2026-09-03T16:00:00.000Z')
assert(
  formatMelbourneDate(utcEvening) === '4 September 2026',
  `UTC 16:00 3 Sep must print 4 September in Melbourne, got ${formatMelbourneDate(utcEvening)}`,
)
assert(
  formatMelbourneDate(utcEvening, 'short') === '4 Sept 2026',
  `short form: ${formatMelbourneDate(utcEvening, 'short')}`,
)

// Date-only ISO is a Melbourne calendar day, not UTC midnight.
assert(
  formatMelbourneDate('2026-06-09') === '9 June 2026',
  `date-only long: ${formatMelbourneDate('2026-06-09')}`,
)
assert(
  formatMelbourneDate('2026-06-09', 'short') === '9 June 2026',
  `date-only short: ${formatMelbourneDate('2026-06-09', 'short')}`,
)
assert(
  addMelbourneCalendarDays('2026-06-09', 14) === '2026-06-23',
  `14-day due date: ${addMelbourneCalendarDays('2026-06-09', 14)}`,
)
assert(
  addMelbourneCalendarDays('2026-01-20', 14) === '2026-02-03',
  `January +14 must not slip a UTC day, got ${addMelbourneCalendarDays('2026-01-20', 14)}`,
)

const todayMelbourne = formatMelbourneDate()
const html = generateVariantInvoiceEmailHtml(
  {
    contactName: 'Peter Foott',
    company: 'FOOTT Waste Solutions',
    invoiceNumber: 'INV-2026-001',
    amountExclGst: 500,
    gst: 50,
    total: 550,
    dueDate: '2026-06-23',
    customMessage: 'GVL Match of the Day — Sat 1PM–3PM.',
  },
  'broadcast',
  '083-894',
  '553 219 432',
  '98.5 One FM',
  'Please pay by the due date.',
)
assert(html.includes(todayMelbourne), `invoice email must stamp Melbourne today (${todayMelbourne})`)

console.log('verify-melbourne-date OK')

import assert from 'node:assert/strict'
import {
  addDaysISO,
  calendarDaysBetween,
  formatElapsed,
  gstOn,
  todayISO,
} from './opsClock'
import { ageInvoice } from './invoiceAging'

assert.equal(calendarDaysBetween('2026-06-09', '2026-08-24'), 76)
assert.equal(calendarDaysBetween('2026-06-23', '2026-08-24'), 62)
assert.equal(addDaysISO('2026-08-24', 14), '2026-09-07')
assert.equal(formatElapsed(76), '10 weeks (76 days) ago')
assert.equal(todayISO(new Date(2026, 7, 24)), '2026-08-24')

const peppermill = gstOn((6760 * 2) / 6)
assert.equal(peppermill.excl, 2253.33)
assert.equal(peppermill.gst, 225.33)
assert.equal(peppermill.total, 2478.66)

assert.equal(
  ageInvoice({ status: 'draft', dueDate: '2026-06-23' }, '2026-08-24'),
  'unsent_stale',
)
assert.equal(
  ageInvoice({ status: 'draft', dueDate: '2026-09-07' }, '2026-08-24'),
  'draft',
)
assert.equal(
  ageInvoice({ status: 'sent', dueDate: '2026-06-23' }, '2026-08-24'),
  'overdue',
)
assert.equal(ageInvoice({ status: 'paid', dueDate: '2026-01-31' }, '2026-08-24'), 'paid')

console.log('opsClock + invoiceAging checks passed')

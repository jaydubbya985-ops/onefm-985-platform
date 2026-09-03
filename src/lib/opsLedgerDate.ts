/**
 * Calendar days written onto ops invoices, contracts, and proposal valid-until.
 * Viewer / UTC `toISOString().slice(0, 10)` is yesterday for most of a Melbourne morning.
 * Display formatters live elsewhere — this file only writes YYYY-MM-DD into the ledger.
 */

const MELBOURNE = 'Australia/Melbourne'

/** Today (or `at`) as a Melbourne civil date. */
export function opsLedgerIsoDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: MELBOURNE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at)
}

function splitIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

/** Add whole Melbourne calendar days. Not `Date.now() + n * 86400000`. */
export function opsLedgerAddDays(days: number, from: Date = new Date()): string {
  const { y, m, d } = splitIso(opsLedgerIsoDate(from))
  return opsLedgerIsoDate(new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0)))
}

/** Add whole Melbourne calendar months (used for the 6-month contract fallback). */
export function opsLedgerAddMonths(months: number, from: Date = new Date()): string {
  const { y, m, d } = splitIso(opsLedgerIsoDate(from))
  return opsLedgerIsoDate(new Date(Date.UTC(y, m - 1 + months, d, 12, 0, 0)))
}

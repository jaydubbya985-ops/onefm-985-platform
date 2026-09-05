/**
 * Station calendar — Australia/Melbourne.
 * Invoice, receipt, and ops dates must not follow the viewer's clock.
 * A Cloud agent at 16:00 UTC on 3 Sep is already 4 Sep in Shepparton.
 */

export const MELBOURNE_TIME_ZONE = 'Australia/Melbourne'

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

const LONG: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

const SHORT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

export type MelbourneDateStyle = 'long' | 'short'

/** Date-only ISO (`2026-06-09`) is a Melbourne calendar day, not UTC midnight. */
export function toMelbourneInstant(value: Date | string = new Date()): Date {
  if (value instanceof Date) return value
  const trimmed = value.trim()
  if (DATE_ONLY.test(trimmed)) {
    // Noon AEST — same Melbourne calendar day through AEDT.
    return new Date(`${trimmed}T12:00:00+10:00`)
  }
  return new Date(trimmed)
}

export function formatMelbourneDate(
  value: Date | string = new Date(),
  style: MelbourneDateStyle = 'long',
): string {
  const date = toMelbourneInstant(value)
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : ''
  }
  return date.toLocaleDateString('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    ...(style === 'short' ? SHORT : LONG),
  })
}

/** Add whole calendar days to a `YYYY-MM-DD` station date. */
export function addMelbourneCalendarDays(isoDate: string, days: number): string {
  const match = DATE_ONLY.exec(isoDate.trim())
  if (!match) return isoDate
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0))
  const y = utc.getUTCFullYear()
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0')
  const d = String(utc.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Calendar date helpers for the ops portal. Always use the real clock. */

export const JUNE_BATCH_CREATED = '2026-06-09'
export const JUNE_BATCH_DUE = '2026-06-23'

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return todayISO(date)
}

/** Whole calendar days from `fromIso` to `toIso` (can be negative). */
export function calendarDaysBetween(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = fromIso.split('-').map(Number)
  const [y2, m2, d2] = toIso.split('-').map(Number)
  const a = Date.UTC(y1, m1 - 1, d1)
  const b = Date.UTC(y2, m2 - 1, d2)
  return Math.round((b - a) / 86_400_000)
}

export function formatAuDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatElapsed(days: number): string {
  if (days < 0) return `in ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  const weeks = Math.floor(days / 7)
  const rem = days % 7
  if (weeks >= 1) {
    const weekBit = `${weeks} week${weeks === 1 ? '' : 's'}`
    return rem ? `${weekBit} (${days} days) ago` : `${weekBit} ago`
  }
  return `${days} days ago`
}

export function currentMonthKey(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7)
}

export function money(n: number): number {
  return Math.round(n * 100) / 100
}

export function gstOn(excl: number): { excl: number; gst: number; total: number } {
  const roundedExcl = money(excl)
  const gst = money(roundedExcl * 0.1)
  return { excl: roundedExcl, gst, total: money(roundedExcl + gst) }
}

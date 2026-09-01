import { FULL_SCHEDULE, type ScheduleSlot } from '@/data/programGuide'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function formatHourShort(h: number): string {
  if (h === 0 || h === 24) return '12AM'
  if (h === 12) return '12PM'
  return h < 12 ? `${h}AM` : `${h - 12}PM`
}

function weekdayOrder(day: number): number {
  return day === 0 ? 7 : day
}

function formatDayRun(days: number[]): string {
  const ordered = [...days].sort((a, b) => weekdayOrder(a) - weekdayOrder(b))
  if (ordered.length === 1) return DAY_ABBR[ordered[0]]
  const consecutive = ordered.every((d, i) => {
    if (i === 0) return true
    return weekdayOrder(d) === weekdayOrder(ordered[i - 1]) + 1
  })
  if (consecutive) return `${DAY_ABBR[ordered[0]]}–${DAY_ABBR[ordered[ordered.length - 1]]}`
  return ordered.map((d) => DAY_ABBR[d]).join(' & ')
}

function formatHoursFromSlots(slots: ScheduleSlot[]): string | null {
  if (!slots.length) return null

  const groups = new Map<string, number[]>()
  for (const s of slots) {
    const key = `${s.startHour}-${s.endHour}`
    const days = groups.get(key) ?? []
    if (!days.includes(s.day)) days.push(s.day)
    groups.set(key, days)
  }

  const entries = [...groups.entries()].sort((a, b) => {
    const firstA = Math.min(...a[1].map(weekdayOrder))
    const firstB = Math.min(...b[1].map(weekdayOrder))
    if (firstA !== firstB) return firstA - firstB
    return Number(a[0].split('-')[0]) - Number(b[0].split('-')[0])
  })

  return entries
    .map(([key, days]) => {
      const [start, end] = key.split('-').map(Number)
      return `${formatDayRun(days)} ${formatHourShort(start)}–${formatHourShort(end)}`
    })
    .join(' · ')
}

function slotsForShow(showName: string): ScheduleSlot[] {
  const exact = FULL_SCHEDULE.filter((s) => s.name === showName)
  if (exact.length) return exact
  const prefixed = FULL_SCHEDULE.filter(
    (s) => s.name.startsWith(showName) || showName.startsWith(s.name),
  )
  const prefixedNames = new Set(prefixed.map((s) => s.name))
  if (prefixedNames.size === 1) return prefixed
  const words = showName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
  if (!words.length) return []
  const wordHits = FULL_SCHEDULE.filter((s) => {
    const n = s.name.toLowerCase()
    return words.every((w) => n.includes(w))
  })
  const names = new Set(wordHits.map((s) => s.name))
  if (names.size === 1) return wordHits
  return []
}

/**
 * Public hours for a named show, grouped from FULL_SCHEDULE.
 * Do not invent a Mon–Fri block when the guide splits days.
 */
export function formatGuideHours(showName: string): string | null {
  return formatHoursFromSlots(slotsForShow(showName))
}

function hostKeys(name: string): Set<string> {
  const keys = new Set<string>()
  const trimmed = name.trim().toLowerCase()
  keys.add(trimmed)
  const withoutParen = trimmed.replace(/\s*\([^)]*\)/g, '').trim()
  if (withoutParen) keys.add(withoutParen)
  for (const inner of name.matchAll(/\(([^)]+)\)/g)) {
    const key = inner[1].trim().toLowerCase()
    if (key) keys.add(key)
  }
  return keys
}

function hostOverlaps(slotHost: string, queryHost: string): boolean {
  const a = hostKeys(slotHost)
  const b = hostKeys(queryHost)
  for (const key of a) {
    if (b.has(key)) return true
  }
  return false
}

/**
 * Public hours for a named presenter, grouped from FULL_SCHEDULE.
 * Matches "Johnny P (John Painter)" to both dancing and Sunday afternoon slots.
 */
export function formatHostHours(hostName: string): string | null {
  return formatHoursFromSlots(FULL_SCHEDULE.filter((s) => hostOverlaps(s.host, hostName)))
}

/** On-air wall subtitle: dancing hours come from FULL_SCHEDULE, not a Mon–Fri 9AM shorthand. */
export function onAirWallSub(name: string, fallback: string): string {
  if (/johnny p|john painter/i.test(name)) {
    const hours = formatGuideHours('Dancing through the decades')
    if (hours) return `Dancing through the decades · ${hours}`
  }
  return fallback
}

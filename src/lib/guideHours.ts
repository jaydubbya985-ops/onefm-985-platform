import { FULL_SCHEDULE } from '@/data/programGuide'

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

/**
 * Public hours for a named show, grouped from FULL_SCHEDULE.
 * Do not invent a Mon–Fri block when the guide splits days.
 */
export function formatGuideHours(showName: string): string | null {
  const slots = FULL_SCHEDULE.filter((s) => s.name === showName)
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

/** On-air wall subtitle: dancing hours come from FULL_SCHEDULE, not a Mon–Fri 9AM shorthand. */
export function onAirWallSub(name: string, fallback: string): string {
  if (name === 'Johnny P' || name === 'Johnny P (John Painter)') {
    const hours = formatGuideHours('Dancing through the decades')
    if (hours) return `Dancing through the decades · ${hours}`
  }
  return fallback
}

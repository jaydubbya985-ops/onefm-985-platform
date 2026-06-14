/**
 * ONE FM 98.5 — canonical programme data (Jason-confirmed, June 2026).
 * Breakfast hosts rotate Mon–Fri; fm985.com.au is source for interviews/news.
 */

export const BREAKFAST_SHOW = 'ONE FM Breakfast'
export const BREAKFAST_TIME = '6:00am – 9:00am'

/** 0 = Sunday … 6 = Saturday */
export const BREAKFAST_HOSTS: Record<number, string> = {
  1: 'Tim Ahemt',
  2: 'Tim Ahemt',
  3: 'Lillian Stone',
  4: 'Craig Stott',
  5: 'Di Hunter',
}

export function getBreakfastHost(day: number): string {
  return BREAKFAST_HOSTS[day] ?? 'ONE FM'
}

export function getBreakfastScheduleLabel(): string {
  return 'Mon: Tim Ahemt · Tue: Tim Ahemt · Wed: Lillian Stone · Thu: Craig Stott · Fri: Di Hunter'
}

export interface LiveShowInfo {
  name: string
  host: string
  time: string
  category: string
  upNext: string
}

/** On-air now from local clock (weekday grid). */
export function getCurrentLiveShow(now: Date = new Date()): LiveShowInfo {
  const hour = now.getHours()
  const day = now.getDay()

  if (hour >= 6 && hour < 9 && day >= 1 && day <= 5) {
    const host = getBreakfastHost(day)
    return {
      name: BREAKFAST_SHOW,
      host,
      time: '6:00AM — 9:00AM',
      category: 'Breakfast',
      upNext: 'Dancing through the decades',
    }
  }
  if (hour >= 9 && hour < 12 && day >= 1 && day <= 5) {
    return {
      name: 'Dancing through the decades',
      host: 'John Painter',
      time: '9:00AM — 12:00PM',
      category: 'Music',
      upNext: 'The Regional Voice',
    }
  }
  if (hour >= 12 && hour < 15 && day >= 1 && day <= 5) {
    return {
      name: 'The Regional Voice',
      host: 'James Manley',
      time: '12:00PM — 3:00PM',
      category: 'Community',
      upNext: 'Afternoon programming',
    }
  }
  if (hour >= 15 && hour < 18) {
    return {
      name: 'Afternoon on ONE FM',
      host: 'ONE FM',
      time: '3:00PM — 6:00PM',
      category: 'Music',
      upNext: 'Evening programs',
    }
  }
  return {
    name: 'Overnight Mix',
    host: 'Automated',
    time: '12:00AM — 6:00AM',
    category: 'Music',
    upNext: BREAKFAST_SHOW,
  }
}

export const BREAKFAST_ROSTER = [
  { day: 'Monday', host: 'Tim Ahemt' },
  { day: 'Tuesday', host: 'Tim Ahemt' },
  { day: 'Wednesday', host: 'Lillian Stone' },
  { day: 'Thursday', host: 'Craig Stott' },
  { day: 'Friday', host: 'Di Hunter' },
] as const

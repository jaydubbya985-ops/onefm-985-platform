/**
 * Rest-of-today board from FULL_SCHEDULE.
 * Melbourne clock via getCurrentLiveShow / getMelbourneWeekday — not the viewer clock.
 * No coverage stamps, no rate card, no invented slots.
 */
import {
  FULL_SCHEDULE,
  getCurrentLiveShow,
  getMelbourneWeekday,
  type ScheduleSlot,
} from '@/data/programGuide'
import { formatWithPresenter, liveNowFromMetadata } from '@/lib/liveNow'
import type { PlayerMetadata } from '@/lib/playerMetadata'

export const TODAY_ON_AIR_SOURCE =
  'Weekly guide · Australia/Melbourne · fm985.com.au/guide/'

export const LISTENER_INVENTORY_PATHS = ['/listen', '/broadcast'] as const

export function isListenerInventorySurface(pathname: string): boolean {
  const path = pathname.split('?')[0]?.replace(/\/+$/, '') || '/'
  return (LISTENER_INVENTORY_PATHS as readonly string[]).includes(path)
}

export interface TodayOnAirRow {
  name: string
  withLine: string | null
  time: string
  category: string
  onGuideNow: boolean
}

export interface TodayOnAirBoard {
  weekday: string
  current: TodayOnAirRow
  coming: TodayOnAirRow[]
  sourceLabel: string
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12:00AM'
  if (h === 12) return '12:00PM'
  return h < 12 ? `${h}:00AM` : `${h - 12}:00PM`
}

function slotTime(slot: ScheduleSlot): string {
  return `${formatHour(slot.startHour)} — ${formatHour(slot.endHour)}`
}

function melbourneWeekdayLong(now: Date): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    weekday: 'long',
  }).format(now)
}

function scheduleMeta(now: Date): PlayerMetadata {
  const show = getCurrentLiveShow(now)
  return {
    isLive: show.host !== 'Automated',
    source: 'schedule',
    sourceLabel: 'Program schedule',
    program: show.name,
    presenter: show.host,
    programTime: show.time,
    category: show.category,
    upNext: show.upNext,
    nowPlaying: null,
    artist: null,
    title: null,
    updatedAt: now.toISOString(),
  }
}

function rowFromSlot(slot: ScheduleSlot, onGuideNow: boolean): TodayOnAirRow {
  return {
    name: slot.name,
    withLine: formatWithPresenter(slot.host),
    time: slotTime(slot),
    category: slot.category,
    onGuideNow,
  }
}

/** Remaining named shows after the current Melbourne-guide slot. Overnight Mix is not listed. */
export function getTodayOnAir(now: Date = new Date()): TodayOnAirBoard {
  const show = getCurrentLiveShow(now)
  const live = liveNowFromMetadata(scheduleMeta(now), now)
  const day = getMelbourneWeekday(now)

  const coming = FULL_SCHEDULE.filter(
    (slot) =>
      slot.day === day &&
      slot.startHour > show.startHour &&
      slot.name !== 'Overnight Mix',
  )
    .sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour)
    .map((slot) => rowFromSlot(slot, false))

  return {
    weekday: melbourneWeekdayLong(now),
    current: {
      name: live.program,
      withLine: live.withLine,
      time: live.programTime,
      category: show.category,
      onGuideNow: true,
    },
    coming,
    sourceLabel: TODAY_ON_AIR_SOURCE,
  }
}

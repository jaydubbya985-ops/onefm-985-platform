/**
 * Public live-now label. Weekday breakfast host comes from BREAKFAST_ROSTER,
 * not a second handwritten list and not the generic schedule host "ONE FM".
 */
import {
  BREAKFAST_SHOW,
  BREAKFAST_TIME,
  getBreakfastScheduleLabel,
  getCurrentLiveShow,
  getMelbourneWeekday,
  getWeekdayBreakfastHost,
  isBreakfastProgram,
} from '@/data/programGuide'
import type { PlayerMetadata } from '@/lib/playerMetadata'

export interface LiveNowDisplay {
  program: string
  presenter: string
  programTime: string
  breakfastOnAir: boolean
  breakfastLabel: string | null
  isLive: boolean
  /** "with Name" or null when the host is generic / automated / blank. */
  withLine: string | null
  remainingLabel: string
  remainingMinutes: number
  elapsedRatio: number
}

/** Never print "with ONE FM" or "with Automated" — those are schedule fillers. */
export function formatWithPresenter(presenter: string | null | undefined): string | null {
  const name = presenter?.trim() ?? ''
  if (!name || name === 'ONE FM' || name === 'Automated') return null
  return `with ${name}`
}

/**
 * On-air vs overnight from the Melbourne guide — never Date#getHours() / getDay()
 * on the viewer's clock. `playerMetadata.isBroadcastHours` used local Sunday 02:00
 * and treated every hour as "broadcast" (`h >= 6 || h < 24`), so a UTC Sunday
 * morning marked Shepparton as overnight while midday shows were on air.
 */
export function isGuideLive(now: Date = new Date()): boolean {
  return getCurrentLiveShow(now).host !== 'Automated'
}

export function liveNowFromMetadata(meta: PlayerMetadata, now: Date = new Date()): LiveNowDisplay {
  const breakfastHost = getWeekdayBreakfastHost(getMelbourneWeekday(now))
  const breakfastOnAir = Boolean(breakfastHost) && isBreakfastProgram(meta.program)
  const presenter = breakfastOnAir && breakfastHost ? breakfastHost : meta.presenter
  const show = getCurrentLiveShow(now)
  const slotMinutes = show.slotMinutes || 1
  return {
    program: breakfastOnAir ? BREAKFAST_SHOW : meta.program,
    presenter,
    programTime: breakfastOnAir ? BREAKFAST_TIME : meta.programTime,
    breakfastOnAir,
    breakfastLabel: breakfastOnAir ? getBreakfastScheduleLabel() : null,
    isLive: isGuideLive(now),
    withLine: formatWithPresenter(presenter),
    remainingLabel: show.remainingLabel,
    remainingMinutes: show.remainingMinutes,
    elapsedRatio: Math.min(1, Math.max(0, show.elapsedMinutes / slotMinutes)),
  }
}

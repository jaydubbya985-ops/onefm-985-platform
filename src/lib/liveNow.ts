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

/** Pulse the mini-player live dot only when schedule/stream metadata is live. */
export function miniPlayerLiveDot(isLive: boolean): { pulse: boolean; tone: 'live' | 'schedule' } {
  return isLive ? { pulse: true, tone: 'live' } : { pulse: false, tone: 'schedule' }
}

/** Never print "with ONE FM" or "with Automated" — those are schedule fillers. */
export function formatWithPresenter(presenter: string | null | undefined): string | null {
  const name = presenter?.trim() ?? ''
  if (!name || name === 'ONE FM' || name === 'Automated') return null
  return `with ${name}`
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
    isLive: meta.isLive,
    withLine: formatWithPresenter(presenter),
    remainingLabel: show.remainingLabel,
    remainingMinutes: show.remainingMinutes,
    elapsedRatio: Math.min(1, Math.max(0, show.elapsedMinutes / slotMinutes)),
  }
}

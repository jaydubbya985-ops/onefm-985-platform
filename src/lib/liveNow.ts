/**
 * Public live-now label. Weekday breakfast host comes from BREAKFAST_ROSTER,
 * not a second handwritten list and not the generic schedule host "ONE FM".
 */
import {
  BREAKFAST_SHOW,
  BREAKFAST_TIME,
  getBreakfastScheduleLabel,
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
}

export function liveNowFromMetadata(meta: PlayerMetadata, now: Date = new Date()): LiveNowDisplay {
  const breakfastHost = getWeekdayBreakfastHost(now.getDay())
  const breakfastOnAir = Boolean(breakfastHost) && isBreakfastProgram(meta.program)
  return {
    program: breakfastOnAir ? BREAKFAST_SHOW : meta.program,
    presenter: breakfastOnAir && breakfastHost ? breakfastHost : meta.presenter,
    programTime: breakfastOnAir ? BREAKFAST_TIME : meta.programTime,
    breakfastOnAir,
    breakfastLabel: breakfastOnAir ? getBreakfastScheduleLabel() : null,
    isLive: meta.isLive,
  }
}

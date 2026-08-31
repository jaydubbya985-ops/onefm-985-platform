import { stationStats } from '@/data/pricing'

/** Single source for coverage / listenership strings. Never hardcode 25 / 100 / 39,375 / 189,680. */

export function formatTowns(): string {
  return `${stationStats.totalTowns} towns`
}

export function formatRadius(): string {
  return `${stationStats.broadcastRadiusKm}km`
}

export function formatCoverageShort(): string {
  return `${stationStats.totalTowns} towns · ${stationStats.broadcastRadiusKm}km radius`
}

export function formatWeeklyListeners(): string {
  return `Est. ${stationStats.weeklyListeners.toLocaleString('en-AU')} weekly listeners`
}

export function formatWeeklyListenersPlain(): string {
  return stationStats.weeklyListeners.toLocaleString('en-AU')
}

export function formatBroadcastPopulation(): string {
  return stationStats.broadcastPopulation.toLocaleString('en-AU')
}

export function formatCoverageLong(): string {
  return `${formatWeeklyListeners()} across ${formatTowns()} within a ${stationStats.broadcastRadiusKm}km broadcast area (${formatBroadcastPopulation()} people — ABS 2021 via townData)`
}

import { stationStats } from '@/data/pricing'

/** Single source for coverage / listenership strings. Never hardcode 25 / 100 / 39,375 / 189,680. */

export function townsCount(): number {
  return stationStats.totalTowns
}

export function radiusKmCount(): number {
  return stationStats.broadcastRadiusKm
}

export function weeklyListenersCount(): number {
  return stationStats.weeklyListeners
}

export function broadcastPopulationCount(): number {
  return stationStats.broadcastPopulation
}

export function formatTowns(): string {
  return `${townsCount()} towns`
}

export function formatRadius(): string {
  return `${radiusKmCount()}km`
}

export function formatCoverageShort(): string {
  return `${formatTowns()} · ${formatRadius()} radius`
}

export function formatWeeklyListeners(): string {
  return `Est. ${formatWeeklyListenersPlain()} weekly listeners`
}

export function formatWeeklyListenersPlain(): string {
  return weeklyListenersCount().toLocaleString('en-AU')
}

export function formatBroadcastPopulation(): string {
  return broadcastPopulationCount().toLocaleString('en-AU')
}

export function formatCoverageLong(): string {
  return `${formatWeeklyListeners()} across ${formatTowns()} within a ${formatRadius()} broadcast area (${formatBroadcastPopulation()} people — ABS 2021 via townData)`
}

import { BRAND } from '@/lib/brand'
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

/** Crawler OG / twitter default. Vite injects this into index.html at build. */
export function formatOgDescription(): string {
  return `Community radio from Shepparton, VIC. ${formatTowns()}. ${formatBroadcastPopulation()} people in the broadcast area.`
}

/** Browser tab / OG title. Slogan is BRAND.tagline (Live and Local), not leftover Voice of. */
export function formatSeoTitle(): string {
  return `${BRAND.fullName} — ${BRAND.tagline}`
}

/** Fallback meta description when a page does not pass its own. */
export function formatSeoDefault(): string {
  return `${formatSeoTitle()}. Volunteer-run community radio from Shepparton, Victoria. ${formatCoverageShort()} (ABS 2021 via townData).`
}

/** Numeric strings for stats strips and data tables (en-AU). */
export function weeklyListenersValue(): string {
  return stationStats.weeklyListeners.toLocaleString('en-AU')
}

export function broadcastPopulationValue(): string {
  return stationStats.broadcastPopulation.toLocaleString('en-AU')
}

export function townCountValue(): string {
  return String(stationStats.totalTowns)
}

export function yearsBroadcastingValue(): string {
  return String(stationStats.yearsBroadcasting)
}

export function formatRadiusKm(): string {
  return `${stationStats.broadcastRadiusKm} km`
}

export function tickerWeeklyListenersItem(): string {
  return `● Est. ${weeklyListenersValue()} weekly listeners`
}

export function formatTownsGvl(): string {
  return `${stationStats.totalTowns} towns across the Goulburn Valley`
}

export function formatFmRadiusDetail(): string {
  return `98.5 FM · ${stationStats.broadcastRadiusKm} km radius`
}

export function formatCoverageRegion(): string {
  return `Goulburn Murray region — ${stationStats.totalTowns} towns`
}

export function coverageStatsStrip(): Array<{ n: string; t: string; red?: boolean }> {
  return [
    { n: weeklyListenersValue(), t: 'Est. weekly listeners', red: true },
    { n: broadcastPopulationValue(), t: 'People in broadcast area (townData 2026 est.)' },
    { n: townCountValue(), t: 'Towns across the Valley' },
  ]
}

export function reachFactsRows(): Array<{ label: string; value: string }> {
  return [
    { label: 'Est. weekly listeners', value: weeklyListenersValue() },
    { label: 'Towns in broadcast area', value: townCountValue() },
    { label: 'Broadcast radius', value: formatRadiusKm() },
    { label: 'Area population (2026 est.)', value: broadcastPopulationValue() },
  ]
}

export function audienceStatsRows(): Array<{ label: string; value: string; note: string }> {
  return [
    { label: 'Est. weekly listeners', value: weeklyListenersValue(), note: 'Regional reach estimate' },
    {
      label: 'Population in broadcast area',
      value: broadcastPopulationValue(),
      note: `2026 est. · ${townCountValue()} towns`,
    },
    { label: 'Broadcast radius', value: formatRadiusKm(), note: 'From Shepparton' },
    { label: 'Years on air', value: yearsBroadcastingValue(), note: 'Licensed since 1989' },
  ]
}

/** Raw numbers for animated counters — still sourced via stationStats. */
export const coverageNumbers = {
  weeklyListeners: stationStats.weeklyListeners,
  totalTowns: stationStats.totalTowns,
  broadcastRadiusKm: stationStats.broadcastRadiusKm,
  broadcastPopulation: stationStats.broadcastPopulation,
  yearsBroadcasting: stationStats.yearsBroadcasting,
} as const

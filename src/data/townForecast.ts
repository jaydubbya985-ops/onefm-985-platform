/**
 * Census forecasts for proposals.
 *
 * population2021 = ABS 2021 usual resident counts already stored in townData.ts
 * growthRate     = 2021→2026 period % already stored in townData.ts (not a new ABS release)
 * forecast2026   = pop2021 × (1 + growthRate/100)
 *
 * Weekly listeners stay 39,375 (source: townData / ABS 2021 via stationStats).
 * Do not present national stream totals as ONE FM reach.
 */
import { towns, broadcastArea, type Town } from '@/data/townData'

export const CENSUS_SOURCE = 'ABS 2021 Census usual resident population via townData.ts'
export const GROWTH_SOURCE =
  '2021–2026 period growth already stored in townData.ts — applied as pop2021 × (1 + rate/100)'
export const LISTENER_SOURCE = 'ABS 2021 via townData.ts / stationStats — 39,375 weekly listeners, 25 towns, 100 km'

export function forecast2026FromGrowth(town: Town): number {
  return Math.round(town.population2021 * (1 + town.growthRate / 100))
}

export function fastestGrowingTowns(limit = 6): Town[] {
  return [...towns].sort((a, b) => b.growthRate - a.growthRate).slice(0, limit)
}

export function largestTowns(limit = 8): Town[] {
  return [...towns].sort((a, b) => b.population2021 - a.population2021).slice(0, limit)
}

export function townsWithForecast(list: Town[]) {
  return list.map((town) => ({
    name: town.name,
    population2021: town.population2021,
    growthRate: town.growthRate,
    forecast2026: forecast2026FromGrowth(town),
  }))
}

export { towns, broadcastArea }

/**
 * Time-of-day chrome follows FULL_SCHEDULE — not leftover clock buckets.
 *
 * Leftover buckets (removed): breakfast 5–9 (includes overnight 5–6, and
 * Saturday 6–9 which is Songs of the Spirit), midday 12–3, drive 18–22
 * (drive is not a programGuide slot).
 */
import { getCurrentLiveShow } from '@/data/programGuide'

export type GuideDaypart = 'breakfast' | 'night' | 'default'

export function guideDaypart(now: Date = new Date()): GuideDaypart {
  const show = getCurrentLiveShow(now)
  if (show.category === 'Breakfast') return 'breakfast'
  if (show.name === 'Overnight Mix' || show.host === 'Automated') return 'night'
  return 'default'
}

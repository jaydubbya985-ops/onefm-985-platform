/**
 * The "On Air This Week" wall shown on Home and Listen.
 *
 * Rows are derived from `programGuide.ts` so the two pages can never drift
 * apart or from the guide at fm985.com.au. Imagery goes through
 * `presenterImage()`, which refuses to caption an unconfirmed face with a name.
 */
import { BREAKFAST_ROSTER, FULL_SCHEDULE } from '@/data/programGuide'
import { presenterImage } from '@/lib/presenterAssets'

export interface OnAirWallRow {
  name: string
  sub: string
  img: string
  imgAlt: string
}

/**
 * Guide names carry the legal name in brackets after the on-air name
 * ("The Big G (Craig Stott)"). The poster row needs the short on-air name; the
 * caption underneath keeps the full attribution.
 */
function splitAirName(host: string): { air: string; given?: string } {
  const match = /^(.+?)\s*\((.+)\)$/.exec(host)
  return match ? { air: match[1], given: match[2] } : { air: host }
}

/** Weekday breakfast, in roster order, one row per host. */
function breakfastRows(): OnAirWallRow[] {
  const byHost = new Map<string, string[]>()
  for (const slot of BREAKFAST_ROSTER) {
    const days = byHost.get(slot.host) ?? []
    days.push(slot.day)
    byHost.set(slot.host, days)
  }

  return [...byHost].map(([host, days]) => {
    const { air, given } = splitAirName(host)
    const photo = presenterImage(host)
    const when = `${days.map((d) => d.slice(0, 3)).join(' & ')} 6AM`
    return {
      name: air,
      sub: given ? `ONE FM Breakfast · ${when} · ${given}` : `ONE FM Breakfast · ${when}`,
      img: photo.src,
      imgAlt: photo.alt,
    }
  })
}

/** Weekday shows outside breakfast, so the wall is not breakfast-only. */
const DAYTIME_FEATURE_HOSTS = ['Johnny P (John Painter)', 'Di Hunter'] as const

function daytimeRows(): OnAirWallRow[] {
  return DAYTIME_FEATURE_HOSTS.flatMap((host) => {
    const slot = FULL_SCHEDULE.find((s) => s.host === host)
    if (!slot) return []
    const { air, given } = splitAirName(host)
    const photo = presenterImage(host)
    return [{
      name: air,
      sub: given ? `${slot.name} · ${given}` : slot.name,
      img: photo.src,
      imgAlt: photo.alt,
    }]
  })
}

export const ON_AIR_WALL: OnAirWallRow[] = [...breakfastRows(), ...daytimeRows()]

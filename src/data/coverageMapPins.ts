import { towns } from '@/data/townData'
import { formatGuideHours } from '@/lib/guideHours'

/** GVL Match of the Day hours from FULL_SCHEDULE — never a bare “Saturday”. */
const GVL_MATCH_HOURS = formatGuideHours('GVL Match of the Day') ?? 'Saturday'

export type CoveragePinType = 'station' | 'football' | 'sponsor'

export interface CoveragePin {
  id: string
  type: CoveragePinType
  name: string
  lat: number
  lng: number
  town: string
  blurb: string
  link?: string
}

/** Offset pin slightly from town centroid so markers don't stack. */
function atTown(townName: string, dLat = 0, dLng = 0): { lat: number; lng: number } | null {
  const town = towns.find((t) => t.name === townName)
  if (!town) return null
  return { lat: town.lat + dLat, lng: town.lng + dLng }
}

/**
 * Map pins for advertiser-facing coverage view.
 * Football clubs: GVL senior clubs anchored to their home town.
 * Sponsors: real local partners from ops invoice data (town-centroid placement).
 */
export const coveragePins: CoveragePin[] = [
  {
    id: 'onefm-studio',
    type: 'station',
    name: 'ONE FM 98.5',
    lat: -36.3612,
    lng: 145.416,
    town: 'Shepparton',
    blurb: 'Broadcast studio — 47 Parkside Drive. Your signal starts here across the Goulburn Valley.',
    link: '/listen',
  },
  // GVL football & netball clubs (town-anchored)
  ...([
    ['gvl-shepp-swans', 'Shepparton Swans', 'Shepparton', 0.014, -0.01, `GVL senior club — GVL Match of the Day · ${GVL_MATCH_HOURS}`],
    ['gvl-mooroopna', 'Mooroopna', 'Mooroopna', 0, 0.012, 'GVL club — twin-city rivalry and loyal local crowd'],
    ['gvl-tatura', 'Tatura', 'Tatura', -0.01, 0.008, 'GVL club — heart of the orchard district'],
    ['gvl-kyabram', 'Kyabram', 'Kyabram', 0.012, 0, 'GVL club — strong community footy town'],
    ['gvl-echuca', 'Echuca', 'Echuca', -0.012, -0.01, 'GVL club — Murray River border audience'],
    ['gvl-benalla', 'Benalla', 'Benalla', 0, -0.012, 'GVL club — gateway to the high country'],
    ['gvl-seymour', 'Seymour', 'Seymour', 0.01, 0.01, 'GVL club — southern reach of our footprint'],
    ['gvl-cobram', 'Cobram', 'Cobram', -0.008, 0.01, 'GVL club — irrigated Murray communities'],
    ['gvl-numurkah', 'Numurkah', 'Numurkah', 0.01, -0.008, `GVL club — GVL Match of the Day · ${GVL_MATCH_HOURS}`],
    ['gvl-rochester', 'Rochester', 'Rochester', 0, 0.01, 'GVL club — Campaspe Shire heartland'],
    ['gvl-nathalia', 'Nathalia', 'Nathalia', -0.01, 0, 'GVL club — northern Murray irrigation belt'],
    ['gvl-euroa', 'Euroa', 'Euroa', 0.008, -0.01, 'GVL club — Strathbogie approaches'],
  ] as const).flatMap(([id, name, town, dLat, dLng, blurb]) => {
    const pos = atTown(town, dLat, dLng)
    if (!pos) return []
    return [{
      id,
      type: 'football' as const,
      name,
      lat: pos.lat,
      lng: pos.lng,
      town,
      blurb,
      link: '/football',
    }]
  }),
  // Invoice-book names — town-centroid pins, not street-precise.
  // Do not invent rank, tenure, measured peak listening, or an unsourced partnership title.
  ...([
    ['sp-gvl', 'Goulburn Valley Football League', 'Shepparton', 0.018, 0.014, `GVL Match of the Day · ${GVL_MATCH_HOURS} on 98.5 FM`, '/football'],
    ['sp-peppermill', 'Peppermill Inn', 'Mooroopna', -0.012, -0.01, 'Hospitality sponsor — pin is the Mooroopna town centroid, not a street address', '/football'],
    ['sp-foott', 'FOOTT Waste Solutions', 'Shepparton', -0.016, 0.012, 'Local business sponsor — pin is the Shepparton town centroid, not a street address', '/sponsorship'],
    ['sp-sam', 'SAM — Shepparton Art Museum', 'Shepparton', 0.02, -0.014, 'Arts & culture sponsor — pin is the Shepparton town centroid, not a street address', '/sponsorship'],
    ['sp-mcrae', 'McRae Demolitions', 'Shepparton', -0.02, -0.01, 'Local business sponsor — pin is the Shepparton town centroid, not a street address', '/sponsorship'],
    ['sp-burkes', "Burkes Bakery", 'Shepparton', 0.015, 0.016, 'Local business sponsor — pin is the Shepparton town centroid, not a street address', '/sponsorship'],
  ] as const).flatMap(([id, name, town, dLat, dLng, blurb, link]) => {
    const pos = atTown(town, dLat, dLng)
    if (!pos) return []
    return [{
      id,
      type: 'sponsor' as const,
      name,
      lat: pos.lat,
      lng: pos.lng,
      town,
      blurb,
      link,
    }]
  }),
]

export const coveragePinCounts = {
  football: coveragePins.filter((p) => p.type === 'football').length,
  sponsor: coveragePins.filter((p) => p.type === 'sponsor').length,
}

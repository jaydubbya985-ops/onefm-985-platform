/**
 * Sourced copy for designed sponsorship proposals.
 * Station-reported claims stay labelled. Never invent listener millions or logos.
 */
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { FULL_SCHEDULE, getBreakfastScheduleLabel } from '@/data/programGuide'
import { EMERGENCY_BROADCAST_NARRATIVE } from '@/data/stationHistory'
import { BRAND } from '@/lib/brand'
import { stationStats } from '@/data/pricing'

export function breakfastRosterLabel(): string {
  return getBreakfastScheduleLabel()
}

/** Source: programGuide.ts / fm985.com.au/guide/ June 2026 */
export const BREAKFAST_DAYS = [
  { day: 'Mon', host: 'Tim Ahemt' },
  { day: 'Tue', host: 'Tim Ahemt' },
  { day: 'Wed', host: 'The Big G' },
  { day: 'Thu', host: 'Ralph Whitehead' },
  { day: 'Fri', host: 'Josh Revens' },
] as const

/** GVL 2026 finals window — public match reports, not invented. */
export const GVL_FINALS_2026 = {
  homeAndAwayLast: '22 Aug 2026',
  firstFinalsWeekend: '29–30 Aug 2026',
  preliminaryFinal: 'Sun 13 Sep 2026',
  grandFinal: 'Sun 20 Sep 2026',
  source: 'Shepparton News / Benalla Ensign GVL 2026 fixture and finals reports (Aug 2026)',
} as const

export const NIRS_AFL = {
  friday: 'NIRS AFL Friday Night Footy · Fri 7–10pm',
  sunday: 'NIRS Sunday Afternoon AFL — Match of the Day · Sun 1–3pm',
  aflwNote:
    'AFLW is not a standing weekly slot on the June 2026 program guide. When the NIRS AFL card includes AFLW, we call that match — we do not invent a weekly AFLW show.',
  source: 'fm985.com.au/guide/ via programGuide.ts',
} as const

/** Super Saturday inner shows — copied from ops schedule.ts scraped lineup. */
export const SUPER_SATURDAY = {
  presenters: 'Craig Stott & John Painter',
  lineup: [
    'Square Gaiters',
    'Hole In One',
    'At the Net',
    'Cricket Shepparton Show',
    'The Stats Man',
    'KDL Show',
  ],
  source: 'src/components/ops/data/schedule.ts Saturday sports lineup (scraped station data)',
} as const

export const COUNTRY_AND_GOLD = {
  country: FULL_SCHEDULE.filter((s) => s.category === 'Country').map((s) => s.name),
  decades: 'Dancing through the decades — Johnny P (John Painter)',
  windingBack: 'Winding Back — Ken & Jill Gaffney',
  source: 'fm985.com.au/guide/ via programGuide.ts',
} as const

export const MULTICULTURAL = {
  shows: [...new Set(FULL_SCHEDULE.filter((s) => s.category === 'Multicultural').map((s) => s.name))],
  source: 'fm985.com.au/guide/ via programGuide.ts',
} as const

export const CIVIC = {
  emergencyLead: EMERGENCY_BROADCAST_NARRATIVE[0],
  emergencyFlood: EMERGENCY_BROADCAST_NARRATIVE[1],
  csa: {
    text: 'Community service announcements run across the week for local initiatives.',
    countLabel: 'Data pending',
    jayClaim:
      'Jay reports more than 100 local initiatives a year. That count is station-reported until a CSA log is pasted.',
    source: 'Station brief 26 Aug 2026 — not independently audited',
  },
  roadSafety:
    'Road safety messaging and local council information sit in the civic broadcast role. No fabricated campaign reach.',
  source: 'stationHistory.ts emergency narrative (approved Jay 2026-07-06); CSA count pending',
} as const

export const DIGITAL = {
  facebook: FACEBOOK_PAGE_URL,
  soundcloud: SOUNDCLOUD_PROFILE_URL,
  note: 'Facebook and SoundCloud are live station channels. Follower counts stay unpublished until the page exports them.',
} as const

export const REACH = {
  weeklyListeners: stationStats.weeklyListeners,
  towns: stationStats.totalTowns,
  radiusKm: stationStats.broadcastRadiusKm,
  org: BRAND.org,
  source: 'ABS 2021 via townData.ts / stationStats',
} as const

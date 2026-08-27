// DEMO DATA — campaign/spot seeds are synthetic. Breakfast hosts must match programGuide.ts.
// ---------------------------------------------------------------------------
// Broadcast schedule data — dayparts, programme guide, campaigns & ad spots
//
// Dayparts and day-name constants are verbatim from the deployed OpsPortal
// bundle (deployed-reference/assets/OpsPortal-dIeH6Okr.js, BroadcastSchedule
// region). The programme guide is cross-referenced between the bundle and
// src/data/oneFmScrapedData.json (the station's real published grid).
// Campaign/spot seeds exist because the deployed build initialised its
// localStorage stores empty — these provide the populated state the deployed
// UI was designed around, aligned with the sponsor records in data/sponsors.ts.
// ---------------------------------------------------------------------------

export type DaypartCode = 'EM' | 'B' | 'M' | 'L' | 'D' | 'LN'

export interface DaypartInfo {
  code: DaypartCode
  label: string
  timeRange: string
  description: string
}

/** Sales dayparts (verbatim from bundle). */
export const DAYPARTS: DaypartInfo[] = [
  { code: 'EM', label: 'Early Morning', timeRange: '5:00 AM – 7:00 AM', description: 'Drive time, breakfast prep' },
  { code: 'B', label: 'Breakfast', timeRange: '7:00 AM – 10:00 AM', description: 'Peak morning, The ONE FM Breakfast Show' },
  { code: 'M', label: 'Morning', timeRange: '10:00 AM – 1:00 PM', description: 'Mid-morning programming' },
  { code: 'L', label: 'Lunch', timeRange: '1:00 PM – 4:00 PM', description: 'Afternoon programming' },
  { code: 'D', label: 'Drive', timeRange: '4:00 PM – 8:00 PM', description: 'Peak afternoon, drive home' },
  { code: 'LN', label: 'Late Night', timeRange: '8:00 PM – 12:00 AM', description: 'Evening programming, Planet of Sound' },
]

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
export const DAY_NAMES_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

// ------------------------------ Programme guide ----------------------------

export type ProgrammeCategory =
  | 'breakfast'
  | 'music'
  | 'community'
  | 'multicultural'
  | 'country'
  | 'sport'
  | 'automation'

export const PROGRAMME_CATEGORY_META: Record<ProgrammeCategory, { label: string; color: string }> = {
  breakfast: { label: 'Breakfast', color: '#D4A853' },
  music: { label: 'Music', color: '#5B8DB8' },
  community: { label: 'Community', color: '#7CBA7C' },
  multicultural: { label: 'Multicultural', color: '#C97FB8' },
  country: { label: 'Country', color: '#B8860B' },
  sport: { label: 'Sport', color: '#F59E0B' },
  automation: { label: 'Automation', color: '#64748B' },
}

export interface ProgrammeEntry {
  id: string
  /** 0 = Sunday … 6 = Saturday */
  day: number
  time: string
  show: string
  presenter: string
  category: ProgrammeCategory
  /** Dayparts this show occupies, for sponsorship-slot mapping. */
  dayparts: DaypartCode[]
}

const WEEKDAYS = [1, 2, 3, 4, 5]

function weekdayStrip(
  idPrefix: string,
  time: string,
  show: string,
  presenter: string,
  category: ProgrammeCategory,
  dayparts: DaypartCode[],
): ProgrammeEntry[] {
  return WEEKDAYS.map((day) => ({
    id: `${idPrefix}-${day}`,
    day,
    time,
    show,
    presenter,
    category,
    dayparts,
  }))
}

/**
 * Real ONE FM 98.5 programme grid, cross-referenced between the deployed
 * bundle and oneFmScrapedData.json. Note: the scraped presenter roster lists
 * Rowan Farren-Parnell for The Regional Voice; the deployed site credits
 * James Manley — the deployed credit is used here for fidelity.
 */
export const PROGRAMME_GUIDE: ProgrammeEntry[] = [
  // Daily overnight automation
  ...[0, 1, 2, 3, 4, 5, 6].map<ProgrammeEntry>((day) => ({
    id: `overnight-${day}`,
    day,
    time: '12:00am – 6:00am',
    show: 'Overnight Mix',
    presenter: 'Automated',
    category: 'automation',
    dayparts: ['EM'],
  })),
  // Weekday breakfast — source: src/data/programGuide.ts BREAKFAST_ROSTER
  { id: 'breaky-1', day: 1, time: '6:00am – 9:00am', show: 'ONE FM Breakfast', presenter: 'Tim Ahemt', category: 'breakfast', dayparts: ['EM', 'B'] },
  { id: 'breaky-2', day: 2, time: '6:00am – 9:00am', show: 'ONE FM Breakfast', presenter: 'Tim Ahemt', category: 'breakfast', dayparts: ['EM', 'B'] },
  { id: 'breaky-3', day: 3, time: '6:00am – 9:00am', show: 'ONE FM Breakfast', presenter: 'The Big G (Craig Stott)', category: 'breakfast', dayparts: ['EM', 'B'] },
  { id: 'breaky-4', day: 4, time: '6:00am – 9:00am', show: 'ONE FM Breakfast', presenter: 'Ralph Whitehead', category: 'breakfast', dayparts: ['EM', 'B'] },
  { id: 'breaky-5', day: 5, time: '6:00am – 9:00am', show: 'ONE FM Breakfast', presenter: 'Josh Revens', category: 'breakfast', dayparts: ['EM', 'B'] },
  ...weekdayStrip('decades', '9:00am – 12:00pm', 'Dancing through the decades', 'Johnny P', 'music', ['B', 'M']),
  ...weekdayStrip('regional-voice', '12:00pm – 3:00pm', 'The Regional Voice', 'James Manley', 'community', ['M', 'L']),
  // Specialty evening programmes
  { id: 'africonnect-mon', day: 1, time: '9:00pm – 10:00pm', show: 'Africonnect', presenter: 'Fikiri (Swahili)', category: 'multicultural', dayparts: ['LN'] },
  { id: 'punjabi-mon', day: 1, time: '11:00pm – 12:00am', show: 'Punjabi Music Program', presenter: 'Rai, Aanchal or Sahil', category: 'multicultural', dayparts: ['LN'] },
  { id: 'samoan-wed', day: 3, time: '9:00pm – 10:00pm', show: 'Samoan Program', presenter: 'MK', category: 'multicultural', dayparts: ['LN'] },
  { id: 'filipino-wed', day: 3, time: '10:00pm – 11:00pm', show: 'Filipino Music Program', presenter: 'Edith', category: 'multicultural', dayparts: ['LN'] },
  { id: 'planet-thu', day: 4, time: '11:00pm – 12:00am', show: 'Planet of Sound', presenter: 'Carlos Rock', category: 'music', dayparts: ['LN'] },
  { id: 'country-fri', day: 5, time: '8:00pm – 9:00pm', show: 'Good Evening Country', presenter: 'Timmy Ahmet', category: 'country', dayparts: ['LN'] },
  { id: 'planet-fri', day: 5, time: '11:00pm – 12:00am', show: 'Planet of Sound', presenter: 'Carlos Rock', category: 'music', dayparts: ['LN'] },
  // Saturday sport block
  { id: 'super-saturday', day: 6, time: 'Saturday daytime', show: 'Super Saturday Sports Show', presenter: 'Craig Stott & John Painter', category: 'sport', dayparts: ['M', 'L', 'D'] },
]

export interface SportsProgramme {
  name: string
  description: string
}

/** Saturday sports lineup inside the Super Saturday block (from scraped data). */
export const SATURDAY_SPORTS_LINEUP: SportsProgramme[] = [
  { name: 'Square Gaiters', description: 'Harness racing show covering the Goulburn Valley racing scene.' },
  { name: 'Hole In One', description: 'Golf show covering local golf events and news.' },
  { name: 'At the Net', description: 'Tennis show covering local tennis competitions.' },
  { name: 'Cricket Shepparton Show', description: 'Shepparton cricket coverage during cricket season.' },
  { name: 'The Stats Man', description: 'GVL Football & Netball season previews and round-by-round analysis.' },
  { name: 'KDL Show', description: 'Local sports coverage.' },
]

// --------------------------- Campaigns & ad spots ---------------------------

export type CampaignStatus = 'active' | 'completed' | 'cancelled'

export interface ScheduleCampaign {
  id: string
  sponsorId: string
  sponsorName: string
  name: string
  color: string
  startDate: string
  endDate: string
  /** Total spots contracted for the campaign. */
  totalSpots: number
  /** Spots already aired across the whole contract (not just the seed window). */
  spotsDelivered: number
  status: CampaignStatus
}

export interface ScheduleSponsor {
  id: string
  name: string
}

export type SpotStatus = 'scheduled' | 'delivered' | 'cancelled'

export interface AdSpot {
  id: string
  campaignId: string
  campaignName: string
  sponsorId: string
  sponsorName: string
  /** ISO date (yyyy-mm-dd) of the broadcast day. */
  date: string
  /** 0 = Sunday … 6 = Saturday (redundant with date; kept for grid lookups). */
  dayOfWeek: number
  daypart: DaypartCode
  /** Spot length in seconds. */
  duration: number
  status: SpotStatus
  notes?: string
}

/** Campaigns aligned with the sponsor/contract records in data/sponsors.ts. */
export const SEED_CAMPAIGNS: ScheduleCampaign[] = [
  { id: 'cam-001', sponsorId: 'sp-001', sponsorName: 'Peppermill Inn', name: 'GVL 2026 MAJOR', color: '#D4A853', startDate: '2026-03-01', endDate: '2026-09-30', totalSpots: 72, spotsDelivered: 34, status: 'active' },
  { id: 'cam-002', sponsorId: 'sp-002', sponsorName: 'Aussie Ag Supplies Pty Ltd', name: 'Parts & Wrecking (PDL)', color: '#5B8DB8', startDate: '2025-09-24', endDate: '2026-09-24', totalSpots: 104, spotsDelivered: 74, status: 'active' },
  { id: 'cam-003', sponsorId: 'sp-003', sponsorName: 'Merritt Funeral Services', name: 'LT Image', color: '#7CBA7C', startDate: '2025-09-24', endDate: '2026-09-24', totalSpots: 52, spotsDelivered: 37, status: 'active' },
  { id: 'cam-004', sponsorId: 'sp-004', sponsorName: 'Gagliardi Scott Real Estate', name: 'Spring Property Push', color: '#C97FB8', startDate: '2026-04-01', endDate: '2026-10-03', totalSpots: 60, spotsDelivered: 18, status: 'active' },
  { id: 'cam-005', sponsorId: 'sp-005', sponsorName: 'Goulburn Valley Football League', name: 'GVL Broadcast 2026', color: '#F59E0B', startDate: '2026-04-04', endDate: '2026-09-26', totalSpots: 48, spotsDelivered: 15, status: 'active' },
  { id: 'cam-006', sponsorId: 'sp-006', sponsorName: 'Shepparton Harness Racing Club', name: 'Gold Cup Carnival', color: '#EF4444', startDate: '2026-05-01', endDate: '2026-07-31', totalSpots: 36, spotsDelivered: 9, status: 'active' },
]

/** Sponsor pick-list for the booking and auto-schedule dialogs. */
export const SEED_SPONSORS: ScheduleSponsor[] = SEED_CAMPAIGNS.map((c) => ({
  id: c.sponsorId,
  name: c.sponsorName,
}))

interface WeeklyPattern {
  campaignId: string
  /** Recurring weekly slots: [dayOfWeek, daypart, durationSeconds] */
  slots: Array<[number, DaypartCode, number]>
}

/**
 * Recurring weekly slot allocations per campaign. Sport-adjacent sponsors sit
 * in the Saturday sport block; retail sits in Breakfast/Drive; image
 * campaigns sit in Morning/Lunch — mirroring how the deployed grid was used.
 */
const WEEKLY_PATTERNS: WeeklyPattern[] = [
  { campaignId: 'cam-001', slots: [[1, 'B', 30], [3, 'D', 30], [5, 'B', 30], [6, 'L', 30]] },
  { campaignId: 'cam-002', slots: [[1, 'EM', 30], [2, 'D', 30], [4, 'EM', 30], [5, 'D', 30]] },
  { campaignId: 'cam-003', slots: [[2, 'M', 30], [4, 'L', 30]] },
  { campaignId: 'cam-004', slots: [[1, 'D', 15], [3, 'B', 15], [6, 'M', 30]] },
  { campaignId: 'cam-005', slots: [[5, 'D', 60], [6, 'M', 60], [6, 'D', 30]] },
  { campaignId: 'cam-006', slots: [[4, 'D', 30], [6, 'L', 30]] },
]

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Deterministically generates ~9 weeks of spots around the current week from
 * the recurring weekly patterns, clipped to each campaign's date range. Spots
 * before today are marked delivered (with an occasional cancelled make-good).
 */
export function buildSeedSpots(today: Date = new Date()): AdSpot[] {
  const campaignById = new Map(SEED_CAMPAIGNS.map((c) => [c.id, c]))
  const todayIso = toIso(today)

  // Start of week (Sunday), 4 weeks back; generate 9 weeks forward.
  const windowStart = new Date(today)
  windowStart.setDate(windowStart.getDate() - windowStart.getDay() - 28)

  const spots: AdSpot[] = []
  let serial = 0

  for (let week = 0; week < 9; week++) {
    for (const pattern of WEEKLY_PATTERNS) {
      const campaign = campaignById.get(pattern.campaignId)
      if (!campaign) continue
      for (const [dayOfWeek, daypart, duration] of pattern.slots) {
        const date = new Date(windowStart)
        date.setDate(date.getDate() + week * 7 + dayOfWeek)
        const iso = toIso(date)
        if (iso < campaign.startDate || iso > campaign.endDate) continue
        serial += 1
        const past = iso < todayIso
        // Deterministic ~6% cancellation rate for past spots (every 17th spot).
        const cancelled = past && serial % 17 === 0
        spots.push({
          id: `spot-${String(serial).padStart(4, '0')}`,
          campaignId: campaign.id,
          campaignName: campaign.name,
          sponsorId: campaign.sponsorId,
          sponsorName: campaign.sponsorName,
          date: iso,
          dayOfWeek,
          daypart,
          duration,
          status: cancelled ? 'cancelled' : past ? 'delivered' : 'scheduled',
          notes: cancelled ? 'Pulled in log reconciliation — make-good required' : undefined,
        })
      }
    }
  }

  return spots
}

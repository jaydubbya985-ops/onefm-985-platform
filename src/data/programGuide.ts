/**
 * ONE FM 98.5 — canonical programme data.
 * Source: fm985.com.au/guide/ (scraped June 2026 via WP REST API).
 * Day index: 0=Sunday, 1=Monday … 6=Saturday.
 */

export const BREAKFAST_SHOW = 'ONE FM Breakfast (Breaky)'
export const BREAKFAST_TIME = '6:00am – 9:00am'

/** Breakfast hosts Mon–Fri (confirmed from guide) */
export const BREAKFAST_HOSTS: Record<number, string> = {
  1: 'Tim Ahemt',     // Monday
  2: 'Tim Ahemt',     // Tuesday (guide shows same presenter block)
  3: 'Craig Stott',   // Wednesday — "Tuesday Mornings with Craig Stott" / Big G Wed
  4: 'Ralph Whitehead', // Thursday — "Thursday Mornings with Ralph Whitehead"
  5: 'Josh Revens',   // Friday — "Friday Mornings with Josh Revens"
}

export function getBreakfastHost(day: number): string {
  return BREAKFAST_HOSTS[day] ?? 'ONE FM'
}

export function getBreakfastScheduleLabel(): string {
  return 'Mon–Tue: Tim Ahemt · Wed: Craig Stott (The Big G) · Thu: Ralph Whitehead · Fri: Josh Revens'
}

export interface LiveShowInfo {
  name: string
  host: string
  time: string
  category: string
  upNext: string
}

/** Full weekly schedule — source: fm985.com.au/guide/ */
export interface ScheduleSlot {
  day: number   // 0=Sun … 6=Sat
  startHour: number
  endHour: number
  name: string
  host: string
  category: string
}

export const FULL_SCHEDULE: ScheduleSlot[] = [
  // ── MONDAY ──────────────────────────────────────────────────
  { day: 1, startHour: 6,  endHour: 9,  name: 'ONE FM Breakfast (Breaky)', host: 'Tim Ahemt', category: 'Breakfast' },
  { day: 1, startHour: 9,  endHour: 12, name: 'Dancing through the decades', host: 'Johnny P (John Painter)', category: 'Music' },
  { day: 1, startHour: 12, endHour: 15, name: 'Monday Afternoon', host: 'Di Hunter', category: 'Music' },
  { day: 1, startHour: 15, endHour: 16, name: 'Winding Back', host: 'Ken & Jill Gaffney', category: 'Music' },
  { day: 1, startHour: 16, endHour: 17, name: 'The James Manley Show', host: 'James Manley', category: 'Community' },
  { day: 1, startHour: 17, endHour: 18, name: 'The Final Siren (Football & Netball Scoreboard)', host: 'ONE FM', category: 'Sport' },
  { day: 1, startHour: 18, endHour: 19, name: 'Monday Nights', host: 'Josh Revens', category: 'Community' },
  { day: 1, startHour: 19, endHour: 20, name: 'Radio Netherlands', host: 'Margaret & Josh', category: 'Multicultural' },
  { day: 1, startHour: 20, endHour: 21, name: 'Good Evening Country', host: 'Timmy Ahmet', category: 'Country' },
  { day: 1, startHour: 21, endHour: 22, name: 'The Afri-Connect Program', host: 'Fikiri', category: 'Multicultural' },
  { day: 1, startHour: 22, endHour: 23, name: 'Mandarin Program', host: 'Jimmy & Rainy', category: 'Multicultural' },
  { day: 1, startHour: 23, endHour: 24, name: 'Punjabi Music Program', host: 'ONE FM', category: 'Multicultural' },
  { day: 1, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },

  // ── TUESDAY ─────────────────────────────────────────────────
  { day: 2, startHour: 6,  endHour: 9,  name: 'ONE FM Breakfast (Breaky)', host: 'Tim Ahemt', category: 'Breakfast' },
  { day: 2, startHour: 9,  endHour: 12, name: 'Tuesday Mornings', host: 'Craig Stott', category: 'Music' },
  { day: 2, startHour: 12, endHour: 15, name: 'Dancing through the decades', host: 'Johnny P (John Painter)', category: 'Music' },
  { day: 2, startHour: 15, endHour: 16, name: 'Butterfly Favorites', host: 'Judy', category: 'Music' },
  { day: 2, startHour: 16, endHour: 17, name: 'The James Manley Show', host: 'James Manley', category: 'Community' },
  { day: 2, startHour: 17, endHour: 18, name: 'The Final Siren', host: 'ONE FM', category: 'Sport' },
  { day: 2, startHour: 18, endHour: 19, name: 'Classic Country', host: 'Sue', category: 'Country' },
  { day: 2, startHour: 21, endHour: 22, name: 'Viva Italia (Italian Show)', host: 'Carlo', category: 'Multicultural' },
  { day: 2, startHour: 22, endHour: 23, name: 'Filipino Music Program', host: 'Edith', category: 'Multicultural' },
  { day: 2, startHour: 23, endHour: 24, name: 'Overnight Mix', host: 'Automated', category: 'Music' },
  { day: 2, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },

  // ── WEDNESDAY ───────────────────────────────────────────────
  { day: 3, startHour: 6,  endHour: 9,  name: 'ONE FM Breakfast (Breaky)', host: 'The Big G', category: 'Breakfast' },
  { day: 3, startHour: 9,  endHour: 12, name: 'Wednesday Morning', host: 'The Big G', category: 'Music' },
  { day: 3, startHour: 12, endHour: 15, name: 'Dancing through the decades', host: 'Johnny P (John Painter)', category: 'Music' },
  { day: 3, startHour: 15, endHour: 16, name: 'All Things Rock', host: 'Steve Little', category: 'Music' },
  { day: 3, startHour: 16, endHour: 17, name: 'Thursday Afternoon', host: 'The Big G', category: 'Music' },
  { day: 3, startHour: 18, endHour: 19, name: 'Rockin with Les Harrison', host: "Les 'Harro' Harrison", category: 'Music' },
  { day: 3, startHour: 21, endHour: 22, name: 'Samoan Music Program', host: 'MK', category: 'Multicultural' },
  { day: 3, startHour: 23, endHour: 24, name: 'Arabic Music Program', host: 'ONE FM', category: 'Multicultural' },
  { day: 3, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },

  // ── THURSDAY ────────────────────────────────────────────────
  { day: 4, startHour: 6,  endHour: 9,  name: 'ONE FM Breakfast (Breaky)', host: 'Ralph Whitehead', category: 'Breakfast' },
  { day: 4, startHour: 9,  endHour: 12, name: 'Thursday Mornings', host: 'Ralph Whitehead', category: 'Music' },
  { day: 4, startHour: 12, endHour: 15, name: 'Dancing through the decades', host: 'Johnny P (John Painter)', category: 'Music' },
  { day: 4, startHour: 15, endHour: 16, name: 'All Things Rock', host: 'Steve Little', category: 'Music' },
  { day: 4, startHour: 16, endHour: 17, name: 'Thursday Afternoon', host: 'The Big G', category: 'Music' },
  { day: 4, startHour: 18, endHour: 19, name: 'The Essential Hits', host: 'Tim Symonds', category: 'Music' },
  { day: 4, startHour: 21, endHour: 22, name: "Rock 'n' Roll Fever", host: 'Carlo', category: 'Music' },
  { day: 4, startHour: 23, endHour: 24, name: 'Planet of Sound', host: 'Carlos Rock', category: 'Music' },
  { day: 4, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },

  // ── FRIDAY ──────────────────────────────────────────────────
  { day: 5, startHour: 6,  endHour: 9,  name: 'ONE FM Breakfast (Breaky)', host: 'Josh Revens', category: 'Breakfast' },
  { day: 5, startHour: 9,  endHour: 12, name: 'Friday Mornings', host: 'Josh Revens', category: 'Music' },
  { day: 5, startHour: 12, endHour: 15, name: 'Dancing through the decades', host: 'Johnny P (John Painter)', category: 'Music' },
  { day: 5, startHour: 15, endHour: 16, name: 'Friday Arvo', host: 'Ralph Whitehead', category: 'Music' },
  { day: 5, startHour: 18, endHour: 19, name: 'The Show for Everyone', host: 'Tym Jeffery', category: 'Community' },
  { day: 5, startHour: 19, endHour: 22, name: 'NIRS AFL Friday Night Footy', host: 'ONE FM', category: 'Sport' },
  { day: 5, startHour: 23, endHour: 24, name: 'Overnight Mix', host: 'Automated', category: 'Music' },
  { day: 5, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },

  // ── SATURDAY ────────────────────────────────────────────────
  { day: 6, startHour: 6,  endHour: 9,  name: 'Songs of the Spirit', host: 'ONE FM', category: 'Community' },
  { day: 6, startHour: 8,  endHour: 12, name: 'Saturday Sport', host: 'The Stats Man', category: 'Sport' },
  { day: 6, startHour: 8,  endHour: 12, name: 'Country Requests & Open Spaces', host: 'KT or Ralph', category: 'Country' },
  { day: 6, startHour: 13, endHour: 15, name: 'GVL Match of the Day', host: 'ONE FM', category: 'Sport' },
  { day: 6, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },

  // ── SUNDAY ──────────────────────────────────────────────────
  { day: 0, startHour: 6,  endHour: 9,  name: 'ONE FM Breakfast', host: 'ONE FM', category: 'Breakfast' },
  { day: 0, startHour: 12, endHour: 15, name: 'The Essential Hits', host: 'Tim Symonds', category: 'Music' },
  { day: 0, startHour: 13, endHour: 15, name: 'NIRS Sunday Afternoon AFL - Match of the Day', host: 'ONE FM', category: 'Sport' },
  { day: 0, startHour: 15, endHour: 17, name: 'Sunday Afternoon', host: 'John Painter', category: 'Music' },
  { day: 0, startHour: 19, endHour: 21, name: 'Sunday Night Country', host: 'Sue', category: 'Country' },
  { day: 0, startHour: 0,  endHour: 6,  name: 'Overnight Mix', host: 'Automated', category: 'Music' },
]

/** Distinct multicultural shows on the weekly guide (source: fm985.com.au/guide/). */
export const MULTICULTURAL_PROGRAMS = Array.from(
  new Map(
    FULL_SCHEDULE.filter((s) => s.category === 'Multicultural').map((s) => [s.name, s]),
  ).values(),
)
export const MULTICULTURAL_PROGRAM_COUNT = MULTICULTURAL_PROGRAMS.length

/** Get current on-air show from full schedule */
export function getCurrentLiveShow(now: Date = new Date()): LiveShowInfo {
  const day = now.getDay()
  const hour = now.getHours()

  const candidates = FULL_SCHEDULE.filter(s => {
    if (s.day !== day) return false
    if (s.startHour < s.endHour) return hour >= s.startHour && hour < s.endHour
    // overnight wrap (e.g. 0–6 stored for day of broadcast)
    return hour >= s.startHour || hour < s.endHour
  })

  if (candidates.length > 0) {
    // Prefer non-automated
    const live = candidates.find(s => s.host !== 'Automated') ?? candidates[0]
    // Find next show
    const sorted = FULL_SCHEDULE
      .filter(s => s.day === day && s.startHour > hour)
      .sort((a, b) => a.startHour - b.startHour)
    const next = sorted[0]
    return {
      name: live.name,
      host: live.host,
      time: `${formatHour(live.startHour)} — ${formatHour(live.endHour)}`,
      category: live.category,
      upNext: next ? `${next.name} at ${formatHour(next.startHour)}` : 'Overnight Mix',
    }
  }

  // Default overnight
  return {
    name: 'Overnight Mix',
    host: 'Automated',
    time: '12:00AM — 6:00AM',
    category: 'Music',
    upNext: 'ONE FM Breakfast (Breaky) at 6:00AM',
  }
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12:00AM'
  if (h === 12) return '12:00PM'
  return h < 12 ? `${h}:00AM` : `${h - 12}:00PM`
}

export const BREAKFAST_ROSTER = [
  { day: 'Monday',    host: 'Tim Ahemt' },
  { day: 'Tuesday',   host: 'Tim Ahemt' },
  { day: 'Wednesday', host: 'The Big G (Craig Stott)' },
  { day: 'Thursday',  host: 'Ralph Whitehead' },
  { day: 'Friday',    host: 'Josh Revens' },
] as const

/** Consecutive breakfast days merged into one row per host. */
function mergedBreakfastRoster(): { host: string; days: string[] }[] {
  const rows: { host: string; days: string[] }[] = []
  for (const slot of BREAKFAST_ROSTER) {
    const last = rows[rows.length - 1]
    if (last && last.host === slot.host) last.days.push(slot.day)
    else rows.push({ host: slot.host, days: [slot.day] })
  }
  return rows
}

/**
 * ONE FM holds no cleared presenter portraits, so the on-air wall runs station
 * photography (studio and outside broadcast) behind the names. The images are
 * decorative and must never be captioned as a photo of the presenter named
 * beside them.
 */
export const ON_AIR_WALL_BACKDROPS = [
  '/on-air-host-1.jpg',
  '/studio-control-room.jpg',
  '/assets/images/studio-presenter-mic.jpg',
  '/assets/images/ob-van-branded.jpg',
  '/assets/images/studio-commentary-selfie.jpg',
  '/assets/images/commentary-box-action.jpg',
] as const

export const ON_AIR_WALL_PHOTO_NOTE =
  'Photography: ONE FM studio and outside-broadcast archive — not presenter portraits.'

/**
 * "On Air This Week" wall for Home and Listen.
 * Every row resolves to a slot in FULL_SCHEDULE above — no invented presenters.
 */
export const ON_AIR_WEEK: { name: string; sub: string; img: string }[] = [
  ...mergedBreakfastRoster().map((row) => ({
    name: row.host,
    sub: `${BREAKFAST_SHOW} · ${row.days.map((d) => d.slice(0, 3)).join(' & ')}`,
  })),
  { name: 'Johnny P', sub: 'Dancing through the decades · Mon–Fri 9AM' },
  { name: 'James Manley', sub: 'The James Manley Show · Mon & Tue 4PM' },
].map((row, i) => ({
  ...row,
  img:
    row.name === 'Di Hunter'
      ? '/assets/images/heritage-di-hunter-carols-2014.jpg'
      : ON_AIR_WALL_BACKDROPS[i % ON_AIR_WALL_BACKDROPS.length],
}))

/** All unique presenters from the guide */
export const ALL_PRESENTERS = [
  { name: 'Tim Ahemt',          show: 'ONE FM Breakfast (Mon–Tue)',       shift: 'Morning' },
  { name: 'The Big G',          show: 'Wed Morning / Breakfast',           shift: 'Morning' },
  { name: 'Ralph Whitehead',    show: 'Thu Mornings / Friday Arvo',        shift: 'Morning' },
  { name: 'Josh Revens',        show: 'Friday Mornings / Monday Nights',   shift: 'Morning' },
  { name: 'Johnny P (John Painter)', show: 'Dancing through the decades',  shift: 'Daytime' },
  { name: 'Di Hunter',          show: 'Monday Afternoon',                  shift: 'Daytime' },
  { name: 'Craig Stott',        show: 'Tuesday Mornings',                  shift: 'Daytime' },
  { name: 'Ken & Jill Gaffney', show: 'Winding Back',                      shift: 'Daytime' },
  { name: 'Judy',               show: 'Butterfly Favorites',               shift: 'Daytime' },
  { name: 'Steve Little',       show: 'All Things Rock',                   shift: 'Daytime' },
  { name: 'Tim Symonds',        show: 'The Essential Hits',                shift: 'Daytime' },
  { name: 'James Manley',       show: 'The James Manley Show',             shift: 'Afternoon' },
  { name: 'Tym Jeffery',        show: 'The Show for Everyone',             shift: 'Evening' },
  { name: 'Sue',                show: 'Classic Country / Sunday Night Country', shift: 'Evening' },
  { name: "Les 'Harro' Harrison", show: 'Rockin with Les Harrison',         shift: 'Evening' },
  { name: 'Timmy Ahmet',        show: 'Good Evening Country',              shift: 'Evening' },
  { name: 'Carlo',              show: "Viva Italia / Rock 'n' Roll Fever", shift: 'Evening' },
  { name: 'Carlos Rock',        show: 'Planet of Sound',                   shift: 'Evening' },
  { name: 'Margaret & Josh',    show: 'Radio Netherlands',                 shift: 'Evening' },
  { name: 'KT or Ralph',        show: 'Country Requests & Open Spaces (Sat)', shift: 'Weekend' },
  { name: 'John Painter',       show: 'Sunday Afternoon',                  shift: 'Weekend' },
  // Multicultural
  { name: 'Fikiri',             show: 'The Afri-Connect Program (Swahili)', shift: 'Specialist' },
  { name: 'MK',                 show: 'Samoan Music Program',              shift: 'Specialist' },
  { name: 'Edith',              show: 'Filipino Music Program',            shift: 'Specialist' },
  { name: 'Jimmy & Rainy',      show: 'Mandarin Program',                  shift: 'Specialist' },
] as const

/** Homepage "What's On Today" tiles — sourced from guide */
export const HOMEPAGE_FEATURED_SHOWS = [
  {
    name: BREAKFAST_SHOW,
    time: 'Mon–Fri 6:00AM',
    hostLabel: 'Rotating hosts',
    scheduleKey: 'breakfast' as const,
  },
  {
    name: 'Dancing through the decades',
    time: 'Mon–Fri 9:00AM',
    hostLabel: 'Johnny P (John Painter)',
    scheduleKey: 'dancing' as const,
  },
  {
    name: 'The James Manley Show',
    time: 'Mon–Tue 4:00PM',
    hostLabel: 'James Manley',
    scheduleKey: 'james-manley' as const,
  },
  {
    name: 'Planet of Sound',
    time: 'Thu & Fri 11:00PM',
    hostLabel: 'Carlos Rock',
    scheduleKey: 'planet' as const,
  },
] as const

/** Homepage program preview cards */
export const PROGRAM_PREVIEW_CARDS = [
  {
    title: BREAKFAST_SHOW,
    presenter: getBreakfastScheduleLabel(),
    schedule: 'Monday–Friday, 6AM–9AM',
    description:
      "Rotating breakfast hosts — community interviews, local news, and music. The Valley's essential morning companion.",
  },
  {
    title: 'Dancing through the decades',
    presenter: 'Johnny P (John Painter)',
    schedule: 'Monday–Friday, 9AM–12PM',
    description:
      'Music from across the decades with Johnny P. Four years on air, playing the hits that span generations.',
  },
  {
    title: 'The James Manley Show',
    presenter: 'James Manley',
    schedule: 'Monday–Tuesday, 4PM–5PM',
    description:
      'Community-focused afternoon programming with local interviews and advocacy. The issues that matter to the Valley.',
  },
  {
    title: 'The Afri-Connect Program',
    presenter: 'Fikiri',
    schedule: 'Monday, 9PM–10PM',
    description: 'Swahili language program connecting the African community in the Goulburn Valley.',
  },
  {
    title: 'Planet of Sound',
    presenter: 'Carlos Rock',
    schedule: 'Thursday & Friday, 11PM',
    description:
      'Rock music program spanning 19–20 years on air with Carlos Rock. A Valley institution for rock fans.',
  },
  {
    title: 'Good Evening Country',
    presenter: 'Timmy Ahmet',
    schedule: 'Monday, 8PM–9PM',
    description: 'Country music showcase — the best country classics and new releases.',
  },
] as const

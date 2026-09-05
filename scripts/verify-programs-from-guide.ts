/**
 * Lock: Programs featured cards come from FULL_SCHEDULE, not a handwritten slogan list.
 * Run: npx vite-node scripts/verify-programs-from-guide.ts
 */
import { readFileSync } from 'node:fs'
import {
  BREAKFAST_SHOW,
  featuredShowsFromGuide,
  FULL_SCHEDULE,
} from '../src/data/programGuide'
import { formatGuideHours } from '../src/lib/guideHours'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-programs-from-guide FAIL: ${message}`)
    process.exit(1)
  }
}

const programs = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

assert(programs.includes('featuredShowsFromGuide'), 'Programs.tsx must call featuredShowsFromGuide')
assert(programs.includes('formatGuideHours'), 'Programs.tsx must still resolve hours via formatGuideHours')
assert(programs.includes('formatHostHours'), 'Programs.tsx host roster hours stay on formatHostHours')
assert(programs.includes('<WeeklySchedule'), 'Programs page still mounts the weekly grid')

const leftover = [
  'defined a generation',
  'perfect close',
  'all eras',
  'essential morning companion',
  'definitive rock show',
]
for (const phrase of leftover) {
  assert(!programs.includes(phrase), `Programs.tsx still has leftover slogan: ${phrase}`)
}

const shows = featuredShowsFromGuide()
assert(shows.length > 0, 'featuredShowsFromGuide must return shows')
assert(
  shows.every((s) => s.name !== 'Overnight Mix'),
  'Overnight Mix is the automated bed — not a featured card',
)
assert(
  shows.some((s) => s.name === BREAKFAST_SHOW),
  'weekday breakfast must collapse to BREAKFAST_SHOW',
)
assert(
  shows.filter((s) => s.name === BREAKFAST_SHOW).length === 1,
  'weekday breakfast must be a single card',
)
assert(
  shows.some((s) => s.name === 'Monday Afternoon'),
  'Di Hunter Monday Afternoon is on the guide — it must appear',
)
assert(
  shows.some((s) => s.name === 'The Show for Everyone'),
  'Tym Jeffery The Show for Everyone is on the guide — it must appear',
)
assert(
  shows.some((s) => s.name === 'Friday Arvo'),
  'Ralph Whitehead Friday Arvo is on the guide — it must appear',
)
assert(
  shows.some((s) => s.name === 'ONE FM Breakfast'),
  'Sunday breakfast keeps its own guide name',
)

const names = shows.map((s) => s.name)
assert(new Set(names).size === names.length, 'featured show names must be unique')

for (const show of shows) {
  const hours = formatGuideHours(show.name)
  assert(hours, `${show.name} must resolve hours from FULL_SCHEDULE`)
  const onGuide =
    show.name === BREAKFAST_SHOW ||
    FULL_SCHEDULE.some((slot) => slot.name === show.name)
  assert(onGuide, `${show.name} is not a FULL_SCHEDULE title`)
}

const dancing = shows.find((s) => s.name === 'Dancing through the decades')
assert(dancing?.host.includes('Johnny P'), 'Dancing through the decades host is Johnny P')
const dancingHours = formatGuideHours('Dancing through the decades')
assert(
  dancingHours?.includes('Tue'),
  `Dancing hours must include Tuesday (12–3 on the guide), got ${dancingHours}`,
)

console.log(`verify-programs-from-guide: ${shows.length} featured cards from FULL_SCHEDULE.`)

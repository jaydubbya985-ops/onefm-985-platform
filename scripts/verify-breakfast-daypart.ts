/**
 * Ops daypart B is 6:00am–9:00am from programGuide — not leftover 7–10am
 * "The ONE FM Breakfast Show" from the old OpsPortal bundle.
 * Run: npx vite-node scripts/verify-breakfast-daypart.ts
 */
import { BREAKFAST_TIME } from '../src/data/programGuide'
import {
  DAYPARTS,
  PROGRAMME_GUIDE,
  daypartsForHours,
} from '../src/components/ops/data/schedule'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-breakfast-daypart FAIL: ${message}`)
    process.exit(1)
  }
}

const breakfast = DAYPARTS.find((d) => d.code === 'B')
assert(breakfast, 'Breakfast daypart B must exist')
assert(
  breakfast!.timeRange === '6:00 AM – 9:00 AM',
  `Breakfast daypart must be 6:00 AM – 9:00 AM from the guide, got ${breakfast!.timeRange}`,
)
assert(
  !/The ONE FM Breakfast Show/i.test(breakfast!.description),
  'leftover show name "The ONE FM Breakfast Show" must not appear',
)
assert(
  /ONE FM Breakfast/.test(breakfast!.description),
  `Breakfast description must name ONE FM Breakfast, got ${breakfast!.description}`,
)
assert(
  !/7:00/.test(breakfast!.timeRange) && !/10:00/.test(breakfast!.timeRange),
  'leftover 7:00–10:00 breakfast hours must not remain',
)

const early = DAYPARTS.find((d) => d.code === 'EM')
assert(early?.timeRange === '5:00 AM – 6:00 AM', `EM must end when breakfast starts, got ${early?.timeRange}`)

const morning = DAYPARTS.find((d) => d.code === 'M')
assert(morning?.timeRange === '9:00 AM – 1:00 PM', `Morning must start when breakfast ends, got ${morning?.timeRange}`)

assert(BREAKFAST_TIME === '6:00am – 9:00am', `programGuide BREAKFAST_TIME drifted: ${BREAKFAST_TIME}`)

const breakyHours = daypartsForHours(6, 9)
assert(
  breakyHours.includes('B') && !breakyHours.includes('M'),
  `6–9am must be Breakfast only, got ${breakyHours.join(',')}`,
)

const dancingHours = daypartsForHours(9, 12)
assert(
  dancingHours.includes('M') && !dancingHours.includes('B'),
  `9–12 Dancing through the decades must not sit on leftover Breakfast 7–10, got ${dancingHours.join(',')}`,
)

const breakyRows = PROGRAMME_GUIDE.filter((p) => p.category === 'breakfast' && p.day >= 1 && p.day <= 5)
assert(breakyRows.length === 5, `expected 5 weekday breakfast rows, got ${breakyRows.length}`)
for (const row of breakyRows) {
  assert(row.time === BREAKFAST_TIME, `breakfast row time must be ${BREAKFAST_TIME}, got ${row.time}`)
  assert(row.dayparts.includes('B'), `${row.show} ${row.day} must map to daypart B`)
  assert(!row.dayparts.includes('M'), `${row.show} ${row.day} must not spill into Morning`)
}

const dancing = PROGRAMME_GUIDE.filter((p) => p.show === 'Dancing through the decades')
assert(dancing.length > 0, 'Dancing through the decades must be on the ops grid')
for (const row of dancing) {
  assert(
    !row.dayparts.includes('B'),
    `${row.show} ${row.day} ${row.time} must not be tagged Breakfast (leftover 7–10am)`,
  )
}

console.log('verify-breakfast-daypart OK')

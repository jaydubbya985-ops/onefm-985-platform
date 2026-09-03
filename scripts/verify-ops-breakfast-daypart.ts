/**
 * Fail if ops sales dayparts invent a 7–10am breakfast.
 * Run: npx vite-node scripts/verify-ops-breakfast-daypart.ts
 */
import { BREAKFAST_SHOW, BREAKFAST_TIME } from '../src/data/programGuide'
import {
  DAYPARTS,
  PROGRAMME_GUIDE,
  daypartsForHours,
} from '../src/components/ops/data/schedule'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-ops-breakfast-daypart FAIL: ${message}`)
    process.exit(1)
  }
}

const breakfast = DAYPARTS.find((d) => d.code === 'B')
assert(breakfast, 'breakfast daypart B must exist')
assert(
  breakfast?.timeRange === '6:00 AM – 9:00 AM',
  `breakfast range must be 6–9 from the guide, got ${breakfast?.timeRange}`,
)
assert(
  !/7:00 AM – 10:00 AM/.test(breakfast?.timeRange ?? ''),
  'do not keep the leftover 7–10am breakfast window',
)
assert(
  !/The ONE FM Breakfast Show/.test(breakfast?.description ?? ''),
  'do not invent “The ONE FM Breakfast Show”',
)
assert(
  breakfast?.description.includes(BREAKFAST_SHOW) === true,
  `breakfast description must name ${BREAKFAST_SHOW}`,
)
assert(
  BREAKFAST_TIME === '6:00am – 9:00am',
  `guide BREAKFAST_TIME must stay 6:00am – 9:00am, got ${BREAKFAST_TIME}`,
)

assert(
  JSON.stringify(daypartsForHours(6, 9)) === JSON.stringify(['B']),
  `weekday breakfast 6–9 must map to B only, got ${daypartsForHours(6, 9).join(',')}`,
)
assert(
  JSON.stringify(daypartsForHours(0, 6)) === JSON.stringify(['EM']),
  `overnight 0–6 must map to EM only, got ${daypartsForHours(0, 6).join(',')}`,
)

const mondayBreaky = PROGRAMME_GUIDE.find((p) => p.id === 'breaky-1')
assert(mondayBreaky, 'Monday breakfast row must exist')
assert(
  JSON.stringify(mondayBreaky?.dayparts) === JSON.stringify(['B']),
  `Monday breakfast must sit in B only, got ${mondayBreaky?.dayparts.join(',')}`,
)
assert(mondayBreaky?.time === BREAKFAST_TIME, `Monday breakfast clock must be ${BREAKFAST_TIME}`)

console.log('verify-ops-breakfast-daypart OK')

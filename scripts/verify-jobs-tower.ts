/**
 * Fail if Coverage Map sits on a festival still.
 * Run: npx vite-node scripts/verify-jobs-tower.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-jobs-tower FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/components/PageJobsBar.tsx', 'utf8')
const still = src.slice(src.indexOf('function leftoverStill'))

assert(
  /path === '\/coverage'[\s\S]*towerTallMast/.test(still),
  'Coverage job must use the transmitter mast, not a festival still',
)
assert(
  /path === '\/football'[\s\S]*gvlSpectacularMark/.test(still),
  'Football job keeps the GVL still',
)
assert(
  /path === '\/listen'[\s\S]*commentaryBoxAction/.test(still),
  'Listen Live must not sit on leftover cinema/festival file-order stills',
)
assert(!still.includes('formatCoverageShort'), 'Do not stamp coverage copy onto the job tiles')
assert(!/Station archive still/.test(still), 'Do not restamp cinegraph archive-still credit')
assert(!still.includes('HOST_PHOTOS') && !still.includes('onAirHost'), 'No unlabeled host faces')

console.log('verify-jobs-tower OK — Coverage sits on the mast, Listen on the box')

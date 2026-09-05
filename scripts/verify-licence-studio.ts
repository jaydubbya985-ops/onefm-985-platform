/**
 * Fail if the 1989 ACMA licence card stays a blank tile.
 * Run: npx vite-node scripts/verify-licence-studio.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-licence-studio FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/components/archive/DecadeDial.tsx', 'utf8')
const still = src.slice(src.indexOf('function cardStill'))

assert(still.includes("case 'licence-1989'"), 'licence-1989 must have a still')
assert(
  still.includes('studioExteriorRainbow'),
  'Licence card uses the studio exterior — the licensed building, not a host face',
)
assert(
  /3ONE|1 April 1989|licensed service/.test(still),
  'Alt must name the licensed service, not a decorative stock caption',
)
assert(!still.includes('formatCoverageShort'), 'Do not stamp coverage onto the decade dial')
assert(
  !/Station archive still/.test(still),
  'Do not restamp the cinegraph archive-still pill onto Heritage',
)
assert(
  !still.includes('HOST_PHOTOS') && !still.includes('onAirHost'),
  'Do not put an unlabeled host on the licence card',
)

console.log('verify-licence-studio OK — 1989 licence card uses the studio exterior')

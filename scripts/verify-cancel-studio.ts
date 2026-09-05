/**
 * Fail if /payment/cancel still dresses a no-charge screen as GVL match day.
 * Run: npx vite-node scripts/verify-cancel-studio.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-cancel-studio FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/pages/PaymentCancel.tsx', 'utf8')

assert(
  !src.includes('obMatchDayBanner'),
  'NO CHARGE must not sit on the GVL match-day banner',
)
assert(
  !/STATION_PHOTOS\.gvl/.test(src),
  'NO CHARGE must not sit on a GVL celebration still',
)
assert(
  src.includes('studioExteriorRainbow'),
  'NO CHARGE should use the station exterior — the licensed building, not a game',
)
assert(
  src.includes('Online checkout is not live'),
  'Keep the honest checkout line',
)
assert(
  src.includes('not a Stripe receipt'),
  'Keep the not-a-Stripe-receipt line',
)
assert(
  !src.includes('formatCoverageShort'),
  'Do not stamp coverage onto the cancel page',
)
assert(
  !/Station archive still/.test(src),
  'Do not restamp cinegraph archive-still credit onto this page',
)

console.log('verify-cancel-studio OK — NO CHARGE is the studio, not match day')

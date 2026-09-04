/**
 * Fail if the public standard-spot line still says “from $25”.
 * On GVL Football that leftover reads as match-day inventory from $25.
 * Jay: standard 30s is $25 plus GST. GVL is never “from $25”.
 *
 * Run: npx vite-node scripts/verify-standard-spot.ts
 */
import { readFileSync } from 'node:fs'
import { STANDARD_SPOT_PLUS_GST } from '../src/lib/inventoryCopy'
import { rateCard } from '../src/data/pricing'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-standard-spot FAIL: ${message}`)
    process.exit(1)
  }
}

assert(
  !/from\s*\$/.test(STANDARD_SPOT_PLUS_GST),
  `STANDARD_SPOT_PLUS_GST still says from $: ${STANDARD_SPOT_PLUS_GST}`,
)
assert(
  STANDARD_SPOT_PLUS_GST.includes(`start at $${rateCard.standardSpot30s} plus GST`),
  `expected start-at floor, got: ${STANDARD_SPOT_PLUS_GST}`,
)
assert(!/plemo/i.test(STANDARD_SPOT_PLUS_GST), 'must not invent Plemo')

const src = readFileSync(new URL('../src/lib/inventoryCopy.ts', import.meta.url), 'utf8')
assert(
  !/STANDARD_SPOT_PLUS_GST = `Standard 30-second spots from \$/.test(src),
  'leftover from-$ template still in inventoryCopy.ts',
)

console.log(`verify-standard-spot OK — ${STANDARD_SPOT_PLUS_GST}`)

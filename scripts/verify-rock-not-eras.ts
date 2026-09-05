/**
 * Lock: All Things Rock names Steve Little + guide hours,
 * not leftover "from all eras".
 * Run: npx vite-node scripts/verify-rock-not-eras.ts
 */
import { readFileSync } from 'node:fs'
import { formatGuideHours } from '../src/lib/guideHours'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-rock-not-eras FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

assert(!/best of rock from all eras/i.test(src), 'leftover all-eras copy is back')
assert(src.includes("formatGuideHours('All Things Rock')"), 'All Things Rock hours must come from the weekly guide')
assert(src.includes('Steve Little on the weekly guide'), 'All Things Rock card must name Steve Little')

const hours = formatGuideHours('All Things Rock')
assert(hours !== null, 'All Things Rock must resolve on FULL_SCHEDULE')
assert(/Wed/i.test(hours ?? ''), `expected Wednesday slot, got ${hours}`)
assert(/Thu/i.test(hours ?? ''), `expected Thursday slot, got ${hours}`)

// Other desks own these leftovers — do not steal.
assert(src.includes('essential hits from across the decades'), 'do not steal #509 leftover decades')
assert(src.includes('essential morning companion'), 'do not steal #440 leftover essential companion')
assert(src.includes('defined a generation'), 'do not steal #492 leftover generation')
assert(src.includes('From dawn till dark'), 'do not steal leftover 24/7 dawn-till-dark')
assert(/perfect close/i.test(src), 'do not steal #465 leftover perfect close')

console.log('verify-rock-not-eras OK')

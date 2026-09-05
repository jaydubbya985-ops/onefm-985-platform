/**
 * Lock: Essential Hits card names Tim Symonds + guide hours,
 * not leftover "from across the decades".
 * Run: npx vite-node scripts/verify-hits-not-decades.ts
 */
import { readFileSync } from 'node:fs'
import { formatGuideHours } from '../src/lib/guideHours'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-hits-not-decades FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

assert(!/essential hits from across the decades/i.test(src), 'leftover decades copy is back')
assert(src.includes("formatGuideHours('The Essential Hits')"), 'Essential Hits hours must come from the weekly guide')
assert(src.includes('Tim Symonds on the weekly guide'), 'Essential Hits card must name Tim Symonds')

const hours = formatGuideHours('The Essential Hits')
assert(hours !== null, 'The Essential Hits must resolve on FULL_SCHEDULE')
assert(/Thu/i.test(hours ?? ''), `expected Thursday slot, got ${hours}`)
assert(/Sun/i.test(hours ?? ''), `expected Sunday slot, got ${hours}`)

// Other desks own these leftovers — do not steal.
assert(src.includes('essential morning companion'), 'do not steal #440 leftover essential companion')
assert(src.includes('defined a generation'), 'do not steal #492 leftover generation')
assert(src.includes('From dawn till dark'), 'do not steal leftover 24/7 dawn-till-dark')
assert(/perfect close/i.test(src), 'do not steal #465 leftover perfect close')

console.log('verify-hits-not-decades OK')

/**
 * Lock: Explorer commentary still names GVL Match of the Day + guide hours,
 * not leftover "ready to call the game".
 * Run: npx vite-node scripts/verify-explorer-not-ready.ts
 */
import { readFileSync } from 'node:fs'
import { formatGuideHours } from '../src/lib/guideHours'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-explorer-not-ready FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')

assert(!/ready to call the game/i.test(src), 'leftover ready-to-call copy is back')
assert(
  src.includes("formatGuideHours('GVL Match of the Day')"),
  'commentary still hours must come from the weekly guide',
)
assert(src.includes('GVL Match of the Day'), 'commentary still must name GVL Match of the Day')

const hours = formatGuideHours('GVL Match of the Day')
assert(hours !== null, 'GVL Match of the Day must resolve on FULL_SCHEDULE')
assert(/Sat/i.test(hours ?? ''), `expected Saturday slot, got ${hours}`)

// Other desks own these leftovers — do not steal.
assert(src.includes('Calling the game — live from the ground'), 'do not steal the second commentary caption')
assert(src.includes('Tour the Studio'), 'do not steal #435 leftover Tour the Studio')
assert(src.includes('essential morning companion'), 'do not steal #464 leftover essential companion')
assert(src.includes('LIVE CALLS'), 'do not steal #460 leftover LIVE CALLS')
assert(src.includes('PREVIEW'), 'do not steal #433 leftover PREVIEW')

console.log('verify-explorer-not-ready OK')

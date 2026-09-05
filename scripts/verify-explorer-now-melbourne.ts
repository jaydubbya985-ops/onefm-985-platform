/**
 * Lock: Broadcast Explorer now-line uses Melbourne clock, not leftover Date#getHours.
 * Run: npx vite-node scripts/verify-explorer-now-melbourne.ts
 */
import { readFileSync } from 'node:fs'
import { getMelbourneClock } from '../src/data/programGuide'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-explorer-now-melbourne FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')

assert(src.includes('getMelbourneClock'), 'BroadcastExplorer must read Australia/Melbourne')
assert(src.includes('activeDay === todayExplorer'), 'now-line only on today’s Melbourne weekday')
assert(!src.includes('now.getHours()'), 'leftover viewer/UTC getHours now-line is back')

// Saturday 5 Sep 2026 19:10 Melbourne — not leftover 09:10 UTC on the grid.
const clock = getMelbourneClock(new Date('2026-09-05T19:10:00+10:00'))
assert(clock.day === 6, `expected Saturday (6), got ${clock.day}`)
assert(clock.hour === 19, `expected 19, got ${clock.hour}`)
assert(clock.minute === 10, `expected 10, got ${clock.minute}`)

console.log('verify-explorer-now-melbourne: Broadcast Explorer now-line uses Melbourne clock.')

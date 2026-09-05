/**
 * Lock: Story team intro names weekday breakfast from programGuide,
 * not leftover "passionate broadcasters who found their home".
 * Run: npx vite-node scripts/verify-story-not-passionate.ts
 */
import { readFileSync } from 'node:fs'
import { BREAKFAST_SHOW, BREAKFAST_TIME } from '../src/data/programGuide'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-story-not-passionate FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Story.tsx', import.meta.url), 'utf8')

assert(!/passionate broadcasters who found their home/i.test(src), 'leftover passionate-home copy is back')
assert(src.includes('BREAKFAST_SHOW'), 'team intro must name BREAKFAST_SHOW from programGuide')
assert(src.includes('BREAKFAST_TIME'), 'team intro must name BREAKFAST_TIME from programGuide')
assert(src.includes('fm985.com.au/guide'), 'team intro must cite the weekly guide')
assert(BREAKFAST_SHOW.includes('Breakfast'), `expected breakfast show, got ${BREAKFAST_SHOW}`)
assert(/6:00am/i.test(BREAKFAST_TIME), `expected 6:00am start, got ${BREAKFAST_TIME}`)

// Other desks own these leftovers — do not steal.
assert(src.includes('APRA AMCOS Licensed'), 'do not steal Story APRA leftover')
assert(src.includes('Where the magic happens'), 'do not steal #474 leftover magic')
assert(src.includes('Goulburn Murray'), 'do not steal Goulburn Murray primitive')
assert(src.includes('Meet the Voices of the Valley'), 'do not steal Heritage Voices leftover heading')

console.log('verify-story-not-passionate OK')

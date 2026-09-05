/**
 * Fail if the Home / Listen on-air wall drops breakfast hours or keeps shorthand subs.
 * Run: npx vite-node scripts/verify-on-air-wall-hours.ts
 */
import { readFileSync } from 'node:fs'
import { onAirWallSub } from '../src/lib/guideHours'
import { BREAKFAST_SHOW, ON_AIR_WEEK } from '../src/data/programGuide'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-on-air-wall-hours FAIL: ${message}`)
    process.exit(1)
  }
}

const tim = ON_AIR_WEEK.find((p) => p.name === 'Tim Ahemt')
assert(tim, 'Tim Ahemt must stay on the on-air wall')
const timSub = onAirWallSub(tim!.name, tim!.sub)
assert(/6AM/.test(timSub), `Tim breakfast must name 6AM: ${timSub}`)
assert(/9AM/.test(timSub), `Tim breakfast must name 9AM: ${timSub}`)
assert(!timSub.endsWith('Mon & Tue'), `Tim must not stop at days only: ${timSub}`)

const bigG = ON_AIR_WEEK.find((p) => /Big G/i.test(p.name))
assert(bigG, 'Wednesday breakfast host must stay on the wall')
const bigGSub = onAirWallSub(bigG!.name, bigG!.sub)
assert(/Wed/.test(bigGSub), bigGSub)
assert(/6AM/.test(bigGSub), `Big G breakfast hours: ${bigGSub}`)

const johnny = ON_AIR_WEEK.find((p) => p.name === 'Johnny P')
assert(johnny, 'Johnny P must stay on the wall')
const johnnySub = onAirWallSub(johnny!.name, johnny!.sub)
assert(!/Mon–Fri 9AM/.test(johnnySub), `no shorthand sub: ${johnnySub}`)
assert(/Dancing through the decades/.test(johnnySub), johnnySub)

const james = ON_AIR_WEEK.find((p) => p.name === 'James Manley')
assert(james, 'James Manley must stay on the wall')
const jamesSub = onAirWallSub(james!.name, james!.sub)
assert(!/Mon & Tue 4PM$/.test(jamesSub), `no shorthand sub: ${jamesSub}`)
assert(/The James Manley Show/.test(jamesSub), jamesSub)
assert(/4PM/.test(jamesSub), jamesSub)

const src = readFileSync(new URL('../src/lib/guideHours.ts', import.meta.url), 'utf8')
assert(src.includes('formatBreakfastHostHours'), 'breakfast wall must filter Breakfast slots')
assert(src.includes("s.category === 'Breakfast'"), 'do not pull night slots onto breakfast rows')

console.log('verify-on-air-wall-hours OK')
console.log(
  JSON.stringify(
    { tim: timSub, bigG: bigGSub, johnny: johnnySub, james: jamesSub },
    null,
    2,
  ),
)

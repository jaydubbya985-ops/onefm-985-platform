/**
 * Fail the build if live-now labels invent a host or drop remaining time.
 * Run: npx vite-node scripts/verify-on-air.ts
 */
import { getCurrentLiveShow, getWeekdayBreakfastHost, getMelbourneWeekday } from '../src/data/programGuide'
import { formatWithPresenter, liveNowFromMetadata } from '../src/lib/liveNow'
import { getScheduleMetadata } from '../src/lib/playerMetadata'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-on-air FAIL: ${message}`)
    process.exit(1)
  }
}

assert(formatWithPresenter('') === null, 'blank presenter must not print "with"')
assert(formatWithPresenter('   ') === null, 'whitespace presenter must not print "with"')
assert(formatWithPresenter('ONE FM') === null, 'generic ONE FM host is not a named presenter')
assert(formatWithPresenter('Automated') === null, 'Automated is not a named presenter')
assert(formatWithPresenter('Tim Ahemt') === 'with Tim Ahemt', 'named host must print with-line')
assert(formatWithPresenter('The Big G (Craig Stott)') === 'with The Big G (Craig Stott)', 'Wednesday breakfast host')

// Thursday 3 Sep 2026 08:13 AEST — ONE FM Breakfast with Ralph Whitehead, 47 min left.
const thuBreakfast = new Date('2026-09-03T08:13:00+10:00')
const breakfastShow = getCurrentLiveShow(thuBreakfast)
assert(breakfastShow.name.includes('Breakfast'), `expected breakfast, got ${breakfastShow.name}`)
assert(breakfastShow.host === 'Ralph Whitehead', `Thursday 08:13 host should be Ralph Whitehead, got ${breakfastShow.host}`)
assert(breakfastShow.remainingMinutes === 47, `expected 47 min left at 8:13, got ${breakfastShow.remainingMinutes}`)
assert(breakfastShow.remainingLabel === '47 min left', `remaining label: ${breakfastShow.remainingLabel}`)
assert(getMelbourneWeekday(thuBreakfast) === 4, `Melbourne weekday for Thu 3 Sep 2026 should be 4, got ${getMelbourneWeekday(thuBreakfast)}`)
assert(getWeekdayBreakfastHost(4) === 'Ralph Whitehead', 'Thursday breakfast is Ralph Whitehead')

const meta = getScheduleMetadata(thuBreakfast)
const live = liveNowFromMetadata(meta, thuBreakfast)
assert(live.program.includes('Breakfast'), `liveNow program: ${live.program}`)
assert(live.withLine === 'with Ralph Whitehead', `liveNow withLine: ${live.withLine}`)
assert(live.remainingMinutes === 47, `liveNow remaining: ${live.remainingMinutes}`)
assert(live.breakfastOnAir === true, 'breakfast must be flagged on air at 08:13 Melbourne Thursday')

// Saturday GVL window — 3 Oct 2026 is a Saturday; use a known Saturday.
const satFooty = new Date('2026-09-05T14:10:00+10:00')
const gvl = getCurrentLiveShow(satFooty)
assert(/GVL|Match/i.test(gvl.name), `Saturday 14:10 should be GVL Match of the Day, got ${gvl.name}`)
assert(gvl.remainingMinutes > 0, 'GVL remaining must be positive during the slot')
assert(formatWithPresenter(gvl.host) === null, 'GVL schedule host is ONE FM — do not print a with-line')

// Overnight — Sunday 02:00 Melbourne
const overnight = new Date('2026-09-06T02:00:00+10:00')
const mix = getCurrentLiveShow(overnight)
assert(mix.name === 'Overnight Mix', `expected Overnight Mix, got ${mix.name}`)
assert(formatWithPresenter(mix.host) === null, 'overnight must not print with Automated')
assert(mix.remainingMinutes === 240, `overnight 02:00 should have 4 hr left, got ${mix.remainingMinutes}`)
const nightLive = liveNowFromMetadata(getScheduleMetadata(overnight), overnight)
assert(nightLive.isLive === false, 'Melbourne 02:00 Sunday is overnight — not On Air Now')

// Sunday 02:00 UTC = Sunday 12:00 Melbourne (AEST). Local getDay/getHours say
// "Sunday 2am → overnight". The guide says The Essential Hits with Tim Symonds.
const utcSunday0200 = new Date('2026-09-06T02:00:00Z')
const utcMeta = getScheduleMetadata(utcSunday0200)
const utcLive = liveNowFromMetadata(utcMeta, utcSunday0200)
assert(utcLive.isLive === true, `UTC Sunday 02:00 is midday Melbourne — must be live, got isLive=${utcLive.isLive} program=${utcLive.program}`)
assert(/Essential Hits/i.test(utcLive.program), `expected Essential Hits at Sunday 12:00 Melbourne, got ${utcLive.program}`)
assert(utcLive.withLine === 'with Tim Symonds', `Sunday midday with-line: ${utcLive.withLine}`)

console.log('verify-on-air OK')

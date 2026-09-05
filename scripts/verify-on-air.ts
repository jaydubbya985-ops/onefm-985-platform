/**
 * Fail the build if live-now labels invent a host or drop remaining time.
 * Run: npx vite-node scripts/verify-on-air.ts
 */
import { getCurrentLiveShow, getWeekdayBreakfastHost, getMelbourneWeekday, GUIDE_GAP_NAME } from '../src/data/programGuide'
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

// Saturday evening is unlisted on fm985.com.au/guide/ — not leftover Overnight Mix 12am–6am.
const satGap = new Date('2026-09-05T17:08:00+10:00')
const gap = getCurrentLiveShow(satGap)
assert(gap.name === GUIDE_GAP_NAME, `Saturday 17:08 should be a guide gap, got ${gap.name}`)
assert(!/12:00AM — 6:00AM/.test(gap.time), `gap must not reuse overnight 12–6, got ${gap.time}`)
assert(gap.remainingMinutes === 412, `Saturday 17:08 until Sunday Overnight Mix at midnight: expected 412 min, got ${gap.remainingMinutes}`)
assert(gap.remainingLabel === '6 hr 52 min left', `gap remaining label: ${gap.remainingLabel}`)
assert(getScheduleMetadata(satGap).isLive === false, 'unlisted hours must not be labelled On Air')

console.log('verify-on-air OK')

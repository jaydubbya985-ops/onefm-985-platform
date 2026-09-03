/**
 * Fail the build if live-now labels invent a host or drop remaining time.
 * Run: npx vite-node scripts/verify-on-air.ts
 */
import { FULL_SCHEDULE, getCurrentLiveShow, getWeekdayBreakfastHost, getMelbourneWeekday, slotIsCurrentGuide } from '../src/data/programGuide'
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

const thuRockAt = new Date('2026-09-03T15:20:00+10:00')
const rock = FULL_SCHEDULE.find((s) => s.day === 4 && s.name === 'All Things Rock')
assert(rock, 'Thursday All Things Rock must exist on the guide')
assert(slotIsCurrentGuide(rock!, thuRockAt), '15:20 Melbourne Thursday is All Things Rock')
assert(formatWithPresenter(rock!.host) === 'with Steve Little', 'All Things Rock host is Steve Little')
const breakfastSlot = FULL_SCHEDULE.find((s) => s.day === 4 && s.name.includes('Breakfast'))
assert(breakfastSlot && !slotIsCurrentGuide(breakfastSlot, thuRockAt), 'breakfast must not stay marked live at 15:20')

const satMorning = new Date('2026-09-05T10:00:00+10:00')
const satSport = FULL_SCHEDULE.find((s) => s.day === 6 && s.name === 'Saturday Sport')
const countryOpen = FULL_SCHEDULE.find((s) => s.day === 6 && s.name === 'Country Requests & Open Spaces')
assert(satSport && slotIsCurrentGuide(satSport, satMorning), 'overlapping Saturday 10:00 prefers Saturday Sport')
assert(countryOpen && !slotIsCurrentGuide(countryOpen, satMorning), 'do not mark both overlapping Saturday rows live')

console.log('verify-on-air OK')

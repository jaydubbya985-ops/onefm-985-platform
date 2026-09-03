/**
 * Fail the build if schedule metadata uses the viewer clock for isLive.
 * Run: npx vite-node scripts/verify-player-metadata.ts
 */
import { getCurrentLiveShow } from '../src/data/programGuide'
import { getScheduleMetadata, isScheduleLive } from '../src/lib/playerMetadata'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-player-metadata FAIL: ${message}`)
    process.exit(1)
  }
}

// UTC Sunday 02:00 = Melbourne Sunday 12:00 AEST — The Essential Hits · Tim Symonds.
// The leftover viewer-clock helper marked this off-air (local Sunday 02:00 < 06:00).
const utcSunday0200 = new Date('2026-09-06T02:00:00Z')
assert(utcSunday0200.getUTCDay() === 0, 'fixture must be a Sunday in UTC')
assert(utcSunday0200.getUTCHours() === 2, 'fixture must be 02:00 UTC')
assert(isScheduleLive(utcSunday0200) === true, 'UTC Sunday 02:00 is Melbourne noon — on air')
const utcMeta = getScheduleMetadata(utcSunday0200)
assert(utcMeta.isLive === true, `UTC Sunday 02:00 isLive should be true, got ${utcMeta.isLive}`)
assert(
  utcMeta.program === 'The Essential Hits',
  `UTC Sunday 02:00 program should be The Essential Hits, got ${utcMeta.program}`,
)
assert(utcMeta.presenter === 'Tim Symonds', `UTC Sunday 02:00 presenter: ${utcMeta.presenter}`)
assert(utcMeta.program !== 'Overnight Mix', 'must not fall back to overnight from the viewer clock')

// Same instant written as Melbourne noon — same result.
const melbNoon = new Date('2026-09-06T12:00:00+10:00')
const noon = getScheduleMetadata(melbNoon)
assert(noon.isLive === true, 'Melbourne Sunday 12:00 is on air')
assert(noon.program === utcMeta.program, 'Melbourne noon and UTC 02:00 must resolve the same show')

// Melbourne Sunday 02:00 — Overnight Mix, automated.
const overnight = new Date('2026-09-06T02:00:00+10:00')
const night = getScheduleMetadata(overnight)
assert(night.isLive === false, 'Melbourne Sunday 02:00 is overnight / automated')
assert(night.program === 'Overnight Mix', `overnight program: ${night.program}`)
assert(night.presenter === 'Automated', `overnight presenter: ${night.presenter}`)
assert(getCurrentLiveShow(overnight).host === 'Automated', 'guide host is Automated overnight')

// Thursday breakfast Melbourne — still live, named host.
const thuBreakfast = new Date('2026-09-03T08:13:00+10:00')
const breakfast = getScheduleMetadata(thuBreakfast)
assert(breakfast.isLive === true, 'Thursday 08:13 Melbourne is on air')
assert(breakfast.program.includes('Breakfast'), `breakfast program: ${breakfast.program}`)
assert(breakfast.presenter === 'Ralph Whitehead', `Thursday breakfast host: ${breakfast.presenter}`)

console.log('verify-player-metadata OK')
console.log(
  JSON.stringify(
    {
      utcSunday0200: { isLive: utcMeta.isLive, program: utcMeta.program, presenter: utcMeta.presenter },
      melbourneSundayNoon: { isLive: noon.isLive, program: noon.program },
      melbourneSunday0200: { isLive: night.isLive, program: night.program },
      thursdayBreakfast: { isLive: breakfast.isLive, program: breakfast.program, presenter: breakfast.presenter },
    },
    null,
    2,
  ),
)

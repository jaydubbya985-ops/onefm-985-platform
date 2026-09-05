/**
 * Fail the build if time-of-day chrome invents leftover drive / 5am breakfast.
 * Run: npx vite-node scripts/verify-guide-daypart.ts
 */
import { readFileSync } from 'node:fs'
import { guideDaypart } from '../src/lib/guideDaypart'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-guide-daypart FAIL: ${message}`)
    process.exit(1)
  }
}

// Thursday 3 Sep 2026 08:13 AEST — ONE FM Breakfast (Ralph).
const thuBreakfast = new Date('2026-09-03T08:13:00+10:00')
assert(guideDaypart(thuBreakfast) === 'breakfast', `Thu 08:13 must be breakfast, got ${guideDaypart(thuBreakfast)}`)

// Friday 5:30 is Overnight Mix — leftover clock called this breakfast (h < 9).
const friOvernight = new Date('2026-09-04T05:30:00+10:00')
assert(guideDaypart(friOvernight) === 'night', `Fri 05:30 must be night, got ${guideDaypart(friOvernight)}`)

// Saturday 7:10 is Songs of the Spirit — leftover clock called this breakfast.
const satSpirit = new Date('2026-09-05T07:10:00+10:00')
assert(guideDaypart(satSpirit) === 'default', `Sat 07:10 must be default (Songs of the Spirit), got ${guideDaypart(satSpirit)}`)

// Saturday 14:10 GVL — leftover clock called this drive (h >= 18 is the other leftover; 14:00 was midday).
const satGvl = new Date('2026-09-05T14:10:00+10:00')
assert(guideDaypart(satGvl) === 'default', `Sat 14:10 GVL must be default, not leftover midday/drive, got ${guideDaypart(satGvl)}`)

// Saturday 19:00 falls to Overnight Mix — leftover clock called this drive.
const satEve = new Date('2026-09-05T19:00:00+10:00')
assert(guideDaypart(satEve) === 'night', `Sat 19:00 must be night (Overnight Mix fallthrough), got ${guideDaypart(satEve)}`)

// Sunday 02:00 overnight.
const overnight = new Date('2026-09-06T02:00:00+10:00')
assert(guideDaypart(overnight) === 'night', `Sun 02:00 must be night, got ${guideDaypart(overnight)}`)

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert(app.includes('guideDaypart'), 'App.tsx TimeOfDayTheme must call guideDaypart()')
assert(!/return 'drive'/.test(app), 'App.tsx must not invent leftover drive')
assert(!/return 'midday'/.test(app), 'App.tsx must not invent leftover midday')
assert(!/h < 5/.test(app) && !/h < 9/.test(app), 'App.tsx must not use leftover 5am/9am hour buckets')

console.log('verify-guide-daypart OK')

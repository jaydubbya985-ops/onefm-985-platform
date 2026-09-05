/**
 * Lock: Football match-day OB still names GVL Match of the Day on the weekly guide —
 * not leftover invented every-match-day coverage.
 * Run: npx vite-node scripts/verify-footy-not-every-match.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

if (/every match day/i.test(src)) {
  throw new Error('Football.tsx: leftover every match day is back')
}

if (
  !src.includes(
    'Station archive OB — ${GVL_MATCH_SLOT.name} · ${GVL_MATCH_SLOT.days} ${GVL_MATCH_SLOT.time}',
  )
) {
  throw new Error(
    'Football.tsx: match-day OB still must name GVL_MATCH_SLOT from the weekly guide',
  )
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('ONE FM celebrates every premiership moment')) {
  throw new Error('Football.tsx: leftover every premiership moment must stay')
}
if (!src.includes('GVL — where footy means everything')) {
  throw new Error('Football.tsx: leftover everything must stay for #494')
}
if (!src.includes('The broadcast team — live from the box')) {
  throw new Error('Football.tsx: leftover broadcast team / live from the box must stay')
}
if (!src.includes('Ready for kick-off — the broadcaster')) {
  throw new Error('Football.tsx: leftover Ready for kick-off must stay')
}

console.log(
  'verify-footy-not-every-match: Football OB still names GVL Match of the Day, not leftover every match day.',
)

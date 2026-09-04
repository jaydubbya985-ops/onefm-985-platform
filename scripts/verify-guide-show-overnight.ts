/**
 * Lock: weekly grid lists Overnight Mix from FULL_SCHEDULE, not leftover off-air.
 * Run: npx vite-node scripts/verify-guide-show-overnight.ts
 */
import { readFileSync } from 'node:fs'
import { FULL_SCHEDULE } from '../src/data/programGuide'

const src = readFileSync(new URL('../src/components/WeeklySchedule.tsx', import.meta.url), 'utf8')

if (/s\.name !== 'Overnight Mix'/.test(src) || /name !== "Overnight Mix"/.test(src)) {
  throw new Error('WeeklySchedule.tsx: leftover filter hides Overnight Mix again')
}
if (!src.includes('FULL_SCHEDULE.filter((s) => s.day === day)') && !src.includes('FULL_SCHEDULE.filter(s => s.day === day)')) {
  throw new Error('WeeklySchedule.tsx: slotsForDay must list every FULL_SCHEDULE row for the day')
}
if (!src.includes("slot.host === 'Automated'") || !src.includes('Automated overnight')) {
  throw new Error('WeeklySchedule.tsx: automated overnight must name Automated overnight, not with Automated')
}

const overnight = FULL_SCHEDULE.filter((s) => s.name === 'Overnight Mix')
if (overnight.length === 0) {
  throw new Error('programGuide.ts: Overnight Mix slots missing — this desk does not own the guide')
}

console.log('verify-guide-show-overnight: ok')

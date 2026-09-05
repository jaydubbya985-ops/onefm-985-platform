/**
 * Week-at-a-glance on the weekly guide — not leftover day-tabs-only.
 * Does not steal Overnight Mix (#458) or named-host (#286) hunks.
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-week-glance FAIL: ${message}`)
    process.exit(1)
  }
}

const weekly = readFileSync(new URL('../src/components/WeeklySchedule.tsx', import.meta.url), 'utf8')
const programs = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')
const listen = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

assert(weekly.includes('aria-label="Week at a glance"'), 'week-at-a-glance tablist missing')
assert(weekly.includes('role="tablist"'), 'week strip must be a tablist')
assert(weekly.includes("s.name !== 'Overnight Mix'"), 'do not steal #458 Overnight Mix filter')
assert(weekly.includes('with {slot.host}'), 'do not steal #286 host line')
assert(!weekly.includes('useMelbourneClock'), 'do not import useMelbourneClock until #286 EXE')
assert(!weekly.includes('useLiveNow'), 'do not import useLiveNow until #475 EXE')
assert(programs.includes('<WeeklySchedule'), 'Programs must still mount WeeklySchedule')
assert(listen.includes('<WeeklySchedule'), 'Listen must still mount WeeklySchedule')

console.log('verify-week-glance OK')

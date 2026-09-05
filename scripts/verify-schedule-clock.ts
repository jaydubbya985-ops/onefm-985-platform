/**
 * Lock: remaining time ticks from the schedule clock, not only the 60s Radio.co poll.
 * Listen.tsx remaining aria-live stays #475 — this desk only touches usePlayerMetadata.
 * Run: npx vite-node scripts/verify-schedule-clock.ts
 */
import { readFileSync } from 'node:fs'

const hook = readFileSync(new URL('../src/hooks/usePlayerMetadata.ts', import.meta.url), 'utf8')
const listen = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-schedule-clock FAIL: ${message}`)
    process.exit(1)
  }
}

assert(hook.includes('STREAM_REFRESH_MS = 60_000'), 'stream poll must stay 60s')
assert(hook.includes('SCHEDULE_TICK_MS = 15_000'), 'schedule remaining must tick every 15s')
assert(hook.includes('getScheduleMetadata'), 'ticks must re-read the weekly guide')
assert(
  hook.includes('setInterval(tickSchedule, SCHEDULE_TICK_MS)'),
  'schedule tick must be its own interval',
)
assert(
  hook.includes('setInterval(refreshStream, STREAM_REFRESH_MS)'),
  'Radio.co fetch must stay on the 60s interval',
)
assert(!listen.includes('useLiveNow'), 'do not steal Listen remaining-time desk #475')
assert(!hook.includes('useLiveNow'), 'do not add useLiveNow — that file is #475')

console.log('verify-schedule-clock: remaining time ticks from the guide clock.')

/**
 * Lock: Listen hero remaining time ticks from a live Date, not a frozen mount clock.
 * Run: npx vite-node scripts/verify-listen-tick-remaining.ts
 */
import { readFileSync } from 'node:fs'
import { LIVE_NOW_TICK_MS } from '../src/hooks/useLiveNow'
import { liveNowFromMetadata } from '../src/lib/liveNow'
import { getScheduleMetadata } from '../src/lib/playerMetadata'

function assert(cond: unknown, message: string) {
  if (!cond) {
    throw new Error(`verify-listen-tick-remaining: ${message}`)
  }
}

const hook = readFileSync(new URL('../src/hooks/useLiveNow.ts', import.meta.url), 'utf8')
const listen = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

assert(hook.includes('liveNowFromMetadata(meta, now)'), 'useLiveNow must pass a ticking Date into liveNowFromMetadata')
assert(hook.includes('setInterval'), 'useLiveNow must tick — remaining time cannot wait for Radio.co')
assert(listen.includes('useLiveNow'), 'Listen hero must use useLiveNow so remaining time ticks')
assert(
  listen.includes('aria-live="polite"') && listen.includes('live.remainingLabel'),
  'Listen remaining time must be announced when it ticks',
)
assert(
  LIVE_NOW_TICK_MS > 0 && LIVE_NOW_TICK_MS < 60_000,
  `LIVE_NOW_TICK_MS must be faster than the 60s Radio.co poll (got ${LIVE_NOW_TICK_MS})`,
)

// Thursday 3 Sep 2026 08:13 vs 08:14 AEST — remaining minutes must move.
const thu813 = new Date('2026-09-03T08:13:00+10:00')
const thu814 = new Date('2026-09-03T08:14:00+10:00')
const at813 = liveNowFromMetadata(getScheduleMetadata(thu813), thu813)
const at814 = liveNowFromMetadata(getScheduleMetadata(thu814), thu814)
assert(at813.remainingMinutes === 47, `08:13 remaining: ${at813.remainingMinutes}`)
assert(at814.remainingMinutes === 46, `08:14 remaining: ${at814.remainingMinutes}`)
assert(at813.remainingLabel === '47 min left', `08:13 label: ${at813.remainingLabel}`)
assert(at814.remainingLabel === '46 min left', `08:14 label: ${at814.remainingLabel}`)
assert(at814.elapsedRatio > at813.elapsedRatio, 'elapsed ratio must advance as the clock ticks')

console.log('verify-listen-tick-remaining: Listen remaining time ticks from a live Date.')

/**
 * Fail if the mini-player live dot still pulses when metadata is not live.
 * Run: npx vite-node scripts/verify-mini-not-live-dot.ts
 */
import { readFileSync } from 'node:fs'
import { getCurrentLiveShow } from '../src/data/programGuide.ts'
import { getScheduleMetadata } from '../src/lib/playerMetadata.ts'
import { miniPlayerLiveDot } from '../src/lib/liveNow.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-mini-not-live-dot FAIL: ${message}`)
    process.exit(1)
  }
}

const overnight = new Date('2026-09-06T02:00:00+10:00')
const mix = getCurrentLiveShow(overnight)
assert(mix.name === 'Overnight Mix', `expected Overnight Mix, got ${mix.name}`)
assert(mix.host === 'Automated', `overnight host should be Automated, got ${mix.host}`)

const overnightMeta = getScheduleMetadata(overnight)
assert(overnightMeta.isLive === false, 'Overnight Mix must not invent a live-now flag')
const overnightDot = miniPlayerLiveDot(overnightMeta.isLive)
assert(overnightDot.pulse === false, 'leftover invented live-dot still pulses overnight')
assert(overnightDot.tone === 'schedule', `overnight tone should be schedule, got ${overnightDot.tone}`)

const breakfastAt = new Date('2026-09-03T08:13:00+10:00')
const breakfastMeta = getScheduleMetadata(breakfastAt)
assert(breakfastMeta.program.includes('Breakfast'), `expected breakfast, got ${breakfastMeta.program}`)
assert(breakfastMeta.isLive === true, 'weekday breakfast must be live')
const breakfastDot = miniPlayerLiveDot(breakfastMeta.isLive)
assert(breakfastDot.pulse === true, 'hosted breakfast must pulse')
assert(breakfastDot.tone === 'live', `breakfast tone should be live, got ${breakfastDot.tone}`)

const src = readFileSync(new URL('../src/components/MiniPlayer.tsx', import.meta.url), 'utf8')
assert(src.includes('miniPlayerLiveDot(live.isLive)'), 'MiniPlayer must gate the live dot on live.isLive')
assert(!/animate-pulse-dot[\s\S]{0,80}bg-one-red[\s\S]{0,80}bg-one-red/.test(src.replace(/\n/g, ' ')) || src.includes('liveDot.pulse'), 'MiniPlayer leftover invented live-dot still always pulses')

console.log('verify-mini-not-live-dot: leftover live-dot gone; pulse follows hosted metadata')

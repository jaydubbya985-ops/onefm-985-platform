/**
 * Fail the build if a Radio.co blip wipes a good now-playing line.
 * Run: npx vite-node scripts/verify-stream-hold.ts
 */
import { STREAM_HOLD_MS, holdStreamTrack } from '../src/lib/streamHold'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-stream-hold FAIL: ${message}`)
    process.exit(1)
  }
}

const t0 = 1_000_000
const good = holdStreamTrack({ title: 'The Essential Hits', artist: 'Tim Symonds' }, null, t0)
assert(good?.title === 'The Essential Hits', `first good track: ${good?.title}`)
assert(good?.artist === 'Tim Symonds', `artist: ${good?.artist}`)
assert(good?.at === t0, 'hold timestamp is the successful poll')

const blip = holdStreamTrack(null, good, t0 + 20_000)
assert(blip?.title === 'The Essential Hits', 'a 20s Radio.co blip must not wipe now-playing')
assert(blip?.at === t0, 'blip must not refresh the hold clock')

const emptyPoll = holdStreamTrack({ title: null, artist: null }, good, t0 + 30_000)
assert(emptyPoll?.title === 'The Essential Hits', 'empty title/artist is a blip, not silence')

const stale = holdStreamTrack(null, good, t0 + STREAM_HOLD_MS)
assert(stale === null, 'after 3 minutes with no good poll, drop the hold — do not invent a track')

const never = holdStreamTrack(null, null, t0)
assert(never === null, 'never invent a now-playing line')

const weatherReject = holdStreamTrack({ title: null, artist: null }, null, t0)
assert(weatherReject === null, 'rejected weather/technical IDs stay blank')

const next = holdStreamTrack({ title: 'GVL Match of the Day', artist: null }, good, t0 + 10_000)
assert(next?.title === 'GVL Match of the Day', `new good poll replaces hold: ${next?.title}`)
assert(next?.at === t0 + 10_000, 'new poll refreshes the hold clock')

console.log('verify-stream-hold OK')
console.log(
  JSON.stringify(
    {
      first: good,
      afterBlip: blip,
      afterHoldExpires: stale,
      neverInvented: never,
    },
    null,
    2,
  ),
)

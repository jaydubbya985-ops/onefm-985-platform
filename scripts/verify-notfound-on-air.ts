/**
 * Lock: 404 names the live show and plays the stream. It does not claim the transmitter is down.
 * Run: npx vite-node scripts/verify-notfound-on-air.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/NotFound.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-notfound-on-air FAIL: ${message}`)
    process.exit(1)
  }
}

assert(src.includes('useLiveStream'), 'NotFound must play via useLiveStream')
assert(src.includes('liveNowFromMetadata'), 'NotFound must name the live show from the guide')
assert(src.includes('AUDIO_PLAYER_URL'), 'stream errors must link the fm985.com.au web player')
assert(src.includes('to="/listen"'), 'keep a Full player link to /listen')
assert(!/DEAD AIR/.test(src), '404 must not brand a missing page as dead air')
assert(!/NO SIGNAL/.test(src), '404 must not claim the transmitter has no signal')
assert(!/off the air/i.test(src), '404 must not claim the transmitter is off')
assert(!src.includes('BREAKFAST_TIME'), 'do not print weekday breakfast hours as if they are on now')
assert(src.includes('still on air'), '404 must say 98.5 is still on air')

console.log('verify-notfound-on-air: 404 names the live show and plays the stream.')

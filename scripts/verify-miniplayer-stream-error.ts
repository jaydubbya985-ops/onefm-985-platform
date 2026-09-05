/**
 * Lock: MiniPlayer and Space toast name a failed stream — not leftover silent play.
 * Run: npx vite-node scripts/verify-miniplayer-stream-error.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-miniplayer-stream-error FAIL: ${message}`)
    process.exit(1)
  }
}

const mini = readFileSync(new URL('../src/components/MiniPlayer.tsx', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../src/components/Layout.tsx', import.meta.url), 'utf8')
const hook = readFileSync(new URL('../src/hooks/useLiveStream.ts', import.meta.url), 'utf8')

assert(mini.includes('error'), 'MiniPlayer must read stream error')
assert(mini.includes('AUDIO_PLAYER_URL'), 'MiniPlayer must link the fm985.com.au web player')
assert(mini.includes('role="alert"'), 'MiniPlayer error must be announced')
assert(mini.includes('Open the fm985.com.au web player'), 'MiniPlayer must name the live-site player')

assert(layout.includes("'error'"), 'Space toast must have a failed-stream state')
assert(layout.includes('Stream unavailable'), 'Space toast must not claim Playing when the stream fails')
assert(layout.includes('await toggle()'), 'Space must wait for play() before toasting')
assert(!/const next = playing \? 'paused' : 'playing'/.test(layout), 'Space toast must not guess Playing before play() settles')

assert(hook.includes('StreamToggleResult'), 'toggle must return play vs error')
assert(hook.includes('return { playing: false, error }'), 'blocked play must return the error')

console.log('verify-miniplayer-stream-error: MiniPlayer and Space toast name a failed stream.')

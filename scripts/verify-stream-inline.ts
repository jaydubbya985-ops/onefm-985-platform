/**
 * Radio.co Audio() must be playsinline — not a Safari takeover player.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { AUDIO_PLAYER_URL, STREAM_AUDIO_MARK, STREAM_URL } from '../src/lib/streamConfig.ts'

const src = readFileSync(new URL('../src/lib/streamConfig.ts', import.meta.url), 'utf8')

assert.match(src, /playsinline/)
assert.match(src, /webkit-playsinline/)
assert.match(src, /installInlineStreamAudio/)
assert.match(src, /data-onefm-stream/)
assert.doesNotMatch(src, /el\.crossOrigin/)
assert.doesNotMatch(src, /24\/7/)
assert.match(STREAM_URL, /radio\.co/)
assert.match(AUDIO_PLAYER_URL, /fm985\.com\.au\/audio-player/)
assert.equal(STREAM_AUDIO_MARK, 'radio.co')

console.log('verify-stream-inline: ok')

/**
 * Fail the build if stream play() errors invent "blocked" for a pause or a dead stream.
 * Run: npx vite-node scripts/verify-stream-errors.ts
 */
import { AUDIO_PLAYER_URL } from '../src/lib/streamConfig'
import {
  PLAYBACK_BLOCKED,
  STREAM_UNAVAILABLE,
  classifyMediaError,
  classifyPlayFailure,
  isPlayAbort,
  isPlayBlocked,
} from '../src/lib/streamErrors'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-stream-errors FAIL: ${message}`)
    process.exit(1)
  }
}

const abort = { name: 'AbortError', message: 'The play() request was interrupted' }
const blocked = { name: 'NotAllowedError', message: 'play() failed because the user did not interact' }
const network = { name: 'NotSupportedError', message: 'Failed to load because no supported source was found' }

assert(isPlayAbort(abort) === true, 'AbortError from a quick pause is not a failure')
assert(isPlayBlocked(abort) === false, 'AbortError is not an autoplay block')
assert(classifyPlayFailure(abort) === null, 'quick pause must not toast Playback blocked')

assert(isPlayBlocked(blocked) === true, 'NotAllowedError is autoplay policy')
assert(classifyPlayFailure(blocked) === PLAYBACK_BLOCKED, 'autoplay must stay a blocked message')
assert(!PLAYBACK_BLOCKED.toLowerCase().includes('unavailable'), 'blocked must not pretend the stream is down')

assert(classifyPlayFailure(network) === STREAM_UNAVAILABLE, 'unsupported source is a dead stream, not blocked')
assert(classifyPlayFailure(new Error('fetch failed')) === STREAM_UNAVAILABLE, 'generic play failure is unavailable')

assert(STREAM_UNAVAILABLE.includes('fm985.com.au'), `web player host missing: ${STREAM_UNAVAILABLE}`)
assert(AUDIO_PLAYER_URL.includes('fm985.com.au/audio-player'), `AUDIO_PLAYER_URL: ${AUDIO_PLAYER_URL}`)

assert(classifyMediaError(2) === STREAM_UNAVAILABLE, 'MEDIA_ERR_NETWORK')
assert(classifyMediaError(4) === STREAM_UNAVAILABLE, 'MEDIA_ERR_SRC_NOT_SUPPORTED')
assert(classifyMediaError(undefined) === STREAM_UNAVAILABLE, 'unknown media error')

console.log('verify-stream-errors OK')
console.log(
  JSON.stringify(
    {
      abort: classifyPlayFailure(abort),
      blocked: classifyPlayFailure(blocked),
      network: classifyPlayFailure(network),
      streamUnavailable: STREAM_UNAVAILABLE,
    },
    null,
    2,
  ),
)

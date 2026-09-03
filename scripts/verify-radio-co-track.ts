/**
 * Fail if Radio.co station ident / weather / technical IDs pass as now-playing.
 * Run: npx vite-node scripts/verify-radio-co-track.ts
 */
import { isUsableNowPlayingTitle } from '../src/lib/radioCoTrack.ts'
import { fetchStreamMetadata } from '../src/lib/playerMetadata.ts'
import { STREAM_STATUS_URL } from '../src/lib/streamConfig.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-radio-co-track FAIL: ${message}`)
    process.exit(1)
  }
}

assert(isUsableNowPlayingTitle('ONE FM 98.5') === false, 'station ident is not a song')
assert(isUsableNowPlayingTitle('ONE FM') === false, 'short ident is not a song')
assert(isUsableNowPlayingTitle('98.5 One FM') === false, 'reversed ident is not a song')
assert(isUsableNowPlayingTitle('3ONE') === false, 'callsign is not a song')
assert(isUsableNowPlayingTitle('  one   fm   98.5  ') === false, 'padded ident is not a song')
assert(isUsableNowPlayingTitle('SHE60C@BB9') === false, 'technical id is not a song')
assert(
  isUsableNowPlayingTitle('Forecast - Showers 17c  Tomorrow: Partly Cloudy 17c') === false,
  'weather bumper is not a song',
)
assert(isUsableNowPlayingTitle(null) === false, 'empty title is not a song')
assert(isUsableNowPlayingTitle('') === false, 'blank title is not a song')

assert(
  isUsableNowPlayingTitle('Cold Chisel - Khe Sanh') === true,
  'artist-title song must stay usable',
)
assert(
  isUsableNowPlayingTitle('The Teskey Brothers') === true,
  'local artist name without a dash is still a title',
)

const live = await fetch(STREAM_STATUS_URL)
assert(live.ok, `Radio.co status HTTP ${live.status}`)
const payload = (await live.json()) as { current_track?: { title?: string } }
const parked = payload.current_track?.title ?? ''
if (parked) {
  const usable = isUsableNowPlayingTitle(parked)
  if (/^one\s*fm/i.test(parked) || /^forecast/i.test(parked)) {
    assert(usable === false, `live Radio.co title "${parked}" must not pass as now-playing`)
  }
  console.log(`live Radio.co current_track: ${JSON.stringify(parked)} usable=${usable}`)
}

const fetched = await fetchStreamMetadata()
if (fetched?.title) {
  assert(
    isUsableNowPlayingTitle(fetched.title) === true,
    `fetchStreamMetadata returned unusable title ${fetched.title}`,
  )
  assert(
    !/^one\s*fm(\s*98\.?5)?$/i.test(fetched.title),
    `fetchStreamMetadata must not return the station ident (${fetched.title})`,
  )
}
console.log(
  fetched
    ? `fetchStreamMetadata title=${JSON.stringify(fetched.title)} artist=${JSON.stringify(fetched.artist)}`
    : 'fetchStreamMetadata: null (no usable track — honest)',
)

console.log('verify-radio-co-track OK')

/**
 * Fail the build if live-now labels invent a host or drop remaining time.
 * Run: npx vite-node scripts/verify-on-air.ts
 */
import { getCurrentLiveShow, getWeekdayBreakfastHost, getMelbourneWeekday } from '../src/data/programGuide'
import { formatWithPresenter, liveNowFromMetadata } from '../src/lib/liveNow'
import {
  buildMediaSessionPayload,
  mediaSessionFromNow,
  mediaSessionPosition,
  playingDocumentTitle,
} from '../src/lib/mediaSession'
import { getScheduleMetadata, isUsableNowPlaying } from '../src/lib/playerMetadata'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-on-air FAIL: ${message}`)
    process.exit(1)
  }
}

assert(formatWithPresenter('') === null, 'blank presenter must not print "with"')
assert(formatWithPresenter('   ') === null, 'whitespace presenter must not print "with"')
assert(formatWithPresenter('ONE FM') === null, 'generic ONE FM host is not a named presenter')
assert(formatWithPresenter('Automated') === null, 'Automated is not a named presenter')
assert(formatWithPresenter('Tim Ahemt') === 'with Tim Ahemt', 'named host must print with-line')
assert(formatWithPresenter('The Big G (Craig Stott)') === 'with The Big G (Craig Stott)', 'Wednesday breakfast host')

// Thursday 3 Sep 2026 08:13 AEST — ONE FM Breakfast with Ralph Whitehead, 47 min left.
const thuBreakfast = new Date('2026-09-03T08:13:00+10:00')
const breakfastShow = getCurrentLiveShow(thuBreakfast)
assert(breakfastShow.name.includes('Breakfast'), `expected breakfast, got ${breakfastShow.name}`)
assert(breakfastShow.host === 'Ralph Whitehead', `Thursday 08:13 host should be Ralph Whitehead, got ${breakfastShow.host}`)
assert(breakfastShow.remainingMinutes === 47, `expected 47 min left at 8:13, got ${breakfastShow.remainingMinutes}`)
assert(breakfastShow.remainingLabel === '47 min left', `remaining label: ${breakfastShow.remainingLabel}`)
assert(getMelbourneWeekday(thuBreakfast) === 4, `Melbourne weekday for Thu 3 Sep 2026 should be 4, got ${getMelbourneWeekday(thuBreakfast)}`)
assert(getWeekdayBreakfastHost(4) === 'Ralph Whitehead', 'Thursday breakfast is Ralph Whitehead')

const meta = getScheduleMetadata(thuBreakfast)
const live = liveNowFromMetadata(meta, thuBreakfast)
assert(live.program.includes('Breakfast'), `liveNow program: ${live.program}`)
assert(live.withLine === 'with Ralph Whitehead', `liveNow withLine: ${live.withLine}`)
assert(live.remainingMinutes === 47, `liveNow remaining: ${live.remainingMinutes}`)
assert(live.breakfastOnAir === true, 'breakfast must be flagged on air at 08:13 Melbourne Thursday')
assert(live.slotMinutes === 180, `breakfast slot minutes: ${live.slotMinutes}`)
assert(live.elapsedMinutes === 133, `breakfast elapsed at 08:13: ${live.elapsedMinutes}`)

// Saturday GVL window — 3 Oct 2026 is a Saturday; use a known Saturday.
const satFooty = new Date('2026-09-05T14:10:00+10:00')
const gvl = getCurrentLiveShow(satFooty)
assert(/GVL|Match/i.test(gvl.name), `Saturday 14:10 should be GVL Match of the Day, got ${gvl.name}`)
assert(gvl.remainingMinutes > 0, 'GVL remaining must be positive during the slot')
assert(formatWithPresenter(gvl.host) === null, 'GVL schedule host is ONE FM — do not print a with-line')

// Overnight — Sunday 02:00 Melbourne
const overnight = new Date('2026-09-06T02:00:00+10:00')
const mix = getCurrentLiveShow(overnight)
assert(mix.name === 'Overnight Mix', `expected Overnight Mix, got ${mix.name}`)
assert(formatWithPresenter(mix.host) === null, 'overnight must not print with Automated')
assert(mix.remainingMinutes === 240, `overnight 02:00 should have 4 hr left, got ${mix.remainingMinutes}`)

const ORIGIN = 'https://onefmops.netlify.app'
const lockBreakfast = mediaSessionFromNow(meta, ORIGIN, thuBreakfast)
assert(lockBreakfast.payload.title.includes('Breakfast'), `lock title: ${lockBreakfast.payload.title}`)
assert(lockBreakfast.payload.artist === 'Ralph Whitehead', `lock artist must be Ralph, got ${lockBreakfast.payload.artist}`)
assert(!/with ONE FM|with Automated/i.test(lockBreakfast.payload.album), `lock album leaked generic host: ${lockBreakfast.payload.album}`)
assert(lockBreakfast.payload.album.includes('47 min left'), `lock album remaining: ${lockBreakfast.payload.album}`)
assert(lockBreakfast.payload.artwork.some((a) => a.src.endsWith('/brand/icon-512.png')), 'lock artwork must include official 512 mark')
assert(lockBreakfast.payload.artwork.every((a) => a.src.startsWith(ORIGIN)), 'lock artwork must be absolute URLs')
assert(lockBreakfast.position?.duration === 180 * 60, `breakfast slot duration: ${lockBreakfast.position?.duration}`)
assert(lockBreakfast.position?.position === 133 * 60, `breakfast elapsed at 08:13: ${lockBreakfast.position?.position}`)
assert(
  playingDocumentTitle(lockBreakfast.live).includes('Breakfast') && playingDocumentTitle(lockBreakfast.live).includes('ONE FM 98.5'),
  `tab title: ${playingDocumentTitle(lockBreakfast.live)}`,
)

const lockGvl = mediaSessionFromNow(getScheduleMetadata(satFooty), ORIGIN, satFooty)
assert(/GVL|Match/i.test(lockGvl.payload.title), `GVL lock title: ${lockGvl.payload.title}`)
assert(lockGvl.payload.artist === 'ONE FM 98.5', `GVL schedule host is ONE FM — lock artist is the station, got ${lockGvl.payload.artist}`)

const lockNight = mediaSessionFromNow(getScheduleMetadata(overnight), ORIGIN, overnight)
assert(lockNight.payload.title === 'Overnight Mix', `overnight lock title: ${lockNight.payload.title}`)
assert(lockNight.payload.artist === 'ONE FM 98.5', `overnight must not credit Automated, got ${lockNight.payload.artist}`)

const trackMeta = {
  ...meta,
  nowPlaying: 'Solid Rock',
  title: 'Solid Rock',
  artist: 'Goanna',
  source: 'stream' as const,
  sourceLabel: 'Stream metadata',
}
const lockTrack = buildMediaSessionPayload(live, trackMeta, ORIGIN)
assert(lockTrack.title === 'Solid Rock', `stream title: ${lockTrack.title}`)
assert(lockTrack.artist === 'Goanna', `stream artist: ${lockTrack.artist}`)
assert(lockTrack.album.includes('Breakfast'), `stream album is the guide show: ${lockTrack.album}`)

assert(isUsableNowPlaying('ONE FM 98.5') === false, 'station ident is not a track')
assert(isUsableNowPlaying('ONE FM') === false, 'ONE FM alone is not a track')
assert(isUsableNowPlaying('Solid Rock') === true, 'a real title is a track')
const identMeta = {
  ...meta,
  nowPlaying: 'ONE FM 98.5',
  title: 'ONE FM 98.5',
  artist: null,
  source: 'stream' as const,
  sourceLabel: 'Stream metadata',
}
const lockIdent = buildMediaSessionPayload(live, identMeta, ORIGIN)
assert(lockIdent.title.includes('Breakfast'), `station ident must not replace the show, got ${lockIdent.title}`)
assert(lockIdent.artist === 'Ralph Whitehead', `ident fallback artist: ${lockIdent.artist}`)

const pos = mediaSessionPosition(live)
assert(pos !== null && pos.playbackRate === 1, 'position state must be rate 1')

console.log('verify-on-air OK')

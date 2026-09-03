/**
 * Fail if the on-air wall still cycles an unlabeled host face.
 * /studio-control-room.jpg is the same bytes as /on-air-host-1.jpg.
 * Run: npx vite-node scripts/verify-backdrop-no-unlabeled-face.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { HOST_PHOTOS, STATION_PHOTOS } from '../src/lib/stationPhotos.ts'
import {
  NAMED_PORTRAITS,
  ON_AIR_WALL_BACKDROPS,
  presenterBackdrop,
  presenterPortrait,
  presenterVisual,
} from '../src/lib/presenterAssets.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-backdrop-no-unlabeled-face FAIL: ${message}`)
    process.exit(1)
  }
}

function publicFile(url: string): string {
  return resolve('public', url.replace(/^\//, ''))
}

function md5(url: string): string {
  return createHash('md5').update(readFileSync(publicFile(url))).digest('hex')
}

assert(
  Object.keys(NAMED_PORTRAITS).join('|') === 'Di Hunter|Sally Nayler',
  `named portraits drifted: ${Object.keys(NAMED_PORTRAITS).join(', ')}`,
)
assert(presenterPortrait('Di Hunter'), 'Di Hunter must stay a named portrait')
assert(presenterPortrait('Sally Nayler'), 'Sally Nayler must stay a named portrait')

const unlabeled = HOST_PHOTOS.onAirHost1
const unlabeledDup = HOST_PHOTOS.studioControlRoom
assert(md5(unlabeled) === md5(unlabeledDup), 'expected studio-control-room.jpg to still be the unlabeled-host duplicate')
assert(
  !ON_AIR_WALL_BACKDROPS.includes(unlabeled) && !ON_AIR_WALL_BACKDROPS.includes(unlabeledDup),
  'on-air wall still cycles the unlabeled host face or its studio-control-room duplicate',
)
assert(
  ON_AIR_WALL_BACKDROPS.every((src) => !src.includes('on-air-host') && src !== unlabeledDup),
  'on-air wall must not include on-air-host-*.jpg or studio-control-room.jpg',
)

const unlabeledHash = md5(unlabeled)
for (const src of ON_AIR_WALL_BACKDROPS) {
  assert(md5(src) !== unlabeledHash, `backdrop ${src} is the same file as the unlabeled host`)
}

assert(
  presenterBackdrop('Tim Ahemt', 0) === STATION_PHOTOS.obVanBranded,
  `Tim Ahemt index 0 must be the branded OB van, got ${presenterBackdrop('Tim Ahemt', 0)}`,
)

for (const host of ['Tim Ahemt', 'Josh Revens', 'Ralph Whitehead', 'The Big G']) {
  assert(presenterPortrait(host) === null, `${host} must not invent a named portrait`)
  assert(
    presenterBackdrop(host, 0) !== unlabeled && presenterBackdrop(host, 0) !== unlabeledDup,
    `${host} index 0 must not be the unlabeled host face`,
  )
  const visual = presenterVisual(host)
  assert(visual.isPortrait === false, `${host} visual must not claim a portrait`)
  assert(visual.src !== unlabeled && visual.src !== unlabeledDup, `${host} visual must not use the unlabeled face`)
  assert(/not a portrait/i.test(visual.alt), `${host} alt must say it is not a portrait`)
}

console.log({
  named: Object.keys(NAMED_PORTRAITS),
  backdrops: ON_AIR_WALL_BACKDROPS,
  tim: presenterVisual('Tim Ahemt'),
  unlabeledDuplicate: unlabeledDup,
})
console.log('verify-backdrop-no-unlabeled-face OK')

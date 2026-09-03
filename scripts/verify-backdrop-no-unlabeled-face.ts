/**
 * Fail if the on-air wall still cycles an unlabeled host face.
 * Run: npx vite-node scripts/verify-backdrop-no-unlabeled-face.ts
 */
import { HOST_PHOTOS } from '../src/lib/stationPhotos.ts'
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

assert(
  Object.keys(NAMED_PORTRAITS).join('|') === 'Di Hunter|Sally Nayler',
  `named portraits drifted: ${Object.keys(NAMED_PORTRAITS).join(', ')}`,
)
assert(presenterPortrait('Di Hunter'), 'Di Hunter must stay a named portrait')
assert(presenterPortrait('Sally Nayler'), 'Sally Nayler must stay a named portrait')

const unlabeled = HOST_PHOTOS.onAirHost1
assert(
  !ON_AIR_WALL_BACKDROPS.includes(unlabeled),
  `on-air wall still cycles unlabeled face ${unlabeled}`,
)
assert(
  ON_AIR_WALL_BACKDROPS.every((src) => !src.includes('on-air-host')),
  'on-air wall must not include on-air-host-*.jpg',
)

for (const host of ['Tim Ahemt', 'Josh Revens', 'Ralph Whitehead', 'The Big G']) {
  assert(presenterPortrait(host) === null, `${host} must not invent a named portrait`)
  assert(
    presenterBackdrop(host, 0) !== unlabeled,
    `${host} index 0 must not be the unlabeled host face`,
  )
  const visual = presenterVisual(host)
  assert(visual.isPortrait === false, `${host} visual must not claim a portrait`)
  assert(visual.src !== unlabeled, `${host} visual must not use ${unlabeled}`)
  assert(/not a portrait/i.test(visual.alt), `${host} alt must say it is not a portrait`)
}

console.log({
  named: Object.keys(NAMED_PORTRAITS),
  backdrops: ON_AIR_WALL_BACKDROPS,
  tim: presenterVisual('Tim Ahemt'),
})
console.log('verify-backdrop-no-unlabeled-face OK')

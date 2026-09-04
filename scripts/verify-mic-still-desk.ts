/**
 * Heritage gallery slide 01, Social Facebook highlight, and presenter
 * backdrops all load /assets/images/studio-presenter-mic.jpg.
 * That file used to be two unlabeled hosts in a booth. It must stay the
 * commentary-box stats board — live work, no leftover face as “the presenters”.
 *
 * Run: node --experimental-strip-types scripts/verify-mic-still-desk.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

const micJpg = 'public/assets/images/studio-presenter-mic.jpg'
const micWebp = 'public/assets/images/studio-presenter-mic.webp'
const deskJpg = 'public/assets/images/commentary-box-view.jpg'
const deskWebp = 'public/assets/images/commentary-box-view.webp'

assert(sha256(micJpg) === sha256(deskJpg), 'studio-presenter-mic.jpg must be the commentary-box stats board, not unlabeled hosts')
assert(sha256(micWebp) === sha256(deskWebp), 'studio-presenter-mic.webp must match commentary-box-view.webp')
assert(readFileSync(micJpg).length > 100_000, 'desk still is a full commentary-box frame, not the leftover 57KB face crop')

const gallery = readFileSync('src/components/HorizontalGallery.tsx', 'utf8')
assert(
  gallery.includes("img: '/assets/images/studio-presenter-mic.jpg'"),
  'Heritage gallery slide 01 must keep loading studio-presenter-mic.jpg (the desk bytes)',
)

const social = readFileSync('src/pages/SocialHub.tsx', 'utf8')
assert(
  social.includes("image: '/assets/images/studio-presenter-mic.jpg'"),
  'Social Facebook highlight must keep loading studio-presenter-mic.jpg (the desk bytes)',
)

const photos = readFileSync('src/lib/stationPhotos.ts', 'utf8')
assert(
  photos.includes('studioPresenterMic: `${IMG}/studio-presenter-mic.jpg`'),
  'stationPhotos.studioPresenterMic must keep the same public path',
)

if (fail.length) {
  for (const msg of fail) console.error(`verify-mic-still-desk FAIL: ${msg}`)
  process.exit(1)
}

console.log('verify-mic-still-desk OK')

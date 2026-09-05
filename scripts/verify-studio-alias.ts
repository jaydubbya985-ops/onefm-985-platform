/**
 * Fail if HOST_PHOTOS.studioControlRoom still aliases the unlabeled host face.
 * /public/studio-control-room.jpg is a byte-duplicate of /on-air-host-1.jpg.
 * Run: npx vite-node scripts/verify-studio-alias.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { HOST_PHOTOS, PHOTO_DEFAULTS, STATION_PHOTOS } from '../src/lib/stationPhotos'

const UNLABELED_HOST = '2b1293e956ba40f2deacee6d18f407fc'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-studio-alias FAIL: ${message}`)
    process.exit(1)
  }
}

function publicMd5(webPath: string): string {
  const rel = webPath.startsWith('/') ? webPath.slice(1) : webPath
  const bytes = readFileSync(resolve('public', rel))
  return createHash('md5').update(bytes).digest('hex')
}

assert(
  HOST_PHOTOS.studioControlRoom !== '/studio-control-room.jpg',
  'studioControlRoom must not point at the unlabeled-host duplicate file',
)
assert(
  HOST_PHOTOS.studioControlRoom !== '/on-air-host-1.jpg',
  'studioControlRoom must not point at the unlabeled host portrait',
)
assert(
  HOST_PHOTOS.studioControlRoom === STATION_PHOTOS.obVanBranded,
  `studioControlRoom should be the branded OB van, got ${HOST_PHOTOS.studioControlRoom}`,
)
assert(
  PHOTO_DEFAULTS.studio === HOST_PHOTOS.studioControlRoom,
  'PHOTO_DEFAULTS.studio must follow the studioControlRoom alias',
)
assert(
  publicMd5(HOST_PHOTOS.studioControlRoom) !== UNLABELED_HOST,
  'studioControlRoom file must not be the unlabeled-host bytes',
)
assert(
  publicMd5('/studio-control-room.jpg') === UNLABELED_HOST,
  'keep the leftover file documented — Community.tsx still hardcodes the path',
)
assert(
  publicMd5('/on-air-host-1.jpg') === UNLABELED_HOST,
  'on-air-host-1.jpg remains the unlabeled host still',
)

console.log('verify-studio-alias OK')

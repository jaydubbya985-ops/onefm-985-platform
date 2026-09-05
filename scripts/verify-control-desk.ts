/**
 * studio-control-room.jpg must be the Solidyne desk — not the unlabeled host.
 * Run: npx vite-node scripts/verify-control-desk.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

/** Byte-identical unlabeled presenter (headphones) that used to live at this path. */
const UNLABELED_HOST_MD5 = '2b1293e956ba40f2deacee6d18f407fc'
/** #353 Listen-tile crop (desk + KDL ladder) — this file must stay a different crop. */
const LISTEN_TILE_DESK_MD5 = '079370861afca532036470535aca1c9f'

function md5(rel: string): string {
  return createHash('md5').update(readFileSync(new URL(`../${rel}`, import.meta.url))).digest('hex')
}

function fail(message: string): never {
  console.error(`verify-control-desk FAIL: ${message}`)
  process.exit(1)
}

const jpg = readFileSync(new URL('../public/studio-control-room.jpg', import.meta.url))
if (jpg[0] !== 0xff || jpg[1] !== 0xd8) {
  fail('public/studio-control-room.jpg must stay a JPEG')
}

const webp = readFileSync(new URL('../public/studio-control-room.webp', import.meta.url))
if (webp[0] !== 0x52 || webp[1] !== 0x49 || webp[2] !== 0x46 || webp[3] !== 0x46) {
  fail('public/studio-control-room.webp must stay a RIFF/WebP')
}

const studio = md5('public/studio-control-room.jpg')
if (studio === UNLABELED_HOST_MD5) {
  fail('public/studio-control-room.jpg is still the unlabeled-host original')
}
if (studio === LISTEN_TILE_DESK_MD5) {
  fail('public/studio-control-room.jpg must not reuse the #353 Listen-tile crop')
}

console.log(JSON.stringify({ ok: true, studio, differsFromHost: true, differsFromListenTile: true }))

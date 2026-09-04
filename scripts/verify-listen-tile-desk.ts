/**
 * Listen menu tile must not be the unlabeled-host studio duplicate.
 * Run: npx vite-node scripts/verify-listen-tile-desk.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

function md5(rel: string): string {
  return createHash('md5').update(readFileSync(new URL(`../${rel}`, import.meta.url))).digest('hex')
}

function fail(message: string): never {
  console.error(`verify-listen-tile-desk FAIL: ${message}`)
  process.exit(1)
}

const tile = md5('public/on-air-host-1.jpg')
const studio = md5('public/studio-control-room.jpg')
if (tile === studio) {
  fail('public/on-air-host-1.jpg is still a byte-identical unlabeled-host duplicate of studio-control-room.jpg')
}

const jpg = readFileSync(new URL('../public/on-air-host-1.jpg', import.meta.url))
if (jpg[0] !== 0xff || jpg[1] !== 0xd8) {
  fail('public/on-air-host-1.jpg must stay a JPEG')
}

console.log(JSON.stringify({ ok: true, tile, studioDiffer: tile !== studio }))

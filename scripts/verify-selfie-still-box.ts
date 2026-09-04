/**
 * The leftover unlabeled five-person selfie must not sit on Social / Heritage
 * / on-air-wall paths. studio-commentary-selfie.{jpg,webp} is the commentary
 * box wide still (camera over the oval) — not unnamed hosts.
 * Run: npx vite-node scripts/verify-selfie-still-box.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function sha256(rel: string): string {
  return createHash('sha256').update(readFileSync(resolve(rel))).digest('hex')
}

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-selfie-still-box FAIL: ${message}`)
    process.exit(1)
  }
}

const selfieJpg = sha256('public/assets/images/studio-commentary-selfie.jpg')
const selfieWebp = sha256('public/assets/images/studio-commentary-selfie.webp')
const boxJpg = sha256('public/assets/images/commentary-box-wide.jpg')
const boxWebp = sha256('public/assets/images/commentary-box-wide.webp')
const micJpg = sha256('public/assets/images/studio-presenter-mic.jpg')

assert(selfieJpg === boxJpg, 'selfie jpg must be byte-identical to commentary-box-wide.jpg')
assert(selfieWebp === boxWebp, 'selfie webp must be byte-identical to commentary-box-wide.webp')
assert(selfieJpg !== micJpg, 'do not restack the #374 mic/stats-board still')
assert(selfieJpg.startsWith('68cfe0ffa3b09ef2'), `unexpected selfie jpg sha ${selfieJpg.slice(0, 16)}`)

const social = readFileSync(resolve('src/pages/SocialHub.tsx'), 'utf8')
assert(
  social.includes("image: '/assets/images/studio-commentary-selfie.jpg'"),
  'Social feed still loads the selfie path — bytes changed, path stays',
)

console.log('verify-selfie-still-box OK — unlabeled crew selfie is the commentary box wide still')

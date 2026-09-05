/**
 * Football / Media Kit leftover team selfie must not dress unlabeled people
 * as “the broadcast team”. commentary-team-selfie.{jpg,webp} is the existing
 * commentary-box-action still (camera on the roof over the oval).
 * Different leftover file from #374 (mic/stats board) and #380 (selfie/wide).
 * Run: npx vite-node scripts/verify-team-selfie-box.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function sha256(rel: string): string {
  return createHash('sha256').update(readFileSync(resolve(rel))).digest('hex')
}

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-team-selfie-box FAIL: ${message}`)
    process.exit(1)
  }
}

const teamJpg = sha256('public/assets/images/commentary-team-selfie.jpg')
const teamWebp = sha256('public/assets/images/commentary-team-selfie.webp')
const actionJpg = sha256('public/assets/images/commentary-box-action.jpg')
const actionWebp = sha256('public/assets/images/commentary-box-action.webp')
const wideJpg = sha256('public/assets/images/commentary-box-wide.jpg')
const viewJpg = sha256('public/assets/images/commentary-box-view.jpg')

assert(teamJpg === actionJpg, 'team selfie jpg must be byte-identical to commentary-box-action.jpg')
assert(teamWebp === actionWebp, 'team selfie webp must be byte-identical to commentary-box-action.webp')
assert(teamJpg !== wideJpg, 'do not restack the #380 wide still')
assert(teamJpg !== viewJpg, 'do not restack the #374 stats-board still')
assert(teamJpg.startsWith('f7c4779f83a3a558'), `unexpected team selfie jpg sha ${teamJpg.slice(0, 16)}`)

const football = readFileSync(resolve('src/pages/Football.tsx'), 'utf8')
assert(
  football.includes('commentaryTeamSelfie'),
  'Football match-day strip still loads commentaryTeamSelfie — bytes changed, path stays',
)
const kit = readFileSync(resolve('src/pages/MediaKit.tsx'), 'utf8')
assert(
  kit.includes('commentaryTeamSelfie'),
  'Media Kit still loads commentaryTeamSelfie — bytes changed, path stays',
)

console.log('verify-team-selfie-box OK — unlabeled team selfie is the commentary box action still')

/**
 * Social Hub leftover invented a live morning with unlabeled crew.
 * Gov-truth forbids leftover live-now and unlabeled-face captions.
 * The still stays studio-commentary-selfie (station archive).
 *
 * Run: npx vite-node scripts/verify-hub-not-crew.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/crew in the box/i.test(src), 'SocialHub must not invent leftover crew in the box')
assert(!/Great morning with the crew/i.test(src), 'SocialHub must not invent leftover great morning with the crew')
assert(
  !/catch the replay on SoundCloud/i.test(src),
  'SocialHub must not invent leftover SoundCloud replay of that morning',
)
assert(
  src.includes("image: '/assets/images/studio-commentary-selfie.jpg'"),
  'SocialHub still must stay the commentary-box archive file',
)
assert(
  src.includes('Commentary box — station archive'),
  'SocialHub commentary still must name station archive',
)
assert(
  src.includes('Listen on 98.5 FM'),
  'SocialHub commentary still must point at 98.5 FM, not a leftover replay',
)

if (fail.length) {
  console.error('verify-hub-not-crew failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-hub-not-crew: ok')

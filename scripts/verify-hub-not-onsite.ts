/**
 * Social Hub leftover invented a live food-festival remote.
 * Gov-truth forbids leftover live-now. The food-truck still is archive.
 *
 * Run: npx vite-node scripts/verify-hub-not-onsite.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/live on site/i.test(src), 'SocialHub must not invent leftover live-on-site')
assert(!/food festival is on/i.test(src), 'SocialHub must not invent a leftover food festival is on')
assert(
  !/come say g\\?'day/i.test(src),
  'SocialHub must not invent leftover come-say-gday live remote',
)
assert(
  src.includes('Food trucks at a Shepparton community event — station archive'),
  'SocialHub food-truck still must name station archive',
)
assert(
  src.includes('Listen on 98.5 FM'),
  'SocialHub food-truck still must point at 98.5 FM, not a leftover remote',
)

if (fail.length) {
  console.error('verify-hub-not-onsite failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-hub-not-onsite: ok')

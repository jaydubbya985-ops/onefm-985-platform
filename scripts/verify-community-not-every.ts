/**
 * Community coverage card does not invent leftover every GVL club.
 * Run: npx vite-node scripts/verify-community-not-every.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/pages/Community.tsx'), 'utf8')

assert(!/every town, transmitter and GVL club/i.test(page), 'Community must not invent leftover every GVL club')
assert(!/every town/i.test(page), 'Community must not invent leftover every town on the map')
assert(
  page.includes('sourced GVL club pins on the coverage map'),
  'Community must say sourced GVL club pins on the coverage map',
)
assert(page.includes('Open the Map'), 'Coverage map CTA must remain')

if (fail.length) {
  console.error('verify-community-not-every failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-community-not-every: ok')

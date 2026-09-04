/**
 * Broadcast Explorer behind-the-mic stills must not name unlabeled faces.
 * Named portraits: Di Hunter and Sally Nayler only.
 * Run: npx vite-node scripts/verify-explorer-box.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-explorer-box FAIL: ${message}`)
    process.exit(1)
  }
}

const explorer = readFileSync(resolve('src/pages/BroadcastExplorer.tsx'), 'utf8')

assert(
  !explorer.includes('ONE FM broadcast team in the commentary box'),
  'Explorer must not put unlabeled stadium faces in a commentary box',
)
assert(
  !explorer.includes('The ONE FM team — ready to call the game'),
  'Explorer must not invent a named broadcast team on the GVL hoodie still',
)
assert(
  !explorer.includes('ONE FM commentator calling the game live'),
  'Explorer must not label an unlabeled still as a commentator',
)
assert(
  !explorer.includes('Calling the game — live from the ground'),
  'Explorer must not invent a live named call on the box still',
)
assert(
  explorer.includes('GVL match-day station photography — not a named presenter portrait'),
  'Explorer hoodie still must be station photography',
)
assert(
  explorer.includes('ONE FM commentary box — station photography, not a named presenter portrait'),
  'Explorer box still must be station photography',
)
assert(
  explorer.includes('Named portraits: Di Hunter and Sally Nayler only'),
  'Explorer must keep named portraits to Di Hunter and Sally Nayler',
)
assert(
  explorer.includes('commentaryTeamUniform') && explorer.includes('commentaryCallAction'),
  'Explorer must keep the sourced commentary stills',
)

console.log('verify-explorer-box OK')

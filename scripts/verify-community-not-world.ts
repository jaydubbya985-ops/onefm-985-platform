/**
 * Community leftover invented Weeknight world programs.
 * The cards are MULTICULTURAL_PROGRAMS from the weekly guide — not a world dial.
 *
 * Run: npx vite-node scripts/verify-community-not-world.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Community.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  !/Weeknight world programs/.test(src),
  'Community must not invent leftover Weeknight world programs',
)
assert(
  src.includes('Weeknight multicultural programs'),
  'Community editorial label must name weeknight multicultural programs',
)
assert(
  src.includes('MULTICULTURAL_PROGRAMS'),
  'Community editorial cards must stay sourced from the weekly guide',
)

if (fail.length) {
  console.error('verify-community-not-world failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-community-not-world: ok')

/**
 * Programs leftover invented a GVL season-sponsorship product on the jobs bar.
 * GVL Match of the Day is Saturday 1PM–3PM in FULL_SCHEDULE — not a season package.
 *
 * Run: npx vite-node scripts/verify-programs-not-season.ts
 */
import { readFileSync } from 'node:fs'
import { formatGuideHours } from '../src/lib/guideHours'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Season sponsorship/.test(src), 'Programs must not invent leftover season sponsorship')
assert(
  src.includes("formatGuideHours('GVL Match of the Day')"),
  'Programs GVL Football job must use formatGuideHours / FULL_SCHEDULE',
)

const hours = formatGuideHours('GVL Match of the Day')
assert(hours === 'Sat 1PM–3PM', `GVL Match of the Day hours must be Sat 1PM–3PM, got ${JSON.stringify(hours)}`)

if (fail.length) {
  console.error('verify-programs-not-season failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-programs-not-season: ok')

/**
 * Broadcast Explorer leftover invented a Saturday-coverage product on the jobs bar.
 * GVL Match of the Day is Saturday 1PM–3PM in FULL_SCHEDULE — not leftover coverage.
 *
 * Run: npx vite-node scripts/verify-explorer-not-saturday.ts
 */
import { readFileSync } from 'node:fs'
import { formatGuideHours } from '../src/lib/guideHours'

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Saturday coverage/.test(src), 'Broadcast Explorer must not invent leftover Saturday coverage')
assert(
  src.includes("formatGuideHours('GVL Match of the Day')"),
  'Broadcast Explorer GVL Sport job must use formatGuideHours / FULL_SCHEDULE',
)

const hours = formatGuideHours('GVL Match of the Day')
assert(hours === 'Sat 1PM–3PM', `GVL Match of the Day hours must be Sat 1PM–3PM, got ${JSON.stringify(hours)}`)

if (fail.length) {
  console.error('verify-explorer-not-saturday failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-explorer-not-saturday: ok')

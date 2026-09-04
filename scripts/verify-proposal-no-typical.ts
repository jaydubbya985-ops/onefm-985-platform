/**
 * Proposal form does not invent leftover typical campaign weeks.
 * Run: npx vite-node scripts/verify-proposal-no-typical.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/pages/SalesProposal.tsx'), 'utf8')

assert(!/Typical campaigns/i.test(page), 'Proposal must not invent leftover typical campaigns')
assert(!/13, 26 or 52/.test(page), 'Proposal must not invent a leftover 13 / 26 / 52 week ladder')
assert(
  page.includes('Campaign length is agreed in the written quote'),
  'Proposal duration helper must say length is agreed in the written quote',
)
assert(page.includes('Duration in weeks (optional)'), 'Optional duration field must remain')

if (fail.length) {
  console.error('verify-proposal-no-typical failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-proposal-no-typical: ok')

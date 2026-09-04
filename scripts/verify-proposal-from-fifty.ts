/**
 * Fail if #/proposal still hardcodes leftover "Packages from $50/week".
 * Weekly partnership floor comes from inventoryCopy / pricing.ts, with GST.
 *
 * Run: npx vite-node scripts/verify-proposal-from-fifty.ts
 */
import { readFileSync } from 'node:fs'
import { PARTNERSHIP_FROM_WEEKLY } from '../src/lib/inventoryCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-proposal-from-fifty FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/SalesProposal.tsx', import.meta.url), 'utf8')

assert(!src.includes('Packages from $50/week'), 'SalesProposal must not hardcode leftover Packages from $50/week')
assert(src.includes('PARTNERSHIP_FROM_WEEKLY'), 'SalesProposal ticker must use PARTNERSHIP_FROM_WEEKLY')
assert(
  PARTNERSHIP_FROM_WEEKLY.includes('plus GST'),
  `partnership copy must name GST: ${PARTNERSHIP_FROM_WEEKLY}`,
)
assert(
  /\$\d+\/week/.test(PARTNERSHIP_FROM_WEEKLY),
  `partnership copy must source a weekly dollar: ${PARTNERSHIP_FROM_WEEKLY}`,
)

console.log(`verify-proposal-from-fifty OK — ${PARTNERSHIP_FROM_WEEKLY}`)

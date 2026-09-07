/**
 * Lock: /proposal success is not leftover in-touch / tailored-proposal SLA.
 * Run: npx vite-node scripts/verify-proposal-not-touch.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-proposal-not-touch FAIL: ${message}`)
    process.exit(1)
  }
}

const page = readFileSync(new URL('../src/pages/SalesProposal.tsx', import.meta.url), 'utf8')

assert(
  !/We.?ll be in touch/i.test(page),
  'success must not leftover an in-touch SLA',
)
assert(
  !/in touch with a tailored proposal/i.test(page),
  'success must not leftover a sent tailored proposal',
)
assert(
  page.includes('did not send a tailored proposal'),
  'success must say this page did not send a tailored proposal',
)
assert(
  page.includes('stored the request or opened a draft'),
  'success must name stored or draft — mailto does not mark sent',
)

console.log(
  'verify-proposal-not-touch: /proposal success names stored or draft, not leftover in-touch.',
)

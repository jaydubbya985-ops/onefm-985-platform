/**
 * Billing leftover invented an allocation workflow.
 * Gov-truth forbids leftover coming-soon products. Allocate must not claim a send.
 *
 * Run: npx vite-node scripts/verify-billing-not-allocate.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/ops/BillingEngine.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  !/Allocation workflow coming soon/.test(src),
  'Billing must not invent leftover allocation workflow coming soon',
)
assert(
  src.includes('Nothing was allocated for'),
  'Allocate toast must say nothing was allocated',
)
assert(
  src.includes('Open Invoices to match this deposit'),
  'Allocate toast must send FOOTT to Invoices, not a leftover workflow',
)
assert(
  src.includes('${payment.reference}'),
  'Allocate toast must name the deposit reference',
)

if (fail.length) {
  console.error('verify-billing-not-allocate failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-billing-not-allocate: ok')

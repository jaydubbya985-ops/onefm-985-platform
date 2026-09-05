/**
 * Payments / billing seeds must use the June 2026 ONEFM ledger.
 * Leftover INV-2026-* collided with Jason's TV (ONEFM-2026-012).
 *
 * Run: npx vite-node scripts/verify-payments-onefm-numbers.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'src/components/ops/data/payments.ts'), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  !/['"]INV-2026-/.test(source),
  'payments.ts must not keep leftover INV-2026- invoice numbers',
)
assert(
  source.includes("number: 'ONEFM-2026-024'") && source.includes('Merritt Funeral Services'),
  'Merritt outstanding must be ONEFM-2026-024, not leftover INV-2026-003',
)
assert(
  source.includes("invoiceNumber: 'ONEFM-2026-028'") && source.includes('Primary Care Connect'),
  'Primary Care Connect must be ONEFM-2026-028, not leftover INV-2026-012',
)
assert(
  source.includes("invoiceNumber: 'ONEFM-2026-015'") && source.includes('Peppermill Inn'),
  'Peppermill Inn must be ONEFM-2026-015',
)
assert(
  !/invoiceNumber: 'ONEFM-2026-\d+', clientName: 'Aussie Ag/.test(source),
  'Do not invent an ONEFM number for Aussie Ag — it is not in the June 2026 batch',
)

if (fail.length) {
  console.error('verify-payments-onefm-numbers failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-payments-onefm-numbers ok — Payments seeds use ONEFM-2026- ledger numbers')

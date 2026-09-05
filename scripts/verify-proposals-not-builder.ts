/**
 * Fail the build if Proposals still invents leftover Proposal Builder / coverage stamp.
 * Run: npx vite-node scripts/verify-proposals-not-builder.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-proposals-not-builder FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(
  new URL('../src/components/ops/ProposalBuilder.tsx', import.meta.url),
  'utf8',
)

assert(
  !/Proposal Builder/.test(src),
  'Proposals heading must match the tab — not leftover Proposal Builder',
)
assert(
  !/formatCoverageShort/.test(src),
  'Proposals must not stamp leftover coverage on the packages tab',
)
assert(src.includes('>Proposals<'), 'heading must be Proposals')
assert(
  src.includes('never sold as the $25 floor'),
  'Proposals must still say GVL is never the $25 floor',
)
assert(src.includes('NAB BSB'), 'Proposals must still name NAB pay-to')
assert(
  src.includes('Mailto opens a draft'),
  'Proposals must still say mailto does not mark sent',
)

const batch = readFileSync(
  new URL('../src/components/ops/InvoiceBatchSender.tsx', import.meta.url),
  'utf8',
)
assert(/Live Mode/.test(batch), 'InvoiceBatchSender leftover Live Mode is #566 — do not steal')

const invoices = readFileSync(
  new URL('../src/components/ops/InvoiceGenerator.tsx', import.meta.url),
  'utf8',
)
assert(
  invoices.includes('#D4A84B'),
  'InvoiceGenerator leftover gold is #560 — do not steal',
)

console.log('verify-proposals-not-builder OK')

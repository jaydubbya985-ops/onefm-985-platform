/**
 * Fail the build if Invoice Generator still uses leftover gold chrome
 * or leftover coverage stamp. Run: npx vite-node scripts/verify-invoices-not-gold.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoices-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/InvoiceGenerator.tsx', import.meta.url), 'utf8')

assert(
  !/#D4A84B/i.test(src),
  'InvoiceGenerator chrome must not use leftover gold #D4A84B',
)
assert(
  !/#C49A3B/i.test(src),
  'InvoiceGenerator chrome must not use leftover gold hover #C49A3B',
)
assert(
  !/#D4AF37/i.test(src),
  'InvoiceGenerator chrome must not use leftover gold #D4AF37',
)
assert(
  !/formatCoverageShort/.test(src),
  'InvoiceGenerator must not stamp leftover coverage on the invoices tab',
)
assert(
  src.includes('Invoice payments: NAB BSB'),
  'InvoiceGenerator must still name NAB pay-to',
)
assert(
  src.includes('#E51636'),
  'InvoiceGenerator chrome must use signal red',
)
assert(
  src.includes("sent: 'bg-[#5B8DB8]/20 text-[#5B8DB8]"),
  'sent status must use station blue — not leftover gold and not overdue red',
)
assert(
  src.includes('bg-[#E51636] hover:bg-[#c4122f] text-white'),
  'Create Invoice must be signal red with white type, not leftover gold on ink',
)

const email = readFileSync(
  new URL('../src/components/ops/InvoiceEmailTemplate.tsx', import.meta.url),
  'utf8',
)
assert(
  email.includes('#D4AF37'),
  'InvoiceEmailTemplate leftover gold is #490 — do not steal',
)

const batch = readFileSync(
  new URL('../src/components/ops/InvoiceBatchSender.tsx', import.meta.url),
  'utf8',
)
assert(
  batch.includes('formatCoverageShort'),
  'InvoiceBatchSender leftover coverage stamp is not this desk — do not steal',
)

const lab = readFileSync(
  new URL('../src/components/ops/InvoiceDesignLab.tsx', import.meta.url),
  'utf8',
)
assert(
  /world-class/i.test(lab),
  'InvoiceDesignLab leftover world-class is #557 — do not steal',
)

console.log('verify-invoices-not-gold OK')

/**
 * Fail the build if Batch Send still invents leftover Live Mode / Resend.
 * Run: npx vite-node scripts/verify-batch-not-live.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-batch-not-live FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(
  new URL('../src/components/ops/InvoiceBatchSender.tsx', import.meta.url),
  'utf8',
)

assert(!/Live Mode/.test(src), 'Batch Send must not invent leftover Live Mode')
assert(!/Switch to Live/.test(src), 'Batch Send must not invent leftover Switch to Live')
assert(
  !/via Resend with PDF attachments/.test(src),
  'Batch Send must not claim leftover LIVE Resend send',
)
assert(
  !/Invoice Batch — June 2026/.test(src),
  'Batch Send heading must not invent leftover June 2026',
)
assert(
  !/formatCoverageShort/.test(src),
  'Batch Send must not stamp leftover coverage on the send tab',
)
assert(src.includes('Sponsor addresses'), 'Batch Send must name sponsor addresses')
assert(src.includes('Test inbox'), 'Batch Send must name the test inbox toggle')
assert(
  src.includes('Mailto does not mark sent'),
  'Batch Send must still say mailto does not mark sent',
)
assert(!/#D4A853/i.test(src), 'Batch Send chrome must not use leftover gold #D4A853')
assert(src.includes('#E51636'), 'Batch Send chrome must use signal red')
assert(src.includes('>Batch Send<'), 'heading must match the Batch Send tab')

const invoices = readFileSync(
  new URL('../src/components/ops/InvoiceGenerator.tsx', import.meta.url),
  'utf8',
)
assert(
  invoices.includes('#D4A84B'),
  'InvoiceGenerator leftover gold is #560 — do not steal',
)

const email = readFileSync(
  new URL('../src/components/ops/InvoiceEmailTemplate.tsx', import.meta.url),
  'utf8',
)
assert(email.includes('#D4AF37'), 'InvoiceEmailTemplate leftover gold is #490 — do not steal')

const seed = readFileSync(new URL('../src/components/ops/data/invoices.ts', import.meta.url), 'utf8')
assert(
  seed.includes('June 2026 invoice batch'),
  'DEMO batch seed dating in invoices.ts is not this desk — do not steal',
)

console.log('verify-batch-not-live OK')

/**
 * Fail the build if ops toasts still use leftover gold chrome.
 * Run: npx vite-node scripts/verify-toast-not-gold.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-toast-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/Toast.tsx', import.meta.url), 'utf8')

assert(!/#D4A853/i.test(src), 'ops toasts must not use leftover gold #D4A853')
assert(!/#D4A84B/i.test(src), 'ops toasts must not use leftover gold #D4A84B')
assert(!/#D4AF37/i.test(src), 'ops toasts must not use leftover gold #D4AF37')
assert(src.includes('#E51636'), 'ops info toasts must use signal red')
assert(src.includes("info: 'bg-[#E51636]/10 border-[#E51636]/30'"), 'info toast chrome must be signal red')

const invoices = readFileSync(
  new URL('../src/components/ops/InvoiceGenerator.tsx', import.meta.url),
  'utf8',
)
assert(invoices.includes('#D4A84B'), 'InvoiceGenerator leftover gold is #560 — do not steal')

const batch = readFileSync(
  new URL('../src/components/ops/InvoiceBatchSender.tsx', import.meta.url),
  'utf8',
)
assert(/Live Mode/.test(batch), 'InvoiceBatchSender leftover Live Mode is #566 — do not steal')

const proposals = readFileSync(
  new URL('../src/components/ops/ProposalBuilder.tsx', import.meta.url),
  'utf8',
)
assert(
  /Proposal Builder/.test(proposals),
  'ProposalBuilder leftover heading is #567 — do not steal',
)

console.log('verify-toast-not-gold OK')

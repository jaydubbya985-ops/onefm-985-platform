/**
 * Fail if the on-screen invoice invents a 14-day payment window.
 * Run: npx vite-node scripts/verify-invoice-pay-line.ts
 */
import { readFileSync } from 'node:fs'
import { invoicePayReference } from '../src/lib/invoicePayLine'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoice-pay-line FAIL: ${message}`)
    process.exit(1)
  }
}

const named = invoicePayReference('ONEFM-2026-011', '23 June 2026')
assert(named === 'Reference ONEFM-2026-011 · payment due 23 June 2026', named)
assert(!/14 days/i.test(named), `must not invent 14 days: ${named}`)

const pending = invoicePayReference('ONEFM-2026-012', '   ')
assert(pending.includes('due date pending'), pending)
assert(!/14 days/i.test(pending), `pending must not invent 14 days: ${pending}`)

const sheet = readFileSync('src/components/ops/OpsInvoiceSheet.tsx', 'utf8')
assert(sheet.includes('invoicePayReference'), 'OpsInvoiceSheet must use invoicePayReference')
assert(!/within 14 days/i.test(sheet), 'OpsInvoiceSheet must not hardcode 14 days')

console.log('verify-invoice-pay-line OK')

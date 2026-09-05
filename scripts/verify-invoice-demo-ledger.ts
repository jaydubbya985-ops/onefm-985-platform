/**
 * Fail if the DEMO aging ledger invents a sent FOOTT (or Jason's TV) invoice.
 * The live tax invoices stay on BATCH_INVOICES as ONEFM-2026-011 / 012.
 * Run: npx vite-node scripts/verify-invoice-demo-ledger.ts
 */
import { readFileSync } from 'node:fs'
import {
  BILLING_INVOICES,
  isRealSponsorCompany,
  realBatchInvoices,
} from '../src/components/ops/data/invoices.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoice-demo-ledger FAIL: ${message}`)
    process.exit(1)
  }
}

const leaked = BILLING_INVOICES.filter((row) => isRealSponsorCompany(row.company))
assert(
  leaked.length === 0,
  `DEMO aging ledger must not invent a real-sponsor invoice: ${leaked
    .map((r) => `${r.number} ${r.company} ${r.status}`)
    .join('; ')}`,
)

const foott = realBatchInvoices().find((i) => i.number === 'ONEFM-2026-011')
assert(!!foott, 'FOOTT ONEFM-2026-011 must stay on the real batch')
assert(foott?.status === 'draft', `real FOOTT stays draft until emailed: ${foott?.status}`)
assert(foott?.total === 5500, `real FOOTT total is $5,500 not a DEMO $638: ${foott?.total}`)

const source = readFileSync(new URL('../src/components/ops/data/invoices.ts', import.meta.url), 'utf8')
const billingBlock = source.slice(source.indexOf('export const BILLING_INVOICES'))
assert(!/FOOTT/i.test(billingBlock), 'BILLING_INVOICES source must not name FOOTT')
assert(!/Peter Foott/i.test(billingBlock), 'BILLING_INVOICES source must not name Peter Foott')
assert(!/INV-2026-014/.test(billingBlock), 'do not bring back the invented INV-2026-014 FOOTT row')
assert(source.includes('isRealSponsorCompany'), 'keep the real-sponsor guard')

console.log('verify-invoice-demo-ledger OK')
console.log(
  JSON.stringify(
    {
      demoRows: BILLING_INVOICES.length,
      foottBatch: foott?.number,
      foottStatus: foott?.status,
      foottTotal: foott?.total,
    },
    null,
    2,
  ),
)

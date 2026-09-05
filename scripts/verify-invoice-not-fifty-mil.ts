/**
 * Invoice leftover invented $50 million SAM — lock.
 * Run: npx vite-node scripts/verify-invoice-not-fifty-mil.ts
 */
import { readFileSync } from 'node:fs'
import { getInvoiceEmailBody } from '../src/components/ops/data/invoices'

const src = readFileSync(new URL('../src/components/ops/data/invoices.ts', import.meta.url), 'utf8')
const body = getInvoiceEmailBody('inv-010')

if (/\$50 million/i.test(src) || /\$50 million/i.test(body)) {
  console.error(
    'verify-invoice-not-fifty-mil: leftover $50 million invents a SAM build cost — name SAM without a leftover figure',
  )
  process.exit(1)
}
if (!/SAM/.test(body)) {
  console.error('verify-invoice-not-fifty-mil: SAM thank-you must still name SAM')
  process.exit(1)
}

console.log('verify-invoice-not-fifty-mil: ok')
console.log(body)

import { writeFileSync } from 'node:fs'
import { generateReceiptEmailHtml } from '../src/components/ops/InvoiceEmailTemplate.tsx'
import { BANK_ACCOUNT_NAME, BANK_BSB } from '../src/lib/bankDetails.ts'

const html = generateReceiptEmailHtml({
  contactName: 'Kati',
  company: 'Shepparton Art Museum',
  invoiceNumber: 'INV-100',
  amount: 1100,
  paymentDate: '5 September 2026',
  paymentMethod: 'Bank transfer',
  reference: 'INV-100',
})

if (/keeps community radio alive/i.test(html)) {
  throw new Error('leftover station-alive still in receipt HTML')
}
if (!html.includes(BANK_ACCOUNT_NAME)) {
  throw new Error('NAB account name missing from receipt')
}
if (!html.includes(BANK_BSB)) {
  throw new Error('NAB BSB missing from receipt')
}
if (!/records that payment against invoice/i.test(html)) {
  throw new Error('sourced receipt line missing')
}

writeFileSync('/tmp/receipt-not-alive.html', html)
console.log('verify-receipt-not-alive: leftover station-alive gone; NAB account sourced')

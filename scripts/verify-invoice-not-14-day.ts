/**
 * Invoice / proposal leftover invented 14-day payment — lock.
 * Run: npx vite-node scripts/verify-invoice-not-14-day.ts
 */
import { readFileSync } from 'node:fs'
import { generateVariantInvoicePdf } from '../src/lib/invoiceVariantPdf'
import type { PdfInvoiceData } from '../src/components/ops/InvoiceEmailTemplate'

const invoiceSrc = readFileSync(new URL('../src/lib/invoiceVariantPdf.ts', import.meta.url), 'utf8')
const proposalSrc = readFileSync(new URL('../src/lib/proposalDocument.ts', import.meta.url), 'utf8')

if (/payment due within 14 days/.test(invoiceSrc) || /14-day payment/.test(proposalSrc)) {
  console.error('verify-invoice-not-14-day: leftover 14-day payment SLA is still in source')
  process.exit(1)
}

const sample: PdfInvoiceData = {
  number: 'ONEFM-2026-099',
  company: 'Verify Pty Ltd',
  description: 'Standard 30-second spots',
  amountExclGst: 25,
  gst: 2.5,
  total: 27.5,
  dueDate: '2026-10-15',
}

const doc = await generateVariantInvoicePdf(sample, 'broadcast')
const raw = Buffer.from(doc.output('arraybuffer')).toString('latin1')
const dueLabel = new Date(sample.dueDate).toLocaleDateString('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

if (raw.includes('14 days') || raw.includes('14-day')) {
  console.error('verify-invoice-not-14-day: leftover 14-day payment still in the broadcast invoice PDF')
  process.exit(1)
}
if (!raw.includes(dueLabel) && !raw.includes('15 Oct 2026') && !raw.includes('15/10/2026')) {
  console.error(`verify-invoice-not-14-day: broadcast invoice PDF must name due ${dueLabel}`)
  process.exit(1)
}

console.log('verify-invoice-not-14-day: ok')

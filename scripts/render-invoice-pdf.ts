/**
 * Render a send-guide invoice PDF and assert it stays small.
 * Run: npx vite-node scripts/render-invoice-pdf.ts ONEFM-2026-011 [outfile]
 */
import { writeFileSync } from 'node:fs'
import { generateInvoicePdf } from '../src/components/ops/InvoiceEmailTemplate'
import { ALL_BATCH_INVOICES } from '../src/components/ops/data/invoices'

const number = process.argv[2]
if (!number) throw new Error('usage: npx vite-node scripts/render-invoice-pdf.ts ONEFM-2026-011 [outfile]')

const row = ALL_BATCH_INVOICES.find((invoice) => invoice.number === number)
if (!row) throw new Error(`${number} missing from send guide`)

const doc = await generateInvoicePdf({
  number: row.number,
  company: row.company,
  contactName: row.contactName,
  email: row.email,
  description: row.description,
  period: row.period,
  amountExclGst: row.amountExclGst,
  gst: row.gst,
  total: row.total,
  dueDate: row.dueDate,
  issueDate: row.createdAt,
})

const bytes = Buffer.from(doc.output('arraybuffer'))
const slug = number.toLowerCase()
const out = process.argv[3] ?? `/opt/cursor/artifacts/${number}-${slug}.pdf`
writeFileSync(out, bytes)

if (bytes.length > 180_000) {
  throw new Error(`PDF too large: ${bytes.length} bytes`)
}

console.log(`wrote ${out} (${bytes.length} bytes) ${row.company} ${row.total}`)

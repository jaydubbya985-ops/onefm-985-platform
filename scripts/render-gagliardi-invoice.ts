/**
 * Render ONEFM-2026-013 to PDF + assert it stays small.
 * Run: npx vite-node scripts/render-gagliardi-invoice.ts
 */
import { writeFileSync } from 'node:fs'
import { generateInvoicePdf } from '../src/components/ops/InvoiceEmailTemplate'
import { ALL_BATCH_INVOICES } from '../src/components/ops/data/invoices'

const row = ALL_BATCH_INVOICES.find((invoice) => invoice.number === 'ONEFM-2026-013')
if (!row) throw new Error('ONEFM-2026-013 missing from send guide')

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
const out = process.argv[2] ?? '/opt/cursor/artifacts/ONEFM-2026-013-gagliardi-scott.pdf'
writeFileSync(out, bytes)

if (bytes.length > 180_000) {
  throw new Error(`PDF too large: ${bytes.length} bytes (logo must be the 21 KB JPEG, not the 204 KB PNG)`)
}

console.log(`wrote ${out} (${bytes.length} bytes)`)

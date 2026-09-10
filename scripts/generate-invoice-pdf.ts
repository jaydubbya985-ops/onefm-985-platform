/**
 * Render one invoice from the real ledger to a PDF file, using the station's
 * chosen design variant. No email, no network — file output only.
 *
 *   npx vite-node scripts/generate-invoice-pdf.ts ONEFM-2026-030 [broadcast|on-air|valley]
 *
 * Output: invoices-out/<number>-<company>.pdf
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BATCH_INVOICES, CURRENT_INVOICES } from '../src/components/ops/data/invoices'
import { generateVariantInvoicePdf } from '../src/lib/invoiceVariantPdf'
import type { InvoiceDesignVariantId } from '../src/lib/invoiceDesignVariants'

const number = process.argv[2]
const variant = (process.argv[3] ?? 'broadcast') as InvoiceDesignVariantId

if (!number) {
  console.error('Usage: npx vite-node scripts/generate-invoice-pdf.ts <invoice-number> [variant]')
  process.exit(1)
}

const invoice = [...CURRENT_INVOICES, ...BATCH_INVOICES].find((i) => i.number === number)
if (!invoice) {
  console.error(`Invoice ${number} not found in CURRENT_INVOICES or BATCH_INVOICES.`)
  process.exit(1)
}

const doc = await generateVariantInvoicePdf(
  {
    number: invoice.number,
    company: invoice.company,
    contactName: invoice.contactName,
    email: invoice.email,
    description: invoice.description,
    period: invoice.period,
    amountExclGst: invoice.amountExclGst,
    gst: invoice.gst,
    total: invoice.total,
    dueDate: invoice.dueDate,
    issueDate: invoice.createdAt,
  },
  variant,
)

const outDir = join(process.cwd(), 'invoices-out')
mkdirSync(outDir, { recursive: true })
const safeCompany = invoice.company.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')
const outPath = join(outDir, `${invoice.number}-${safeCompany}.pdf`)
writeFileSync(outPath, Buffer.from(doc.output('arraybuffer')))
console.log(`Wrote ${outPath} (${variant} variant, total $${invoice.total.toFixed(2)})`)

/**
 * Prove FOOTT ONEFM-2026-011 is a real invoice PDF that production can send.
 * Never emails Peter. Dry-run only — and only after email-status reports dryRunSupported.
 *
 * Run: npx vite-node scripts/verify-foott-send.ts
 */
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import {
  generateInvoiceEmailHtml,
  generateInvoicePdf,
} from '../src/components/ops/InvoiceEmailTemplate'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '../src/lib/bankDetails'
import { realBatchInvoices } from '../src/components/ops/data/invoices.ts'

const LIVE = 'https://onefmops.netlify.app'
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const foott = realBatchInvoices().find((i) => i.number === 'ONEFM-2026-011')
assert(!!foott, 'FOOTT ONEFM-2026-011 missing from realBatchInvoices')
if (!foott) {
  console.error('verify-foott-send failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

assert(foott.email === 'peter@foott.com.au', 'FOOTT email must be peter@foott.com.au')
assert(foott.total === 5500, 'FOOTT total must be 5500')
assert(foott.status === 'draft', 'FOOTT must still be a sendable draft')
assert(BANK_BSB === '083-894', 'NAB BSB must stay 083-894')

const pdf = await generateInvoicePdf({
  number: foott.number,
  company: foott.company,
  contactName: foott.contactName,
  email: foott.email,
  amountExclGst: foott.amountExclGst,
  gst: foott.gst,
  total: foott.total,
  description: foott.description,
  period: foott.period,
  dueDate: foott.dueDate,
  issueDate: foott.createdAt,
})

const pdfBytes = Buffer.from(pdf.output('arraybuffer'))
assert(pdfBytes.subarray(0, 5).toString() === '%PDF-', 'FOOTT output is not a PDF')
assert(pdfBytes.length > 20_000, `FOOTT PDF too small (${pdfBytes.length} bytes) — logo likely missing`)

const pdfLatin1 = pdfBytes.toString('latin1')
assert(pdfLatin1.includes('ONEFM-2026-011'), 'PDF missing invoice number ONEFM-2026-011')
assert(pdfLatin1.includes('FOOTT'), 'PDF missing FOOTT')
assert(pdfLatin1.includes('083-894'), 'PDF missing BSB 083-894')
assert(pdfLatin1.includes('5,500.00') || pdfLatin1.includes('$5500') || pdfLatin1.includes('5500.00'), 'PDF missing $5,500.00')
assert(pdfLatin1.includes(BANK_ACCOUNT_NAME) || pdfLatin1.includes('98.5 One FM'), 'PDF missing account name')
assert(pdfLatin1.includes(BANK_ACCOUNT.replace(/\s/g, '')) || pdfLatin1.includes(BANK_ACCOUNT), 'PDF missing account number')

const html = generateInvoiceEmailHtml(
  {
    contactName: foott.contactName,
    company: foott.company,
    invoiceNumber: foott.number,
    amountExclGst: foott.amountExclGst,
    gst: foott.gst,
    total: foott.total,
    dueDate: foott.dueDate,
    customMessage: foott.emailBody,
    campaign: foott.description,
  },
  BANK_BSB,
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
)
assert(html.includes('ONEFM-2026-011'), 'email HTML missing invoice number')
assert(html.includes('083-894'), 'email HTML missing BSB')
assert(!/sent via/i.test(html), 'email HTML must not claim it was already sent')

const outDir = '/tmp/onefm-pdf-check'
mkdirSync(outDir, { recursive: true })
const pdfPath = `${outDir}/invoice-foott-011.pdf`
writeFileSync(pdfPath, pdfBytes)
try {
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  copyFileSync(pdfPath, '/opt/cursor/artifacts/invoice_foott_011.pdf')
} catch {
  // artifacts dir may be missing in some environments
}

const statusRes = await fetch(`${LIVE}/.netlify/functions/email-status`, {
  headers: { Accept: 'application/json' },
})
const statusText = await statusRes.text()
assert(!statusText.trimStart().startsWith('<'), 'email-status returned SPA HTML')
let status: {
  resendConfigured?: boolean
  resendReachable?: boolean
  fromDomainVerified?: boolean
  dryRunSupported?: boolean
  from?: string
} = {}
try {
  status = JSON.parse(statusText) as typeof status
} catch {
  fail.push('email-status is not JSON')
}

assert(status.resendConfigured === true, 'live email-status must report Resend configured')

if (!status.dryRunSupported) {
  fail.push(
    'live send-invoice dry-run is not deployed yet — not POSTing FOOTT (old function would email Peter)',
  )
} else {
  assert(status.resendReachable === true, 'Resend API key was rejected (domains probe failed)')
  assert(
    status.fromDomainVerified === true,
    `fm985.com.au is not verified on Resend (status domain not verified) — FOOTT cannot be emailed from accounts@fm985.com.au`,
  )
  assert(
    typeof status.from === 'string' && status.from.includes('accounts@fm985.com.au'),
    'invoice From must be accounts@fm985.com.au',
  )

  const dryRes = await fetch(`${LIVE}/.netlify/functions/send-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      dryRun: true,
      to: foott.email,
      subject: foott.emailSubject,
      html,
      pdfBase64: pdfBytes.toString('base64'),
      filename: `${foott.number}.pdf`,
      replyTo: 'accounts@fm985.com.au',
    }),
  })
  const dryText = await dryRes.text()
  assert(!dryText.trimStart().startsWith('<'), 'send-invoice dry-run returned SPA HTML')
  let dry: {
    success?: boolean
    dryRun?: boolean
    sent?: boolean
    wouldSendTo?: string
    hasPdf?: boolean
    filename?: string
    resendReachable?: boolean
    fromDomainVerified?: boolean
  } = {}
  try {
    dry = JSON.parse(dryText) as typeof dry
  } catch {
    fail.push(`send-invoice dry-run is not JSON (HTTP ${dryRes.status})`)
  }

  assert(dryRes.ok, `send-invoice dry-run HTTP ${dryRes.status}`)
  assert(dry.dryRun === true, 'dry-run response missing dryRun:true')
  assert(dry.sent === false, 'dry-run must report sent:false — nothing emailed')
  assert(dry.wouldSendTo === 'peter@foott.com.au', 'dry-run wouldSendTo must be peter@foott.com.au')
  assert(dry.hasPdf === true, 'dry-run must accept the FOOTT PDF attachment')
  assert(dry.filename === 'ONEFM-2026-011.pdf', 'dry-run filename must be ONEFM-2026-011.pdf')
  assert(dry.resendReachable === true, 'dry-run Resend probe failed')
  assert(dry.fromDomainVerified === true, 'dry-run reports fm985.com.au not verified')
}

if (fail.length) {
  console.error('verify-foott-send failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      invoice: foott.number,
      to: foott.email,
      total: foott.total,
      bsb: BANK_BSB,
      pdfBytes: pdfBytes.length,
      emailed: false,
    },
    null,
    2,
  ),
)

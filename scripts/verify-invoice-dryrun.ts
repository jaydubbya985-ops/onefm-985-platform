/**
 * Fail if send-invoice dry-run is dressed as a successful send.
 * Run: npx vite-node scripts/verify-invoice-dryrun.ts
 */
import { readFileSync } from 'node:fs'
import {
  INVOICE_DRY_RUN_ERROR,
  invoiceDryRunPayload,
} from '../src/lib/invoiceDryRun'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoice-dryrun FAIL: ${message}`)
    process.exit(1)
  }
}

const payload = invoiceDryRunPayload(
  {
    configured: true,
    reachable: true,
    fromDomainVerified: true,
    domainStatus: 'verified',
    stationDomains: [{ name: 'fm985.com.au', status: 'verified' }],
    needJay: null,
  },
  {
    to: 'peter@foott.com.au',
    hasPdf: true,
    filename: 'ONEFM-2026-011.pdf',
    from: 'ONE FM 98.5 <accounts@fm985.com.au>',
  },
)

assert(payload.success === false, `dry-run success must be false: ${payload.success}`)
assert(payload.sent === false, 'dry-run must report sent:false')
assert(payload.dryRun === true, 'dry-run must report dryRun:true')
assert(payload.error === INVOICE_DRY_RUN_ERROR, `error: ${payload.error}`)
assert(/not sent/i.test(payload.error), 'error must say the invoice was not sent')
assert(/dry run/i.test(payload.error), 'error must name the dry run')
assert(payload.wouldSendTo === 'peter@foott.com.au', payload.wouldSendTo)
assert(payload.hasPdf === true, 'must keep the PDF flag for FOOTT verify')
assert(payload.filename === 'ONEFM-2026-011.pdf', String(payload.filename))
assert(payload.resendConfigured === true, 'probe fields must still surface')
assert(payload.fromDomainVerified === true, 'apex verify must still surface')

const fn = readFileSync(new URL('../netlify/functions/send-invoice.ts', import.meta.url), 'utf8')
assert(fn.includes('invoiceDryRunPayload'), 'send-invoice must use the shared dry-run payload')
assert(fn.includes("body.dryRun === true"), 'send-invoice must still gate on dryRun')
assert(
  !fn.includes('success: true,\n      dryRun: true'),
  'do not return success:true next to dryRun:true',
)

const dryBlock = fn.slice(fn.indexOf('body.dryRun === true'), fn.indexOf('const payload:'))
assert(!dryBlock.includes('success: true'), 'dry-run branch must not set success:true')
assert(!dryBlock.includes('api.resend.com/emails'), 'dry-run must not POST /emails')

console.log('verify-invoice-dryrun OK')
console.log(JSON.stringify({ success: payload.success, sent: payload.sent, error: payload.error }, null, 2))

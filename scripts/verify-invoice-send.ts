/**
 * Fail the build if a send-invoice JSON error is dressed as not configured.
 * Run: npx vite-node scripts/verify-invoice-send.ts
 */
import { readInvoiceFunctionResult } from '../src/lib/invoiceSend'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoice-send FAIL: ${message}`)
    process.exit(1)
  }
}

const sent = readInvoiceFunctionResult({ success: true, sent: true, messageId: 're_1' })
assert(sent?.success === true && sent.messageId === 're_1', 'live send must succeed')

const dry = readInvoiceFunctionResult({ success: true, dryRun: true, sent: false })
assert(dry?.success === false, 'dry-run must not be treated as emailed')
assert(dry?.error, 'dry-run must carry an error')

const unreachable = readInvoiceFunctionResult({ error: 'Email service unreachable', sent: false })
assert(unreachable?.success === false, '502 sent:false is a failed send')
assert(unreachable?.error === 'Email service unreachable', `keep Resend text: ${unreachable?.error}`)
assert(!/not configured/i.test(unreachable?.error ?? ''), 'must not invent a missing key')

const missingKey = readInvoiceFunctionResult({ error: 'Email service not configured' })
assert(missingKey?.success === false, '{ error } without sent still ran the function')
assert(missingKey?.error === 'Email service not configured', missingKey?.error)

const spa = readInvoiceFunctionResult(null)
assert(spa === null, 'SPA HTML / null is the only DEMO fallback')

console.log('verify-invoice-send OK')
console.log(
  JSON.stringify({ sent, dry, unreachable, missingKey, spa }, null, 2),
)

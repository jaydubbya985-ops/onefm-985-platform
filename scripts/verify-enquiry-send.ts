/**
 * Fail the build if a Resend 502 is dressed as "email is not configured".
 * Run: npx vite-node scripts/verify-enquiry-send.ts
 */
import { readEnquiryFunctionResult } from '../src/lib/enquirySend'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiry-send FAIL: ${message}`)
    process.exit(1)
  }
}

const sent = readEnquiryFunctionResult({ success: true, error: undefined })
assert(sent.kind === 'sent', `success:true must be sent, got ${sent.kind}`)

const failed = readEnquiryFunctionResult({ error: 'Email service unreachable' })
assert(failed.kind === 'function_failed', `502 JSON must be function_failed, got ${failed.kind}`)
if (failed.kind === 'function_failed') {
  assert(failed.error === 'Email service unreachable', failed.error)
  assert(!/not configured/i.test(failed.error), 'must not invent missing RESEND key')
}

const bareFail = readEnquiryFunctionResult({ success: false })
assert(bareFail.kind === 'function_failed', 'success:false without error still failed')
if (bareFail.kind === 'function_failed') {
  assert(bareFail.error.includes('not sent'), bareFail.error)
}

const spa = readEnquiryFunctionResult(null)
assert(spa.kind === 'unreachable', 'SPA HTML / null is local-dev fallback only')

console.log('verify-enquiry-send OK')
console.log(JSON.stringify({ sent, failed, bareFail, spa }, null, 2))

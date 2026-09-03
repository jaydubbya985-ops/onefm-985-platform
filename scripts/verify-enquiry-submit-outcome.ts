/**
 * Fail if a stored-only enquiry is dressed as a received request.
 * Run: npx vite-node scripts/verify-enquiry-submit-outcome.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'
import {
  enquiryFallbackContact,
  enquirySubmitOutcome,
} from '../src/lib/enquirySubmitOutcome'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiry-submit-outcome FAIL: ${message}`)
    process.exit(1)
  }
}

const phone = BRAND.phone
const email = BRAND.email

assert(
  enquiryFallbackContact() === `Call ${phone} or email ${email}.`,
  'fallback must use the public station line',
)

const emailed = enquirySubmitOutcome({
  stored: false,
  emailed: true,
  insertedId: 'enq-1',
})
assert(emailed.success === true, 'emailed enquiry is success')
assert(emailed.emailed === true, 'emailed flag')
assert(emailed.stored === false, 'emailed-only is not stored')
assert(!emailed.error, 'emailed must not carry an error')

const both = enquirySubmitOutcome({
  stored: true,
  emailed: true,
  insertedId: 'enq-2',
})
assert(both.success === true, 'stored+emailed is success')
assert(both.stored === true && both.emailed === true, 'both flags')

const storedOnly = enquirySubmitOutcome({
  stored: true,
  emailed: false,
  insertedId: 'enq-3',
})
assert(storedOnly.success === false, 'ops-list-only is not a sent enquiry')
assert(storedOnly.stored === true, 'keep the stored flag for #253')
assert(storedOnly.emailed === false, 'stored-only is not emailed')
assert(storedOnly.id === 'enq-3', 'keep the ops id')
assert(
  /station inbox was not emailed/i.test(storedOnly.error ?? ''),
  `stored-only must say the inbox was not emailed: ${storedOnly.error}`,
)
assert(
  /ops list/i.test(storedOnly.error ?? ''),
  `stored-only must admit the ops row: ${storedOnly.error}`,
)
assert(
  storedOnly.error?.includes(phone) && storedOnly.error?.includes(email),
  'stored-only must keep the station fallback',
)
assert(
  !/request received|in the pipeline|we'll be in touch/i.test(storedOnly.error ?? ''),
  'do not invent a received pipeline',
)

const failed = enquirySubmitOutcome({
  stored: false,
  emailed: false,
  emailError: 'Resend 502',
})
assert(failed.success === false, 'neither path is failure')
assert(failed.error === 'Resend 502', 'keep the send error')

const dev = enquirySubmitOutcome({
  stored: false,
  emailed: false,
  emailDevMode: true,
})
assert(/email is not configured/i.test(dev.error ?? ''), `devMode: ${dev.error}`)
assert(dev.error?.includes(phone), 'devMode fallback includes the studio line')

const src = readFileSync(new URL('../src/lib/enquiries.ts', import.meta.url), 'utf8')
assert(src.includes('enquirySubmitOutcome'), 'submitEnquiry must use the shared outcome')
assert(!/stored \|\| email\.success/.test(src), 'do not treat a stored row as a sent email')

console.log('verify-enquiry-submit-outcome OK')
console.log('stored-only:', storedOnly.error)

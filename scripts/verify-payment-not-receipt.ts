/**
 * Lock: /payment/success is not leftover Stripe thank-you / emailed receipt.
 * Run: npx vite-node scripts/verify-payment-not-receipt.ts
 */
import { readFileSync } from 'node:fs'
import { RECEIPT_REQUEST_SUBJECT, receiptRequestMailto } from '../src/lib/bankDetails'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-payment-not-receipt FAIL: ${message}`)
    process.exit(1)
  }
}

const page = readFileSync(new URL('../src/pages/PaymentSuccess.tsx', import.meta.url), 'utf8')
assert(!/THANK YOU/.test(page), 'headline must not leftover THANK YOU as a card receipt')
assert(!page.includes('title="Thank you"'), 'SEO must not leftover Thank you')
assert(!page.includes('text-gold-gradient'), 'headline must not leftover gold thank-you')
assert(!page.includes('Receipt for ONE FM'), 'mailto must not leftover a sent-receipt subject')
assert(!page.includes('rgba(201,162,39'), 'bars must not leftover unused gold')
assert(page.includes('NOT A CARD RECEIPT'), 'headline must name that this is not a card receipt')
assert(page.includes('does not send a receipt'), 'body must say nothing is emailed')
assert(page.includes('receiptRequestMailto'), 'mail link must be a draft receipt request')
assert(page.includes('useReducedMotion'), 'bars must sit still when reduced motion is on')

const href = receiptRequestMailto()
assert(href.startsWith('mailto:accounts@fm985.com.au'), href)
assert(href.includes(encodeURIComponent(RECEIPT_REQUEST_SUBJECT)), 'subject must say nothing was emailed')
assert(href.includes(encodeURIComponent('did not send a receipt')), 'body must say no receipt was sent')

console.log('verify-payment-not-receipt: /payment/success names NAB, not leftover Stripe thank-you.')

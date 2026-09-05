/**
 * Fail if /payment-success still dresses as a confirmed card payment.
 * Run: npx vite-node scripts/verify-thanks-nab.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-thanks-nab FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/pages/PaymentSuccess.tsx', 'utf8')

assert(
  src.includes('Online checkout is not live'),
  'Thank-you page must say online checkout is not live — same truth as /payment-cancel',
)
assert(
  /not a (card|Stripe) receipt/.test(src),
  'Thank-you page must say it is not a card / Stripe receipt',
)
assert(
  !/Payments are confirmed/.test(src),
  'Do not claim this page confirms a payment',
)
assert(
  !/Receipt for ONE FM/.test(src),
  'Mailto must not pretend this screen issued a receipt',
)
assert(
  !src.includes('formatCoverageShort'),
  'Do not stamp coverage onto the thank-you page',
)
assert(
  src.includes('BANK_BSB') && src.includes('BANK_ACCOUNT'),
  'Keep the NAB pay line — that is the live path',
)

console.log('verify-thanks-nab OK — thank-you page is not a card receipt')

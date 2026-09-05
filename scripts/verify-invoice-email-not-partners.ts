/**
 * Fail if the Valley invoice email still sells leftover “Partners in the Valley”.
 * Station slogan is Live and Local. This masthead is a tax invoice, not a partnership brand.
 * Run: npx vite-node scripts/verify-invoice-email-not-partners.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/lib/invoiceVariantEmail.ts', import.meta.url), 'utf8')

if (/Partners in the Valley/i.test(src)) {
  console.error('verify-invoice-email-not-partners FAIL: leftover Partners in the Valley on Valley email')
  process.exit(1)
}
if (!src.includes('>Tax invoice<')) {
  console.error('verify-invoice-email-not-partners FAIL: missing honest Tax invoice kicker on Valley email')
  process.exit(1)
}

console.log('verify-invoice-email-not-partners: ok')

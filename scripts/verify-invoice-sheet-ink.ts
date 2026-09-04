/**
 * Fail if the on-screen invoice sheet still wears leftover Heritage navy.
 * Direction A ink is #101010 (one-navy).
 *
 * Run: npx vite-node scripts/verify-invoice-sheet-ink.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND_COLORS } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoice-sheet-ink FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/OpsInvoiceSheet.tsx', import.meta.url), 'utf8')

assert(!src.includes('#071D3A'), 'OpsInvoiceSheet must not name leftover Heritage navy #071D3A')
assert(src.includes('text-one-navy') || src.includes('#101010'), 'invoice sheet text must use Direction A ink')
assert(src.includes('bg-one-navy') || src.includes('bg-[#101010]'), 'invoice sheet total bar must sit on Direction A ink')
assert(BRAND_COLORS.navy === '#101010', `BRAND_COLORS.navy must stay Direction A ink, got ${BRAND_COLORS.navy}`)

console.log('verify-invoice-sheet-ink OK — invoice paper uses Direction A ink, not leftover navy')

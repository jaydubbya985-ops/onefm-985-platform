/**
 * Fail if the FOOTT clipboard pay line invents a pay URL or drops the ABN.
 * Run: npx vite-node scripts/verify-bank-abn.ts
 */
import { BRAND } from '../src/lib/brand.ts'
import {
  BANK_ABN,
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  bankPayLine,
} from '../src/lib/bankDetails.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-bank-abn FAIL: ${message}`)
    process.exit(1)
  }
}

assert(BANK_ABN === BRAND.abn, 'BANK_ABN must be BRAND.abn')
assert(BANK_ABN === '92 117 291 771', 'ABN must stay 92 117 291 771')

const bare = bankPayLine()
assert(bare.includes(BRAND.org), `missing licensed entity: ${bare}`)
assert(bare.includes(`ABN ${BANK_ABN}`), `missing ABN: ${bare}`)
assert(bare.includes(BANK_ACCOUNT_NAME), `missing NAB name: ${bare}`)
assert(bare.includes(BANK_BSB), `missing BSB: ${bare}`)
assert(bare.includes(BANK_ACCOUNT), `missing account: ${bare}`)
assert(/card checkout is not configured/i.test(bare), `must say card checkout is not configured: ${bare}`)
assert(!/pay\.onefm|stripe\.com|checkout\.stripe/i.test(bare), `must not invent a pay URL: ${bare}`)

const foott = bankPayLine('ONEFM-2026-011')
assert(foott.includes('Reference: ONEFM-2026-011'), `FOOTT reference missing: ${foott}`)
assert(foott.includes(`ABN ${BANK_ABN}`), `FOOTT line missing ABN: ${foott}`)

console.log(foott)
console.log('verify-bank-abn OK')

/**
 * Contract Manager seeds must use the June 2026 ONEFM ledger — not leftover INV-2026-.
 * Peppermill Inn is ONEFM-2026-015 (BATCH_INVOICES inv-005), not INV-2026-001.
 *
 * Run: node --experimental-strip-types scripts/verify-sponsor-onefm-numbers.ts
 */
import { readFileSync } from 'node:fs'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const src = readFileSync('src/components/ops/data/sponsors.ts', 'utf8')
assert(!src.includes("'INV-2026-"), 'sponsors.ts must not quote leftover INV-2026- invoice numbers')
assert(!src.includes('"INV-2026-'), 'sponsors.ts must not quote leftover INV-2026- invoice numbers')
assert(src.includes("'ONEFM-2026-011'"), 'FOOTT contract must keep ONEFM-2026-011')
assert(src.includes("'ONEFM-2026-015'"), 'Peppermill contract must list ONEFM-2026-015 (June batch)')
assert(src.includes('4957.3'), 'ONEFM-2026-015 amount must be the June batch total 4957.3')
assert(src.includes("dueDate: '2026-06-23'"), 'ONEFM-2026-015 due date must be 2026-06-23')
assert(src.includes("periodLabel: 'Apr 2026 – Jun 2026'"), 'ONEFM-2026-015 period must be Apr–Jun 2026 from the batch')

const peppermillBlock = src.slice(src.indexOf("companyName: 'Peppermill Inn'"))
assert(peppermillBlock.includes("'ONEFM-2026-015'"), 'Peppermill Inn block must contain ONEFM-2026-015')
assert(!peppermillBlock.includes("'INV-2026-"), 'Peppermill Inn block must not keep leftover INV-2026-')

if (fail.length) {
  for (const msg of fail) console.error(`verify-sponsor-onefm-numbers FAIL: ${msg}`)
  process.exit(1)
}

console.log('verify-sponsor-onefm-numbers OK')

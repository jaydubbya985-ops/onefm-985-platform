/**
 * Prove the payments desk never dresses seed / browser rows as NAB YTD.
 * Run: npx vite-node scripts/verify-ops-income-label.ts
 */
import { readFileSync } from 'node:fs'
import { opsIncomeCopy } from '../src/lib/opsIncomeLabel.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const demoHeader = opsIncomeCopy('header', false)
assert(demoHeader.label === 'DEMO seed total', 'DEMO header must say DEMO seed total')
assert(
  demoHeader.hint.includes('Not NAB year-to-date'),
  'DEMO header must name NAB as the missing source',
)
assert(!/YTD/i.test(demoHeader.label), 'DEMO header label must not say YTD')

const liveHeader = opsIncomeCopy('header', true)
assert(
  liveHeader.label === 'Recorded in this browser',
  'LIVE header must say recorded in this browser',
)
assert(
  liveHeader.hint.includes('Not NAB year-to-date'),
  'LIVE header must name NAB as the missing source',
)
assert(!/YTD/i.test(liveHeader.label), 'LIVE header label must not say YTD')

const demoDonations = opsIncomeCopy('donations', false)
assert(demoDonations.label === 'DEMO donations', 'DEMO donations card must say DEMO donations')
assert(demoDonations.hint.includes('not NAB YTD'), 'DEMO donations hint must reject NAB YTD')

const liveDonations = opsIncomeCopy('donations', true)
assert(
  liveDonations.label === 'Donations recorded',
  'LIVE donations card must say Donations recorded',
)

const demoPaid = opsIncomeCopy('paid-month', false)
assert(demoPaid.label.startsWith('DEMO'), 'paid-month DEMO label must start with DEMO')
assert(demoPaid.hint.includes('not NAB'), 'paid-month DEMO hint must reject NAB')

const demoMem = opsIncomeCopy('membership', false)
assert(demoMem.label.startsWith('DEMO'), 'membership DEMO label must start with DEMO')

const src = readFileSync('src/components/ops/PaymentsModule.tsx', 'utf8')
assert(
  src.includes("from '@/lib/opsIncomeLabel'"),
  'PaymentsModule must import opsIncomeCopy',
)
assert(
  src.includes("opsIncomeCopy('header'"),
  'PaymentsModule header must use opsIncomeCopy',
)
assert(
  !src.includes('Total Income YTD'),
  'PaymentsModule must not print Total Income YTD',
)
assert(
  !src.includes('title="Donations YTD"'),
  'PaymentsModule must not print Donations YTD as a live figure',
)
assert(
  src.includes("opsIncomeCopy('donations'"),
  'Donations card must use opsIncomeCopy',
)
assert(
  src.includes("opsIncomeCopy('paid-month'"),
  'Paid-this-month card must use opsIncomeCopy',
)
assert(
  src.includes("opsIncomeCopy('membership'"),
  'Membership revenue card must use opsIncomeCopy',
)
assert(
  src.includes('Scan at event check-in'),
  'must not restamp the membership QR leftover — that desk is #164',
)
assert(
  src.includes('DEMO monthly goal'),
  'DEMO donation goal must stay labelled DEMO',
)

if (fail.length) {
  console.error('verify-ops-income-label FAILED:\n' + fail.map((m) => `  - ${m}`).join('\n'))
  process.exit(1)
}

console.log('verify-ops-income-label OK')

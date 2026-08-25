import assert from 'node:assert/strict'
import { CBF_PROGRAMS } from '../components/ops/data/cbfGrants'
import {
  billedCollectTotal,
  COLLECT_LADDER,
  nextCollectStep,
} from '../components/ops/data/collectQueue'
import { ALL_BATCH_INVOICES } from '../components/ops/data/invoices'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from './stationBank'

assert.equal(BANK_BSB, '083-894')
assert.equal(BANK_ACCOUNT, '553 219 432')
assert.equal(BANK_ACCOUNT_NAME, 'Goulburn Valley Community Radio Inc.')

assert.equal(COLLECT_LADDER[0].kind, 'document')
assert.equal(COLLECT_LADDER[1].invoiceNumber, 'ONEFM-2026-013')
assert.equal(COLLECT_LADDER[1].amountIncGst, 7515.2)

const foott = COLLECT_LADDER.find((step) => step.invoiceNumber === 'ONEFM-2026-011')
assert.ok(foott)
assert.equal(foott.amountIncGst, 5500)

for (const step of COLLECT_LADDER) {
  if (!step.invoiceNumber) continue
  const row = ALL_BATCH_INVOICES.find((invoice) => invoice.number === step.invoiceNumber)
  assert.ok(row, `ladder invoice ${step.invoiceNumber} must exist in send guide`)
  assert.equal(step.amountIncGst, row.total)
}

assert.equal(
  nextCollectStep({ paperDone: true, sentNumbers: new Set() }).invoiceNumber,
  'ONEFM-2026-013',
)
assert.equal(
  nextCollectStep({
    paperDone: true,
    sentNumbers: new Set(['ONEFM-2026-013']),
  }).invoiceNumber,
  'ONEFM-2026-013',
  'D-grade send still needs the world-class PDF re-issue',
)
assert.equal(
  nextCollectStep({
    paperDone: true,
    sentNumbers: new Set(['ONEFM-2026-013']),
    reissuedNumbers: new Set(['ONEFM-2026-013']),
  }).invoiceNumber,
  'ONEFM-2026-011',
)

const billed = billedCollectTotal()
const seedTotal = ALL_BATCH_INVOICES.reduce((sum, invoice) => sum + invoice.total, 0)
assert.equal(billed, seedTotal)

for (const program of CBF_PROGRAMS) {
  assert.equal(program.amountAud, null)
}

assert.ok(CBF_PROGRAMS.some((program) => program.id === 'stolen-generations' && program.status === 'open'))
assert.ok(CBF_PROGRAMS.some((program) => program.id === 'music-hubs' && program.status === 'open'))

console.log('invoice document + collect ladder + CBF pending checks passed')

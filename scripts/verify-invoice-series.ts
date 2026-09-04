/**
 * New tax invoices mint the station series ONEFM-2026-XXX.
 * Leftover INV-2026- is DEMO billing only — do not mint it from the store.
 *
 * Run: npx vite-node scripts/verify-invoice-series.ts
 */
import { readFileSync } from 'node:fs'
import {
  nextStationInvoiceNumber,
  STATION_INVOICE_PREFIX,
} from '../src/components/ops/store.tsx'
import { realBatchInvoices } from '../src/components/ops/data/invoices.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(STATION_INVOICE_PREFIX === 'ONEFM-2026-', 'station prefix must stay ONEFM-2026-')

const foott = realBatchInvoices().find((i) => i.number === 'ONEFM-2026-011')
assert(!!foott, 'FOOTT ONEFM-2026-011 must stay on the station series')

assert(
  nextStationInvoiceNumber([]) === 'ONEFM-2026-001',
  'empty ledger starts at ONEFM-2026-001',
)
assert(
  nextStationInvoiceNumber(['ONEFM-2026-011', 'ONEFM-2026-012']) === 'ONEFM-2026-013',
  'LIVE FOOTT + Jason TV ledger must mint 013, not leftover INV-2026-001',
)
assert(
  nextStationInvoiceNumber(['INV-2026-015', 'ONEFM-2026-029']) === 'ONEFM-2026-030',
  'DEMO INV-2026 leftovers must not steal the next station number',
)
assert(
  !nextStationInvoiceNumber(['ONEFM-2026-011']).startsWith('INV-2026-'),
  'minted number must not use leftover INV-2026-',
)

const storeSrc = readFileSync('src/components/ops/store.tsx', 'utf8')
assert(
  !/nextSequential\(\s*state\.invoices\.map\(\(i\) => i\.number\),\s*'INV-2026-'/.test(storeSrc),
  'store must not mint INV-2026- from generateInvoiceFromContract / addInvoice',
)
assert(
  storeSrc.includes('nextStationInvoiceNumber(state.invoices.map((i) => i.number))'),
  'store must mint via nextStationInvoiceNumber',
)

const contractSrc = readFileSync('src/components/ops/ContractManager.tsx', 'utf8')
assert(
  !/const prefix = 'INV-2026-'/.test(contractSrc),
  'ContractManager must not replicate leftover INV-2026- numbering',
)
assert(
  contractSrc.includes('nextStationInvoiceNumber'),
  'ContractManager must share the station series helper',
)

if (fail.length) {
  console.error('verify-invoice-series failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-invoice-series ok')
console.log(`  prefix ${STATION_INVOICE_PREFIX}`)
console.log(`  after FOOTT+Jason ${nextStationInvoiceNumber(['ONEFM-2026-011', 'ONEFM-2026-012'])}`)
console.log(`  after DEMO mix ${nextStationInvoiceNumber(['INV-2026-015', 'ONEFM-2026-029'])}`)

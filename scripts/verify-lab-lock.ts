/**
 * Invoice Design Lab is a preview desk. Live send stays on Broadcast Letter.
 * Do not invent a switch-before-send.
 *
 * Run: npx vite-node scripts/verify-lab-lock.ts
 */
import { readFileSync } from 'node:fs'
import { getInvoiceDesignVariant, STATION_INVOICE_DESIGN_CHOICE } from '../src/lib/invoiceDesignVariants.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  STATION_INVOICE_DESIGN_CHOICE === 'broadcast',
  'station send must stay A · Broadcast Letter',
)
assert(
  getInvoiceDesignVariant() === STATION_INVOICE_DESIGN_CHOICE,
  'getInvoiceDesignVariant must ignore lab preview',
)

const src = readFileSync('src/components/ops/InvoiceDesignLab.tsx', 'utf8')
assert(!/Switch anytime before live send/.test(src), 'do not invent a switch-before-send')
assert(!/Pick one for the June batch/.test(src), 'do not invent that the lab picks the live send')
assert(!/persists to localStorage \+ ops store/.test(src), 'preview must not claim it writes the send lock')
assert(src.includes('Live send is locked'), 'lab must say live send is locked')
assert(src.includes('Preview only — not sent'), 'B/C preview must say it is not sent')
assert(src.includes('does not change what FOOTT is sent'), 'preview must not claim it changes FOOTT send')
assert(src.includes('This desk cannot unlock B or C'), 'footer must keep B/C locked')
assert(
  src.includes('getInvoiceDesignPreviewVariant') && src.includes('STATION_INVOICE_DESIGN_CHOICE'),
  'lab may preview locally; send lock stays on the station choice',
)

if (fail.length) {
  console.error('verify-lab-lock failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-lab-lock ok')
console.log(`  send lock ${STATION_INVOICE_DESIGN_CHOICE}`)

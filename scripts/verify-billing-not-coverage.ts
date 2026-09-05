/**
 * Lock: LIVE billing empty notes drop leftover coverage stamp.
 * Run: npx vite-node scripts/verify-billing-not-coverage.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/ops/LivePendingNote.tsx', import.meta.url), 'utf8')

if (/formatCoverageShort/.test(src)) {
  throw new Error('LivePendingNote.tsx: leftover coverage stamp is back')
}
if (/Licensed coverage is/.test(src)) {
  throw new Error('LivePendingNote.tsx: leftover Licensed coverage is copy is back')
}
if (!src.includes('DEMO figures are hidden in live mode')) {
  throw new Error('LivePendingNote.tsx: must still name that DEMO figures are hidden in live mode')
}
if (!src.includes('Revenue charts wait on station-audited data')) {
  throw new Error('LivePendingNote.tsx: must still say revenue charts wait on station-audited data')
}

// Other desks own BillingEngine leftover gold / GST override — do not steal.
const billing = readFileSync(new URL('../src/components/ops/BillingEngine.tsx', import.meta.url), 'utf8')
if (!billing.includes('ATO-filed GST figures are not loaded in live mode')) {
  throw new Error('BillingEngine.tsx: GST empty-note override must stay for #427')
}

console.log('verify-billing-not-coverage: LIVE billing empty notes drop leftover coverage stamp.')

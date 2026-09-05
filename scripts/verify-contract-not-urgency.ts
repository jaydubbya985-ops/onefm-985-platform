/**
 * Lock: Contracts expiring card names endDate, not leftover invented urgency.
 * Run: npx vite-node scripts/verify-contract-not-urgency.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/ops/ContractManager.tsx', import.meta.url), 'utf8')

if (/Needs attention/.test(src)) {
  throw new Error('ContractManager.tsx: leftover invented urgency is back')
}
if (!src.includes('subtitle="endDate this month"')) {
  throw new Error('ContractManager.tsx: expiring card must name endDate this month')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes("prefix = 'INV-2026-'")) {
  throw new Error('ContractManager.tsx: leftover INV-2026- prefix must stay for #363')
}
if (!src.includes('title="Expiring This Month"')) {
  throw new Error('ContractManager.tsx: leftover Expiring This Month title must stay')
}

console.log('verify-contract-not-urgency: Contracts expiring card names endDate, not leftover invented urgency.')

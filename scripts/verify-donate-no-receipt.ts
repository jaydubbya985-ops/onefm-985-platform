/**
 * Donate leftover: Support must not invent a receipt SLA.
 * Source: src/pages/Support.tsx
 *
 * Run: npx vite-node scripts/verify-donate-no-receipt.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/pages/Support.tsx'), 'utf8')

const leftover = [
  'confirm receipt',
  'confirm your gift',
  'Please confirm receipt once received',
]

for (const phrase of leftover) {
  if (src.includes(phrase)) {
    throw new Error(`Donate leftover invented receipt: "${phrase}"`)
  }
}

if (!src.includes('Card payments coming soon')) {
  throw new Error('Support must keep the coming-soon card line (#261).')
}

if (!src.includes('direct bank transfer')) {
  throw new Error('Support must still name bank transfer as the live path.')
}

if (!src.includes('BANK_ACCOUNT')) {
  throw new Error('Support must keep the station bank details.')
}

console.log('verify-donate-no-receipt: Support does not invent a receipt.')

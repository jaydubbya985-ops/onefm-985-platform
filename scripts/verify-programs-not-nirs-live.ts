/**
 * Lock: NIRS Sunday Afternoon AFL names the weekly-guide relay,
 * not leftover invented live regional coverage.
 * Run: npx vite-node scripts/verify-programs-not-nirs-live.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/live Sunday afternoon football coverage/i.test(src)) {
  throw new Error('Programs.tsx: leftover live Sunday afternoon football coverage is back')
}

if (!src.includes('Sunday afternoon AFL via NIRS — Match of the Day on the weekly guide.')) {
  throw new Error('Programs.tsx: NIRS Sunday AFL must name the weekly-guide relay')
}

if (!src.includes('name: "NIRS Sunday Afternoon AFL"')) {
  throw new Error('Programs.tsx: NIRS Sunday Afternoon AFL card must stay')
}

console.log('verify-programs-not-nirs-live: ok')

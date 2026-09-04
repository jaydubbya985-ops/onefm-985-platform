/**
 * Lock: Sunday Night Country names the weekly guide, not leftover perfect close.
 * Run: npx vite-node scripts/verify-programs-not-perfect.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/perfect close to the weekend/.test(src)) {
  throw new Error('Programs.tsx: leftover perfect close on Sunday Night Country is back')
}
if (!src.includes('Sunday evening country music with Sue — on the weekly guide.')) {
  throw new Error('Programs.tsx: Sunday Night Country must name the weekly guide')
}

console.log('verify-programs-not-perfect: ok')

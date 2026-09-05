/**
 * Lock: Privacy retention does not invent leftover 3 years.
 * Run: npx vite-node scripts/verify-privacy-not-three-years.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Privacy.tsx', import.meta.url), 'utf8')

if (/maximum of 3 years/.test(src)) {
  throw new Error('Privacy.tsx: leftover maximum of 3 years is back')
}
if (!src.includes('A fixed year count is data pending')) {
  throw new Error('Privacy.tsx: retention must say a fixed year count is data pending')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('issue receipts where required')) {
  throw new Error('Privacy.tsx: leftover issue receipts where required must stay for #432')
}
if (!src.includes('newsletters (only where you have opted in)')) {
  throw new Error('Privacy.tsx: leftover newsletters must stay for #432')
}
if (!src.includes('PRIVACY OFFICER')) {
  throw new Error('Privacy.tsx: leftover PRIVACY OFFICER must stay')
}

console.log('verify-privacy-not-three-years: Privacy retention does not invent leftover 3 years.')

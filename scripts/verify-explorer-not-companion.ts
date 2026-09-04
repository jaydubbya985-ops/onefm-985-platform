/**
 * Broadcast Explorer breakfast names rotating weekday hosts from the weekly
 * guide — not leftover invented "essential morning companion".
 * Run: npx tsx scripts/verify-explorer-not-companion.ts
 */
import { readFileSync } from 'node:fs'

const explorer = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')
const guide = readFileSync(new URL('../src/data/programGuide.ts', import.meta.url), 'utf8')
const programs = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/essential morning companion/i.test(explorer)) {
  throw new Error('Broadcast Explorer breakfast card still invents leftover essential morning companion')
}
if (/essential morning companion/i.test(guide)) {
  throw new Error('PROGRAM_PREVIEW_CARDS breakfast still invents leftover essential morning companion')
}
if (!explorer.includes('rotating weekday hosts from the weekly guide')) {
  throw new Error('Broadcast Explorer breakfast card must name rotating weekday hosts from the weekly guide')
}
if (!guide.includes('music from the weekly guide')) {
  throw new Error('PROGRAM_PREVIEW_CARDS breakfast must source copy from the weekly guide')
}
// Leftover LIVE CALLS stays for #460 — do not remap in this PR.
if (!explorer.includes('LIVE CALLS')) {
  throw new Error('Do not remap leftover LIVE CALLS in this PR')
}
// Leftover Four years stays for #214 — do not remap in this PR.
if (!guide.includes('Four years on air')) {
  throw new Error('Do not remap leftover Four years in this PR')
}
// Programs leftover essential companion stays for #440 — do not remap in this PR.
if (!/essential morning companion/i.test(programs)) {
  throw new Error('Do not remap leftover Programs essential companion in this PR')
}

console.log('verify-explorer-not-companion: ok')

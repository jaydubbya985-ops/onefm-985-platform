/**
 * Football ROI card names sport guide days + quoted match-day spots —
 * not leftover invented GVL packages sitting beside the clock.
 * Run: npx tsx scripts/verify-footy-not-beside.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

if (/GVL packages sit beside/i.test(src)) {
  throw new Error('Football ROI card still invents leftover GVL packages sit beside')
}
if (!src.includes('Sport on the weekly guide is {SPORT_GUIDE_DAYS}')) {
  throw new Error('Football ROI card must name sourced sport guide days')
}
if (!src.includes('GVL match-day spots are quoted separately')) {
  throw new Error('Football ROI card must say match-day spots are quoted separately')
}
// Leftover perfect tier stays for #430 — do not remap in this PR.
if (!src.includes('perfect sponsorship tier')) {
  throw new Error('Do not remap leftover perfect sponsorship tier in this PR')
}
// Leftover sponsorship team stays for #418 — do not remap in this PR.
if (!src.includes('Our sponsorship team will be in touch')) {
  throw new Error('Do not remap leftover sponsorship team in this PR')
}
// Leftover thousands stays for #384 — do not remap in this PR.
if (!src.includes('in front of thousands')) {
  throw new Error('Do not remap leftover thousands in this PR')
}

console.log('verify-footy-not-beside: ok')

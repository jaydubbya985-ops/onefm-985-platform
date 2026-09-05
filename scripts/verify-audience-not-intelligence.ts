/**
 * Lock: Audience H1 names modelled ABS 2021 reach, not leftover intelligence.
 * Run: npx vite-node scripts/verify-audience-not-intelligence.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')

if (/AUDIENCE INTELLIGENCE/i.test(src)) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INTELLIGENCE is back')
}
if (!src.includes('MODELLED AUDIENCE')) {
  throw new Error('AudienceAnalytics.tsx: heading must name modelled ABS 2021 audience')
}
if (!src.includes('formatCoverageShort()') || !src.includes('ABS 2021 via townData')) {
  throw new Error('AudienceAnalytics.tsx: H1 subline must stay sourced from coverageCopy / townData')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('DEMOGRAPHIC DEEP DIVE')) {
  throw new Error('AudienceAnalytics.tsx: leftover DEMOGRAPHIC DEEP DIVE must stay for another desk')
}
if (!src.includes('PLATFORM PERFORMANCE') || !src.includes('Where your audience connects')) {
  throw new Error('AudienceAnalytics.tsx: leftover PLATFORM PERFORMANCE must stay for another desk')
}
if (!src.includes('USE YOUR DATA')) {
  throw new Error('AudienceAnalytics.tsx: leftover USE YOUR DATA must stay for another desk')
}
if (!src.includes('AUDIENCE INSIGHTS')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INSIGHTS must stay for another desk')
}

console.log('verify-audience-not-intelligence: Audience H1 names modelled ABS 2021 reach.')

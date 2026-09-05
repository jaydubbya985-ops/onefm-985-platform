/**
 * Lock: Audience census heading names Greater Shepparton LGA, not leftover deep dive.
 * Run: npx vite-node scripts/verify-audience-not-deep-dive.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')

if (/DEMOGRAPHIC DEEP DIVE/i.test(src)) {
  throw new Error('AudienceAnalytics.tsx: leftover DEMOGRAPHIC DEEP DIVE is back')
}
if (!src.includes('WordReveal text="GREATER SHEPPARTON LGA"')) {
  throw new Error('AudienceAnalytics.tsx: heading must name Greater Shepparton LGA from townData / ABS 2021')
}
if (!src.includes('Greater Shepparton LGA (ABS 2021)') || !src.includes('not a measured ONE FM listener survey')) {
  throw new Error('AudienceAnalytics.tsx: LGA subline must stay sourced from ABS 2021 via townData')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('AUDIENCE INTELLIGENCE')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INTELLIGENCE must stay for #515')
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

console.log('verify-audience-not-deep-dive: Audience census heading names Greater Shepparton LGA.')

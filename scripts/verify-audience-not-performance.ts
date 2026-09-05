/**
 * Lock: Audience channels heading names FM, stream, Facebook, SoundCloud — not leftover performance.
 * Run: npx vite-node scripts/verify-audience-not-performance.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')

if (/PLATFORM PERFORMANCE/i.test(src)) {
  throw new Error('AudienceAnalytics.tsx: leftover PLATFORM PERFORMANCE is back')
}
if (/Where your audience connects/i.test(src)) {
  throw new Error('AudienceAnalytics.tsx: leftover Where your audience connects is back')
}
if (!src.includes('WordReveal text="FM, STREAM, FACEBOOK, SOUNDCLOUD"')) {
  throw new Error('AudienceAnalytics.tsx: heading must name FM, stream, Facebook, SoundCloud')
}
if (!src.includes('confirmedSocialNote()') || !src.includes('Radio.co stream counts: data pending')) {
  throw new Error('AudienceAnalytics.tsx: subline must stay Facebook and SoundCloud only, stream counts pending')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('AUDIENCE INTELLIGENCE')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INTELLIGENCE must stay for #515')
}
if (!src.includes('DEMOGRAPHIC DEEP DIVE')) {
  throw new Error('AudienceAnalytics.tsx: leftover DEMOGRAPHIC DEEP DIVE must stay for #517')
}
if (!src.includes('USE YOUR DATA')) {
  throw new Error('AudienceAnalytics.tsx: leftover USE YOUR DATA must stay for another desk')
}
if (!src.includes('AUDIENCE INSIGHTS')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INSIGHTS must stay for another desk')
}

console.log('verify-audience-not-performance: Audience channels heading names FM, stream, Facebook, SoundCloud.')

/**
 * Lock: Audience heatmap heading names weekly listeners — not leftover HOUR-BY-HOUR.
 * Run: npx vite-node scripts/verify-audience-not-hourly.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')

if (/HOUR-BY-HOUR LISTENING/.test(src)) {
  throw new Error('AudienceAnalytics.tsx: leftover HOUR-BY-HOUR LISTENING is back')
}
if (!src.includes('Weekly listeners, not an hourly grid')) {
  throw new Error('AudienceAnalytics.tsx: heatmap heading must name weekly listeners, not an hourly grid')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('AUDIENCE INTELLIGENCE')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INTELLIGENCE must stay for #515')
}
if (!src.includes('DEMOGRAPHIC DEEP DIVE')) {
  throw new Error('AudienceAnalytics.tsx: leftover DEMOGRAPHIC DEEP DIVE must stay for #517')
}
if (!src.includes('PLATFORM PERFORMANCE')) {
  throw new Error('AudienceAnalytics.tsx: leftover PLATFORM PERFORMANCE must stay for #519')
}
if (!src.includes('USE YOUR DATA')) {
  throw new Error('AudienceAnalytics.tsx: leftover USE YOUR DATA must stay')
}
if (!src.includes('AUDIENCE INSIGHTS')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE INSIGHTS must stay')
}
if (!src.includes('AUDIENCE TRENDS')) {
  throw new Error('AudienceAnalytics.tsx: leftover AUDIENCE TRENDS must stay')
}
if (!src.includes('Goulburn Murray')) {
  throw new Error('AudienceAnalytics.tsx: leftover Murray must stay for #445')
}

console.log('verify-audience-not-hourly: Audience heatmap heading names weekly listeners, not leftover hour-by-hour.')

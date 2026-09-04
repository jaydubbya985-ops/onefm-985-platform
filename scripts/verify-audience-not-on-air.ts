/**
 * Lock: Audience FM card names licensed year, not leftover On air.
 * Run: npx vite-node scripts/verify-audience-not-on-air.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')

if (/status: 'On air'/.test(src)) {
  throw new Error('AudienceAnalytics.tsx: leftover On air FM status is back')
}
if (!src.includes('BRAND.licensed')) {
  throw new Error(`AudienceAnalytics.tsx: FM card must name licensed ${BRAND.licensed}`)
}

console.log('verify-audience-not-on-air: ok')

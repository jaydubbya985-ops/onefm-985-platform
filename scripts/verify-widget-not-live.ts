/**
 * Lock: Home live player names a missing stream track, not leftover invented
 * LIVE ON AIR completeness when Radio.co has not named a title.
 * Run: npx vite-node scripts/verify-widget-not-live.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(
  new URL('../src/components/home/LivePlayerWidget.tsx', import.meta.url),
  'utf8',
)

if (/LIVE ON AIR/.test(src)) {
  throw new Error('LivePlayerWidget.tsx: leftover LIVE ON AIR completeness claim is back')
}

if (!src.includes('NO STREAM TRACK') || !src.includes('no stream track listed')) {
  throw new Error(
    'LivePlayerWidget.tsx: empty now-playing state must name that no stream track is listed',
  )
}

console.log('verify-widget-not-live: ok')

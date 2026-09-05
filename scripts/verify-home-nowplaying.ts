/**
 * Lock: Home hero names the Radio.co track, not only the ticker.
 * Run: npx vite-node scripts/verify-home-nowplaying.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')

if (!src.includes('♪ {meta.nowPlaying}')) {
  throw new Error('Home.tsx: hero must print ♪ nowPlaying — ticker-only is not enough')
}
if (!src.includes('aria-live="polite"')) {
  throw new Error('Home.tsx: now-playing must announce when the track changes')
}
if (!src.includes('usePlayerMetadata') || !src.includes('liveNowFromMetadata')) {
  throw new Error('Home.tsx: keep liveNowFromMetadata + usePlayerMetadata')
}

console.log('verify-home-nowplaying: Home hero names the stream track.')

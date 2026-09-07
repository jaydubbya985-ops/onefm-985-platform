/**
 * Lock: first-visit splash names 98.5 — not leftover ON AIR.
 * Run: npx vite-node scripts/verify-splash-not-on-air.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-splash-not-on-air FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/PageLoader.tsx', import.meta.url), 'utf8')
assert(!/ON AIR/.test(src), 'PageLoader must not leftover ON AIR on a splash that is not the live stream')
assert(src.includes('ONE FM · SHEPPARTON · 98.5'), 'splash must name the frequency, not leftover live')
assert(src.includes('useReducedMotion'), 'splash must not hold when reduced motion is on')
assert(src.includes('towerStarsNight'), 'keep the transmitter-night archive still')

console.log('verify-splash-not-on-air: splash names 98.5, not leftover ON AIR.')

/**
 * Lock: Home hero Listen pill pulses only when live, not leftover always-on pulse.
 * Run: npx vite-node scripts/verify-hero-pill-not-always.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-hero-pill-not-always FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')
const hero = src.slice(src.indexOf('function Hero()'), src.indexOf('function NameWall()'))

assert(hero.includes('live.isLive ? ('), 'Home hero pill must gate the pulse on live.isLive')
assert(hero.includes('animate-pulse'), 'live hours still pulse')
assert(hero.includes('bg-white/40'), 'automated hours keep a still dim dot')
assert(!/function Hero\(\)[\s\S]*<span className="w-2 h-2 rounded-full bg-white animate-pulse" \/>/.test(src), 'leftover always-on hero pulse is back')

console.log('verify-hero-pill-not-always: Home hero Listen pill pulses only when live.')

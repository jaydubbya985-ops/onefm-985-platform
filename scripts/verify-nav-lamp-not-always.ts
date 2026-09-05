/**
 * Lock: OnAirNav lamp pulses only when metadata is live, not leftover always-on ping.
 * Run: npx vite-node scripts/verify-nav-lamp-not-always.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-nav-lamp-not-always FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/OnAirNav.tsx', import.meta.url), 'utf8')

assert(src.includes('meta.isLive && !reduced'), 'OnAirNav lamp must gate animate-ping on metadata isLive')
assert(src.includes("aria-label={meta.isLive ? 'On air' : 'Automated mix'}"), 'lamp must name automated when not live')
assert(!/title=\{meta\.isLive \? 'On air' : 'Automated'\}>\s*<span className="lamp-ring"/.test(src), 'leftover always-on lamp-ring ping is back')

console.log('verify-nav-lamp-not-always: OnAirNav lamp pulses only when metadata is live.')

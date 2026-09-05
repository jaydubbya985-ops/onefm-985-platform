/**
 * Fail if the home signal divider still uses leftover old gold or ignores reduced motion.
 * Run: npx vite-node scripts/verify-signal-divider-not-gold.ts
 */
import { readFileSync } from 'node:fs'

const divider = readFileSync(new URL('../src/components/SignalDivider.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-signal-divider-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

assert(!/212,\s*175,\s*55/.test(divider), 'SignalDivider must not use leftover rgba(212,175,55)')
assert(!/#D4AF37/i.test(divider), 'SignalDivider must not use leftover #D4AF37')
assert(divider.includes('useReducedMotion'), 'SignalDivider must respect prefers-reduced-motion')
assert(divider.includes("animation: reduced"), 'freq bars must skip infinite animation when reduced motion is on')
assert(divider.includes('BRAND_COLORS'), 'SignalDivider must source colour from brand tokens')
assert(home.includes('SignalDivider'), 'Home must render SignalDivider — leftover unused chrome')

console.log('verify-signal-divider-not-gold: ok')

/**
 * Menu chrome names the sourced weekly listener figure — not leftover Est.
 * Run: npx vite-node scripts/verify-nav-not-est.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const nav = readFileSync(resolve('src/components/OnAirNav.tsx'), 'utf8')

assert(
  !/Est\.\s*\{formatWeeklyListenersPlain\(\)\}/.test(nav),
  'OnAirNav must not prefix leftover Est. onto the weekly listener figure',
)
assert(
  nav.includes('{formatWeeklyListenersPlain()} weekly listeners'),
  'OnAirNav must still speak the sourced weekly listener figure',
)
assert(
  nav.includes("from '@/lib/coverageCopy'"),
  'OnAirNav must keep coverageCopy as the listener source',
)

if (fail.length) {
  console.error('verify-nav-not-est failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-nav-not-est: ok')

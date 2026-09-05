/**
 * Fail if Football GVL packages still wear leftover invented rank badges.
 * No survey ranks Champion / Premier / Signature. Cards show sourced $/week.
 *
 * Run: npx vite-node scripts/verify-footy-rank-badges.ts
 */
import { readFileSync } from 'node:fs'
import { footballTiers } from '../src/data/pricing'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-footy-rank-badges FAIL: ${message}`)
    process.exit(1)
  }
}

const football = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')
const pricing = readFileSync(new URL('../src/data/pricing.ts', import.meta.url), 'utf8')

for (const leftover of ['MOST POPULAR', 'BEST VALUE', 'ULTIMATE']) {
  assert(!football.includes(leftover), `Football must not render leftover ${leftover}`)
  assert(!pricing.includes(`badge: '${leftover}'`), `pricing.ts must not mint leftover ${leftover}`)
}

assert(!/popular:\s*true/.test(football), 'Football must not lift a leftover most-popular card')
assert(!/bestValue:\s*true/.test(football), 'Football must not lift a leftover best-value card')
assert(!/crown:\s*true/.test(football), 'Football must not crown a leftover ultimate card')
assert(!football.includes('tier.badge'), 'Football must not paint leftover pricing badges')

assert(
  footballTiers.every((t) => !('badge' in t) || !(t as { badge?: string }).badge),
  'footballTiers must not carry leftover rank badges',
)

console.log('verify-footy-rank-badges OK — GVL packages are sourced $/week, not leftover rank')

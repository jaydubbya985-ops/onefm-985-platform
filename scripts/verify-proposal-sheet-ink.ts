/**
 * Fail if the on-screen proposal sheet still wears leftover Heritage navy.
 * Direction A ink is #101010 (one-navy).
 *
 * Run: npx vite-node scripts/verify-proposal-sheet-ink.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND_COLORS } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-proposal-sheet-ink FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/OpsProposalSheet.tsx', import.meta.url), 'utf8')

assert(!src.includes('#071D3A'), 'OpsProposalSheet must not name leftover Heritage navy #071D3A')
assert(src.includes('text-one-navy') || src.includes('#101010'), 'proposal sheet text must use Direction A ink')
assert(src.includes('bg-one-navy') || src.includes('bg-[#101010]'), 'proposal sheet footer bar must sit on Direction A ink')
assert(BRAND_COLORS.navy === '#101010', `BRAND_COLORS.navy must stay Direction A ink, got ${BRAND_COLORS.navy}`)

console.log('verify-proposal-sheet-ink OK — proposal paper uses Direction A ink, not leftover navy')

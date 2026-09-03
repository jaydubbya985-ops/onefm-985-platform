/**
 * Fail if the public MediaKit token pack drifts from src/lib/brand.ts.
 * Run: npx vite-node scripts/verify-brand-tokens.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BRAND_COLORS } from '../src/lib/brand.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-brand-tokens FAIL: ${message}`)
    process.exit(1)
  }
}

const tokens = JSON.parse(readFileSync(resolve('public/brand/brand-tokens.json'), 'utf8')) as {
  core: Record<string, string>
  premium: Record<string, string>
  fluoro: Record<string, string>
}

assert(tokens.core['ONE FM Blue'] === BRAND_COLORS.blue, `blue ${tokens.core['ONE FM Blue']}`)
assert(tokens.core['Broadcast White'] === BRAND_COLORS.white, `white ${tokens.core['Broadcast White']}`)
assert(tokens.core['98.5 Red'] === BRAND_COLORS.red, `red ${tokens.core['98.5 Red']}`)
assert(
  tokens.premium['Deep Broadcast Navy'] === BRAND_COLORS.navy,
  `navy ${tokens.premium['Deep Broadcast Navy']} !== ${BRAND_COLORS.navy}`,
)
assert(
  tokens.premium['Heritage Gold'] === BRAND_COLORS.gold,
  `gold ${tokens.premium['Heritage Gold']} !== ${BRAND_COLORS.gold}`,
)
assert(
  tokens.premium['Champagne Highlight'] === BRAND_COLORS.champagne,
  `champagne ${tokens.premium['Champagne Highlight']} !== ${BRAND_COLORS.champagne}`,
)
assert(tokens.premium['Heritage Gold'] === '#F2F2F2', 'Direction A gold is paper white')
assert(!JSON.stringify(tokens).includes('#D4AF37'), 'must not ship leftover #D4AF37')
assert(!JSON.stringify(tokens).includes('#D4A84B'), 'must not ship leftover #D4A84B')
assert(!JSON.stringify(tokens).includes('#F4D27A'), 'must not ship leftover champagne gold')

console.log('verify-brand-tokens OK')

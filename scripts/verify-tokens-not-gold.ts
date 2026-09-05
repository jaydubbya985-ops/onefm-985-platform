/**
 * Fail the build if the public brand-token download still ships leftover gold.
 * Run: npx vite-node scripts/verify-tokens-not-gold.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-tokens-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

const json = readFileSync(new URL('../public/brand/brand-tokens.json', import.meta.url), 'utf8')
const css = readFileSync(new URL('../public/brand/brand-tokens.css', import.meta.url), 'utf8')
const kit = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')
const brand = readFileSync(new URL('../src/lib/brand.ts', import.meta.url), 'utf8')

assert(
  !/#D4AF37/i.test(json) && !/#D4AF37/i.test(css),
  'brand-tokens must not ship leftover gold #D4AF37',
)
assert(
  !/212\s*,\s*175\s*,\s*55/.test(css),
  'brand-tokens.css must not use leftover gold 212,175,55',
)
assert(
  json.includes('"Heritage Gold": "#F2F2F2"'),
  'downloaded Heritage Gold must match live BRAND_COLORS.gold #F2F2F2',
)
assert(
  json.includes('"Champagne Highlight": "#F2F2F2"'),
  'downloaded Champagne must match live BRAND_COLORS.champagne #F2F2F2',
)
assert(
  css.includes('--onefm-gold: #F2F2F2'),
  'brand-tokens.css Heritage Gold token must be #F2F2F2',
)
assert(
  brand.includes("gold:    '#F2F2F2'"),
  'src/lib/brand.ts already remapped Heritage Gold — download must not diverge',
)
assert(
  kit.includes('/brand/brand-tokens.json'),
  'Media Kit still offers the token download — leftover gold would ship to sponsors',
)

console.log('verify-tokens-not-gold OK')

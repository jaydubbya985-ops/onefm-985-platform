/**
 * Fail if the tab favicon still ships leftover navy or leftover gold.
 * Run: npx vite-node scripts/verify-favicon-direction-a.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BRAND, BRAND_COLORS } from '../src/lib/brand.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-favicon-direction-a FAIL: ${message}`)
    process.exit(1)
  }
}

const svg = readFileSync(resolve('public/brand/favicon.svg'), 'utf8')

assert(svg.includes(`aria-label="${BRAND.name}"`) || svg.includes("aria-label='ONE FM'"), 'missing ONE FM aria-label')
assert(svg.includes(BRAND_COLORS.navy), `missing Direction A navy ${BRAND_COLORS.navy}`)
assert(svg.includes(BRAND_COLORS.red), `missing 98.5 red ${BRAND_COLORS.red}`)
assert(svg.includes(BRAND_COLORS.blue), `missing ONE FM blue ${BRAND_COLORS.blue}`)
assert(!svg.includes('#0A1628'), 'must not ship leftover #0A1628 navy')
assert(!/#D4A84B|#F0C75E|#D4AF37|#D4A853/i.test(svg), 'must not ship leftover heritage gold')
assert(!/39,?375|189,?680/.test(svg), 'must not invent reach in the favicon')
assert(!svg.includes('linearGradient'), 'gold gradient lockup is leftover — Direction A is navy / red / paper')

console.log(svg.trim())
console.log('verify-favicon-direction-a OK')

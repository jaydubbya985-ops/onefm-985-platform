/**
 * Fail if Home feature portals still wash leftover navy #071D3A.
 * Direction A ink is #101010 (BRAND_COLORS.navy).
 * Run: npx vite-node scripts/verify-feature-portal-ink.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BRAND_COLORS } from '../src/lib/brand'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-feature-portal-ink FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(resolve('src/components/FeaturePortal.tsx'), 'utf8')

assert(BRAND_COLORS.navy === '#101010', `BRAND_COLORS.navy must be Direction A #101010, got ${BRAND_COLORS.navy}`)
assert(!src.includes('7,29,58'), 'FeaturePortal must not hardcode leftover navy rgb(7,29,58)')
assert(!/#071[Dd]3[Aa]/.test(src), 'FeaturePortal must not hardcode leftover navy #071D3A')
assert(src.includes('inkA('), 'FeaturePortal overlay must use Direction A inkA()')
assert(src.includes('BRAND_COLORS.navy'), 'FeaturePortal ink must come from BRAND_COLORS.navy')

console.log('verify-feature-portal-ink OK')

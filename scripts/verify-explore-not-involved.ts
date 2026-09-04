/**
 * Lock: Explore Contact tile names the studio, not leftover Get involved.
 * Run: npx vite-node scripts/verify-explore-not-involved.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'

const src = readFileSync(new URL('../src/components/home/ExploreOneFMGrid.tsx', import.meta.url), 'utf8')

if (/desc: 'Get involved'/.test(src)) {
  throw new Error('ExploreOneFMGrid.tsx: leftover Get involved Contact tile is back')
}
if (!src.includes('BRAND.phone') || !src.includes('email the studio')) {
  throw new Error(`ExploreOneFMGrid.tsx: Contact tile must name ${BRAND.phone} / studio email`)
}

console.log('verify-explore-not-involved: ok')

/**
 * Fail if the Heritage archive still dresses the 1989 licence as founding.
 * Live fm985.com.au/contact: established 1980, licensed 1989.
 * Run: npx vite-node scripts/verify-est-eighty.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand.ts'

function assert(cond: boolean, message: string) {
  if (!cond) {
    console.error(`verify-est-eighty FAIL: ${message}`)
    process.exit(1)
  }
}

assert(BRAND.established === 1980, `BRAND.established must be 1980, got ${BRAND.established}`)
assert(BRAND.licensed === 1989, `BRAND.licensed must be 1989, got ${BRAND.licensed}`)

const src = readFileSync(new URL('../src/components/HorizontalGallery.tsx', import.meta.url), 'utf8')

assert(!src.includes('Est. 1989'), 'Heritage gallery must not print leftover Est. 1989')
assert(
  src.includes('BRAND.established') && src.includes('BRAND.licensed'),
  'Born Here caption must read established / licensed from BRAND',
)
assert(src.includes('BRAND.org'), 'Born Here caption must name the licensed entity from BRAND.org')
assert(
  !src.includes('Goulburn Valley Community Radio — Est.'),
  'do not keep the leftover abbreviated Est. line',
)

console.log('verify-est-eighty OK')

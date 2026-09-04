/**
 * Public contact line includes the licensed PO Box from fm985.com.au/contact/.
 * Do not invent a different box. Street stays 47 Parkside Drive.
 *
 * Run: npx vite-node scripts/verify-postal-box.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(BRAND.address.includes('47 Parkside Drive, Shepparton VIC 3630'), 'studio street must stay 47 Parkside Drive')
assert(BRAND.address.includes('PO Box 4034'), 'public address must include licensed PO Box 4034')
assert(BRAND.postal === 'PO Box 4034, Shepparton VIC 3630', 'postal field must match fm985.com.au/contact/')
assert(!/PO Box 403[0-35-9]/.test(BRAND.address + BRAND.postal), 'do not invent a different PO Box')
assert(!BRAND.address.includes('PO Box 4034, Shepparton VIC 3630, Shepparton'), 'do not duplicate the town on the street line')

const src = readFileSync('src/lib/brand.ts', 'utf8')
assert(
  src.includes('fm985.com.au/contact/'),
  'brand.ts must cite fm985.com.au/contact/',
)
assert(src.includes("postal: 'PO Box 4034, Shepparton VIC 3630'"), 'postal field must stay the licensed box')

if (fail.length) {
  console.error('verify-postal-box failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-postal-box ok')
console.log(`  address ${BRAND.address}`)
console.log(`  postal  ${BRAND.postal}`)

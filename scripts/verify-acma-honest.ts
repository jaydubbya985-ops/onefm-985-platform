/**
 * Footer legal bar is callsign + licensed year — not leftover APRA 1385226/1 as ACMA.
 * Run: npx vite-node scripts/verify-acma-honest.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'
import { formatLicenceChrome, isLeftoverApraAsAcma } from '../src/lib/licenceCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-acma-honest FAIL: ${message}`)
    process.exit(1)
  }
}

const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')

assert(formatLicenceChrome() === '3ONE · licensed 1989', `chrome line: ${formatLicenceChrome()}`)
assert(formatLicenceChrome().includes(BRAND.callsign), 'chrome must name callsign 3ONE')
assert(formatLicenceChrome().includes(String(BRAND.licensed)), 'chrome must name licensed 1989')
assert(!formatLicenceChrome().includes('1385226'), 'chrome must not print leftover APRA 1385226/1')
assert(!isLeftoverApraAsAcma(formatLicenceChrome()), 'chrome must not dress APRA as ACMA')

assert(
  isLeftoverApraAsAcma('3ONE · ACMA 1385226/1'),
  'detector must catch leftover Footer ACMA 1385226/1',
)
assert(
  isLeftoverApraAsAcma('ACMA License: 1385226/1'),
  'detector must catch leftover Contact ACMA License line',
)
assert(
  !isLeftoverApraAsAcma('3ONE · licensed 1989'),
  'honest chrome is not leftover APRA-as-ACMA',
)

assert(footer.includes('formatLicenceChrome()'), 'Footer must use formatLicenceChrome')
assert(!footer.includes('BRAND.acma'), 'Footer must not print BRAND.acma')
assert(!footer.includes('1385226'), 'Footer must not hardcode leftover APRA 1385226/1')
assert(!/ACMA \{/.test(footer), 'Footer must not label leftover number as ACMA')

console.log('verify-acma-honest OK')

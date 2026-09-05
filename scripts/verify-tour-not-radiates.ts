/**
 * Fail if the coverage-map tour still sells leftover advertiser puffery.
 * Studio / sponsor / GVL captions name sourced facts — not radiates / already on air.
 * Run: npx vite-node scripts/verify-tour-not-radiates.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/lib/coverageMapVisuals.ts', import.meta.url), 'utf8')

const leftover = [
  /your brand radiates/i,
  /already on air/i,
  /trusted Valley businesses/i,
  /broadcast heartland/i,
  /Ready to reach the Valley/i,
  /enquire about sponsorship/i,
]

for (const re of leftover) {
  if (re.test(src)) {
    console.error(`verify-tour-not-radiates FAIL: leftover ${re} on coverage-map tour`)
    process.exit(1)
  }
}

if (!src.includes('not a live on-air roster')) {
  console.error('verify-tour-not-radiates FAIL: sponsor stop must name invoice pins, not a live roster')
  process.exit(1)
}
if (!src.includes('clubs on the coverage map')) {
  console.error('verify-tour-not-radiates FAIL: GVL stop must count coverage-map clubs')
  process.exit(1)
}
if (!src.includes('enquire via Contact')) {
  console.error('verify-tour-not-radiates FAIL: closer must name Contact, not leftover sponsorship CTA')
  process.exit(1)
}

console.log('verify-tour-not-radiates: ok')

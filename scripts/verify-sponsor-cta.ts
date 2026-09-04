/**
 * Fail if the sponsor CTA dresses leftover PARTNER UP / gold equalizer chrome.
 * Run: npx vite-node scripts/verify-sponsor-cta.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/components/SponsorCommercialCta.tsx'), 'utf8')

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message)
}

assert(!src.includes('PARTNER UP'), 'leftover PARTNER UP cursor label')
assert(!src.includes('freq-bar'), 'leftover gold equalizer bars')
assert(!src.includes('rgba(201,162,39'), 'leftover Heritage Gold freq-bar fill')
assert(!src.includes('rgba(212,168,75'), 'leftover Heritage Gold hairline')
assert(!src.includes('text-gold-gradient'), 'leftover gold section label')
assert(!src.includes('formatCoverageShort'), 'do not stamp coverage onto this CTA')
assert(!src.includes('formatBreakfastChromeLabel'), 'do not stamp breakfast onto this CTA')
assert(!src.includes('GVL_PREMIUM_BADGE'), 'do not stamp GVL hours onto this CTA')
assert(src.includes('data-cursor-label="SPONSOR"'), 'honest SPONSOR cursor label')
assert(src.includes('to="/coverage"'), 'coverage map link')
assert(src.includes('to="/proposal"'), 'proposal link')
assert(src.includes('to="/contact"'), 'contact link')

console.log('verify-sponsor-cta OK')

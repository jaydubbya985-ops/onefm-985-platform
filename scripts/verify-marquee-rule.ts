/**
 * Default marquee separator is a hairline — not a GVL match-day still.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/Marquee.tsx', import.meta.url), 'utf8')

assert.match(src, /MarqueeRule/)
assert.match(src, /role="region"/)
assert.match(src, /aria-label="Station notes"/)
assert.doesNotMatch(src, /STATION_PHOTOS/)
assert.doesNotMatch(src, /obMatchDayBanner/)
assert.doesNotMatch(src, /MatchDayBannerMark/)
assert.doesNotMatch(src, /formatCoverage/)
assert.doesNotMatch(src, /24\/7/)

console.log('verify-marquee-rule: ok')

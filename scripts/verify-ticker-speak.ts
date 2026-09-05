/**
 * Fail if the on-air ticker hides its facts from assistive tech.
 * Run: npx vite-node scripts/verify-ticker-speak.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-ticker-speak FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync('src/components/onair/kit.tsx', 'utf8')
const ticker = src.slice(src.indexOf('export function OnAirTicker'), src.indexOf('export interface WallRow'))

assert(ticker.includes('sr-only'), 'Ticker facts must be spoken once (sr-only)')
assert(ticker.includes('aria-hidden'), 'The duplicated marquee stays decorative')
assert(!ticker.includes('formatCoverageShort'), 'Do not stamp coverage onto the ticker kit')
assert(!/24\/7|24-7/.test(ticker), 'Do not invent 24/7 on the ticker kit')
assert(!/Station archive still/.test(ticker), 'Do not restamp cinegraph archive-still credit')
assert(!ticker.includes('HOST_PHOTOS'), 'No unlabeled host faces')

console.log('verify-ticker-speak OK — ticker facts are spoken once')

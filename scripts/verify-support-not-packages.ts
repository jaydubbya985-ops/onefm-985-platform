/**
 * Donate leftover opened leftover /sponsorship packages on the Sponsor card.
 * Home #438 / Explore #439 / Map #444 already ask for a proposal. This card must match.
 *
 * Run: npx vite-node scripts/verify-support-not-packages.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Support.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/View packages/.test(src), 'Support must not keep leftover View packages')
assert(!/to="\/sponsorship"/.test(src), 'Support Sponsor card must not open leftover /sponsorship packages')
assert(src.includes('Request a proposal'), 'Support Sponsor card must name Request a proposal')
assert(src.includes('to="/proposal"'), 'Support Sponsor card must open the proposal form')
assert(src.includes('to="/contact"'), 'Support Volunteer card must keep Contact')
assert(src.includes('>Sponsor<'), 'Support must keep the Sponsor card')

if (fail.length) {
  console.error('verify-support-not-packages failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-support-not-packages: ok')

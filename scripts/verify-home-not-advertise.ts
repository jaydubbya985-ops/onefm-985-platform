/**
 * Home leftover advertised leftover /sponsorship packages.
 * OnAirNav already asks for a proposal. The hero second CTA must match.
 *
 * Run: npx vite-node scripts/verify-home-not-advertise.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Advertise With Us/.test(src), 'Home must not keep leftover Advertise With Us')
assert(!/to="\/sponsorship"/.test(src), 'Home must not open leftover /sponsorship packages')
assert(src.includes('Request a proposal'), 'Home hero must name Request a proposal')
assert(src.includes('to="/proposal"'), 'Home hero must open the proposal form')
assert(src.includes('Full Program Guide →'), 'Home hero must keep the weekly guide')
assert(src.includes('to="/programs"'), 'Home hero must keep /programs')

if (fail.length) {
  console.error('verify-home-not-advertise failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-home-not-advertise: ok')

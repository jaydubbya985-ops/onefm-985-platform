/**
 * Coverage map leftover advertised leftover /sponsorship packages.
 * Hero already asks for a proposal. Sponsor pins and the pin sheet must match.
 * Station pin already opens /listen — do not label it Advertise.
 *
 * Run: npx vite-node scripts/verify-map-not-advertise.ts
 */
import { readFileSync } from 'node:fs'

const map = readFileSync(new URL('../src/pages/CoverageMap.tsx', import.meta.url), 'utf8')
const pins = readFileSync(new URL('../src/data/coverageMapPins.ts', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Advertise with ONE FM/.test(map), 'Coverage map must not keep leftover Advertise with ONE FM')
assert(!/'ADVERTISE'/.test(map), 'Coverage map pin sheet must not use leftover ADVERTISE cursor')
assert(map.includes('Request a proposal'), 'Coverage map must name Request a proposal')
assert(map.includes('to="/proposal"'), 'Coverage map hero must keep the proposal form')
assert(map.includes('Listen live'), 'Station pin must name Listen live — not leftover Advertise')
assert(map.includes('View GVL packages'), 'Football pin must keep View GVL packages')
assert(!pins.includes("'/sponsorship'"), 'Sponsor pins must not open leftover /sponsorship packages')
assert(pins.includes("'/proposal'"), 'Sponsor pins must open the proposal form')
assert(pins.includes("link: '/listen'"), 'Station pin must keep /listen')
assert(pins.includes("link: '/football'"), 'Football pins must keep /football')

if (fail.length) {
  console.error('verify-map-not-advertise failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-map-not-advertise: ok')

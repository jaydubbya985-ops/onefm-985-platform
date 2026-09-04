/**
 * Home explore leftover opened leftover /sponsorship packages.
 * OnAirNav already asks for a proposal. The Sponsor ONE FM tile must match.
 *
 * Run: npx vite-node scripts/verify-explore-not-packages.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/home/ExploreOneFMGrid.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/path: '\/sponsorship'/.test(src), 'Explore grid must not open leftover /sponsorship packages')
assert(src.includes("title: 'Sponsor ONE FM'"), 'Explore grid must keep Sponsor ONE FM')
assert(src.includes("path: '/proposal'"), 'Explore grid Sponsor tile must open the proposal form')
assert(src.includes("title: 'Listen Live'"), 'Explore grid must keep Listen Live')
assert(src.includes("title: 'Programs'"), 'Explore grid must keep Programs')

if (fail.length) {
  console.error('verify-explore-not-packages failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-explore-not-packages: ok')

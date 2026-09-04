/**
 * Broadcast Explorer leftover invented a studio tour.
 * Contact is the station enquiry page — not a booked tour.
 *
 * Run: npx vite-node scripts/verify-explorer-not-tour.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Tour the Studio/.test(src), 'Broadcast Explorer must not invent leftover Tour the Studio')
assert(src.includes('Contact the station'), 'Broadcast Explorer Behind the Mic must name Contact the station')
assert(
  src.includes('to="/contact"'),
  'Broadcast Explorer Behind the Mic must keep the Contact page',
)
assert(
  src.includes('View Station Heritage →'),
  'Broadcast Explorer Behind the Mic must keep Heritage',
)

if (fail.length) {
  console.error('verify-explorer-not-tour failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-explorer-not-tour: ok')

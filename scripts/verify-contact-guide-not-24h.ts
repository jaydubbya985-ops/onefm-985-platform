/**
 * Contact leftover invented a 24-hour live desk on the hero marquee.
 * Overnight Mix is automated midnight–6am. Weekday breakfast hours come from the guide.
 *
 * Run: npx vite-node scripts/verify-contact-guide-not-24h.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/On air 24 hours/.test(src), 'Contact hero must not invent leftover On air 24 hours')
assert(
  src.includes('Weekly guide · ${BREAKFAST_SHOW} ${BREAKFAST_TIME} weekdays'),
  'Contact hero marquee must name the weekly guide and breakfast hours from programGuide',
)

if (fail.length) {
  console.error('verify-contact-guide-not-24h failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-contact-guide-not-24h: ok')

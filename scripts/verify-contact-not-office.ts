/**
 * Contact leftover invented office-hours drop-in on the volunteer FAQ.
 * Training and studio times are confirmed with the station — not leftover office hours.
 *
 * Run: npx vite-node scripts/verify-contact-not-office.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/drop by the studio during office hours/.test(src), 'Contact must not invent leftover office-hours drop-in')
assert(!/Training is provided/.test(src), 'Contact must not invent leftover Training is provided')
assert(
  src.includes('The station confirms training and studio times with you'),
  'Contact volunteer FAQ must say the station confirms training and studio times',
)
assert(src.includes('Volunteering'), 'Contact must keep the Volunteering enquiry path')
assert(src.includes('Can I volunteer at the station?'), 'Contact must keep the volunteer FAQ')

if (fail.length) {
  console.error('verify-contact-not-office failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-contact-not-office: ok')

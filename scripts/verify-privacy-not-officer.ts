/**
 * Privacy leftover invented PRIVACY OFFICER role.
 * Enquiries go to the station — not leftover designated officer.
 *
 * Run: npx vite-node scripts/verify-privacy-not-officer.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Privacy.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/PRIVACY OFFICER/.test(src), 'Privacy must not invent leftover PRIVACY OFFICER')
assert(src.includes('PRIVACY ENQUIRIES'), 'Privacy contact card must name privacy enquiries')
assert(src.includes('BRAND.email'), 'Privacy must keep the station email')
assert(src.includes('BRAND.org'), 'Privacy must keep the licensed entity')

if (fail.length) {
  console.error('verify-privacy-not-officer failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-privacy-not-officer: ok')

/**
 * Donate leftover invented a membership gate for volunteering.
 * Contact already takes volunteering enquiries. This page does not sell memberships.
 *
 * Run: npx vite-node scripts/verify-donate-not-member.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Support.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/membership required/i.test(src), 'Donate must not invent leftover membership-required')
assert(
  src.includes('ask via Contact. This page does not sell memberships.'),
  'Donate volunteer card must point at Contact and refuse leftover membership sales',
)
assert(src.includes('to="/contact"'), 'Donate volunteer card must still route to Contact')

if (fail.length) {
  console.error('verify-donate-not-member failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-donate-not-member: ok')

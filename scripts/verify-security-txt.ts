/**
 * Fail if security.txt invents a team or omits the sourced station contact.
 * Run: npx vite-node scripts/verify-security-txt.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-security-txt FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('public/.well-known/security.txt'), 'utf8')

if (!src.includes('Contact: mailto:admin@fm985.com.au')) {
  fail('must list the sourced station email')
}
if (!src.includes('Contact: tel:+61-3-5831-3131')) {
  fail('must list the sourced studio phone')
}
if (!src.includes('Expires: 2027-06-04T04:00:00.000Z')) {
  fail('must expire inside a year — do not leave an open-ended file')
}
if (src.includes('39375') || src.includes('39,375') || src.includes('189680')) {
  fail('must not invent reach figures')
}
if (/plemo|ciso|security@/i.test(src)) {
  fail('must not invent a security team or leftover host name')
}

console.log('verify-security-txt: ok — sourced station contact only')

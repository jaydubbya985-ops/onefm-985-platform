/**
 * Privacy must not invent a 3-year deletion SLA.
 * Run: npx vite-node scripts/verify-retain-honest.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-retain-honest FAIL: ${message}`)
    process.exit(1)
  }
}

const privacy = readFileSync(resolve('src/pages/Privacy.tsx'), 'utf8')

assert(!/3 years/i.test(privacy), 'Privacy must not invent a 3-year retention SLA')
assert(!/securely deleted/i.test(privacy), 'Privacy must not invent a deletion day')
assert(
  privacy.includes('does not publish a fixed deletion day'),
  'Privacy must say the deletion day is unpublished',
)
assert(
  privacy.includes('BRAND.email'),
  'Privacy retention points people at the station email',
)

console.log('verify-retain-honest OK')

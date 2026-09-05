/**
 * Fail if the Facebook panel still invents leftover studio moments.
 * Run: npx vite-node scripts/verify-facebook-not-moments.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-facebook-not-moments FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/social/FacebookPanel.tsx', import.meta.url), 'utf8')

assert(
  !/Studio moments and multicultural programming/.test(src),
  'leftover invented studio-moments still in FacebookPanel',
)
assert(
  /Station archive still — not a Facebook studio feed/.test(src),
  'sourced no-studio-moments line missing',
)
assert(
  /facebook\.com\/onefmshepparton/.test(src),
  'confirmed Facebook page missing from studio-archive caption',
)
assert(
  /Festivals, markets, and Valley happenings/.test(src),
  'do not restamp leftover festival on the adjacent card',
)

console.log('verify-facebook-not-moments: leftover studio-moments gone; archive still named')

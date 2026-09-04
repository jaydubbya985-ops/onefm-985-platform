/**
 * Listen interview states do not invent leftover check-back-soon.
 * Run: npx vite-node scripts/verify-interviews-not-soon.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/components/LatestInterviews.tsx'), 'utf8')

assert(!/check back soon/i.test(page), 'Interviews must not invent leftover check back soon')
assert(!/try again shortly/i.test(page), 'Interviews must not invent leftover try-again-soon')
assert(
  !/check back soon or visit fm985\.com\.au/i.test(page),
  'Interview error must not invent leftover WordPress recovery',
)
assert(
  page.includes('Interviews could not be loaded from the station feed'),
  'Interview error must name a failed station feed',
)
assert(
  page.includes('No sourced interviews in this feed yet'),
  'Interview empty state must say no sourced interviews yet',
)
assert(page.includes('LatestInterviews'), 'Interview section must remain')

if (fail.length) {
  console.error('verify-interviews-not-soon failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-interviews-not-soon: ok')

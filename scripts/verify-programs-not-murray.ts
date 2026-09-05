/**
 * Programs leftover branded three show cards as Goulburn Murray.
 * Licensed entity and sibling cards already say Goulburn Valley.
 * Do not touch the leftover podcasts card (#289 / #160).
 *
 * Run: npx vite-node scripts/verify-programs-not-murray.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  !src.includes('issues that matter to the Goulburn Murray'),
  'James Manley card must not invent leftover Goulburn Murray',
)
assert(
  !src.includes('Filipino community across the Goulburn Murray'),
  'Filipino card must not invent leftover Goulburn Murray',
)
assert(
  !src.includes('Arabic-speaking community of the Goulburn Murray'),
  'Arabic card must not invent leftover Goulburn Murray',
)
assert(
  src.includes('issues that matter to the Goulburn Valley'),
  'James Manley card must name Goulburn Valley',
)
assert(
  src.includes('Filipino community across the Goulburn Valley'),
  'Filipino card must name Goulburn Valley',
)
assert(
  src.includes('Arabic-speaking community of the Goulburn Valley'),
  'Arabic card must name Goulburn Valley',
)

if (fail.length) {
  console.error('verify-programs-not-murray failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-programs-not-murray: ok')

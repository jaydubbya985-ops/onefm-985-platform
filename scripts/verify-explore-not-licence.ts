/**
 * Explore leftover Heritage since 1989 (licence year as established date).
 * Station history: established 1980, licensed 1 April 1989.
 *
 * Run: npx vite-node scripts/verify-explore-not-licence.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/home/ExploreOneFMGrid.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Heritage since 1989/.test(src), 'Explore Our Story tile must not dress leftover licence 1989 as established')
assert(src.includes('Heritage since 1980'), 'Explore Our Story tile must name established 1980')
assert(src.includes("title: 'Our Story'"), 'Explore must keep the Our Story tile')
assert(src.includes("path: '/heritage'"), 'Explore Our Story tile must keep /heritage')

if (fail.length) {
  console.error('verify-explore-not-licence failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-explore-not-licence: ok')

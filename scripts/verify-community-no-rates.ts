/**
 * Community is civic — towns, multicultural programs, coverage.
 * It must not mount leftover sponsor inventory (InventoryLadder / rate card).
 * Run: npx vite-node scripts/verify-community-no-rates.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-community-no-rates FAIL: ${message}`)
    process.exit(1)
  }
}

const community = readFileSync(new URL('../src/pages/Community.tsx', import.meta.url), 'utf8')

assert(!community.includes('InventoryLadder'), 'Community must not import or mount InventoryLadder')
assert(!community.includes('Where the premiums sit'), 'Community must not print leftover inventory ladder chrome')
assert(!community.includes('STANDARD_SPOT'), 'Community must not print leftover standard-spot rates')
assert(community.includes('MULTICULTURAL_PROGRAM'), 'Community must keep sourced multicultural programs')
assert(community.includes('formatTowns'), 'Community must keep sourced towns')
assert(community.includes("to=\"/coverage\""), 'Community must keep the coverage map path')

console.log('verify-community-no-rates OK')

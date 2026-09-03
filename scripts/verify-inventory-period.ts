/**
 * Fail if rate-card copy still defaults to leftover Q1 2026.
 * Run: npx vite-node scripts/verify-inventory-period.ts
 */
import { readFileSync } from 'node:fs'
import {
  currentRatePeriod,
  gstExclusiveNote,
  GVL_PREMIUM_INTRO,
  GVL_PREMIUM_SEO,
} from '../src/lib/inventoryCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-inventory-period FAIL: ${message}`)
    process.exit(1)
  }
}

const q1 = currentRatePeriod(new Date('2026-02-01T00:00:00+11:00'))
assert(q1 === 'Q1 2026', `Feb Melbourne is Q1: ${q1}`)

const q3 = currentRatePeriod(new Date('2026-09-03T12:00:00+10:00'))
assert(q3 === 'Q3 2026', `Sep Melbourne is Q3: ${q3}`)

const q4 = currentRatePeriod(new Date('2026-12-15T12:00:00+11:00'))
assert(q4 === 'Q4 2026', `Dec Melbourne is Q4: ${q4}`)

const note = gstExclusiveNote()
assert(!note.includes('Q1 2026') || currentRatePeriod() === 'Q1 2026', `default note must follow today: ${note}`)
assert(/Effective Q[1-4] 20\d\d — rates plus GST/.test(note), `note shape: ${note}`)
assert(GVL_PREMIUM_INTRO.includes(note), 'GVL intro must carry the current GST period')
assert(GVL_PREMIUM_SEO.includes(note), 'GVL SEO must carry the current GST period')
assert(/not the \$25 standard spot/.test(GVL_PREMIUM_INTRO), 'GVL stays premium')

const src = readFileSync(new URL('../src/lib/inventoryCopy.ts', import.meta.url), 'utf8')
assert(!src.includes("period = 'Q1 2026'"), 'do not hard-code Q1 2026 as the gstExclusiveNote default')
assert(src.includes('currentRatePeriod'), 'period must come from Melbourne civil time')
assert(src.includes('Australia/Melbourne'), 'use Melbourne, not UTC')

console.log('verify-inventory-period OK')
console.log(JSON.stringify({ q1, q3, q4, note }, null, 2))

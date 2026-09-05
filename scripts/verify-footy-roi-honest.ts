/**
 * Fail if Football still invents an ROI win vs leftover alternatives.
 * The table is ONE FM only. Comparisons are data pending.
 *
 * Run: npx vite-node scripts/verify-footy-roi-honest.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-footy-roi-honest FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

assert(!src.includes('BETTER VALUE THAN THE ALTERNATIVES'), 'Football must not invent leftover better-value-than-alternatives')
assert(!src.includes('WHY RADIO WINS'), 'Football must not invent leftover why-radio-wins')
assert(!src.includes('other local advertising options'), 'Football must not invent leftover print/TV alternatives')
assert(!src.includes('loyal audience'), 'Football must not invent leftover loyal-audience lift')
assert(src.includes('SOURCED WEEKLY LISTENERS'), 'Football reach heading must name sourced weekly listeners')
assert(src.includes('data pending'), 'Football must say newspaper/print/TV comparisons are data pending')

console.log('verify-footy-roi-honest OK — reach table is ONE FM sourced, not leftover alternatives')

/**
 * Audience leftover invented Goulburn Murray on the FM platform card.
 * Licensed coverage is Goulburn Valley via coverageCopy — not leftover Murray.
 *
 * Run: npx vite-node scripts/verify-audience-not-murray.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/AudienceAnalytics.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Goulburn Murray/.test(src), 'Audience must not invent leftover Goulburn Murray')
assert(
  src.includes('share: formatCoverageShort()'),
  'Audience FM card must source coverage from formatCoverageShort()',
)
assert(src.includes("title: 'FM Radio'"), 'Audience must keep the FM Radio platform card')
assert(src.includes("stat: '98.5 FM'"), 'Audience FM card must keep 98.5 FM')

if (fail.length) {
  console.error('verify-audience-not-murray failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-audience-not-murray: ok')

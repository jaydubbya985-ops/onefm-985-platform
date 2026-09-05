/**
 * Community stats strip must not label 189,680 as ABS 2021.
 * That figure is townData 2026 estimates. Weekly listeners 39,375 is ABS 2021.
 * Run: npx vite-node scripts/verify-community-pop.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { broadcastPopulationCount, coverageStatsStrip } from '../src/lib/coverageCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-community-pop FAIL: ${message}`)
    process.exit(1)
  }
}

const community = readFileSync(resolve('src/pages/Community.tsx'), 'utf8')
const leftoverAbsOnPop = 'People in broadcast area (ABS 2021 via townData)'
const honestPop = 'People in broadcast area (townData 2026 est.)'

assert(broadcastPopulationCount() === 189680, 'broadcast pop must stay 189,680 from townData 2026 estimates')
assert(
  coverageStatsStrip().some((row) => row.t === honestPop && row.n === '189,680'),
  'coverageStatsStrip must source 189,680 as townData 2026 estimates',
)
assert(!community.includes(leftoverAbsOnPop), 'Community must not label broadcast pop as ABS 2021')
assert(community.includes(honestPop), 'Community must label broadcast pop as townData 2026 estimates')
assert(community.includes('formatBroadcastPopulation'), 'Community must use formatBroadcastPopulation()')

console.log('verify-community-pop OK')

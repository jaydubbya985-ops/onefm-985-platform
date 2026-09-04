/**
 * Football closer must use sourced weekly listeners — not leftover “thousands”.
 * Run: npx vite-node scripts/verify-footy-thousands.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { weeklyListenersValue } from '../src/lib/coverageCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-footy-thousands FAIL: ${message}`)
    process.exit(1)
  }
}

const football = readFileSync(resolve('src/pages/Football.tsx'), 'utf8')

assert(!/in front of thousands/i.test(football), 'Football must not invent “thousands” reach')
assert(
  !/puts your brand in front of thousands/i.test(football),
  'leftover unsourced thousands CTA is still on the page',
)

const closer = football.slice(football.indexOf('READY TO SPONSOR LOCAL FOOTBALL?'))
assert(closer.includes('weeklyListenersValue()'), 'closer must print weeklyListenersValue()')
assert(closer.includes('ABS 2021 via townData'), 'closer must name the ABS 2021 via townData source')

const sourced = weeklyListenersValue()
assert(sourced === '39,375', `weekly listeners must stay 39,375 from townData, got ${sourced}`)

console.log('verify-footy-thousands OK — closer uses', sourced, 'weekly listeners (ABS 2021 via townData)')

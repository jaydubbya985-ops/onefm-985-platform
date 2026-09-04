/**
 * Proposal demo copy must not label 189,680 as ABS 2021.
 * 189,680 is townData 2026 estimates. Weekly listeners 39,375 stay ABS 2021.
 * Run: npx vite-node scripts/verify-ai-pop.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = readFileSync(fileURLToPath(new URL('../src/lib/ai.ts', import.meta.url)), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-ai-pop FAIL: ${message}`)
    process.exit(1)
  }
}

assert(
  /formatBroadcastPopulation\(\).*townData 2026 est/.test(source),
  'broadcast population in proposal copy must say townData 2026 est.',
)

const popAsAbs = source.match(/formatBroadcastPopulation\(\)[\s\S]{0,80}ABS 2021/)
assert(!popAsAbs, 'formatBroadcastPopulation() must not be labelled ABS 2021')

assert(
  /weeklyListenersValue\(\)[\s\S]{0,80}ABS 2021/.test(source),
  'weekly listeners may stay labelled ABS 2021',
)

console.log('verify-ai-pop OK')

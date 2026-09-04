/**
 * Decade Dial empty state does not invent a leftover archive hunt.
 * Run: npx vite-node scripts/verify-archive-no-hunt.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const dial = readFileSync(resolve('src/components/archive/DecadeDial.tsx'), 'utf8')

assert(!/hunt in progress/i.test(dial), 'DecadeDial must not invent a leftover archive hunt')
assert(
  dial.includes('No sourced evidence cards for this decade yet.'),
  'DecadeDial empty decade must say no sourced cards yet',
)
assert(dial.includes("cardsForDecade(active)"), 'DecadeDial must still read cards from livingArchive')

if (fail.length) {
  console.error('verify-archive-no-hunt failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-archive-no-hunt: ok')

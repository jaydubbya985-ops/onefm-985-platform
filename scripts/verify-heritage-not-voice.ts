/**
 * Heritage leftover sold invented Voice of GV language as “Legends & Voices”.
 * Named portraits are Di Hunter and Sally Nayler only. Tagline is Live and Local.
 *
 * Run: npx vite-node scripts/verify-heritage-not-voice.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Heritage.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Legends & Voices/.test(src), 'Heritage must not keep leftover Legends & Voices')
assert(!/Voices of the Valley/.test(src), 'Heritage must not keep leftover Voices of the Valley')
assert(!/Voice of the Goulburn/.test(src), 'Heritage must not keep leftover Voice of the Goulburn Valley')
assert(src.includes('Named portraits'), 'Heritage NameWall must name Named portraits')
assert(src.includes("Di Hunter"), 'Heritage must keep named portrait Di Hunter')
assert(src.includes('Sally Nayler'), 'Heritage must keep named portrait Sally Nayler')

if (fail.length) {
  console.error('verify-heritage-not-voice failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-heritage-not-voice: ok')

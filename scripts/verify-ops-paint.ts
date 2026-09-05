/**
 * Prove public pages do not wait on ops-config before first paint.
 * Run: npx vite-node scripts/verify-ops-paint.ts
 */
import { readFileSync } from 'node:fs'
import { isOpsHash } from '../src/lib/opsRoute.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(isOpsHash('#/ops') === true, '#/ops is the ops desk')
assert(isOpsHash('#/ops/') === true, '#/ops/ is the ops desk')
assert(isOpsHash('#/ops?tab=payments') === true, '#/ops? is the ops desk')
assert(isOpsHash('#/listen') === false, '#/listen must not wait on ops-config')
assert(isOpsHash('#/') === false, 'Home must not wait on ops-config')
assert(isOpsHash('#/programs') === false, 'Programs must not wait on ops-config')
assert(isOpsHash('') === false, 'empty hash is not ops')

const src = readFileSync('src/lib/supabase.ts', 'utf8')
assert(src.includes("from '@/lib/opsRoute'"), 'supabase init must import isOpsHash')
assert(src.includes('isOpsHash'), 'supabase init must gate the ops-config wait')
assert(
  src.includes('fetchOpsConfigFromFunction'),
  'ops-config fetch must be extractable so public paint can skip the wait',
)
assert(
  /if\s*\(\s*!isOpsHash/.test(src) || /if\s*\(\s*!isOpsHash\(/.test(src),
  'public routes must skip the ops-config await',
)

const main = readFileSync('src/main.tsx', 'utf8')
assert(
  main.includes('initSupabaseFromRuntime'),
  'main still boots after init — init itself must return immediately off /ops',
)

if (fail.length) {
  console.error('verify-ops-paint FAILED:\n' + fail.map((m) => `  - ${m}`).join('\n'))
  process.exit(1)
}

console.log('verify-ops-paint OK')

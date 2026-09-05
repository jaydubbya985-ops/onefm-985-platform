/**
 * Fail if the route chrome still fakes a completed load.
 * Run: npx vite-node scripts/verify-load-honest.ts
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-load-honest FAIL: ${message}`)
    process.exit(1)
  }
}

const here = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(here, '../src/components/RouteProgressBar.tsx'), 'utf8')

assert(src.includes('export function RouteProgressBar'), 'App still mounts RouteProgressBar')
assert(/return null/.test(src), 'bar must not render leftover chrome')
assert(!src.includes('setTimeout'), 'must not finish a load on a timer')
assert(!src.includes('setWidth'), 'must not invent a percent complete')
assert(!src.includes('shimmerBar'), 'must not sweep a fake gradient')
assert(!src.includes('useLocation'), 'must not restart leftover chrome on hash change')

console.log('verify-load-honest OK')

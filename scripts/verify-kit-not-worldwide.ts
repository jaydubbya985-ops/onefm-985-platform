/**
 * Fail if the media kit leftover Worldwide stream reach is still on the page.
 * Run: npx vite-node scripts/verify-kit-not-worldwide.ts
 */
import { readFileSync } from 'node:fs'
import { formatCoverageShort } from '../src/lib/coverageCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-kit-not-worldwide FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')

assert(!/reach:\s*'Worldwide'/.test(src), 'MediaKit must not invent leftover worldwide stream reach')
assert(src.includes('formatCoverageShort()'), 'MediaKit live-stream reach must use formatCoverageShort')
assert(
  formatCoverageShort() === '25 towns · 100km radius',
  `formatCoverageShort must stay sourced, got ${formatCoverageShort()}`,
)

console.log('verify-kit-not-worldwide OK')

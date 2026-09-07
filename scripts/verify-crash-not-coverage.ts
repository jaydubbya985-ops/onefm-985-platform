/**
 * Lock: crash chrome names a failed load — not leftover coverage or leaked errors.
 * Run: npx vite-node scripts/verify-crash-not-coverage.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-crash-not-coverage FAIL: ${message}`)
    process.exit(1)
  }
}

const crash = readFileSync(new URL('../src/components/CrashFallback.tsx', import.meta.url), 'utf8')
assert(crash.includes("This page didn't load") || crash.includes('This page didn&apos;t load'), crash)
assert(crash.includes('Nothing was sent to the station from this screen'), 'must not leftover a sent-to-station crash')
assert(!crash.includes('formatCoverageShort'), 'crash chrome must not leftover a coverage stamp')
assert(!crash.includes('error.message'), 'must not print internals to listeners')
assert(crash.includes('href="#/"'), 'Home must be HashRouter #/ so the root boundary (outside Router) still works')
assert(!/text-one-gold/.test(crash), 'crash chrome must not leftover gold')

const root = readFileSync(new URL('../src/components/ErrorBoundary.tsx', import.meta.url), 'utf8')
assert(root.includes('CrashFallback'), 'root boundary must use shared crash chrome')
assert(!root.includes('formatCoverageShort'), 'ErrorBoundary must not leftover coverage')
assert(!root.includes('Something went wrong'), 'ErrorBoundary must not leftover generic chrome')

const route = readFileSync(new URL('../src/components/RouteErrorBoundary.tsx', import.meta.url), 'utf8')
assert(route.includes('CrashFallback'), 'route boundary must use shared crash chrome')
assert(!route.includes('formatCoverageShort'), 'RouteErrorBoundary must not leftover coverage')
assert(!route.includes('error?.message'), 'must not leak error.message on the public crash page')
assert(!route.includes('Something went wrong'), 'RouteErrorBoundary must not leftover generic chrome')

console.log('verify-crash-not-coverage: crash chrome names a failed load, not leftover coverage.')

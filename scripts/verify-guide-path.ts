/**
 * Program Guide chrome opens /programs — not leftover Listen Live.
 * Run: npx vite-node scripts/verify-guide-path.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-guide-path FAIL: ${message}`)
    process.exit(1)
  }
}

const nav = readFileSync(new URL('../src/lib/siteNav.ts', import.meta.url), 'utf8')

const guideInListenGroup = nav.match(
  /label: 'Listen'[\s\S]*?label: 'Program Guide', path: '([^']+)'/,
)
assert(guideInListenGroup?.[1] === '/programs', 'Listen dropdown Program Guide must open /programs, not leftover /listen')

const programsJob = nav.match(/label: 'Programs',\s*path: '([^']+)'/)
assert(programsJob?.[1] === '/programs', 'Home Programs job must open /programs, not leftover /listen')

assert(nav.includes("label: 'Listen Live', path: '/listen'"), 'Listen Live must stay on /listen')
assert(nav.includes("path: '/programs'"), 'siteNav must keep the /programs route')

const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')
assert(home.includes('to="/programs"'), 'Home hero Full Program Guide must stay on /programs')

console.log('verify-guide-path OK')

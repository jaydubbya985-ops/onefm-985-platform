/**
 * Fail if /playhq-test.html still solicits a PlayHQ key or fetches their API.
 * Run: npx vite-node scripts/verify-playhq-test-page.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-playhq-test-page FAIL: ${message}`)
    process.exit(1)
  }
}

const html = readFileSync(resolve('public/playhq-test.html'), 'utf8')

assert(!/api\.playhq\.com/i.test(html), 'must not call api.playhq.com from this page')
assert(!/x-api-key/i.test(html), 'must not ask for an x-api-key header')
assert(!/Paste your PlayHQ API key/i.test(html), 'must not solicit an API key')
assert(!/testPublic|testWithKey|testGVL/.test(html), 'must not keep the leftover test harness')
assert(!/#D4A84B/i.test(html), 'must not use leftover heritage gold #D4A84B')
assert(/data pending/i.test(html), 'must say scores are data pending')
assert(/Saturday 1PM–3PM/.test(html), 'must name GVL hours from the official guide')
assert(/Goulburn Valley Community Radio Inc\./.test(html), 'must name the licensed entity')
assert(/#\/football/.test(html), 'must point to the Football page')
assert(!/Round 4/i.test(html), 'must not invent a round result')

console.log('verify-playhq-test-page OK')

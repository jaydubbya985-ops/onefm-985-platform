/**
 * Offline banner must name the dial and the stream — not a live-now count.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { OFFLINE_LISTEN_COPY } from '../src/lib/offlineListen.ts'

const loader = readFileSync(new URL('../src/components/PageLoader.tsx', import.meta.url), 'utf8')
const banner = readFileSync(new URL('../src/components/OfflineListenBanner.tsx', import.meta.url), 'utf8')
const lib = readFileSync(new URL('../src/lib/offlineListen.ts', import.meta.url), 'utf8')

assert.match(loader, /OfflineListenBanner/)
assert.match(banner, /OFFLINE_LISTEN_COPY/)
assert.match(banner, /role="status"/)
assert.match(lib, /navigator\.onLine/)
assert.match(lib, /offline/)
assert.match(lib, /online/)

assert.match(OFFLINE_LISTEN_COPY, /98\.5 FM/)
assert.match(OFFLINE_LISTEN_COPY, /live stream needs a connection/)
assert.doesNotMatch(OFFLINE_LISTEN_COPY, /24\/7/)
assert.doesNotMatch(OFFLINE_LISTEN_COPY, /listeners/)
assert.doesNotMatch(OFFLINE_LISTEN_COPY, /ON AIR/)
assert.doesNotMatch(lib, /formatCoverage/)
assert.doesNotMatch(banner, /formatCoverage/)

console.log('verify-offline-listen: ok')

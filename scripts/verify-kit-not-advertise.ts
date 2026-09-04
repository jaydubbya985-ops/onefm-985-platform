/**
 * Media kit leftover Advertise hero on the rate card.
 * The page is the media kit — not leftover Advertise With Us.
 *
 * Run: npx vite-node scripts/verify-kit-not-advertise.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Advertise with ONE FM · Shepparton/.test(src), 'Media kit must not invent leftover Advertise hero')
assert(src.includes('Media kit · Shepparton'), 'Media kit hero must name the media kit')
assert(src.includes('Shepparton'), 'Media kit must keep Shepparton')

if (fail.length) {
  console.error('verify-kit-not-advertise failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-kit-not-advertise: ok')

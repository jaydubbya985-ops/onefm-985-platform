/**
 * Broadcast Explorer leftover invented a PREVIEW play control.
 * Expanded signature segments do not have on-demand clips.
 * Official next steps: listen live on this site, or open the weekly guide.
 *
 * Run: npx vite-node scripts/verify-explorer-not-preview.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/\bPREVIEW\b/.test(src), 'Broadcast Explorer must not invent leftover PREVIEW')
assert(
  !/See Full Schedule/.test(src),
  'Broadcast Explorer must not loop leftover See Full Schedule back onto /broadcast',
)
assert(src.includes('to="/listen"'), 'Broadcast Explorer signature row must keep Listen live')
assert(src.includes('LISTEN LIVE'), 'Broadcast Explorer signature row must name Listen live')
assert(src.includes('to="/programs"'), 'Broadcast Explorer signature row must keep the weekly guide')
assert(src.includes('Weekly guide →'), 'Broadcast Explorer signature row must name the weekly guide')

if (fail.length) {
  console.error('verify-explorer-not-preview failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-explorer-not-preview: ok')

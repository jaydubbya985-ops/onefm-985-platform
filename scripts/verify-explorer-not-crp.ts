/**
 * Broadcast Explorer leftover invented a Community Radio Plus listing.
 * CRP is a national CBAA app — not a verified ONE FM destination.
 * Official listen: 98.5 FM, Radio.co stream, fm985.com.au web player, studio phone.
 *
 * Run: npx vite-node scripts/verify-explorer-not-crp.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/\bCR\+/.test(src), 'Broadcast Explorer must not advertise leftover CR+')
assert(
  !/Community Radio Plus/i.test(src),
  'Broadcast Explorer must not advertise leftover Community Radio Plus',
)
assert(
  src.includes("name: '98.5 FM'"),
  'Broadcast Explorer listen CTA must keep 98.5 FM',
)
assert(src.includes("name: 'Web'"), 'Broadcast Explorer listen CTA must keep the official web player')
assert(src.includes("name: 'Studio'"), 'Broadcast Explorer listen CTA must keep the studio phone')
assert(
  src.includes('{LISTEN_LINKS.fm.label} · {LISTEN_LINKS.web.label} · studio {LISTEN_LINKS.phone.description}'),
  'Broadcast Explorer tune-in line must name FM, the web player, and the studio — not leftover CRP',
)

if (fail.length) {
  console.error('verify-explorer-not-crp failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-explorer-not-crp: ok')

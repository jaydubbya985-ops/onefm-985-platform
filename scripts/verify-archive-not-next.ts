/**
 * Interview archive leftover invented next-broadcast SLA.
 * Empty playable lists name SoundCloud — not leftover “check back after the next broadcast”.
 *
 * Run: npx vite-node scripts/verify-archive-not-next.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/social/SoundCloudPanel.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/check back after the next broadcast/i.test(src), 'SoundCloudPanel must not invent leftover next-broadcast SLA')
assert(!/next broadcast/i.test(src), 'SoundCloudPanel must not promise leftover next broadcast')
assert(
  src.includes('No playable audio in this list'),
  'SoundCloudPanel empty list must name no playable audio',
)
assert(src.includes('SOUNDCLOUD_PROFILE_URL'), 'SoundCloudPanel must keep the SoundCloud archive link')
assert(src.includes('Interview Archive'), 'SoundCloudPanel must keep the interview archive title')

if (fail.length) {
  console.error('verify-archive-not-next failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-archive-not-next: ok')

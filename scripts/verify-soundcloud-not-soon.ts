/**
 * SoundCloud interview panel must name a failed or empty feed —
 * not leftover “check back after the next broadcast”.
 * Run: npx vite-node scripts/verify-soundcloud-not-soon.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: unknown, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/components/social/SoundCloudPanel.tsx'), 'utf8')

assert(!/check back after the next broadcast/i.test(page), 'SoundCloud panel must not invent leftover next-broadcast recovery')
assert(!/check back soon/i.test(page), 'SoundCloud panel must not invent leftover check back soon')
assert(
  !/and fm985\.com\.au — check back/i.test(page),
  'SoundCloud empty state must not invent leftover WordPress recovery',
)
assert(
  page.includes('The interview archive could not be loaded from the station feed'),
  'SoundCloud error must name a failed station feed',
)
assert(
  page.includes('No playable interviews in this SoundCloud feed'),
  'SoundCloud empty state must name no playable interviews',
)
assert(page.includes('feedError'), 'SoundCloud panel must track a failed feed separately from empty')
assert(page.includes('SOUNDCLOUD_PROFILE_URL'), 'SoundCloud panel must keep the confirmed archive link')

if (fail.length) {
  console.error('verify-soundcloud-not-soon failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-soundcloud-not-soon: ok')

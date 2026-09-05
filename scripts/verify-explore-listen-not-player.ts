/**
 * Lock: Explore Listen Live opens /listen, not leftover WordPress audio-player bounce.
 * Run: npx vite-node scripts/verify-explore-listen-not-player.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-explore-listen-not-player FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/home/ExploreOneFMGrid.tsx', import.meta.url), 'utf8')

assert(!src.includes("path: 'https://fm985.com.au/audio-player/'"), 'Explore Listen Live must not bounce to the WordPress audio player')
assert(src.includes("title: 'Listen Live'"), 'Explore must keep a Listen Live tile')
assert(/title: 'Listen Live'[\s\S]{0,180}path: '\/listen'/.test(src), 'Listen Live tile must open /listen')

// Other desks own these leftovers — do not steal their remaps.
assert(src.includes('Listen, the guide, and the Valley'), 'leftover heading lock for #478 must stay')
assert(src.includes("desc: 'Get involved'"), 'leftover Get involved Contact tile must stay for #453')

console.log('verify-explore-listen-not-player: Explore Listen Live opens /listen.')

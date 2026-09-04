/**
 * Facebook panel leftover invented festival / behind-the-mic highlights.
 * The book-stall and studio stills are station archive — not leftover Facebook events.
 *
 * Run: npx vite-node scripts/verify-facebook-not-festivals.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/social/FacebookPanel.tsx', import.meta.url), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(!/Festivals, markets, and Valley happenings/i.test(src), 'Facebook panel must not invent leftover festival highlights')
assert(!/Community events/.test(src), 'Facebook panel must not invent leftover community-events Facebook cards')
assert(!/Behind the mic/i.test(src), 'Facebook panel must not invent leftover behind-the-mic Facebook')
assert(!/Studio moments and multicultural programming/i.test(src), 'Facebook panel must not invent leftover studio-moment Facebook')
assert(!/eventFoodTrucks/.test(src), 'Facebook panel must not use leftover food-truck festival fallback')
assert(
  src.includes('Community book stall — station archive'),
  'Facebook panel book-stall still must name station archive',
)
assert(
  src.includes('Studio microphone — station archive'),
  'Facebook panel studio still must name station archive',
)
assert(
  src.includes("formatGuideHours('GVL Match of the Day')"),
  'Facebook panel GVL card must keep sourced weekly-guide hours',
)
assert(
  src.includes('FACEBOOK_PAGE_URL'),
  'Facebook panel must still open the confirmed Facebook page',
)

if (fail.length) {
  console.error('verify-facebook-not-festivals failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-facebook-not-festivals: ok')

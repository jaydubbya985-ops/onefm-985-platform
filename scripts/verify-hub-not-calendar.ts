/**
 * Fail if Social Hub leftover invents a campaign-calendar CMS heading.
 * Run: npx vite-node scripts/verify-hub-not-calendar.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-hub-not-calendar FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')

assert(!/text="CAMPAIGN CALENDAR"/.test(src), 'SocialHub must not invent leftover Campaign Calendar heading')
assert(!/data-cursor-label="CAMPAIGN PLAN"/.test(src), 'SocialHub must not invent leftover Campaign Plan cursor')
assert(src.includes('POSTING CADENCE'), 'SocialHub heading must name posting cadence from the guide')
assert(
  src.includes('not a fixture list'),
  'SocialHub cadence copy must stay honest — not a leftover fixture list',
)

console.log('verify-hub-not-calendar OK')

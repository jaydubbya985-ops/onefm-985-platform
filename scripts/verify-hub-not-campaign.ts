/**
 * Fail if Social Hub leftover invents a campaign-tools suite in the hero eyebrow.
 * Run: npx vite-node scripts/verify-hub-not-campaign.ts
 */
import { readFileSync } from 'node:fs'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '../src/lib/socialLinks'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-hub-not-campaign FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')

assert(!/Content Tools/.test(src), 'SocialHub must not invent leftover Content Tools')
assert(!/Campaign Templates/.test(src), 'SocialHub must not invent leftover Campaign Templates')
assert(src.includes('Facebook · SoundCloud · station brand'), 'SocialHub hero must name confirmed channels')
assert(FACEBOOK_PAGE_URL.includes('onefmshepparton'), 'Facebook must stay the sourced page')
assert(SOUNDCLOUD_PROFILE_URL.includes('user-570295409'), 'SoundCloud must stay the sourced profile')

console.log('verify-hub-not-campaign OK')

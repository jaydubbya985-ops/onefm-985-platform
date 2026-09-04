/**
 * Fail if the social frame CTA hides the destination host.
 * Run: npx vite-node scripts/verify-follow-host.ts
 */
import { readFileSync } from 'node:fs'
import { externalDestinationHost } from '../src/components/social/SocialPlatformFrame'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-follow-host FAIL: ${message}`)
    process.exit(1)
  }
}

assert(
  externalDestinationHost('https://www.facebook.com/onefmshepparton') === 'facebook.com',
  'Facebook href must read as facebook.com, not www',
)
assert(
  externalDestinationHost('https://soundcloud.com/user-570295409') === 'soundcloud.com',
  'SoundCloud href must read as soundcloud.com',
)
assert(externalDestinationHost('/listen') === '', 'In-site paths must not invent a host')

const src = readFileSync('src/components/social/SocialPlatformFrame.tsx', 'utf8')

const pillStart = src.indexOf('<a')
const pill = src.slice(pillStart, src.indexOf('</a>', pillStart))

assert(src.includes('function externalDestinationHost'), 'Must name the destination host from the href')
assert(src.includes('new URL(href).hostname'), 'Host must come from the real href, not a hardcoded network')
assert(src.includes('{host}'), 'Host must be visible next to Follow / Open SoundCloud')
assert(src.includes('opens ${host} in a new tab'), 'Screen reader must hear that this leaves the site')
assert(src.includes('formatCoverageShort'), 'Keep the existing coverage caption on the frame')
assert(!pill.includes('formatCoverageShort'), 'Do not restamp coverage onto the Follow pill')
assert(!/Station archive still/.test(src), 'Do not restamp cinegraph archive-still credit')
assert(!src.includes('HOST_PHOTOS') && !src.includes('onAirHost'), 'No unlabeled host faces')
assert(!src.includes('follower') && !src.includes('likes'), 'Do not invent Facebook counts')

console.log('verify-follow-host OK — Follow names facebook.com / soundcloud.com')

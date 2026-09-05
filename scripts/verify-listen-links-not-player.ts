/**
 * Fail if canonical listen destinations still bounce to WordPress / leftover CR+.
 * Run: npx vite-node scripts/verify-listen-links-not-player.ts
 */
import { AUDIO_PLAYER_URL } from '../src/lib/streamConfig'
import {
  LISTEN_HASH_HREF,
  LISTEN_LINKS,
  LISTEN_PATH,
} from '../src/lib/listenLinks'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-listen-links-not-player FAIL: ${message}`)
    process.exit(1)
  }
}

assert(LISTEN_PATH === '/listen', `LISTEN_PATH must be /listen, got ${LISTEN_PATH}`)
assert(LISTEN_HASH_HREF === '/#/listen', `HashRouter listen href must be /#/listen, got ${LISTEN_HASH_HREF}`)

assert(LISTEN_LINKS.web.href === LISTEN_HASH_HREF, 'web listen must stay on this site')
assert(LISTEN_LINKS.crp.href === LISTEN_HASH_HREF, 'crp slot must stay on this site, not a leftover app listing')
assert(
  LISTEN_LINKS.web.href !== AUDIO_PLAYER_URL,
  'web must not bounce to fm985.com.au/audio-player/',
)
assert(
  LISTEN_LINKS.crp.href !== AUDIO_PLAYER_URL,
  'crp slot must not bounce to fm985.com.au/audio-player/',
)
assert(
  !/community radio plus/i.test(LISTEN_LINKS.crp.label),
  'crp label must not advertise Community Radio Plus',
)
assert(
  !/community radio plus/i.test(LISTEN_LINKS.crp.description),
  'crp description must not advertise Community Radio Plus',
)
assert(
  /this site/i.test(LISTEN_LINKS.web.description),
  'web description must name this site',
)

console.log('verify-listen-links-not-player: ok')

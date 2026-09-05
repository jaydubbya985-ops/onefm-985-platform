/**
 * Fail the build if song-request mailto invents a send or drops the studio address.
 * Run: npx vite-node scripts/verify-song-request.ts
 */
import { BRAND } from '../src/lib/brand'
import { SONG_REQUEST_SUBJECT, songRequestMailto, songRequestPlaintext } from '../src/lib/songRequestMailto'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-song-request FAIL: ${message}`)
    process.exit(1)
  }
}

const plain = songRequestPlaintext({
  name: ' Jamie from Tatura ',
  song: ' Cold Chisel — Flame Trees ',
  message: ' For mum ',
})
assert(plain.includes('Jamie from Tatura'), 'name must be trimmed into the draft')
assert(plain.includes('Cold Chisel — Flame Trees'), 'song must be in the draft')
assert(plain.includes('For mum'), 'dedication must be in the draft')
assert(!/sent/i.test(plain), 'plaintext must not claim the request was sent')

const href = songRequestMailto({
  name: 'Jamie from Tatura',
  song: 'Cold Chisel — Flame Trees',
  message: 'For mum',
})
assert(href.startsWith(`mailto:${BRAND.email}?`), `must address ${BRAND.email}, got ${href.slice(0, 40)}`)
assert(href.includes(`subject=${encodeURIComponent(SONG_REQUEST_SUBJECT)}`), 'subject must be ONE FM Song Request')
assert(href.includes(encodeURIComponent('Cold Chisel — Flame Trees')), 'song must be encoded in the mailto body')
assert(!href.toLowerCase().includes('sent'), 'mailto must not claim sent')

const emptyMsg = songRequestPlaintext({ name: 'Jay', song: 'GVL theme', message: '   ' })
assert(emptyMsg.includes('Message: (none)'), 'blank dedication is (none), not invented copy')

console.log('verify-song-request OK')

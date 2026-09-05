/**
 * Lock: Home hero plays the live stream. It is not only a link to /listen.
 * Run: npx vite-node scripts/verify-home-hero-play.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')

if (!src.includes('useLiveStream')) {
  throw new Error('Home.tsx: hero must use useLiveStream')
}
if (!src.includes('void toggle()')) {
  throw new Error('Home.tsx: hero must play/pause the shared stream')
}
if (!src.includes('AUDIO_PLAYER_URL')) {
  throw new Error('Home.tsx: stream errors must link the fm985.com.au web player')
}
if (!src.includes('to="/listen"')) {
  throw new Error('Home.tsx: keep a Full player link to /listen')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Advertise With Us')) {
  throw new Error('Home.tsx: leftover Advertise With Us must stay for #438')
}
if (!src.includes('On air ever since')) {
  throw new Error('Home.tsx: leftover On air ever since must stay for #484')
}

console.log('verify-home-hero-play: Home hero plays the live stream.')

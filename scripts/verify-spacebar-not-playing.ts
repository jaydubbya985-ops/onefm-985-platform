/**
 * Lock: Spacebar toast waits on toggle(), not leftover Playing.
 * Run: npx vite-node scripts/verify-spacebar-not-playing.ts
 */
import { readFileSync } from 'node:fs'

const layout = readFileSync(new URL('../src/components/Layout.tsx', import.meta.url), 'utf8')
const stream = readFileSync(new URL('../src/hooks/useLiveStream.ts', import.meta.url), 'utf8')

if (/playing \? 'paused' : 'playing'/.test(layout)) {
  throw new Error('Layout.tsx: leftover Space toast guessed Playing before play()')
}
if (!layout.includes('await toggle()')) {
  throw new Error('Layout.tsx: Space handler must await toggle()')
}
if (!layout.includes("next === 'blocked'") || !layout.includes('Playback blocked')) {
  throw new Error('Layout.tsx: blocked stream must name Playback blocked')
}
if (!layout.includes('AUDIO_PLAYER_URL')) {
  throw new Error('Layout.tsx: blocked toast must link AUDIO_PLAYER_URL')
}
if (!stream.includes("return 'blocked'") || !stream.includes("return 'playing'") || !stream.includes("return 'paused'")) {
  throw new Error('useLiveStream.ts: toggle must return playing | paused | blocked')
}
// Other desks own MiniPlayer silent play — do not steal #521.
if (!layout.includes('MiniPlayer')) {
  throw new Error('Layout.tsx: MiniPlayer must stay (leftover silent play is #521)')
}

console.log('verify-spacebar-not-playing: Space toast waits on toggle, names a blocked stream.')

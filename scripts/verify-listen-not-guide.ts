/**
 * Lock: Listen is the stream. The weekly grid lives on /programs.
 * Run: npx vite-node scripts/verify-listen-not-guide.ts
 */
import { readFileSync } from 'node:fs'

const listen = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')
const mini = readFileSync(new URL('../src/components/MiniPlayer.tsx', import.meta.url), 'utf8')

if (/WeeklySchedule/.test(listen)) {
  throw new Error('Listen.tsx: weekly grid belongs on /programs, not the stream page')
}
if (/InventoryLadder/.test(listen)) {
  throw new Error('Listen.tsx: sponsor inventory is not the listen desk')
}
if (!listen.includes('to="/programs"') || !listen.includes('to="/broadcast"')) {
  throw new Error('Listen.tsx: must send listeners to /programs and /broadcast')
}
if (/the studio answers when/i.test(listen)) {
  throw new Error('Listen.tsx: leftover studio-answers copy')
}
if (/Broadcasting ever since/.test(listen)) {
  throw new Error('Listen.tsx: 1989 stat must name the community licence')
}
if (!mini.includes('AUDIO_PLAYER_URL') || !/\berror\b/.test(mini)) {
  throw new Error('MiniPlayer.tsx: stream errors must surface and link the fm985.com.au web player')
}

console.log('verify-listen-not-guide: Listen is the stream; guide lives on /programs.')

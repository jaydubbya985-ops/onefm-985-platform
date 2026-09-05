/**
 * Lock: Host Roster names the weekly guide, not leftover behind the mic.
 * Run: npx vite-node scripts/verify-roster-not-behind-mic.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/behind the mic/i.test(src)) {
  throw new Error('Programs.tsx: leftover behind the mic is back')
}
if (!src.includes('presenters named on the weekly guide')) {
  throw new Error('Programs.tsx: Host Roster must name presenters from the weekly guide')
}
if (!src.includes('fm985.com.au/guide')) {
  throw new Error('Programs.tsx: Host Roster must cite fm985.com.au/guide')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('From dawn till dark')) {
  throw new Error('Programs.tsx: leftover From dawn till dark must stay for #576')
}
if (!src.includes('defined a generation')) {
  throw new Error("Programs.tsx: leftover defined a generation must stay for #492")
}

console.log('verify-roster-not-behind-mic: Host Roster names the weekly guide.')

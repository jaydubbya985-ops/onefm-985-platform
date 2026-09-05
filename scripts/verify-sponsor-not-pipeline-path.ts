/**
 * Lock: Sponsorship under-form names station contact, not leftover pipeline path.
 * Run: npx vite-node scripts/verify-sponsor-not-pipeline-path.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')

if (/Goes straight to the station's pipeline/.test(src)) {
  throw new Error("SponsorshipKit.tsx: leftover Goes straight to the station's pipeline is back")
}
if (!src.includes('if you want a reply today')) {
  throw new Error('SponsorshipKit.tsx: under-form must name email/phone for a reply today')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes("You're in the pipeline")) {
  throw new Error('SponsorshipKit.tsx: leftover pipeline success must stay for #552 / #525')
}
if (!src.includes('not a call centre')) {
  throw new Error('SponsorshipKit.tsx: leftover not a call centre must stay for #408 / #525')
}
if (!src.includes('Start a Conversation')) {
  throw new Error('SponsorshipKit.tsx: leftover Start a Conversation must stay for #552')
}

console.log('verify-sponsor-not-pipeline-path: Sponsorship under-form names a reply today, not leftover pipeline path.')

/**
 * Lock: Contact emergency card uses sourced narrative, not leftover official designation.
 * Run: npx vite-node scripts/verify-contact-not-official.ts
 */
import { readFileSync } from 'node:fs'
import { EMERGENCY_BROADCAST_NARRATIVE } from '../src/data/stationHistory'

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')

if (/official emergency broadcaster/i.test(src)) {
  throw new Error('Contact.tsx: leftover official emergency broadcaster is back')
}
if (/work directly with emergency services/i.test(src)) {
  throw new Error('Contact.tsx: leftover emergency-services SOP is back')
}
if (!src.includes('EMERGENCY_BROADCAST_NARRATIVE')) {
  throw new Error('Contact.tsx: must source EMERGENCY_BROADCAST_NARRATIVE')
}
if (!src.includes('Official warnings and evacuation')) {
  throw new Error('Contact.tsx: must name CFA/SES/BOM as the official warning sources')
}
if (!EMERGENCY_BROADCAST_NARRATIVE[0]?.includes('local information service during emergencies')) {
  throw new Error('stationHistory: approved emergency lead sentence is missing')
}

console.log('verify-contact-not-official: ok')

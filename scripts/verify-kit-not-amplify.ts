/**
 * Lock: Media kit closer names a proposal — not leftover amplify.
 * Run: npx vite-node scripts/verify-kit-not-amplify.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')

if (/READY TO AMPLIFY/i.test(src)) {
  throw new Error('MediaKit.tsx: leftover READY TO AMPLIFY is back')
}
if (!src.includes('WordReveal text="REQUEST A PROPOSAL"')) {
  throw new Error('MediaKit.tsx: closer heading must name a proposal')
}
if (!src.includes('to="/proposal"')) {
  throw new Error('MediaKit.tsx: closer must still open the sourced proposal route')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes("Everything you need to know about ONE FM's audience")) {
  throw new Error('MediaKit.tsx: leftover Everything you need must stay for the claimed MediaKit/Contact stack')
}
if (!src.includes("we&apos;ll build a campaign that works for your brand")) {
  throw new Error('MediaKit.tsx: leftover campaign-for-your-brand subline must stay for another desk')
}
if (!src.includes('From stats to signed campaign')) {
  throw new Error('MediaKit.tsx: leftover From stats to signed campaign must stay for another desk')
}

console.log('verify-kit-not-amplify: Media kit closer names a proposal.')

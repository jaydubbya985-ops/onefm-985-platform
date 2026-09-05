/**
 * Lock: Media kit commercial CTA names coverage or a proposal — not leftover signed campaign.
 * Run: npx vite-node scripts/verify-kit-not-signed.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')

if (/From stats to signed campaign/i.test(src)) {
  throw new Error('MediaKit.tsx: leftover From stats to signed campaign is back')
}
if (!src.includes('headline="Explore coverage or request a proposal"')) {
  throw new Error('MediaKit.tsx: commercial CTA must name coverage or a proposal')
}
if (!src.includes('to="/proposal"')) {
  throw new Error('MediaKit.tsx: closer must still open the sourced proposal route')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('READY TO AMPLIFY?')) {
  throw new Error('MediaKit.tsx: leftover READY TO AMPLIFY? must stay for #520')
}
if (!src.includes("Everything you need to know about ONE FM's audience")) {
  throw new Error('MediaKit.tsx: leftover Everything you need must stay for the claimed MediaKit/Contact stack')
}
if (!src.includes("we&apos;ll build a campaign that works for your brand")) {
  throw new Error('MediaKit.tsx: leftover campaign-for-your-brand subline must stay for another desk')
}

console.log('verify-kit-not-signed: Media kit commercial CTA names coverage or a proposal.')

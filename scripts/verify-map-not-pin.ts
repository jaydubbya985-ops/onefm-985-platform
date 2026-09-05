/**
 * Lock: Coverage map CTA names a proposal, not leftover invented pin-your-brand.
 * Run: npx vite-node scripts/verify-map-not-pin.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/CoverageMap.tsx', import.meta.url), 'utf8')

if (/Pin your brand/.test(src)) {
  throw new Error('CoverageMap.tsx: leftover invented pin-your-brand is back')
}
if (!src.includes('headline="Ask for a proposal"')) {
  throw new Error('CoverageMap.tsx: sponsor CTA must name Ask for a proposal')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Advertise with ONE FM')) {
  throw new Error('CoverageMap.tsx: leftover Advertise pin-sheet must stay for #444')
}
if (!src.includes('Request a proposal →')) {
  throw new Error('CoverageMap.tsx: leftover Advertise hero must stay for #444')
}
if (!src.includes('View GVL packages')) {
  throw new Error('CoverageMap.tsx: leftover View GVL packages must stay for #444')
}
if (!src.includes('never sold as the $25 floor')) {
  throw new Error('CoverageMap.tsx: leftover from $25 honest GVL line must stay')
}

console.log('verify-map-not-pin: Coverage map CTA names a proposal, not leftover invented pin-your-brand.')

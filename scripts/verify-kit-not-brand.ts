/**
 * Lock: Sponsorship hero names formatTowns — not leftover Your Brand.
 * Run: npx vite-node scripts/verify-kit-not-brand.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')

if (/Your Brand/i.test(src)) {
  throw new Error('SponsorshipKit.tsx: leftover Your Brand is back')
}
if (!src.includes('className="poster-hover">{formatTowns()}')) {
  throw new Error('SponsorshipKit.tsx: hero must name formatTowns() from coverageCopy / townData')
}
if (!src.includes('On air')) {
  throw new Error('SponsorshipKit.tsx: hero must name on air from sourced coverage')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes("You're in the pipeline")) {
  throw new Error('SponsorshipKit.tsx: leftover pipeline success must stay for #468')
}
if (!src.includes('Start a Conversation')) {
  throw new Error('SponsorshipKit.tsx: leftover Start a Conversation CTA must stay for another desk')
}
if (!src.includes('The Evidence')) {
  throw new Error('SponsorshipKit.tsx: leftover The Evidence label must stay for another desk')
}
if (!src.includes('not a call centre')) {
  throw new Error('SponsorshipKit.tsx: leftover call centre heading must stay for another desk')
}

console.log('verify-kit-not-brand: Sponsorship hero names formatTowns, not leftover Your Brand.')

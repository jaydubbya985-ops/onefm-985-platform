/**
 * Lock: Sponsorship hero CTA names Send the Enquiry, not leftover Start a Conversation.
 * Run: npx vite-node scripts/verify-kit-not-conversation.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')

if (/Start a Conversation/.test(src)) {
  throw new Error('SponsorshipKit.tsx: leftover Start a Conversation is back')
}
if (!src.includes('Send the Enquiry →')) {
  throw new Error('SponsorshipKit.tsx: hero CTA must name Send the Enquiry')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Your Brand,')) {
  throw new Error('SponsorshipKit.tsx: leftover Your Brand, On Air must stay for #525')
}
if (!src.includes("You're in the pipeline")) {
  throw new Error('SponsorshipKit.tsx: leftover pipeline must stay')
}

console.log('verify-kit-not-conversation: Sponsorship hero CTA names Send the Enquiry.')

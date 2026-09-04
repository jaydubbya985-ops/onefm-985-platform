/**
 * Contact enquiry success names stored vs emailed — not leftover We'll be in touch.
 * Run: npx tsx scripts/verify-contact-not-touch.ts
 */
import { readFileSync } from 'node:fs'

const contact = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')
const sponsor = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')

if (/We'll be in touch/i.test(contact)) {
  throw new Error('Contact success still invents leftover We\'ll be in touch')
}
if (!contact.includes('Enquiry received at the station.')) {
  throw new Error('Contact success must name a stored enquiry')
}
if (!contact.includes('Enquiry emailed to the station.')) {
  throw new Error('Contact success must name an emailed enquiry')
}
if (!contact.includes("submitOutcome === 'stored'")) {
  throw new Error('Contact success must branch on stored vs emailed')
}
// Leftover office hours / Training is provided stays for #452 — do not remap in this PR.
if (!contact.includes('drop by the studio during office hours')) {
  throw new Error('Do not remap leftover office hours in this PR')
}
// Leftover partnerships team stays for #247 — do not remap in this PR.
if (!contact.includes('Our partnerships team will follow up')) {
  throw new Error('Do not remap leftover partnerships team in this PR')
}
// SponsorshipKit leftover We'll be in touch stays for #423 — do not remap in this PR.
if (!/We'll be in touch/i.test(sponsor)) {
  throw new Error('Do not remap leftover SponsorshipKit We\'ll be in touch in this PR')
}

console.log('verify-contact-not-touch: ok')

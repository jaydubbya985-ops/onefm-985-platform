/**
 * Lock: Contact form names send an enquiry — not leftover Multi-Pathway.
 * Run: npx vite-node scripts/verify-contact-not-pathway.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Contact.tsx', import.meta.url), 'utf8')

if (/Multi-Pathway Enquiry/i.test(src)) {
  throw new Error('Contact.tsx: leftover Multi-Pathway Enquiry is back')
}
if (/route your message to the/i.test(src) || /right team/i.test(src)) {
  throw new Error('Contact.tsx: leftover route-to-the-right-team copy is back')
}
if (!src.includes('WordReveal text="Send an enquiry"')) {
  throw new Error('Contact.tsx: enquiry heading must name send an enquiry')
}
if (!src.includes('Sponsorship, volunteering, programming, or a general message')) {
  throw new Error('Contact.tsx: enquiry subline must name sourced enquiry types')
}
if (!src.includes('{BRAND.email}') || !src.includes('{BRAND.phone}')) {
  throw new Error('Contact.tsx: enquiry subline must name BRAND.email and BRAND.phone')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Everything you need to know about connecting with ONE FM.')) {
  throw new Error('Contact.tsx: leftover Everything you need must stay for the claimed Contact stack')
}
if (!src.includes('WordReveal text="Get in"') || !src.includes('WordReveal text="Touch."')) {
  throw new Error('Contact.tsx: leftover Get in Touch hero must stay for another desk')
}
if (!src.includes("We'll be in touch.")) {
  throw new Error('Contact.tsx: leftover in-touch success must stay for #467')
}

console.log('verify-contact-not-pathway: Contact form names send an enquiry.')

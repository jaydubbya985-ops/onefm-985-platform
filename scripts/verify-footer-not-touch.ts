/**
 * Lock: Footer CTA names Contact — not leftover Get in Touch.
 * Run: npx vite-node scripts/verify-footer-not-touch.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')

if (/Get in Touch/i.test(src)) {
  throw new Error('Footer.tsx: leftover Get in Touch is back')
}

const cta = src.match(/<Link to="\/contact"[^>]*>\s*([^<]+)\s*<\/Link>/)
if (!cta || cta[1].trim() !== 'Contact') {
  throw new Error('Footer.tsx: CTA must name Contact from siteNav / OnAirNav')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('on air 24/7.')) {
  throw new Error('Footer.tsx: leftover on air 24/7 must stay for #259')
}

console.log('verify-footer-not-touch: Footer CTA names Contact, not leftover Get in Touch.')

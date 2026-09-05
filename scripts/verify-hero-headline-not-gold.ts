/**
 * Fail if Home still uses leftover unused gold headline chrome.
 * Run: npx vite-node scripts/verify-hero-headline-not-gold.ts
 */
import { readFileSync } from 'node:fs'

const headline = readFileSync(new URL('../src/components/home/HeroHeadline.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-hero-headline-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

assert(!/212,\s*175,\s*55/.test(headline), 'HeroHeadline must not use leftover rgba(212,175,55)')
assert(!/#D4AF37/i.test(headline), 'HeroHeadline must not use leftover old gold hex')
assert(!/text-one-gold/.test(headline), 'HeroHeadline must not use leftover gold token (now off-white)')
assert(headline.includes('#E51636'), 'middle words must use 98.5 Red')
assert(headline.includes('Goulburn'), 'headline must name Goulburn Valley, not leftover Valley-only')
assert(headline.includes('prefers-reduced-motion'), 'headline must respect reduced motion')
assert(home.includes('HeroHeadline'), 'Home must render HeroHeadline')
assert(!home.includes('<PosterReveal'), 'Home hero must not keep leftover PosterReveal h1')

console.log('verify-hero-headline-not-gold: ok')

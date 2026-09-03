/**
 * Home LCP must be the valley hero reel poster, not the unused laser still.
 *
 * Run: npx vite-node scripts/verify-home-lcp.ts
 */
import { readFileSync } from 'node:fs'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')
const atmosphere = readFileSync(
  new URL('../src/components/home/HeroAtmosphere.tsx', import.meta.url),
  'utf8',
)

assert(html.includes('/videos/heroes/hero-poster.jpg'), 'index.html must preload the Home hero poster')
assert(
  !html.includes('event-lasers-crowd.jpg'),
  'index.html must not preload the unused laser still as LCP',
)
assert(html.includes('HeroReel'), 'index.html comment must name the live Home hero')
assert(
  !html.includes('Home hero photo (HeroAtmosphere'),
  'index.html must not call unused HeroAtmosphere the LCP',
)

assert(home.includes('/videos/heroes/hero-poster.jpg'), 'Home must still use the valley hero poster')
assert(home.includes('HERO_REEL'), 'Home must still use the valley hero reel')
assert(!home.includes('HeroAtmosphere'), 'Home must not mount unused HeroAtmosphere')
assert(!home.includes('event-lasers-crowd.jpg'), 'Home must not use the laser still as the hero')

assert(
  atmosphere.includes('event-lasers-crowd.jpg'),
  'unused HeroAtmosphere may keep the laser still — do not treat that as the Home LCP',
)

if (fail.length) {
  console.error('verify-home-lcp failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-home-lcp: ok')
console.log('  preload /videos/heroes/hero-poster.jpg')
console.log('  Home HeroReel — not HeroAtmosphere / event-lasers-crowd.jpg')

/**
 * Fail if Listen hero rings still use leftover old gold, or stay unwired.
 * Run: npx vite-node scripts/verify-listen-rings-not-gold.ts
 */
import { readFileSync } from 'node:fs'

const atmosphere = readFileSync(new URL('../src/components/home/HeroAtmosphere.tsx', import.meta.url), 'utf8')
const listen = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-listen-rings-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

assert(!/212,\s*175,\s*55/.test(atmosphere), 'HeroAtmosphere must not use leftover rgba(212,175,55)')
assert(!/#D4AF37/i.test(atmosphere), 'HeroAtmosphere must not use leftover old gold hex')
assert(atmosphere.includes('rgba(229,22,54'), 'signal rings must use 98.5 Red')
assert(atmosphere.includes("mode === 'rings'"), 'rings mode must skip leftover unused photo chrome')
assert(atmosphere.includes("reduced ? '' : ' animate-ken-burns'"), 'ken-burns must not run when reduced motion is on')
assert(listen.includes('HeroAtmosphere'), 'Listen hero must render signal rings')
assert(listen.includes('mode="rings"'), 'Listen must use rings-only — keep the studio photo')

console.log('verify-listen-rings-not-gold: ok')

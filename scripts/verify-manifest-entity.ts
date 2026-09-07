/**
 * Fail if the PWA manifest still uses leftover navy or drops the licensed entity.
 * Run: npx vite-node scripts/verify-manifest-entity.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BRAND, BRAND_COLORS } from '../src/lib/brand.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-manifest-entity FAIL: ${message}`)
    process.exit(1)
  }
}

const manifest = JSON.parse(readFileSync(resolve('public/manifest.json'), 'utf8')) as {
  name: string
  short_name: string
  description: string
  background_color: string
  theme_color: string
}

assert(manifest.name.includes(BRAND.fullName), `name missing ${BRAND.fullName}`)
assert(manifest.short_name === BRAND.name, `short_name ${manifest.short_name}`)
assert(manifest.description.includes(BRAND.org), `description missing licensed entity: ${manifest.description}`)
assert(manifest.description.includes(BRAND.callsign), `description missing callsign: ${manifest.description}`)
assert(!/39,?375|189,?680/.test(manifest.description), 'must not invent reach in the manifest')
assert(manifest.theme_color === BRAND_COLORS.navy, `theme_color ${manifest.theme_color} !== ${BRAND_COLORS.navy}`)
assert(manifest.background_color === BRAND_COLORS.navy, `background_color ${manifest.background_color} !== ${BRAND_COLORS.navy}`)
assert(manifest.theme_color !== '#0A1628', 'must not ship leftover #0A1628 navy')
assert(manifest.background_color !== '#0A1628', 'must not ship leftover #0A1628 navy')

console.log(JSON.stringify(manifest, null, 2))
console.log('verify-manifest-entity OK')

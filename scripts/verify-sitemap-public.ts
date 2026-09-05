/**
 * Fail if the public sitemap offers DEMO ops or invents reach.
 * Run: npx vite-node scripts/verify-sitemap-public.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-sitemap-public FAIL: ${msg}`)
  process.exit(1)
}

const robots = readFileSync(resolve('public/robots.txt'), 'utf8')
const sitemap = readFileSync(resolve('public/sitemap.xml'), 'utf8')

if (!robots.includes('Disallow: /ops')) {
  fail('robots.txt must keep DEMO /ops out of the public index')
}
if (!robots.includes('Sitemap: https://onefmops.netlify.app/sitemap.xml')) {
  fail('robots.txt must point at the public sitemap')
}

if (sitemap.includes('/ops')) {
  fail('sitemap must not list the ops ledger')
}
if (sitemap.includes('/payment/')) {
  fail('sitemap must not list payment checkout leftovers')
}
if (sitemap.includes('39375') || sitemap.includes('39,375') || sitemap.includes('189680')) {
  fail('sitemap must not invent reach figures')
}

for (const path of ['/listen', '/programs', '/coverage', '/heritage', '/football']) {
  if (!sitemap.includes(`https://onefmops.netlify.app${path}`)) {
    fail(`sitemap missing public route ${path}`)
  }
}

console.log('verify-sitemap-public: ok — public routes only; DEMO /ops stays out')

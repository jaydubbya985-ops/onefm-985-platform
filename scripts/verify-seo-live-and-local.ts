/**
 * Lock: SEO title is Live and Local, not leftover Voice of the Goulburn Valley.
 * Run: npx vite-node scripts/verify-seo-live-and-local.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'
import { formatSeoTitle, formatSeoDefault } from '../src/lib/coverageCopy'

const leftover = /The Voice of the Goulburn Valley/
const lockup = `${BRAND.fullName} — ${BRAND.tagline}`

const seo = readFileSync(new URL('../src/components/SEO.tsx', import.meta.url), 'utf8')
const copy = readFileSync(new URL('../src/lib/coverageCopy.ts', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const vite = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')

for (const [label, text] of [
  ['SEO.tsx', seo],
  ['coverageCopy.ts', copy],
  ['Home.tsx', home],
  ['index.html', html],
  ['vite.config.ts', vite],
] as const) {
  if (leftover.test(text)) {
    throw new Error(`${label}: leftover Voice of the Goulburn Valley is back`)
  }
}

if (formatSeoTitle() !== lockup) {
  throw new Error(`formatSeoTitle must be ${lockup}`)
}
if (!formatSeoDefault().startsWith(`${lockup}.`)) {
  throw new Error(`formatSeoDefault must open with sourced ${lockup}`)
}
if (!seo.includes('formatSeoTitle()')) {
  throw new Error('SEO.tsx: DEFAULT_TITLE must use formatSeoTitle()')
}
if (!home.includes('formatSeoTitle()')) {
  throw new Error('Home.tsx: SEO title must use formatSeoTitle()')
}
if (!html.includes(lockup)) {
  throw new Error(`index.html: title / og:title must be ${lockup}`)
}
if (!vite.includes('readBrandLockup') || !vite.includes('tagline')) {
  throw new Error('vite.config.ts: meta inject must read BRAND.tagline')
}

console.log('verify-seo-live-and-local: ok')

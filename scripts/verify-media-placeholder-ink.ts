/**
 * Fail if the broken-photo tile invents leftover navy or gold.
 * Run: npx vite-node scripts/verify-media-placeholder-ink.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-media-placeholder-ink FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('src/components/MediaImage.tsx'), 'utf8')

if (src.includes('#0E1E38') || src.includes('#071D3A') || src.includes('#0A1628')) {
  fail('error tile must not use leftover navy')
}
if (
  src.includes('212,168,75') ||
  src.includes('#D4A84B') ||
  src.includes('#D4A853') ||
  src.includes('#D4AF37') ||
  src.includes('one-gold')
) {
  fail('error tile must not use leftover gold')
}
if (!src.includes('#101010')) {
  fail('error tile must sit on Direction A ink')
}
if (!src.includes('#E51636')) {
  fail('error tile must use 98.5 red')
}
if (!src.includes('#F2F2F2')) {
  fail('error tile must use paper, not leftover gold')
}
if (src.includes('39375') || src.includes('39,375') || src.includes('189680')) {
  fail('must not invent reach figures')
}
if (/plemo/i.test(src)) {
  fail('must not invent a leftover host name')
}

console.log('verify-media-placeholder-ink: ok — Direction A ink / red / paper')

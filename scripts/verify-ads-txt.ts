/**
 * Fail if ads.txt invents a seller ID or omits the licensed entity.
 * Run: npx vite-node scripts/verify-ads-txt.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-ads-txt FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('public/ads.txt'), 'utf8')

if (!src.includes('Goulburn Valley Community Radio Inc.')) {
  fail('must name the licensed entity')
}
if (!src.includes('ONE FM 98.5') || !src.includes('3ONE')) {
  fail('must name the station and ACMA callsign')
}
if (!/no authorised programmatic/i.test(src)) {
  fail('must say there are no authorised programmatic sellers')
}
if (!src.includes('CONTACT=admin@fm985.com.au')) {
  fail('must list the sourced station email as CONTACT=')
}
if (!src.includes('OWNERDOMAIN=fm985.com.au')) {
  fail('must list the sourced station domain as OWNERDOMAIN=')
}

const dataLines = src
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))

for (const line of dataLines) {
  if (/^(CONTACT|OWNERDOMAIN)=/i.test(line)) continue
  fail(`unexpected data line (no invented sellers): ${line}`)
}

if (/\bpub-/i.test(src) || /\bgoogle\.com\b/i.test(src)) {
  fail('must not invent an AdSense or exchange seller record')
}
if (src.includes('39375') || src.includes('39,375') || src.includes('189680')) {
  fail('must not invent reach figures')
}
if (/plemo|ciso|direct,|reseller,/i.test(src)) {
  fail('must not invent a seller relationship or leftover host name')
}

console.log('verify-ads-txt: ok — licensed entity, no authorised programmatic sellers')

/**
 * Fail if humans.txt invents a team or omits the licensed entity.
 * Run: npx vite-node scripts/verify-humans-txt.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-humans-txt FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('public/humans.txt'), 'utf8')

if (!src.includes('Organisation: Goulburn Valley Community Radio Inc.')) {
  fail('must name the licensed entity')
}
if (!src.includes('Station: ONE FM 98.5')) {
  fail('must name the station')
}
if (!src.includes('Callsign: 3ONE')) {
  fail('must name the ACMA callsign')
}
if (!src.includes('Contact: admin@fm985.com.au')) {
  fail('must list the sourced station email')
}
if (!src.includes('Location: 47 Parkside Drive, Shepparton VIC 3630')) {
  fail('must list the sourced studio address')
}
if (src.includes('39375') || src.includes('39,375') || src.includes('189680')) {
  fail('must not invent reach figures')
}
if (/plemo|ciso|vice chair|security@/i.test(src)) {
  fail('must not invent a security team or leftover host name')
}

console.log('verify-humans-txt: ok — licensed entity and sourced studio only')

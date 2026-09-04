/**
 * Fail if browserconfig.xml is missing, leftover navy, or invents a tile image.
 * Run: npx vite-node scripts/verify-browserconfig-ink.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-browserconfig-ink FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('public/browserconfig.xml'), 'utf8')

if (!src.includes('Goulburn Valley Community Radio Inc.')) {
  fail('must name the licensed entity')
}
if (!src.includes('ONE FM 98.5') || !src.includes('3ONE')) {
  fail('must name the station and ACMA callsign')
}
if (!src.includes('<TileColor>#101010</TileColor>')) {
  fail('TileColor must be Direction A ink #101010')
}
if (/#0A1628|#071D3A|#0E1E38/i.test(src)) {
  fail('must not use leftover navy')
}
if (/#D4A853|#D4AF37|#F0C75E|#D4A84B/i.test(src)) {
  fail('must not use leftover gold')
}
if (/square150x150logo|wide310x150logo|square310x310logo/i.test(src)) {
  fail('must not invent a tile PNG path (icon-192 on main is still leftover navy)')
}
if (/\bpub-|\bplemo\b|\bciso\b/i.test(src)) {
  fail('must not invent a seller or leftover host')
}

console.log('verify-browserconfig-ink: ok — Windows tile colour is Direction A ink')

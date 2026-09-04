/**
 * Fail if llms.txt invents reach, hosts, or omits the licensed entity.
 * Run: npx vite-node scripts/verify-llms-txt.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BRAND } from '../src/lib/brand'
import { stationStats } from '../src/data/pricing'

function fail(msg: string): never {
  console.error(`verify-llms-txt FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('public/llms.txt'), 'utf8')
const weekly = stationStats.weeklyListeners.toLocaleString('en-AU')
const people = stationStats.broadcastPopulation.toLocaleString('en-AU')

if (!src.includes(BRAND.org)) {
  fail('must name the licensed entity')
}
if (!src.includes(BRAND.fullName) || !src.includes(BRAND.callsign)) {
  fail('must name the station and ACMA callsign')
}
if (!src.includes(BRAND.email)) {
  fail('must list the sourced station email')
}
if (!src.includes(BRAND.address)) {
  fail('must list the sourced studio address')
}
if (!/do not invent/i.test(src)) {
  fail('must tell crawlers not to invent pulses, sponsors, or live-now counts')
}
if (!src.includes(weekly) || !src.includes('ABS 2021 via townData')) {
  fail(`weekly listeners must be ${weekly} with ABS 2021 via townData`)
}
if (!src.includes(people) || !src.includes('townData 2026 estimates, not ABS 2021')) {
  fail(`${people} must be labelled townData 2026 estimates, not ABS 2021`)
}
for (const line of src.split(/\r?\n/).filter((row) => /189,?680/.test(row))) {
  if (/ABS 2021/.test(line) && !/not ABS 2021/.test(line)) {
    fail(`must not attribute 189,680 to ABS 2021: ${line}`)
  }
  if (!/2026/.test(line)) {
    fail(`189,680 line must say 2026 estimates: ${line}`)
  }
}
if (/\bpub-|\bgoogle\.com\b/i.test(src)) {
  fail('must not invent an AdSense seller record')
}
if (/\bplemo\b|\bciso\b|lillian stone/i.test(src)) {
  fail('must not invent a leftover host or security role')
}

console.log('verify-llms-txt: ok — sourced facts, 189,680 is 2026 estimates')

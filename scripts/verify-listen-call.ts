/**
 * Fail if Listen leftover copy invents a live studio answering desk.
 * Run: npx vite-node scripts/verify-listen-call.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'
import { LISTEN_LINKS } from '../src/lib/listenLinks'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-listen-call FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

assert(!/Studio request/.test(src), 'Listen must not invent a leftover Studio request desk')
assert(!/You can also call[\s\S]{0,120}while we/i.test(src), 'Listen song request must not invent leftover live answering')
assert(src.includes('LISTEN_LINKS.phone.href'), 'Listen song request must use the sourced tel: link')
assert(src.includes('Song request'), 'Listen heading must name the song request')
assert(LISTEN_LINKS.phone.href === 'tel:+61358313131', `sourced tel must stay tel:+61358313131, got ${LISTEN_LINKS.phone.href}`)
assert(BRAND.phone === '(03) 5831 3131', `station phone must stay (03) 5831 3131, got ${BRAND.phone}`)

console.log('verify-listen-call OK')

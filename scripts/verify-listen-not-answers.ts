import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

if (/studio answers when we.?re live/i.test(src)) {
  throw new Error('leftover studio-answers still in Listen.tsx')
}
if (/while we.?re live/i.test(src)) {
  throw new Error('leftover while-we-are-live pickup still in Listen.tsx')
}
if (!src.includes('does not confirm a live pickup')) {
  throw new Error('sourced live-pickup denial missing')
}
if (!src.includes('BRAND.phone')) {
  throw new Error('station phone must be sourced from BRAND.phone')
}

console.log('verify-listen-not-answers: leftover studio-answers gone; station phone sourced')

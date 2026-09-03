/**
 * WordReveal headings must speak the finished line once.
 * Sighted mask-wipe is theatre. Screen readers must not hear
 * per-letter ticks or a doubled aria-label.
 *
 * Run: node --experimental-strip-types scripts/verify-word-reveal.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const src = readFileSync(resolve('src/components/WordReveal.tsx'), 'utf8')

assert(src.includes('className="sr-only">{text}'), 'WordReveal must expose the finished string to assistive tech')
assert(src.includes('aria-hidden="true"'), 'animated reveal glyphs must be hidden from assistive tech')
assert(!/aria-label=\{text\}/.test(src), 'do not double-speak via aria-label plus visible children')
assert(!/aria-live=/.test(src), 'do not announce reveal frames to assistive tech')
assert((src.match(/className="sr-only">\{text\}/g) ?? []).length >= 2, 'both reveal variants must expose sr-only text')
assert((src.match(/aria-hidden="true"/g) ?? []).length >= 2, 'both reveal variants must hide the theatre glyphs')

if (fail.length) {
  console.error('verify-word-reveal FAILED')
  for (const msg of fail) console.error(`  - ${msg}`)
  process.exit(1)
}

console.log('verify-word-reveal OK')
console.log('  both variants: sr-only finished line + aria-hidden theatre')

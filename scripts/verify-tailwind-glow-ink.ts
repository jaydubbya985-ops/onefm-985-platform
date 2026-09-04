/**
 * Fail if tailwind leftover Heritage Gold / old pulse red is still in keyframes.
 * Football popular tiers and MediaKit cards use shadow-glow from this file.
 * Direction A remapped one-gold → paper #F2F2F2; these rgba literals were missed.
 *
 * Run: npx vite-node scripts/verify-tailwind-glow-ink.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-tailwind-glow-ink FAIL: ${message}`)
    process.exit(1)
  }
}

const path = resolve(process.cwd(), 'tailwind.config.js')
const raw = readFileSync(path, 'utf8')
// Strip comments so a note about leftover gold cannot trip the rgb check.
const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

assert(!/212\s*,\s*168\s*,\s*75/.test(src), 'leftover Heritage Gold rgb(212,168,75) still in tailwind.config.js')
assert(!/212\s*,\s*175\s*,\s*55/.test(src), 'leftover Heritage Gold rgb(212,175,55) still in tailwind.config.js')
assert(!/#D4A84B|#D4A853|#D4AF37|#F0C75E/i.test(src), 'leftover Heritage Gold hex still in tailwind.config.js')
assert(!/227\s*,\s*30\s*,\s*36/.test(src), 'leftover pulse red rgb(227,30,36) — use #E51636 rgb(229,22,54)')

assert(/242\s*,\s*242\s*,\s*242/.test(src), 'Direction A paper rgb(242,242,242) missing from remapped glow')
assert(/229\s*,\s*22\s*,\s*54/.test(src), 'official 98.5 Red rgb(229,22,54) missing from pulse-dot')
assert(/glow:\s*"0 0 24px rgba\(242,242,242,0\.25\)"/.test(src), 'shadow-glow must be paper, not leftover gold')

assert(!/plemo/i.test(src), 'must not invent Plemo')
assert(!/pub-\d/.test(src), 'must not invent a publisher id')

console.log('verify-tailwind-glow-ink OK — shadow-glow / pulses are Direction A paper + #E51636')

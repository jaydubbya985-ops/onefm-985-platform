/**
 * Fail if Home section labels can sit invisible behind a leftover IO inset.
 * Run: npx vite-node scripts/verify-label-reveal-snap.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg: string): never {
  console.error(`verify-label-reveal-snap FAIL: ${msg}`)
  process.exit(1)
}

const src = readFileSync(resolve('src/components/motion/PosterReveal.tsx'), 'utf8')

if (src.includes("margin: '-40px'") || src.includes('margin: "-40px"')) {
  fail('LabelReveal must not use a leftover negative IO inset')
}
if (!src.includes('setTimeout') || !src.includes('setShown(true)')) {
  fail('LabelReveal must snap on if IntersectionObserver never fires')
}
if (!src.includes('useReducedMotion')) {
  fail('LabelReveal must yield to prefers-reduced-motion')
}
if (src.includes('39375') || src.includes('39,375') || src.includes('189680')) {
  fail('must not invent reach figures')
}
if (/plemo/i.test(src)) {
  fail('must not invent a leftover host name')
}

console.log('verify-label-reveal-snap: ok — labels snap on, no leftover inset')

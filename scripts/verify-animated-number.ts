/**
 * Fail if AnimatedNumber lets assistive tech hear the rising tick.
 * Run: npx vite-node scripts/verify-animated-number.ts
 *
 * Sighted theatre may count 0 → value. Screen readers must get the finished
 * sourced figure once (sr-only), never aria-live / aria-label ticks.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/components/AnimatedNumber.tsx'), 'utf8')

function fail(msg: string): never {
  console.error(`verify-animated-number FAIL: ${msg}`)
  process.exit(1)
}

if (!src.includes('className="sr-only"')) {
  fail('finished figure must live in sr-only so assistive tech hears it once')
}
if (!src.includes('aria-hidden="true"')) {
  fail('ticking count must be aria-hidden theatre')
}
if (src.includes('aria-live')) {
  fail('must not announce ticking frames via aria-live')
}
if (src.includes('aria-label')) {
  fail('must not double-speak via aria-label (same leftover as WordReveal)')
}

const srOnly = src.includes('sr-only">{formatFigure(value, prefix, suffix)}')
  || src.includes('sr-only">{prefix}{value.toLocaleString()}{suffix}')
if (!srOnly) {
  fail('sr-only must speak the finished value, not the ticking count')
}

const theatre = src.includes('aria-hidden="true">{formatFigure(count, prefix, suffix)}')
  || src.includes('aria-hidden="true">{prefix}{count.toLocaleString()}{suffix}')
if (!theatre) {
  fail('aria-hidden theatre must use the ticking count')
}

if (!src.includes('toLocaleString()')) {
  fail('figures must use toLocaleString (39,375 not 39375)')
}

if (src.includes("margin: '-50px'") || src.includes('margin: "-50px"')) {
  fail('negative inView inset left Football 39,375 sitting on an invented 0')
}

if (!src.includes('setCount(value)')) {
  fail('must snap to the sourced figure if IntersectionObserver never fires')
}

if (!src.includes('Math.max((now - start) / duration, 0)')) {
  fail('progress must clamp at 0 so a late start clock cannot flash a negative count')
}

console.log('verify-animated-number: ok — SR hears the finished figure once; tick is theatre')

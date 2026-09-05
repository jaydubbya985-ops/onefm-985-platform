/**
 * Fail the build if MagneticButton still pulls under prefers-reduced-motion.
 * Run: npx vite-node scripts/verify-magnetic-reduce-motion.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-magnetic-reduce-motion FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/MagneticButton.tsx', import.meta.url), 'utf8')

assert(
  src.includes("prefers-reduced-motion: reduce"),
  'MagneticButton must read prefers-reduced-motion',
)
assert(
  /if \(reduceMotion\) return/.test(src),
  'MagneticButton mouse-move must skip the leftover magnetic pull when reduced motion is on',
)
assert(
  src.includes("mq.addEventListener('change'"),
  'MagneticButton must snap if the user turns reduced motion on while hovering',
)

const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')
assert(
  footer.includes('MagneticButton'),
  'Footer Listen Live still uses MagneticButton — the leftover pull is public chrome',
)

console.log('verify-magnetic-reduce-motion OK')

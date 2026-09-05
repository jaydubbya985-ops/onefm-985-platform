/**
 * Fail the build if the custom cursor hover ring still uses leftover gold.
 * Run: npx vite-node scripts/verify-cursor-not-gold.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-cursor-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/CustomCursor.tsx', import.meta.url), 'utf8')

assert(
  src.includes("SIGNAL_RED_RGB = '229, 22, 54'"),
  'CustomCursor hover must use signal red #E51636 (229, 22, 54)',
)
assert(
  !/212\s*,\s*175\s*,\s*55/.test(src),
  'CustomCursor must not use leftover gold 212,175,55',
)
assert(
  !/#D4AF37/i.test(src),
  'CustomCursor must not use leftover gold #D4AF37',
)
assert(
  src.includes('SIGNAL_RED_RGB'),
  'hover ring must read SIGNAL_RED_RGB, not a leftover gold literal',
)

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert(
  app.includes('CustomCursor'),
  'App still mounts CustomCursor — leftover gold would be public chrome',
)

console.log('verify-cursor-not-gold OK')

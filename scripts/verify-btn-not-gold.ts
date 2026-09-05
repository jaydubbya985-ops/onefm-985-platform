/**
 * Fail the build if primary-button hover still uses leftover gold.
 * Run: npx vite-node scripts/verify-btn-not-gold.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-btn-not-gold FAIL: ${message}`)
    process.exit(1)
  }
}

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

assert(
  !/212\s*,\s*175\s*,\s*55/.test(css),
  'index.css must not use leftover gold 212,175,55',
)
assert(
  !/#D4AF37/i.test(css),
  'index.css must not use leftover gold #D4AF37',
)

const hover = css.match(/\.btn-primary:hover\s*\{[\s\S]*?\}/)?.[0] ?? ''
assert(hover.length > 0, 'index.css must still define .btn-primary:hover')
assert(
  /box-shadow:[^;]*rgba\(\s*229\s*,\s*22\s*,\s*54/.test(hover),
  '.btn-primary:hover glow must be signal red #E51636 (229, 22, 54)',
)

const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')
assert(
  footer.includes('className="btn-primary'),
  'Footer Listen Live still uses btn-primary — leftover gold glow would be public chrome',
)

const nav = readFileSync(new URL('../src/components/Navbar.tsx', import.meta.url), 'utf8')
assert(
  nav.includes('className="btn-primary'),
  'Navbar Listen Live still uses btn-primary — leftover gold glow would be public chrome',
)

console.log('verify-btn-not-gold OK')

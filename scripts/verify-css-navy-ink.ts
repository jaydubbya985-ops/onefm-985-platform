/**
 * Direction A remapped Tailwind `one-navy` to #101010.
 * The live stylesheet still shipped leftover broadcast navy on used surfaces
 * (bg-surface-warm / bg-surface-glow, --one-navy, image skeleton, scrollbar).
 *
 * Run: node --experimental-strip-types scripts/verify-css-navy-ink.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const css = readFileSync(resolve('src/index.css'), 'utf8')
const tailwind = readFileSync(resolve('tailwind.config.js'), 'utf8')

assert(
  /"one-navy":\s*"#101010"/.test(tailwind),
  'tailwind one-navy must stay Direction A ink #101010',
)

const navyDecl = css.match(/--one-navy:\s*([^;]+);/)
assert(Boolean(navyDecl), '--one-navy must be declared')
assert(
  navyDecl?.[1].trim().toLowerCase() === '#101010',
  `--one-navy must be #101010 (got ${navyDecl?.[1].trim() ?? 'missing'})`,
)

assert(
  /--one-navy:\s*#101010/.test(css),
  'stylesheet --one-navy must match tailwind one-navy',
)

assert(
  /\.bg-surface-warm\s*\{[^}]*#101010/.test(css),
  '.bg-surface-warm must sit on Direction A ink, not leftover broadcast navy',
)
assert(
  /\.bg-surface-glow\s*\{[^}]*#101010/.test(css),
  '.bg-surface-glow must sit on Direction A ink, not leftover broadcast navy',
)

const leftover = [
  '#071D3A',
  '#071d3a',
  '#0A1628',
  '#0a1628',
  '#080F1C',
  '#080f1c',
  '#1A2A42',
  '#1a2a42',
  '#0E1E38',
  '#0e1e38',
  '10, 22, 40',
  '14, 30, 56',
  '26, 46, 80',
  '22, 38, 70',
]

for (const token of leftover) {
  assert(!css.includes(token), `src/index.css still contains leftover navy ${token}`)
}

if (fail.length) {
  console.error('verify-css-navy-ink FAILED')
  for (const msg of fail) console.error(`  - ${msg}`)
  process.exit(1)
}

console.log('verify-css-navy-ink OK')
console.log('  --one-navy #101010')
console.log('  bg-surface-warm / bg-surface-glow on ink')
console.log('  no leftover broadcast-navy hex or rgb')

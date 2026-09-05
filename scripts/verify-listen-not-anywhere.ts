/**
 * Lock: Listen stream tile names this site, not leftover Stream anywhere.
 * Run: npx vite-node scripts/verify-listen-not-anywhere.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

if (/Stream anywhere/.test(src)) {
  throw new Error('Listen.tsx: leftover Stream anywhere is back')
}
if (/anywhere in the world/.test(src)) {
  throw new Error('Listen.tsx: leftover anywhere in the world is back')
}
if (!src.includes("title: 'On this site'")) {
  throw new Error('Listen.tsx: stream tile must name this site')
}
if (!src.includes('The live stream is on this page and fm985.com.au.')) {
  throw new Error('Listen.tsx: stream tile must name this page and fm985.com.au')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Broadcasting ever since')) {
  throw new Error('Listen.tsx: leftover Broadcasting ever since must stay for #485')
}
if (!src.includes('the studio answers when')) {
  throw new Error('Listen.tsx: leftover studio answers must stay for #488')
}

console.log('verify-listen-not-anywhere: Listen stream tile names this site, not leftover Stream anywhere.')

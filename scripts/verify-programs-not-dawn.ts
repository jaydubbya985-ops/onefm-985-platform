/**
 * Lock: Programs featured intro names the weekly guide, not leftover dawn till dark.
 * Run: npx vite-node scripts/verify-programs-not-dawn.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/From dawn till dark/.test(src)) {
  throw new Error('Programs.tsx: leftover From dawn till dark is back')
}
if (!src.includes('BREAKFAST_SHOW') || !src.includes('Overnight Mix')) {
  throw new Error('Programs.tsx: featured intro must name BREAKFAST_SHOW through Overnight Mix')
}
if (!src.includes('fm985.com.au/guide')) {
  throw new Error('Programs.tsx: featured intro must cite the weekly guide')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('defined a generation')) {
  throw new Error("Programs.tsx: leftover defined a generation must stay for #492")
}
if (!src.includes('from all eras')) {
  throw new Error('Programs.tsx: leftover all eras must stay for #513')
}

console.log('verify-programs-not-dawn: Featured intro names Breakfast through Overnight Mix.')

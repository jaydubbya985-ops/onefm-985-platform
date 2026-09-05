/**
 * Lock: Media kit census heading names who lives in the towns — not leftover WHO'S LISTENING.
 * Run: npx vite-node scripts/verify-kit-not-listening.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')

if (/WHO'S LISTENING/.test(src)) {
  throw new Error("MediaKit.tsx: leftover WHO'S LISTENING is back")
}
if (!src.includes('Who lives in ${formatTowns()}')) {
  throw new Error('MediaKit.tsx: census heading must name who lives in formatTowns()')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('READY TO AMPLIFY?')) {
  throw new Error('MediaKit.tsx: leftover READY TO AMPLIFY must stay for #520')
}
if (!src.includes('Everything you need')) {
  throw new Error('MediaKit.tsx: leftover Everything you need must stay')
}
if (!src.includes('Volume discounts')) {
  throw new Error('MediaKit.tsx: leftover volume discounts must stay for #548 / #412')
}
if (!src.includes('From stats to signed campaign')) {
  throw new Error('MediaKit.tsx: leftover signed campaign must stay for #522')
}
if (!src.includes('PLATFORM REACH')) {
  throw new Error('MediaKit.tsx: leftover PLATFORM REACH must stay for #519')
}

console.log("verify-kit-not-listening: Media kit census heading names who lives in the towns.")

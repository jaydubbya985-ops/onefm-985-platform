/**
 * Lock: Football tiers heading names quoted GVL levels, not leftover impact.
 * Run: npx vite-node scripts/verify-footy-not-impact.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

if (/CHOOSE YOUR IMPACT/.test(src)) {
  throw new Error('Football.tsx: leftover CHOOSE YOUR IMPACT is back')
}
if (!src.includes("text=\"Quoted GVL sponsorship levels\"")) {
  throw new Error('Football.tsx: tiers heading must name quoted GVL sponsorship levels')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('GVL — where footy means everything')) {
  throw new Error('Football.tsx: leftover everything must stay for #494')
}
if (!src.includes('every premiership moment')) {
  throw new Error('Football.tsx: leftover every premiership moment must stay')
}
if (!src.includes('Ready for kick-off')) {
  throw new Error('Football.tsx: leftover Ready for kick-off must stay')
}
if (!src.includes('every match day')) {
  throw new Error('Football.tsx: leftover every match day must stay for #537')
}
if (!src.includes('The broadcast team')) {
  throw new Error('Football.tsx: leftover broadcast team must stay')
}
if (!src.includes('BETTER VALUE THAN THE ALTERNATIVES')) {
  throw new Error('Football.tsx: leftover alternatives must stay for #391')
}
if (!src.includes('puts your brand in front of thousands')) {
  throw new Error('Football.tsx: leftover thousands must stay for #384')
}

console.log('verify-footy-not-impact: Football tiers heading names quoted GVL levels, not leftover impact.')

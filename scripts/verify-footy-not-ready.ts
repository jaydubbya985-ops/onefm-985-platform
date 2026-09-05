/**
 * Lock: Football closer names a GVL proposal, not leftover READY TO SPONSOR.
 * Run: npx vite-node scripts/verify-footy-not-ready.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

if (/READY TO SPONSOR LOCAL FOOTBALL\?/.test(src)) {
  throw new Error('Football.tsx: leftover READY TO SPONSOR LOCAL FOOTBALL? is back')
}
if (!src.includes('Request a GVL sponsorship proposal')) {
  throw new Error('Football.tsx: closer heading must name a GVL sponsorship proposal')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('CHOOSE YOUR IMPACT')) {
  throw new Error('Football.tsx: leftover CHOOSE YOUR IMPACT must stay for #542')
}
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

console.log('verify-footy-not-ready: Football closer names a GVL proposal, not leftover READY TO SPONSOR.')

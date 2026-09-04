/**
 * Programs hero must not invent 24/7 uptime. The transmitter is 98.5 FM;
 * presenter hours live in programGuide.ts. Run: npx vite-node scripts/verify-programs-fm-not-247.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/pages/Programs.tsx'), 'utf8')
const fail: string[] = []

if (src.includes('24/7')) {
  fail.push('Programs.tsx leftover: invented 24/7 uptime — use 98.5 FM / the weekly guide')
}
if (!src.includes('on 98.5 FM')) {
  fail.push('Programs hero must name 98.5 FM, not leftover 24/7')
}
if (!src.includes('98.5 FM · Shepparton · 3ONE')) {
  fail.push('Programs marquee must name 98.5 FM, Shepparton, and callsign 3ONE')
}

if (fail.length) {
  console.error(fail.map((m) => `FAIL ${m}`).join('\n'))
  process.exit(1)
}
console.log('verify-programs-fm-not-247: Programs names 98.5 FM / 3ONE, not leftover 24/7')

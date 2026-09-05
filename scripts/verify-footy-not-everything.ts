/**
 * Lock: Football GVL action still names Match of the Day on the weekly guide,
 * not leftover invented completeness ("where footy means everything").
 * Run: npx vite-node scripts/verify-footy-not-everything.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Football.tsx', import.meta.url), 'utf8')

if (/means everything/i.test(src)) {
  throw new Error('Football.tsx: leftover “means everything” completeness claim is back')
}

if (!src.includes('GVL celebration — ${GVL_MATCH_SLOT.name} on the weekly guide.')) {
  throw new Error(
    'Football.tsx: GVL action still must name GVL_MATCH_SLOT on the weekly guide',
  )
}

console.log('verify-footy-not-everything: ok')

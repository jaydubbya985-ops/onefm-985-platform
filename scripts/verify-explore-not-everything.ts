/**
 * Lock: Explore heading names listen and the guide, not leftover everything.
 * Run: npx vite-node scripts/verify-explore-not-everything.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/home/ExploreOneFMGrid.tsx', import.meta.url), 'utf8')

if (/Everything the station offers/.test(src)) {
  throw new Error('ExploreOneFMGrid.tsx: leftover Everything the station offers is back')
}
if (!src.includes('Listen, the guide, and the Valley')) {
  throw new Error('ExploreOneFMGrid.tsx: heading must name listen and the guide')
}
// Other desks own these leftovers — do not steal their remaps.
if (!src.includes("desc: 'Get involved'")) {
  throw new Error('ExploreOneFMGrid.tsx: leftover Get involved Contact tile must stay for #453')
}
if (!src.includes('Heritage since 1989')) {
  throw new Error('ExploreOneFMGrid.tsx: leftover Heritage since 1989 must stay for #462')
}

console.log('verify-explore-not-everything: Explore heading names listen and the guide.')

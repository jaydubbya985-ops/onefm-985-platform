/**
 * Lock: Social Hub Murray River caption names 98.5 FM — not leftover worldwide.
 * Run: npx vite-node scripts/verify-hub-not-worldwide.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SocialHub.tsx', import.meta.url), 'utf8')

if (/anywhere in the world/.test(src)) {
  throw new Error('SocialHub.tsx: leftover anywhere in the world is back')
}
if (!src.includes('Listen on 98.5 FM or stream at fm985.com.au — ${formatTowns()}')) {
  throw new Error('SocialHub.tsx: Murray River caption must name 98.5 FM and formatTowns()')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('or stream anywhere at fm985.com.au')) {
  throw new Error('SocialHub.tsx: leftover stream anywhere caption template must stay')
}
if (!src.includes('Everything you need to amplify ONE FM across every platform.')) {
  throw new Error('SocialHub.tsx: leftover amplify / campaign tools must stay for #409')
}
if (!src.includes('Great morning with the crew in the box.')) {
  throw new Error('SocialHub.tsx: leftover crew in the box must stay for #429')
}
if (!src.includes('ONE FM is live on site')) {
  throw new Error('SocialHub.tsx: leftover live on site must stay for #415')
}
if (!src.includes("title: 'Hashtag Sets'")) {
  throw new Error('SocialHub.tsx: leftover Hashtag Sets must stay for #446')
}
if (!src.includes("title: 'Crisis Communication'")) {
  throw new Error('SocialHub.tsx: leftover Crisis Communication must stay for #442')
}
if (!src.includes("title: 'The ONE FM Voice'")) {
  throw new Error('SocialHub.tsx: leftover voice guidelines must stay for #449')
}

console.log(
  'verify-hub-not-worldwide: Social Hub Murray River caption names 98.5 FM, not leftover worldwide.',
)

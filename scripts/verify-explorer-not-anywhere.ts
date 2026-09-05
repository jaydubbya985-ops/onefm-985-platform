/**
 * Lock: Broadcast Explorer listen CTA names 98.5 FM — not leftover anywhere.
 * Run: npx vite-node scripts/verify-explorer-not-anywhere.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')

if (/TUNE IN ANYWHERE/.test(src)) {
  throw new Error('BroadcastExplorer.tsx: leftover TUNE IN ANYWHERE is back')
}
if (!src.includes('LISTEN ON ${LISTEN_LINKS.fm.label}')) {
  throw new Error('BroadcastExplorer.tsx: listen CTA must name LISTEN_LINKS.fm')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('Stream anywhere')) {
  throw new Error('BroadcastExplorer.tsx: leftover Stream anywhere must stay')
}
if (!src.includes('The ONE FM team — ready to call the game')) {
  throw new Error('BroadcastExplorer.tsx: leftover ready-to-call must stay for #512')
}
if (!src.includes('Tour the Studio')) {
  throw new Error('BroadcastExplorer.tsx: leftover Tour the Studio must stay for #435')
}
if (!src.includes('LIVE CALLS')) {
  throw new Error('BroadcastExplorer.tsx: leftover LIVE CALLS must stay for #460')
}
if (!src.includes('data-cursor-label="PREVIEW"')) {
  throw new Error('BroadcastExplorer.tsx: leftover PREVIEW must stay for #433')
}
if (!src.includes("'CR+'")) {
  throw new Error('BroadcastExplorer.tsx: leftover CR+ tile must stay for #422')
}

console.log(
  'verify-explorer-not-anywhere: Broadcast Explorer listen CTA names 98.5 FM, not leftover anywhere.',
)

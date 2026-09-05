/**
 * Lock: Heritage institution card names sourced events, not leftover invented oral-history.
 * Run: npx vite-node scripts/verify-history-not-oral.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/stationHistory.ts', import.meta.url), 'utf8')

if (/oral history of the district/.test(src)) {
  throw new Error('stationHistory.ts: leftover invented oral-history is back')
}
if (/not only a music outlet/.test(src)) {
  throw new Error('stationHistory.ts: leftover invented music-outlet contrast is back')
}
if (!src.includes('Recording the Valley')) {
  throw new Error('stationHistory.ts: Recording the Valley title must stay')
}
if (!src.includes('Shepparton Festival, SAM, Carols by Candlelight, GVL finals')) {
  throw new Error('stationHistory.ts: sourced event list must stay')
}

// Other desks own these leftovers — do not steal their remaps.
if (!src.includes('On air in Studio A')) {
  throw new Error('stationHistory.ts: leftover On air Studio A must stay')
}
if (!src.includes('Thousands of properties')) {
  throw new Error('stationHistory.ts: leftover invented thousands must stay')
}

console.log('verify-history-not-oral: Heritage institution card names sourced events, not leftover invented oral-history.')

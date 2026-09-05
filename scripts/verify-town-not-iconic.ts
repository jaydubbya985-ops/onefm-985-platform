/**
 * Lock: Tallarook names sourced ABS / LGA / distance facts,
 * not leftover invented "iconic Australian song" hype.
 * Run: npx vite-node scripts/verify-town-not-iconic.ts
 */
import { readFileSync } from 'node:fs'

const townData = readFileSync(new URL('../src/data/townData.ts', import.meta.url), 'utf8')
const coverageMap = readFileSync(new URL('../src/pages/CoverageMap.tsx', import.meta.url), 'utf8')

if (/iconic Australian song/i.test(townData)) {
  throw new Error('townData.ts: leftover iconic Australian song on Tallarook is back')
}

if (!townData.includes('Mitchell Shire village — 748 people (ABS 2021), 84.5 km from Shepparton.')) {
  throw new Error('townData.ts: Tallarook must name sourced Mitchell Shire / ABS 2021 / km facts')
}

if (!townData.includes("name: 'Tallarook'")) {
  throw new Error('townData.ts: Tallarook row must stay')
}

// Stay: leftover Advertise on CoverageMap is #444 / #302 — do not steal
if (!coverageMap.includes('Pin your brand on the map')) {
  throw new Error('CoverageMap.tsx: leftover Pin your brand must stay (do not steal #444)')
}
if (!coverageMap.includes('See where your brand lands')) {
  throw new Error('CoverageMap.tsx: leftover See where your brand lands must stay (do not steal #444)')
}

console.log('verify-town-not-iconic: ok')

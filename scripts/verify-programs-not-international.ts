/**
 * Lock: Radio Netherlands names the weekly-guide Dutch community slot,
 * not leftover "international community program".
 * Run: npx vite-node scripts/verify-programs-not-international.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/international community program/i.test(src)) {
  throw new Error('Programs.tsx: leftover international community program on Radio Netherlands is back')
}

if (!src.includes('Dutch-language community program with Margaret and Josh')) {
  throw new Error('Programs.tsx: Radio Netherlands must name the weekly-guide Dutch community slot')
}

if (!src.includes('name: "Radio Netherlands"') || !src.includes('host: "Margaret & Josh"')) {
  throw new Error('Programs.tsx: Radio Netherlands card must keep Margaret & Josh from the weekly guide')
}

console.log('verify-programs-not-international: ok')

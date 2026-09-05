/**
 * Lock: Rock 'n' Roll Fever names Carlo and the weekly-guide slot,
 * not leftover invented "defined a generation" hype.
 * Run: npx vite-node scripts/verify-programs-not-generation.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Programs.tsx', import.meta.url), 'utf8')

if (/defined a generation/i.test(src)) {
  throw new Error("Programs.tsx: leftover defined a generation on Rock 'n' Roll Fever is back")
}

if (!src.includes("Rock 'n' Roll classics Thursday nights with Carlo.")) {
  throw new Error("Programs.tsx: Rock 'n' Roll Fever must name Carlo and the weekly-guide slot")
}

if (!src.includes("name: \"Rock 'n' Roll Fever\"") || !src.includes('host: "Carlo"')) {
  throw new Error("Programs.tsx: Rock 'n' Roll Fever card must keep Carlo from the weekly guide")
}

console.log('verify-programs-not-generation: ok')

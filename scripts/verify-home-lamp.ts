/**
 * Home leftover: the hero Listen lamp pulses only when a presenter is live.
 * Source: src/pages/Home.tsx
 *
 * Run: npx vite-node scripts/verify-home-lamp.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/pages/Home.tsx'), 'utf8')

if (src.includes('rounded-full bg-white animate-pulse')) {
  throw new Error('Home leftover live lamp: hero dot always pulses.')
}

if (!src.includes("live.isLive ? ' animate-pulse' : ''")) {
  throw new Error('Home hero lamp must pulse only when live.isLive.')
}

if (!src.includes("live.isLive ? 'On Air Now · Listen Live' : 'Listen Live · 98.5 FM'")) {
  throw new Error('Home hero must still name On Air vs Listen Live from the guide.')
}

console.log('verify-home-lamp: Home hero lamp pulses only when a presenter is live.')

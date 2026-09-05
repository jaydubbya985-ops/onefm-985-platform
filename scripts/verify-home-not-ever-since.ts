/**
 * Lock: Home 1989 stat names the community licence, not leftover invented
 * "On air ever since" uptime.
 * Run: npx vite-node scripts/verify-home-not-ever-since.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')

if (/On air ever since/i.test(src)) {
  throw new Error('Home.tsx: leftover On air ever since uptime claim is back')
}

if (!src.includes("{ n: '1989', t: 'Community licence', red: false }")) {
  throw new Error('Home.tsx: 1989 stat must name the community licence')
}

console.log('verify-home-not-ever-since: ok')

/**
 * Lock: Listen 1989 stat names the community licence, not leftover invented
 * "Broadcasting ever since" uptime.
 * Run: npx vite-node scripts/verify-listen-not-ever-since.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Listen.tsx', import.meta.url), 'utf8')

if (/Broadcasting ever since/i.test(src)) {
  throw new Error('Listen.tsx: leftover Broadcasting ever since uptime claim is back')
}

if (!src.includes("{ n: '1989', t: 'Community licence' }")) {
  throw new Error('Listen.tsx: 1989 stat must name the community licence')
}

console.log('verify-listen-not-ever-since: ok')

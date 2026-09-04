/**
 * Lock: Broadcast Explorer breakfast tags do not invent leftover LIVE CALLS.
 * Run: npx vite-node scripts/verify-explorer-not-live-calls.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/BroadcastExplorer.tsx', import.meta.url), 'utf8')

if (/LIVE CALLS/.test(src)) {
  throw new Error('BroadcastExplorer.tsx: leftover LIVE CALLS breakfast tag is back')
}
if (!src.includes("['NEWS', 'MUSIC', 'TALK']")) {
  throw new Error('BroadcastExplorer.tsx: breakfast tags must stay NEWS / MUSIC / TALK from the breakfast copy')
}

console.log('verify-explorer-not-live-calls: ok')

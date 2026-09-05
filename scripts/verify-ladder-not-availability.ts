/**
 * Inventory leftover invented High availability — lock.
 * Run: npx vite-node scripts/verify-ladder-not-availability.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/InventoryLadder.tsx', import.meta.url), 'utf8')

if (/High availability/.test(src) || !src.includes('Availability is quoted')) {
  console.error(
    'verify-ladder-not-availability: leftover High availability invents sell-out status — name quoted availability',
  )
  process.exit(1)
}

console.log('verify-ladder-not-availability: ok')

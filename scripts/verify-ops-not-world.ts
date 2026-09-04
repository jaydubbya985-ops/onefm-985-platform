/**
 * Fail if #/ops still sells leftover “3 world-class” invoice designs.
 * Station invoice is Direction A · Broadcast Letter (locked).
 * Run: npx vite-node scripts/verify-ops-not-world.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/OpsPortal.tsx', import.meta.url), 'utf8')

if (/world-class/i.test(src)) {
  console.error('verify-ops-not-world FAIL: leftover world-class copy on OpsPortal')
  process.exit(1)
}
if (/Pick from 3/i.test(src)) {
  console.error('verify-ops-not-world FAIL: leftover Pick from 3 invoice designs')
  process.exit(1)
}
if (!src.includes('Direction A · Broadcast Letter is locked')) {
  console.error('verify-ops-not-world FAIL: missing locked Broadcast Letter line')
  process.exit(1)
}

console.log('verify-ops-not-world: ok')

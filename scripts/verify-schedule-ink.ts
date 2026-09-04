/**
 * Schedule chrome must sit on Direction A ink, not leftover navy / Heritage Gold.
 * Run: npx vite-node scripts/verify-schedule-ink.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/components/ops/BroadcastSchedule.tsx'), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-schedule-ink FAIL: ${message}`)
    process.exit(1)
  }
}

assert(!/#111d32/i.test(src), 'leftover navy #111d32 must not paint Schedule cards')
assert(!/#1[Ee]293[Bb]/.test(src), 'leftover slate #1E293B must not paint Schedule chrome')
assert(!/#D4A853/i.test(src), 'leftover Heritage Gold #D4A853 must not be the missing-campaign fallback')
assert(!/#D4A84B/i.test(src), 'leftover gold #D4A84B must not appear on Schedule')
assert(src.includes('#101010'), 'Direction A ink #101010 must paint Schedule cards / dialogs / tabs')
assert(src.includes("campaign?.color || '#E51636'"), 'missing-campaign fallback must be station red #E51636')

console.log('verify-schedule-ink OK — Schedule chrome is Direction A ink, fallback is station red')

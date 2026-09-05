/**
 * Fail the build if Invoice Design Lab still invents leftover world-class options.
 * Run: npx vite-node scripts/verify-lab-not-world-class.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-lab-not-world-class FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/InvoiceDesignLab.tsx', import.meta.url), 'utf8')

assert(
  !/world-class/i.test(src),
  'InvoiceDesignLab must not invent leftover world-class options',
)
assert(
  src.includes('Broadcast Letter locked'),
  'lab heading must name locked Broadcast Letter, not leftover world-class',
)
assert(
  src.includes('STATION_INVOICE_DESIGN_CHOICE'),
  'lab must still mark the station-locked Broadcast Letter choice',
)

const ops = readFileSync(new URL('../src/pages/OpsPortal.tsx', import.meta.url), 'utf8')
assert(
  ops.includes('Pick from 3 world-class invoice designs'),
  'OpsPortal leftover world-class tab copy is #470 — do not steal',
)

console.log('verify-lab-not-world-class OK')

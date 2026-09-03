/**
 * Fail if an ops “NOT sent” toast vanishes before it can be read.
 * Run: npx vite-node scripts/verify-toast-hold.ts
 */
import { readFileSync } from 'node:fs'
import { toastHoldMs } from '../src/components/ops/Toast'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-toast-hold FAIL: ${message}`)
    process.exit(1)
  }
}

assert(toastHoldMs('error') >= 8000, `error hold: ${toastHoldMs('error')}`)
assert(toastHoldMs('warning') >= 8000, `warning hold: ${toastHoldMs('warning')}`)
assert(toastHoldMs('success') === 3000, `success stay brief: ${toastHoldMs('success')}`)
assert(toastHoldMs('info') === 3000, `info stay brief: ${toastHoldMs('info')}`)

const src = readFileSync(new URL('../src/components/ops/Toast.tsx', import.meta.url), 'utf8')
assert(src.includes('toastHoldMs(type)'), 'Toast must use the typed hold')
assert(!src.includes('setTimeout(() => remove(id), 3000)'), 'do not hard-code 3s on every toast')

console.log('verify-toast-hold OK')
console.log(
  JSON.stringify(
    {
      error: toastHoldMs('error'),
      warning: toastHoldMs('warning'),
      success: toastHoldMs('success'),
    },
    null,
    2,
  ),
)

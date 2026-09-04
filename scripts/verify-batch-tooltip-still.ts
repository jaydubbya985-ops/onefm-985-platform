/**
 * FOOTT batch-send row tooltips still zoomed and slid. Fail if leftover
 * motion-reduce snap classes disappear from the shared tooltip primitive.
 *
 * Run: npx vite-node scripts/verify-batch-tooltip-still.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'src/components/ui/tooltip.tsx'), 'utf8')
const batch = readFileSync(join(root, 'src/components/ops/InvoiceBatchSender.tsx'), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  source.includes('motion-reduce:animate-none'),
  'Batch-send tooltips must snap open when motion is reduced',
)
assert(
  source.includes('motion-reduce:data-[state=closed]:animate-none'),
  'Batch-send tooltips must snap closed when motion is reduced',
)
assert(
  source.includes('zoom-in-95'),
  'Keep the default zoom for people who did not request reduced motion',
)
assert(
  batch.includes('<Tooltip>') && batch.includes('Test Send') && batch.includes('>Send<'),
  'Batch Send row actions must still use the shared tooltip primitive',
)

if (fail.length) {
  console.error('verify-batch-tooltip-still failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-batch-tooltip-still ok — batch-send tooltips snap when motion is reduced')

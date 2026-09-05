/**
 * Invoice / proposal dialogs still zoomed and faded. Fail if the leftover
 * motion-reduce snap classes disappear from the shared primitive.
 *
 * Run: npx vite-node scripts/verify-dialog-still.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'src/components/ui/dialog.tsx'), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  source.includes('motion-reduce:data-[state=open]:animate-none'),
  'Dialog overlay/content must snap open when motion is reduced',
)
assert(
  source.includes('motion-reduce:data-[state=closed]:animate-none'),
  'Dialog overlay/content must snap closed when motion is reduced',
)
assert(
  source.includes('motion-reduce:duration-0'),
  'Dialog leftover duration-200 must drop when motion is reduced',
)
assert(
  source.includes('motion-reduce:transition-none'),
  'Dialog close control must not fade when motion is reduced',
)
assert(
  (source.match(/motion-reduce:data-\[state=open\]:animate-none/g) ?? []).length >= 2,
  'Both overlay and panel must drop leftover fade/zoom',
)
assert(
  source.includes('zoom-in-95'),
  'Keep the default zoom for listeners who did not request reduced motion',
)

if (fail.length) {
  console.error('verify-dialog-still failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-dialog-still ok — invoice dialogs snap when motion is reduced')

/**
 * FOOTT enquiry drawer still slid for 300–500ms. Fail if leftover
 * motion-reduce snap classes disappear from the shared sheet primitive.
 *
 * Run: npx vite-node scripts/verify-enquiry-sheet-still.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'src/components/ui/sheet.tsx'), 'utf8')
const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

assert(
  source.includes('motion-reduce:data-[state=open]:animate-none'),
  'Enquiry sheet overlay/panel must snap open when motion is reduced',
)
assert(
  source.includes('motion-reduce:data-[state=closed]:animate-none'),
  'Enquiry sheet overlay/panel must snap closed when motion is reduced',
)
assert(
  source.includes('motion-reduce:duration-0'),
  'Leftover 300/500ms sheet duration must drop when motion is reduced',
)
assert(
  source.includes('motion-reduce:transition-none'),
  'Sheet panel / close control must not ease when motion is reduced',
)
assert(
  (source.match(/motion-reduce:data-\[state=open\]:animate-none/g) ?? []).length >= 2,
  'Both overlay and panel must drop leftover fade/slide',
)
assert(
  source.includes('slide-in-from-right'),
  'Keep the default slide for people who did not request reduced motion',
)

if (fail.length) {
  console.error('verify-enquiry-sheet-still failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-enquiry-sheet-still ok — enquiry drawer snaps when motion is reduced')

/**
 * Contact FAQ + enquiry select must snap when the listener asked for less motion.
 * Accordion expand/collapse and Select dropdown zoom are leftover theatre
 * unless motion-reduce turns the animations off.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const accordion = readFileSync(resolve('src/components/ui/accordion.tsx'), 'utf8')
const select = readFileSync(resolve('src/components/ui/select.tsx'), 'utf8')

let failed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failed += 1
    console.error(`FAIL ${msg}`)
  } else {
    console.log(`ok   ${msg}`)
  }
}

assert(
  accordion.includes('motion-reduce:transition-none'),
  'accordion chevron / trigger snaps — no leftover 200ms rotate',
)
assert(
  accordion.includes('motion-reduce:data-[state=open]:animate-none'),
  'accordion open does not run leftover accordion-down',
)
assert(
  accordion.includes('motion-reduce:data-[state=closed]:animate-none'),
  'accordion close does not run leftover accordion-up',
)
assert(
  select.includes('motion-reduce:data-[state=open]:animate-none'),
  'enquiry select open does not leftover zoom-in',
)
assert(
  select.includes('motion-reduce:data-[state=closed]:animate-none'),
  'enquiry select close does not leftover zoom-out',
)

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\ncontact still leftover checks passed')

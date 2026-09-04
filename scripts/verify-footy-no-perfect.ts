/**
 * GVL enquiry does not invent a leftover perfect sponsorship tier.
 * Run: npx vite-node scripts/verify-footy-no-perfect.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/pages/Football.tsx'), 'utf8')

assert(!/perfect sponsorship tier/i.test(page), 'Football must not invent a leftover perfect sponsorship tier')
assert(!/we'll recommend/i.test(page), 'Football must not invent a leftover recommendation SLA')
assert(
  page.includes('GVL and live-call inventory is quoted separately'),
  'Football enquiry must say GVL and live-call inventory is quoted separately',
)
assert(page.includes('GET STARTED') || page.includes('ENQUIRE NOW'), 'Football enquiry form must remain')

if (fail.length) {
  console.error('verify-footy-no-perfect failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-footy-no-perfect: ok')

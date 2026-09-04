/**
 * Privacy does not invent a leftover newsletter opt-in.
 * Run: npx vite-node scripts/verify-privacy-no-newsletter.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/pages/Privacy.tsx'), 'utf8')

assert(!/newsletters/i.test(page), 'Privacy must not invent leftover newsletters')
assert(!/opted in/i.test(page), 'Privacy must not invent a leftover newsletter opt-in')
assert(!/unsubscribe from communications/i.test(page), 'Privacy must not invent a leftover mailing list')
assert(
  page.includes('This site does not run a public newsletter signup'),
  'Privacy must say this site does not run a public newsletter signup',
)
assert(page.includes('Privacy Policy'), 'Privacy policy heading must remain')
assert(page.includes('To respond to your enquiries and requests'), 'Enquiry use must remain')

if (fail.length) {
  console.error('verify-privacy-no-newsletter failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-privacy-no-newsletter: ok')

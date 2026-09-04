/**
 * Sponsor enquiry names stored vs emailed — not a leftover CRM pipeline.
 * Run: npx vite-node scripts/verify-sponsor-no-pipeline.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const page = readFileSync(resolve('src/pages/SponsorshipKit.tsx'), 'utf8')

assert(!/pipeline/i.test(page), 'SponsorshipKit must not invent a leftover CRM pipeline')
assert(!/We'll be in touch/i.test(page), 'SponsorshipKit must not invent a leftover in-touch SLA')
assert(!/You.re in the pipeline/i.test(page), 'SponsorshipKit success must not dress submit as a leftover pipeline')
assert(page.includes('result.stored'), 'SponsorshipKit must read submitEnquiry stored')
assert(page.includes('result.emailed'), 'SponsorshipKit must read submitEnquiry emailed')
assert(page.includes('Emailed to the station') || page.includes('Stored for the station'), 'SponsorshipKit success must name stored vs emailed')
assert(page.includes('BRAND.phone'), 'SponsorshipKit success must name the station phone')
assert(page.includes('BRAND.email'), 'SponsorshipKit success must name the station email')

if (fail.length) {
  console.error('verify-sponsor-no-pipeline failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-sponsor-no-pipeline: ok')

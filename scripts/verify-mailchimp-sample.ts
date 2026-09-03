/**
 * Fail the build if the public Mailchimp sample invents a person.
 * Run: npx vite-node scripts/verify-mailchimp-sample.ts
 */
import { sampleMailchimpCsv } from '../src/lib/mailchimpBridge'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-mailchimp-sample FAIL: ${message}`)
    process.exit(1)
  }
}

const csv = sampleMailchimpCsv()

assert(!csv.includes('Alex'), 'sample CSV must not invent Alex Taylor')
assert(!csv.includes('Taylor'), 'sample CSV must not invent a surname')
assert(!csv.includes('0400 000 000'), 'sample CSV must not invent a phone')
assert(!csv.includes('sponsor@example.com.au'), 'sample CSV must not invent a sponsor email')
assert(!csv.includes('\n'), 'sample CSV is headers only — no fake lead row')
assert(csv === 'email,firstName,lastName,company,phone,source,tags,notes', 'sample CSV must be the import headers')

console.log('verify-mailchimp-sample OK')
console.log(JSON.stringify({ sample: csv }, null, 2))

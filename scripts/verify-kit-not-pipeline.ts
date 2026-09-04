/**
 * Fail if the public sponsor page still sells leftover CRM "pipeline".
 * Run: npx vite-node scripts/verify-kit-not-pipeline.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')

if (/pipeline/i.test(src)) {
  console.error('verify-kit-not-pipeline FAIL: leftover pipeline copy on SponsorshipKit')
  process.exit(1)
}
if (!src.includes('The station has your enquiry')) {
  console.error('verify-kit-not-pipeline FAIL: missing honest enquiry confirmation')
  process.exit(1)
}
if (!src.includes('The form stores or emails the station')) {
  console.error('verify-kit-not-pipeline FAIL: missing honest store-or-email line')
  process.exit(1)
}

console.log('verify-kit-not-pipeline: ok')

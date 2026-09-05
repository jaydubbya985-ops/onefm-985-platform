/**
 * Fail if the public proposal page still sells leftover CRM "pipeline".
 * Run: npx vite-node scripts/verify-proposal-not-pipeline.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/SalesProposal.tsx', import.meta.url), 'utf8')

if (/pipeline/i.test(src)) {
  console.error('verify-proposal-not-pipeline FAIL: leftover pipeline copy on SalesProposal')
  process.exit(1)
}
if (!src.includes('The form stores or emails the station')) {
  console.error('verify-proposal-not-pipeline FAIL: missing honest store-or-email line')
  process.exit(1)
}

console.log('verify-proposal-not-pipeline: ok')

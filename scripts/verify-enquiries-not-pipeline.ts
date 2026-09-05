/**
 * Fail the build if ops enquiries still invent leftover pipeline value.
 * Run: npx vite-node scripts/verify-enquiries-not-pipeline.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiries-not-pipeline FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/EnquiryDashboard.tsx', import.meta.url), 'utf8')

assert(
  !/Pipeline Value/.test(src),
  'EnquiryDashboard must not invent leftover Pipeline Value',
)
assert(
  src.includes('DEMO open total'),
  'DEMO mode must label the open-enquiry sum as DEMO, not leftover pipeline',
)
assert(
  src.includes('Open enquiry total'),
  'LIVE mode must name the open-enquiry sum, not leftover pipeline',
)
assert(
  src.includes('isSupabaseConfigured()'),
  'open-total label must flip DEMO vs LIVE from isSupabaseConfigured',
)
assert(
  src.includes('e.value') && src.includes('isClosed'),
  'open total must still sum enquiry value on rows that are not closed',
)

const crm = readFileSync(new URL('../src/components/ops/SponsorCRM.tsx', import.meta.url), 'utf8')
assert(
  crm.includes('Pipeline Value'),
  'SponsorCRM leftover Pipeline Value is a different desk — do not steal',
)

console.log('verify-enquiries-not-pipeline OK')

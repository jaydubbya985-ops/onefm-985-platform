/**
 * Fail the build if Sponsor CRM still invents leftover pipeline value.
 * Run: npx vite-node scripts/verify-sponsors-not-pipeline.ts
 */
import { readFileSync } from 'node:fs'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-sponsors-not-pipeline FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/ops/SponsorCRM.tsx', import.meta.url), 'utf8')

assert(
  !/Pipeline Value/.test(src),
  'SponsorCRM must not invent leftover Pipeline Value',
)
assert(
  src.includes('DEMO open total'),
  'DEMO mode must label the quoted-open sum as DEMO, not leftover pipeline',
)
assert(
  src.includes('Open quoted total'),
  'LIVE mode must name the quoted-open sum, not leftover pipeline',
)
assert(
  src.includes('isSupabaseConfigured()'),
  'open-quoted label must flip DEMO vs LIVE from isSupabaseConfigured',
)
assert(
  src.includes('annualValue') && src.includes('proposal_sent'),
  'open quoted total must still sum annualValue on proposal/negotiating/contracted rows',
)

console.log('verify-sponsors-not-pipeline OK')

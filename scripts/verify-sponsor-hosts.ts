/**
 * Fail if DEMO invoice create lists a breakfast host as a sponsor company.
 * Run: npx vite-node scripts/verify-sponsor-hosts.ts
 */
import { readFileSync } from 'node:fs'
import {
  isOnAirHostCompany,
  SPONSOR_DIRECTORY,
} from '../src/components/ops/invoices/contacts.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-sponsor-hosts FAIL: ${message}`)
    process.exit(1)
  }
}

assert(isOnAirHostCompany('Craig Stott'), 'Craig Stott is Wednesday breakfast (The Big G)')
assert(isOnAirHostCompany('Josh Revens'), 'Josh Revens is Friday breakfast')
assert(isOnAirHostCompany('Ralph Whitehead'), 'Ralph Whitehead is Thursday breakfast')
assert(!isOnAirHostCompany('FOOTT Waste Solutions'), 'FOOTT stays a sponsor')
assert(!isOnAirHostCompany("Jason's TV / Pest Control"), "Jason's TV stays a sponsor")

const leaked = SPONSOR_DIRECTORY.filter((s) => isOnAirHostCompany(s.company))
assert(
  leaked.length === 0,
  `DEMO directory must not invoice a host: ${leaked.map((s) => s.company).join(', ')}`,
)

assert(
  SPONSOR_DIRECTORY.some((s) => s.company === 'FOOTT Waste Solutions'),
  'FOOTT must stay in the directory',
)
assert(
  SPONSOR_DIRECTORY.some((s) => s.company.startsWith("Jason's TV")),
  "Jason's TV must stay in the directory",
)

const src = readFileSync(
  new URL('../src/components/ops/invoices/contacts.ts', import.meta.url),
  'utf8',
)
assert(src.includes('isOnAirHostCompany'), 'keep the host-company guard')
assert(src.includes('BREAKFAST_ROSTER'), 'source the host list from the roster comment')

console.log('verify-sponsor-hosts OK')
console.log(
  JSON.stringify(
    {
      directory: SPONSOR_DIRECTORY.length,
      foott: true,
      hostsRemoved: ['Craig Stott', 'Josh Revens', 'Ralph Whitehead'],
    },
    null,
    2,
  ),
)

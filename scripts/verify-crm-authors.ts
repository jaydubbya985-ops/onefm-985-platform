/**
 * Fail the build if Sponsor CRM invents staff names or a station-manager title.
 * Run: npx vite-node scripts/verify-crm-authors.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/ops/SponsorCRM.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-crm-authors FAIL: ${message}`)
    process.exit(1)
  }
}

const forbidden = ['Sarah J.', 'Mike R.', 'Alex T.', 'Station Mgr', 'Station Manager']

for (const phrase of forbidden) {
  assert(!src.includes(phrase), `Sponsor CRM must not invent “${phrase}”`)
}

assert(src.includes("const CRM_NOTE_AUTHOR = 'Ops'"), 'notes must default to the Ops role')
assert(src.includes("'Accounts'"), 'author picker must offer Accounts, not a person')
assert(src.includes("'Admin'"), 'author picker must offer Admin, not a person')

console.log('verify-crm-authors OK')
console.log(
  JSON.stringify(
    {
      inventedNames: forbidden.filter((p) => src.includes(p)),
      defaultAuthor: 'Ops',
    },
    null,
    2,
  ),
)

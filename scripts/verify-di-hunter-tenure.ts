/**
 * Fail if Heritage still invents Di Hunter tenure counts.
 * Run: npx vite-node scripts/verify-di-hunter-tenure.ts
 */
import { readFileSync } from 'node:fs'
import { HERITAGE_LEGENDS } from '../src/data/stationHistory'
import { ARCHIVE_PEOPLE } from '../src/data/livingArchive/people'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-di-hunter-tenure FAIL: ${message}`)
    process.exit(1)
  }
}

const di = HERITAGE_LEGENDS.find((p) => p.name === 'Di Hunter')
assert(di, 'Di Hunter must stay on the heritage legends wall')
assert(di && !/15 years/i.test(di.sub), `legend sub invents years: ${di?.sub}`)
assert(di && !/103/.test(di.sub), `legend sub invents 103: ${di?.sub}`)
assert(di && /2014/.test(di.sub), `legend sub must cite the archive photo year: ${di?.sub}`)

const person = ARCHIVE_PEOPLE.find((p) => p.id === 'di-hunter')
assert(person, 'di-hunter must stay in ARCHIVE_PEOPLE')
assert(!person?.years, `people years invents tenure: ${person?.years}`)
assert(
  !(person?.roles ?? []).some((r) => /103/.test(r)),
  `people roles invent 103: ${person?.roles}`,
)

for (const file of ['src/data/stationHistory.ts', 'src/data/livingArchive/people.ts']) {
  const src = readFileSync(file, 'utf8')
  assert(!/15 years on air/.test(src), `${file} still has 15 years on air`)
  assert(!/103 presenters/.test(src), `${file} still has 103 presenters`)
}

console.log('verify-di-hunter-tenure OK')

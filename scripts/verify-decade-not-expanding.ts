/**
 * Lock: DecadeDial footer names sourced archive cards,
 * not leftover "curated cards · Wayback and newspaper archive expanding".
 * Run: npx vite-node scripts/verify-decade-not-expanding.ts
 */
import { readFileSync } from 'node:fs'
import { ARCHIVE_CARDS } from '../src/data/livingArchive/decades'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-decade-not-expanding FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/components/archive/DecadeDial.tsx', import.meta.url), 'utf8')

assert(!/curated cards/i.test(src), 'leftover curated-cards copy is back')
assert(!/archive expanding/i.test(src), 'leftover archive-expanding copy is back')
assert(src.includes('ARCHIVE_CARDS.length'), 'footer must count ARCHIVE_CARDS')
assert(src.includes('ACMA'), 'footer must name ACMA')
assert(src.includes('Shepparton News'), 'footer must name Shepparton News')
assert(src.includes('Annual Report 2024'), 'footer must name Annual Report 2024')
assert(ARCHIVE_CARDS.length > 0, 'ARCHIVE_CARDS must have sourced rows')
assert(
  ARCHIVE_CARDS.some((c) => c.sources.some((s) => /ACMA/i.test(s.label))),
  'ARCHIVE_CARDS must include an ACMA source',
)
assert(
  ARCHIVE_CARDS.some((c) => c.sources.some((s) => /Shepparton News/i.test(s.label))),
  'ARCHIVE_CARDS must include a Shepparton News source',
)
assert(
  ARCHIVE_CARDS.some((c) => c.sources.some((s) => /Annual Report 2024/i.test(s.label))),
  'ARCHIVE_CARDS must include Annual Report 2024',
)

// Other desks own these leftovers — do not steal.
assert(src.includes('archive hunt in progress'), 'do not steal #426 leftover empty-decade hunt')
assert(src.includes('Tune through time'), 'do not steal leftover Tune through time heading')

console.log('verify-decade-not-expanding OK')

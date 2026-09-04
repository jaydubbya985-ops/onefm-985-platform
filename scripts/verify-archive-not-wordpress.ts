/**
 * Living Archive decades do not ship leftover WordPress presenters permalinks
 * or invent an archive-hunt SLA.
 * Run: npx vite-node scripts/verify-archive-not-wordpress.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ARCHIVE_CARDS, cardsForDecade } from '../src/data/livingArchive/decades'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const src = readFileSync(resolve('src/data/livingArchive/decades.ts'), 'utf8')

assert(!/page_id=248/i.test(src), 'decades.ts must not ship leftover WordPress page_id=248')
assert(!/\?page_id=/i.test(src), 'decades.ts must not ship leftover WordPress page_id permalinks')
assert(
  !/Archive hunt in progress/i.test(src),
  'decades.ts must not invent leftover archive-hunt SLA',
)
assert(
  !/presenters-page-pending/i.test(src),
  'decades.ts must not keep the leftover WordPress presenters placeholder card',
)
assert(
  !ARCHIVE_CARDS.some((c) => c.id === 'presenters-page-pending'),
  'ARCHIVE_CARDS must not include the leftover WordPress presenters card',
)
assert(
  cardsForDecade('2000s').length === 0,
  '2000s must stay empty until a sourced card exists — do not invent one',
)
assert(ARCHIVE_CARDS.some((c) => c.id === 'licence-1989'), '1989 licence card must remain')
assert(ARCHIVE_CARDS.some((c) => c.id === '35-years-2024'), '2024 AGM card must remain')

if (fail.length) {
  console.error('verify-archive-not-wordpress failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log('verify-archive-not-wordpress: ok')

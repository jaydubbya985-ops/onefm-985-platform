/**
 * Home / Listen / Story interview fallback must be the current fm985.com.au
 * interview grid — not leftover April 2026 archive cards.
 *
 * Source: fm985.com.au/wp-json/wp/v2/posts?categories=24 (Interview), 2026-09-04.
 * Hosts only when the WordPress excerpt names the announcer.
 *
 * Run: node --experimental-strip-types scripts/verify-interview-fresh.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const fail: string[] = []
function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scraped = JSON.parse(
  readFileSync(resolve(root, 'src/data/oneFmScrapedData.json'), 'utf8'),
) as {
  recent_interviews?: Array<{ date: string; guest: string; topic: string; host: string }>
}

const feed = readFileSync(resolve(root, 'src/lib/fm985Feed.ts'), 'utf8')
assert(
  feed.includes('scrapedFallback') && feed.includes('recent_interviews'),
  'fm985Feed must still fall back to oneFmScrapedData.json recent_interviews',
)

const rows = scraped.recent_interviews ?? []
assert(rows.length >= 6, `need at least 6 fallback interviews, got ${rows.length}`)

const NAMED_HOSTS = new Set(['John Painter', 'Josh Revens'])
const BANNED_LEFTOVER = [
  'St Vinnies',
  "Mother's Day Classic",
  'ONE FM Breakfast (archive)',
  'The Stats Man',
  'Nathan Lyon',
  'Melanie Domaschenz',
]

const dates: string[] = []
for (const row of rows) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(row.date), `date must be YYYY-MM-DD: ${row.date}`)
  dates.push(row.date)
  assert(row.date >= '2026-07-01', `fallback still has pre-July leftover ${row.date} (${row.guest})`)
  assert(Boolean(row.guest.trim()) && !row.guest.startsWith('['), `guest missing or placeholder: ${row.guest}`)
  assert(Boolean(row.topic.trim()) && !row.topic.startsWith('['), `topic missing or placeholder: ${row.topic}`)
  assert(
    NAMED_HOSTS.has(row.host) || row.host.startsWith('['),
    `host must be named in the WP excerpt or DATA_MISSING, not leftover archive label: ${row.host}`,
  )
  const blob = `${row.guest} ${row.topic} ${row.host}`
  for (const banned of BANNED_LEFTOVER) {
    assert(!blob.includes(banned), `leftover archive card still present: ${banned}`)
  }
}

assert(dates[0] === '2026-07-24', `newest fallback should be 2026-07-24 Maree, got ${dates[0]}`)
assert(
  rows.some((r) => r.guest.includes('Jack Elliott') && r.host === 'Josh Revens'),
  'July 17 Jack Elliott / Josh Revens interview missing from fallback',
)
assert(
  rows.some((r) => r.guest.includes('Bill Winters') && r.host === 'John Painter'),
  'July 10 Bill Winters / John Painter interview missing from fallback',
)

if (fail.length) {
  console.error('verify-interview-fresh FAILED')
  for (const f of fail) console.error(' -', f)
  process.exit(1)
}
console.log(`verify-interview-fresh OK — ${rows.length} interviews, newest ${dates[0]}`)

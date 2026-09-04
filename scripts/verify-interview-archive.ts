/**
 * Fallback interview archive must match published fm985.com.au interviews.
 * fm985Feed.scrapedFallback invents "Community guest" / "ONE FM" when a field
 * starts with "[" — those placeholders are leftover, not a guest name.
 *
 * source: fm985.com.au/wp-json/wp/v2/posts?categories=24 (24 Jul 2026)
 */
import scraped from '../src/data/oneFmScrapedData.json'

type Row = {
  date: string
  guest: string
  topic: string
  host: string
  source?: string
}

const data = scraped as {
  station: { licensed_by: string; address?: string }
  contact: { address: string; instagram?: string; podcast_email?: string }
  recent_interviews: Row[]
}

function mappedTitle(row: Row): string {
  const guest = row.guest.startsWith('[') ? 'Community guest' : row.guest
  return `${guest} — ${row.topic}`
}

let failed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failed += 1
    console.error(`FAIL ${msg}`)
  } else {
    console.log(`ok   ${msg}`)
  }
}

const rows = data.recent_interviews
assert(rows.length >= 6, `at least 6 fallback interviews (got ${rows.length})`)

for (const row of rows) {
  assert(!row.guest.startsWith('['), `guest is published, not a placeholder: ${row.guest}`)
  assert(!row.host.startsWith('['), `host is published, not a placeholder: ${row.host}`)
  assert(!row.topic.startsWith('['), `topic is published, not a placeholder: ${row.topic}`)
  const title = mappedTitle(row)
  assert(!title.includes('Community guest'), `mapper title is not invented Community guest: ${title}`)
  assert(/^\d{4}-\d{2}-\d{2}$/.test(row.date), `date is YYYY-MM-DD: ${row.date}`)
  assert(row.date >= '2026-07-01', `fallback is the live July 2026 archive, not leftover April: ${row.date}`)
  assert(
    typeof row.source === 'string' && row.source.startsWith('https://fm985.com.au/interview/'),
    `row cites its fm985.com.au interview: ${row.guest}`,
  )
}

assert(data.station.licensed_by === 'ACMA', 'broadcast licence is ACMA — not leftover APRA AMCOS as licensor')
assert(
  data.contact.address === '47 Parkside Drive, Shepparton VIC 3630',
  'contact.address is the Parkside studio — not leftover MANUAL_ENTRY',
)
assert(!('instagram' in data.contact), 'no leftover invented Instagram placeholder')
assert(!('podcast_email' in data.contact), 'no leftover invented podcast inbox')

const titles = rows.slice(0, 6).map(mappedTitle)
console.log('\nfallback cards a listener would see if WP is down:')
for (const t of titles) console.log(`  • ${t}`)

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\ninterview archive leftover checks passed')

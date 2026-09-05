/**
 * Media kit / proposal Word covers use a Melbourne calendar day.
 * Leftover en-US month-first ("September 4, 2026") must not ship.
 * Run: npx vite-node scripts/verify-docx-au-date.ts
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { docxGeneratedOn, generateMediaKitDocx } from '../src/lib/docxExport'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-docx-au-date FAIL: ${message}`)
    process.exit(1)
  }
}

const src = readFileSync(new URL('../src/lib/docxExport.ts', import.meta.url), 'utf8')

assert(!src.includes("'en-US'"), 'docxExport must not format dates with leftover en-US')
assert(!src.includes('"en-US"'), 'docxExport must not format dates with leftover en-US')
assert(src.includes("'en-AU'"), 'docxExport must format dates with en-AU')
assert(src.includes("timeZone: 'Australia/Melbourne'"), 'docxExport must pin Melbourne, not the viewer clock')

const frozen = new Date('2026-09-04T12:28:00.000Z')
const label = docxGeneratedOn(frozen)
assert(label === '4 September 2026', `Melbourne 4 Sep 2026 label: ${label}`)
assert(!label.includes('September 4'), `must not keep leftover US month-first: ${label}`)

const blob = await generateMediaKitDocx({
  rateCard: [{ type: 'Standard 30s', duration: '30s', peak: 25, offPeak: 25, availability: 'Mon–Fri' }],
  audienceStats: [{ label: 'Est. weekly listeners', value: '39,375' }],
  platformReach: [{ platform: 'FM Radio', stat: '98.5 FM', reach: 'Shepparton' }],
  contactEmail: 'admin@fm985.com.au',
  contactPhone: '03 5821 9850',
})
const kitPath = join(tmpdir(), 'onefm-media-kit-au-date.docx')
writeFileSync(kitPath, Buffer.from(await blob.arrayBuffer()))
const listing = execFileSync('unzip', ['-l', kitPath], { encoding: 'utf8' })
const parts = ['word/document.xml', 'word/header1.xml', 'word/footer1.xml', 'word/header2.xml', 'word/footer2.xml']
  .filter((name) => listing.includes(name))
  .map((name) => execFileSync('unzip', ['-p', kitPath, name], { encoding: 'utf8' }))
const xml = parts.join('\n')
const today = docxGeneratedOn()
assert(xml.includes(today), `Word XML must contain ${today}`)
assert(xml.includes('Generated'), 'Word XML must still say Generated')
assert(!xml.includes('September 4, 2026'), 'Word XML must not keep leftover US month-first')

console.log('verify-docx-au-date OK')
console.log(`  helper ${label}`)
console.log(`  word   Generated ${today}`)

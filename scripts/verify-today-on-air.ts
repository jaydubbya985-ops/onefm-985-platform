/**
 * Listen / Broadcast must show the rest of today's guide — not a rate card.
 * Melbourne Friday 10:15 (2026-09-04T00:15:00Z) is Friday Mornings.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FULL_SCHEDULE } from '../src/data/programGuide.ts'
import {
  getTodayOnAir,
  isListenerInventorySurface,
  TODAY_ON_AIR_SOURCE,
} from '../src/lib/todayOnAir.ts'

const ladder = readFileSync(new URL('../src/components/InventoryLadder.tsx', import.meta.url), 'utf8')
const today = readFileSync(new URL('../src/components/TodayOnAir.tsx', import.meta.url), 'utf8')
const lib = readFileSync(new URL('../src/lib/todayOnAir.ts', import.meta.url), 'utf8')

assert.match(ladder, /isListenerInventorySurface/)
assert.match(ladder, /TodayOnAir/)
assert.match(ladder, /STANDARD_SPOT_PLUS_GST/)
assert.match(today, /Still on today/)
assert.match(today, /On the guide now/)
assert.doesNotMatch(today, /formatCoverage/)
assert.doesNotMatch(today, /24\/7/)
assert.doesNotMatch(lib, /getHours\(/)
assert.doesNotMatch(lib, /getDay\(/)
assert.match(lib, /getCurrentLiveShow/)
assert.match(lib, /formatWithPresenter/)
assert.match(lib, /FULL_SCHEDULE/)

assert.equal(isListenerInventorySurface('/listen'), true)
assert.equal(isListenerInventorySurface('/broadcast'), true)
assert.equal(isListenerInventorySurface('/media-kit'), false)
assert.equal(isListenerInventorySurface('/football'), false)

const fridayMorning = new Date('2026-09-04T00:15:00.000Z')
const board = getTodayOnAir(fridayMorning)
assert.equal(board.weekday, 'Friday')
assert.equal(board.current.name, 'Friday Mornings')
assert.equal(board.current.withLine, 'with Josh Revens')
assert.equal(board.current.onGuideNow, true)
assert.equal(board.sourceLabel, TODAY_ON_AIR_SOURCE)
assert.ok(!board.coming.some((row) => row.name === 'Overnight Mix'))
assert.ok(board.coming.some((row) => row.name === 'Dancing through the decades'))
assert.ok(board.coming.some((row) => row.name === 'Friday Arvo'))
assert.ok(board.coming.some((row) => row.name === 'NIRS AFL Friday Night Footy'))
assert.ok(!board.coming.some((row) => row.withLine === 'with ONE FM'))
assert.ok(!board.coming.some((row) => row.withLine === 'with Automated'))

const fridayNames = new Set(
  FULL_SCHEDULE.filter((s) => s.day === 5 && s.name !== 'Overnight Mix').map((s) => s.name),
)
for (const row of board.coming) {
  assert.ok(fridayNames.has(row.name), `invented coming row: ${row.name}`)
}

const overnight = getTodayOnAir(new Date('2026-09-04T16:30:00.000Z'))
assert.equal(overnight.weekday, 'Saturday')
assert.equal(overnight.current.name, 'Overnight Mix')
assert.equal(overnight.current.withLine, null)
assert.ok(overnight.coming.some((row) => row.name === 'Songs of the Spirit'))
assert.ok(overnight.coming.some((row) => row.name === 'GVL Match of the Day'))
assert.ok(!overnight.coming.some((row) => row.name === 'Overnight Mix'))

console.log('verify-today-on-air: ok')

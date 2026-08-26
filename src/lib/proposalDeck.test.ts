import assert from 'node:assert/strict'
import { assertClientLogoFile, CLIENT_LOGO_MAX_BYTES, pdfImageFormat } from './clientLogos'
import { CIVIC, GVL_FINALS_2026, NIRS_AFL, REACH } from '../data/proposalTruth'
import { forecast2026FromGrowth, towns } from '../data/townForecast'

assert.equal(REACH.weeklyListeners, 39375)
assert.equal(REACH.towns, 25)
assert.equal(REACH.radiusKm, 100)

assert.equal(CIVIC.csa.countLabel, 'Data pending')
assert.match(CIVIC.csa.jayClaim, /station-reported/)

assert.equal(GVL_FINALS_2026.homeAndAwayLast, '22 Aug 2026')
assert.equal(GVL_FINALS_2026.firstFinalsWeekend, '29–30 Aug 2026')
assert.equal(GVL_FINALS_2026.grandFinal, 'Sun 20 Sep 2026')
assert.match(NIRS_AFL.aflwNote, /do not invent a weekly AFLW show/)

const shepparton = towns.find((t) => t.name === 'Shepparton')
assert.ok(shepparton)
assert.equal(
  forecast2026FromGrowth(shepparton),
  Math.round(shepparton.population2021 * (1 + shepparton.growthRate / 100)),
)

assert.throws(
  () => assertClientLogoFile({ type: 'image/gif', size: 1000 }),
  /PNG, JPG, WebP or SVG/,
)
assert.throws(
  () => assertClientLogoFile({ type: 'image/png', size: CLIENT_LOGO_MAX_BYTES + 1 }),
  /400 KB/,
)
assertClientLogoFile({ type: 'image/png', size: 12_000 })

assert.equal(pdfImageFormat('data:image/png;base64,abc'), 'PNG')
assert.equal(pdfImageFormat('data:image/jpeg;base64,abc'), 'JPEG')
assert.equal(pdfImageFormat('data:image/svg+xml;base64,abc'), null)

assert.doesNotMatch(
  JSON.stringify({ CIVIC, GVL_FINALS_2026, NIRS_AFL, REACH }),
  /38%/,
)
assert.doesNotMatch(
  JSON.stringify({ CIVIC, GVL_FINALS_2026, NIRS_AFL, REACH }),
  /Acme Industries/,
)

console.log('proposal lockup + census forecast + truth copy checks passed')

/**
 * Editorial interior pages for sponsorship PDFs.
 * Census forecasts use stored growth rates × ABS 2021 — not a 2026 census release.
 * AFLW is only mentioned as a NIRS-card caveat. CSA count stays Data pending.
 */
import type { PdfPen } from '@/lib/pdfLetterhead'
import { drawInteriorHeader, loadPublicImage } from '@/lib/pdfLetterhead'
import { PDF_COVER_FOOTY_JPEG, PDF_COVER_FOOTY_PX } from '@/lib/pdfCoverImages'
import { DS } from '@/lib/invoiceDesignSystem'
import {
  BREAKFAST_DAYS,
  CIVIC,
  COUNTRY_AND_GOLD,
  DIGITAL,
  GVL_FINALS_2026,
  MULTICULTURAL,
  NIRS_AFL,
  REACH,
  SUPER_SATURDAY,
} from '@/data/proposalTruth'
import { CENSUS_SOURCE, GROWTH_SOURCE, fastestGrowingTowns, largestTowns, townsWithForecast } from '@/data/townForecast'

function coverFit(
  pageW: number,
  pageH: number,
  imgW: number,
  imgH: number,
): { x: number; y: number; w: number; h: number } {
  const scale = Math.max(pageW / imgW, pageH / imgH)
  const w = imgW * scale
  const h = imgH * scale
  return { x: (pageW - w) / 2, y: (pageH - h) / 2, w, h }
}

export async function loadLeagueMark(): Promise<string | null> {
  return loadPublicImage('/assets/logos/gvl/league/gvl-league.png')
}

/** Census + forecast table. */
export function drawValleyPage(p: PdfPen, number: string, _pageNo: string): void {
  const { doc, W, M, CW, inkNavy, inkGrey, inkDim, inkRed, bold, norm, tl, tr, kicker } = p
  let y = drawInteriorHeader(p, 'Sponsorship proposal', number, 'The coverage')

  kicker('A regional voice', M, y)
  y += 8
  bold(11)
  inkGrey()
  tl('Not a national stream total. 25 towns inside 100 km of Shepparton.', M, y)
  y += 12

  const towns = townsWithForecast(largestTowns(8))
  const colW = [62, 32, 28, 36]
  kicker('Town', M, y)
  kicker('ABS 2021', M + colW[0], y)
  kicker('Growth', M + colW[0] + colW[1], y)
  kicker('2026 fcast', M + colW[0] + colW[1] + colW[2], y)
  y += 6
  doc.setDrawColor(...DS.rgb.red)
  doc.setLineWidth(0.4)
  doc.line(M, y, M + CW, y)
  y += 7

  towns.forEach((town, i) => {
    if (i % 2 === 0) {
      p.fillLight()
      p.box(M, y - 5, CW, 8)
    }
    bold(10)
    inkNavy()
    tl(town.name, M + 1, y)
    norm(10)
    inkGrey()
    tl(town.population2021.toLocaleString('en-AU'), M + colW[0], y)
    tl(`+${town.growthRate}%`, M + colW[0] + colW[1], y)
    bold(10)
    inkNavy()
    tl(town.forecast2026.toLocaleString('en-AU'), M + colW[0] + colW[1] + colW[2], y)
    y += 8
  })

  y += 6
  const fast = fastestGrowingTowns(5)
  norm(8)
  inkDim()
  const fastLine = doc.splitTextToSize(
    `Fastest stored growth: ${fast.map((t) => `${t.name} +${t.growthRate}%`).join('  ·  ')}`,
    CW,
  ) as string[]
  fastLine.forEach((line) => {
    tl(line, M, y)
    y += 4
  })

  y += 6
  inkRed()
  bold(8)
  tl('How the forecast is made', M, y)
  y += 5
  norm(8)
  inkGrey()
  const method = doc.splitTextToSize(
    `${GROWTH_SOURCE}. Weekly listeners ${REACH.weeklyListeners.toLocaleString('en-AU')} stay the ABS 2021 estimate — we do not invent a 2026 census count.`,
    CW,
  ) as string[]
  method.forEach((line) => {
    tl(line, M, y)
    y += 4.2
  })

  y += 4
  norm(7)
  inkDim()
  tl(`${CENSUS_SOURCE}. Listeners: ${REACH.source}.`, M, y)
  tr(`Est. ${REACH.weeklyListeners.toLocaleString('en-AU')} weekly`, W - M, y)
}

/** GVL / KDL finals + NIRS AFL. Photo band is a real station frame. */
export function drawFinalsPage(
  p: PdfPen,
  number: string,
  _pageNo: string,
  leagueLogo?: string | null,
): void {
  const { doc, W, H, M, CW, fillNavy, fillRed, inkWhite, inkDim, inkRed, bold, norm, tl, box, kicker } = p

  fillNavy()
  box(0, 0, W, H)
  const bandH = 92
  const fit = coverFit(W, bandH + 24, PDF_COVER_FOOTY_PX.w, PDF_COVER_FOOTY_PX.h)
  try {
    doc.addImage(PDF_COVER_FOOTY_JPEG, 'JPEG', fit.x, fit.y - 8, fit.w, fit.h, undefined, 'FAST')
  } catch {
    /* navy remains */
  }
  fillNavy()
  box(0, bandH, W, H - bandH)
  fillRed()
  box(0, 0, 3.2, H)
  // fade into the type block
  fillNavy()
  box(0, bandH - 18, W, 18)

  kicker('Finals time now', M, 22, 'red')
  bold(9)
  inkWhite()
  tl(number, W - M - 40, 22)

  bold(26)
  inkWhite()
  tl('GVL and KDL', M, 48)
  tl('on the local air.', M, 60)

  if (leagueLogo) {
    try {
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(W - M - 28, 32, 28, 28, 1.2, 1.2, 'F')
      doc.addImage(leagueLogo, 'PNG', W - M - 25, 35, 22, 22, undefined, 'FAST')
    } catch {
      /* skip if the file is not PNG-readable */
    }
  }

  let y = bandH + 14
  kicker('GVL 2026 window', M, y)
  y += 8
  const dates = [
    ['Home-and-away closed', GVL_FINALS_2026.homeAndAwayLast],
    ['First finals weekend', GVL_FINALS_2026.firstFinalsWeekend],
    ['Preliminary final', GVL_FINALS_2026.preliminaryFinal],
    ['Grand final', GVL_FINALS_2026.grandFinal],
  ]
  dates.forEach(([label, value]) => {
    norm(9)
    inkDim()
    tl(label, M, y)
    bold(11)
    inkWhite()
    tl(value, M + 62, y)
    y += 8
  })

  y += 4
  kicker('Saturday on air', M, y)
  y += 7
  bold(12)
  inkWhite()
  tl(`Super Saturday  ·  ${SUPER_SATURDAY.presenters}`, M, y)
  y += 7
  norm(9)
  doc.setTextColor(200, 210, 220)
  const lineup = doc.splitTextToSize(SUPER_SATURDAY.lineup.join('   ·   '), CW) as string[]
  lineup.forEach((line) => {
    tl(line, M, y)
    y += 5
  })

  y += 5
  kicker('NIRS AFL', M, y)
  y += 7
  bold(11)
  inkWhite()
  tl(NIRS_AFL.friday, M, y)
  y += 6
  tl(NIRS_AFL.sunday, M, y)
  y += 8
  norm(8)
  inkRed()
  const aflw = doc.splitTextToSize(NIRS_AFL.aflwNote, CW) as string[]
  aflw.forEach((line) => {
    tl(line, M, y)
    y += 4.2
  })

  y += 6
  norm(7)
  inkDim()
  const src = doc.splitTextToSize(
    `${GVL_FINALS_2026.source}. ${NIRS_AFL.source}. Super Saturday: ${SUPER_SATURDAY.source}.`,
    CW,
  ) as string[]
  src.forEach((line) => {
    tl(line, M, y)
    y += 3.8
  })
}

/** Breakfast, country, gold, multicultural — program guide only. */
export function drawSoundPage(p: PdfPen, number: string, _pageNo: string): void {
  const { doc, M, CW, inkNavy, inkGrey, inkDim, bold, norm, tl, kicker } = p
  let y = drawInteriorHeader(p, 'Sponsorship proposal', number, 'The sound')

  kicker('ONE FM Breakfast', M, y)
  y += 8
  const cellW = CW / 5 - 2
  BREAKFAST_DAYS.forEach((slot, i) => {
    const x = M + i * (cellW + 2.5)
    p.fillLight()
    p.doc.roundedRect(x, y, cellW, 22, 1.2, 1.2, 'F')
    p.fillRed()
    p.box(x, y, cellW, 2)
    kicker(slot.day, x + 3, y + 8)
    bold(8)
    inkNavy()
    const host = doc.splitTextToSize(slot.host, cellW - 6) as string[]
    tl(host[0], x + 3, y + 16)
  })
  y += 28
  norm(7)
  inkDim()
  tl('Source: fm985.com.au/guide/ via programGuide.ts — June 2026 roster', M, y)
  y += 12

  const mid = M + CW / 2 + 4
  kicker('Country', M, y)
  kicker('Diverse programming', mid, y)
  y += 8
  COUNTRY_AND_GOLD.country.forEach((show, i) => {
    bold(10)
    inkNavy()
    tl(show, M, y + i * 7)
  })
  MULTICULTURAL.shows.forEach((show, i) => {
    bold(10)
    inkNavy()
    tl(show, mid, y + i * 7)
  })
  const block = Math.max(COUNTRY_AND_GOLD.country.length, MULTICULTURAL.shows.length) * 7
  y += block + 10

  bold(11)
  inkNavy()
  tl(COUNTRY_AND_GOLD.decades, M, y)
  y += 6
  tl(COUNTRY_AND_GOLD.windingBack, M, y)
  y += 12

  p.fillLight()
  p.doc.roundedRect(M, y, CW, 28, 1.5, 1.5, 'F')
  p.fillRed()
  p.box(M, y, 1.8, 28)
  kicker('News', M + 6, y + 7)
  norm(9)
  inkGrey()
  const news = doc.splitTextToSize(
    'News on this station is local and accountable. We do not sell sensationalism as reach.',
    CW - 14,
  ) as string[]
  news.forEach((line, i) => tl(line, M + 6, y + 14 + i * 5))
  y += 36

  norm(7)
  inkDim()
  tl(COUNTRY_AND_GOLD.source, M, y)
}

/** Emergency, CSA (pending), road safety, Facebook + SoundCloud with no fake counts. */
export function drawCivicPage(p: PdfPen, number: string, _pageNo: string): void {
  const { doc, M, CW, inkNavy, inkGrey, inkDim, inkRed, bold, norm, tl, kicker } = p
  let y = drawInteriorHeader(p, 'Sponsorship proposal', number, 'Civic value')

  kicker('Emergency broadcasting', M, y)
  y += 8
  bold(12)
  inkNavy()
  const lead = doc.splitTextToSize(CIVIC.emergencyLead, CW) as string[]
  lead.forEach((line) => {
    tl(line, M, y)
    y += 5.5
  })
  y += 3
  norm(9)
  inkGrey()
  const flood = doc.splitTextToSize(CIVIC.emergencyFlood, CW) as string[]
  flood.forEach((line) => {
    tl(line, M, y)
    y += 4.5
  })
  y += 8

  p.fillLight()
  p.doc.roundedRect(M, y, CW, 36, 1.5, 1.5, 'F')
  p.fillRed()
  p.box(M, y, 1.8, 36)
  kicker('Community service announcements', M + 6, y + 7)
  bold(10)
  inkNavy()
  tl(`Annual initiative count: ${CIVIC.csa.countLabel}`, M + 6, y + 16)
  norm(8)
  inkGrey()
  const csa = doc.splitTextToSize(CIVIC.csa.jayClaim, CW - 14) as string[]
  csa.forEach((line, i) => tl(line, M + 6, y + 23 + i * 4.2))
  y += 44

  kicker('Road safety  ·  local council', M, y)
  y += 7
  norm(9)
  inkGrey()
  const road = doc.splitTextToSize(CIVIC.roadSafety, CW) as string[]
  road.forEach((line) => {
    tl(line, M, y)
    y += 4.5
  })
  y += 10

  kicker('Where else they hear you', M, y)
  y += 8
  bold(11)
  inkNavy()
  tl(DIGITAL.facebook.replace('https://www.', ''), M, y)
  y += 6
  tl(DIGITAL.soundcloud.replace('https://', ''), M, y)
  y += 7
  norm(8)
  inkRed()
  const note = doc.splitTextToSize(DIGITAL.note, CW) as string[]
  note.forEach((line) => {
    tl(line, M, y)
    y += 4.2
  })
  y += 8
  norm(7)
  inkDim()
  tl(CIVIC.source, M, y)
}

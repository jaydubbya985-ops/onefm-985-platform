/**
 * Editorial PDF kit — Qwilr/Canva cover + Workday interior.
 * Brand V3: blue + white + red. Gold is a 1–2mm accent, never the whole page.
 */
import type { jsPDF } from 'jspdf'
import { DS } from '@/lib/invoiceDesignSystem'
import {
  INVOICE_LOGO_ASPECT,
  INVOICE_LOGO_DATA_URL,
  INVOICE_LOGO_FORMAT,
} from '@/lib/logoForPdf'
import { PDF_COVER_GRADIENT_PNG } from '@/lib/pdfCoverGradient'

export const PDF_W = 210
export const PDF_H = 297
export const PDF_M = 18
export const PDF_CW = PDF_W - PDF_M * 2
export const PDF_HEADER_H = 28
export const PDF_FOOTER_H = 14
export const PDF_RAIL = 3.2

export interface PdfPen {
  doc: jsPDF
  W: number
  H: number
  M: number
  CW: number
  HEADER_H: number
  fillNavy: () => void
  fillBlue: () => void
  fillGold: () => void
  fillRed: () => void
  fillLight: () => void
  fillWhite: () => void
  inkNavy: () => void
  inkBlue: () => void
  inkGold: () => void
  inkRed: () => void
  inkWhite: () => void
  inkGrey: () => void
  inkSilver: () => void
  inkDark: () => void
  inkDim: () => void
  inkNab: () => void
  bold: (sz: number) => void
  norm: (sz: number) => void
  box: (x: number, y: number, w: number, h: number, style?: 'F' | 'S' | 'FD') => void
  tl: (t: string, x: number, y: number) => jsPDF
  tr: (t: string, x: number, y: number) => jsPDF
  tc: (t: string, x: number, y: number) => jsPDF
  kicker: (t: string, x: number, y: number, color?: 'red' | 'silver' | 'navy') => void
}

export function createPdfPen(doc: jsPDF): PdfPen {
  const [nR, nG, nB] = DS.rgb.navy
  const [bR, bG, bB] = DS.rgb.blue
  const [gR, gG, gB] = DS.rgb.gold
  const [rR, rG, rB] = DS.rgb.red

  const kicker: PdfPen['kicker'] = (t, x, y, color = 'red') => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    if (color === 'red') doc.setTextColor(rR, rG, rB)
    else if (color === 'navy') doc.setTextColor(nR, nG, nB)
    else doc.setTextColor(200, 210, 220)
    doc.text(t.toUpperCase(), x, y, { charSpace: 1.15 })
  }

  return {
    doc,
    W: PDF_W,
    H: PDF_H,
    M: PDF_M,
    CW: PDF_CW,
    HEADER_H: PDF_HEADER_H,
    fillNavy: () => doc.setFillColor(nR, nG, nB),
    fillBlue: () => doc.setFillColor(bR, bG, bB),
    fillGold: () => doc.setFillColor(gR, gG, gB),
    fillRed: () => doc.setFillColor(rR, rG, rB),
    fillLight: () => doc.setFillColor(248, 248, 250),
    fillWhite: () => doc.setFillColor(255, 255, 255),
    inkNavy: () => doc.setTextColor(nR, nG, nB),
    inkBlue: () => doc.setTextColor(bR, bG, bB),
    inkGold: () => doc.setTextColor(gR, gG, gB),
    inkRed: () => doc.setTextColor(rR, rG, rB),
    inkWhite: () => doc.setTextColor(255, 255, 255),
    inkGrey: () => doc.setTextColor(...DS.rgb.grey),
    inkSilver: () => doc.setTextColor(...DS.rgb.silver),
    inkDark: () => doc.setTextColor(...DS.rgb.ink),
    inkDim: () => doc.setTextColor(130, 130, 130),
    inkNab: () => doc.setTextColor(DS.rgb.nab[0], DS.rgb.nab[1], DS.rgb.nab[2]),
    bold: (sz: number) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(sz)
    },
    norm: (sz: number) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(sz)
    },
    box: (x, y, w, h, style: 'F' | 'S' | 'FD' = 'F') => doc.rect(x, y, w, h, style),
    tl: (t, x, y) => doc.text(t, x, y),
    tr: (t, x, y) => doc.text(t, x, y, { align: 'right' }),
    tc: (t, x, y) => doc.text(t, x, y, { align: 'center' }),
    kicker,
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

/** Load a file from /public for jsPDF addImage. */
export async function loadPublicImage(publicPath: string): Promise<string | null> {
  const rel = publicPath.startsWith('/') ? publicPath : `/${publicPath}`
  const candidates =
    typeof window === 'undefined' ? [`http://127.0.0.1:3000${rel}`, rel] : [rel]
  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      return await blobToDataUrl(await res.blob())
    } catch {
      continue
    }
  }
  return null
}

/** Object-fit: cover a page with a raster. */
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

export function drawLogo(p: PdfPen, x: number, y: number, h = 11): number {
  const w = h * INVOICE_LOGO_ASPECT
  p.doc.setFillColor(255, 255, 255)
  p.doc.roundedRect(x - 2.2, y - 1.6, w + 4.4, h + 3.2, 1.2, 1.2, 'F')
  p.doc.addImage(INVOICE_LOGO_DATA_URL, INVOICE_LOGO_FORMAT, x, y, w, h)
  return w
}

export interface CoverSpec {
  imageDataUrl?: string | null
  imagePx?: { w: number; h: number }
  kicker: string
  title: string
  subtitle: string
  number: string
  statValue: string
  statLabel: string
  statAside?: string
}

/** Full-bleed photo cover — Qwilr/Canva: image is the page, type sits in a gradient. */
export function drawCover(p: PdfPen, spec: CoverSpec): void {
  const { doc, W, H, M, fillNavy, fillRed, inkWhite, inkRed, bold, norm, tl, tr, box, kicker } = p

  fillNavy()
  box(0, 0, W, H)

  if (spec.imageDataUrl) {
    const fmt = spec.imageDataUrl.includes('image/png') ? 'PNG' : 'JPEG'
    const px = spec.imagePx ?? { w: 1480, h: 1110 }
    const fit = coverFit(W, H, px.w, px.h)
    try {
      doc.addImage(spec.imageDataUrl, fmt, fit.x, fit.y, fit.w, fit.h, undefined, 'FAST')
    } catch {
      /* keep navy if the image is unreadable */
    }
  }

  try {
    doc.addImage(PDF_COVER_GRADIENT_PNG, 'PNG', 0, 0, W, H, undefined, 'FAST')
  } catch {
    fillNavy()
    box(0, 168, W, H - 168)
  }

  fillRed()
  box(0, 0, PDF_RAIL, H)

  drawLogo(p, M, 11, 11)
  bold(8)
  inkWhite()
  tr(spec.number, W - M, 18)

  const titleSize = spec.title.length > 32 ? 26 : spec.title.length > 22 ? 30 : 36
  const titles = doc.splitTextToSize(spec.title, W - M * 2) as string[]
  const titleLines = titles.slice(0, 2)
  const titleBlock = titleLines.length * (titleSize * 0.38 + 2)
  let y = H - 78 - titleBlock

  kicker(spec.kicker, M, y)
  y += 10
  bold(titleSize)
  inkWhite()
  titleLines.forEach((line) => {
    tl(line, M, y)
    y += titleSize * 0.38 + 2
  })

  y += 2
  norm(11)
  doc.setTextColor(210, 218, 228)
  const subs = doc.splitTextToSize(spec.subtitle, W - M * 2) as string[]
  subs.slice(0, 2).forEach((line) => {
    tl(line, M, y)
    y += 6
  })

  fillRed()
  box(M, H - 48, 22, 2.4)

  bold(34)
  inkWhite()
  tl(spec.statValue, M, H - 28)
  norm(9)
  doc.setTextColor(200, 210, 220)
  tl(spec.statLabel, M, H - 18)
  if (spec.statAside) {
    inkRed()
    bold(10)
    tr(spec.statAside, W - M, H - 18)
  }
}

export function drawInteriorHeader(p: PdfPen, kicker: string, number: string, headline?: string): number {
  const { W, H, M, fillRed, fillWhite, inkNavy, inkDim, bold, norm, tl, tr, box } = p
  fillWhite()
  box(0, 0, W, H)
  fillRed()
  box(0, 0, PDF_RAIL, H)
  drawLogo(p, M, 10, 10)
  p.kicker(kicker, M + 38, 14)
  bold(9)
  inkNavy()
  tr(number, W - M, 14)
  norm(8)
  inkDim()
  tr(DS.station.name, W - M, 19.5)
  p.doc.setDrawColor(...DS.rgb.red)
  p.doc.setLineWidth(0.45)
  p.doc.line(M, 26, W - M, 26)
  if (headline) {
    bold(22)
    inkNavy()
    tl(headline, M, 40)
    return 48
  }
  return 36
}

/** Start a new interior page when the remaining block will not fit above the footer. */
export function ensureInteriorSpace(
  p: PdfPen,
  y: number,
  needed: number,
  kicker: string,
  number: string,
  headline?: string,
): number {
  if (y + needed <= p.H - PDF_FOOTER_H - 6) return y
  p.doc.addPage()
  return drawInteriorHeader(p, kicker, number, headline)
}

export function drawSlimFooter(p: PdfPen, line: string, page?: string): void {
  const { W, H, M, fillRed, inkDim, norm, tl, tr, box } = p
  const FY = H - PDF_FOOTER_H
  fillRed()
  box(M, FY, 16, 1.4)
  norm(7)
  inkDim()
  tl(line, M, FY + 8)
  if (page) tr(page, W - M, FY + 8)
}

export function drawStatCards(
  p: PdfPen,
  y: number,
  cards: { n: string; t: string }[],
): number {
  const { M, CW, inkNavy, inkDim, bold, norm, tl, box } = p
  const gap = 4
  const n = cards.length
  const w = (CW - gap * (n - 1)) / n
  const h = 26
  cards.forEach((c, i) => {
    const x = M + i * (w + gap)
    p.fillLight()
    p.doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F')
    p.fillRed()
    box(x, y, w, 2)
    bold(18)
    inkNavy()
    tl(c.n, x + 5, y + 13)
    norm(7)
    inkDim()
    const labels = p.doc.splitTextToSize(c.t, w - 10) as string[]
    tl(labels[0], x + 5, y + 21)
  })
  return y + h + 8
}

export function drawAmountBand(p: PdfPen, y: number, label: string, amount: string): number {
  const { W, M, CW, fillNavy, inkWhite, inkRed, bold, norm, tl, tr, box } = p
  const h = 28
  fillNavy()
  p.doc.roundedRect(M, y, CW, h, 1.8, 1.8, 'F')
  p.fillRed()
  box(M, y, 3.2, h)
  norm(8)
  inkWhite()
  tl(label, M + 12, y + 17)
  bold(22)
  inkRed()
  tr(amount, W - M - 8, y + 18)
  return y + h + 10
}

/** @deprecated interior pages use drawInteriorHeader */
export function drawLetterhead(p: PdfPen, title: string, number: string): number {
  return drawInteriorHeader(p, title, number)
}

export function drawFooter(p: PdfPen, line2: string, line3: string): void {
  drawSlimFooter(p, `${line2}  ·  ${line3}`)
}

/**
 * Shared navy/gold PDF letterhead — invoices, proposals, and contracts.
 * Geometry: A4, 20mm margins, 42mm navy header, 1.5mm gold rule, 18mm footer.
 */
import type { jsPDF } from 'jspdf'
import { DS } from '@/lib/invoiceDesignSystem'
import { LOGO_PDF_DATA_URL } from '@/lib/logoBase64'

export const PDF_W = 210
export const PDF_H = 297
export const PDF_M = 20
export const PDF_CW = PDF_W - PDF_M * 2
export const PDF_HEADER_H = 42
export const PDF_FOOTER_H = 18

export interface PdfPen {
  doc: jsPDF
  W: number
  H: number
  M: number
  CW: number
  HEADER_H: number
  fillNavy: () => void
  fillGold: () => void
  fillLight: () => void
  inkNavy: () => void
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
  tl: (t: string, x: number, y: number) => void
  tr: (t: string, x: number, y: number) => void
  tc: (t: string, x: number, y: number) => void
}

export function createPdfPen(doc: jsPDF): PdfPen {
  const [nR, nG, nB] = DS.rgb.navy
  const [gR, gG, gB] = DS.rgb.gold
  const [rR, rG, rB] = DS.rgb.red

  return {
    doc,
    W: PDF_W,
    H: PDF_H,
    M: PDF_M,
    CW: PDF_CW,
    HEADER_H: PDF_HEADER_H,
    fillNavy: () => doc.setFillColor(nR, nG, nB),
    fillGold: () => doc.setFillColor(gR, gG, gB),
    fillLight: () => doc.setFillColor(...DS.rgb.offWhite),
    inkNavy: () => doc.setTextColor(nR, nG, nB),
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
  }
}

/** Navy band + wordmark + gold rule. Returns first body Y. */
export function drawLetterhead(
  p: PdfPen,
  title: string,
  number: string,
  titleSize = 11,
): number {
  const { doc, W, M, HEADER_H, fillNavy, fillGold, inkWhite, inkGold, inkSilver, inkDim, bold, norm, tl, tr, box } = p

  fillNavy()
  box(0, 0, W, HEADER_H)

  const LOGO_H = 13
  const LOGO_W = LOGO_H * (1800 / 805)
  const LOGO_Y = 7
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(M - 3, LOGO_Y - 2, LOGO_W + 6, LOGO_H + 4, 1.5, 1.5, 'F')
  doc.addImage(LOGO_PDF_DATA_URL, 'JPEG', M, LOGO_Y, LOGO_W, LOGO_H)

  norm(8)
  inkSilver()
  tl(DS.station.tagline, M, 27)
  norm(7)
  inkDim()
  tl(`ABN: ${DS.station.abn}`, M, 32.5)

  bold(titleSize)
  inkWhite()
  tr(title, W - M, 16.5)
  norm(10)
  inkGold()
  tr(number, W - M, 24.5)

  fillGold()
  box(0, HEADER_H, W, 1.5)

  return HEADER_H + 10
}

/** Gold hairline + navy footer. Call last on the first page (single-page docs). */
export function drawFooter(p: PdfPen, line2: string, line3: string): void {
  const { doc, W, H, fillNavy, fillGold, inkSilver, norm, tc, box } = p
  const FY = H - PDF_FOOTER_H

  fillGold()
  box(0, FY - 1, W, 1)
  fillNavy()
  box(0, FY, W, PDF_FOOTER_H)

  norm(7.5)
  inkSilver()
  tc(
    `Goulburn Valley Community Radio Inc.  ·  ABN: ${DS.station.abn}  ·  ${DS.station.phone}`,
    W / 2,
    FY + 6,
  )
  tc(line2, W / 2, FY + 10.5)
  norm(6.5)
  doc.setTextColor(100, 100, 100)
  tc(line3, W / 2, FY + 15)
}

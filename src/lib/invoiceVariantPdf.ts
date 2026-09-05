/**
 * Three invoice PDF renderers — vector jsPDF, A4, variant-specific letterheads.
 */
import { jsPDF } from 'jspdf'
import type { PdfInvoiceData } from '@/components/ops/InvoiceEmailTemplate'
import { DS } from '@/lib/invoiceDesignSystem'
import {
  createPdfPen,
  drawAmountBand,
  drawInteriorHeader,
  drawLogo,
  drawSlimFooter,
  type PdfPen,
} from '@/lib/pdfLetterhead'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import type { InvoiceDesignVariantId } from '@/lib/invoiceDesignVariants'
import { INVOICE_STATION } from '@/lib/invoiceDesignVariants'
import { formatCoverageShort } from '@/lib/coverageCopy'

const aud = (n: number) =>
  `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function drawVariantHeader(p: PdfPen, variant: InvoiceDesignVariantId, number: string): number {
  const { W, H, M, bold, norm, tl, tr, box, kicker } = p

  switch (variant) {
    case 'on-air': {
      p.fillRed()
      box(0, 0, W, 6)
      p.doc.setFillColor(10, 10, 10)
      box(0, 6, W, H)
      p.doc.setFillColor(229, 22, 54)
      box(0, 6, 3.2, H)
      drawLogo(p, M, 14, 9)
      kicker('Tax invoice · ON AIR', M + 34, 18, 'red')
      bold(9)
      p.inkWhite()
      tr(number, W - M, 18)
      norm(7)
      p.doc.setTextColor(180, 180, 180)
      tr(DS.station.name, W - M, 23)
      p.doc.setDrawColor(229, 22, 54)
      p.doc.setLineWidth(0.5)
      p.doc.line(M, 30, W - M, 30)
      return 38
    }
    case 'valley': {
      p.doc.setFillColor(45, 74, 62)
      box(0, 0, W, 32)
      p.doc.setFillColor(196, 162, 101)
      box(0, 32, W, 1.2)
      p.doc.setFillColor(245, 240, 232)
      box(0, 33, W, H - 33)
      drawLogo(p, M, 8, 9)
      kicker('Partners in the Valley', M + 34, 12, 'navy')
      bold(11)
      p.doc.setTextColor(255, 255, 255)
      tl('ONE FM 98.5', M + 34, 20)
      bold(8)
      tr(number, W - M, 14)
      norm(7)
      p.doc.setTextColor(220, 210, 195)
      tr('Tax invoice', W - M, 20)
      return 42
    }
    default:
      return drawInteriorHeader(p, 'Tax invoice', number)
  }
}

function drawVariantAmount(
  p: PdfPen,
  variant: InvoiceDesignVariantId,
  y: number,
  total: number,
  dueDate: string,
  gst: number,
): number {
  const { W, M, CW, bold, norm, tl, tr, box } = p
  const amount = aud(total)

  switch (variant) {
    case 'on-air': {
      const h = 32
      p.doc.setFillColor(229, 22, 54)
      p.doc.roundedRect(M, y, CW, h, 1.5, 1.5, 'F')
      p.doc.setFillColor(182, 255, 0)
      box(M + 8, y + 8, 2.5, 2.5)
      norm(7)
      p.doc.setTextColor(255, 255, 255)
      tl('AMOUNT DUE', M + 14, y + 12)
      bold(28)
      tl(amount, M + 14, y + 26)
      norm(8)
      p.doc.setTextColor(255, 255, 255)
      tr(`Due ${dueDate}`, W - M - 6, y + 24)
      return y + h + 10
    }
    case 'valley': {
      const h = 30
      p.doc.setFillColor(255, 252, 247)
      p.doc.setDrawColor(196, 162, 101)
      p.doc.setLineWidth(0.4)
      p.doc.roundedRect(M, y, CW, h, 2, 2, 'FD')
      norm(7)
      p.doc.setTextColor(45, 74, 62)
      tl('AMOUNT DUE', M + 10, y + 10)
      bold(24)
      p.doc.setTextColor(184, 134, 11)
      tl(amount, M + 10, y + 22)
      norm(8)
      p.doc.setTextColor(107, 107, 107)
      tr(`inc GST ${aud(gst)} · due ${dueDate}`, W - M - 8, y + 22)
      return y + h + 10
    }
    default:
      bold(42)
      p.inkRed()
      tl(amount, M, y + 10)
      norm(10)
      p.inkDim()
      tl(`AUD due ${dueDate}  ·  includes GST of ${aud(gst)}`, M, y + 18)
      return y + 24
  }
}

function drawSharedBody(p: PdfPen, invoice: PdfInvoiceData, y: number, variant: InvoiceDesignVariantId): number {
  const { W, M, CW, bold, norm, tl, tr, kicker, doc } = p
  const issueDate = (invoice.issueDate ? new Date(invoice.issueDate) : new Date()).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  kicker('Bill to', M, y)
  kicker('From', W / 2 + 4, y)
  y += 6
  bold(13)
  if (variant === 'valley') doc.setTextColor(45, 74, 62)
  else p.inkNavy()
  tl(invoice.contactName || invoice.company, M, y)
  tl(DS.station.name, W / 2 + 4, y)
  y += 6
  norm(9)
  p.inkGrey()
  tl(invoice.company, M, y)
  tl(DS.station.address, W / 2 + 4, y)
  y += 5
  if (invoice.email) tl(invoice.email, M, y)
  tl(`${DS.station.phone}  ·  ${DS.station.accountsEmail}`, W / 2 + 4, y)
  y += 14

  const COL3 = CW / 3
  kicker('Issue date', M, y)
  kicker('Due date', M + COL3, y)
  kicker('Reference', M + COL3 * 2, y)
  y += 6
  bold(12)
  if (variant === 'valley') doc.setTextColor(45, 74, 62)
  else p.inkNavy()
  tl(issueDate, M, y)
  if (variant === 'on-air') p.inkRed()
  else if (variant === 'valley') doc.setTextColor(184, 134, 11)
  else p.inkRed()
  tl(dueDate, M + COL3, y)
  if (variant === 'valley') doc.setTextColor(45, 74, 62)
  else p.inkNavy()
  tl(invoice.number, M + COL3 * 2, y)
  y += 12

  kicker('Description', M, y)
  kicker('Amount', W - M - 24, y)
  y += 4
  doc.setDrawColor(230, 230, 232)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 8

  const descLines = doc.splitTextToSize(invoice.description, CW - 50) as string[]
  norm(11)
  p.inkDark()
  descLines.forEach((line, i) => {
    tl(line, M, y)
    if (i === 0) tr(aud(invoice.amountExclGst), W - M, y)
    y += 6
  })
  if (invoice.period) {
    norm(9)
    p.inkDim()
    tl(`Period: ${invoice.period}`, M, y)
    y += 6
  }
  y += 4
  doc.line(M, y, W - M, y)
  y += 8
  norm(10)
  p.inkGrey()
  tl('Subtotal (ex GST)', M, y)
  p.inkDark()
  tr(aud(invoice.amountExclGst), W - M, y)
  y += 6
  p.inkGrey()
  tl('GST (10%)', M, y)
  p.inkDark()
  tr(aud(invoice.gst), W - M, y)
  y += 8

  return y
}

function drawBankBlock(p: PdfPen, y: number, invoiceNumber: string, variant: InvoiceDesignVariantId): number {
  const { M, CW, fillLight, fillRed, inkNab, inkNavy, inkDim, bold, norm, tl, box, kicker } = p

  if (variant === 'on-air') {
    p.doc.setFillColor(10, 10, 10)
    p.doc.setDrawColor(229, 22, 54)
    p.doc.setLineWidth(0.5)
    p.doc.roundedRect(M, y, CW, 34, 1.5, 1.5, 'FD')
    kicker('Pay by bank transfer', M + 6, y + 7)
    norm(9)
    p.doc.setTextColor(182, 255, 0)
    tl('NAB', M + 6, y + 14)
    bold(11)
    p.doc.setTextColor(255, 255, 255)
    tl(`BSB ${BANK_BSB}`, M + 6, y + 22)
    tl(`Acc ${BANK_ACCOUNT}`, M + 62, y + 22)
    tl(BANK_ACCOUNT_NAME, M + 118, y + 22)
    norm(8)
    p.doc.setTextColor(160, 160, 160)
    tl(`Reference  ${invoiceNumber}`, M + 6, y + 30)
    return y + 40
  }

  if (variant === 'valley') {
    p.doc.setFillColor(255, 252, 247)
    p.doc.setDrawColor(196, 162, 101)
    p.doc.setLineWidth(0.35)
    p.doc.roundedRect(M, y, CW, 34, 2, 2, 'FD')
    kicker('Bank transfer — preferred', M + 6, y + 7)
    norm(9)
    p.doc.setTextColor(45, 74, 62)
    tl('National Australia Bank', M + 6, y + 14)
    bold(11)
    p.doc.setTextColor(45, 74, 62)
    tl(`BSB ${BANK_BSB}`, M + 6, y + 22)
    tl(`Acc ${BANK_ACCOUNT}`, M + 62, y + 22)
    tl(BANK_ACCOUNT_NAME, M + 118, y + 22)
    norm(8)
    p.doc.setTextColor(107, 107, 107)
    tl(`Reference  ${invoiceNumber}`, M + 6, y + 30)
    return y + 40
  }

  fillLight()
  box(M, y, CW, 36)
  fillRed()
  box(M, y, 1.8, 36)
  kicker('Pay by bank transfer', M + 6, y + 7)
  norm(9)
  inkNab()
  tl('National Australia Bank', M + 6, y + 14)
  bold(11)
  inkNavy()
  tl(`BSB ${BANK_BSB}`, M + 6, y + 22)
  tl(`Acc ${BANK_ACCOUNT}`, M + 62, y + 22)
  tl(BANK_ACCOUNT_NAME, M + 118, y + 22)
  norm(8)
  inkDim()
  tl(`Reference  ${invoiceNumber}  ·  payment due within 14 days`, M + 6, y + 30)
  return y + 42
}

export async function generateVariantInvoicePdf(
  invoice: PdfInvoiceData,
  variant: InvoiceDesignVariantId = 'broadcast',
): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const p = createPdfPen(doc)
  const today = new Date()
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  let y = drawVariantHeader(p, variant, invoice.number)
  y = drawVariantAmount(p, variant, y, invoice.total, dueDate, invoice.gst)

  if (variant === 'broadcast') {
    y = drawSharedBody(p, invoice, y, variant)
    y = drawAmountBand(p, y, 'Total due', aud(invoice.total))
    y += 4
  } else {
    y = drawSharedBody(p, invoice, y, variant)
    y += 4
  }

  y = drawBankBlock(p, y, invoice.number, variant)

  // source: townData / coverageCopy — 25 towns · 100km radius (ABS 2021)
  const coverage = formatCoverageShort()
  const footerLine =
    variant === 'valley'
      ? `${INVOICE_STATION.org}  ·  Callsign 3ONE  ·  ABN ${DS.station.abn}  ·  ${coverage}`
      : variant === 'on-air'
        ? `${INVOICE_STATION.org}  ·  ABN ${DS.station.abn}  ·  ${coverage}`
        : `${INVOICE_STATION.org}  ·  ABN ${DS.station.abn}  ·  ${DS.station.phone}  ·  ${coverage}`

  drawSlimFooter(p, footerLine, `Generated ${today.toLocaleDateString('en-AU')}`)

  return doc
}

/** Default export path — uses stored variant when omitted */
export async function generateInvoicePdfForVariant(
  invoice: PdfInvoiceData,
  variant?: InvoiceDesignVariantId,
): Promise<jsPDF> {
  const { getInvoiceDesignVariant } = await import('@/lib/invoiceDesignVariants')
  const id = variant ?? getInvoiceDesignVariant()
  return generateVariantInvoicePdf(invoice, id)
}

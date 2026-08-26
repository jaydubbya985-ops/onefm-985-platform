/**
 * Sponsorship agreement PDF — same navy/gold letterhead as invoices and proposals.
 * Not a tax invoice. Bank details (BSB 083-894) are for the invoices that follow.
 */
import { jsPDF } from 'jspdf'
import { DS } from '@/lib/invoiceDesignSystem'
import { createPdfPen, drawFooter, drawLetterhead } from '@/lib/pdfLetterhead'
import { stationStats } from '@/data/pricing'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import type { Contract } from '@/components/ops/data/sponsors'
import {
  billingFrequencyLabel,
  normalizeContract,
  paymentTermsLabel,
} from '@/components/ops/contracts/constants'
import { formatAud, formatAuDate } from '@/lib/proposalDocument'

export async function generateContractPdf(contract: Contract): Promise<jsPDF> {
  const c = normalizeContract(contract)
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const p = createPdfPen(doc)
  const {
    W, H, M, CW,
    fillNavy, fillLight,
    inkNavy, inkGold, inkWhite, inkGrey, inkDark, inkDim,
    bold, norm, tl, tr,
  } = p
  const [bR, bG, bB] = DS.rgb.blue

  let y = drawLetterhead(p, 'SPONSORSHIP AGREEMENT', c.contractNumber)

  norm(7)
  inkDim()
  tl('SPONSOR', M, y)
  tl('STATION', W / 2 + 5, y)
  y += 5.5
  bold(11)
  inkNavy()
  tl(c.primaryContact, M, y)
  tl(DS.station.name, W / 2 + 5, y)
  y += 5
  norm(9.5)
  inkGrey()
  tl(c.companyName, M, y)
  tl('Goulburn Valley Community Radio Inc.', W / 2 + 5, y)
  y += 4.5
  norm(8)
  inkGrey()
  if (c.email) tl(c.email, M, y)
  tl(`${DS.station.address}`, W / 2 + 5, y)
  y += 4.5
  tl(`${DS.station.phone}  ·  admin@fm985.com.au`, W / 2 + 5, y)
  y += 10

  fillLight()
  doc.rect(M, y, CW, 18, 'F')
  doc.setDrawColor(bR, bG, bB)
  doc.setLineWidth(1.5)
  doc.line(M, y, M, y + 18)
  bold(7)
  inkDim()
  tl('COVERAGE  ·  sourced, not invented', M + 4, y + 5.5)
  bold(10)
  inkNavy()
  tl(
    `${stationStats.weeklyListeners.toLocaleString('en-AU')} est. weekly listeners  ·  ${stationStats.totalTowns} towns  ·  ${stationStats.broadcastRadiusKm}km`,
    M + 4,
    y + 12.5,
  )
  y += 22
  norm(6.5)
  inkDim()
  tl('Source: ABS 2021 Census via src/data/townData.ts', M, y)
  y += 8

  const COL = CW / 3
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 5
  norm(7)
  inkDim()
  tl('START', M, y)
  tl('END', M + COL, y)
  tl('PAYMENT TERMS', M + COL * 2, y)
  y += 5.5
  bold(10)
  inkNavy()
  tl(formatAuDate(c.startDate), M, y)
  tl(formatAuDate(c.endDate), M + COL, y)
  tl(paymentTermsLabel(c.paymentTerms), M + COL * 2, y)
  y += 8
  doc.line(M, y, W - M, y)
  y += 8

  bold(13)
  inkNavy()
  tl(c.campaignName, M, y)
  y += 5.5
  norm(9)
  inkGrey()
  tl(`${c.tier}  ·  ${billingFrequencyLabel(c.billingFrequency)}`, M, y)
  y += 8

  const descLines = doc.splitTextToSize(c.description || 'Sponsorship services as agreed.', CW) as string[]
  norm(9)
  inkDark()
  descLines.forEach((line) => {
    if (y > H - 90) {
      doc.addPage()
      y = M
    }
    tl(line, M, y)
    y += 4.5
  })
  y += 6

  const TX = M + CW - 78
  doc.setDrawColor(220, 220, 220)
  doc.line(TX, y, W - M, y)
  y += 5
  norm(9)
  inkGrey()
  tl('Contract value (ex GST)', TX, y)
  inkDark()
  tr(formatAud(c.contractValue), W - M, y)
  y += 5
  inkGrey()
  tl('GST (10%)', TX, y)
  inkDark()
  tr(formatAud(c.gst), W - M, y)
  y += 6
  fillNavy()
  doc.rect(TX - 2, y, CW - (TX - M) + 2, 11, 'F')
  bold(11.5)
  inkWhite()
  tl('TOTAL INCL. GST', TX, y + 7.5)
  inkGold()
  tr(formatAud(c.totalValue), W - M, y + 7.5)
  y += 16

  fillLight()
  doc.rect(M, y, CW, 28, 'F')
  doc.setDrawColor(bR, bG, bB)
  doc.setLineWidth(1.5)
  doc.line(M, y, M, y + 28)
  bold(7)
  inkDim()
  tl('INVOICES  ·  not this document', M + 4, y + 6)
  norm(8.5)
  inkNavy()
  tl(`Tax invoices follow this agreement. Pay to ${BANK_ACCOUNT_NAME}.`, M + 4, y + 12.5)
  tl(`NAB  ·  BSB ${BANK_BSB}  ·  Account ${BANK_ACCOUNT}  ·  quote the invoice number.`, M + 4, y + 18)
  tl(`Payment due ${paymentTermsLabel(c.paymentTerms).toLowerCase()} from invoice date.`, M + 4, y + 23.5)
  y += 34

  bold(8)
  inkNavy()
  tl('SIGNED FOR THE STATION', M, y)
  tl('SIGNED FOR THE SPONSOR', W / 2 + 5, y)
  y += 14
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.line(M, y, M + 70, y)
  doc.line(W / 2 + 5, y, W - M, y)
  y += 5
  norm(8)
  inkGrey()
  tl(c.ourSignatory || DS.station.sigName, M, y)
  tl(c.signedBy || c.primaryContact, W / 2 + 5, y)
  y += 4.5
  tl(c.signedDate ? formatAuDate(c.signedDate) : 'Date _______________', M, y)
  tl('Date _______________', W / 2 + 5, y)
  y += 8
  norm(7.5)
  inkDim()
  tl('This is a sponsorship agreement for signature — not a tax invoice.', M, y)

  drawFooter(
    p,
    `admin@fm985.com.au  ·  ${DS.station.address}`,
    `${c.contractNumber}.pdf`,
  )

  return doc
}

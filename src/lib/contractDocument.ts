/**
 * Sponsorship agreement PDF — Qwilr cover + signature interior.
 * Not a tax invoice. Bank details (BSB 083-894) are for the invoices that follow.
 */
import { jsPDF } from 'jspdf'
import { DS } from '@/lib/invoiceDesignSystem'
import {
  createPdfPen,
  drawAmountBand,
  drawCover,
  drawInteriorHeader,
  drawSlimFooter,
  drawStatCards,
  ensureInteriorSpace,
} from '@/lib/pdfLetterhead'
import {
  PDF_COVER_STUDIO_JPEG,
  PDF_COVER_STUDIO_PX,
} from '@/lib/pdfCoverImages'
import { formatRadius, formatTowns, weeklyListenersValue } from '@/lib/coverageCopy'
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
    fillLight, fillRed,
    inkNavy, inkGrey, inkDark, inkDim,
    bold, norm, tl, box, kicker,
  } = p

  const coverImg = PDF_COVER_STUDIO_JPEG
  drawCover(p, {
    imageDataUrl: coverImg,
    imagePx: PDF_COVER_STUDIO_PX,
    kicker: 'Sponsorship agreement',
    title: c.companyName,
    subtitle: `${c.campaignName}  ·  ${c.tier}`,
    number: c.contractNumber,
    statValue: weeklyListenersValue(),
    statLabel: 'Est. weekly listeners  ·  ABS 2021 via townData',
    statAside: `${formatTowns()}  ·  ${formatRadius()}`,
  })

  doc.addPage()
  let y = drawInteriorHeader(p, 'Sponsorship agreement', c.contractNumber, 'The agreement')

  kicker('Sponsor', M, y)
  kicker('Station', W / 2 + 4, y)
  y += 6
  bold(14)
  inkNavy()
  tl(c.primaryContact, M, y)
  tl(DS.station.name, W / 2 + 4, y)
  y += 6
  norm(9)
  inkGrey()
  tl(c.companyName, M, y)
  tl('Goulburn Valley Community Radio Inc.', W / 2 + 4, y)
  y += 5
  if (c.email) tl(c.email, M, y)
  tl(`${DS.station.address}`, W / 2 + 4, y)
  y += 5
  tl(`${DS.station.phone}  ·  admin@fm985.com.au`, W / 2 + 4, y)
  y += 8

  y = drawStatCards(p, y, [
    { n: formatAuDate(c.startDate), t: 'Start' },
    { n: formatAuDate(c.endDate), t: 'End' },
    { n: paymentTermsLabel(c.paymentTerms), t: 'Payment terms' },
  ])

  bold(20)
  inkNavy()
  const names = doc.splitTextToSize(c.campaignName, CW) as string[]
  names.forEach((line) => {
    tl(line, M, y)
    y += 9
  })
  norm(10)
  inkGrey()
  tl(`${c.tier}  ·  ${billingFrequencyLabel(c.billingFrequency)}`, M, y)
  y += 8

  const descLines = doc.splitTextToSize(c.description || 'Sponsorship services as agreed.', CW) as string[]
  norm(10)
  inkDark()
  descLines.forEach((line) => {
    if (y > H - 90) {
      doc.addPage()
      y = drawInteriorHeader(p, 'Sponsorship agreement', c.contractNumber, 'The agreement')
    }
    tl(line, M, y)
    y += 5
  })
  y += 6

  y = ensureInteriorSpace(p, y, 92, 'Sponsorship agreement', c.contractNumber, 'The agreement')
  y = drawAmountBand(
    p,
    y,
    `Contract  ·  ${formatAud(c.contractValue)} ex GST + ${formatAud(c.gst)} GST`,
    formatAud(c.totalValue),
  )

  fillLight()
  box(M, y, CW, 26)
  fillRed()
  box(M, y, 1.8, 26)
  kicker('Invoices  ·  not this document', M + 6, y + 5)
  norm(9)
  inkNavy()
  tl(`Tax invoices follow this agreement. Pay to ${BANK_ACCOUNT_NAME}.`, M + 6, y + 12)
  tl(`NAB  ·  BSB ${BANK_BSB}  ·  Account ${BANK_ACCOUNT}  ·  quote the invoice number.`, M + 6, y + 17.5)
  tl(`Payment due ${paymentTermsLabel(c.paymentTerms).toLowerCase()} from invoice date.`, M + 6, y + 23)
  y += 32

  kicker('Signed for the station', M, y)
  kicker('Signed for the sponsor', W / 2 + 4, y)
  y += 14
  p.doc.setDrawColor(180, 180, 180)
  p.doc.setLineWidth(0.35)
  p.doc.line(M, y, M + 72, y)
  p.doc.line(W / 2 + 4, y, W - M, y)
  y += 5
  norm(9)
  inkGrey()
  tl(c.ourSignatory || DS.station.sigName, M, y)
  tl(c.signedBy || c.primaryContact, W / 2 + 4, y)
  y += 5
  tl(c.signedDate ? formatAuDate(c.signedDate) : 'Date _______________', M, y)
  tl('Date _______________', W / 2 + 4, y)
  y += 8
  norm(8)
  inkDim()
  tl('This is a sponsorship agreement for signature — not a tax invoice.', M, y)

  const pages = doc.getNumberOfPages()
  for (let i = 2; i <= pages; i++) {
    doc.setPage(i)
    drawSlimFooter(
      p,
      `Goulburn Valley Community Radio Inc.  ·  ABN ${DS.station.abn}  ·  ${DS.station.phone}`,
      String(i),
    )
  }

  return doc
}

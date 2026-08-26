/**
 * Sponsorship proposal document — PDF + email copy.
 *
 * Stats are sourced. Weekly listeners 39,375 = ABS 2021 via src/data/townData.ts
 * (also exported on stationStats). Never invent demographics.
 */
import { jsPDF } from 'jspdf'
import { DS } from '@/lib/invoiceDesignSystem'
import { createPdfPen, drawFooter, drawLetterhead } from '@/lib/pdfLetterhead'
import { stationStats } from '@/data/pricing'
import type { ProposalDeliverable, ProposalPackage } from '@/components/ops/data/sponsors'

export const GST_RATE = 0.1

export const DURATION_OPTIONS: { weeks: number; label: string }[] = [
  { weeks: 4, label: '4 weeks' },
  { weeks: 13, label: '13 weeks (quarter)' },
  { weeks: 26, label: '26 weeks (half year)' },
  { weeks: 52, label: '52 weeks (annual)' },
]

export interface ProposalMoney {
  exGst: number
  gst: number
  total: number
}

export function gstOn(exGst: number): ProposalMoney {
  const gst = Math.round(exGst * GST_RATE * 100) / 100
  return { exGst, gst, total: Math.round((exGst + gst) * 100) / 100 }
}

export function formatAud(n: number): string {
  return `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function addDaysIso(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function nextProposalNumber(existing: (string | undefined)[]): string {
  let max = 0
  const prefix = 'PROP-2026-'
  for (const n of existing) {
    if (n?.startsWith(prefix)) {
      const num = parseInt(n.slice(prefix.length), 10)
      if (!Number.isNaN(num) && num > max) max = num
    }
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

export function formatAuDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function computePackageValue(
  pkg: ProposalPackage,
  durationWeeks: number,
  extras: Record<string, boolean>,
): ProposalMoney {
  const base =
    pkg.pricingMode === 'weekly' && pkg.weeklyPrice != null
      ? pkg.weeklyPrice * durationWeeks
      : pkg.basePrice
  let extraSum = 0
  for (const d of pkg.deliverables) {
    if (!d.included && extras[d.id]) {
      extraSum += d.unitPrice * Math.max(d.qty, 1)
    }
  }
  return gstOn(base + extraSum)
}

export function selectedDeliverables(
  pkg: ProposalPackage,
  extras: Record<string, boolean>,
): ProposalDeliverable[] {
  return pkg.deliverables.filter((d) => d.included || extras[d.id])
}

export function termLabel(pkg: ProposalPackage, durationWeeks: number): string {
  if (pkg.category === 'football' && pkg.pricingMode === 'fixed') {
    return '2026 football season'
  }
  const match = DURATION_OPTIONS.find((o) => o.weeks === durationWeeks)
  return match?.label ?? `${durationWeeks} weeks`
}

export interface ProposalDocData {
  number: string
  clientName: string
  company: string
  email?: string
  packageName: string
  tier: string
  term: string
  notes?: string
  validUntil: string
  preparedOn: string
  deliverables: { name: string; detail: string }[]
  money: ProposalMoney
  weeklyPrice?: number
}

export function buildProposalDoc(input: {
  number: string
  clientName: string
  company?: string
  email?: string
  notes?: string
  validUntil?: string
  pkg: ProposalPackage
  durationWeeks: number
  extras: Record<string, boolean>
}): ProposalDocData {
  const money = computePackageValue(input.pkg, input.durationWeeks, input.extras)
  const lines = selectedDeliverables(input.pkg, input.extras).map((d) => ({
    name: d.name,
    detail: d.unitPrice
      ? `${formatAud(d.unitPrice)} ${d.unit} × ${Math.max(d.qty, 1)}`
      : d.unit,
  }))
  return {
    number: input.number,
    clientName: input.clientName,
    company: input.company?.trim() || input.clientName,
    email: input.email,
    packageName: input.pkg.name,
    tier: input.pkg.tier,
    term: termLabel(input.pkg, input.durationWeeks),
    notes: input.notes?.trim() || undefined,
    validUntil: input.validUntil ?? addDaysIso(30),
    preparedOn: new Date().toISOString().split('T')[0],
    deliverables: lines,
    money,
    weeklyPrice: input.pkg.weeklyPrice,
  }
}

export function proposalEmailSubject(data: ProposalDocData): string {
  return `ONE FM 98.5 sponsorship proposal — ${data.company} (${data.number})`
}

export function proposalEmailBody(data: ProposalDocData): string {
  const first = data.clientName.split(' ')[0] || 'there'
  return [
    `Hi ${first},`,
    '',
    `Please find attached a sponsorship proposal from ONE FM 98.5 for ${data.company}.`,
    '',
    `Package: ${data.packageName} (${data.tier})`,
    `Term: ${data.term}`,
    `Investment: ${formatAud(data.money.total)} incl. GST (${formatAud(data.money.exGst)} ex GST)`,
    `Proposal ${data.number} is valid until ${formatAuDate(data.validUntil)}.`,
    '',
    `Audience (sourced): ${stationStats.weeklyListeners.toLocaleString('en-AU')} estimated weekly listeners across ${stationStats.totalTowns} towns within ${stationStats.broadcastRadiusKm}km of Shepparton (ABS 2021 via townData).`,
    '',
    'Happy to walk through it — reply to this email or call (03) 5831 3131.',
    '',
    `${DS.station.sigName}`,
    `${DS.station.sigTitle}`,
    DS.station.phone,
    'admin@fm985.com.au',
  ].join('\n')
}

export function buildMailtoProposalUrl(data: ProposalDocData): string {
  const to = (data.email ?? '').trim()
  const params = new URLSearchParams({
    subject: proposalEmailSubject(data),
    body: proposalEmailBody(data),
  })
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`
}

/** Pure vector A4 PDF — shared navy/gold letterhead. */
export async function generateProposalPdf(data: ProposalDocData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const p = createPdfPen(doc)
  const {
    W, H, M, CW,
    fillNavy, fillLight,
    inkNavy, inkGold, inkWhite, inkGrey, inkDark, inkDim,
    bold, norm, tl, tr,
  } = p
  const [bR, bG, bB] = DS.rgb.blue

  let y = drawLetterhead(p, 'SPONSORSHIP PROPOSAL', data.number)

  norm(7)
  inkDim()
  tl('PREPARED FOR', M, y)
  tl('FROM', W / 2 + 5, y)
  y += 5.5

  bold(11)
  inkNavy()
  tl(data.clientName, M, y)
  tl(DS.station.name, W / 2 + 5, y)
  y += 5

  norm(9.5)
  inkGrey()
  tl(data.company, M, y)
  tl(DS.station.address, W / 2 + 5, y)
  y += 4.5
  if (data.email) {
    norm(8)
    inkGrey()
    tl(data.email, M, y)
  }
  norm(8)
  inkGrey()
  tl(`${DS.station.phone}  ·  admin@fm985.com.au`, W / 2 + 5, y)
  y += 10

  fillLight()
  doc.rect(M, y, CW, 22, 'F')
  doc.setDrawColor(bR, bG, bB)
  doc.setLineWidth(1.5)
  doc.line(M, y, M, y + 22)

  bold(7)
  inkDim()
  tl('STATION SNAPSHOT  ·  sourced, not invented', M + 4, y + 6)
  bold(11)
  inkNavy()
  tl(stationStats.weeklyListeners.toLocaleString('en-AU'), M + 4, y + 13)
  tl(String(stationStats.totalTowns), M + 58, y + 13)
  tl(`${stationStats.broadcastRadiusKm}km`, M + 95, y + 13)
  norm(6.5)
  inkGrey()
  tl('est. weekly listeners', M + 4, y + 18)
  tl('towns', M + 58, y + 18)
  tl('broadcast radius', M + 95, y + 18)
  y += 26
  norm(6.5)
  inkDim()
  tl('Source: ABS 2021 Census via src/data/townData.ts  ·  Goulburn Valley coverage, not national stream totals', M, y)
  y += 8

  const COL3 = CW / 3
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 5
  norm(7)
  inkDim()
  tl('PREPARED', M, y)
  tl('VALID UNTIL', M + COL3, y)
  tl('TERM', M + COL3 * 2, y)
  y += 5.5
  bold(10)
  inkNavy()
  tl(formatAuDate(data.preparedOn), M, y)
  tl(formatAuDate(data.validUntil), M + COL3, y)
  tl(data.term, M + COL3 * 2, y)
  y += 8
  doc.line(M, y, W - M, y)
  y += 8

  bold(12)
  inkNavy()
  tl(data.packageName, M, y)
  y += 5
  norm(9)
  inkGrey()
  tl(`${data.tier}  ·  ${data.term}`, M, y)
  y += 8

  fillNavy()
  doc.rect(M, y, CW, 8, 'F')
  bold(7)
  inkWhite()
  tl('INCLUDED DELIVERABLES', M + 2, y + 5.3)
  y += 8

  const rowH = 8
  data.deliverables.forEach((line, i) => {
    if (y > H - 70) {
      doc.addPage()
      y = M
    }
    if (i % 2 === 0) {
      fillLight()
      doc.rect(M, y, CW, rowH, 'F')
    }
    norm(9)
    inkDark()
    tl(line.name, M + 2, y + 5.2)
    inkGrey()
    tr(line.detail, W - M - 2, y + 5.2)
    y += rowH
  })
  y += 8

  if (data.notes) {
    bold(8)
    inkNavy()
    tl('NOTES', M, y)
    y += 5
    norm(9)
    inkGrey()
    const notes = doc.splitTextToSize(data.notes, CW) as string[]
    notes.forEach((line) => {
      tl(line, M, y)
      y += 4.5
    })
    y += 4
  }

  const TX = M + CW - 78
  if (data.weeklyPrice) {
    norm(9)
    inkGrey()
    tl('Weekly rate (ex GST)', TX, y)
    inkDark()
    tr(formatAud(data.weeklyPrice), W - M, y)
    y += 5
  }
  doc.setDrawColor(220, 220, 220)
  doc.line(TX, y, W - M, y)
  y += 5
  norm(9)
  inkGrey()
  tl('Investment (ex GST)', TX, y)
  inkDark()
  tr(formatAud(data.money.exGst), W - M, y)
  y += 5
  inkGrey()
  tl('GST (10%)', TX, y)
  inkDark()
  tr(formatAud(data.money.gst), W - M, y)
  y += 6
  fillNavy()
  doc.rect(TX - 2, y, CW - (TX - M) + 2, 11, 'F')
  bold(11.5)
  inkWhite()
  tl('TOTAL INCL. GST', TX, y + 7.5)
  inkGold()
  tr(formatAud(data.money.total), W - M, y + 7.5)
  y += 18

  fillLight()
  doc.rect(M, y, CW, 28, 'F')
  doc.setDrawColor(bR, bG, bB)
  doc.setLineWidth(1.5)
  doc.line(M, y, M, y + 28)
  bold(7)
  inkDim()
  tl('NEXT STEPS', M + 4, y + 6)
  norm(8.5)
  inkNavy()
  tl('1. Reply to accept, or nominate changes.', M + 4, y + 12)
  tl('2. We issue a sponsorship contract for signature.', M + 4, y + 17)
  tl('3. First invoice follows the signed term (14-day payment).', M + 4, y + 22)
  y += 34

  norm(8)
  inkGrey()
  tl(`${DS.station.sigName}  ·  ${DS.station.sigTitle}`, M, y)
  y += 4.5
  tl('This is a proposal, not a tax invoice. Figures exclude GST unless marked.', M, y)

  drawFooter(
    p,
    `admin@fm985.com.au  ·  ${DS.station.address}`,
    `${data.number}.pdf  ·  Generated ${formatAuDate(data.preparedOn)}`,
  )

  return doc
}

/**
 * Sponsorship proposal document — PDF + email copy.
 *
 * Stats are sourced via coverageCopy.ts (ABS 2021 via townData). Never invent demographics.
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
  PDF_COVER_FOOTY_JPEG,
  PDF_COVER_FOOTY_PX,
  PDF_COVER_STUDIO_JPEG,
  PDF_COVER_STUDIO_PX,
} from '@/lib/pdfCoverImages'
import {
  formatCoverageShort,
  formatRadius,
  formatTowns,
  townCountValue,
  weeklyListenersValue,
} from '@/lib/coverageCopy'
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
    `Audience (sourced): ${weeklyListenersValue()} estimated weekly listeners across ${formatTowns()} within ${formatRadius()} of Shepparton (ABS 2021 via townData).`,
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

/** Qwilr-style cover + Workday interior. Real station photo. Sourced stats only. */
export async function generateProposalPdf(data: ProposalDocData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const p = createPdfPen(doc)
  const {
    W, H, M, CW,
    fillLight, fillRed,
    inkNavy, inkGrey, inkDark, inkDim,
    bold, norm, tl, tr, box, kicker,
  } = p

  const football =
    /gvl|football|footy/i.test(`${data.packageName} ${data.tier} ${data.term}`)
  const coverImg = football ? PDF_COVER_FOOTY_JPEG : PDF_COVER_STUDIO_JPEG

  drawCover(p, {
    imageDataUrl: coverImg,
    imagePx: football ? PDF_COVER_FOOTY_PX : PDF_COVER_STUDIO_PX,
    kicker: 'Sponsorship proposal',
    title: data.company,
    subtitle: `${data.packageName}  ·  ${data.term}`,
    number: data.number,
    statValue: weeklyListenersValue(),
    statLabel: 'Est. weekly listeners  ·  ABS 2021 via townData',
    statAside: `${formatTowns()}  ·  ${formatRadius()}`,
  })

  doc.addPage()
  let y = drawInteriorHeader(p, 'Sponsorship proposal', data.number, 'The offer')

  kicker('Prepared for', M, y)
  kicker('From', W / 2 + 4, y)
  y += 6
  bold(14)
  inkNavy()
  tl(data.clientName, M, y)
  tl(DS.station.name, W / 2 + 4, y)
  y += 6
  norm(9)
  inkGrey()
  tl(data.company, M, y)
  tl(DS.station.address, W / 2 + 4, y)
  y += 5
  if (data.email) tl(data.email, M, y)
  tl(`${DS.station.phone}  ·  admin@fm985.com.au`, W / 2 + 4, y)
  y += 8

  y = drawStatCards(p, y, [
    { n: weeklyListenersValue(), t: 'Est. weekly listeners' },
    { n: townCountValue(), t: 'Towns in the Valley' },
    { n: formatRadius(), t: 'Broadcast radius' },
  ])
  norm(7)
  inkDim()
  tl('Source: ABS 2021 Census via townData  ·  Goulburn Valley coverage, not national streams', M, y)
  y += 8

  const COL3 = CW / 3
  kicker('Prepared', M, y)
  kicker('Valid until', M + COL3, y)
  kicker('Term', M + COL3 * 2, y)
  y += 6
  bold(11)
  inkNavy()
  tl(formatAuDate(data.preparedOn), M, y)
  tl(formatAuDate(data.validUntil), M + COL3, y)
  tl(data.term, M + COL3 * 2, y)
  y += 8

  bold(24)
  inkNavy()
  tl(data.packageName, M, y)
  y += 7
  norm(10)
  inkGrey()
  tl(`${data.tier} package`, M, y)
  y += 7

  kicker('Included', M, y)
  y += 6
  data.deliverables.forEach((line) => {
    if (y > H - 78) {
      doc.addPage()
      y = drawInteriorHeader(p, 'Sponsorship proposal', data.number, 'The offer')
    }
    fillLight()
    box(M, y, CW, 9)
    fillRed()
    box(M, y, 1.8, 9)
    norm(10)
    inkDark()
    tl(line.name, M + 6, y + 6)
    inkDim()
    tr(line.detail, W - M - 4, y + 6)
    y += 10
  })
  y += 3

  if (data.notes) {
    y = ensureInteriorSpace(p, y, 20, 'Sponsorship proposal', data.number, 'The offer')
    kicker('Notes', M, y)
    y += 5
    norm(9)
    inkGrey()
    const notes = doc.splitTextToSize(data.notes, CW) as string[]
    notes.forEach((line) => {
      tl(line, M, y)
      y += 4.2
    })
    y += 3
  }

  const investLabel = data.weeklyPrice
    ? `Investment  ·  ${formatAud(data.weeklyPrice)} / wk  ·  ${formatAud(data.money.exGst)} ex GST + ${formatAud(data.money.gst)} GST`
    : `Investment  ·  ${formatAud(data.money.exGst)} ex GST + ${formatAud(data.money.gst)} GST`

  y = ensureInteriorSpace(p, y, 78, 'Sponsorship proposal', data.number, 'The offer')
  y = drawAmountBand(p, y, investLabel, formatAud(data.money.total))

  fillLight()
  box(M, y, CW, 26)
  fillRed()
  box(M, y, 1.8, 26)
  kicker('Next steps', M + 6, y + 5)
  norm(9)
  inkNavy()
  tl('1.  Reply to accept, or nominate changes.', M + 6, y + 12)
  tl('2.  We issue a sponsorship agreement for signature.', M + 6, y + 17.5)
  tl('3.  First tax invoice follows the signed term.', M + 6, y + 23)
  y += 32

  norm(8)
  inkDim()
  tl(`${DS.station.sigName}  ·  ${DS.station.sigTitle}  ·  This is a proposal, not a tax invoice.`, M, y)

  const pages = doc.getNumberOfPages()
  for (let i = 2; i <= pages; i++) {
    doc.setPage(i)
    // source: townData / coverageCopy — 25 towns · 100km radius (ABS 2021)
    drawSlimFooter(
      p,
      `Goulburn Valley Community Radio Inc.  ·  ABN ${DS.station.abn}  ·  ${formatCoverageShort()}`,
      String(i),
    )
  }

  return doc
}

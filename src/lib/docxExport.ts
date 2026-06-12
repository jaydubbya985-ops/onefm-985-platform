import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
  PageBreak,
} from 'docx'
import { saveAs } from 'file-saver'

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                              */
/* ────────────────────────────────────────────────────────────────── */

export interface ProposalDocxData {
  customerName: string
  companyName: string
  industry: string
  email: string
  phone: string
  campaignGoal: string
  budget: string
  duration: string
  tierName: string
  tierPrice: number
  sections: { title: string; content: string }[]
  addOns: { name: string; price: number }[]
  total: number
}

export interface MediaKitDocxData {
  rateCard: { type: string; duration: string; peak: number; offPeak: number; availability: string }[]
  audienceStats: { label: string; value: string }[]
  platformReach: { platform: string; stat: string; reach: string }[]
  contactEmail: string
  contactPhone: string
}

/* ────────────────────────────────────────────────────────────────── */
/*  Helpers                                                            */
/* ────────────────────────────────────────────────────────────────── */

function fmtCurrency(n: number): string {
  if (n === 0) return '$0'
  return '$' + n.toLocaleString()
}

function todayStr(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const brandColor = 'D4963A'
const darkColor = '1A1A1F'
const mutedColor = '6B6B75'

const defaultBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
}

/* ────────────────────────────────────────────────────────────────── */
/*  Proposal DOCX Generator                                            */
/* ────────────────────────────────────────────────────────────────── */

export async function generateProposalDocx(data: ProposalDocxData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'ONE FM 98.5', bold: true, size: 22, color: darkColor, font: 'Space Grotesk' }),
                  new TextRun({ text: '    |    ', size: 22, color: mutedColor }),
                  new TextRun({ text: 'PROPOSAL', bold: true, size: 22, color: brandColor, font: 'Space Grotesk' }),
                ],
                alignment: AlignmentType.LEFT,
                spacing: { after: 200 },
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: brandColor, space: 6 },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'ONE FM 98.5 — Community Radio Since 1989', size: 16, color: mutedColor, font: 'JetBrains Mono' }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Generated ${todayStr()}`, size: 16, color: mutedColor, font: 'JetBrains Mono' }),
                  new TextRun({ text: '    |    Page ', size: 16, color: mutedColor }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: mutedColor }),
                  new TextRun({ text: ' of ', size: 16, color: mutedColor }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: mutedColor }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 60 },
              }),
            ],
          }),
        },
        children: [
          // ── Title Block ──
          new Paragraph({
            children: [new TextRun({ text: 'Sponsorship Proposal', bold: true, size: 48, color: darkColor, font: 'Space Grotesk' })],
            spacing: { after: 120 },
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Prepared for: ', size: 22, color: mutedColor }),
              new TextRun({ text: data.companyName || '[Company Name]', bold: true, size: 22, color: darkColor }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Contact: ', size: 22, color: mutedColor }),
              new TextRun({ text: data.customerName || '[Contact Name]', bold: true, size: 22, color: darkColor }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Date: ', size: 22, color: mutedColor }),
              new TextRun({ text: todayStr(), bold: true, size: 22, color: darkColor }),
            ],
            spacing: { after: 400 },
          }),

          // ── Customer Summary ──
          new Paragraph({
            children: [new TextRun({ text: 'Customer Details', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          ...buildInfoRows([
            ['Company', data.companyName],
            ['Industry', data.industry],
            ['Contact Email', data.email],
            ['Contact Phone', data.phone],
            ['Campaign Goal', data.campaignGoal],
            ['Budget Range', data.budget],
            ['Duration', data.duration],
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ── Package Details ──
          new Paragraph({
            children: [new TextRun({ text: 'Proposed Package', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Tier: ', size: 22, color: mutedColor }),
              new TextRun({ text: data.tierName || 'Custom', bold: true, size: 22, color: darkColor }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Base Price: ', size: 22, color: mutedColor }),
              new TextRun({ text: fmtCurrency(data.tierPrice), bold: true, size: 22, color: brandColor }),
            ],
            spacing: { after: 200 },
          }),

          // ── Pricing Table ──
          new Paragraph({
            children: [new TextRun({ text: 'Investment Breakdown', bold: true, size: 24, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 160 },
          }),
          buildPricingTable(data),

          new Paragraph({
            children: [
              new TextRun({ text: 'Total Investment: ', bold: true, size: 26, color: darkColor }),
              new TextRun({ text: fmtCurrency(data.total), bold: true, size: 30, color: brandColor }),
            ],
            spacing: { before: 240, after: 200 },
            alignment: AlignmentType.RIGHT,
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── Content Sections ──
          ...data.sections.flatMap((section, idx) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${String(idx + 1).padStart(2, '0')}. `, bold: true, size: 24, color: brandColor, font: 'Space Grotesk' }),
                new TextRun({ text: section.title, bold: true, size: 26, color: darkColor, font: 'Space Grotesk' }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: idx === 0 ? 200 : 400, after: 160 },
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E5E5E5', space: 4 },
              },
            }),
            ...section.content.split('\n').map((line) =>
              new Paragraph({
                children: [new TextRun({ text: line.trim(), size: 22, color: darkColor })],
                spacing: { after: 100 },
              }),
            ),
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ── Terms & Conditions ──
          new Paragraph({
            children: [new TextRun({ text: 'Terms & Conditions', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          ...buildTermsParagraphs(),
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}

/* ────────────────────────────────────────────────────────────────── */
/*  Media Kit DOCX Generator                                           */
/* ────────────────────────────────────────────────────────────────── */

export async function generateMediaKitDocx(data: MediaKitDocxData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'ONE FM 98.5', bold: true, size: 22, color: darkColor, font: 'Space Grotesk' }),
                  new TextRun({ text: '    |    ', size: 22, color: mutedColor }),
                  new TextRun({ text: 'MEDIA KIT', bold: true, size: 22, color: brandColor, font: 'Space Grotesk' }),
                ],
                alignment: AlignmentType.LEFT,
                spacing: { after: 200 },
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: brandColor, space: 6 },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'ONE FM 98.5 — Community Radio Since 1989', size: 16, color: mutedColor, font: 'JetBrains Mono' }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Generated ${todayStr()}`, size: 16, color: mutedColor, font: 'JetBrains Mono' }),
                  new TextRun({ text: '    |    Page ', size: 16, color: mutedColor }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: mutedColor }),
                  new TextRun({ text: ' of ', size: 16, color: mutedColor }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: mutedColor }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 60 },
              }),
            ],
          }),
        },
        children: [
          // ── Cover ──
          new Paragraph({
            children: [new TextRun({ text: 'ONE FM 98.5', bold: true, size: 56, color: darkColor, font: 'Space Grotesk' })],
            spacing: { before: 600, after: 120 },
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: 'MEDIA KIT & RATE CARD', bold: true, size: 32, color: brandColor, font: 'Space Grotesk' })],
            spacing: { after: 120 },
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Premier Heritage Broadcaster — Community Radio Since 1989', size: 22, color: mutedColor })],
            spacing: { after: 600 },
            alignment: AlignmentType.CENTER,
          }),

          // ── Audience Overview ──
          new Paragraph({
            children: [new TextRun({ text: 'Audience Overview', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          ...data.audienceStats.flatMap((stat) => [
            new Paragraph({
              children: [
                new TextRun({ text: stat.label + ': ', bold: true, size: 22, color: darkColor }),
                new TextRun({ text: stat.value, size: 22, color: mutedColor }),
              ],
              spacing: { after: 80 },
            }),
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ── Platform Reach ──
          new Paragraph({
            children: [new TextRun({ text: 'Platform Reach', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          ...data.platformReach.flatMap((p) => [
            new Paragraph({
              children: [
                new TextRun({ text: p.platform, bold: true, size: 22, color: darkColor }),
              ],
              spacing: { before: 120, after: 40 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Reach: ', size: 20, color: mutedColor }),
                new TextRun({ text: p.stat, bold: true, size: 20, color: brandColor }),
                new TextRun({ text: `  (${p.reach})`, size: 20, color: mutedColor }),
              ],
              spacing: { after: 80 },
            }),
          ]),

          // ── Rate Card Table ──
          new Paragraph({
            children: [new TextRun({ text: 'Advertising Rate Card', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Effective Q2 2025 — All rates in AUD, GST exclusive', size: 20, color: mutedColor, italics: true })],
            spacing: { after: 200 },
          }),
          buildRateCardTable(data.rateCard),

          new Paragraph({
            children: [
              new TextRun({ text: 'Volume discounts available for packages of 10+ spots. Custom packages and annual agreements receive preferential rates.', size: 20, color: mutedColor, italics: true }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── Contact ──
          new Paragraph({
            children: [new TextRun({ text: 'Contact', bold: true, size: 28, color: darkColor, font: 'Space Grotesk' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: brandColor, space: 4 },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Partnerships Team', bold: true, size: 24, color: darkColor }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Email: ', size: 22, color: mutedColor }),
              new TextRun({ text: data.contactEmail, size: 22, color: darkColor }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Phone: ', size: 22, color: mutedColor }),
              new TextRun({ text: data.contactPhone, size: 22, color: darkColor }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Address: ', size: 22, color: mutedColor }),
              new TextRun({ text: '100 Broadcast Plaza, Regional CBD', size: 22, color: darkColor }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Ready to amplify your brand? Our partnerships team is ready to build a campaign that works for you.', size: 22, color: darkColor, italics: true }),
            ],
            spacing: { before: 200, after: 200 },
          }),
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}

/* ────────────────────────────────────────────────────────────────── */
/*  Internal builders                                                    */
/* ────────────────────────────────────────────────────────────────── */

function buildInfoRows(pairs: [string, string][]): Paragraph[] {
  return pairs.map(([label, value]) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 22, color: mutedColor }),
        new TextRun({ text: value || '—', size: 22, color: darkColor }),
      ],
      spacing: { after: 80 },
    }),
  )
}

function buildPricingTable(data: ProposalDocxData): Table {
  const rows: TableRow[] = []

  // Header
  rows.push(
    new TableRow({
      children: [
        makeCell('Service', true),
        makeCell('Description', true),
        makeCell('Qty', true, AlignmentType.CENTER),
        makeCell('Unit Price', true, AlignmentType.RIGHT),
        makeCell('Total', true, AlignmentType.RIGHT),
      ],
      tableHeader: true,
    }),
  )

  // Base package row
  rows.push(
    new TableRow({
      children: [
        makeCell(data.tierName || 'Base Package'),
        makeCell('Annual sponsorship package including on-air spots, social posts, and digital assets'),
        makeCell('1', false, AlignmentType.CENTER),
        makeCell(fmtCurrency(data.tierPrice), false, AlignmentType.RIGHT),
        makeCell(fmtCurrency(data.tierPrice), false, AlignmentType.RIGHT),
      ],
    }),
  )

  // Add-on rows
  data.addOns.forEach((addon) => {
    rows.push(
      new TableRow({
        children: [
          makeCell(addon.name),
          makeCell('Additional service'),
          makeCell('1', false, AlignmentType.CENTER),
          makeCell(fmtCurrency(addon.price), false, AlignmentType.RIGHT),
          makeCell(fmtCurrency(addon.price), false, AlignmentType.RIGHT),
        ],
      }),
    )
  })

  // Total row
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true, size: 22, color: darkColor })], alignment: AlignmentType.RIGHT })],
          columnSpan: 4,
          borders: defaultBorder,
          shading: { fill: 'F9F5EF' },
        }),
        makeCell(fmtCurrency(data.total), true, AlignmentType.RIGHT, 'F9F5EF'),
      ],
    }),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: defaultBorder,
  })
}

function buildRateCardTable(rateCard: MediaKitDocxData['rateCard']): Table {
  const rows: TableRow[] = []

  rows.push(
    new TableRow({
      children: [
        makeCell('Spot Type', true),
        makeCell('Duration', true, AlignmentType.CENTER),
        makeCell('Peak Rate', true, AlignmentType.RIGHT),
        makeCell('Off-Peak', true, AlignmentType.RIGHT),
        makeCell('Availability', true, AlignmentType.CENTER),
      ],
      tableHeader: true,
    }),
  )

  rateCard.forEach((row) => {
    rows.push(
      new TableRow({
        children: [
          makeCell(row.type),
          makeCell(row.duration, false, AlignmentType.CENTER),
          makeCell(fmtCurrency(row.peak), false, AlignmentType.RIGHT),
          makeCell(fmtCurrency(row.offPeak), false, AlignmentType.RIGHT),
          makeCell(row.availability, false, AlignmentType.CENTER),
        ],
      }),
    )
  })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: defaultBorder,
  })
}

function buildTermsParagraphs(): Paragraph[] {
  const terms = [
    'Payment Terms: 50% deposit upon contract signing. Balance due 30 days from campaign start date.',
    'Cancellation Policy: 14 days written notice required for campaign cancellation. Deposits are non-refundable within 7 days of scheduled start.',
    'Content Approval: All creative assets must be submitted for approval 5 business days before the scheduled air date. ONE FM retains the right to refuse content that does not meet broadcast standards or community guidelines.',
    'Rate Validity: All quoted rates are valid for 30 days from the date of this proposal. Rates are subject to change for campaigns booked after this period.',
    'Exclusivity: Category exclusivity is available for Signature and Naming Rights tier partners, subject to availability and additional fees.',
    'Performance Reporting: Weekly performance summaries provided during active campaigns. Full campaign report delivered within 10 business days of campaign conclusion.',
    'Governing Law: This agreement shall be governed by the laws of the jurisdiction in which ONE FM operates.',
  ]

  return terms.map((t) =>
    new Paragraph({
      children: [
        new TextRun({ text: '• ', size: 22, color: brandColor }),
        new TextRun({ text: t, size: 22, color: darkColor }),
      ],
      spacing: { after: 120 },
    }),
  )
}

function makeCell(text: string, bold = false, align: any = AlignmentType.LEFT, bg?: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold, size: 20, color: darkColor })],
        alignment: align,
      }),
    ],
    borders: defaultBorder,
    shading: bg ? { fill: bg } : undefined,
    verticalAlign: 'center',
  })
}

/* ────────────────────────────────────────────────────────────────── */
/*  Convenience export wrapper                                           */
/* ────────────────────────────────────────────────────────────────── */

export async function saveProposalDocx(data: ProposalDocxData, filename?: string): Promise<void> {
  const blob = await generateProposalDocx(data)
  saveAs(blob, filename || `ONE-FM-Proposal-${data.companyName || 'Draft'}.docx`)
}

export async function saveMediaKitDocx(data: MediaKitDocxData, filename?: string): Promise<void> {
  const blob = await generateMediaKitDocx(data)
  saveAs(blob, filename || 'ONE-FM-Media-Kit.docx')
}

/**
 * One-by-one collect ladder. Amounts come from the existing send-guide invoices
 * (src/components/ops/data/invoices.ts). Do not invent new dollars here.
 *
 * Xero is the books. This queue is the respectful send order only.
 */
import { ALL_BATCH_INVOICES } from './invoices'

export type CollectKind = 'document' | 'reissue' | 'send' | 'grant' | 'blocked'

export interface CollectStep {
  rank: number
  id: string
  kind: CollectKind
  title: string
  detail: string
  invoiceNumber?: string
  contactName?: string
  email?: string
  amountIncGst?: number
  /** Human blocker — missing email, confirm not already paid, etc. */
  blocker?: string
}

function billed(number: string) {
  const row = ALL_BATCH_INVOICES.find((invoice) => invoice.number === number)
  if (!row) {
    throw new Error(`collectQueue: ${number} is not in ALL_BATCH_INVOICES`)
  }
  return row
}

function sendStep(
  rank: number,
  number: string,
  detail: string,
  blocker?: string,
): CollectStep {
  const row = billed(number)
  return {
    rank,
    id: number,
    kind: 'send',
    title: row.company,
    detail,
    invoiceNumber: row.number,
    contactName: row.contactName || undefined,
    email: row.email || undefined,
    amountIncGst: row.total,
    blocker: blocker ?? (row.email ? undefined : 'NEED JAY: email address before send'),
  }
}

const gagliardi = billed('ONEFM-2026-013')

/** Respectful order: paper first, then the invoice already in flight, then largest real relationships. */
export const COLLECT_LADDER: CollectStep[] = [
  {
    rank: 0,
    id: 'invoice-paper',
    kind: 'document',
    title: 'World-class tax invoice',
    detail:
      'Official ONE FM logo, legal pay-to (Goulburn Valley Community Radio Inc.), matching preview and PDF.',
  },
  {
    rank: 1,
    id: gagliardi.number,
    kind: 'reissue',
    title: gagliardi.company,
    detail:
      'Already in the send flow. Download the new PDF and email Rocky — do not raise a second invoice.',
    invoiceNumber: gagliardi.number,
    contactName: gagliardi.contactName,
    email: gagliardi.email,
    amountIncGst: gagliardi.total,
  },
  sendStep(2, 'ONEFM-2026-011', 'New partner. This invoice already covers Jun–Nov 2026 — do not re-bill FOOTT.'),
  sendStep(3, 'ONEFM-2026-012', "Personal relationship. Clean-slate 12-month consolidation — confirm Jason has not already paid in Xero."),
  sendStep(4, 'ONEFM-2026-014', '2025 GVL broadcast settlement. Josephine / AFL contact.'),
  sendStep(5, 'ONEFM-2026-015', 'Peppermill GVL Major through June. Confirm Todd has not already paid before send.'),
  sendStep(6, 'ONEFM-2026-016', 'Outstanding balance recovery. Need a working email first.'),
  sendStep(7, 'ONEFM-2026-017', 'Loyal long-term sponsor. Need email before send.'),
  sendStep(8, 'ONEFM-2026-018', 'Previously drafted, never sent. Need email before send.'),
  sendStep(9, 'ONEFM-2026-019', 'Local bakery. Ken / Strathbogie Baking Company email is on file.'),
  sendStep(10, 'ONEFM-2026-020', 'SAM full-year media partnership 2026/27.'),
  sendStep(11, 'ONEFM-2026-021', 'Catch-up through June 2026. Need email before send.'),
  sendStep(12, 'ONEFM-2026-022', 'Historical campaigns. Need email before send.'),
  sendStep(13, 'ONEFM-2026-023', 'Careers Day Out live OB — Hannah / Rye Studio.'),
  sendStep(14, 'ONEFM-2026-024', 'Selected months. Need email before send.'),
  sendStep(15, 'ONEFM-2026-025', 'On Water Festival 2026.'),
  sendStep(16, 'ONEFM-2026-026', 'Confirmed PO. Need email before send.'),
  sendStep(17, 'ONEFM-2026-027', 'Gold Cup OB January 2024. Confirm not already receipted in Xero.'),
  sendStep(18, 'ONEFM-2026-028', 'Reissue of unpaid amount. Need email before send.'),
  sendStep(19, 'ONEFM-2026-029', 'Small balance — still a real dollar. Need email before send.'),
  sendStep(
    20,
    'ONEFM-2026-030',
    'Peppermill Jul–Aug elapsed months. Confirm Todd has not already paid.',
    'Confirm not already receipted in Xero before send',
  ),
  sendStep(
    21,
    'ONEFM-2026-031',
    'Aussie Ag July instalment matching INV-2026-002.',
    'Confirm July not already receipted in Xero',
  ),
  sendStep(
    22,
    'ONEFM-2026-032',
    'Aussie Ag August instalment matching INV-2026-002.',
    'Confirm August not already receipted in Xero',
  ),
  {
    rank: 23,
    id: 'cbf',
    kind: 'grant',
    title: 'CBF grants',
    detail:
      'Open now: Stolen Generations Truth Telling (1 Sep) and Music Hubs (13 Sep). Awarded $ stays Data pending until Jay pastes a letter.',
  },
  {
    rank: 24,
    id: 'vision-australia',
    kind: 'blocked',
    title: 'Vision Australia rental',
    detail: 'Previous Xero invoice is not in this repo. Do not invent ~$7k.',
    blocker: 'NEED JAY: last Xero invoice number, ex GST, GST, and this 6-month period',
  },
]

export function billedCollectTotal(): number {
  return COLLECT_LADDER.reduce((sum, step) => sum + (step.amountIncGst ?? 0), 0)
}

export function nextCollectStep(opts: {
  paperDone: boolean
  sentNumbers: ReadonlySet<string>
  reissuedNumbers?: ReadonlySet<string>
}): CollectStep {
  const reissued = opts.reissuedNumbers ?? new Set<string>()
  return (
    COLLECT_LADDER.find((step) => {
      if (step.kind === 'document') return !opts.paperDone
      if (step.kind === 'reissue') {
        return step.invoiceNumber ? !reissued.has(step.invoiceNumber) : true
      }
      if (step.invoiceNumber) return !opts.sentNumbers.has(step.invoiceNumber)
      return true
    }) ?? COLLECT_LADDER[COLLECT_LADDER.length - 1]
  )
}

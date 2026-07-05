// ---------------------------------------------------------------------------
// Contract Manager domain constants & helpers.
//
// Extracted from the deployed production bundle
// (deployed-reference/assets/OpsPortal-dIeH6Okr.js) — option lists, status
// maps, contract templates and the invoice email template are verbatim.
// ---------------------------------------------------------------------------

import type {
  Contract,
  ContractActivityEntry,
  ContractAttachment,
  ContractDaypart,
  ContractInvoiceStatus,
  ContractStatus,
} from '../data/sponsors'

// ---------------------------------------------------------------------------
// Option lists
// ---------------------------------------------------------------------------

export const PACKAGE_TYPES: { value: string; label: string }[] = [
  { value: 'football_bronze', label: 'Football Bronze' },
  { value: 'football_silver', label: 'Football Silver' },
  { value: 'football_gold', label: 'Football Gold' },
  { value: 'football_platinum', label: 'Football Platinum' },
  { value: 'program_sponsorship', label: 'Program Sponsorship' },
  { value: 'program_premium', label: 'Program Premium' },
  { value: 'event_small', label: 'Event Coverage Small' },
  { value: 'event_large', label: 'Event Coverage Large' },
  { value: 'digital_basic', label: 'Digital Basic' },
  { value: 'digital_premium', label: 'Digital Premium' },
  { value: 'custom', label: 'Custom' },
]

export const BILLING_FREQUENCIES: { value: string; label: string }[] = [
  { value: 'one_time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
]

export const PAYMENT_TERMS: { value: string; label: string }[] = [
  { value: '7_days', label: '7 days' },
  { value: '14_days', label: '14 days' },
  { value: '30_days', label: '30 days' },
  { value: 'eom', label: 'End of Month' },
]

export const SPOT_DURATIONS = ['15s', '30s', '60s'] as const

export const DAYPARTS = ['EM', 'B', 'M', 'L', 'D', 'LN'] as const

/** Workflow statuses selectable in the Contract Manager (deployed order). */
export const CONTRACT_STATUSES: ContractStatus[] = [
  'draft',
  'pending_signature',
  'active',
  'expiring_soon',
  'expired',
  'renewed',
  'cancelled',
]

export const STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Signature',
  pending_signature: 'Pending Signature',
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  renewed: 'Renewed',
  cancelled: 'Cancelled',
}

export const STATUS_BADGE_CLASSES: Record<ContractStatus, string> = {
  draft: 'bg-[#2A2A2A] text-[#5B8DB8] hover:bg-[#2A2A2A]',
  pending: 'bg-[#D4A84B]/20 text-[#D4A84B] hover:bg-[#D4A84B]/20',
  pending_signature: 'bg-[#D4A84B]/20 text-[#D4A84B] hover:bg-[#D4A84B]/20',
  active: 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/40',
  expiring_soon: 'bg-orange-900/40 text-orange-400 hover:bg-orange-900/40',
  expired: 'bg-[#E31E24]/20 text-[#E31E24] hover:bg-[#E31E24]/20',
  renewed: 'bg-[#5B8DB8]/20 text-[#5B8DB8] hover:bg-[#5B8DB8]/20',
  cancelled: 'bg-gray-800 text-gray-400 hover:bg-gray-800',
}

export const INVOICE_STATUS_BADGE_CLASSES: Record<ContractInvoiceStatus, string> = {
  draft: 'bg-[#2A2A2A] text-[#5B8DB8]',
  sent: 'bg-[#D4A84B]/20 text-[#D4A84B]',
  paid: 'bg-emerald-900/40 text-emerald-400',
  overdue: 'bg-[#E31E24]/20 text-[#E31E24]',
  cancelled: 'bg-gray-800 text-gray-400',
}

// ---------------------------------------------------------------------------
// Contract templates
// ---------------------------------------------------------------------------

export interface ContractTemplate {
  id: string
  name: string
  description: string
  packageType: string
  campaignName: string
  descriptionText: string
  defaultValue: number
  defaultFrequency: string
  defaultPeriods: number
  defaultDuration: string
  dayparts: ContractDaypart[]
  broadcastText: string
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl_football_season',
    name: 'Football Season Sponsor',
    description: 'Standard football season sponsorship package',
    packageType: 'football_gold',
    campaignName: 'GVL 2026 SEASON',
    descriptionText:
      'Full season football sponsorship including match-day announcements, digital signage, social media mentions, website logo placement, and premium on-air spots throughout the football season. Includes 4 x 30-second spots across all dayparts (EM, B, M, L, D, LN) for the duration of the season.',
    defaultValue: 15000,
    defaultFrequency: 'monthly',
    defaultPeriods: 6,
    defaultDuration: '30s',
    dayparts: [
      { daypart: 'EM', count: 4 },
      { daypart: 'B', count: 4 },
      { daypart: 'M', count: 4 },
      { daypart: 'L', count: 4 },
      { daypart: 'D', count: 4 },
      { daypart: 'LN', count: 4 },
    ],
    broadcastText: '4 x 30 sec spots across all dayparts (EM, B, M, L, D, LN) for football season duration',
  },
  {
    id: 'tpl_program_rights',
    name: 'Program Naming Rights',
    description: 'Exclusive program naming rights sponsorship',
    packageType: 'program_premium',
    campaignName: 'PROGRAM NAMING RIGHTS 2026',
    descriptionText:
      'Exclusive naming rights to a ONE FM program. Includes program intro/outro mentions, presenter acknowledgements, dedicated webpage section, social media promotion, and branded content opportunities.',
    defaultValue: 8000,
    defaultFrequency: 'annually',
    defaultPeriods: 1,
    defaultDuration: '30s',
    dayparts: [
      { daypart: 'M', count: 6 },
      { daypart: 'L', count: 6 },
    ],
    broadcastText: '6 x 30 sec spots in relevant program dayparts with live read mentions',
  },
  {
    id: 'tpl_event_coverage',
    name: 'Event Coverage',
    description: 'Live event coverage and promotion package',
    packageType: 'event_large',
    campaignName: 'EVENT COVERAGE 2026',
    descriptionText:
      'Comprehensive event coverage including pre-event promotion, live broadcast from event, post-event highlights, social media coverage, and website feature. Includes live cross interviews and dedicated event announcements.',
    defaultValue: 3000,
    defaultFrequency: 'one_time',
    defaultPeriods: 1,
    defaultDuration: '60s',
    dayparts: [
      { daypart: 'EM', count: 2 },
      { daypart: 'B', count: 2 },
      { daypart: 'M', count: 4 },
      { daypart: 'L', count: 4 },
      { daypart: 'D', count: 2 },
    ],
    broadcastText: 'Pre-event, live event, and post-event coverage with 60-sec live reads and interviews',
  },
  {
    id: 'tpl_digital_package',
    name: 'Digital Package',
    description: 'Digital and social media focused sponsorship',
    packageType: 'digital_premium',
    campaignName: 'DIGITAL PREMIUM 2026',
    descriptionText:
      'Digital-first sponsorship package including website banner placement, social media posts/stories, EDM newsletter features, podcast pre-roll, and digital event promotion.',
    defaultValue: 3500,
    defaultFrequency: 'annually',
    defaultPeriods: 1,
    defaultDuration: '15s',
    dayparts: [
      { daypart: 'M', count: 2 },
      { daypart: 'L', count: 2 },
    ],
    broadcastText: 'Digital-first with supporting 2 x 15 sec on-air spots in M and L dayparts',
  },
]

// ---------------------------------------------------------------------------
// Formatting & calculation helpers
// ---------------------------------------------------------------------------

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(iso: string): string {
  return iso
    ? new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
}

export function durationDays(start: string, end: string): number {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function daysUntil(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = new Date(date).getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function gstOf(value: number): number {
  return Math.round(value * 0.1 * 100) / 100
}

export function totalIncGstOf(value: number): number {
  return Math.round(value * 1.1 * 100) / 100
}

export function packageTypeLabel(value: string): string {
  return PACKAGE_TYPES.find((p) => p.value === value)?.label || value
}

export function billingFrequencyLabel(value: string): string {
  return BILLING_FREQUENCIES.find((f) => f.value === value)?.label || value
}

export function paymentTermsLabel(value: string): string {
  return PAYMENT_TERMS.find((t) => t.value === value)?.label || value
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Next contract number. The deployed app used a `CON-2026-XXX` series; the
 * local store seeds `ONEFM-C-2026-XXX`, so we follow the store convention and
 * parse the trailing sequence segment.
 */
export function nextContractNumber(contracts: Contract[]): string {
  const numbers = contracts
    .map((c) => parseInt(c.contractNumber.split('-').pop() ?? '', 10))
    .filter((n) => !isNaN(n))
  const max = numbers.length > 0 ? Math.max(...numbers) : 0
  return `ONEFM-C-2026-${String(max + 1).padStart(3, '0')}`
}

/** Invoice email body used for contract-generated invoices (deployed template). */
export function buildInvoiceEmailBody(companyName: string, contactName?: string): string {
  return `Dear ${contactName || 'valued partner'},

Thank you for ${companyName}'s continued support of ONE FM 98.5. Your partnership helps keep community radio alive in the Goulburn Valley.

Please find your invoice attached. If you have any questions, don't hesitate to reach out.

Warm regards,
Jason Welsh
Station Manager, ONE FM 98.5`
}

// ---------------------------------------------------------------------------
// Form state & contract normalisation
// ---------------------------------------------------------------------------

export interface ContractFormState {
  companyName: string
  abn: string
  industry: string
  website: string
  primaryContact: string
  position: string
  email: string
  phone: string
  secondaryContact: string
  secondaryEmail: string
  secondaryPhone: string
  streetAddress: string
  suburb: string
  state: string
  postcode: string
  campaignName: string
  packageType: string
  description: string
  contractValue: number
  billingFrequency: string
  numberOfPeriods: number
  paymentTerms: string
  startDate: string
  endDate: string
  broadcastSchedule: string
  dayparts: ContractDaypart[]
  spotDuration: string
  status: ContractStatus
  signedDate: string
  signedBy: string
  ourSignatory: string
  internalNotes: string
  renewalReminderDate: string
}

export function emptyContractForm(): ContractFormState {
  return {
    companyName: '',
    abn: '',
    industry: '',
    website: '',
    primaryContact: '',
    position: '',
    email: '',
    phone: '',
    secondaryContact: '',
    secondaryEmail: '',
    secondaryPhone: '',
    streetAddress: '',
    suburb: '',
    state: 'VIC',
    postcode: '',
    campaignName: '',
    packageType: '',
    description: '',
    contractValue: 0,
    billingFrequency: '',
    numberOfPeriods: 1,
    paymentTerms: '14_days',
    startDate: '',
    endDate: '',
    broadcastSchedule: '',
    dayparts: [],
    spotDuration: '30s',
    status: 'draft',
    signedDate: '',
    signedBy: '',
    ourSignatory: 'Jason Welsh, Station Manager',
    internalNotes: '',
    renewalReminderDate: '',
  }
}

/** Contract with every rich field resolved to a concrete value for rendering. */
export type RichContract = Contract &
  Required<
    Pick<
      Contract,
      | 'abn'
      | 'industry'
      | 'website'
      | 'position'
      | 'phone'
      | 'secondaryContact'
      | 'secondaryEmail'
      | 'secondaryPhone'
      | 'streetAddress'
      | 'suburb'
      | 'state'
      | 'postcode'
      | 'packageType'
      | 'gst'
      | 'totalValue'
      | 'billingFrequency'
      | 'numberOfPeriods'
      | 'amountPerInvoice'
      | 'paymentTerms'
      | 'broadcastSchedule'
      | 'dayparts'
      | 'spotDuration'
      | 'signedDate'
      | 'signedBy'
      | 'ourSignatory'
      | 'internalNotes'
      | 'renewalReminderDate'
      | 'attachments'
      | 'activityLog'
      | 'createdAt'
      | 'updatedAt'
    >
  >

/**
 * Fill rich-field defaults so store-seeded contracts (and contracts created
 * from accepted proposals, which only carry the core fields) render through
 * the full deployed UI. Deterministic — safe to call from render memos.
 */
export function normalizeContract(contract: Contract): RichContract {
  const gst = contract.gst ?? gstOf(contract.contractValue)
  const totalValue = contract.totalValue ?? totalIncGstOf(contract.contractValue)
  const numberOfPeriods = contract.numberOfPeriods ?? 1
  const amountPerInvoice =
    contract.amountPerInvoice ??
    (numberOfPeriods > 0 ? Math.round((totalValue / numberOfPeriods) * 100) / 100 : totalValue)
  const activityLog: ContractActivityEntry[] =
    contract.activityLog ??
    [
      {
        id: `act-${contract.id}-created`,
        action: 'Contract created',
        performedBy: 'Station Manager',
        timestamp: contract.createdAt ?? `${contract.startDate}T09:00:00.000Z`,
        notes: `Contract ${contract.contractNumber} created`,
      },
    ]
  const attachments: ContractAttachment[] = contract.attachments ?? []

  return {
    ...contract,
    status: contract.status === 'pending' ? 'pending_signature' : contract.status,
    abn: contract.abn ?? '',
    industry: contract.industry ?? 'Other',
    website: contract.website ?? '',
    position: contract.position ?? '',
    phone: contract.phone ?? '',
    secondaryContact: contract.secondaryContact ?? '',
    secondaryEmail: contract.secondaryEmail ?? '',
    secondaryPhone: contract.secondaryPhone ?? '',
    streetAddress: contract.streetAddress ?? '',
    suburb: contract.suburb ?? '',
    state: contract.state ?? 'VIC',
    postcode: contract.postcode ?? '',
    packageType: contract.packageType ?? 'custom',
    gst,
    totalValue,
    billingFrequency: contract.billingFrequency ?? 'one_time',
    numberOfPeriods,
    amountPerInvoice,
    paymentTerms: contract.paymentTerms ?? '14_days',
    broadcastSchedule: contract.broadcastSchedule ?? '',
    dayparts: contract.dayparts ?? [],
    spotDuration: contract.spotDuration ?? '30s',
    signedDate: contract.signedDate ?? '',
    signedBy: contract.signedBy ?? '',
    ourSignatory: contract.ourSignatory ?? 'Jason Welsh, Station Manager',
    internalNotes: contract.internalNotes ?? '',
    renewalReminderDate: contract.renewalReminderDate ?? '',
    attachments,
    activityLog,
    createdAt: contract.createdAt ?? `${contract.startDate}T09:00:00.000Z`,
    updatedAt: contract.updatedAt ?? `${contract.startDate}T09:00:00.000Z`,
  }
}

export function contractToForm(contract: RichContract): ContractFormState {
  return {
    companyName: contract.companyName,
    abn: contract.abn,
    industry: contract.industry,
    website: contract.website,
    primaryContact: contract.primaryContact,
    position: contract.position,
    email: contract.email,
    phone: contract.phone,
    secondaryContact: contract.secondaryContact,
    secondaryEmail: contract.secondaryEmail,
    secondaryPhone: contract.secondaryPhone,
    streetAddress: contract.streetAddress,
    suburb: contract.suburb,
    state: contract.state,
    postcode: contract.postcode,
    campaignName: contract.campaignName,
    packageType: contract.packageType,
    description: contract.description,
    contractValue: contract.contractValue,
    billingFrequency: contract.billingFrequency,
    numberOfPeriods: contract.numberOfPeriods,
    paymentTerms: contract.paymentTerms,
    startDate: contract.startDate,
    endDate: contract.endDate,
    broadcastSchedule: contract.broadcastSchedule,
    dayparts: contract.dayparts.map((d) => ({ ...d })),
    spotDuration: contract.spotDuration,
    status: contract.status,
    signedDate: contract.signedDate,
    signedBy: contract.signedBy,
    ourSignatory: contract.ourSignatory,
    internalNotes: contract.internalNotes,
    renewalReminderDate: contract.renewalReminderDate,
  }
}

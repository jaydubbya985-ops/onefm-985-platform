// DEMO DATA — mock sponsor/package rows for the ops portal. Labelled DEMO, not live CRM.
// ---------------------------------------------------------------------------
// Sponsor & contract domain data for the Operations Portal.
//
// All mock records, option lists and label maps in this file were extracted
// verbatim from the deployed production bundle
// (deployed-reference/assets/OpsPortal-dIeH6Okr.js) so the local app matches
// the deployed Kimi build at full fidelity.
// ---------------------------------------------------------------------------

import { generalTiers, rateCard } from '@/data/pricing'

// ---------------------------------------------------------------------------
// Proposal packages (used by ProposalBuilder)
// ---------------------------------------------------------------------------

export interface ProposalDeliverable {
  id: string
  name: string
  unitPrice: number
  unit: string
  included: boolean
  qty: number
}

export interface ProposalPackage {
  id: string
  name: string
  category: string
  tier: string
  /** Season / program lump sum (ex GST). For weekly packages this is 52-week list. */
  basePrice: number
  /** When set, price = weeklyPrice × term weeks (source: src/data/pricing.ts). */
  weeklyPrice?: number
  pricingMode: 'weekly' | 'fixed'
  description: string
  deliverables: ProposalDeliverable[]
}

// Social inventory is Facebook (facebook.com/onefmshepparton) only.
// Instagram, TikTok, and podcast pre-roll are not sold.
function partnershipDeliverables(spots: number, socialPosts: number): ProposalDeliverable[] {
  return [
    {
      id: 'spots',
      name: `${spots} × 30-sec on-air spots / week`,
      unitPrice: rateCard.standardSpot30s,
      unit: 'per week',
      included: true,
      qty: spots,
    },
    {
      id: 'social',
      name: `${socialPosts} Facebook posts / week`,
      unitPrice: rateCard.socialPost,
      unit: 'per week',
      included: true,
      qty: socialPosts,
    },
    {
      id: 'web',
      name: 'Website listing',
      unitPrice: rateCard.websiteBanner,
      unit: 'per month',
      included: false,
      qty: 1,
    },
    {
      id: 'live',
      name: 'Live read by presenter',
      unitPrice: rateCard.liveRead,
      unit: 'each',
      included: false,
      qty: 1,
    },
  ]
}

export const PROPOSAL_PACKAGES: ProposalPackage[] = [
  {
    id: 'partner-community',
    name: generalTiers.communityPartner.name,
    category: 'partnership',
    tier: 'Community',
    weeklyPrice: generalTiers.communityPartner.weeklyPrice,
    basePrice: generalTiers.communityPartner.weeklyPrice * 52,
    pricingMode: 'weekly',
    description: `${generalTiers.communityPartner.spots} spots/week + ${generalTiers.communityPartner.socialPosts} Facebook posts. Rate: src/data/pricing.ts`,
    deliverables: partnershipDeliverables(
      generalTiers.communityPartner.spots,
      generalTiers.communityPartner.socialPosts,
    ),
  },
  {
    id: 'partner-champion',
    name: generalTiers.championPartner.name,
    category: 'partnership',
    tier: 'Champion',
    weeklyPrice: generalTiers.championPartner.weeklyPrice,
    basePrice: generalTiers.championPartner.weeklyPrice * 52,
    pricingMode: 'weekly',
    description: `${generalTiers.championPartner.spots} spots/week + ${generalTiers.championPartner.socialPosts} Facebook posts. Rate: src/data/pricing.ts`,
    deliverables: partnershipDeliverables(
      generalTiers.championPartner.spots,
      generalTiers.championPartner.socialPosts,
    ),
  },
  {
    id: 'partner-premier',
    name: generalTiers.premierPartner.name,
    category: 'partnership',
    tier: 'Premier',
    weeklyPrice: generalTiers.premierPartner.weeklyPrice,
    basePrice: generalTiers.premierPartner.weeklyPrice * 52,
    pricingMode: 'weekly',
    description: `${generalTiers.premierPartner.spots} spots/week + ${generalTiers.premierPartner.socialPosts} Facebook posts. Rate: src/data/pricing.ts`,
    deliverables: partnershipDeliverables(
      generalTiers.premierPartner.spots,
      generalTiers.premierPartner.socialPosts,
    ),
  },
  {
    id: 'partner-signature',
    name: generalTiers.signaturePartner.name,
    category: 'partnership',
    tier: 'Signature',
    weeklyPrice: generalTiers.signaturePartner.weeklyPrice,
    basePrice: generalTiers.signaturePartner.weeklyPrice * 52,
    pricingMode: 'weekly',
    description: `${generalTiers.signaturePartner.spots} spots/week + ${generalTiers.signaturePartner.socialPosts} Facebook posts, category exclusivity. Rate: src/data/pricing.ts`,
    deliverables: [
      ...partnershipDeliverables(
        generalTiers.signaturePartner.spots,
        generalTiers.signaturePartner.socialPosts,
      ),
      {
        id: 'excl',
        name: 'Category exclusivity',
        unitPrice: 0,
        unit: 'included',
        included: true,
        qty: 1,
      },
    ],
  },
  {
    id: 'fb-bronze',
    name: 'Football Bronze',
    category: 'football',
    tier: 'Bronze',
    basePrice: 5000,
    pricingMode: 'fixed',
    description: 'Match mentions and Facebook',
    deliverables: [
      { id: 'd1', name: 'Match Day Mentions', unitPrice: 800, unit: 'per match', included: true, qty: 2 },
      { id: 'd2', name: 'Facebook post', unitPrice: 300, unit: 'per post', included: true, qty: 1 },
      { id: 'd3', name: 'Website Listing', unitPrice: 200, unit: 'per month', included: true, qty: 6 },
      { id: 'd4', name: '30-sec Spot', unitPrice: 150, unit: 'per spot', included: false, qty: 0 },
    ],
  },
  {
    id: 'fb-silver',
    name: 'Football Silver',
    category: 'football',
    tier: 'Silver',
    basePrice: 10000,
    pricingMode: 'fixed',
    description: 'Enhanced match coverage',
    deliverables: [
      { id: 'd1', name: 'Match Day Mentions', unitPrice: 800, unit: 'per match', included: true, qty: 4 },
      { id: 'd2', name: 'Facebook posts', unitPrice: 300, unit: 'per post', included: true, qty: 2 },
      { id: 'd3', name: 'Player Interview', unitPrice: 500, unit: 'per interview', included: true, qty: 1 },
      { id: 'd4', name: 'Website Feature', unitPrice: 400, unit: 'per month', included: true, qty: 6 },
      { id: 'd5', name: '30-sec Spot', unitPrice: 150, unit: 'per spot', included: true, qty: 4 },
    ],
  },
  {
    id: 'fb-gold',
    name: 'Football Gold',
    category: 'football',
    tier: 'Gold',
    basePrice: 18000,
    pricingMode: 'fixed',
    description: 'Premium match day presence',
    deliverables: [
      { id: 'd1', name: 'Match Day Mentions', unitPrice: 800, unit: 'per match', included: true, qty: 8 },
      { id: 'd2', name: 'Naming Rights (1 match)', unitPrice: 2000, unit: 'per match', included: true, qty: 1 },
      { id: 'd3', name: 'Live Cross', unitPrice: 600, unit: 'per cross', included: true, qty: 2 },
    ],
  },
  {
    id: 'prog-sponsor',
    name: 'Program Sponsorship',
    category: 'program',
    tier: 'Standard',
    basePrice: 6000,
    pricingMode: 'fixed',
    description: 'Sponsor a weekly program segment',
    deliverables: [
      { id: 'd1', name: 'Opening Mention', unitPrice: 200, unit: 'per episode', included: true, qty: 52 },
      { id: 'd2', name: 'Closing Tag', unitPrice: 150, unit: 'per episode', included: true, qty: 52 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

/**
 * Full status workflow from the deployed Contract Manager, plus the legacy
 * 'pending' status that the ops store assigns to contracts created from
 * accepted proposals.
 */
export type ContractStatus =
  | 'draft'
  | 'pending'
  | 'pending_signature'
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'renewed'
  | 'cancelled'

export type ContractInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface ContractInvoiceEntry {
  invoiceNumber: string
  amount: number
  dueDate: string
  date: string
  periodLabel: string
  status?: ContractInvoiceStatus
}

export interface ContractDaypart {
  daypart: string
  count: number
}

export interface ContractActivityEntry {
  id: string
  action: string
  performedBy: string
  timestamp: string
  notes?: string
}

export interface ContractAttachment {
  id: string
  fileName: string
  fileSize: string
}

/**
 * Contract record. The required core is what the ops store creates from an
 * accepted proposal; everything else is the rich detail the deployed
 * Contract Manager captures and is therefore optional.
 */
export interface Contract {
  id: string
  contractNumber: string
  companyName: string
  primaryContact: string
  email: string
  campaignName: string
  description: string
  contractValue: number
  startDate: string
  endDate: string
  status: ContractStatus
  tier: string
  invoices: ContractInvoiceEntry[]
  // --- Rich contract detail (deployed Contract Manager fields) ---
  abn?: string
  industry?: string
  website?: string
  position?: string
  phone?: string
  secondaryContact?: string
  secondaryEmail?: string
  secondaryPhone?: string
  streetAddress?: string
  suburb?: string
  state?: string
  postcode?: string
  packageType?: string
  /** GST component (10% of contractValue) */
  gst?: number
  /** contractValue + GST */
  totalValue?: number
  billingFrequency?: string
  numberOfPeriods?: number
  amountPerInvoice?: number
  paymentTerms?: string
  broadcastSchedule?: string
  dayparts?: ContractDaypart[]
  spotDuration?: string
  signedDate?: string
  signedBy?: string
  ourSignatory?: string
  internalNotes?: string
  renewalReminderDate?: string
  attachments?: ContractAttachment[]
  activityLog?: ContractActivityEntry[]
  parentContractId?: string
  createdAt?: string
  updatedAt?: string
}

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    contractNumber: 'ONEFM-C-2026-001',
    companyName: 'FOOTT Waste Solutions',
    primaryContact: 'Peter Foott',
    email: 'peter@foott.com.au',
    campaignName: 'Community Partnership 2026',
    description:
      '6-month community partnership package — match-day announcements, digital signage, Facebook mentions, website logo placement and premium on-air spots.',
    contractValue: 30000,
    startDate: '2026-06-01',
    endDate: '2026-11-30',
    status: 'active',
    tier: 'Champion',
    industry: 'Construction',
    phone: '03 5821 4500',
    streetAddress: '12 Drummond Road',
    suburb: 'Shepparton',
    state: 'VIC',
    postcode: '3630',
    packageType: 'custom',
    gst: 3000,
    totalValue: 33000,
    billingFrequency: 'monthly',
    numberOfPeriods: 6,
    amountPerInvoice: 5500,
    paymentTerms: '14_days',
    broadcastSchedule: '4 x 30 sec spots across all dayparts (EM, B, M, L, D, LN) for campaign duration',
    dayparts: [
      { daypart: 'EM', count: 4 },
      { daypart: 'B', count: 4 },
      { daypart: 'M', count: 4 },
      { daypart: 'L', count: 4 },
      { daypart: 'D', count: 4 },
      { daypart: 'LN', count: 4 },
    ],
    spotDuration: '30s',
    signedDate: '2026-05-28',
    signedBy: 'Peter Foott, Director',
    ourSignatory: 'Jason Welsh, Station Manager',
    internalNotes: 'New major community partner Jun 2026. First invoice issued with the June batch.',
    activityLog: [
      {
        id: 'act-c1-1',
        action: 'Contract created',
        performedBy: 'Station Manager',
        timestamp: '2026-05-28T09:00:00.000Z',
        notes: 'Contract ONEFM-C-2026-001 created',
      },
      {
        id: 'act-c1-2',
        action: 'Generated invoice ONEFM-2026-011',
        performedBy: 'Station Manager',
        timestamp: '2026-06-09T09:00:00.000Z',
        notes: 'Invoice 1 of 6 — saved to shared invoice store',
      },
    ],
    createdAt: '2026-05-28T09:00:00.000Z',
    updatedAt: '2026-06-09T09:00:00.000Z',
    invoices: [
      {
        invoiceNumber: 'ONEFM-2026-011',
        amount: 5500,
        dueDate: '2026-06-23',
        date: '2026-06-09',
        periodLabel: 'Jun 2026',
        status: 'sent',
      },
    ],
  },
  {
    id: 'c2',
    contractNumber: 'ONEFM-C-2025-014',
    companyName: 'Peppermill Inn',
    primaryContact: 'Todd Van Kerkhof',
    email: 'manager@peppermillinn.com.au',
    campaignName: 'GVL 2026 Major Sponsorship',
    description:
      'Major GVL football sponsorship — 4 x 30sec spots across all dayparts, player of the match awards, digital signage and Facebook mentions.',
    contractValue: 18000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    tier: 'Gold',
    industry: 'Hospitality',
    phone: '(03) 5823 1800',
    website: 'peppermillinn.com.au',
    streetAddress: '7900 Goulburn Valley Hwy',
    suburb: 'Shepparton',
    state: 'VIC',
    postcode: '3630',
    packageType: 'football_gold',
    gst: 1800,
    totalValue: 19800,
    billingFrequency: 'quarterly',
    numberOfPeriods: 4,
    amountPerInvoice: 4950,
    paymentTerms: '30_days',
    broadcastSchedule: '4 x 30 sec spots across all dayparts (EM, B, M, L, D, LN) for football season duration',
    dayparts: [
      { daypart: 'EM', count: 4 },
      { daypart: 'B', count: 4 },
      { daypart: 'M', count: 4 },
      { daypart: 'L', count: 4 },
      { daypart: 'D', count: 4 },
      { daypart: 'LN', count: 4 },
    ],
    spotDuration: '30s',
    signedDate: '2025-12-18',
    signedBy: 'Todd Van Kerkhof, Manager',
    ourSignatory: 'Jason Welsh, Station Manager',
    internalNotes: 'Todd happy with GVL coverage. Wants to renew for 2027.',
    activityLog: [
      {
        id: 'act-c2-1',
        action: 'Contract created',
        performedBy: 'Station Manager',
        timestamp: '2025-12-18T09:00:00.000Z',
        notes: 'Contract ONEFM-C-2025-014 created',
      },
      {
        id: 'act-c2-2',
        action: 'Generated invoice INV-2026-001',
        performedBy: 'Station Manager',
        timestamp: '2026-01-01T09:00:00.000Z',
        notes: 'Invoice 1 of 4 — saved to shared invoice store',
      },
    ],
    createdAt: '2025-12-18T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
    invoices: [
      {
        invoiceNumber: 'INV-2026-001',
        amount: 1240,
        dueDate: '2026-01-31',
        date: '2026-01-01',
        periodLabel: 'Q1 2026',
        status: 'paid',
      },
    ],
  },
  {
    id: 'c3',
    contractNumber: 'ONEFM-C-2025-008',
    companyName: "Jason's TV Pty Ltd",
    primaryContact: 'Jason Aspland',
    email: 'jasonstv1@bigpond.com',
    campaignName: 'LT Image Clean Slate',
    description: '12 month sponsorship consolidation — LT image spots and community announcements.',
    contractValue: 8580,
    startDate: '2025-06-01',
    endDate: '2026-06-30',
    status: 'expiring_soon',
    tier: 'Silver',
    industry: 'Retail',
    phone: '03 5831 3131',
    suburb: 'Shepparton',
    state: 'VIC',
    postcode: '3630',
    packageType: 'custom',
    gst: 858,
    totalValue: 9438,
    billingFrequency: 'monthly',
    numberOfPeriods: 12,
    amountPerInvoice: 786.5,
    paymentTerms: '14_days',
    broadcastSchedule: 'LT Image spots with community announcement rotation',
    dayparts: [
      { daypart: 'M', count: 2 },
      { daypart: 'L', count: 2 },
    ],
    spotDuration: '30s',
    signedDate: '2025-05-20',
    signedBy: 'Jason Aspland, Owner',
    ourSignatory: 'Jason Welsh, Station Manager',
    internalNotes: 'LT Image clean slate sponsorship. Renewal conversation needed before 30 June.',
    activityLog: [
      {
        id: 'act-c3-1',
        action: 'Contract created',
        performedBy: 'Station Manager',
        timestamp: '2025-05-20T09:00:00.000Z',
        notes: 'Contract ONEFM-C-2025-008 created',
      },
    ],
    createdAt: '2025-05-20T09:00:00.000Z',
    updatedAt: '2025-05-20T09:00:00.000Z',
    invoices: [],
  },
]

// ---------------------------------------------------------------------------
// Industries & states
// ---------------------------------------------------------------------------

/** Industry list used by the Contract Manager (19 entries, deployed order). */
export const INDUSTRIES = [
  'Hospitality',
  'Automotive',
  'Retail',
  'Health',
  'Fitness',
  'Real Estate',
  'Construction',
  'Food & Beverage',
  'Professional Services',
  'Community',
  'Government',
  'Agriculture',
  'Education',
  'Sports',
  'Media',
  'Club',
  'Funeral Services',
  'Arts & Culture',
  'Other',
] as const

/** Industry list used by the Sponsor CRM add/edit form (deployed order). */
export const CRM_INDUSTRIES = [
  'Automotive',
  'Entertainment',
  'Hospitality',
  'Media',
  'Real Estate',
  'Sport',
  'Community',
  'Health',
  'Education',
  'Retail',
  'Other',
] as const

/** Australian states in Contract Manager order. */
export const CONTRACT_STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

/** Australian states in Sponsor CRM order. */
export const AU_STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const

// ---------------------------------------------------------------------------
// Sponsor CRM
// ---------------------------------------------------------------------------

export type SponsorPipelineStatus =
  | 'lead'
  | 'contacted'
  | 'proposal_sent'
  | 'negotiating'
  | 'contracted'
  | 'active'
  | 'lapsed'

export type SponsorTier = 'champion' | 'gold' | 'silver' | 'bronze' | 'custom' | 'none'

export type SponsorProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'

export type SponsorNoteType = 'call' | 'email' | 'meeting' | 'note'

export interface SponsorProposal {
  id: string
  title: string
  value: number
  status: SponsorProposalStatus
  sentDate?: string
  acceptedDate?: string
  sections: string[]
}

export interface SponsorNote {
  id: string
  date: string
  author: string
  content: string
  type: SponsorNoteType
}

export interface CrmSponsor {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  industry: string
  address?: string
  website?: string
  abn?: string
  tier: SponsorTier
  status: SponsorPipelineStatus
  annualValue: number
  startDate?: string
  endDate?: string
  proposals: SponsorProposal[]
  notes: SponsorNote[]
}

export const PIPELINE_STAGES: { key: SponsorPipelineStatus; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'proposal_sent', label: 'Proposal Sent' },
  { key: 'negotiating', label: 'Negotiating' },
  { key: 'contracted', label: 'Contracted' },
  { key: 'active', label: 'Active' },
]

export const SPONSOR_STATUS_OPTIONS: { label: string; value: SponsorPipelineStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Prospect', value: 'lead' },
  { label: 'Inactive', value: 'lapsed' },
]

export const CRM_SPONSORS: CrmSponsor[] = [
  {
    id: 's1',
    companyName: 'Peppermill Inn',
    contactName: 'Todd Van Kerkhof',
    email: 'manager@peppermillinn.com.au',
    phone: '(03) 5823 1800',
    industry: 'Hospitality',
    address: '7900 Goulburn Valley Hwy, Shepparton VIC 3630',
    website: 'peppermillinn.com.au',
    tier: 'gold',
    status: 'active',
    annualValue: 7436,
    startDate: '2026-03-31',
    endDate: '2026-09-30',
    proposals: [
      {
        id: 'p1',
        title: 'GVL 2026 MAJOR',
        value: 7436,
        status: 'accepted',
        sentDate: '2026-02-15',
        acceptedDate: '2026-02-20',
        sections: [
          '4 x 30sec spots across all dayparts',
          'Player of the match awards',
          'Digital signage',
          'Social media mentions',
        ],
      },
    ],
    notes: [
      {
        id: 'n1',
        date: '2026-04-10',
        author: 'Station Mgr',
        content: 'Todd happy with GVL coverage. Wants to renew for 2027.',
        type: 'call',
      },
      {
        id: 'n2',
        date: '2026-03-20',
        author: 'Station Mgr',
        content: 'Contract signed and returned. First invoice sent.',
        type: 'email',
      },
    ],
  },
  {
    id: 's2',
    companyName: 'Aussie Ag Supplies Pty Ltd',
    contactName: 'Daryl Gorman',
    email: 'info@aussieagsupplies.com',
    phone: '0428 235 000',
    industry: 'Agriculture',
    address: '75 Gordon Drive, Kialla VIC 3631',
    website: 'aussieagsupplies.com',
    tier: 'gold',
    status: 'active',
    annualValue: 8030,
    startDate: '2025-09-24',
    endDate: '2026-09-24',
    proposals: [
      {
        id: 'p2',
        title: 'Parts & Wrecking (PDL) Annual',
        value: 8030,
        status: 'accepted',
        sentDate: '2025-08-15',
        acceptedDate: '2025-09-10',
        sections: ['30sec spots across all dayparts', 'Monthly billing', 'Program sponsorship'],
      },
    ],
    notes: [
      {
        id: 'n3',
        date: '2026-04-05',
        author: 'Station Mgr',
        content: 'Daryl confirmed renewal interest for next year.',
        type: 'call',
      },
      {
        id: 'n4',
        date: '2026-01-20',
        author: 'Station Mgr',
        content: 'Q1 check-in. Daryl happy with spot rotation.',
        type: 'email',
      },
    ],
  },
  {
    id: 's3',
    companyName: 'Merritt Funeral Services',
    contactName: 'Trent Merritt',
    email: '',
    phone: '',
    industry: 'Funeral Services',
    address: 'Shepparton VIC 3630',
    website: '',
    tier: 'silver',
    status: 'active',
    annualValue: 4862,
    startDate: '2025-09-24',
    endDate: '2026-09-24',
    proposals: [
      {
        id: 'p3',
        title: 'LT Image Campaign',
        value: 4862,
        status: 'accepted',
        sentDate: '2025-08-20',
        acceptedDate: '2025-09-15',
        sections: ['LT Image spots', 'Community announcements', 'Dignified placement'],
      },
    ],
    notes: [
      {
        id: 'n5',
        date: '2026-03-15',
        author: 'Station Mgr',
        content: 'Check-in with Trent. All on track.',
        type: 'call',
      },
    ],
  },
  {
    id: 's4',
    companyName: 'Gagliardi Scott Real Estate',
    contactName: 'Rocky Gagliardi',
    email: 'rocky@gagliardiscott.com.au',
    phone: '(03) 5831 1800',
    industry: 'Real Estate',
    address: '182 High St, Shepparton VIC 3630',
    website: 'gagliardiscott.com.au',
    tier: 'gold',
    status: 'active',
    annualValue: 7515,
    startDate: '2025-04-03',
    endDate: '2025-10-03',
    proposals: [
      {
        id: 'p4',
        title: 'GVL 2025 Full Coverage',
        value: 7515,
        status: 'accepted',
        sentDate: '2025-02-10',
        acceptedDate: '2025-03-15',
        sections: ['Full GVL 2025 coverage', 'Property market updates', 'Community notices'],
      },
    ],
    notes: [
      {
        id: 'n6',
        date: '2025-09-01',
        author: 'Station Mgr',
        content: 'Rocky wants to discuss 2026 renewal with expanded digital.',
        type: 'meeting',
      },
      {
        id: 'n7',
        date: '2025-07-20',
        author: 'Station Mgr',
        content: 'Mid-season check. Rocky very happy with GVL exposure.',
        type: 'call',
      },
    ],
  },
  {
    id: 's5',
    companyName: 'Goulburn Valley Football League',
    contactName: 'Josephine Spencer',
    email: 'jo.spencer@afl.com.au',
    phone: '03 5823 5021',
    industry: 'Sports',
    address: 'PO Box 1253, Shepparton VIC 3632',
    website: 'gvfl.com.au',
    tier: 'champion',
    status: 'active',
    annualValue: 5500,
    startDate: '2025-04-14',
    endDate: '2025-09-30',
    proposals: [
      {
        id: 'p5',
        title: 'GVL Broadcast 2025',
        value: 5500,
        status: 'accepted',
        sentDate: '2025-03-01',
        acceptedDate: '2025-04-01',
        sections: ['Match-day broadcasts', 'Coach interviews', 'Season preview coverage'],
      },
    ],
    notes: [
      {
        id: 'n8',
        date: '2025-08-15',
        author: 'Station Mgr',
        content: 'Jo confirmed finals coverage schedule.',
        type: 'email',
      },
      {
        id: 'n9',
        date: '2025-05-20',
        author: 'Station Mgr',
        content: 'Met Jo at GVFL HQ. Discussed expanded 2026 package.',
        type: 'meeting',
      },
    ],
  },
  {
    id: 's6',
    companyName: 'McNamara Real Estate',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Real Estate',
    address: 'Shepparton VIC 3630',
    website: '',
    tier: 'silver',
    status: 'active',
    annualValue: 5000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    proposals: [
      {
        id: 'p6',
        title: 'Real Estate Package 2026',
        value: 5000,
        status: 'accepted',
        sentDate: '2025-11-15',
        acceptedDate: '2025-12-01',
        sections: ['Property listing mentions', 'Market update segments', 'Website banner'],
      },
    ],
    notes: [
      {
        id: 'n10',
        date: '2026-03-01',
        author: 'Station Mgr',
        content: 'New sponsor onboarding completed.',
        type: 'note',
      },
    ],
  },
  {
    id: 's7',
    companyName: 'Shepparton Harness Racing Club',
    contactName: 'Ian McDonald',
    email: 'shrc@sheppartonhrc.com.au',
    phone: '(03) 5823 1403',
    industry: 'Sports',
    address: 'PO Box 395, Shepparton VIC 3630',
    website: 'sheppartonhrc.com.au',
    tier: 'bronze',
    status: 'active',
    annualValue: 1100,
    startDate: '2023-01-03',
    endDate: '2024-01-15',
    proposals: [
      {
        id: 'p7',
        title: 'Gold Cup JAN 2024 OB',
        value: 1100,
        status: 'accepted',
        sentDate: '2023-12-01',
        acceptedDate: '2023-12-15',
        sections: ['30sec/15sec spots across all dayparts', 'Live event coverage'],
      },
    ],
    notes: [
      {
        id: 'n11',
        date: '2024-01-10',
        author: 'Station Mgr',
        content: 'Ian confirmed Gold Cup OB details. All set.',
        type: 'call',
      },
    ],
  },
  {
    id: 's8',
    companyName: 'Horizon Fresh Market Pty Ltd',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Retail',
    address: 'Shepparton VIC 3630',
    website: '',
    tier: 'silver',
    status: 'proposal_sent',
    annualValue: 6000,
    proposals: [
      {
        id: 'p8',
        title: 'Fresh Market Sponsorship 2026',
        value: 6000,
        status: 'sent',
        sentDate: '2026-04-01',
        sections: ['Daily fresh produce mentions', 'Recipe segments', 'Weekend specials'],
      },
    ],
    notes: [
      {
        id: 'n12',
        date: '2026-04-15',
        author: 'Station Mgr',
        content: 'Follow-up call made. Awaiting decision.',
        type: 'call',
      },
      {
        id: 'n13',
        date: '2026-04-01',
        author: 'Station Mgr',
        content: 'Proposal sent to Horizon Fresh management.',
        type: 'email',
      },
    ],
  },
  {
    id: 's9',
    companyName: 'Central Tyre Service',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Automotive',
    address: 'Shepparton VIC 3630',
    website: '',
    tier: 'none',
    status: 'contacted',
    annualValue: 0,
    proposals: [],
    notes: [
      {
        id: 'n14',
        date: '2026-04-20',
        author: 'Station Mgr',
        content: 'Left voicemail with manager. Interested in discussing options.',
        type: 'call',
      },
    ],
  },
  {
    id: 's10',
    companyName: "Cleave's Garden Supplies",
    contactName: '',
    email: '',
    phone: '',
    industry: 'Retail',
    address: 'Shepparton VIC 3630',
    website: '',
    tier: 'none',
    status: 'contacted',
    annualValue: 0,
    proposals: [],
    notes: [
      {
        id: 'n15',
        date: '2026-04-18',
        author: 'Station Mgr',
        content: 'Initial outreach. Owner keen to support community radio.',
        type: 'email',
      },
    ],
  },
  {
    id: 's11',
    companyName: 'Positive Media',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Media',
    address: '',
    website: '',
    tier: 'none',
    status: 'lead',
    annualValue: 0,
    proposals: [],
    notes: [
      {
        id: 'n16',
        date: '2026-04-25',
        author: 'Station Mgr',
        content: 'Referral from GVFL. Need to reach out.',
        type: 'note',
      },
    ],
  },
  {
    id: 's12',
    companyName: 'Emergency Medical Services',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Health',
    address: '',
    website: '',
    tier: 'none',
    status: 'lead',
    annualValue: 0,
    proposals: [],
    notes: [
      {
        id: 'n17',
        date: '2026-04-22',
        author: 'Station Mgr',
        content: 'Approached at community safety expo. Interested in health messaging.',
        type: 'note',
      },
    ],
  },
]

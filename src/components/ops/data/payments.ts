// ---------------------------------------------------------------------------
// Payments, donations, memberships & billing analytics data
//
// Extracted from the deployed OpsPortal bundle
// (deployed-reference/assets/OpsPortal-dIeH6Okr.js). Static analytics series,
// renewal/acquittal records and the membership tier catalogue are verbatim
// from the bundle. Seed records for payments/donations/members exist because
// the deployed build initialised its localStorage stores empty — these seeds
// give the module the populated state the deployed UI was designed around.
// ---------------------------------------------------------------------------

// --------------------------- BillingEngine data ----------------------------

export interface PaymentRecord {
  id: string
  invoiceId: string
  invoiceNumber: string
  company: string
  amount: number
  date: string
  method: string
  reference: string
  notes: string
  allocated: boolean
}

/** Payment history shown in the Billing → Payments tab (verbatim from bundle). */
export const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'pay_1', invoiceId: 'inv_1', invoiceNumber: 'INV-2026-001', company: 'Peppermill Inn', amount: 1240, date: '2026-01-15', method: 'Bank Transfer', reference: 'REF-PM-001', notes: 'Full payment received', allocated: true },
  { id: 'pay_2', invoiceId: 'inv_2', invoiceNumber: 'INV-2026-002', company: 'Aussie Ag Supplies Pty Ltd', amount: 669, date: '2026-02-01', method: 'Direct Debit', reference: 'DD-AAG-669', notes: 'Auto debit processed', allocated: true },
  { id: 'pay_3', invoiceId: 'inv_4', invoiceNumber: 'INV-2026-004', company: 'Gagliardi Scott Real Estate', amount: 600, date: '2026-02-10', method: 'Credit Card', reference: 'CC-GS-600', notes: 'Partial payment - balance to follow', allocated: true },
  { id: 'pay_4', invoiceId: 'inv_6', invoiceNumber: 'INV-2026-006', company: 'Goulburn Valley Football League', amount: 916, date: '2026-02-18', method: 'Bank Transfer', reference: 'REF-GVFL-2026', notes: 'Full payment', allocated: true },
  { id: 'pay_5', invoiceId: 'inv_7', invoiceNumber: 'INV-2026-007', company: 'Shepparton Harness Racing Club', amount: 110, date: '2026-02-22', method: 'Direct Debit', reference: 'DD-SHRC-110', notes: 'Gold Cup payment', allocated: true },
  { id: 'pay_6', invoiceId: 'inv_12', invoiceNumber: 'INV-2026-012', company: 'Primary Care Connect', amount: 200, date: '2026-01-20', method: 'Credit Card', reference: 'CC-PCC-200', notes: 'Partial payment - instalment 1 of 3', allocated: true },
  { id: 'pay_7', invoiceId: '', invoiceNumber: '', company: 'Unknown', amount: 1500, date: '2026-02-15', method: 'Bank Transfer', reference: 'DEPOSIT-1500', notes: 'Unallocated deposit - reference unclear', allocated: false },
  { id: 'pay_8', invoiceId: '', invoiceNumber: '', company: 'MediaCOM', amount: 440, date: '2026-02-20', method: 'Cash', reference: 'CASH-001', notes: 'Cash deposit at reception', allocated: false },
]

export type RenewalStatus =
  | 'upcoming'
  | 'proposal_sent'
  | 'negotiating'
  | 'renewed'
  | 'churned'

export interface RenewalRecord {
  id: string
  sponsorId: string
  sponsorName: string
  currentContractValue: number
  endDate: string
  daysRemaining: number
  probability: number
  status: RenewalStatus
  lastYearCampaign: string
  tier: string
  notes: string
}

/** Contract renewal pipeline (verbatim from bundle). */
export const MOCK_RENEWALS: RenewalRecord[] = [
  { id: 'ren_1', sponsorId: 'sp_1', sponsorName: 'Peppermill Inn', currentContractValue: 7436, endDate: '2026-09-30', daysRemaining: 58, probability: 92, status: 'upcoming', lastYearCampaign: 'GVL 2026 MAJOR', tier: 'Gold', notes: 'Long-term partner, renews annually. Todd prefers phone contact.' },
  { id: 'ren_2', sponsorId: 'sp_2', sponsorName: 'Aussie Ag Supplies Pty Ltd', currentContractValue: 8030, endDate: '2026-09-24', daysRemaining: 73, probability: 85, status: 'proposal_sent', lastYearCampaign: 'Parts & Wrecking (PDL)', tier: 'Gold', notes: 'Daryl interested in renewal. Proposal sent.' },
  { id: 'ren_3', sponsorId: 'sp_3', sponsorName: 'Merritt Funeral Services', currentContractValue: 4862, endDate: '2026-09-24', daysRemaining: 28, probability: 60, status: 'negotiating', lastYearCampaign: 'LT Image', tier: 'Silver', notes: 'Price sensitive, exploring options' },
  { id: 'ren_4', sponsorId: 'sp_4', sponsorName: 'Gagliardi Scott Real Estate', currentContractValue: 7515, endDate: '2026-10-03', daysRemaining: 119, probability: 78, status: 'upcoming', lastYearCampaign: 'GVL 2025', tier: 'Gold', notes: 'Rocky wants to expand digital exposure' },
  { id: 'ren_5', sponsorId: 'sp_5', sponsorName: 'McNamara Real Estate', currentContractValue: 5000, endDate: '2026-03-15', daysRemaining: 12, probability: 45, status: 'negotiating', lastYearCampaign: 'Real Estate Package', tier: 'Silver', notes: 'Considering alternative marketing channels' },
  { id: 'ren_6', sponsorId: 'sp_6', sponsorName: 'Goulburn Valley Football League', currentContractValue: 5500, endDate: '2026-09-30', daysRemaining: 43, probability: 70, status: 'upcoming', lastYearCampaign: 'GVL Broadcast 2025', tier: 'Gold', notes: 'Delayed response - committee approval pending' },
  { id: 'ren_7', sponsorId: 'sp_7', sponsorName: 'Horizon Fresh Market Pty Ltd', currentContractValue: 3000, endDate: '2026-02-28', daysRemaining: 0, probability: 30, status: 'churned', lastYearCampaign: 'Fresh Market', tier: 'Bronze', notes: 'Budget cuts - retail downturn' },
]

export type AcquittalStatus = 'in_progress' | 'acquitted' | 'pending'

export interface AcquittalRecord {
  id: string
  sponsorName: string
  campaign: string
  contractPeriod: string
  contractValue: number
  invoicesIssued: number
  invoicesPaid: number
  amountBilled: number
  amountPaid: number
  spotsDelivered: number
  spotsScheduled: number
  balanceRemaining: number
  status: AcquittalStatus
}

/** Sponsor acquittal reports (verbatim from bundle). */
export const MOCK_ACQUITTALS: AcquittalRecord[] = [
  { id: 'acq_1', sponsorName: 'Peppermill Inn', campaign: 'GVL 2026 MAJOR', contractPeriod: 'Mar - Sep 2026', contractValue: 7436, invoicesIssued: 3, invoicesPaid: 2, amountBilled: 3718, amountPaid: 2479, spotsDelivered: 48, spotsScheduled: 72, balanceRemaining: 1239, status: 'in_progress' },
  { id: 'acq_2', sponsorName: 'Aussie Ag Supplies Pty Ltd', campaign: 'Parts & Wrecking (PDL)', contractPeriod: 'Sep 2025 - Sep 2026', contractValue: 8030, invoicesIssued: 5, invoicesPaid: 5, amountBilled: 3345, amountPaid: 3345, spotsDelivered: 20, spotsScheduled: 20, balanceRemaining: 0, status: 'acquitted' },
  { id: 'acq_3', sponsorName: 'Merritt Funeral Services', campaign: 'LT Image', contractPeriod: 'Sep 2025 - Sep 2026', contractValue: 4862, invoicesIssued: 5, invoicesPaid: 4, amountBilled: 2026, amountPaid: 1621, spotsDelivered: 16, spotsScheduled: 20, balanceRemaining: 405, status: 'in_progress' },
  { id: 'acq_4', sponsorName: 'Gagliardi Scott Real Estate', campaign: 'GVL 2025', contractPeriod: 'Apr - Oct 2025', contractValue: 7515, invoicesIssued: 3, invoicesPaid: 2, amountBilled: 3758, amountPaid: 2479, spotsDelivered: 10, spotsScheduled: 12, balanceRemaining: 1279, status: 'in_progress' },
  { id: 'acq_5', sponsorName: 'Goulburn Valley Football League', campaign: 'GVL Broadcast 2025', contractPeriod: 'Apr - Sep 2025', contractValue: 5500, invoicesIssued: 2, invoicesPaid: 1, amountBilled: 2750, amountPaid: 916, spotsDelivered: 8, spotsScheduled: 12, balanceRemaining: 1834, status: 'in_progress' },
]

export interface RevenueBySource {
  source: string
  revenue: number
  color: string
}

export const REVENUE_BY_SOURCE: RevenueBySource[] = [
  { source: 'Football', revenue: 38500, color: '#D4A853' },
  { source: 'Programs', revenue: 18200, color: '#5B8DB8' },
  { source: 'Events', revenue: 12400, color: '#7CBA7C' },
  { source: 'Digital', revenue: 8600, color: '#C97FB8' },
  { source: 'Other', revenue: 3200, color: '#9CA3AF' },
]

export interface TierAnalysis {
  tier: string
  count: number
  revenue: number
  color: string
}

export const TIER_ANALYSIS: TierAnalysis[] = [
  { tier: 'Platinum', count: 2, revenue: 50000, color: '#D4A853' },
  { tier: 'Gold', count: 4, revenue: 28800, color: '#5B8DB8' },
  { tier: 'Silver', count: 3, revenue: 10500, color: '#7CBA7C' },
  { tier: 'Bronze', count: 2, revenue: 4800, color: '#B8860B' },
]

export interface MonthlyRevenue {
  month: string
  revenue: number
  target: number
  collected: number
}

// DEMO DATA — illustrative ops charts, not station-audited revenue.
export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Sep', revenue: 12400, target: 14000, collected: 11800 },
  { month: 'Oct', revenue: 15800, target: 15000, collected: 15200 },
  { month: 'Nov', revenue: 13100, target: 15000, collected: 12800 },
  { month: 'Dec', revenue: 19200, target: 18000, collected: 18900 },
  { month: 'Jan', revenue: 22400, target: 20000, collected: 21000 },
  { month: 'Feb', revenue: 18600, target: 20000, collected: 15800 },
]

export interface CollectionTrend {
  month: string
  rate: number
}

export const COLLECTION_TRENDS: CollectionTrend[] = [
  { month: 'Sep', rate: 82 },
  { month: 'Oct', rate: 88 },
  { month: 'Nov', rate: 79 },
  { month: 'Dec', rate: 94 },
  { month: 'Jan', rate: 91 },
  { month: 'Feb', rate: 72 },
]

export interface ForecastMonth {
  month: string
  conservative: number
  optimistic: number
}

export const FORECAST_SCENARIOS: ForecastMonth[] = [
  { month: 'Mar', conservative: 18000, optimistic: 22000 },
  { month: 'Apr', conservative: 19500, optimistic: 24500 },
  { month: 'May', conservative: 21000, optimistic: 27000 },
  { month: 'Jun', conservative: 22500, optimistic: 29500 },
  { month: 'Jul', conservative: 24000, optimistic: 32000 },
  { month: 'Aug', conservative: 25500, optimistic: 34500 },
]

export interface PaymentMethodBreakdown {
  method: string
  count: number
  amount: number
  color: string
}

export const PAYMENT_METHOD_ANALYSIS: PaymentMethodBreakdown[] = [
  { method: 'Bank Transfer', count: 45, amount: 78500, color: '#D4A853' },
  { method: 'Credit Card', count: 28, amount: 42300, color: '#5B8DB8' },
  { method: 'Direct Debit', count: 22, amount: 35600, color: '#7CBA7C' },
  { method: 'Cash', count: 8, amount: 5200, color: '#B8860B' },
  { method: 'Cheque', count: 3, amount: 8900, color: '#9CA3AF' },
]

export interface GstQuarter {
  quarter: string
  collected: number
  paid: number
  net: number
}

export const GST_QUARTERS: GstQuarter[] = [
  { quarter: 'Q1 FY25', collected: 12400, paid: 3800, net: 8600 },
  { quarter: 'Q2 FY25', collected: 15800, paid: 5200, net: 10600 },
  { quarter: 'Q3 FY25', collected: 11200, paid: 4100, net: 7100 },
  { quarter: 'Q4 FY25', collected: 18900, paid: 6300, net: 12600 },
]

// --------------------------- PaymentsModule data ---------------------------

export const ACCENT = {
  gold: '#D4A853',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
} as const

export type PaymentMethod =
  | 'bank_transfer'
  | 'credit_card'
  | 'paypal'
  | 'direct_debit'
  | 'cash'
  | 'cheque'

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; color: string }> = {
  bank_transfer: { label: 'Bank Transfer', color: '#3B82F6' },
  credit_card: { label: 'Credit Card', color: '#8B5CF6' },
  paypal: { label: 'PayPal', color: '#10B981' },
  direct_debit: { label: 'Direct Debit', color: '#F59E0B' },
  cash: { label: 'Cash', color: '#10B981' },
  cheque: { label: 'Cheque', color: '#EC4899' },
}

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded'

export const PAYMENT_STATUSES: Record<PaymentStatus, { label: string; color: string }> = {
  completed: { label: 'Completed', color: '#10B981' },
  pending: { label: 'Pending', color: '#F59E0B' },
  failed: { label: 'Failed', color: '#EF4444' },
  refunded: { label: 'Refunded', color: '#6B7280' },
}

export type DonationSource =
  | 'website'
  | 'event'
  | 'radio_appeal'
  | 'direct_mail'
  | 'other'

export const DONATION_SOURCES: Record<DonationSource, { label: string }> = {
  website: { label: 'Website' },
  event: { label: 'Event' },
  radio_appeal: { label: 'Radio Appeal' },
  direct_mail: { label: 'Direct Mail' },
  other: { label: 'Other' },
}

export type DonorStatus = 'active' | 'lapsed' | 'new'

export const DONOR_STATUSES: Record<DonorStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#10B981' },
  lapsed: { label: 'Lapsed', color: '#F59E0B' },
  new: { label: 'New', color: '#3B82F6' },
}

export type MembershipTierId = 'bronze' | 'silver' | 'gold' | 'platinum'
export type BillingFrequency = 'monthly' | 'annual'

export interface MembershipTier {
  label: string
  color: string
  monthly: number
  annual: number
  benefits: string[]
}

/** Membership tier catalogue (verbatim from bundle, incl. benefit lists). */
export const MEMBERSHIP_TIERS: Record<MembershipTierId, MembershipTier> = {
  bronze: {
    label: 'Bronze',
    color: '#CD7F32',
    monthly: 5,
    annual: 50,
    benefits: ['Email newsletter', 'Event discounts'],
  },
  silver: {
    label: 'Silver',
    color: '#94A3B8',
    monthly: 10,
    annual: 100,
    benefits: ['All Bronze perks', 'ONE FM T-shirt', 'Voting rights at AGM'],
  },
  gold: {
    label: 'Gold',
    color: '#D4A853',
    monthly: 20,
    annual: 200,
    benefits: ['All Silver perks', 'Name on website', 'Priority event access'],
  },
  platinum: {
    label: 'Platinum',
    color: '#E5E4E2',
    monthly: 50,
    annual: 500,
    benefits: ['All Gold perks', 'Quarterly dinner invite', 'Producer credit'],
  },
}

export type MemberStatus = 'active' | 'lapsed' | 'cancelled'

export const MEMBER_STATUSES: Record<MemberStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#10B981' },
  lapsed: { label: 'Lapsed', color: '#F59E0B' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
}

export type DonationType = 'one_time' | 'monthly_recurring'
export type RecurringStatus = 'active' | 'paused' | 'cancelled'

export interface ClientPayment {
  id: string
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  method: PaymentMethod
  date: string
  reference: string
  notes: string
  status: PaymentStatus
}

export interface OutstandingInvoice {
  id: string
  number: string
  client: string
  balance: number
  dueDate: string
}

export interface DonationRecord {
  id: string
  donorName: string
  email: string
  phone: string
  amount: number
  type: DonationType
  method: PaymentMethod
  date: string
  source: DonationSource
  receiptNumber: string
  notes?: string
}

export interface RecurringDonation {
  id: string
  donorName: string
  email: string
  amount: number
  startDate: string
  nextChargeDate: string
  totalCharged: number
  status: RecurringStatus
}

export interface MemberRecord {
  id: string
  memberId: string
  name: string
  email: string
  phone: string
  address: string
  tier: MembershipTierId
  billingFrequency: BillingFrequency
  joinDate: string
  renewalDate: string
  amount: number
  status: MemberStatus
  autoRenew: boolean
  paymentMethod: PaymentMethod
  source: string
}

/** Outstanding sponsor invoices selectable in Record Payment / Payment Link. */
export const SEED_OUTSTANDING_INVOICES: OutstandingInvoice[] = [
  { id: 'out-001', number: 'ONEFM-2026-011', client: 'FOOTT Waste Solutions', balance: 5500, dueDate: '2026-06-23' },
  { id: 'out-002', number: 'ONEFM-2026-012', client: "Jason's TV Pty Ltd", balance: 8580, dueDate: '2026-06-23' },
  { id: 'out-003', number: 'ONEFM-2026-013', client: 'Gagliardi Scott Real Estate', balance: 7515.2, dueDate: '2026-06-23' },
  { id: 'out-004', number: 'ONEFM-2026-015', client: 'Peppermill Inn', balance: 4957.3, dueDate: '2026-06-23' },
  { id: 'out-005', number: 'INV-2026-003', client: 'Merritt Funeral Services', balance: 405, dueDate: '2026-02-10' },
  { id: 'out-006', number: 'ONEFM-2026-029', client: 'Donuts A Go Go', balance: 109.98, dueDate: '2026-06-23' },
]

export const SEED_CLIENT_PAYMENTS: ClientPayment[] = [
  { id: 'cp-001', invoiceId: 'inv_1', invoiceNumber: 'INV-2026-001', clientName: 'Peppermill Inn', amount: 1240, method: 'bank_transfer', date: '2026-06-02', reference: 'TRX-PM1240', notes: 'GVL 2026 MAJOR instalment', status: 'completed' },
  { id: 'cp-002', invoiceId: 'inv_2', invoiceNumber: 'INV-2026-002', clientName: 'Aussie Ag Supplies Pty Ltd', amount: 669, method: 'direct_debit', date: '2026-06-03', reference: 'DD-AAG-669', notes: 'Auto debit processed', status: 'completed' },
  { id: 'cp-003', invoiceId: 'inv_4', invoiceNumber: 'INV-2026-004', clientName: 'Gagliardi Scott Real Estate', amount: 600, method: 'credit_card', date: '2026-06-05', reference: 'CC-GS-600', notes: 'Partial payment — balance to follow', status: 'completed' },
  { id: 'cp-004', invoiceId: 'inv_6', invoiceNumber: 'INV-2026-006', clientName: 'Goulburn Valley Football League', amount: 916, method: 'bank_transfer', date: '2026-06-08', reference: 'REF-GVFL-916', notes: 'Broadcast settlement', status: 'completed' },
  { id: 'cp-005', invoiceId: 'inv_7', invoiceNumber: 'INV-2026-007', clientName: 'Shepparton Harness Racing Club', amount: 110, method: 'paypal', date: '2026-06-09', reference: 'PP-SHRC-110', notes: 'Gold Cup OB payment', status: 'completed' },
  { id: 'cp-006', invoiceId: 'inv_9', invoiceNumber: 'ONEFM-2026-019', clientName: 'Burkes Bakery', amount: 1540, method: 'cheque', date: '2026-06-10', reference: 'CHQ-000412', notes: 'Part payment by cheque', status: 'pending' },
  { id: 'cp-007', invoiceId: 'inv_12', invoiceNumber: 'INV-2026-012', clientName: 'Primary Care Connect', amount: 200, method: 'credit_card', date: '2026-05-28', reference: 'CC-PCC-200', notes: 'Instalment 1 of 3', status: 'completed' },
  { id: 'cp-008', invoiceId: '', invoiceNumber: 'CASH-RCPT-08', clientName: 'MediaCOM', amount: 440, method: 'cash', date: '2026-05-30', reference: 'CASH-001', notes: 'Cash deposit at reception', status: 'completed' },
]

// DEMO DATA — donations, members, and recurring donors below are illustrative examples.
// Replace with real CRM data before any public/external-facing report or system integration.
export const SEED_DONATIONS: DonationRecord[] = [
  { id: 'don-001', donorName: 'Margaret Wilson', email: 'mwilson@bigpond.com', phone: '0427 311 204', amount: 100, type: 'one_time', method: 'credit_card', date: '2026-06-10', source: 'radio_appeal', receiptNumber: 'ONE-D-2026-014', notes: 'Loves the breakfast show' },
  { id: 'don-002', donorName: 'Bruce Hartley', email: 'bruce.hartley@gmail.com', phone: '0418 552 901', amount: 50, type: 'monthly_recurring', method: 'direct_debit', date: '2026-06-08', source: 'website', receiptNumber: 'ONE-D-2026-013' },
  { id: 'don-003', donorName: 'Shepparton Lions Club', email: 'secretary@sheplions.org.au', phone: '03 5821 9988', amount: 500, type: 'one_time', method: 'bank_transfer', date: '2026-06-05', source: 'event', receiptNumber: 'ONE-D-2026-012', notes: 'Fire Relief Festival collection' },
  { id: 'don-004', donorName: 'Helen Nguyen', email: 'helen.nguyen@outlook.com', phone: '0432 778 102', amount: 25, type: 'monthly_recurring', method: 'paypal', date: '2026-06-03', source: 'website', receiptNumber: 'ONE-D-2026-011' },
  { id: 'don-005', donorName: 'Ray Donaldson', email: 'raydon@iinet.net.au', phone: '0409 663 247', amount: 200, type: 'one_time', method: 'cheque', date: '2026-06-02', source: 'direct_mail', receiptNumber: 'ONE-D-2026-010', notes: 'In memory of Joan' },
  { id: 'don-006', donorName: 'Margaret Wilson', email: 'mwilson@bigpond.com', phone: '0427 311 204', amount: 75, type: 'one_time', method: 'credit_card', date: '2026-05-18', source: 'radio_appeal', receiptNumber: 'ONE-D-2026-009' },
  { id: 'don-007', donorName: 'Tatura Milk Co-op Social Club', email: 'social@taturamilk.com.au', phone: '03 5824 3000', amount: 350, type: 'one_time', method: 'bank_transfer', date: '2026-05-12', source: 'event', receiptNumber: 'ONE-D-2026-008', notes: 'Casual Friday collection' },
  { id: 'don-008', donorName: 'Bruce Hartley', email: 'bruce.hartley@gmail.com', phone: '0418 552 901', amount: 50, type: 'monthly_recurring', method: 'direct_debit', date: '2026-05-08', source: 'website', receiptNumber: 'ONE-D-2026-007' },
  { id: 'don-009', donorName: 'Priya Sharma', email: 'priya.sharma88@gmail.com', phone: '0451 209 663', amount: 40, type: 'one_time', method: 'paypal', date: '2026-04-29', source: 'website', receiptNumber: 'ONE-D-2026-006', notes: 'Punjabi Music Program listener' },
  { id: 'don-010', donorName: 'Helen Nguyen', email: 'helen.nguyen@outlook.com', phone: '0432 778 102', amount: 25, type: 'monthly_recurring', method: 'paypal', date: '2026-04-03', source: 'website', receiptNumber: 'ONE-D-2026-005' },
  { id: 'don-011', donorName: 'Gordon & Faye Mills', email: 'gfmills@bigpond.com', phone: '03 5825 1447', amount: 150, type: 'one_time', method: 'cash', date: '2026-03-20', source: 'event', receiptNumber: 'ONE-D-2026-004', notes: 'Albanian Harvest Festival stall' },
  { id: 'don-012', donorName: 'Carlos Mendez', email: 'cmendez.rock@gmail.com', phone: '0413 887 220', amount: 60, type: 'one_time', method: 'credit_card', date: '2026-02-27', source: 'radio_appeal', receiptNumber: 'ONE-D-2026-003', notes: 'Planet of Sound supporter' },
  { id: 'don-013', donorName: 'Shepparton Albanian Community', email: 'committee@shepalbanian.org.au', phone: '0400 118 339', amount: 300, type: 'one_time', method: 'bank_transfer', date: '2026-02-10', source: 'event', receiptNumber: 'ONE-D-2026-002' },
  { id: 'don-014', donorName: 'Janet O\'Keefe', email: 'janet.okeefe@hotmail.com', phone: '0438 902 415', amount: 20, type: 'one_time', method: 'cash', date: '2026-01-15', source: 'other', receiptNumber: 'ONE-D-2026-001' },
]

export const SEED_RECURRING_DONATIONS: RecurringDonation[] = [
  { id: 'rec-001', donorName: 'Bruce Hartley', email: 'bruce.hartley@gmail.com', amount: 50, startDate: '2025-11-08', nextChargeDate: '2026-07-08', totalCharged: 400, status: 'active' },
  { id: 'rec-002', donorName: 'Helen Nguyen', email: 'helen.nguyen@outlook.com', amount: 25, startDate: '2026-02-03', nextChargeDate: '2026-07-03', totalCharged: 125, status: 'active' },
  { id: 'rec-003', donorName: 'Doug Pearson', email: 'doug.pearson@iinet.net.au', amount: 30, startDate: '2025-08-15', nextChargeDate: '2026-07-15', totalCharged: 330, status: 'paused' },
  { id: 'rec-004', donorName: 'Alice Tran', email: 'alice.tran@gmail.com', amount: 15, startDate: '2025-06-20', nextChargeDate: '2026-06-20', totalCharged: 180, status: 'active' },
]

// DEMO DATA — member records below are illustrative examples.
// Real member data must be loaded from Supabase/CRM, not this seed file.
export const SEED_MEMBERS: MemberRecord[] = [
  { id: 'm1', memberId: 'ONE-M-98501', name: 'John Painter', email: 'johnnyp@fm985.com.au', phone: '0427 100 985', address: '12 Echuca Rd, Mooroopna VIC 3629', tier: 'gold', billingFrequency: 'annual', joinDate: '2024-07-01', renewalDate: '2026-07-01', amount: 200, status: 'active', autoRenew: true, paymentMethod: 'direct_debit', source: 'Station volunteer' },
  { id: 'm2', memberId: 'ONE-M-98502', name: 'Margaret Wilson', email: 'mwilson@bigpond.com', phone: '0427 311 204', address: '8 Corio St, Shepparton VIC 3630', tier: 'silver', billingFrequency: 'annual', joinDate: '2025-03-14', renewalDate: '2026-07-10', amount: 100, status: 'active', autoRenew: true, paymentMethod: 'credit_card', source: 'Radio' },
  { id: 'm3', memberId: 'ONE-M-98503', name: 'Bruce Hartley', email: 'bruce.hartley@gmail.com', phone: '0418 552 901', address: '45 Knight St, Shepparton VIC 3630', tier: 'bronze', billingFrequency: 'monthly', joinDate: '2025-11-08', renewalDate: '2026-07-08', amount: 5, status: 'active', autoRenew: true, paymentMethod: 'direct_debit', source: 'Website' },
  { id: 'm4', memberId: 'ONE-M-98504', name: 'Sissy Hoskin', email: 'hello@gonagambie.com.au', phone: '0407 556 213', address: '290 High St, Nagambie VIC 3608', tier: 'platinum', billingFrequency: 'annual', joinDate: '2024-09-30', renewalDate: '2026-09-30', amount: 500, status: 'active', autoRenew: true, paymentMethod: 'credit_card', source: 'Sponsor referral' },
  { id: 'm5', memberId: 'ONE-M-98505', name: 'Helen Nguyen', email: 'helen.nguyen@outlook.com', phone: '0432 778 102', address: '3 Maude St, Shepparton VIC 3630', tier: 'bronze', billingFrequency: 'monthly', joinDate: '2026-02-03', renewalDate: '2026-07-03', amount: 5, status: 'active', autoRenew: true, paymentMethod: 'paypal', source: 'Friend' },
  { id: 'm6', memberId: 'ONE-M-98506', name: 'Craig Stott', email: 'craig.stott@gmail.com', phone: '0419 884 002', address: '17 Hayes St, Shepparton VIC 3630', tier: 'gold', billingFrequency: 'monthly', joinDate: '2025-04-12', renewalDate: '2026-07-12', amount: 20, status: 'active', autoRenew: false, paymentMethod: 'credit_card', source: 'Super Saturday Sports Show' },
  { id: 'm7', memberId: 'ONE-M-98507', name: 'Doug Pearson', email: 'doug.pearson@iinet.net.au', phone: '0409 311 776', address: '102 Archer St, Shepparton VIC 3630', tier: 'silver', billingFrequency: 'annual', joinDate: '2024-05-22', renewalDate: '2026-05-22', amount: 100, status: 'lapsed', autoRenew: false, paymentMethod: 'bank_transfer', source: 'Radio' },
  { id: 'm8', memberId: 'ONE-M-98508', name: 'Edith Reyes', email: 'edith.reyes@gmail.com', phone: '0451 660 928', address: '6 Balaclava Rd, Shepparton VIC 3630', tier: 'bronze', billingFrequency: 'annual', joinDate: '2025-10-01', renewalDate: '2026-10-01', amount: 50, status: 'active', autoRenew: true, paymentMethod: 'paypal', source: 'Filipino Music Program' },
  { id: 'm9', memberId: 'ONE-M-98509', name: 'Reg Qemal', email: 'reg.qemal@hotmail.com', phone: '0400 118 339', address: '22 Wyndham St, Shepparton VIC 3630', tier: 'silver', billingFrequency: 'monthly', joinDate: '2026-06-04', renewalDate: '2026-07-04', amount: 10, status: 'active', autoRenew: true, paymentMethod: 'credit_card', source: 'Albanian Harvest Festival' },
  { id: 'm10', memberId: 'ONE-M-98510', name: 'Trevor Banks', email: 'tbanks52@bigpond.com', phone: '0428 605 114', address: '9 Pine Rd, Kialla VIC 3631', tier: 'bronze', billingFrequency: 'monthly', joinDate: '2024-08-19', renewalDate: '2026-03-19', amount: 5, status: 'cancelled', autoRenew: false, paymentMethod: 'direct_debit', source: 'Radio' },
]

/** Monthly community donation goal (from bundle: $5,000). */
export const MONTHLY_DONATION_GOAL = 5000

/** Stripe / PayPal webhook endpoints shown in the integrations panel (verbatim). */
export const STRIPE_WEBHOOK_URL = 'https://api.onefm985.com.au/webhooks/stripe'
export const PAYPAL_WEBHOOK_URL = 'https://api.onefm985.com.au/webhooks/paypal'

/** Hosted payment-link pattern used by the deployed Payment Link Generator. */
export function buildPaymentLink(invoiceId: string): string {
  return `https://pay.onefm985.com.au/invoice/${invoiceId}?ref=${Math.random().toString(36).substring(2, 10)}`
}

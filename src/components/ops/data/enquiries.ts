export type EnquiryStatus =
  | 'new'
  | 'in_progress'
  | 'proposal_sent'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost'

export type EnquiryPriority = 'low' | 'medium' | 'high' | 'urgent'
export type EnquirySource = 'contact' | 'sponsorship' | 'football' | 'support'

export interface EnquiryNote {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface Enquiry {
  id: string
  source: EnquirySource
  name: string
  email: string
  phone: string
  company?: string
  subject: string
  message: string
  status: EnquiryStatus
  priority: EnquiryPriority
  assignedTo?: string
  notes: EnquiryNote[]
  createdAt: string
  updatedAt: string
  value?: number
}

/**
 * Weekday breakfast — source: BREAKFAST_SHOW / BREAKFAST_TIME in programGuide.ts.
 * Saturday 6–9am on the guide is Songs of the Spirit, not breakfast.
 */
const WEEKDAY_BREAKFAST = 'ONE FM Breakfast (Breaky) · Mon–Fri 6:00am–9:00am'

// DEMO DATA — synthetic CRM pipeline rows for ops UI. Not real sponsors.
// Do not email these addresses. Real enquiries arrive via Supabase contact_enquiries.
// Licensed coverage is Goulburn Valley via townData — not leftover Barwon-region geography.
export const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: 'ENQ-001',
    source: 'contact',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@techflow.com.au',
    phone: '0412 345 678',
    company: 'TechFlow Solutions',
    subject: 'Advertising rates for Q3',
    message:
      'Hi there, I am looking to book radio advertising for our tech company during Q3 2025. We are interested in primetime slots between 7-9am. Could you please send through your latest rate card and availability? We are considering a 12-week campaign.',
    status: 'new',
    priority: 'high',
    notes: [],
    createdAt: '2025-05-19T08:30:00Z',
    updatedAt: '2025-05-19T08:30:00Z',
  },
  {
    id: 'ENQ-002',
    source: 'contact',
    name: 'David Chen',
    email: 'david.chen@urbangrill.net',
    phone: '0433 876 543',
    company: 'Urban Grill Restaurant',
    subject: 'Weekday breakfast promotion partnership',
    message:
      `We are a new restaurant (DEMO — not a Goulburn Valley business) and would love to explore a promotional partnership. Interested in sponsored segments during ${WEEKDAY_BREAKFAST}.`,
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Ricardo B',
    notes: [
      {
        id: 'n1',
        text: `Called David — keen on weekday breakfast slot (${WEEKDAY_BREAKFAST}). Budget around $2k.`,
        author: 'Ricardo B',
        createdAt: '2025-05-18T10:15:00Z',
      },
    ],
    createdAt: '2025-05-17T14:22:00Z',
    updatedAt: '2025-05-18T10:15:00Z',
  },
  {
    id: 'ENQ-003',
    source: 'contact',
    name: 'Jenny Walker',
    email: 'jenny@walkerfurniture.com.au',
    phone: '0444 222 111',
    company: 'Walker Furniture',
    subject: 'EOFY sale campaign',
    message:
      'We run an EOFY sale every June and want to increase our radio presence this year. Looking for a package that includes live reads and pre-recorded spots.',
    status: 'proposal_sent',
    priority: 'high',
    assignedTo: 'Ricardo B',
    notes: [
      {
        id: 'n2',
        text: 'Sent EOFY package — $4,500 for 6 weeks live reads + spots.',
        author: 'Ricardo B',
        createdAt: '2025-05-15T09:00:00Z',
      },
    ],
    createdAt: '2025-05-14T11:45:00Z',
    updatedAt: '2025-05-15T09:00:00Z',
    value: 4500,
  },
  {
    id: 'ENQ-004',
    source: 'sponsorship',
    name: 'Marcus Thompson',
    email: 'marcus@autopro.demo.invalid',
    phone: '0411 555 999',
    company: 'DEMO Auto Pro',
    subject: 'Platinum Sponsorship Inquiry',
    message:
      'We have been following ONE FM for years and are ready to step up our partnership. Interested in the Platinum Sponsorship package.',
    status: 'negotiating',
    priority: 'urgent',
    assignedTo: 'Ricardo B',
    notes: [
      {
        id: 'n3',
        text: 'Marcus is serious — has budget approval for $15k+. Wants naming rights confirmation.',
        author: 'Ricardo B',
        createdAt: '2025-05-16T14:30:00Z',
      },
    ],
    createdAt: '2025-05-12T09:15:00Z',
    updatedAt: '2025-05-18T16:00:00Z',
    value: 18000,
  },
  {
    id: 'ENQ-005',
    source: 'sponsorship',
    name: 'Amara Okafor',
    email: 'amara@wellness.demo.invalid',
    phone: '0422 777 333',
    company: 'DEMO Wellness Centre',
    subject: 'Health segment sponsorship',
    message:
      'Our wellness centre is launching a new mental health initiative and we would love to sponsor a recurring health and wellness segment.',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Lisa M',
    notes: [
      {
        id: 'n5',
        text: 'Great fit for community programming. Recommend Silver tier + in-kind segment swap.',
        author: 'Lisa M',
        createdAt: '2025-05-17T11:20:00Z',
      },
    ],
    createdAt: '2025-05-16T07:45:00Z',
    updatedAt: '2025-05-17T11:20:00Z',
    value: 8500,
  },
  {
    id: 'ENQ-006',
    source: 'sponsorship',
    name: 'Brad Harrison',
    email: 'brad@harrisonplumbing.com.au',
    phone: '0455 888 444',
    company: 'Harrison Plumbing Services',
    subject: 'Bronze sponsor package',
    message: 'Small family plumbing business looking to get started with radio sponsorship.',
    status: 'closed_won',
    priority: 'low',
    assignedTo: 'Ricardo B',
    notes: [
      {
        id: 'n6',
        text: 'Signed Bronze package at $3,600. Invoice sent.',
        author: 'Ricardo B',
        createdAt: '2025-05-10T15:00:00Z',
      },
    ],
    createdAt: '2025-05-08T13:10:00Z',
    updatedAt: '2025-05-12T09:30:00Z',
    value: 3600,
  },
  {
    id: 'ENQ-007',
    source: 'sponsorship',
    name: 'Priya Sharma',
    email: 'priya@dance.demo.invalid',
    phone: '0433 111 888',
    company: 'DEMO Dance Studio',
    subject: 'Cultural event sponsorship',
    message:
      'We are hosting a DEMO cultural festival (not a Goulburn Valley event) in August and would love ONE FM as our media partner.',
    status: 'proposal_sent',
    priority: 'high',
    assignedTo: 'Ricardo B',
    notes: [
      {
        id: 'n8',
        text: 'Exciting opportunity — festival aligns with community values. Proposed media partnership package.',
        author: 'Ricardo B',
        createdAt: '2025-05-16T10:00:00Z',
      },
    ],
    createdAt: '2025-05-15T16:30:00Z',
    updatedAt: '2025-05-16T10:00:00Z',
    value: 7500,
  },
  {
    id: 'ENQ-008',
    source: 'sponsorship',
    name: 'Tom Radley',
    email: 'tom@fitness.demo.invalid',
    phone: '0415 333 777',
    company: 'DEMO Fitness',
    subject: 'Gym membership drive campaign',
    message: 'Launching our summer membership drive and want heavy radio presence for 4 weeks.',
    status: 'new',
    priority: 'medium',
    notes: [],
    createdAt: '2025-05-19T06:20:00Z',
    updatedAt: '2025-05-19T06:20:00Z',
    value: 6200,
  },
  {
    id: 'ENQ-009',
    source: 'football',
    name: 'Coach Gary Phillips',
    email: 'gary.phillips@soccer.demo.invalid',
    phone: '0400 555 222',
    company: 'DEMO Soccer Club',
    subject: '2025 Season Broadcast Sponsorship',
    message:
      'DEMO soccer club (not a GVL club) looking to enquire about match coverage.',
    status: 'negotiating',
    priority: 'urgent',
    assignedTo: 'Ricardo B',
    notes: [
      {
        id: 'n9',
        text: 'Met with Gary. DEMO row — not a GVL clubhouse visit. Countered at $32k including naming rights.',
        author: 'Ricardo B',
        createdAt: '2025-05-17T14:00:00Z',
      },
    ],
    createdAt: '2025-05-10T09:00:00Z',
    updatedAt: '2025-05-17T14:00:00Z',
    value: 32000,
  },
  {
    id: 'ENQ-010',
    source: 'football',
    name: 'Anita Roberts',
    email: 'a.roberts@football.demo.invalid',
    phone: '0425 999 000',
    company: 'DEMO Football Club',
    subject: 'Junior league coverage',
    message: 'Interested in getting match coverage for our under-18 and under-16 teams this season.',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Lisa M',
    notes: [
      {
        id: 'n11',
        text: 'Proposing a monthly "Youth in Sport" segment.',
        author: 'Lisa M',
        createdAt: '2025-05-18T08:45:00Z',
      },
    ],
    createdAt: '2025-05-16T15:30:00Z',
    updatedAt: '2025-05-18T08:45:00Z',
    value: 4500,
  },
  {
    id: 'ENQ-011',
    source: 'football',
    name: 'Dean Kostopoulos',
    email: 'dean.k@tigers.demo.invalid',
    phone: '0418 444 555',
    company: 'DEMO Tigers',
    subject: 'Match day sponsorship',
    message: 'DEMO Tigers want to explore match-day sponsorship for our home games.',
    status: 'new',
    priority: 'medium',
    notes: [],
    createdAt: '2025-05-18T11:00:00Z',
    updatedAt: '2025-05-18T11:00:00Z',
    value: 5800,
  },
  {
    id: 'ENQ-012',
    source: 'football',
    name: 'Rachel Kim',
    email: 'rachel@united.demo.invalid',
    phone: '0436 222 444',
    company: 'DEMO United FC',
    subject: "Women's team feature request",
    message:
      "Our women's team has won the last 3 premierships and we would love a feature segment on ONE FM.",
    status: 'proposal_sent',
    priority: 'high',
    assignedTo: 'Lisa M',
    notes: [
      {
        id: 'n12',
        text: 'Women in sport angle is strong. Proposed feature segment + 4 match coverages at $5,200.',
        author: 'Lisa M',
        createdAt: '2025-05-17T16:20:00Z',
      },
    ],
    createdAt: '2025-05-15T10:45:00Z',
    updatedAt: '2025-05-17T16:20:00Z',
    value: 5200,
  },
  {
    id: 'ENQ-013',
    source: 'support',
    name: 'Helen Drummond',
    email: 'helen.drummond@gmail.com',
    phone: '0392 123 456',
    subject: 'Monthly donation setup',
    message: 'I would like to set up a monthly donation to support ONE FM community work. $50/month.',
    status: 'closed_won',
    priority: 'low',
    notes: [
      {
        id: 'n13',
        text: 'Lovely supporter — $50/month recurring donation set up via Stripe.',
        author: 'Admin',
        createdAt: '2025-05-13T10:00:00Z',
      },
    ],
    createdAt: '2025-05-12T08:30:00Z',
    updatedAt: '2025-05-13T10:00:00Z',
    value: 600,
  },
  {
    id: 'ENQ-014',
    source: 'support',
    name: 'Barrett Family Foundation',
    email: 'grants@barrettfoundation.org.au',
    phone: 'DEMO — not a station number',
    company: 'Barrett Family Foundation',
    subject: 'Community grant application',
    message:
      'The Barrett Family Foundation is pleased to offer ONE FM a community grant of $5,000.',
    status: 'closed_won',
    priority: 'high',
    assignedTo: 'Lisa M',
    notes: [
      {
        id: 'n14',
        text: 'Grant approved! $5,000 for youth program.',
        author: 'Lisa M',
        createdAt: '2025-05-16T09:00:00Z',
      },
    ],
    createdAt: '2025-05-10T14:00:00Z',
    updatedAt: '2025-05-19T11:00:00Z',
    value: 5000,
  },
  {
    id: 'ENQ-015',
    source: 'support',
    name: 'James Cotterill',
    email: 'james.cotterill@outlook.com',
    phone: '0419 777 333',
    subject: 'Volunteer + one-time donation',
    message:
      'I am a retired sound engineer with 30 years experience. I would love to volunteer my time to help ONE FM.',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Lisa M',
    notes: [
      {
        id: 'n16',
        text: 'James has incredible experience. Scheduled meet on Thursday.',
        author: 'Lisa M',
        createdAt: '2025-05-18T13:00:00Z',
      },
    ],
    createdAt: '2025-05-17T17:00:00Z',
    updatedAt: '2025-05-18T13:00:00Z',
    value: 200,
  },
]

export const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; color: string; dot: string }
> = {
  new: { label: 'New', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
  },
  negotiating: {
    label: 'Negotiating',
    color: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
  },
  closed_won: {
    label: 'Closed Won',
    color: 'bg-green-500/15 text-green-300 border-green-500/30',
    dot: 'bg-green-400',
  },
  closed_lost: {
    label: 'Closed Lost',
    color: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
  },
}

export const PRIORITY_CONFIG: Record<EnquiryPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  medium: { label: 'Medium', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  high: { label: 'High', color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  urgent: { label: 'Urgent', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
}

export const SOURCE_CONFIG: Record<
  EnquirySource,
  { label: string; color: string }
> = {
  contact: { label: 'Contact', color: 'bg-[#0066CC]/15 text-[#4A9EFF] border-[#0066CC]/30' },
  sponsorship: { label: 'Sponsorship', color: 'bg-[#D4A84B]/15 text-[#E8C87A] border-[#D4A84B]/30' },
  football: { label: 'Football', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  support: { label: 'Support', color: 'bg-[#E31E24]/15 text-[#FF6B6B] border-[#E31E24]/30' },
}

export const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'proposal_sent', label: 'Proposal Sent' },
  { key: 'negotiating', label: 'Negotiating' },
  { key: 'closed', label: 'Closed' },
] as const

export const ASSIGNEES = ['Ricardo B', 'Lisa M', 'James T', 'Admin'] // DEMO DATA — not live staff

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(value?: number) {
  if (value == null) return '—'
  return `$${value.toLocaleString('en-AU')}`
}

export function isClosed(status: EnquiryStatus) {
  return status === 'closed_won' || status === 'closed_lost'
}

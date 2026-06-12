// ---------------------------------------------------------------------------
// Sponsor billing directory + active contracts — extracted verbatim from the
// deployed OpsPortal bundle (`Qt` and `Dt` constants). Used by the Invoice
// Generator's "Create Invoice" and "From Contract" flows.
// ---------------------------------------------------------------------------

export interface SponsorContact {
  name: string
  company: string
  email: string
  address: string
  abn: string
  phone: string
}

export const SPONSOR_DIRECTORY: SponsorContact[] = [
  { name: 'Todd Van Kerkhof', company: 'Peppermill Inn', email: 'manager@peppermillinn.com.au', address: '7900 Goulburn Valley Hwy, Shepparton VIC 3630', abn: '', phone: '(03) 5823 1800' },
  { name: 'Daryl Gorman', company: 'Aussie Ag Supplies Pty Ltd', email: 'info@aussieagsupplies.com', address: '75 Gordon Drive, Kialla VIC 3631', abn: '', phone: '0428 235 000' },
  { name: 'Trent Merritt', company: 'Merritt Funeral Services', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Rocky Gagliardi', company: 'Gagliardi Scott Real Estate', email: 'rocky@gagliardiscott.com.au', address: '182 High St, Shepparton VIC 3630', abn: '', phone: '(03) 5831 1800' },
  { name: 'McNamara Real Estate', company: 'McNamara Real Estate', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Horizon Fresh Market', company: 'Horizon Fresh Market Pty Ltd', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Josephine Spencer', company: 'Goulburn Valley Football League', email: 'jo.spencer@afl.com.au', address: 'PO Box 1253, Shepparton VIC 3632', abn: '', phone: '03 5823 5021' },
  { name: 'Kyabram District Football League', company: 'Kyabram District Football League', email: '', address: 'Kyabram VIC 3620', abn: '', phone: '' },
  { name: 'Central Tyre Service', company: 'Central Tyre Service', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Positive Media', company: 'Positive Media', email: '', address: '', abn: '', phone: '' },
  { name: "Cleave's Garden Supplies", company: "Cleave's Garden Supplies", email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Emergency Medical Services', company: 'Emergency Medical Services', email: '', address: '', abn: '', phone: '' },
  { name: 'Goulburn Valley Woodworkers', company: 'Goulburn Valley Woodworkers', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Albury Antiques', company: 'Albury Antiques', email: '', address: 'Albury NSW 2640', abn: '', phone: '' },
  { name: 'Primary Care Connect', company: 'Primary Care Connect', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: "Jan's Beehive", company: "Jan's Beehive", email: '', address: '', abn: '', phone: '' },
  { name: 'MediaCOM', company: 'MediaCOM', email: '', address: '', abn: '', phone: '' },
  { name: 'Motacare Pty. Ltd.', company: 'Motacare Pty. Ltd.', email: '', address: '', abn: '', phone: '' },
  { name: 'Ian McDonald', company: 'Shepparton Harness Racing Club', email: 'shrc@sheppartonhrc.com.au', address: 'PO Box 395, Shepparton VIC 3630', abn: '', phone: '(03) 5823 1403' },
  { name: 'Keith McRae', company: 'McRae Demolitions', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'The Natural Approach', company: 'The Natural Approach Healing Centre', email: '', address: '', abn: '', phone: '' },
  { name: 'Ardmona Primary School', company: 'Ardmona Primary School', email: '', address: 'Ardmona VIC 3629', abn: '', phone: '' },
  { name: 'Macquarie Media', company: 'Macquarie Media Syndication', email: '', address: '', abn: '', phone: '' },
  { name: 'Yalca Plants', company: 'Yalca Plants & Poultry', email: '', address: 'Yalca VIC 3638', abn: '', phone: '' },
  { name: 'Kati Hogarth', company: 'Shepparton Art Museum (SAM)', email: 'khogarth@sheppartonartmuseum.com.au', address: '530 Wyndham Street, Shepparton VIC 3630', abn: '', phone: '03 4804 5016' },
  { name: 'Sissy Hoskin / Kelli', company: 'Go Nagambie', email: 'hello@gonagambie.com.au', address: 'Nagambie VIC 3608', abn: '', phone: '' },
  { name: 'Hannah Harmer', company: 'Rye Studio', email: 'hannah@ryestudio.com.au', address: '', abn: '', phone: '0488 517 566' },
  { name: 'Jason Aspland', company: "Jason's TV / Pest Control", email: 'jasonstv1@bigpond.com', address: 'Shepparton VIC 3630', abn: '', phone: '0403 688 666' },
  { name: 'Peter Foott / Lachlan Foott', company: 'FOOTT Waste Solutions', email: 'peter@foott.com.au', address: '', abn: '', phone: '' },
  { name: 'Andrew Skinner', company: 'Andrew Skinner', email: '', address: '', abn: '', phone: '' },
  { name: 'Bill Sharp', company: 'Bill Sharp', email: '', address: '', abn: '', phone: '' },
  { name: 'Craig Stott', company: 'Craig Stott', email: '', address: '', abn: '', phone: '' },
  { name: 'David Turkovic', company: 'David Turkovic', email: '', address: '', abn: '', phone: '' },
  { name: 'Donuts a Go Go', company: 'Donuts a Go Go', email: '', address: '', abn: '', phone: '' },
  { name: 'GV Pride Inc.', company: 'GV Pride Inc.', email: '', address: '', abn: '', phone: '' },
  { name: 'Jason Braun', company: 'Jason Braun', email: '', address: '', abn: '', phone: '' },
  { name: 'Jenny Wright', company: 'Jenny Wright', email: '', address: '', abn: '', phone: '' },
  { name: 'Josh Revens', company: 'Josh Revens', email: '', address: '', abn: '', phone: '' },
  { name: 'Kittle Bros.', company: 'Kittle Bros.', email: '', address: '', abn: '', phone: '' },
  { name: 'Kyabram & District Funeral Services', company: 'Kyabram & District Funeral Services', email: '', address: '', abn: '', phone: '' },
  { name: 'Kyle Power', company: 'Kyle Power', email: '', address: '', abn: '', phone: '' },
  { name: 'Mark Owens', company: 'Mark Owens', email: '', address: '', abn: '', phone: '' },
  { name: 'Mooroopna Country Music Club', company: 'Mooroopna Country Music Club', email: '', address: '', abn: '', phone: '' },
  { name: 'Nancy Halsall', company: 'Nancy Halsall', email: '', address: '', abn: '', phone: '' },
  { name: 'Patricia Lamont', company: 'Patricia Lamont', email: '', address: '', abn: '', phone: '' },
  { name: 'Paul Tricarico', company: 'Paul Tricarico', email: '', address: '', abn: '', phone: '' },
  { name: 'Pure Media Group Pty Ltd', company: 'Pure Media Group Pty Ltd', email: '', address: '', abn: '', phone: '' },
  { name: 'Ralph Whitehead', company: 'Ralph Whitehead', email: '', address: '', abn: '', phone: '' },
  { name: 'Roman Kozlovski', company: 'Roman Kozlovski', email: '', address: '', abn: '', phone: '' },
  { name: 'Seymour Football Club', company: 'Seymour Football Club', email: '', address: '', abn: '', phone: '' },
  { name: 'Solar City Country Music Club', company: 'Solar City Country Music Club', email: '', address: '', abn: '', phone: '' },
  { name: 'Steelwool Tavern', company: 'Steelwool Tavern', email: '', address: '', abn: '', phone: '' },
  { name: 'Susan Parnell', company: 'Susan Parnell', email: '', address: '', abn: '', phone: '' },
  { name: 'Violet Town Lions Club', company: 'Violet Town Lions Club', email: '', address: '', abn: '', phone: '' },
  { name: 'Winifred Fehring', company: 'Winifred Fehring', email: '', address: '', abn: '', phone: '' },
  { name: 'Ken Tuckett', company: 'Burkes Bakery', email: 'strathbogiebakingcompany@gmail.com', address: '67 Binney St, Euroa VIC 3666', abn: '', phone: '(03) 5795 2738' },
  { name: 'Sissy Hoskin', company: 'The Natural Approach Healing Centre', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Rohan', company: 'Pack and Stowe Storage', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'Shawn', company: 'Horizon Fresh Market Pty Ltd', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: 'William Adams', company: 'William Adams Ag / GV Ag', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Roadsafe Goulburn Valley', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Watters Electrical', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Seymour Football Club', email: '', address: 'Seymour VIC 3660', abn: '', phone: '' },
  { name: '', company: 'Kittle Bros.', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'COGS', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Donuts a Go Go', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Steelwool Tavern', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Mooroopna Country Music Club', email: '', address: 'Mooroopna VIC 3629', abn: '', phone: '' },
  { name: '', company: 'Solar City Country Music Club', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Violet Town Lions Club', email: '', address: 'Violet Town VIC 3669', abn: '', phone: '' },
  { name: 'Josh', company: 'SDP Tax', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'LEBA Ethnic Media', email: '', address: '', abn: '', phone: '' },
  { name: '', company: 'COGS', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
  { name: '', company: 'Donuts A Go Go', email: '', address: 'Shepparton VIC 3630', abn: '', phone: '' },
]

export type BillingFrequency = 'none' | 'monthly' | 'quarterly' | 'annually'

export interface SponsorContract {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  abn: string
  contractValue: number
  gst: number
  total: number
  period: string
  billingFrequency: BillingFrequency
  campaign: string
  startDate: string
  endDate: string
  industry: string
  schedule: string
}

export const ACTIVE_CONTRACTS: SponsorContract[] = [
  {
    id: 'contract_peppermill_001',
    companyName: 'Peppermill Inn',
    contactName: 'Todd Van Kerkhof',
    email: 'manager@peppermillinn.com.au',
    phone: '(03) 5823 1800',
    address: '7900 Goulburn Valley Hwy, Shepparton VIC 3630',
    abn: '',
    contractValue: 6760,
    gst: 676,
    total: 7436,
    period: '6 Months',
    billingFrequency: 'monthly',
    campaign: 'GVL 2026 MAJOR',
    startDate: '2026-03-31',
    endDate: '2026-09-30',
    industry: 'Hospitality',
    schedule: '4 x 30 sec spots across all dayparts (EM, B, M, L, D, LN)',
  },
  {
    id: 'contract_aussieag_001',
    companyName: 'Aussie Ag Supplies Pty Ltd',
    contactName: 'Daryl Gorman',
    email: 'info@aussieagsupplies.com',
    phone: '0428 235 000',
    address: '75 Gordon Drive, Kialla VIC 3631',
    abn: '',
    contractValue: 7300,
    gst: 730,
    total: 8030,
    period: '12 Months',
    billingFrequency: 'monthly',
    campaign: 'Parts & Wrecking (PDL)',
    startDate: '2025-09-24',
    endDate: '2026-09-24',
    industry: 'Agriculture',
    schedule: '30sec spots across all dayparts',
  },
  {
    id: 'contract_merritt_001',
    companyName: 'Merritt Funeral Services',
    contactName: 'Trent Merritt',
    email: '',
    phone: '',
    address: 'Shepparton VIC 3630',
    abn: '',
    contractValue: 4418,
    gst: 441.8,
    total: 4862,
    period: '12 Months',
    billingFrequency: 'monthly',
    campaign: 'LT Image',
    startDate: '2025-09-24',
    endDate: '2026-09-24',
    industry: 'Funeral Services',
    schedule: 'Monthly billing',
  },
  {
    id: 'contract_gagliardi_001',
    companyName: 'Gagliardi Scott Real Estate',
    contactName: 'Rocky Gagliardi',
    email: 'rocky@gagliardiscott.com.au',
    phone: '(03) 5831 1800',
    address: '182 High St, Shepparton VIC 3630',
    abn: '',
    contractValue: 6832,
    gst: 683.2,
    total: 7515.2,
    period: '6 Months',
    billingFrequency: 'monthly',
    campaign: 'GVL 2025',
    startDate: '2025-04-03',
    endDate: '2025-10-03',
    industry: 'Real Estate',
    schedule: 'Full GVL 2025 coverage',
  },
  {
    id: 'contract_gvfl_001',
    companyName: 'Goulburn Valley Football League',
    contactName: 'Josephine Spencer',
    email: 'jo.spencer@afl.com.au',
    phone: '03 5823 5021',
    address: 'PO Box 1253, Shepparton VIC 3632',
    abn: '',
    contractValue: 5000,
    gst: 500,
    total: 5500,
    period: '6 Months',
    billingFrequency: 'monthly',
    campaign: 'GVL Broadcast 2025',
    startDate: '2025-04-14',
    endDate: '2025-09-30',
    industry: 'Association',
    schedule: 'N/A production',
  },
  {
    id: 'contract_shrc_001',
    companyName: 'Shepparton Harness Racing Club',
    contactName: 'Ian McDonald',
    email: 'shrc@sheppartonhrc.com.au',
    phone: '(03) 5823 1403',
    address: 'PO Box 395, Shepparton VIC 3630',
    abn: '',
    contractValue: 1000,
    gst: 100,
    total: 1100,
    period: '2 Weeks',
    billingFrequency: 'none',
    campaign: 'Gold Cup JAN 2024 OB',
    startDate: '2023-01-03',
    endDate: '2024-01-15',
    industry: 'Club',
    schedule: '30sec/15sec spots across all dayparts',
  },
]

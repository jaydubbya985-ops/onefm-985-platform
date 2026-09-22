// ---------------------------------------------------------------------------
// ONE FM invoice data — extracted from the deployed OpsPortal bundle
// (deployed-reference/assets/OpsPortal-dIeH6Okr.js).
//
// GROUND TRUTH (Jay, 10 Sept 2026): BATCH_INVOICES — the whole June 2026 batch
// of 19 — was the real receivables list at the time it was drafted, not demo
// data. It contains real Goulburn Valley businesses, contacts and amounts.
//
// BATCH 2.0 (22 Sept 2026): batch re-issued 17 Sept 2026 (issue date rolled,
// due dates now 1 Oct 2026). FOOTT (inv-001) and Jason's TV (inv-002) marked
// PAID per Jason. GVFL settlement (inv-004) SET ASIDE — do not send. Added:
// KDL (020), CBF grants ×3 (021–023), Vision Australia (024), Bowls Victoria
// 25/26 + 26/27 (025–026), Jul–Sep 2026 catch-ups for Burkes/Cleave's/McRae
// (027–029), Oporto Shepparton (030) merged in from GitHub main's
// CURRENT_INVOICES — renumbered ONEFM-2026-040 because 030 = KDL in this
// batch. Oporto was never sent. Merritt Funeral Services Jul–Sep catch-up
// (031 / ONEFM-2026-041) added 22 Sep (Jason confirmed); Aussie Ag excluded
// (still paying). ALL INVOICES REMAIN DRAFT/UNSELECTED — nothing sends
// without Jason's manual selection and send command.
//
// REAL_INVOICE_NUMBERS still gates live Supabase seeding to FOOTT + Jason's TV
// + Oporto only. Expanding it to the full batch is a deliberate Phase 2 step,
// taken with Jay after per-invoice status is confirmed — not before.
//
// STILL FICTIONAL: BILLING_INVOICES (the INV-2026-xxx ledger), PAYMENT_RECORDS,
// and their derived stats. These contradict the real batch (same businesses,
// different numbers/amounts) and are slated for replacement in Phase 2.
// ---------------------------------------------------------------------------

/**
 * GVL Match of the Day hours — source: FULL_SCHEDULE in programGuide.ts
 * (Saturday 13:00–15:00). Same shape as formatGuideHours(). This file is
 * imported by Node’s verify-ops-config, so it cannot use `@/` aliases.
 */
const GVL_MATCH_HOURS = 'Sat 1PM–3PM'

export type BatchInvoiceStatus = 'draft' | 'previewed' | 'tested' | 'sent' | 'paid'

export interface BatchInvoice {
  id: string
  number: string
  company: string
  contactName: string
  email: string
  amountExclGst: number
  gst: number
  total: number
  description: string
  period: string
  dueDate: string
  story?: string
  emailSubject: string
  emailBody: string
  status: BatchInvoiceStatus
  selected?: boolean
  notes?: string
  createdAt?: string
}

/**
 * Batch issue date — originally created 9 June 2026; RE-ISSUED 17 September
 * 2026 as the final send batch (Batch 2.0). Due date auto-rolls to 1 Oct 2026.
 */
export const BATCH_ISSUE_DATE = '2026-09-17'

/** Batch due date — issue date + 14 days (matches the bundle's `Je` constant). */
export const BATCH_DUE_DATE = (() => {
  const d = new Date(BATCH_ISSUE_DATE)
  d.setDate(d.getDate() + 14)
  return d.toISOString().split('T')[0]
})()

export const DEFAULT_EMAIL_BODY =
  'Thank you for your partnership with ONE FM 98.5. Your support keeps community radio alive in the Goulburn Valley.'

/**
 * Personalised thank-you messages keyed by invoice id (the `Gi` map in the
 * deployed bundle). Used as the custom message inside the branded HTML email.
 */
export const INVOICE_THANK_YOU_MESSAGES: Record<string, string> = {
  'inv-001':
    "Welcome aboard, Peter — it's bloody great to have FOOTT Waste Solutions on the ONE FM team! Your support over the next six months is going to make a real difference to the Goulburn Valley community. We're proud to have a local heavyweight like FOOTT backing community radio.",
  'inv-002':
    "Jason, you're a legend — another year of keeping us on air with Jason's TV. Twelve months of support from a true local business means the world to us and our listeners across the Valley. Cheers for sticking with ONE FM, mate.",
  'inv-003':
    "Rocky, Gagliardi Scott's backing of local sport and community radio is what makes this region special. Your full GVL 2026 sponsorship helps us bring the footy to every home and keep local stories alive. Thanks for being such a massive part of the Goulburn Valley, Rocky.",
  'inv-004':
    `Josephine, the Goulburn Valley Football League and ONE FM go together like pie and sauce at the footy. Broadcasting the league is at the heart of everything we do, and your partnership makes it possible for families right across the region to tune in for GVL Match of the Day (${GVL_MATCH_HOURS}). Here's to another cracking season together!`,
  'inv-005':
    "Todd, having the Peppermill Inn as a major GVL sponsor is an absolute ripper for us! The Peppermill's been a community landmark for years, and now you're helping keep local radio thriving too. Cheers for stepping up — our listeners love hearing your name on air.",
  'inv-006':
    "G'day Daniel — just a friendly nudge about the outstanding balance on your Positive Media sponsorship. We know things get busy, so if you could sort this when you get a chance we'd really appreciate it. Your support keeps local radio kicking along in the Valley, mate.",
  'inv-007':
    'Keith, McRae Demolitions has been a rock-solid supporter of ONE FM for years and it never goes unnoticed. Your sponsorship through to mid-2026 gives us the stability to keep bringing local news, sport and music to the Goulburn Valley. Legend — plain and simple.',
  'inv-008':
    "Cleave, your garden supplies keep Shepparton looking beautiful, and your sponsorship keeps ONE FM sounding great! Really appreciate you backing us through to the middle of next year — local businesses like yours are the backbone of community radio. Thanks for being in our corner, mate.",
  'inv-009':
    "Ken, nothing beats the smell of fresh bread from Burkes Bakery — and nothing beats having you on board as a ONE FM sponsor! Whether it's Burkes or Strathbogie Baking Company, your support helps us serve the Goulburn Valley community every single day. Cheers for backing local, Ken.",
  'inv-010':
    "Kati, that stunning new $50 million SAM building is a game-changer for Shepparton, and we're stoked to partner with you for the full year ahead. A media partnership between SAM and ONE FM is a perfect match — art, culture and community radio all under one roof. Can't wait to showcase everything SAM has to offer!",
  'inv-011':
    "Hi Sissy — just touching base on the catch-up payment for Natural Approach Healing Centre's sponsorship through to mid-2026. We know you're juggling both Natural Approach and Go Nagambie, so no pressure, just let us know if you need to chat through anything. Your support means the world to keeping community radio alive in the Valley!",
  'inv-012':
    "Your work connecting multicultural communities across the region is so important, and we're proud to have partnered with LEBA on those campaigns. Thanks for helping us reach every corner of the Goulburn Valley — diversity is what makes this place special. Looking forward to more great work together.",
  'inv-013':
    "Hannah, Careers Day Out is such a brilliant initiative for young people in our region, and we're pumped to be doing the live outside broadcast with you and Rye Studio! Giving kids a look at their future options is what community radio's all about. Thanks for bringing us along for the ride.",
  'inv-014':
    "Trent, we know Merritt Funeral Services supports families through the toughest of times, and we're honoured to have your trust as a ONE FM sponsor. Your selected months of support across the year help us maintain the gentle, respectful presence our community relies on. Thank you for your ongoing partnership, Trent — it truly means a lot.",
  'inv-015':
    "Sissy, the On Water Festival is shaping up to be an absolute cracker for 2026! Go Nagambie does an amazing job putting the region on the map, and we're rapt to help spread the word across the airwaves. Thanks for keeping us in the loop — Nagambie's going to be buzzing!",
  'inv-016':
    "Great to have COGS locked in as a confirmed sponsor for another year! Your organisation does such important work for the Goulburn Shepparton community, and having you in our corner makes a real difference. Here's to another solid year of partnership ahead.",
  'inv-017':
    'Ian, the Gold Cup is always a highlight on the Shepparton calendar and we loved bringing the outside broadcast to life! Just a quick reminder about the remaining balance on the January 2024 invoice — whenever you get a chance, mate. Cheers for keeping harness racing front and centre in the Valley.',
  'inv-018':
    "The team at Primary Care Connect does incredible work supporting health and wellbeing in our community, and we're proud to have you as a ONE FM sponsor. Just a gentle reminder about the outstanding invoice — please reach out if you need to discuss payment options. We'd love to keep this partnership going strong.",
  'inv-019':
    "Hey team — just a quick heads up about a small remaining balance on your Donuts A Go Go sponsorship. We know it's not much, but every bit helps keep ONE FM running for the Goulburn Valley! Drop us a line when you get a chance, and thanks for being part of the ONE FM family.",
  'inv-020':
    "The Kyabram District League and ONE FM are keeping local footy on the air together — thank you for backing community broadcasting for Season 2026! This invoice covers the KDL 2026 season broadcast sponsorship. We can't wait to bring every mark, goal and grand final moment to the region again this year.",
  'inv-021':
    'Please find attached our tax invoice for Instalment 1 of our 2026/27 Development & Operations grant (D&O-02457), together with the signed grant agreement. These funds keep three part-time station roles on air — thank you for backing community broadcasting in the Goulburn Valley.',
  'inv-022':
    'Please find attached our tax invoice for Instalment 1 of our 2026/27 Specialist Radio Programming grant (SRP-01802), together with the signed grant agreement. This funding keeps 8 hours of Ethnic programming and 1 hour of First Nations programming on air every week — thank you.',
  'inv-023':
    "Please find attached our tax invoice for Instalment 1 of our 2026/27 Content grant (C-02270), together with the signed grant agreement. 'Regional Voice' will bring the stories of all five shires to air every weekday — thank you for making it possible.",
  'inv-024':
    'Thank you Vision Australia for continuing to host your transmission equipment at our Mount Major site. This invoice covers site rental for the six-month term July – December 2026. We apologise for the delayed invoice following our system rebuild — the next six-month invoice will follow in January 2027 as per our agreement.',
  'inv-025':
    'Thank you Bowls Victoria for partnering with ONE FM on the Bowls Podcast for the 2025/26 season. This invoice covers the season sponsorship ($1,000 + GST). It has been a pleasure bringing bowls coverage to the region — and with the 2026/27 season now starting up, a separate invoice for the new season accompanies this one.',
  'inv-026':
    'Thank you Bowls Victoria for continuing the Bowls Podcast partnership into the 2026/27 season. This invoice covers the new season sponsorship ($1,000 + GST). We look forward to another great season of bowls on air together.',
  'inv-027':
    "Hi Ken, this invoice covers your sponsorship for July, August and September 2026 — your ads continued to air through the quarter while we rebuilt our invoicing system, and our apologies for the delay. Thank you for your ongoing support of community radio!",
  'inv-028':
    "Hi Cleave, this invoice covers your sponsorship for July, August and September 2026 — your sponsorship continued on air through the quarter while we rebuilt our invoicing system. Our apologies for the delay, and thank you for sticking with us.",
  'inv-029':
    "Hi Keith, this invoice covers your sponsorship for July, August and September 2026 — your sponsorship continued on air through the quarter while we rebuilt our invoicing system. Our apologies for the delay, and thank you for your long-term support of ONE FM.",
  'inv-030':
    'Hi Bishoy, thank you for partnering with ONE FM 98.5 for the 2026 Football Finals! The Best Player award activation, post-game interviews and your 30-second spots across the finals series put Oporto Shepparton right at the heart of local footy. We appreciate your support of community radio and look forward to working with you again.',
  'inv-031':
    "Hi Trent, this invoice covers your sponsorship for July, August and September 2026 — your sponsorship continued on air through the quarter while we rebuilt our invoicing system. Our apologies for the delay, and thank you for your continued trust in ONE FM 98.5.",
}

/** Personal thank-you message for an invoice (bundle's `Ke(id)` helper). */
export function getInvoiceEmailBody(id: string): string {
  return INVOICE_THANK_YOU_MESSAGES[id] ?? DEFAULT_EMAIL_BODY
}

/**
 * Operational email bodies keyed by invoice id (the `Ye`/`We` map in the
 * deployed bundle). These are the more matter-of-fact descriptions used as the
 * default `emailBody` when seeding the batch.
 */
export const INVOICE_OPERATIONAL_MESSAGES: Record<string, string> = {
  'inv-001':
    "Welcome to the ONE FM 98.5 family! We're thrilled to partner with FOOTT Waste Solutions over the next 6 months. Your support helps us deliver quality community radio to the Goulburn Valley. This invoice covers your Community Partnership & Sponsorship Package from June through November 2026. We look forward to showcasing your business across our programming!",
  'inv-002':
    'Hi Jason, as discussed this is the consolidated 12-month Clean Slate Sponsorship invoice covering June 2025 through June 2026. LT Image has been a fantastic supporter of community radio and we truly appreciate your continued partnership. This single invoice replaces any previous outstanding amounts to keep everything clean and simple.',
  'inv-003':
    "Hi Rocky, here's the GVL 2026 Full Sponsorship Agreement invoice. Gagliardi Scott Real Estate has been instrumental in supporting our local football coverage and we're excited to have you on board again for the full year. Your branding will be prominent across all GVL broadcasts.",
  'inv-004':
    "Hi Jo, this invoice settles the remaining balance for the GVL 2025 broadcast season. Thank you for your continued trust in ONE FM 98.5 to deliver professional coverage of the Goulburn Valley Football League. It's been another great season!",
  'inv-005':
    "Hi Todd, this invoice covers the final 2025 payment plus April/May/June 2026 as part of your GVL 2026 MAJOR sponsorship. Peppermill Inn continues to be one of our most valued partners and we're proud to promote your venue across the region.",
  'inv-006':
    "Hi Daniel, this invoice is for the outstanding balance on your account. We understand things get busy and we'd love to get this sorted. Please reach out if you need to discuss a payment plan or have any questions about the campaigns delivered.",
  'inv-007':
    "Hi Keith, here's your sponsorship invoice covering November 2025 through June 2026. McRae Demolitions has been a loyal supporter and we really appreciate your long-term commitment to community radio in the Goulburn Valley.",
  'inv-008':
    'Hi Cleave, this invoice was previously drafted but not sent due to a system issue — our apologies for the delay! This covers your sponsorship from November 2025 through June 2026. Thank you for your patience and continued support of ONE FM 98.5.',
  'inv-009':
    "Hi Ken, this invoice covers your sponsorship from December 2025 through June 2026. Burkes Bakery is a much-loved local business and we're proud to have you as a sponsor. Thank you for supporting community radio!",
  'inv-010':
    "Hi Kati, we're delighted to continue our media partnership with SAM for 2026/27. This full-year partnership ensures the Shepparton Art Museum receives extensive promotion across our programming. Thank you for being such an important cultural partner!",
  'inv-011':
    'Hi Sissy, this catch-up invoice covers October 2025 through June 2026 for Natural Approach Healing Centre. We appreciate your patience while we got this sorted and look forward to continuing to promote your services.',
  'inv-012':
    'This invoice covers historical campaigns that were delivered for LEBA Ethnic Media. Thank you for your patience while we reconciled these deliveries. We value our partnership with ethnic media outlets across the region.',
  'inv-013':
    'Hi Hannah, what a fantastic Careers Day Out 2026! This invoice covers the live outside broadcast we delivered on the day. The event was a huge success and the live coverage really brought the energy to our listeners. Looking forward to next year!',
  'inv-014':
    "Hi Trent, this invoice covers your selected months sponsorship package (Nov/Dec/May/Jun). Merritt Funeral Services is a respected community business and we're honoured to have your support for ONE FM 98.5.",
  'inv-015':
    'Hi there, this invoice covers the Go Nagambie On Water Festival 2026 sponsorship. What an incredible event! The festival brings so much to the region and we were thrilled to be part of promoting it. Thank you for your partnership!',
  'inv-016':
    "This invoice is for the confirmed PO from COGS. We're pleased to deliver this campaign and appreciate your organisation's support for community broadcasting in the Goulburn Valley.",
  'inv-017':
    "Hi Ian, this invoice covers the Gold Cup live outside broadcast from January 2024. The Shepparton Harness Racing Club Gold Cup is always a highlight and we're proud to have delivered live coverage of this fantastic event.",
  'inv-018':
    'This is a reissue of a previously invoiced amount that remains unpaid. We understand oversights happen — please let us know if you need any clarification or would like to arrange a payment plan.',
  'inv-019':
    "Hi there, this is a friendly reminder about a small outstanding balance. No amount is too small and every dollar helps keep community radio alive in the Goulburn Valley! Thank you for your support.",
  'inv-020':
    'This invoice covers the Kyabram District League broadcast sponsorship for Season 2026 — live coverage of KDL football across the season. Please find the tax invoice attached; payment terms are 14 days.',
  'inv-021':
    'Tax invoice for Instalment 1 ($21,164 + GST) of grant D&O-02457 (2026/27 Development & Operations). Signed agreement attached. Per the agreement, payment is due within 30 days of receipt of the signed agreement and this invoice. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-022':
    'Tax invoice for Instalment 1 ($17,680 + GST) of grant SRP-01802 (2026/27 Specialist Radio Programming). Signed agreement attached. Per the agreement, payment is due within 30 days of receipt of the signed agreement and this invoice. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-023':
    'Tax invoice for Instalment 1 ($8,090 + GST) of grant C-02270 (2026/27 Content). Signed agreement attached. Per the agreement, payment is due within 30 days of receipt of the signed agreement and this invoice. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-024':
    'Tax invoice for Mount Major site rental — six-month term July to December 2026 ($7,000 + GST). This invoice was due to send in July 2026 and was delayed by our system rebuild; our apologies. The following six-month term (January – June 2027) will be invoiced in January 2027.',
  'inv-025':
    'Tax invoice for Bowls Podcast sponsorship — 2025/26 season ($1,000 + GST = $1,100). Please find the tax invoice attached; payment terms are 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-026':
    'Tax invoice for Bowls Podcast sponsorship — 2026/27 season ($1,000 + GST = $1,100). Please find the tax invoice attached; payment terms are 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-027':
    'Tax invoice for sponsorship July–September 2026 (3 months × $400 + GST = $1,320). Payment terms 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-028':
    'Tax invoice for sponsorship July–September 2026 (3 months × $541.66 + GST = $1,787.48). Payment terms 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-029':
    'Tax invoice for sponsorship July–September 2026 (3 months × $541.66 + GST = $1,787.48). Payment terms 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-030':
    'Tax invoice for 2026 Football Finals Partnership — Best Player award activation (on-air mentions, post-game interview, voucher presentation, social extension) plus 120 × 30-second spots, ad production included ($2,000 + GST = $2,200). Payment terms 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
  'inv-031':
    'Tax invoice for sponsorship July–September 2026 (3 months × $368.34 + GST = $1,215.52). Payment terms 14 days. Bank: 98.5 One FM, NAB, BSB 083-894, Account 553 219 432.',
}

/** Operational email body for an invoice (bundle's `Ye(id)`/`We(id)` helper). */
export function getOperationalEmailBody(id: string): string {
  return INVOICE_OPERATIONAL_MESSAGES[id] ?? DEFAULT_EMAIL_BODY
}

const due = BATCH_DUE_DATE

/**
 * The June 2026 invoice batch — all 19 records extracted verbatim from the
 * bundle's `mp` array (seed data also mirrored in its `ni()` store seed).
 */
export const BATCH_INVOICES: BatchInvoice[] = [
  {
    id: 'inv-001',
    number: 'ONEFM-2026-011',
    company: 'FOOTT Waste Solutions',
    contactName: 'Peter Foott',
    email: 'peter@foott.com.au',
    amountExclGst: 5000,
    gst: 500,
    total: 5500,
    description:
      'FOOTT Waste Solutions – Community Partnership & Sponsorship Package (Jun–Nov 2026)',
    period: 'Jun 2026 – Nov 2026',
    dueDate: due,
    story: 'New major community partner for 6 months',
    emailSubject: 'Your ONE FM 98.5 Community Partnership Invoice – Welcome Aboard!',
    emailBody: getInvoiceEmailBody('inv-001'),
    status: 'paid',
    selected: false,
    notes:
      'PAID – money received (reported by Jason 17 Sep 2026). Verify amount against bank statement; if partial, record balance.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-002',
    number: 'ONEFM-2026-012',
    company: "Jason's TV Pty Ltd",
    contactName: 'Jason Aspland',
    email: 'jasonstv1@bigpond.com',
    amountExclGst: 7800,
    gst: 780,
    total: 8580,
    description: 'LT Image – 12 Month Clean Slate Sponsorship (Jun 2025–Jun 2026)',
    period: 'Jun 2025 – Jun 2026',
    dueDate: due,
    story: 'Clean slate 12-month consolidation invoice',
    emailSubject: 'Clean Slate Invoice – 12 Month Sponsorship Consolidation',
    emailBody: getInvoiceEmailBody('inv-002'),
    status: 'paid',
    selected: false,
    notes:
      'PAID – money received (reported by Jason 17 Sep 2026). Verify amount against bank statement; if partial, record balance.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-003',
    number: 'ONEFM-2026-013',
    company: 'Gagliardi Scott Real Estate',
    contactName: 'Rocky Gagliardi',
    email: 'rocky@gagliardiscott.com.au',
    amountExclGst: 6832,
    gst: 683.2,
    total: 7515.2,
    description: 'GVL 2026 – Full Sponsorship Agreement',
    period: 'Full Year 2026',
    dueDate: due,
    story: 'Major real estate partner for GVL coverage',
    emailSubject: 'GVL 2026 Full Sponsorship – Invoice',
    emailBody: getInvoiceEmailBody('inv-003'),
    status: 'draft',
    selected: false,
    notes:
      'GVL major sponsor – high priority. Contract 012-00781-0001 (GVL 2026) EXPIRES 30 Sep 2026 – send before expiry; renewal decision needed.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-004',
    number: 'ONEFM-2026-014',
    company: 'Goulburn Valley Football League',
    contactName: 'Josephine Spencer',
    email: 'jo.spencer@afl.com.au',
    amountExclGst: 5000,
    gst: 500,
    total: 5500,
    description: 'GVL Broadcast 2025 – Settlement',
    period: '2025 Settlement',
    dueDate: due,
    story: 'Settlement for 2025 broadcast season',
    emailSubject: 'GVL 2025 Broadcast Settlement – Final Invoice',
    emailBody: getInvoiceEmailBody('inv-004'),
    status: 'draft',
    selected: false,
    notes:
      'SET ASIDE 17 Sep 2026 (Jason) – GVFL $10k not expected now, possibly ever. DO NOT SEND. Excluded from collectable totals; retained for records/debt review.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-005',
    number: 'ONEFM-2026-015',
    company: 'Peppermill Inn',
    contactName: 'Todd Van Kerkhof',
    email: 'manager@peppermillinn.com.au',
    amountExclGst: 4506.64,
    gst: 450.66,
    total: 4957.3,
    description: 'Final 2025 Payment + Apr/May/Jun 2026 – GVL 2026 MAJOR',
    period: 'Apr 2026 – Jun 2026',
    dueDate: due,
    story: 'Major sponsor with carry-forward balance',
    emailSubject: 'Peppermill Inn – GVL 2026 Major Sponsorship Invoice',
    emailBody: getInvoiceEmailBody('inv-005'),
    status: 'draft',
    selected: false,
    notes:
      'Major sponsor – carry forward balance included. Contract 012-00782-0001 (GVL 2026 MAJOR) EXPIRES 30 Sep 2026 – send before expiry; renewal decision needed.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-006',
    number: 'ONEFM-2026-016',
    company: 'Positive Media',
    contactName: 'Daniel',
    email: '',
    amountExclGst: 4501,
    gst: 450.1,
    total: 4951.1,
    description: 'Outstanding Balance',
    period: 'Outstanding',
    dueDate: due,
    story: 'Historical outstanding balance recovery',
    emailSubject: 'Positive Media – Outstanding Balance Invoice',
    emailBody: getInvoiceEmailBody('inv-006'),
    status: 'draft',
    selected: false,
    notes: 'Outstanding balance – needs follow-up',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-007',
    number: 'ONEFM-2026-017',
    company: 'McRae Demolitions',
    contactName: 'Keith McRae',
    email: '',
    amountExclGst: 4333.28,
    gst: 433.33,
    total: 4766.61,
    description: 'Nov 2025–Jun 2026 Sponsorship',
    period: 'Nov 2025 – Jun 2026',
    dueDate: due,
    story: '8-month sponsorship package',
    emailSubject: 'McRae Demolitions – Sponsorship Invoice',
    emailBody: getInvoiceEmailBody('inv-007'),
    status: 'draft',
    selected: false,
    notes: '8-month package – loyal long-term sponsor',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-008',
    number: 'ONEFM-2026-018',
    company: "Cleave's Garden Supplies",
    contactName: 'Cleave',
    email: '',
    amountExclGst: 4333.28,
    gst: 433.33,
    total: 4766.61,
    description: 'Nov 2025–Jun 2026 – Draft/Previously Unsent',
    period: 'Nov 2025 – Jun 2026',
    dueDate: due,
    story: 'Previously drafted but never sent',
    emailSubject: "Cleave's Garden Supplies – Sponsorship Invoice",
    emailBody: getInvoiceEmailBody('inv-008'),
    status: 'draft',
    selected: false,
    notes:
      'Previously unsent – system migration issue. Contract 011-00018-0001 (Annual Image) expires 17 Oct 2026.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-009',
    number: 'ONEFM-2026-019',
    company: 'Burkes Bakery',
    contactName: 'Ken Tuckett',
    email: 'strathbogiebakingcompany@gmail.com',
    amountExclGst: 2800,
    gst: 280,
    total: 3080,
    description: 'Dec 2025–Jun 2026 – Draft/Previously Unsent',
    period: 'Dec 2025 – Jun 2026',
    dueDate: due,
    story: '7-month sponsorship, previously unsent',
    emailSubject: 'Burkes Bakery – Sponsorship Invoice',
    emailBody: getInvoiceEmailBody('inv-009'),
    status: 'draft',
    selected: false,
    notes:
      'Previously unsent – local business. Contract 011-00780-0001 (OB 12 Months Image) expires 18 Oct 2026.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-010',
    number: 'ONEFM-2026-020',
    company: 'SAM (Shepparton Art Museum)',
    contactName: 'Kati Hogarth',
    email: 'khogarth@sheppartonartmuseum.com.au',
    amountExclGst: 2400,
    gst: 240,
    total: 2640,
    description: 'Full-Year Media Partnership (Jun 2026–May 2027)',
    period: 'Jun 2026 – May 2027',
    dueDate: due,
    story: '12-month media partnership with SAM',
    emailSubject: 'SAM Media Partnership 2026/27 – Invoice',
    emailBody: getInvoiceEmailBody('inv-010'),
    status: 'draft',
    selected: false,
    notes: 'Cultural institution – important community partner',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-011',
    number: 'ONEFM-2026-021',
    company: 'Natural Approach Healing Centre',
    contactName: 'Sissy Hoskin',
    email: '',
    amountExclGst: 1773,
    gst: 177.3,
    total: 1950.3,
    description: 'Oct 2025–Jun 2026 Catch-Up',
    period: 'Oct 2025 – Jun 2026',
    dueDate: due,
    story: 'Catch-up invoice for 9 months',
    emailSubject: 'Natural Approach Healing Centre – Catch-Up Invoice',
    emailBody: getInvoiceEmailBody('inv-011'),
    status: 'draft',
    selected: false,
    notes: 'Catch-up – 9 months',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-012',
    number: 'ONEFM-2026-022',
    company: 'LEBA Ethnic Media',
    contactName: '',
    email: '',
    amountExclGst: 1650,
    gst: 165,
    total: 1815,
    description: 'Historical Campaigns Delivered',
    period: 'Historical',
    dueDate: due,
    story: 'Historical campaigns now being invoiced',
    emailSubject: 'LEBA Ethnic Media – Campaign Invoice',
    emailBody: getInvoiceEmailBody('inv-012'),
    status: 'draft',
    selected: false,
    notes: 'Historical – campaigns delivered',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-013',
    number: 'ONEFM-2026-023',
    company: 'Careers Day Out / Rye Studio',
    contactName: 'Hannah Harmer',
    email: 'hannah@ryestudio.com.au',
    amountExclGst: 1650,
    gst: 165,
    total: 1815,
    description: 'Careers Day Out 2026 – Live Outside Broadcast',
    period: 'Careers Day Out 2026',
    dueDate: due,
    story: 'Live OB coverage for Careers Day Out',
    emailSubject: 'Careers Day Out 2026 – Live Broadcast Invoice',
    emailBody: getInvoiceEmailBody('inv-013'),
    status: 'draft',
    selected: false,
    notes: 'Event broadcast – successful live OB',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-014',
    number: 'ONEFM-2026-024',
    company: 'Merritt Funeral Services',
    contactName: 'Trent Merritt',
    email: '',
    amountExclGst: 1473.36,
    gst: 147.34,
    total: 1620.7,
    description: 'Nov/Dec/May/Jun Selected Months',
    period: 'Selected Months',
    dueDate: due,
    story: 'Selected months sponsorship package',
    emailSubject: 'Merritt Funeral Services – Sponsorship Invoice',
    emailBody: getInvoiceEmailBody('inv-014'),
    status: 'draft',
    selected: false,
    notes:
      'Selected months – respected community business. Contract 010-00139-0001 (LT Image) EXPIRES 25 Sep 2026 – send before expiry.',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-015',
    number: 'ONEFM-2026-025',
    company: 'Go Nagambie',
    contactName: 'Sissy Hoskin',
    email: 'hello@gonagambie.com.au',
    amountExclGst: 1200,
    gst: 120,
    total: 1320,
    description: 'GO Nagambie On Water Festival 2026',
    period: 'On Water Festival 2026',
    dueDate: due,
    story: 'Major event sponsorship',
    emailSubject: 'Go Nagambie On Water Festival 2026 – Invoice',
    emailBody: getInvoiceEmailBody('inv-015'),
    status: 'draft',
    selected: false,
    notes: 'Major regional event – great exposure',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-016',
    number: 'ONEFM-2026-026',
    company: 'COGS',
    contactName: '',
    email: '',
    amountExclGst: 1100,
    gst: 110,
    total: 1210,
    description: 'PO Confirmed',
    period: 'PO Confirmed',
    dueDate: due,
    story: 'Confirmed PO now being invoiced',
    emailSubject: 'COGS – Invoice for Confirmed PO',
    emailBody: getInvoiceEmailBody('inv-016'),
    status: 'draft',
    selected: false,
    notes: 'PO confirmed – corporate client',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-017',
    number: 'ONEFM-2026-027',
    company: 'Shepparton Harness Racing Club',
    contactName: 'Ian McDonald',
    email: 'shrc@sheppartonhrc.com.au',
    amountExclGst: 1000,
    gst: 100,
    total: 1100,
    description: 'Gold Cup OB (Jan 2024)',
    period: 'Jan 2024',
    dueDate: due,
    story: 'Gold Cup live broadcast from Jan 2024',
    emailSubject: 'Shepparton Harness Racing Club – Gold Cup Invoice',
    emailBody: getInvoiceEmailBody('inv-017'),
    status: 'draft',
    selected: false,
    notes: 'Historical event – Gold Cup live OB',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-018',
    number: 'ONEFM-2026-028',
    company: 'Primary Care Connect',
    contactName: '',
    email: '',
    amountExclGst: 900,
    gst: 90,
    total: 990,
    description: 'Previously Invoiced, Unpaid',
    period: 'Outstanding',
    dueDate: due,
    story: 'Previously invoiced amount still outstanding',
    emailSubject: 'Primary Care Connect – Outstanding Invoice Reminder',
    emailBody: getInvoiceEmailBody('inv-018'),
    status: 'draft',
    selected: false,
    notes: 'Reissue – previously unpaid',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-019',
    number: 'ONEFM-2026-029',
    company: 'Donuts A Go Go',
    contactName: '',
    email: '',
    amountExclGst: 99.98,
    gst: 10,
    total: 109.98,
    description: 'Small Outstanding Balance',
    period: 'Outstanding',
    dueDate: due,
    story: 'Small outstanding balance',
    emailSubject: 'Donuts A Go Go – Small Outstanding Balance',
    emailBody: getInvoiceEmailBody('inv-019'),
    status: 'draft',
    selected: false,
    notes: 'Small balance – friendly follow-up',
    createdAt: BATCH_ISSUE_DATE,
  },
  {
    id: 'inv-020',
    number: 'ONEFM-2026-030',
    company: 'Kyabram District League',
    contactName: '',
    email: '',
    amountExclGst: 4000,
    gst: 400,
    total: 4400,
    description: 'KDL Broadcast Season 2026 – Sponsorship',
    period: 'Season 2026',
    dueDate: '2026-10-01',
    story: 'KDL Season 2026 broadcast partnership',
    emailSubject: 'KDL Season 2026 Broadcast Sponsorship – Invoice',
    emailBody: getInvoiceEmailBody('inv-020'),
    status: 'draft',
    selected: false,
    notes: 'Added 22 Jul 2026 – needs contact name + email',
    createdAt: '2026-07-22',
  },
  {
    id: 'inv-021',
    number: 'ONEFM-2026-031',
    company: 'Community Broadcasting Foundation',
    contactName: 'CBF Grants Team',
    email: '',
    amountExclGst: 21164,
    gst: 2116.4,
    total: 23280.4,
    description: 'CBF Development & Operations Grant (D&O-02457) – Instalment 1, 2026/27',
    period: '2026/27 R1',
    dueDate: '2026-10-01',
    story: 'D&O grant instalment 1 – salaries: Specialist Programs Coordinator, IT/Scheduling, On Demand/Training',
    emailSubject: 'Tax Invoice – CBF Grant D&O-02457 Instalment 1 (signed agreement attached)',
    emailBody: getInvoiceEmailBody('inv-021'),
    status: 'draft',
    selected: false,
    notes: 'REQUIRES: signed agreement (two officers) + submit via SmartyGrants. CBF pays within 30 days of receipt.',
    createdAt: '2026-07-22',
  },
  {
    id: 'inv-022',
    number: 'ONEFM-2026-032',
    company: 'Community Broadcasting Foundation',
    contactName: 'CBF Grants Team',
    email: '',
    amountExclGst: 17680,
    gst: 1768,
    total: 19448,
    description: 'CBF Specialist Radio Programming Grant (SRP-01802) – Instalment 1, 2026/27',
    period: '2026/27 R1',
    dueDate: '2026-10-01',
    story: 'SRP grant instalment 1 – 8 hrs/wk Ethnic + 1 hr/wk First Nations programming',
    emailSubject: 'Tax Invoice – CBF Grant SRP-01802 Instalment 1 (signed agreement attached)',
    emailBody: getInvoiceEmailBody('inv-022'),
    status: 'draft',
    selected: false,
    notes: 'REQUIRES: signed agreement (two officers) + submit via SmartyGrants. CBF pays within 30 days of receipt.',
    createdAt: '2026-07-22',
  },
  {
    id: 'inv-023',
    number: 'ONEFM-2026-033',
    company: 'Community Broadcasting Foundation',
    contactName: 'CBF Grants Team',
    email: '',
    amountExclGst: 8090,
    gst: 809,
    total: 8899,
    description: "CBF Content Grant (C-02270) – Instalment 1, 2026/27 'Regional Voice'",
    period: '2026/27 R1',
    dueDate: '2026-10-01',
    story: "Content grant instalment 1 – 'Regional Voice' weekday 30-min public interest program, 5 shires",
    emailSubject: 'Tax Invoice – CBF Grant C-02270 Instalment 1 (signed agreement attached)',
    emailBody: getInvoiceEmailBody('inv-023'),
    status: 'draft',
    selected: false,
    notes: 'REQUIRES: signed agreement (two officers) + submit via SmartyGrants. CBF pays within 30 days of receipt.',
    createdAt: '2026-07-22',
  },
  {
    id: 'inv-024',
    number: 'ONEFM-2026-034',
    company: 'Vision Australia',
    contactName: '',
    email: '',
    amountExclGst: 7000,
    gst: 700,
    total: 7700,
    description: 'Mount Major Site Rental – 6 Month Term (Jul–Dec 2026)',
    period: 'Jul 2026 – Dec 2026',
    dueDate: '2026-10-01',
    story: 'Mount Major transmission site rental – recurring 6-monthly',
    emailSubject: 'Mount Major Site Rental Invoice – Jul–Dec 2026 Term',
    emailBody: getInvoiceEmailBody('inv-024'),
    status: 'draft',
    selected: false,
    notes:
      'Added 17 Sep 2026 – due to send July, delayed by system rebuild. RECURRING: next 6-month invoice (Jan–Jun 2027) due January 2027. Needs contact name + email.',
    createdAt: '2026-09-17',
  },
  {
    id: 'inv-025',
    number: 'ONEFM-2026-035',
    company: 'Bowls Victoria',
    contactName: '',
    email: '',
    amountExclGst: 1000,
    gst: 100,
    total: 1100,
    description: 'Bowls Podcast Sponsorship – Season 2025/26',
    period: '2025/26 season',
    dueDate: '2026-10-01',
    story: 'Bowls Podcast sponsorship – 2025/26 season',
    emailSubject: 'Bowls Podcast Sponsorship Invoice – 2025/26 Season',
    emailBody: getInvoiceEmailBody('inv-025'),
    status: 'draft',
    selected: false,
    notes:
      'Added 22 Sep 2026 (Jason) – 25/26 Bowls Podcast $1,000 + GST. Needs contact name + email.',
    createdAt: '2026-09-22',
  },
  {
    id: 'inv-026',
    number: 'ONEFM-2026-036',
    company: 'Bowls Victoria',
    contactName: '',
    email: '',
    amountExclGst: 1000,
    gst: 100,
    total: 1100,
    description: 'Bowls Podcast Sponsorship – Season 2026/27',
    period: '2026/27 season',
    dueDate: '2026-10-01',
    story: 'Bowls Podcast sponsorship – 2026/27 season (starting up)',
    emailSubject: 'Bowls Podcast Sponsorship Invoice – 2026/27 Season',
    emailBody: getInvoiceEmailBody('inv-026'),
    status: 'draft',
    selected: false,
    notes:
      'Added 22 Sep 2026 (Jason) – 26/27 Bowls Podcast $1,000 + GST, sent with the 25/26 invoice as the new season is starting up. Needs contact name + email.',
    createdAt: '2026-09-22',
  },
  {
    id: 'inv-027',
    number: 'ONEFM-2026-037',
    company: 'Burkes Bakery',
    contactName: 'Ken',
    email: 'strathbogiebakingcompany@gmail.com',
    amountExclGst: 1200,
    gst: 120,
    total: 1320,
    description: 'Sponsorship Catch-Up – Jul/Aug/Sep 2026 (3 months × $400)',
    period: 'Jul 2026 – Sep 2026',
    dueDate: '2026-10-01',
    story: 'Monthly sponsorship continued to air Jul–Sep 2026, never invoiced',
    emailSubject: 'Sponsorship Invoice – July to September 2026',
    emailBody: getInvoiceEmailBody('inv-027'),
    status: 'draft',
    selected: false,
    notes:
      'Added 22 Sep 2026 – pro-rated from ONEFM-2026-019 ($2,800 ex / 7 months = $400/mo). Contract 011-00780-0001 expired 18 Oct 2026. Confirm service continued Jul–Sep before send.',
    createdAt: '2026-09-22',
  },
  {
    id: 'inv-028',
    number: 'ONEFM-2026-038',
    company: "Cleave's Garden Supplies",
    contactName: 'Cleave',
    email: '',
    amountExclGst: 1624.98,
    gst: 162.5,
    total: 1787.48,
    description: 'Sponsorship Catch-Up – Jul/Aug/Sep 2026 (3 months × $541.66)',
    period: 'Jul 2026 – Sep 2026',
    dueDate: '2026-10-01',
    story: 'Monthly sponsorship continued to air Jul–Sep 2026, never invoiced',
    emailSubject: 'Sponsorship Invoice – July to September 2026',
    emailBody: getInvoiceEmailBody('inv-028'),
    status: 'draft',
    selected: false,
    notes:
      'Added 22 Sep 2026 – pro-rated from ONEFM-2026-018 ($4,333.28 ex / 8 months = $541.66/mo). Contract 011-00018-0001 expired 17 Oct 2026. Confirm service continued Jul–Sep before send.',
    createdAt: '2026-09-22',
  },
  {
    id: 'inv-029',
    number: 'ONEFM-2026-039',
    company: 'McRae Demolitions',
    contactName: 'Keith',
    email: '',
    amountExclGst: 1624.98,
    gst: 162.5,
    total: 1787.48,
    description: 'Sponsorship Catch-Up – Jul/Aug/Sep 2026 (3 months × $541.66)',
    period: 'Jul 2026 – Sep 2026',
    dueDate: '2026-10-01',
    story: 'Monthly sponsorship continued to air Jul–Sep 2026, never invoiced',
    emailSubject: 'Sponsorship Invoice – July to September 2026',
    emailBody: getInvoiceEmailBody('inv-029'),
    status: 'draft',
    selected: false,
    notes:
      'Added 22 Sep 2026 – pro-rated from ONEFM-2026-017 ($4,333.28 ex / 8 months = $541.66/mo). Confirm service continued Jul–Sep before send.',
    createdAt: '2026-09-22',
  },
  {
    id: 'inv-030',
    number: 'ONEFM-2026-040',
    company: 'Oporto Shepparton',
    contactName: 'Bishoy Soliman',
    email: 'oportoshepparton@gmail.com',
    amountExclGst: 2000,
    gst: 200,
    total: 2200,
    description:
      '2026 Football Finals Partnership — Best Player award activation (on-air mentions, post-game interview, voucher presentation, social extension) + 120 × 30-second spots, ad production included',
    period: '2026 Finals Series',
    dueDate: '2026-10-01',
    story: 'Requested by Bishoy Soliman 9 Sept 2026 — Option 1, 7-day terms',
    emailSubject: 'ONE FM 98.5 — Oporto Shepparton Finals Partnership Invoice',
    emailBody: getInvoiceEmailBody('inv-030'),
    status: 'draft',
    selected: false,
    notes:
      'Merged from GitHub main 22 Sep 2026 — existed on main as draft ONEFM-2026-030 (10 Sep); renumbered 040 because 030 = KDL in this batch. Never sent. Original 7-day terms rolled to batch due date.',
    createdAt: '2026-09-10',
  },
  {
    id: 'inv-031',
    number: 'ONEFM-2026-041',
    company: 'Merritt Funeral Services',
    contactName: 'Trent Merritt',
    email: '',
    amountExclGst: 1105.02,
    gst: 110.5,
    total: 1215.52,
    description: 'Sponsorship Catch-Up – Jul/Aug/Sep 2026 (3 months × $368.34)',
    period: 'Jul 2026 – Sep 2026',
    dueDate: '2026-10-01',
    story: 'Monthly sponsorship continued to air Jul–Sep 2026, never invoiced',
    emailSubject: 'Sponsorship Invoice – July to September 2026',
    emailBody: getInvoiceEmailBody('inv-031'),
    status: 'draft',
    selected: false,
    notes:
      'Added 22 Sep 2026 (Jason confirmed) – pro-rated from ONEFM-2026-024 ($1,473.36 ex / 4 selected months = $368.34/mo). Aussie Ag excluded — Jason advises they have kept paying. Needs email address. Confirm service continued Jul–Sep before send.',
    createdAt: '2026-09-22',
  },
]

/**
 * CURRENT_INVOICES — previously held Oporto Shepparton (ONEFM-2026-030) on
 * main. Oporto is now merged into BATCH_INVOICES as inv-030 / ONEFM-2026-040
 * (030 = KDL in this batch). Kept as an empty array because store.tsx and
 * scripts/generate-invoice-pdf.ts import it — do not remove the export.
 */
export const CURRENT_INVOICES: BatchInvoice[] = []

/**
 * Real sponsor invoices (live Supabase seeding gate). Oporto renumbered
 * 030 → 040 in the Batch 2.0 merge (22 Sept 2026).
 */
export const REAL_INVOICE_NUMBERS = ['ONEFM-2026-011', 'ONEFM-2026-012', 'ONEFM-2026-040'] as const

export function isRealSponsorInvoiceNumber(number: string): boolean {
  return (REAL_INVOICE_NUMBERS as readonly string[]).includes(number)
}

export function realBatchInvoices(): BatchInvoice[] {
  return [...BATCH_INVOICES, ...CURRENT_INVOICES].filter((i) =>
    isRealSponsorInvoiceNumber(i.number),
  )
}

// ---------------------------------------------------------------------------
// Billing ledger — the bundle's `El` array (15 invoices)
// DEMO DATA — illustrative aging ledger, not the live FOOTT tax invoice.
// ---------------------------------------------------------------------------

export type BillingInvoiceStatus = 'paid' | 'sent' | 'overdue' | 'partially_paid' | 'draft'

export interface BillingInvoice {
  id: string
  number: string
  company: string
  contactName: string
  amount: number
  gst: number
  total: number
  status: BillingInvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  paidAmount?: number
  paymentMethod?: string
  campaign?: string
  description?: string
}

/**
 * All 15 billing records extracted verbatim from the bundle. The deployed
 * data used the status literal `"partial"` for INV-2026-004; it is normalised
 * here to `"partially_paid"` to match the store's status union.
 */
export const BILLING_INVOICES: BillingInvoice[] = [
  {
    id: 'inv_1',
    number: 'INV-2026-001',
    company: 'Peppermill Inn',
    contactName: 'Todd Van Kerkhof',
    amount: 1127,
    gst: 113,
    total: 1240,
    status: 'paid',
    issueDate: '2026-01-01',
    dueDate: '2026-01-31',
    paidDate: '2026-01-15',
    paidAmount: 1240,
    paymentMethod: 'Bank Transfer',
    campaign: 'GVL 2026 MAJOR',
    description: 'Major partner — monthly instalment 1 of 6',
  },
  {
    id: 'inv_2',
    number: 'INV-2026-002',
    company: 'Aussie Ag Supplies Pty Ltd',
    contactName: 'Daryl Gorman',
    amount: 608,
    gst: 61,
    total: 669,
    status: 'paid',
    issueDate: '2026-01-05',
    dueDate: '2026-02-05',
    paidDate: '2026-02-01',
    paidAmount: 669,
    paymentMethod: 'Direct Debit',
    campaign: 'Parts & Wrecking (PDL)',
    description: 'Monthly sponsorship — agriculture sector',
  },
  {
    id: 'inv_3',
    number: 'INV-2026-003',
    company: 'Merritt Funeral Services',
    contactName: 'Trent Merritt',
    amount: 368,
    gst: 37,
    total: 405,
    status: 'overdue',
    issueDate: '2026-01-10',
    dueDate: '2026-02-10',
    paidAmount: 0,
    campaign: 'LT Image',
    description: 'Monthly LT Image campaign instalment',
  },
  {
    id: 'inv_4',
    number: 'INV-2026-004',
    company: 'Gagliardi Scott Real Estate',
    contactName: 'Rocky Gagliardi',
    amount: 1036,
    gst: 104,
    total: 1140,
    status: 'partially_paid',
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    paidDate: '2026-02-10',
    paidAmount: 600,
    paymentMethod: 'Credit Card',
    campaign: 'GVL 2025',
    description: 'GVL 2025 coverage — monthly',
  },
  {
    id: 'inv_5',
    number: 'INV-2026-005',
    company: 'McNamara Real Estate',
    contactName: '',
    amount: 450,
    gst: 45,
    total: 495,
    status: 'overdue',
    issueDate: '2025-12-01',
    dueDate: '2026-01-01',
    paidAmount: 0,
    campaign: 'Real Estate Package',
    description: 'Property sector sponsorship',
  },
  {
    id: 'inv_6',
    number: 'INV-2026-006',
    company: 'Goulburn Valley Football League',
    contactName: 'Josephine Spencer',
    amount: 833,
    gst: 83,
    total: 916,
    status: 'paid',
    issueDate: '2026-01-20',
    dueDate: '2026-02-20',
    paidDate: '2026-02-18',
    paidAmount: 916,
    paymentMethod: 'Bank Transfer',
    campaign: 'GVL Broadcast 2025',
    description: 'Football league broadcast sponsorship',
  },
  {
    id: 'inv_7',
    number: 'INV-2026-007',
    company: 'Shepparton Harness Racing Club',
    contactName: 'Ian McDonald',
    amount: 100,
    gst: 10,
    total: 110,
    status: 'paid',
    issueDate: '2026-01-25',
    dueDate: '2026-02-25',
    paidDate: '2026-02-22',
    paidAmount: 110,
    paymentMethod: 'Direct Debit',
    campaign: 'Gold Cup',
    description: 'Gold Cup JAN 2024 OB campaign',
  },
  {
    id: 'inv_8',
    number: 'INV-2026-008',
    company: 'Horizon Fresh Market Pty Ltd',
    contactName: '',
    amount: 550,
    gst: 55,
    total: 605,
    status: 'overdue',
    issueDate: '2025-12-15',
    dueDate: '2026-01-15',
    paidAmount: 0,
    campaign: 'Fresh Market',
    description: 'Grocery retail sponsorship',
  },
  {
    id: 'inv_9',
    number: 'INV-2026-009',
    company: "Cleave's Garden Supplies",
    contactName: '',
    amount: 400,
    gst: 40,
    total: 440,
    status: 'sent',
    issueDate: '2026-02-01',
    dueDate: '2026-03-01',
    paidAmount: 0,
    campaign: 'Garden Supplies',
    description: 'Gardening retail package',
  },
  {
    id: 'inv_10',
    number: 'INV-2026-010',
    company: 'Emergency Medical Services',
    contactName: '',
    amount: 350,
    gst: 35,
    total: 385,
    status: 'overdue',
    issueDate: '2025-11-20',
    dueDate: '2025-12-20',
    paidAmount: 0,
    campaign: 'Health Awareness',
    description: 'Emergency services awareness campaign',
  },
  {
    id: 'inv_11',
    number: 'INV-2026-011',
    company: 'GV Woodworkers',
    contactName: '',
    amount: 280,
    gst: 28,
    total: 308,
    status: 'sent',
    issueDate: '2026-02-10',
    dueDate: '2026-03-10',
    paidAmount: 0,
    campaign: 'Community Craft',
    description: 'Woodworking community group',
  },
  {
    id: 'inv_12',
    number: 'INV-2026-012',
    company: 'Primary Care Connect',
    contactName: '',
    amount: 500,
    gst: 50,
    total: 550,
    status: 'overdue',
    issueDate: '2025-12-10',
    dueDate: '2026-01-10',
    paidDate: '2026-01-20',
    paidAmount: 200,
    paymentMethod: 'Credit Card',
    campaign: 'Health Partnership',
    description: 'Primary health care sponsorship',
  },
  {
    id: 'inv_13',
    number: 'INV-2026-013',
    company: 'Albury Antiques',
    contactName: '',
    amount: 320,
    gst: 32,
    total: 352,
    status: 'draft',
    issueDate: '2026-02-15',
    dueDate: '2026-03-15',
    paidAmount: 0,
    campaign: 'Antiques Roadshow',
    description: 'Antiques and collectibles promotion',
  },
  {
    id: 'inv_14',
    number: 'INV-2026-014',
    company: 'FOOTT Waste Solutions',
    contactName: 'Peter Foott',
    amount: 580,
    gst: 58,
    total: 638,
    status: 'sent',
    issueDate: '2026-02-01',
    dueDate: '2026-02-28',
    paidAmount: 0,
    campaign: 'Waste Management',
    description: 'Environmental services package',
  },
  {
    id: 'inv_15',
    number: 'INV-2026-015',
    company: "Jan's Beehive",
    contactName: '',
    amount: 200,
    gst: 20,
    total: 220,
    status: 'overdue',
    issueDate: '2026-01-01',
    dueDate: '2026-02-01',
    paidAmount: 0,
    campaign: 'Local Business',
    description: 'Small business community support',
  },
]

// ---------------------------------------------------------------------------
// Recorded payments — the bundle's `Al` array
// ---------------------------------------------------------------------------

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

export const PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay_1',
    invoiceId: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    company: 'Peppermill Inn',
    amount: 1240,
    date: '2026-01-15',
    method: 'Bank Transfer',
    reference: 'REF-PM-001',
    notes: 'Full payment received',
    allocated: true,
  },
  {
    id: 'pay_2',
    invoiceId: 'inv_2',
    invoiceNumber: 'INV-2026-002',
    company: 'Aussie Ag Supplies Pty Ltd',
    amount: 669,
    date: '2026-02-01',
    method: 'Direct Debit',
    reference: 'DD-AAG-669',
    notes: 'Auto debit processed',
    allocated: true,
  },
  {
    id: 'pay_3',
    invoiceId: 'inv_4',
    invoiceNumber: 'INV-2026-004',
    company: 'Gagliardi Scott Real Estate',
    amount: 600,
    date: '2026-02-10',
    method: 'Credit Card',
    reference: 'CC-GS-600',
    notes: 'Partial payment - balance to follow',
    allocated: true,
  },
  {
    id: 'pay_4',
    invoiceId: 'inv_6',
    invoiceNumber: 'INV-2026-006',
    company: 'Goulburn Valley Football League',
    amount: 916,
    date: '2026-02-18',
    method: 'Bank Transfer',
    reference: 'REF-GVFL-2026',
    notes: 'Full payment',
    allocated: true,
  },
  {
    id: 'pay_5',
    invoiceId: 'inv_7',
    invoiceNumber: 'INV-2026-007',
    company: 'Shepparton Harness Racing Club',
    amount: 110,
    date: '2026-02-22',
    method: 'Direct Debit',
    reference: 'DD-SHRC-110',
    notes: 'Gold Cup payment',
    allocated: true,
  },
  {
    id: 'pay_6',
    invoiceId: 'inv_12',
    invoiceNumber: 'INV-2026-012',
    company: 'Primary Care Connect',
    amount: 200,
    date: '2026-01-20',
    method: 'Credit Card',
    reference: 'CC-PCC-200',
    notes: 'Partial payment - instalment 1 of 3',
    allocated: true,
  },
  {
    id: 'pay_7',
    invoiceId: '',
    invoiceNumber: '',
    company: 'Unknown',
    amount: 1500,
    date: '2026-02-15',
    method: 'Bank Transfer',
    reference: 'DEPOSIT-1500',
    notes: 'Unallocated deposit - reference unclear',
    allocated: false,
  },
  {
    id: 'pay_8',
    invoiceId: '',
    invoiceNumber: '',
    company: 'MediaCOM',
    amount: 440,
    date: '2026-02-20',
    method: 'Cash',
    reference: 'CASH-001',
    notes: 'Cash deposit at reception',
    allocated: false,
  },
]

// ---------------------------------------------------------------------------
// Aging buckets — the bundle's `ka` array
// ---------------------------------------------------------------------------

export interface AgingBucket {
  label: string
  minDays: number
  maxDays: number
  color: string
}

export const AGING_BUCKETS: AgingBucket[] = [
  { label: 'Current', minDays: -999, maxDays: 0, color: '#22C55E' },
  { label: '1-30 Days', minDays: 1, maxDays: 30, color: '#EAB308' },
  { label: '31-60 Days', minDays: 31, maxDays: 60, color: '#F97316' },
  { label: '60-90 Days', minDays: 61, maxDays: 90, color: '#EF4444' },
  { label: '90+ Days', minDays: 91, maxDays: 999, color: '#DC2626' },
]

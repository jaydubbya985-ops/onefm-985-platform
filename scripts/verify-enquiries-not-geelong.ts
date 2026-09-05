/**
 * Fail if ops DEMO CRM still invents leftover Geelong / Barwon geography.
 * Used surface: EnquiryDashboard via store.tsx seeds MOCK_ENQUIRIES.
 * Licensed coverage is Goulburn Valley via townData — not Geelong.
 * Run: npx vite-node scripts/verify-enquiries-not-geelong.ts
 */
import { MOCK_ENQUIRIES } from '../src/components/ops/data/enquiries.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiries-not-geelong FAIL: ${message}`)
    process.exit(1)
  }
}

function enquiryText(e: (typeof MOCK_ENQUIRIES)[number]): string {
  return [
    e.name,
    e.email,
    e.phone,
    e.company ?? '',
    e.subject,
    e.message,
    ...e.notes.map((n) => n.text),
  ].join('\n')
}

const blob = MOCK_ENQUIRIES.map(enquiryText).join('\n')

assert(!/geelong/i.test(blob), 'leftover invented Geelong still in MOCK_ENQUIRIES')
assert(!/bellarine/i.test(blob), 'leftover invented Bellarine still in MOCK_ENQUIRIES')
assert(!/surf coast/i.test(blob), 'leftover invented Surf Coast still in MOCK_ENQUIRIES')
assert(!/\bnewcomb\b/i.test(blob), 'leftover invented Newcomb still in MOCK_ENQUIRIES')
assert(!/03 5222/.test(blob), 'leftover invented Geelong STD 03 5222 still in MOCK_ENQUIRIES')
assert(!/\bGSC\b/.test(blob), 'leftover invented GSC (Geelong Soccer Club) still in MOCK_ENQUIRIES')

const restaurant = MOCK_ENQUIRIES.find((e) => e.id === 'ENQ-002')
assert(restaurant, 'ENQ-002 missing')
assert(
  /DEMO — not a Goulburn Valley business/i.test(restaurant!.message),
  'ENQ-002 must name DEMO — not leftover South Geelong',
)

const soccer = MOCK_ENQUIRIES.find((e) => e.id === 'ENQ-009')
assert(soccer, 'ENQ-009 missing')
assert(
  /not a GVL club/i.test(soccer!.message),
  'ENQ-009 must name DEMO soccer — not leftover Geelong as a GVL partner',
)

const grant = MOCK_ENQUIRIES.find((e) => e.id === 'ENQ-014')
assert(grant, 'ENQ-014 missing')
assert(
  /DEMO — not a station number/i.test(grant!.phone),
  'ENQ-014 must drop leftover Geelong STD 03 5222',
)

console.log(
  'verify-enquiries-not-geelong: leftover Geelong / Barwon geography gone; DEMO CRM names DEMO rows',
)

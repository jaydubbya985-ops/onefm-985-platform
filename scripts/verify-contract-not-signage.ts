/**
 * Fail if the football season contract template still invents digital signage
 * as included inventory. Run: npx vite-node scripts/verify-contract-not-signage.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { CONTRACT_TEMPLATES } from '../src/components/ops/contracts/constants.ts'
import { generateContractPdf } from '../src/lib/contractDocument.ts'
import { BRAND } from '../src/lib/brand.ts'
import type { Contract } from '../src/components/ops/data/sponsors.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-contract-not-signage FAIL: ${message}`)
    process.exit(1)
  }
}

const football = CONTRACT_TEMPLATES.find((t) => t.id === 'tpl_football_season')
assert(football, 'football season template missing')

const text = football!.descriptionText
assert(
  !/including match-day announcements, digital signage/i.test(text),
  'leftover invented digital signage still listed as included inventory',
)
assert(
  /Digital signage is not a quoted inventory line/i.test(text),
  'sourced no-digital-signage line missing',
)
assert(text.includes(BRAND.email), `station email missing from football template: ${text}`)

const contract: Contract = {
  id: 'c-signage-check',
  contractNumber: 'ONEFM-C-2026-099',
  companyName: 'FOOTT Waste Solutions',
  primaryContact: 'Peter Foott',
  email: 'peter@foott.com.au',
  campaignName: football!.campaignName,
  description: text,
  contractValue: football!.defaultValue,
  gst: 1500,
  totalValue: 16500,
  startDate: '2026-04-01',
  endDate: '2026-09-30',
  status: 'draft',
  tier: 'Football Gold',
  packageType: football!.packageType,
  paymentTerms: '14_days',
  billingFrequency: football!.defaultFrequency,
  invoices: [],
  createdAt: '2026-09-05',
  updatedAt: '2026-09-05',
}

const pdf = await generateContractPdf(contract)
const buf = Buffer.from(pdf.output('arraybuffer'))
const raw = buf.toString('latin1')

assert(
  !/including match-day announcements, digital signage/i.test(raw),
  'leftover invented digital signage still in sponsorship agreement PDF',
)
assert(
  /Digital signage is not a quoted inventory/i.test(raw),
  'sourced no-digital-signage line missing from sponsorship agreement PDF',
)
assert(raw.includes(BRAND.email), 'station email missing from sponsorship agreement PDF')

const outDir = '/tmp/onefm-contract-not-signage'
mkdirSync(outDir, { recursive: true })
writeFileSync(`${outDir}/football-season-agreement.pdf`, buf)
writeFileSync(`${outDir}/football-template.txt`, text)

console.log('verify-contract-not-signage: leftover digital signage gone; template names quoted inventory')

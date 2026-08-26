/**
 * Generate Community Partner proposal + contract + invoice PDFs and print checks.
 * Run: npx vite-node scripts/verify-ops-pdfs.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { PROPOSAL_PACKAGES } from '../src/components/ops/data/sponsors'
import { buildProposalDoc, generateProposalPdf } from '../src/lib/proposalDocument'
import { generateContractPdf } from '../src/lib/contractDocument'
import { generateInvoicePdf } from '../src/components/ops/InvoiceEmailTemplate'
import { BANK_BSB } from '../src/lib/bankDetails'
import { stationStats } from '../src/data/pricing'
import type { Contract } from '../src/components/ops/data/sponsors'

const outDir = '/tmp/onefm-pdf-check'
mkdirSync(outDir, { recursive: true })

const pkg = PROPOSAL_PACKAGES.find((p) => p.id === 'partner-community')
if (!pkg) throw new Error('Community Partner package missing')

const proposal = buildProposalDoc({
  number: 'PROP-2026-001',
  clientName: 'Ken Tuckett',
  company: 'Burkes Bakery',
  email: 'accounts@example.test',
  pkg,
  durationWeeks: 52,
  extras: {},
})

const proposalPdf = await generateProposalPdf(proposal)
const proposalBytes = Buffer.from(proposalPdf.output('arraybuffer'))
writeFileSync(`${outDir}/community-partner.pdf`, proposalBytes)

const contract: Contract = {
  id: 'c-check',
  contractNumber: 'ONEFM-C-2026-001',
  companyName: 'Burkes Bakery',
  primaryContact: 'Ken Tuckett',
  email: 'accounts@example.test',
  campaignName: 'Community Partner',
  description: 'Community Partner package — from accepted proposal',
  contractValue: proposal.money.exGst,
  gst: proposal.money.gst,
  totalValue: proposal.money.total,
  startDate: '2026-06-01',
  endDate: '2027-05-31',
  status: 'pending',
  tier: 'Community',
  packageType: 'custom',
  paymentTerms: '14_days',
  billingFrequency: 'one_time',
  invoices: [],
  createdAt: '2026-08-26',
  updatedAt: '2026-08-26',
}

const contractPdf = await generateContractPdf(contract)
writeFileSync(`${outDir}/community-partner-contract.pdf`, Buffer.from(contractPdf.output('arraybuffer')))

const invoicePdf = await generateInvoicePdf({
  number: 'ONEFM-2026-019',
  company: 'Burkes Bakery',
  contactName: 'Ken Tuckett',
  email: 'accounts@example.test',
  amountExclGst: 2800,
  gst: 280,
  total: 3080,
  description: 'Community Partner',
  period: 'Dec 2025-Jun 2026',
  dueDate: '2026-06-23',
  issueDate: '2026-06-09',
})
writeFileSync(`${outDir}/invoice-019.pdf`, Buffer.from(invoicePdf.output('arraybuffer')))

console.log(JSON.stringify({
  outDir,
  weeklyListeners: stationStats.weeklyListeners,
  proposalTotal: proposal.money.total,
  proposalGst: proposal.money.gst,
  bsb: BANK_BSB,
  packageName: proposal.packageName,
}, null, 2))

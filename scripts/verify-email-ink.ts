/**
 * Fail if enquiry / proposal email HTML still wears leftover Heritage navy or gold.
 * Run: npx vite-node scripts/verify-email-ink.ts
 */
import { readFileSync } from 'node:fs'
import {
  buildEnquiryConfirmationHtml,
  buildEnquiryEmailHtml,
  buildProposalEmailHtml,
} from '../src/lib/email'

function fail(message: string): never {
  console.error(`verify-email-ink FAIL: ${message}`)
  process.exit(1)
}

const src = readFileSync(new URL('../src/lib/email.ts', import.meta.url), 'utf8')
if (src.includes('#0A1628')) fail('email.ts must not name leftover Heritage navy #0A1628')
if (src.includes('#D4A84B') || src.includes('#D4AF37')) {
  fail('email.ts must not name leftover Heritage Gold')
}

const enquiry = {
  name: 'Jay Welsh',
  email: 'jasonstv1@bigpond.com',
  phone: '(03) 5831 3131',
  organization: 'Goulburn Valley Community Radio Inc.',
  enquiryType: 'Sponsorship',
  message: 'Standard 30s is $25 plus GST. GVL is never from $25.',
  preferredContact: 'email',
}

const station = buildEnquiryEmailHtml(enquiry)
const confirm = buildEnquiryConfirmationHtml(enquiry)
const proposal = buildProposalEmailHtml({
  customerName: 'Jay Welsh',
  customerEmail: 'jasonstv1@bigpond.com',
  companyName: 'FOOTT',
  tierName: 'Standard 30s',
  total: 25,
})

for (const [label, html] of [
  ['station enquiry', station],
  ['enquiry confirmation', confirm],
  ['proposal', proposal],
] as const) {
  if (html.includes('#0A1628')) fail(`${label} HTML still uses leftover navy #0A1628`)
  if (html.includes('#D4A84B') || html.includes('#D4AF37')) {
    fail(`${label} HTML still uses leftover Heritage Gold`)
  }
  if (!html.includes('#101010')) fail(`${label} HTML must use Direction A ink #101010`)
}

if (!confirm.includes('#1B458F')) fail('confirmation listen link must use ONE FM Blue #1B458F')
if (!confirm.includes('#F2F2F2')) fail('confirmation wordmark must use Direction A paper #F2F2F2')
if (!station.includes('#F2F2F2')) fail('station enquiry wordmark must use Direction A paper #F2F2F2')

console.log('verify-email-ink OK — enquiry/proposal HTML uses Direction A ink, not leftover navy')

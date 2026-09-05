import { readFileSync } from 'node:fs'
import { buildEnquiryConfirmationHtml } from '../src/lib/email.ts'

const src = readFileSync(new URL('../src/lib/email.ts', import.meta.url), 'utf8')
if (/if you need us sooner/i.test(src)) {
  throw new Error('leftover sooner-SLA still in email.ts')
}

const html = buildEnquiryConfirmationHtml({
  name: 'Jo',
  email: 'jo@example.com',
  phone: '03 0000 0000',
  enquiryType: 'Volunteering',
  message: 'I would like to help at the station.',
  preferredContact: 'email',
})

if (/if you need us sooner/i.test(html)) {
  throw new Error('leftover sooner-SLA still in confirmation HTML')
}
if (!/does not promise a reply time/.test(html)) {
  throw new Error('sourced no-reply-time line missing')
}
if (!html.includes('(03) 5831 3131')) {
  throw new Error('station phone missing from confirmation')
}
if (!html.includes('admin@fm985.com.au')) {
  throw new Error('station email missing from confirmation')
}

console.log('verify-email-not-sooner: leftover sooner-SLA gone; station phone and email sourced')

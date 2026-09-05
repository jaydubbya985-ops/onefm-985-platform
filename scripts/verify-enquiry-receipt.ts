/**
 * Fail the build if sponsor enquiry receipts invent a pipeline or a send.
 * Run: npx vite-node scripts/verify-enquiry-receipt.ts
 */
import { readFileSync } from 'node:fs'
import { BRAND } from '../src/lib/brand'
import {
  enquiryReceiptDetail,
  enquiryReceiptHeadline,
  sponsorEnquiryHelper,
} from '../src/lib/enquiryReceipt'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiry-receipt FAIL: ${message}`)
    process.exit(1)
  }
}

assert(enquiryReceiptHeadline({ stored: true, emailed: true }) === 'Enquiry received at the station', 'stored+emailed headline')
assert(enquiryReceiptHeadline({ stored: true, emailed: false }) === 'Enquiry received at the station', 'stored-only headline')
assert(enquiryReceiptHeadline({ stored: false, emailed: true }) === 'Enquiry emailed to the station', 'emailed-only headline')
assert(enquiryReceiptHeadline({ stored: false, emailed: false }) === 'Enquiry not sent', 'neither headline')

const both = enquiryReceiptDetail({ stored: true, emailed: true })
assert(both.includes('station desk'), `both detail desk: ${both}`)
assert(both.includes('emailed'), `both detail emailed: ${both}`)
assert(both.includes(`call ${BRAND.phone}`), `both detail studio line: ${both}`)
assert(!/now, Call/.test(both), `both detail must not capitalise Call mid-sentence: ${both}`)
assert(!/pipeline/i.test(both), `both detail must not say pipeline: ${both}`)

const storedOnly = enquiryReceiptDetail({ stored: true, emailed: false })
assert(storedOnly.includes('station desk'), `stored detail: ${storedOnly}`)
assert(/not sent/i.test(storedOnly), `stored-only must say email was not sent: ${storedOnly}`)
assert(!/pipeline/i.test(storedOnly), 'stored-only must not say pipeline')

const emailedOnly = enquiryReceiptDetail({ stored: false, emailed: true })
assert(emailedOnly.includes('emailed'), `emailed detail: ${emailedOnly}`)
assert(/not in the live CRM/i.test(emailedOnly), `emailed-only must not invent CRM: ${emailedOnly}`)
assert(!/pipeline/i.test(emailedOnly), 'emailed-only must not say pipeline')

const neither = enquiryReceiptDetail({ stored: false, emailed: false })
assert(/Nothing was stored or emailed/i.test(neither), `neither: ${neither}`)
assert(neither.includes(BRAND.phone), 'neither must offer the studio line')
assert(neither.includes(BRAND.email), 'neither must offer the station email')

const helper = sponsorEnquiryHelper()
assert(/ops connection is live/i.test(helper), `helper stores-when-connected: ${helper}`)
assert(/email is configured/i.test(helper), `helper emails-when-configured: ${helper}`)
assert(!/pipeline/i.test(helper), `helper must not invent a pipeline: ${helper}`)
assert(!/we'll be in touch/i.test(helper), 'helper must not invent a follow-up')

const page = readFileSync(new URL('../src/pages/SponsorshipKit.tsx', import.meta.url), 'utf8')
assert(page.includes('enquiryReceiptHeadline'), 'SponsorshipKit must use enquiryReceiptHeadline')
assert(page.includes('enquiryReceiptDetail'), 'SponsorshipKit must use enquiryReceiptDetail')
assert(page.includes('sponsorEnquiryHelper'), 'SponsorshipKit must use sponsorEnquiryHelper')
assert(!/You're in the pipeline/i.test(page), 'SponsorshipKit must not invent a pipeline receipt')
assert(!/station's pipeline/i.test(page), 'SponsorshipKit must not claim the form goes to a pipeline')
assert(!/We'll be in touch/i.test(page), 'SponsorshipKit must not invent a follow-up')

console.log('verify-enquiry-receipt: ok')

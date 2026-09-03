/**
 * Honest sponsor/contact receipt copy from submitEnquiry flags.
 * success can mean stored, emailed, or both — never invent a CRM pipeline.
 */
import { BRAND } from '@/lib/brand'
import { enquiryFallbackContact } from '@/lib/enquiries'

export type EnquiryReceiptFlags = {
  stored?: boolean
  emailed?: boolean
}

export function enquiryReceiptHeadline(flags: EnquiryReceiptFlags): string {
  if (flags.stored) return 'Enquiry received at the station'
  if (flags.emailed) return 'Enquiry emailed to the station'
  return 'Enquiry not sent'
}

function needUsNow(): string {
  return `If you need us now, call ${BRAND.phone} or email ${BRAND.email}.`
}

export function enquiryReceiptDetail(flags: EnquiryReceiptFlags): string {
  if (flags.stored && flags.emailed) {
    return `It's on the station desk and a copy was emailed. ${needUsNow()}`
  }
  if (flags.stored) {
    return `It's on the station desk. A notification email was not sent from this form. ${needUsNow()}`
  }
  if (flags.emailed) {
    return `A copy was emailed to the station. It is not in the live CRM yet. ${needUsNow()}`
  }
  return `Nothing was stored or emailed. ${enquiryFallbackContact()}`
}

/** Helper under the /sponsorship form — does not claim a pipeline or a send. */
export function sponsorEnquiryHelper(): string {
  return 'This form stores the enquiry on the station desk when the ops connection is live, and emails a copy when email is configured.'
}

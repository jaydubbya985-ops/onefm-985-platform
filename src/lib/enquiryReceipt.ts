/**
 * Honest sponsor/contact receipt copy from submitEnquiry flags.
 * success can mean stored, emailed, or both — never invent a CRM pipeline.
 */
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

export function enquiryReceiptDetail(flags: EnquiryReceiptFlags): string {
  const now = `If you need us now, ${enquiryFallbackContact()}`
  if (flags.stored && flags.emailed) {
    return `It's on the station desk and a copy was emailed. ${now}`
  }
  if (flags.stored) {
    return `It's on the station desk. A notification email was not sent from this form. ${now}`
  }
  if (flags.emailed) {
    return `A copy was emailed to the station. It is not in the live CRM yet. ${now}`
  }
  return `Nothing was stored or emailed. ${enquiryFallbackContact()}`
}

/** Helper under the /sponsorship form — does not claim a pipeline or a send. */
export function sponsorEnquiryHelper(): string {
  return 'This form stores the enquiry on the station desk when the ops connection is live, and emails a copy when email is configured.'
}

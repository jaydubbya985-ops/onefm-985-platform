import { BRAND } from '@/lib/brand'

export interface EnquirySubmitResult {
  success: boolean
  id?: string
  stored?: boolean
  emailed?: boolean
  error?: string
}

/** Public fallback when store/send fails — same station contact as the Contact page. */
export function enquiryFallbackContact(): string {
  return `Call ${BRAND.phone} or email ${BRAND.email}.`
}

const NOT_SENT = `Nothing was stored or emailed. ${enquiryFallbackContact()}`

/**
 * Shared enquiry outcome. Parking a row in ops is not a sent email.
 * Callers that only check `success` must not show "request received"
 * when the station inbox was never mailed.
 */
export function enquirySubmitOutcome(args: {
  stored: boolean
  insertedId?: string
  emailed: boolean
  emailDevMode?: boolean
  emailError?: string
}): EnquirySubmitResult {
  if (args.emailed) {
    return {
      success: true,
      id: args.insertedId,
      stored: args.stored,
      emailed: true,
    }
  }

  if (args.stored) {
    return {
      success: false,
      id: args.insertedId,
      stored: true,
      emailed: false,
      error: `The station inbox was not emailed. Your note is on the ops list. ${enquiryFallbackContact()}`,
    }
  }

  return {
    success: false,
    stored: false,
    emailed: false,
    error: args.emailDevMode
      ? `Nothing was sent — email is not configured. ${enquiryFallbackContact()}`
      : args.emailError || NOT_SENT,
  }
}

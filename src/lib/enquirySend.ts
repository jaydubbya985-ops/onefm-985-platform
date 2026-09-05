/**
 * Classify the send-enquiry Netlify function body.
 * A JSON error means Resend ran and failed — never fall through to "not configured".
 */
export type EnquirySendOutcome =
  | { kind: 'sent' }
  | { kind: 'function_failed'; error: string }
  | { kind: 'unreachable' }

export function readEnquiryFunctionResult(
  json: { success?: boolean; error?: string } | null,
): EnquirySendOutcome {
  if (!json) return { kind: 'unreachable' }
  if (json.success === true) return { kind: 'sent' }
  const error = json.error?.trim()
  return {
    kind: 'function_failed',
    error: error || 'Enquiry email was not sent.',
  }
}

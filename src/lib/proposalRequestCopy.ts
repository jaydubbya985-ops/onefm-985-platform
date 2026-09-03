/**
 * Public /proposal request — not a sent PDF.
 * submitEnquiry may store and/or email. Staff write the PDF in ops later.
 */

export const PROPOSAL_REQUEST_HELPER =
  'Stores in the ops ledger when connected, or emails the station. This page does not send a PDF.'

export const PROPOSAL_REQUEST_SUBMIT = 'Submit request'

export function proposalRequestHeadline(stored: boolean, emailed: boolean): string {
  if (stored && emailed) return 'Stored and emailed.'
  if (stored) return 'Stored at the station.'
  if (emailed) return 'Emailed to the station.'
  return 'Nothing was stored or emailed.'
}

export function proposalRequestDetail(stored: boolean, emailed: boolean): string {
  if (stored || emailed) {
    return 'A proposal PDF is not generated here. Station staff write it from the ops portal when they pick up this request.'
  }
  return 'Nothing reached the station from this form.'
}

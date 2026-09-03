/**
 * Ops proposal mail — never invent a downloaded PDF or a sent email.
 * Mailto opens a draft in this browser. Mark sent is a separate staff action.
 */

export type ProposalMailOutcome = {
  pdfDownloaded: boolean
  mailtoOpened: boolean
}

export function proposalMailLabel(outcome: ProposalMailOutcome): string {
  if (outcome.pdfDownloaded && outcome.mailtoOpened) {
    return 'PDF downloaded and email draft opened. Not marked sent — confirm the email went, then Mark sent.'
  }
  if (outcome.mailtoOpened) {
    return 'Email draft opened. PDF did not download. Not marked sent.'
  }
  if (outcome.pdfDownloaded) {
    return 'PDF downloaded. Email draft did not open. Not marked sent.'
  }
  return 'Nothing was sent. PDF and email draft both failed. Not marked sent.'
}

export function proposalMailTone(
  outcome: ProposalMailOutcome,
): 'success' | 'warning' | 'error' {
  if (outcome.pdfDownloaded && outcome.mailtoOpened) return 'success'
  if (outcome.pdfDownloaded || outcome.mailtoOpened) return 'warning'
  return 'error'
}

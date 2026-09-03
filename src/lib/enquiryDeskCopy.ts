/**
 * Honest empty / create copy for the ops enquiry desk.
 * LIVE starts with zero rows — never dress that as a loaded pipeline.
 */

export function enquiryEmptyCopy(opts: {
  live: boolean
  searching: boolean
  filter: string
}): string {
  if (opts.searching) return 'No enquiries match that search.'
  if (opts.filter !== 'all') return 'No enquiries in this status.'
  if (opts.live) {
    return 'No enquiries yet. Rows from the public contact form land here when they are stored.'
  }
  return 'DEMO pipeline only — these rows are not real sponsors. Do not email them.'
}

export function proposalCreatedToast(): string {
  return 'Draft proposal created — switching to Proposals.'
}

export function proposalMissingToast(): string {
  return 'Proposal was not created — that enquiry is gone.'
}

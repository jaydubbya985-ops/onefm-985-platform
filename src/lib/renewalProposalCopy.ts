import type { RenewalStatus } from '@/components/ops/data/payments'

/**
 * Billing renewals never invent a sent proposal.
 * Generate Proposal does not write a file or open mail.
 */
export function renewalGenerateToast(sponsorName: string): string {
  const who = sponsorName.trim() || 'this sponsor'
  return `Nothing was created or emailed for ${who}. Open Proposals to draft a renewal.`
}

export function renewalDeskStatusLabel(status: RenewalStatus): string {
  if (status === 'proposal_sent') return 'On file — not emailed from this desk'
  if (status === 'upcoming') return 'Upcoming'
  if (status === 'negotiating') return 'Negotiating'
  if (status === 'renewed') return 'Renewed'
  if (status === 'churned') return 'Churned'
  return status
}

export function renewalActionLabel(status: RenewalStatus): string {
  return status === 'proposal_sent' ? 'On file' : 'Generate Proposal'
}

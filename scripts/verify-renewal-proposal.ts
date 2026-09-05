/**
 * Fail if billing renewals invent a sent proposal.
 * Run: npx vite-node scripts/verify-renewal-proposal.ts
 */
import { readFileSync } from 'node:fs'
import {
  renewalActionLabel,
  renewalDeskStatusLabel,
  renewalGenerateToast,
} from '../src/lib/renewalProposalCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-renewal-proposal FAIL: ${message}`)
    process.exit(1)
  }
}

const toast = renewalGenerateToast('Peppermill Inn')
assert(toast.includes('Peppermill Inn'), toast)
assert(/Nothing was created or emailed/.test(toast), toast)
assert(!/sent/i.test(toast), `toast must not claim sent: ${toast}`)

assert(
  renewalDeskStatusLabel('proposal_sent') === 'On file — not emailed from this desk',
  renewalDeskStatusLabel('proposal_sent'),
)
assert(!/sent/i.test(renewalDeskStatusLabel('proposal_sent')), 'badge must not say sent')
assert(renewalActionLabel('upcoming') === 'Generate Proposal', 'upcoming action')
assert(renewalActionLabel('proposal_sent') === 'On file', 'on-file action')

const src = readFileSync('src/components/ops/BillingEngine.tsx', 'utf8')
assert(src.includes('renewalGenerateToast'), 'BillingEngine must use renewalGenerateToast')
assert(
  !/status: 'proposal_sent'/.test(src),
  'Generate Proposal must not flip status to proposal_sent',
)
assert(!/Proposal Sent/.test(src), 'BillingEngine must not label a row Proposal Sent')
assert(!/Draft ready/.test(src), 'BillingEngine must not invent Draft ready')

console.log('verify-renewal-proposal OK')

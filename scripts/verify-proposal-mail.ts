/**
 * Fail if proposal mail invents a downloaded PDF or a sent email.
 * Run: npx vite-node scripts/verify-proposal-mail.ts
 */
import { readFileSync } from 'node:fs'
import { proposalMailLabel, proposalMailTone } from '../src/lib/proposalMail'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-proposal-mail FAIL: ${message}`)
    process.exit(1)
  }
}

const both = { pdfDownloaded: true, mailtoOpened: true }
const mailOnly = { pdfDownloaded: false, mailtoOpened: true }
const pdfOnly = { pdfDownloaded: true, mailtoOpened: false }
const neither = { pdfDownloaded: false, mailtoOpened: false }

assert(proposalMailLabel(both).includes('PDF downloaded'), `both: ${proposalMailLabel(both)}`)
assert(proposalMailLabel(both).includes('Not marked sent'), `both sent: ${proposalMailLabel(both)}`)
assert(proposalMailTone(both) === 'success', 'both tone')

assert(proposalMailLabel(mailOnly).includes('PDF did not download'), `mailOnly: ${proposalMailLabel(mailOnly)}`)
assert(proposalMailLabel(mailOnly).includes('Not marked sent'), `mailOnly sent: ${proposalMailLabel(mailOnly)}`)
assert(!/PDF downloaded/.test(proposalMailLabel(mailOnly)), 'mailOnly must not invent a download')
assert(proposalMailTone(mailOnly) === 'warning', 'mailOnly tone')

assert(proposalMailLabel(pdfOnly).includes('did not open'), `pdfOnly: ${proposalMailLabel(pdfOnly)}`)
assert(proposalMailTone(pdfOnly) === 'warning', 'pdfOnly tone')

assert(proposalMailLabel(neither).includes('Nothing was sent'), `neither: ${proposalMailLabel(neither)}`)
assert(proposalMailTone(neither) === 'error', 'neither tone')

const builder = readFileSync('src/components/ops/ProposalBuilder.tsx', 'utf8')
assert(builder.includes('proposalMailLabel'), 'ProposalBuilder must use proposalMailLabel')
assert(
  !/PDF downloaded and email client opened/.test(builder),
  'ProposalBuilder must not hardcode a downloaded-PDF toast',
)

console.log('verify-proposal-mail OK')

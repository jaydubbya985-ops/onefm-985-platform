/**
 * Fail the build if the enquiry desk dresses an empty LIVE ledger as a pipeline.
 * Run: npx vite-node scripts/verify-enquiry-desk.ts
 */
import {
  enquiryEmptyCopy,
  proposalCreatedToast,
  proposalMissingToast,
} from '../src/lib/enquiryDeskCopy'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiry-desk FAIL: ${message}`)
    process.exit(1)
  }
}

const liveEmpty = enquiryEmptyCopy({ live: true, searching: false, filter: 'all' })
assert(liveEmpty.includes('No enquiries yet'), `LIVE empty: ${liveEmpty}`)
assert(!/pipeline|\$|sponsor/i.test(liveEmpty), 'LIVE empty must not invent a pipeline')

const searchEmpty = enquiryEmptyCopy({ live: true, searching: true, filter: 'all' })
assert(searchEmpty.includes('match that search'), `search empty: ${searchEmpty}`)

const filterEmpty = enquiryEmptyCopy({ live: true, searching: false, filter: 'new' })
assert(filterEmpty.includes('this status'), `filter empty: ${filterEmpty}`)

const demoHint = enquiryEmptyCopy({ live: false, searching: false, filter: 'all' })
assert(demoHint.includes('DEMO'), `DEMO hint: ${demoHint}`)
assert(demoHint.includes('not real'), 'DEMO must say rows are not real sponsors')

assert(proposalCreatedToast().includes('Proposals'), proposalCreatedToast())
assert(!proposalCreatedToast().toLowerCase().includes('sent'), 'create is not an email send')
assert(proposalMissingToast().includes('not created'), proposalMissingToast())

console.log('verify-enquiry-desk OK')
console.log(
  JSON.stringify(
    { liveEmpty, searchEmpty, filterEmpty, demoHint, created: proposalCreatedToast(), missing: proposalMissingToast() },
    null,
    2,
  ),
)

/**
 * email-status must not advertise a sendable dry-run.
 * Dry-run is only available when Resend is configured, and it never sends.
 *
 * Run: npx vite-node scripts/verify-email-status-dryrun.ts
 */
import { readFileSync } from 'node:fs'
import {
  EMAIL_STATUS_DRY_RUN_NOTE_OFF,
  EMAIL_STATUS_DRY_RUN_NOTE_READY,
  emailStatusDryRunFields,
} from '../src/lib/emailStatusDryRun'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const off = emailStatusDryRunFields(false)
assert(off.dryRunSupported === false, 'missing key must not claim dry-run is supported')
assert(off.dryRunSends === false, 'missing key must still say dry-run does not send')
assert(off.dryRunNote === EMAIL_STATUS_DRY_RUN_NOTE_OFF, 'missing-key note must stay honest')
assert(!/sent|delivered|emailed/i.test(off.dryRunNote), 'off note must not claim mail went out')

const on = emailStatusDryRunFields(true)
assert(on.dryRunSupported === true, 'configured Resend may advertise dry-run')
assert(on.dryRunSends === false, 'configured dry-run must still not send')
assert(on.dryRunNote === EMAIL_STATUS_DRY_RUN_NOTE_READY, 'ready note must stay honest')
assert(/does not send/i.test(on.dryRunNote), 'ready note must say dry-run does not send')

const fnSource = readFileSync(new URL('../netlify/functions/email-status.ts', import.meta.url), 'utf8')
assert(fnSource.includes('emailStatusDryRunFields'), 'email-status must use the shared dry-run contract')
assert(fnSource.includes('probe.configured'), 'email-status dry-run must follow the Resend probe')
assert(
  !fnSource.includes('dryRunSupported: true'),
  'email-status must not hard-code dryRunSupported: true',
)
assert(!fnSource.includes('Resend /emails'), 'email-status must not call Resend /emails')

if (fail.length) {
  console.error('verify-email-status-dryrun failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-email-status-dryrun: ok')
console.log(`  off  dryRunSupported=${off.dryRunSupported} dryRunSends=${off.dryRunSends}`)
console.log(`  on   dryRunSupported=${on.dryRunSupported} dryRunSends=${on.dryRunSends}`)
console.log(`  note ${on.dryRunNote}`)

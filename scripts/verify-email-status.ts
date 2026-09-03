/**
 * Fail the build if a partial email-status body invents "live" or "key off".
 * Run: npx vite-node scripts/verify-email-status.ts
 */
import { emailStatusFromPayload } from '../src/lib/emailStatus'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-email-status FAIL: ${message}`)
    process.exit(1)
  }
}

assert(emailStatusFromPayload(null) === 'unknown', 'null / SPA HTML is unknown')
assert(emailStatusFromPayload({}) === 'unknown', 'empty JSON must not invent key-off')
assert(
  emailStatusFromPayload({ resendReachable: true }) === 'unknown',
  'reachable without configured must not invent off or live',
)
assert(emailStatusFromPayload({ resendConfigured: false }) === 'off', 'explicit false is off')
assert(
  emailStatusFromPayload({
    resendConfigured: true,
    fromDomainVerified: true,
    resendReachable: true,
  }) === 'live',
  'verified + reachable is live',
)
assert(
  emailStatusFromPayload({
    resendConfigured: true,
    fromDomainVerified: true,
    resendReachable: false,
  }) !== 'live',
  'unreachable Resend must not be live',
)
assert(
  emailStatusFromPayload({
    resendConfigured: true,
    fromDomainVerified: false,
    domainStatus: 'pending',
  }) === 'pending',
  'pending DNS is pending',
)
assert(
  emailStatusFromPayload({
    resendConfigured: true,
    fromDomainVerified: false,
  }) === 'unverified',
  'key without verified domain is unverified',
)

console.log('verify-email-status OK')
console.log(
  JSON.stringify(
    {
      empty: emailStatusFromPayload({}),
      off: emailStatusFromPayload({ resendConfigured: false }),
      live: emailStatusFromPayload({
        resendConfigured: true,
        fromDomainVerified: true,
        resendReachable: true,
      }),
      pending: emailStatusFromPayload({
        resendConfigured: true,
        fromDomainVerified: false,
        domainStatus: 'pending',
      }),
    },
    null,
    2,
  ),
)

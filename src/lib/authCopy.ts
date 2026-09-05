/**
 * Staff auth copy. Never treat a request as a delivered email.
 */

export const AUTH_UNAVAILABLE =
  'Staff login is not live in this build (DEMO). Sign-in, signup, and password reset are not emailed.'

/** After a real Supabase resetPasswordForEmail call — not a delivery receipt. */
export function resetRequestedToast(): string {
  return 'Reset requested. Check that inbox only if a staff account exists — this is not a delivery receipt.'
}

export function signupRequestedToast(): string {
  return 'Staff account requested. Check that inbox only if the station issued this address.'
}

export function resetPendingCopy(email: string): string {
  const who = email.trim() || 'that address'
  return `If ${who} has a staff account, Supabase will email a reset link. This screen is not proof it arrived.`
}

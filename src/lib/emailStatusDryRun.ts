/**
 * email-status dry-run contract.
 *
 * send-invoice only reaches the dry-run branch after RESEND_API_KEY is set.
 * Dry-run probes Resend and never calls /emails — it must never read as a send.
 */

export const EMAIL_STATUS_DRY_RUN_NOTE_READY =
  'Dry-run is available. It does not send mail.'

export const EMAIL_STATUS_DRY_RUN_NOTE_OFF =
  'Dry-run is not available until RESEND_API_KEY is set. It never sends mail.'

export function emailStatusDryRunFields(resendConfigured: boolean): {
  dryRunSupported: boolean
  dryRunSends: false
  dryRunNote: string
} {
  return {
    dryRunSupported: Boolean(resendConfigured),
    dryRunSends: false,
    dryRunNote: resendConfigured
      ? EMAIL_STATUS_DRY_RUN_NOTE_READY
      : EMAIL_STATUS_DRY_RUN_NOTE_OFF,
  }
}

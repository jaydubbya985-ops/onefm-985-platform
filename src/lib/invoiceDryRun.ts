/**
 * send-invoice dry-run JSON. Proving the pipeline can reach Resend is not
 * sending the invoice. Naive `if (payload.success)` must stay false.
 */

export const INVOICE_DRY_RUN_ERROR =
  'Invoice was not sent. This was a dry run — no email left the station.'

export type InvoiceDryRunProbe = {
  configured: boolean
  reachable: boolean
  fromDomainVerified: boolean
  domainStatus: string
  stationDomains: Array<{ name: string; status: string }>
  needJay: string | null
}

export type InvoiceDryRunRequest = {
  to: string
  hasPdf: boolean
  filename?: string | null
  from: string
}

export type InvoiceDryRunPayload = {
  success: false
  dryRun: true
  sent: false
  error: typeof INVOICE_DRY_RUN_ERROR
  resendConfigured: boolean
  resendReachable: boolean
  fromDomainVerified: boolean
  domainStatus: string
  stationDomains: Array<{ name: string; status: string }>
  needJay: string | null
  wouldSendTo: string
  hasPdf: boolean
  filename: string | null
  from: string
}

export function invoiceDryRunPayload(
  probe: InvoiceDryRunProbe,
  request: InvoiceDryRunRequest,
): InvoiceDryRunPayload {
  return {
    success: false,
    dryRun: true,
    sent: false,
    error: INVOICE_DRY_RUN_ERROR,
    resendConfigured: probe.configured,
    resendReachable: probe.reachable,
    fromDomainVerified: probe.fromDomainVerified,
    domainStatus: probe.domainStatus,
    stationDomains: probe.stationDomains.map((d) => ({ name: d.name, status: d.status })),
    needJay: probe.needJay,
    wouldSendTo: request.to,
    hasPdf: request.hasPdf,
    filename: request.filename ?? null,
    from: request.from,
  }
}

import type { Handler, HandlerEvent } from '@netlify/functions'
import { INVOICE_FROM, probeResend } from '../lib/resendProbe'

/**
 * Read-only status for the invoice email pipeline.
 * Reports whether RESEND_API_KEY is set and whether Resend accepts it,
 * without exposing the key, sending mail, or restarting domain verification.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const probe = await probeResend(process.env.RESEND_API_KEY)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({
      resendConfigured: probe.configured,
      resendReachable: probe.reachable,
      fromDomainVerified: probe.fromDomainVerified,
      domainStatus: probe.domainStatus,
      stationDomains: probe.stationDomains.map((d) => ({
        name: d.name,
        status: d.status,
        sending: d.sending,
        records: d.records,
      })),
      needJay: probe.needJay,
      from: INVOICE_FROM,
      dryRunSupported: true,
    }),
  }
}

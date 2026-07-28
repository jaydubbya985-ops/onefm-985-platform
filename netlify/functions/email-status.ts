import type { Handler, HandlerEvent } from '@netlify/functions'

/**
 * Read-only status check for the invoice email pipeline — reports whether
 * RESEND_API_KEY is set on Netlify, WITHOUT ever exposing the key itself.
 * Lets the Ops portal show an accurate "live sends are on/off" banner
 * instead of ops staff discovering it only after clicking Send.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
    }),
  }
}

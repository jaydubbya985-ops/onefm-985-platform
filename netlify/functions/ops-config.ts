/**
 * Runtime ops credentials for the browser.
 *
 * Vite bakes VITE_* at `npm run build`. GitHub Actions deploys often lack those
 * secrets, so #/ops stayed DEMO even when Netlify site env had the keys.
 * This function reads Netlify env at request time — add the keys in the
 * Netlify UI and LIVE mode turns on without another build (once this function
 * is on production).
 *
 * GET /.netlify/functions/ops-config
 *   { configured: false } | { configured: true, url, anonKey }
 *
 * Never returns a service_role / supabase_admin JWT. Those keys start with
 * eyJ like the public anon key — isBrowserSafeAnonKey holds them here.
 */
import type { Handler, HandlerEvent } from '@netlify/functions'
import { isBrowserSafeAnonKey } from '../../src/lib/opsAnonGuard'
import { resolveOpsConfig } from '../../src/lib/opsConfigResolve'

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: jsonHeaders }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const resolved = resolveOpsConfig({
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })

  // resolveOpsConfig accepts any eyJ JWT. Classic service_role keys are eyJ
  // too — never put that payload on the public ops-config response.
  if (!resolved.configured || !isBrowserSafeAnonKey(resolved.anonKey)) {
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ configured: false }),
    }
  }

  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({
      configured: true,
      url: resolved.url,
      anonKey: resolved.anonKey,
    }),
  }
}

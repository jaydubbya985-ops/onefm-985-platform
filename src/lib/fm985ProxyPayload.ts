/**
 * fm985.com.au WordPress proxy. Maintenance pages and SPA fallbacks
 * often arrive as HTML with HTTP 200 — never cache that as the interview API.
 */

export interface Fm985ProxyPayload {
  statusCode: number
  headers: Record<string, string>
  body: string
}

export function fm985ProxyLooksLikeHtml(contentType: string | null, body: string): boolean {
  const type = (contentType ?? '').toLowerCase()
  if (type.includes('text/html')) return true
  const trimmed = body.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<head')
}

export function fm985ProxyLooksLikeJson(body: string): boolean {
  const trimmed = body.trimStart()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

export function fm985ProxyPayload(args: {
  status: number
  contentType: string | null
  body: string
}): Fm985ProxyPayload {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }

  if (fm985ProxyLooksLikeJson(args.body)) {
    return {
      statusCode: args.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': args.status >= 200 && args.status < 300 ? 'public, max-age=300' : 'no-store',
      },
      body: args.body,
    }
  }

  if (!args.body.trim() || fm985ProxyLooksLikeHtml(args.contentType, args.body)) {
    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'fm985 proxy got HTML, not the WordPress API',
      }),
    }
  }

  return {
    statusCode: 502,
    headers: jsonHeaders,
    body: JSON.stringify({ error: 'fm985 proxy got a non-JSON body' }),
  }
}

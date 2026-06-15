import type { Handler, HandlerEvent } from '@netlify/functions'

/** Server-side proxy to fm985.com.au WordPress API (avoids CORS + SPA redirect issues). */
export const handler: Handler = async (event: HandlerEvent) => {
  const rawPath = event.path.replace(/^\/\.netlify\/functions\/fm985-proxy\/?/, '')
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const qs = event.rawQuery ? `?${event.rawQuery}` : ''
  const target = `https://fm985.com.au${path}${qs}`

  try {
    const res = await fetch(target, {
      headers: { Accept: 'application/json', 'User-Agent': 'ONE-FM-Platform/1.0' },
    })
    const body = await res.text()
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body,
    }
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'fm985 proxy unavailable' }) }
  }
}

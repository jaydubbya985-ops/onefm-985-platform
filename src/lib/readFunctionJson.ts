/**
 * Netlify function responses. Missing functions often return the SPA HTML
 * with HTTP 200 — never treat that as JSON success.
 *
 * A UTF-8 BOM on a real JSON body is still JSON. Dressing that as a miss
 * kept #/ops in DEMO and invoice send on mailto.
 */

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function readFunctionJson<T>(res: Response): Promise<T | null> {
  const text = await res.text()
  if (!text) return null

  const type = (res.headers.get('content-type') ?? '').toLowerCase()
  if (type.includes('text/html')) return null

  const body = stripBom(text).trimStart()
  if (!body || body.startsWith('<')) return null

  try {
    const parsed: unknown = JSON.parse(body)
    if (!isPlainObject(parsed)) return null
    return parsed as T
  } catch {
    return null
  }
}

/**
 * Netlify function responses. Missing functions often return the SPA HTML
 * with HTTP 200 — never treat that as JSON success.
 */
export async function readFunctionJson<T>(res: Response): Promise<T | null> {
  const text = await res.text()
  if (!text || text.trimStart().startsWith('<')) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

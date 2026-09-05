/**
 * Last line before ops-config publishes a key to every browser.
 *
 * resolveOpsConfig already rejects sb_secret_ / sb_service prefixes.
 * Classic service_role keys are still JWTs that start with eyJ — the same
 * shape as the public anon key. If that JWT is pasted into SUPABASE_ANON_KEY
 * on Netlify, the function would hand the service role to every visitor.
 *
 * Publishable keys (sb_publishable_...) are browser-safe by design.
 * Legacy JWTs are browser-safe only when the payload role is `anon`.
 */

const BLOCKED_ROLES = new Set(['service_role', 'supabase_admin'])

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const raw =
      typeof atob === 'function'
        ? atob(b64 + pad)
        : Buffer.from(b64 + pad, 'base64').toString('utf8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

/** True only for keys that may leave the Netlify function in a public JSON body. */
export function isBrowserSafeAnonKey(key: string): boolean {
  const trimmed = key.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('sb_secret_') || trimmed.startsWith('sb_service')) return false
  if (trimmed.startsWith('sb_publishable_')) return true
  if (!trimmed.startsWith('eyJ')) return false

  const payload = decodeJwtPayload(trimmed)
  if (!payload) return false
  const role = payload.role
  if (typeof role !== 'string') return false
  if (BLOCKED_ROLES.has(role)) return false
  return role === 'anon'
}

/**
 * Shared LIVE vs DEMO rule for baked Vite env and the Netlify ops-config function.
 * Anon / publishable keys are public by design — same exposure as VITE_* in the bundle.
 */

export type OpsRuntimeConfig =
  | { configured: true; url: string; anonKey: string }
  | { configured: false }

const PLACEHOLDER_KEY_VALUES = new Set([
  'your-anon-key-here',
  'your-publishable-key-here',
])

/** Decode a JWT payload in the browser (atob) or Node (Buffer). Never verifies the signature. */
function jwtPayloadRole(token: string): string | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    if (pad) b64 += '='.repeat(4 - pad)
    const json =
      typeof atob === 'function'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('utf8')
    const parsed = JSON.parse(json) as { role?: unknown }
    return typeof parsed.role === 'string' ? parsed.role : null
  } catch {
    return null
  }
}

/** Accepts legacy JWT anon keys and new publishable keys (sb_publishable_...). Never the secret / service-role key. */
export function isValidSupabaseKey(key: string): boolean {
  if (!key || PLACEHOLDER_KEY_VALUES.has(key)) return false
  if (key.endsWith('.placeholder')) return false
  if (key.startsWith('sb_secret_') || key.startsWith('sb_service')) return false
  if (key.startsWith('sb_publishable_')) return true
  if (!key.startsWith('eyJ')) return false
  const role = jwtPayloadRole(key)
  if (role === 'service_role') return false
  return true
}

function isUsableUrl(url: string): boolean {
  if (!url) return false
  if (url.includes('your-project-id')) return false
  if (url.includes('placeholder.supabase.co')) return false
  return url.includes('supabase.co')
}

/** Resolve ops credentials from a process / Vite env map. */
export function resolveOpsConfig(
  env: Record<string, string | undefined>,
): OpsRuntimeConfig {
  const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim()
  const anonKey = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim()
  if (isUsableUrl(url) && isValidSupabaseKey(anonKey)) {
    return { configured: true, url, anonKey }
  }
  return { configured: false }
}

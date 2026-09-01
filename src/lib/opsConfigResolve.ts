/**
 * Shared LIVE vs DEMO rule for baked Vite env and the Netlify ops-config function.
 * Anon / publishable keys are public by design — same exposure as VITE_* in the bundle.
 *
 * Wrong Cloud/GitHub shapes (project-ref-only URL, sb_secret_) stay DEMO.
 * They must never fail `npm run build` or leak a service-role key into the bundle.
 */

export type OpsRuntimeConfig =
  | { configured: true; url: string; anonKey: string }
  | { configured: false }

const PLACEHOLDER_KEY_VALUES = new Set([
  'your-anon-key-here',
  'your-publishable-key-here',
])

/** Bare project ref — Cloud Agents often paste this instead of the Project URL. */
const PROJECT_REF = /^[a-z0-9]{15,32}$/

/** Accepts legacy JWT anon keys and new publishable keys (sb_publishable_...). Never the secret key. */
export function isValidSupabaseKey(key: string): boolean {
  if (!key || PLACEHOLDER_KEY_VALUES.has(key)) return false
  if (key.endsWith('.placeholder')) return false
  if (key.startsWith('sb_secret_') || key.startsWith('sb_service')) {
    return false
  }
  return key.startsWith('eyJ') || key.startsWith('sb_publishable_')
}

/** Expand a bare project ref → `https://<ref>.supabase.co`. */
export function normalizeSupabaseUrl(raw: string): string {
  const url = raw.trim().replace(/\/$/, '')
  if (!url) return ''
  if (PROJECT_REF.test(url)) return `https://${url}.supabase.co`
  return url
}

function isUsableUrl(url: string): boolean {
  if (!url) return false
  if (url.includes('your-project-id')) return false
  if (url.includes('placeholder.supabase.co')) return false
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)
}

/**
 * Safe to run at Vite boot and in verify-ops-config.
 * Expands a project-ref URL. Drops service-role / secret keys so they cannot be inlined.
 */
export function sanitizeViteSupabaseEnv(
  env: Record<string, string | undefined> = process.env,
): void {
  const rawUrl = (env.VITE_SUPABASE_URL || '').trim()
  if (rawUrl) env.VITE_SUPABASE_URL = normalizeSupabaseUrl(rawUrl)

  const rawKey = (env.VITE_SUPABASE_ANON_KEY || '').trim()
  if (rawKey && !isValidSupabaseKey(rawKey)) {
    env.VITE_SUPABASE_ANON_KEY = ''
  }
}

/** Resolve ops credentials from a process / Vite env map. */
export function resolveOpsConfig(
  env: Record<string, string | undefined>,
): OpsRuntimeConfig {
  const url = normalizeSupabaseUrl(env.VITE_SUPABASE_URL || env.SUPABASE_URL || '')
  const anonKey = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim()
  if (isUsableUrl(url) && isValidSupabaseKey(anonKey)) {
    return { configured: true, url, anonKey }
  }
  return { configured: false }
}

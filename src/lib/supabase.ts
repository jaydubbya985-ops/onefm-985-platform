import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  EnquiryNote,
  EnquiryPriority,
  EnquirySource,
  EnquiryStatus,
} from '@/components/ops/data/enquiries'
import { resolveOpsConfig } from '@/lib/opsConfigResolve'
import { isOpsHash } from '@/lib/opsRoute'
import { readFunctionJson } from '@/lib/readFunctionJson'

export { isValidSupabaseKey } from '@/lib/opsConfigResolve'

export type OpsCredentialSource = 'none' | 'vite' | 'snippet' | 'function'

let credentialSource: OpsCredentialSource = 'none'

/** How LIVE credentials were loaded. `none` means DEMO. */
export function getOpsCredentialSource(): OpsCredentialSource {
  return credentialSource
}

export function opsCredentialSourceLabel(
  source: OpsCredentialSource = credentialSource,
): string {
  switch (source) {
    case 'vite':
      return 'baked into this deploy'
    case 'snippet':
      return 'Netlify snippet'
    case 'function':
      return 'ops-config function'
    default:
      return ''
  }
}

const AUTH_OPTIONS = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  storageKey: 'onefm-supabase-auth',
} as const

const INERT_URL = 'https://placeholder.supabase.co'
const INERT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function makeClient(url: string, key: string): SupabaseClient {
  const resolved = resolveOpsConfig({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: key,
  })
  if (resolved.configured) {
    return createClient(resolved.url, resolved.anonKey, { auth: AUTH_OPTIONS })
  }
  // Never pass a half-valid URL to createClient — it throws before React mounts.
  return createClient(INERT_URL, INERT_KEY, { auth: AUTH_OPTIONS })
}

/** True when real Supabase credentials are configured (not placeholder values). */
export function isSupabaseConfigured(): boolean {
  return resolveOpsConfig({
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
  }).configured
}

// Supabase throws if URL is empty — use inert placeholders until env vars are set.
export let supabase = makeClient(supabaseUrl, supabaseAnonKey)

function applyRuntimeConfig(url: string, anonKey: string): void {
  supabaseUrl = url
  supabaseAnonKey = anonKey
  supabase = makeClient(url, anonKey)
}

function readWindowOpsConfig(): ReturnType<typeof resolveOpsConfig> {
  if (typeof window === 'undefined') return { configured: false }
  const raw = window.__ONEFM_OPS__
  return resolveOpsConfig({
    VITE_SUPABASE_URL: raw?.url,
    VITE_SUPABASE_ANON_KEY: raw?.anonKey,
  })
}

/**
 * Load LIVE credentials when Vite did not bake them:
 * 1. window.__ONEFM_OPS__ (Netlify snippet injection — works with drag-drop deploys)
 * 2. /.netlify/functions/ops-config (Netlify site env at request time)
 *
 * Home / Listen must paint now. Only `#/ops` waits on the function so the
 * LIVE vs DEMO gate is correct. A later navigate to `#/ops` reloads once
 * if the function flipped DEMO → LIVE in the background.
 */
async function fetchOpsConfigFromFunction(): Promise<boolean> {
  if (typeof fetch === 'undefined') return false

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 4000)
  try {
    const res = await fetch('/.netlify/functions/ops-config', {
      method: 'GET',
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    const data = await readFunctionJson<{
      configured?: boolean
      url?: string
      anonKey?: string
    }>(res)
    const resolved = resolveOpsConfig({
      VITE_SUPABASE_URL: data?.configured ? data.url : undefined,
      VITE_SUPABASE_ANON_KEY: data?.configured ? data.anonKey : undefined,
    })
    if (resolved.configured) {
      applyRuntimeConfig(resolved.url, resolved.anonKey)
      credentialSource = 'function'
      initSupabaseAuthRefresh()
      return true
    }
  } catch {
    // Stay DEMO until Netlify env, snippet, or the function exists.
  } finally {
    clearTimeout(timer)
  }
  return false
}

export async function initSupabaseFromRuntime(): Promise<void> {
  if (isSupabaseConfigured()) {
    credentialSource = 'vite'
    initSupabaseAuthRefresh()
    return
  }

  const fromWindow = readWindowOpsConfig()
  if (fromWindow.configured) {
    applyRuntimeConfig(fromWindow.url, fromWindow.anonKey)
    credentialSource = 'snippet'
    initSupabaseAuthRefresh()
    return
  }

  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  if (!isOpsHash(hash)) {
    void fetchOpsConfigFromFunction().then((live) => {
      if (live && typeof window !== 'undefined' && isOpsHash(window.location.hash)) {
        window.location.reload()
      }
    })
    return
  }

  await fetchOpsConfigFromFunction()
}

let authRefreshInitialized = false

/** Pause token refresh when the tab is hidden; resume when visible. */
export function initSupabaseAuthRefresh(): void {
  if (authRefreshInitialized || typeof document === 'undefined') return
  authRefreshInitialized = true

  const syncRefresh = () => {
    if (document.visibilityState === 'visible') {
      void supabase.auth.startAutoRefresh()
    } else {
      void supabase.auth.stopAutoRefresh()
    }
  }

  document.addEventListener('visibilitychange', syncRefresh)
  syncRefresh()
}

// ── Database row types ─────────────────────────────────────────

export interface DbContactEnquiry {
  id: string
  name: string
  email: string
  phone?: string | null
  organization?: string | null
  company?: string | null
  enquiry_type: string
  message: string
  preferred_contact?: string | null
  status: string
  source?: string | null
  subject?: string | null
  priority?: string | null
  notes?: EnquiryNote[] | null
  value?: number | null
  assigned_to?: string | null
  created_at: string
  updated_at?: string | null
}

export interface DbOpsProposal {
  id: string
  enquiry_id?: string | null
  client_name: string
  company?: string | null
  email?: string | null
  source?: string | null
  package_name?: string | null
  tier?: string | null
  value?: number | null
  status: string
  proposal_number?: string | null
  package_id?: string | null
  duration_weeks?: number | null
  notes?: string | null
  valid_until?: string | null
  details?: Record<string, unknown> | null
  created_at: string
  updated_at?: string | null
}

export interface DbOpsContract {
  id: string
  proposal_id?: string | null
  contract_number: string
  company_name: string
  primary_contact: string
  email?: string | null
  campaign_name?: string | null
  description?: string | null
  contract_value?: number | null
  start_date?: string | null
  end_date?: string | null
  status?: string | null
  tier?: string | null
  invoices?: unknown[] | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbOpsInvoice {
  id: string
  number: string
  company: string
  contact_name: string
  email?: string | null
  amount?: number | null
  gst?: number | null
  total?: number | null
  description?: string | null
  period?: string | null
  issue_date?: string | null
  due_date?: string | null
  status?: string | null
  in_batch?: boolean | null
  contract_id?: string | null
  email_subject?: string | null
  email_body?: string | null
  story?: string | null
  notes?: string | null
  paid_date?: string | null
  paid_amount?: number | null
  payment_method?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ContactEnquiry {
  id: string
  name: string
  email: string
  phone?: string
  enquiry_type: string
  message: string
  status: EnquiryStatus
  created_at: string
}

export interface Donation {
  id: string
  amount: number
  donor_name: string
  email: string
  tier: string
  is_anonymous: boolean
  status: 'pending' | 'completed'
  created_at: string
}

/** Map a DB row to the Ops Enquiry shape used in the portal. */
export function dbRowToEnquiry(row: DbContactEnquiry) {
  return {
    id: row.id,
    source: (row.source ?? 'contact') as EnquirySource,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? row.organization ?? undefined,
    subject: row.subject ?? row.enquiry_type,
    message: row.message,
    status: row.status as EnquiryStatus,
    priority: (row.priority ?? 'medium') as EnquiryPriority,
    assignedTo: row.assigned_to ?? undefined,
    notes: Array.isArray(row.notes) ? row.notes : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    value: row.value ?? undefined,
  }
}

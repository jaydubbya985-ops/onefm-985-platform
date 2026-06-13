import { createClient } from '@supabase/supabase-js'
import type {
  EnquiryNote,
  EnquiryPriority,
  EnquirySource,
  EnquiryStatus,
} from '@/components/ops/data/enquiries'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase throws if URL is empty — use inert placeholders until env vars are set.
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co'
const clientKey =
  supabaseAnonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder'

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/** True when real Supabase credentials are configured (not placeholder values). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project-id') &&
      supabaseAnonKey !== 'your-anon-key-here',
  )
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

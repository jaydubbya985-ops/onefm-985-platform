/**
 * Supabase CRUD layer for the Ops portal.
 * When Supabase is not configured, all functions no-op silently.
 */
import {
  supabase,
  isSupabaseConfigured,
  dbRowToEnquiry,
  type DbContactEnquiry,
  type DbOpsProposal,
  type DbOpsContract,
  type DbOpsInvoice,
} from '@/lib/supabase'
import type { Enquiry } from '@/components/ops/data/enquiries'
import type {
  Proposal,
  OpsContract,
  OpsInvoice,
} from '@/components/ops/store'
import type { ContractInvoiceEntry } from '@/components/ops/data/sponsors'

// ── Row mappers ────────────────────────────────────────────────

function proposalToRow(p: Proposal): DbOpsProposal {
  return {
    id: p.id,
    enquiry_id: p.enquiryId ?? null,
    client_name: p.clientName,
    company: p.company ?? null,
    email: p.email ?? null,
    source: p.source ?? null,
    package_name: p.packageName ?? null,
    tier: p.tier ?? null,
    value: p.value,
    status: p.status,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }
}

function rowToProposal(row: DbOpsProposal): Proposal {
  return {
    id: row.id,
    enquiryId: row.enquiry_id ?? undefined,
    clientName: row.client_name,
    company: row.company ?? undefined,
    email: row.email ?? undefined,
    source: (row.source as Proposal['source']) ?? undefined,
    packageName: row.package_name ?? undefined,
    tier: row.tier ?? undefined,
    value: row.value ?? 0,
    status: row.status as Proposal['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

function contractToRow(c: OpsContract): DbOpsContract {
  return {
    id: c.id,
    proposal_id: c.proposalId ?? null,
    contract_number: c.contractNumber,
    company_name: c.companyName,
    primary_contact: c.primaryContact,
    email: c.email,
    campaign_name: c.campaignName,
    description: c.description,
    contract_value: c.contractValue,
    start_date: c.startDate,
    end_date: c.endDate,
    status: c.status,
    tier: c.tier,
    invoices: c.invoices,
  }
}

function rowToContract(row: DbOpsContract): OpsContract {
  return {
    id: row.id,
    proposalId: row.proposal_id ?? undefined,
    contractNumber: row.contract_number,
    companyName: row.company_name,
    primaryContact: row.primary_contact,
    email: row.email ?? '',
    campaignName: row.campaign_name ?? '',
    description: row.description ?? '',
    contractValue: row.contract_value ?? 0,
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    status: (row.status ?? 'pending') as OpsContract['status'],
    tier: row.tier ?? '',
    invoices: Array.isArray(row.invoices)
      ? (row.invoices as ContractInvoiceEntry[])
      : [],
  }
}

function invoiceToRow(i: OpsInvoice): DbOpsInvoice {
  return {
    id: i.id,
    number: i.number,
    company: i.company,
    contact_name: i.contactName,
    email: i.email,
    amount: i.amount,
    gst: i.gst,
    total: i.total,
    description: i.description,
    period: i.period,
    issue_date: i.issueDate,
    due_date: i.dueDate,
    status: i.status,
    in_batch: i.inBatch,
    contract_id: i.contractId ?? null,
    email_subject: i.emailSubject ?? null,
    email_body: i.emailBody ?? null,
    story: i.story ?? null,
    notes: i.notes ?? null,
    paid_date: i.paidDate ?? null,
    paid_amount: i.paidAmount ?? null,
    payment_method: i.paymentMethod ?? null,
  }
}

function rowToInvoice(row: DbOpsInvoice): OpsInvoice {
  return {
    id: row.id,
    number: row.number,
    company: row.company,
    contactName: row.contact_name,
    email: row.email ?? '',
    amount: row.amount ?? 0,
    gst: row.gst ?? 0,
    total: row.total ?? 0,
    description: row.description ?? '',
    period: row.period ?? '',
    issueDate: row.issue_date ?? '',
    dueDate: row.due_date ?? '',
    status: (row.status ?? 'draft') as OpsInvoice['status'],
    inBatch: row.in_batch ?? false,
    contractId: row.contract_id ?? undefined,
    emailSubject: row.email_subject ?? undefined,
    emailBody: row.email_body ?? undefined,
    story: row.story ?? undefined,
    notes: row.notes ?? undefined,
    paidDate: row.paid_date ?? undefined,
    paidAmount: row.paid_amount ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
  }
}

function enquiryToRow(e: Enquiry): Partial<DbContactEnquiry> {
  return {
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone,
    organization: e.company ?? null,
    company: e.company ?? null,
    enquiry_type: e.subject,
    message: e.message,
    status: e.status,
    source: e.source,
    subject: e.subject,
    priority: e.priority,
    notes: e.notes,
    value: e.value ?? null,
  }
}

// ── Load all ───────────────────────────────────────────────────

export interface OpsRemoteState {
  enquiries: Enquiry[]
  proposals: Proposal[]
  contracts: OpsContract[]
  invoices: OpsInvoice[]
}

export async function loadAll(): Promise<{
  state: OpsRemoteState
  hasData: boolean
}> {
  const empty: OpsRemoteState = {
    enquiries: [],
    proposals: [],
    contracts: [],
    invoices: [],
  }

  if (!isSupabaseConfigured()) return { state: empty, hasData: false }

  const [enqRes, propRes, conRes, invRes] = await Promise.all([
    supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('ops_proposals').select('*').order('created_at', { ascending: false }),
    supabase.from('ops_contracts').select('*').order('created_at', { ascending: false }),
    supabase.from('ops_invoices').select('*').order('created_at', { ascending: false }),
  ])

  const enquiries = (enqRes.data ?? []).map((r) =>
    dbRowToEnquiry(r as DbContactEnquiry),
  )
  const proposals = (propRes.data ?? []).map((r) => rowToProposal(r as DbOpsProposal))
  const contracts = (conRes.data ?? []).map((r) => rowToContract(r as DbOpsContract))
  const invoices = (invRes.data ?? []).map((r) => rowToInvoice(r as DbOpsInvoice))

  const hasData =
    enquiries.length > 0 ||
    proposals.length > 0 ||
    contracts.length > 0 ||
    invoices.length > 0

  return { state: { enquiries, proposals, contracts, invoices }, hasData }
}

/** Seed remote DB from local demo data (first-time setup). */
export async function seedAll(state: OpsRemoteState): Promise<void> {
  if (!isSupabaseConfigured()) return

  // Only seed enquiries that use UUID-compatible ids or skip mock ENQ-* ids
  const remoteEnquiries = state.enquiries
    .filter((e) => !e.id.startsWith('ENQ-'))
    .map(enquiryToRow)

  if (remoteEnquiries.length) {
    await supabase.from('contact_enquiries').upsert(remoteEnquiries)
  }

  if (state.proposals.length) {
    await supabase
      .from('ops_proposals')
      .upsert(state.proposals.map(proposalToRow))
  }
  if (state.contracts.length) {
    await supabase
      .from('ops_contracts')
      .upsert(state.contracts.map(contractToRow))
  }
  if (state.invoices.length) {
    await supabase
      .from('ops_invoices')
      .upsert(state.invoices.map(invoiceToRow))
  }
}

// ── Enquiry mutations ──────────────────────────────────────────

export async function upsertEnquiry(enquiry: Enquiry): Promise<void> {
  if (!isSupabaseConfigured()) return
  // Skip mock seed IDs — they aren't valid UUIDs for contact_enquiries
  if (enquiry.id.startsWith('ENQ-')) return
  await supabase.from('contact_enquiries').upsert(enquiryToRow(enquiry))
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Enquiry>,
): Promise<void> {
  if (!isSupabaseConfigured() || id.startsWith('ENQ-')) return
  const row: Record<string, unknown> = {}
  if (patch.status) row.status = patch.status
  if (patch.priority) row.priority = patch.priority
  if (patch.assignedTo !== undefined) row.assigned_to = patch.assignedTo
  if (patch.notes) row.notes = patch.notes
  if (patch.value !== undefined) row.value = patch.value
  if (Object.keys(row).length) {
    await supabase.from('contact_enquiries').update(row).eq('id', id)
  }
}

// ── Proposal mutations ─────────────────────────────────────────

export async function upsertProposal(proposal: Proposal): Promise<void> {
  if (!isSupabaseConfigured()) return
  await supabase.from('ops_proposals').upsert(proposalToRow(proposal))
}

export async function updateProposal(
  id: string,
  patch: Partial<Proposal>,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.status) row.status = patch.status
  if (patch.value !== undefined) row.value = patch.value
  if (patch.packageName) row.package_name = patch.packageName
  if (patch.tier) row.tier = patch.tier
  await supabase.from('ops_proposals').update(row).eq('id', id)
}

// ── Contract mutations ─────────────────────────────────────────

export async function upsertContract(contract: OpsContract): Promise<void> {
  if (!isSupabaseConfigured()) return
  await supabase.from('ops_contracts').upsert(contractToRow(contract))
}

export async function updateContract(
  id: string,
  patch: Partial<OpsContract>,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const row: Record<string, unknown> = {}
  if (patch.status) row.status = patch.status
  if (patch.contractValue !== undefined) row.contract_value = patch.contractValue
  if (Object.keys(row).length) {
    await supabase.from('ops_contracts').update(row).eq('id', id)
  }
}

// ── Invoice mutations ──────────────────────────────────────────

export async function upsertInvoice(invoice: OpsInvoice): Promise<void> {
  if (!isSupabaseConfigured()) return
  await supabase.from('ops_invoices').upsert(invoiceToRow(invoice))
}

export async function updateInvoice(
  id: string,
  patch: Partial<OpsInvoice>,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const row: Record<string, unknown> = {}
  if (patch.status) row.status = patch.status
  if (patch.inBatch !== undefined) row.in_batch = patch.inBatch
  if (patch.paidAmount !== undefined) row.paid_amount = patch.paidAmount
  if (patch.paidDate) row.paid_date = patch.paidDate
  if (patch.paymentMethod) row.payment_method = patch.paymentMethod
  if (Object.keys(row).length) {
    await supabase.from('ops_invoices').update(row).eq('id', id)
  }
}

export async function updateInvoicesBatch(
  ids: string[],
  patch: Partial<OpsInvoice>,
): Promise<void> {
  if (!isSupabaseConfigured() || !ids.length) return
  const row: Record<string, unknown> = {}
  if (patch.status) row.status = patch.status
  await supabase.from('ops_invoices').update(row).in('id', ids)
}

// Re-export mappers for realtime handlers
export { dbRowToEnquiry, rowToProposal, rowToContract, rowToInvoice }

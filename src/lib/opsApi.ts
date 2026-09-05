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
import { isRealSponsorInvoiceNumber } from '@/components/ops/data/invoices'
import {
  opsLoadFromResults,
  recordOpsLoad,
} from '@/lib/opsLoadStatus'

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
    proposal_number: p.number ?? null,
    package_id: p.packageId ?? null,
    duration_weeks: p.durationWeeks ?? null,
    notes: p.notes ?? null,
    valid_until: p.validUntil ?? null,
    details: {
      deliverables: p.deliverables ?? [],
      gst: p.gst ?? null,
      total: p.total ?? null,
    },
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }
}

function rowToProposal(row: DbOpsProposal): Proposal {
  const details = (row.details ?? {}) as {
    deliverables?: { id: string; name: string }[]
    gst?: number | null
    total?: number | null
  }
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
    number: row.proposal_number ?? undefined,
    packageId: row.package_id ?? undefined,
    durationWeeks: row.duration_weeks ?? undefined,
    notes: row.notes ?? undefined,
    validUntil: row.valid_until ?? undefined,
    deliverables: details.deliverables,
    gst: details.gst ?? undefined,
    total: details.total ?? undefined,
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
  loadError?: string
}> {
  const empty: OpsRemoteState = {
    enquiries: [],
    proposals: [],
    contracts: [],
    invoices: [],
  }

  if (!isSupabaseConfigured()) {
    recordOpsLoad(opsLoadFromResults(false, []))
    return { state: empty, hasData: false }
  }

  const [enqRes, propRes, conRes, invRes] = await Promise.all([
    supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('ops_proposals').select('*').order('created_at', { ascending: false }),
    supabase.from('ops_contracts').select('*').order('created_at', { ascending: false }),
    supabase.from('ops_invoices').select('*').order('created_at', { ascending: false }),
  ])

  const loadStatus = opsLoadFromResults(true, [
    { table: 'contact_enquiries', error: enqRes.error?.message },
    { table: 'ops_proposals', error: propRes.error?.message },
    { table: 'ops_contracts', error: conRes.error?.message },
    { table: 'ops_invoices', error: invRes.error?.message },
  ])
  recordOpsLoad(loadStatus)
  if (loadStatus.kind === 'error') {
    console.warn('[opsApi] loadAll failed:', loadStatus.failedTables.join(', '))
  }

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

  return {
    state: { enquiries, proposals, contracts, invoices },
    hasData,
    loadError:
      loadStatus.kind === 'error'
        ? `Ledger tables failed: ${loadStatus.failedTables.join(', ')}`
        : undefined,
  }
}

/** Seed only the two real sponsor invoices. Never dump the DEMO batch. */
export async function seedRealSponsorInvoices(invoices: OpsInvoice[]): Promise<void> {
  if (!isSupabaseConfigured()) return
  const real = invoices.filter((i) => isRealSponsorInvoiceNumber(i.number))
  for (const invoice of real) {
    await upsertInvoice(invoice)
  }
}

/** @deprecated Use seedRealSponsorInvoices. Will not write DEMO CRM/invoice rows. */
export async function seedAll(state: OpsRemoteState): Promise<void> {
  await seedRealSponsorInvoices(state.invoices)
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
  const row = proposalToRow(proposal)
  const { error } = await supabase.from('ops_proposals').upsert(row)
  if (error) {
    const core = {
      id: row.id,
      enquiry_id: row.enquiry_id,
      client_name: row.client_name,
      company: row.company,
      email: row.email,
      source: row.source,
      package_name: row.package_name,
      tier: row.tier,
      value: row.value,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
    await supabase.from('ops_proposals').upsert(core)
  }
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
  if (patch.email !== undefined) row.email = patch.email
  if (patch.company !== undefined) row.company = patch.company
  if (patch.clientName) row.client_name = patch.clientName
  if (patch.number) row.proposal_number = patch.number
  if (patch.packageId) row.package_id = patch.packageId
  if (patch.durationWeeks !== undefined) row.duration_weeks = patch.durationWeeks
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.validUntil) row.valid_until = patch.validUntil
  if (
    patch.deliverables ||
    patch.gst !== undefined ||
    patch.total !== undefined
  ) {
    row.details = {
      deliverables: patch.deliverables ?? [],
      gst: patch.gst ?? null,
      total: patch.total ?? null,
    }
  }
  const { error } = await supabase.from('ops_proposals').update(row).eq('id', id)
  if (error) {
    const core: Record<string, unknown> = { updated_at: row.updated_at }
    if (row.status) core.status = row.status
    if (row.value !== undefined) core.value = row.value
    if (row.package_name) core.package_name = row.package_name
    if (row.tier) core.tier = row.tier
    if (row.email !== undefined) core.email = row.email
    if (row.company !== undefined) core.company = row.company
    if (row.client_name) core.client_name = row.client_name
    await supabase.from('ops_proposals').update(core).eq('id', id)
  }
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

export async function upsertInvoice(invoice: OpsInvoice): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('ops_invoices').upsert(invoiceToRow(invoice))
  if (error) {
    console.warn('[opsApi] upsertInvoice failed:', error.message)
    return false
  }
  return true
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

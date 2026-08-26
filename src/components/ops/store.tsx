/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_ENQUIRIES, type Enquiry, type EnquirySource } from './data/enquiries'
import { ALL_BATCH_INVOICES, BILLING_INVOICES, RENEWAL_PROPOSALS } from './data/invoices'
import { MOCK_CONTRACTS, type Contract } from './data/sponsors'
import { addDaysISO, todayISO } from '@/lib/opsClock'
import { isSupabaseConfigured, supabase, dbRowToEnquiry } from '@/lib/supabase'
import type { DbContactEnquiry } from '@/lib/supabase'
import * as opsApi from '@/lib/opsApi'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OpsTab =
  | 'enquiries'
  | 'proposals'
  | 'contracts'
  | 'sponsors'
  | 'schedule'
  | 'invoices'
  | 'batch'
  | 'billing'
  | 'payments'

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export interface Proposal {
  id: string
  number?: string
  enquiryId?: string
  clientName: string
  company?: string
  email?: string
  source?: EnquirySource
  packageId?: string
  packageName?: string
  tier?: string
  durationWeeks?: number
  notes?: string
  validUntil?: string
  deliverables?: { id: string; name: string }[]
  gst?: number
  total?: number
  value: number
  status: ProposalStatus
  createdAt: string
  updatedAt: string
  /** demo = synthetic CRM. renewal = last billed, pending Jay. */
  kind?: 'demo' | 'renewal'
}

export type OpsContract = Contract & { proposalId?: string }

export type OpsInvoiceStatus =
  | 'draft'
  | 'previewed'
  | 'tested'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'

export interface OpsInvoice {
  id: string
  number: string
  company: string
  contactName: string
  email: string
  /** Amount excluding GST */
  amount: number
  gst: number
  total: number
  description: string
  period: string
  issueDate: string
  dueDate: string
  status: OpsInvoiceStatus
  inBatch: boolean
  contractId?: string
  emailSubject?: string
  emailBody?: string
  story?: string
  notes?: string
  paidDate?: string
  paidAmount?: number
  paymentMethod?: string
  batchId?: 'june-2026' | 'aug-2026'
}

export interface NewProposalInput {
  clientName: string
  company?: string
  email?: string
  enquiryId?: string
  source?: EnquirySource
  packageId?: string
  packageName?: string
  tier?: string
  durationWeeks?: number
  notes?: string
  validUntil?: string
  deliverables?: { id: string; name: string }[]
  gst?: number
  total?: number
  value: number
  number?: string
}

export type NewInvoiceInput = Omit<
  OpsInvoice,
  'id' | 'number' | 'status' | 'inBatch'
> & {
  id?: string
  number?: string
  status?: OpsInvoiceStatus
  inBatch?: boolean
}

interface OpsState {
  enquiries: Enquiry[]
  proposals: Proposal[]
  contracts: OpsContract[]
  invoices: OpsInvoice[]
}

export interface OpsStore extends OpsState {
  activeTab: OpsTab
  setActiveTab: (tab: OpsTab) => void
  /** One-click collect: Batch Send opens this invoice (internal id, e.g. inv-003). */
  focusInvoiceId: string | null
  setFocusInvoiceId: (id: string | null) => void
  openInvoiceInBatch: (invoiceId: string) => void
  /** Invoice numbers whose world-class PDF has been emailed (Gagliardi reissue). */
  reissuedNumbers: string[]
  markInvoiceReissued: (invoiceNumber: string) => void
  focusProposalId: string | null
  setFocusProposalId: (id: string | null) => void
  resetDemoData: () => void
  // Enquiries
  updateEnquiry: (id: string, patch: Partial<Enquiry>) => void
  addEnquiryNote: (id: string, text: string) => void
  // Proposals
  createProposalFromEnquiry: (enquiryId: string) => string | null
  addProposal: (input: NewProposalInput) => string
  updateProposal: (id: string, patch: Partial<Proposal>) => void
  sendProposal: (id: string) => void
  acceptProposal: (id: string) => OpsContract | null
  declineProposal: (id: string) => void
  // Contracts
  updateContract: (id: string, patch: Partial<OpsContract>) => void
  generateInvoiceFromContract: (contractId: string) => string | null
  // Invoices
  addInvoice: (invoice: NewInvoiceInput) => string
  updateInvoice: (id: string, patch: Partial<OpsInvoice>) => void
  markInvoicePaid: (id: string, paidAmount: number, method: string) => void
  queueForBatch: (invoiceId: string) => void
  removeFromBatch: (invoiceId: string) => void
  sendBatch: (ids: string[]) => void
}

// ---------------------------------------------------------------------------
// Seed + persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'onefm_ops_v3'
const REISSUED_KEY = 'onefm_ops_reissued_v1'
const SESSION_KEY = 'onefm_ops_session_v1'

function loadReissued(): string[] {
  try {
    const raw = window.localStorage.getItem(REISSUED_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function persistReissued(numbers: string[]) {
  try {
    window.localStorage.setItem(REISSUED_KEY, JSON.stringify(numbers))
  } catch {
    // ignore
  }
}

function loadSession(): { activeTab: OpsTab; focusProposalId: string | null } {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { activeTab?: OpsTab; focusProposalId?: string | null }
      if (parsed.activeTab) {
        return {
          activeTab: parsed.activeTab,
          focusProposalId: parsed.focusProposalId ?? null,
        }
      }
    }
  } catch {
    // ignore
  }
  return { activeTab: 'batch', focusProposalId: null }
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function nextSequential(existing: string[], prefix: string): string {
  let max = 0
  for (const n of existing) {
    if (n.startsWith(prefix)) {
      const num = parseInt(n.slice(prefix.length), 10)
      if (!Number.isNaN(num) && num > max) max = num
    }
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function buildSeedState(): OpsState {
  // Enquiries that already had a proposal out the door get a matching seeded
  // proposal so the Proposals tab starts populated.
  const demoProposals: Proposal[] = MOCK_ENQUIRIES.filter(
    (e) => e.status === 'proposal_sent',
  ).map((e, i) => ({
    id: `prop-seed-${String(i + 1).padStart(3, '0')}`,
    number: `PROP-2026-${String(i + 1).padStart(3, '0')}`,
    enquiryId: e.id,
    clientName: e.name,
    company: e.company,
    email: e.email,
    source: e.source,
    packageName: 'DEMO — do not send',
    value: e.value ?? 0,
    status: 'sent',
    createdAt: e.updatedAt,
    updatedAt: e.updatedAt,
    kind: 'demo',
    notes: 'DEMO DATA. Synthetic CRM row. Do not email.',
  }))

  const renewalProposals: Proposal[] = RENEWAL_PROPOSALS.map((r) => ({
    id: r.id,
    clientName: r.clientName,
    company: r.company,
    email: r.email,
    packageName: `Renewal draft — last billed ${r.lastInvoice}`,
    value: r.value,
    status: 'draft' as const,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
    kind: 'renewal' as const,
    notes: r.notes,
  }))

  const proposals: Proposal[] = [...renewalProposals, ...demoProposals]

  const billingInvoices: OpsInvoice[] = BILLING_INVOICES.map((b) => ({
    id: b.id,
    number: b.number,
    company: b.company,
    contactName: b.contactName,
    email: '',
    amount: b.amount,
    gst: b.gst,
    total: b.total,
    description: 'Sponsorship',
    period: '',
    issueDate: b.issueDate,
    dueDate: b.dueDate,
    status: b.status,
    inBatch: false,
    paidDate: b.paidDate,
    paidAmount: b.paidAmount,
    paymentMethod: b.paymentMethod,
  }))

  const batchInvoices: OpsInvoice[] = ALL_BATCH_INVOICES.map((b) => ({
    id: b.id,
    number: b.number,
    company: b.company,
    contactName: b.contactName,
    email: b.email,
    amount: b.amountExclGst,
    gst: b.gst,
    total: b.total,
    description: b.description,
    period: b.period,
    issueDate: b.createdAt ?? '2026-06-09',
    dueDate: b.dueDate,
    status: b.status,
    inBatch: true,
    emailSubject: b.emailSubject,
    emailBody: b.emailBody,
    story: b.story,
    notes: b.notes,
    batchId: b.batchId ?? 'june-2026',
  }))

  return {
    enquiries: MOCK_ENQUIRIES,
    proposals,
    contracts: MOCK_CONTRACTS,
    invoices: [...billingInvoices, ...batchInvoices],
  }
}

function loadState(): OpsState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OpsState>
      if (
        parsed &&
        Array.isArray(parsed.enquiries) &&
        Array.isArray(parsed.proposals) &&
        Array.isArray(parsed.contracts) &&
        Array.isArray(parsed.invoices)
      ) {
        return parsed as OpsState
      }
    }
  } catch {
    // Corrupt or unavailable storage — fall back to seed data.
  }
  return buildSeedState()
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const OpsContext = createContext<OpsStore | null>(null)

export function OpsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OpsState>(loadState)
  const [activeTab, setActiveTab] = useState<OpsTab>(() => loadSession().activeTab)
  const [focusInvoiceId, setFocusInvoiceId] = useState<string | null>(null)
  const [reissuedNumbers, setReissuedNumbers] = useState<string[]>(loadReissued)
  const [focusProposalId, setFocusProposalId] = useState<string | null>(
    () => loadSession().focusProposalId,
  )
  const [remoteReady, setRemoteReady] = useState(!isSupabaseConfigured())

  // Load from Supabase on mount (when configured + authenticated)
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let cancelled = false

    ;(async () => {
      const { state: remote, hasData } = await opsApi.loadAll()
      if (cancelled) return

      if (hasData) {
        // Merge: remote enquiries + local mock enquiries not yet in DB
        const remoteIds = new Set(remote.enquiries.map((e) => e.id))
        const localOnly = loadState().enquiries.filter((e) => !remoteIds.has(e.id))
        setState({
          enquiries: [...remote.enquiries, ...localOnly],
          proposals: remote.proposals.length ? remote.proposals : loadState().proposals,
          contracts: remote.contracts.length ? remote.contracts : loadState().contracts,
          invoices: remote.invoices.length ? remote.invoices : loadState().invoices,
        })
      }
      setRemoteReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Realtime: new contact form submissions appear in Ops inbox
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const channel = supabase
      .channel('ops-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_enquiries' },
        (payload) => {
          const enquiry = dbRowToEnquiry(payload.new as DbContactEnquiry)
          setState((prev) => {
            if (prev.enquiries.some((e) => e.id === enquiry.id)) return prev
            return { ...prev, enquiries: [enquiry, ...prev.enquiries] }
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contact_enquiries' },
        (payload) => {
          const enquiry = dbRowToEnquiry(payload.new as DbContactEnquiry)
          setState((prev) => ({
            ...prev,
            enquiries: prev.enquiries.map((e) =>
              e.id === enquiry.id ? enquiry : e,
            ),
          }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!remoteReady) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage full / unavailable — keep working in memory.
    }
  }, [state, remoteReady])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          activeTab,
          focusProposalId,
          updatedAt: new Date().toISOString(),
        }),
      )
    } catch {
      // ignore
    }
  }, [activeTab, focusProposalId])

  const value = useMemo<OpsStore>(() => {
    const now = () => new Date().toISOString()

    const touchEnquiry = (
      enquiries: Enquiry[],
      id: string | undefined,
      patch: Partial<Enquiry>,
    ): Enquiry[] => {
      if (!id) return enquiries
      return enquiries.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: now() } : e,
      )
    }

    return {
      ...state,
      activeTab,
      setActiveTab,
      focusInvoiceId,
      setFocusInvoiceId,
      openInvoiceInBatch: (invoiceId: string) => {
        setFocusInvoiceId(invoiceId)
        setActiveTab('batch')
      },
      reissuedNumbers,
      markInvoiceReissued: (invoiceNumber: string) => {
        setReissuedNumbers((prev) => {
          if (prev.includes(invoiceNumber)) return prev
          const next = [...prev, invoiceNumber]
          persistReissued(next)
          return next
        })
      },
      focusProposalId,
      setFocusProposalId,

      resetDemoData: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
          window.localStorage.removeItem('onefm_ops_v1')
          window.localStorage.removeItem('onefm_ops_v2')
          window.localStorage.removeItem(REISSUED_KEY)
          window.localStorage.removeItem(SESSION_KEY)
        } catch {
          // ignore
        }
        setReissuedNumbers([])
        setState(buildSeedState())
      },

      updateEnquiry: (id, patch) => {
        setState((prev) => ({
          ...prev,
          enquiries: touchEnquiry(prev.enquiries, id, patch),
        }))
        void opsApi.updateEnquiry(id, patch)
      },

      addEnquiryNote: (id, text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        setState((prev) => {
          const updated = prev.enquiries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  notes: [
                    ...e.notes,
                    {
                      id: `n-${Date.now()}`,
                      text: trimmed,
                      author: 'Current User',
                      createdAt: now(),
                    },
                  ],
                  updatedAt: now(),
                }
              : e,
          )
          const enquiry = updated.find((e) => e.id === id)
          if (enquiry) void opsApi.updateEnquiry(id, { notes: enquiry.notes })
          return { ...prev, enquiries: updated }
        })
      },

      createProposalFromEnquiry: (enquiryId) => {
        const enquiry = state.enquiries.find((e) => e.id === enquiryId)
        if (!enquiry) return null
        const proposal: Proposal = {
          id: `prop-${Date.now()}`,
          number: nextSequential(
            state.proposals.map((p) => p.number ?? ''),
            'PROP-2026-',
          ),
          enquiryId,
          clientName: enquiry.name,
          company: enquiry.company,
          email: enquiry.email,
          source: enquiry.source,
          value: enquiry.value ?? 0,
          status: 'draft',
          createdAt: now(),
          updatedAt: now(),
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        }
        setState((prev) => ({
          ...prev,
          proposals: [proposal, ...prev.proposals],
          enquiries: touchEnquiry(prev.enquiries, enquiryId, {
            status: 'in_progress',
          }),
        }))
        void opsApi.upsertProposal(proposal)
        void opsApi.updateEnquiry(enquiryId, { status: 'in_progress' })
        setFocusProposalId(proposal.id)
        setActiveTab('proposals')
        return proposal.id
      },

      addProposal: (input) => {
        const proposal: Proposal = {
          ...input,
          id: `prop-${Date.now()}`,
          number:
            input.number ??
            nextSequential(
              state.proposals.map((p) => p.number ?? ''),
              'PROP-2026-',
            ),
          status: 'draft',
          createdAt: now(),
          updatedAt: now(),
        }
        setState((prev) => ({
          ...prev,
          proposals: [proposal, ...prev.proposals],
        }))
        void opsApi.upsertProposal(proposal)
        return proposal.id
      },

      updateProposal: (id, patch) => {
        setState((prev) => ({
          ...prev,
          proposals: prev.proposals.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: now() } : p,
          ),
        }))
        void opsApi.updateProposal(id, patch)
      },

      sendProposal: (id) => {
        const proposal = state.proposals.find((p) => p.id === id)
        setState((prev) => ({
          ...prev,
          proposals: prev.proposals.map((p) =>
            p.id === id ? { ...p, status: 'sent', updatedAt: now() } : p,
          ),
          enquiries: touchEnquiry(prev.enquiries, proposal?.enquiryId, {
            status: 'proposal_sent',
          }),
        }))
        void opsApi.updateProposal(id, { status: 'sent' })
        if (proposal?.enquiryId) {
          void opsApi.updateEnquiry(proposal.enquiryId, { status: 'proposal_sent' })
        }
      },

      acceptProposal: (id) => {
        const proposal = state.proposals.find((p) => p.id === id)
        if (!proposal) return null
        const start = new Date()
        const end = new Date()
        if (proposal.durationWeeks && proposal.durationWeeks > 0) {
          end.setDate(start.getDate() + proposal.durationWeeks * 7)
        } else {
          end.setMonth(end.getMonth() + 6)
        }
        const gst = Math.round(proposal.value * 0.1 * 100) / 100
        const deliverableLine = proposal.deliverables?.length
          ? proposal.deliverables.map((d) => d.name).join('; ')
          : null
        const packageType =
          proposal.packageId === 'fb-bronze'
            ? 'football_bronze'
            : proposal.packageId === 'fb-silver'
              ? 'football_silver'
              : proposal.packageId === 'fb-gold'
                ? 'football_gold'
                : proposal.packageId === 'prog-sponsor'
                  ? 'program_sponsorship'
                  : 'custom'
        const contract: OpsContract = {
          id: `c-${Date.now()}`,
          contractNumber: nextSequential(
            state.contracts.map((c) => c.contractNumber),
            'ONEFM-C-2026-',
          ),
          companyName: proposal.company ?? proposal.clientName,
          primaryContact: proposal.clientName,
          email: proposal.email ?? '',
          campaignName: proposal.packageName ?? 'Sponsorship Agreement',
          description: deliverableLine
            ? `${proposal.packageName ?? 'Sponsorship'} — ${deliverableLine}`
            : proposal.packageName
              ? `${proposal.packageName} package — from accepted proposal`
              : 'Created from accepted proposal',
          contractValue: proposal.value,
          gst,
          totalValue: Math.round((proposal.value + gst) * 100) / 100,
          startDate: isoDate(start),
          endDate: isoDate(end),
          status: 'pending',
          tier: proposal.tier ?? 'Custom',
          packageType,
          paymentTerms: '14_days',
          billingFrequency: 'one_time',
          invoices: [],
          proposalId: proposal.id,
        }
        setState((prev) => ({
          ...prev,
          proposals: prev.proposals.map((p) =>
            p.id === id ? { ...p, status: 'accepted', updatedAt: now() } : p,
          ),
          enquiries: touchEnquiry(prev.enquiries, proposal.enquiryId, {
            status: 'closed_won',
          }),
          contracts: [contract, ...prev.contracts],
        }))
        void opsApi.updateProposal(id, { status: 'accepted' })
        if (proposal.enquiryId) {
          void opsApi.updateEnquiry(proposal.enquiryId, { status: 'closed_won' })
        }
        void opsApi.upsertContract(contract)
        setActiveTab('contracts')
        return contract
      },

      declineProposal: (id) => {
        const proposal = state.proposals.find((p) => p.id === id)
        setState((prev) => ({
          ...prev,
          proposals: prev.proposals.map((p) =>
            p.id === id ? { ...p, status: 'rejected', updatedAt: now() } : p,
          ),
          enquiries: touchEnquiry(prev.enquiries, proposal?.enquiryId, {
            status: 'closed_lost',
          }),
        }))
        void opsApi.updateProposal(id, { status: 'rejected' })
        if (proposal?.enquiryId) {
          void opsApi.updateEnquiry(proposal.enquiryId, { status: 'closed_lost' })
        }
      },

      updateContract: (id, patch) => {
        setState((prev) => ({
          ...prev,
          contracts: prev.contracts.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }))
        void opsApi.updateContract(id, patch)
      },

      generateInvoiceFromContract: (contractId) => {
        const contract = state.contracts.find((c) => c.id === contractId)
        if (!contract) return null
        const amount =
          contract.amountPerInvoice ??
          (contract.numberOfPeriods
            ? Math.round((contract.contractValue / contract.numberOfPeriods) * 100) / 100
            : contract.contractValue)
        const gst = Math.round(amount * 0.1 * 100) / 100
        const invoice: OpsInvoice = {
          id: `inv-${Date.now()}`,
          number: nextSequential(
            state.invoices.map((i) => i.number),
            'ONEFM-2026-',
          ),
          company: contract.companyName,
          contactName: contract.primaryContact,
          email: contract.email,
          amount,
          gst,
          total: Math.round((amount + gst) * 100) / 100,
          description: `${contract.campaignName} (${contract.contractNumber})`,
          period: `${contract.startDate} – ${contract.endDate}`,
          issueDate: todayISO(),
          dueDate: addDaysISO(todayISO(), 14),
          status: 'draft',
          inBatch: false,
          contractId,
        }
        setState((prev) => ({
          ...prev,
          invoices: [invoice, ...prev.invoices],
        }))
        void opsApi.upsertInvoice(invoice)
        setActiveTab('invoices')
        return invoice.id
      },

      addInvoice: (input) => {
        const invoice: OpsInvoice = {
          ...input,
          id: input.id ?? `inv-${Date.now()}`,
          number:
            input.number ??
            nextSequential(
              state.invoices.map((i) => i.number),
              'ONEFM-2026-',
            ),
          status: input.status ?? 'draft',
          inBatch: input.inBatch ?? false,
        }
        setState((prev) => ({
          ...prev,
          invoices: [invoice, ...prev.invoices],
        }))
        void opsApi.upsertInvoice(invoice)
        return invoice.id
      },

      updateInvoice: (id, patch) => {
        setState((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        }))
        void opsApi.updateInvoice(id, patch)
      },

      markInvoicePaid: (id, paidAmount, method) => {
        const paidDate = isoDate(new Date())
        setState((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: paidAmount >= i.total ? 'paid' : 'partially_paid',
                  paidAmount,
                  paymentMethod: method,
                  paidDate,
                }
              : i,
          ),
        }))
        void opsApi.updateInvoice(id, {
          status: paidAmount >= (state.invoices.find((i) => i.id === id)?.total ?? 0)
            ? 'paid'
            : 'partially_paid',
          paidAmount,
          paymentMethod: method,
          paidDate,
        })
      },

      queueForBatch: (invoiceId) => {
        setState((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) =>
            i.id === invoiceId ? { ...i, inBatch: true } : i,
          ),
        }))
        void opsApi.updateInvoice(invoiceId, { inBatch: true })
      },

      removeFromBatch: (invoiceId) => {
        setState((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) =>
            i.id === invoiceId ? { ...i, inBatch: false } : i,
          ),
        }))
        void opsApi.updateInvoice(invoiceId, { inBatch: false })
      },

      sendBatch: (ids) => {
        const idSet = new Set(ids)
        setState((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) =>
            idSet.has(i.id) ? { ...i, status: 'sent' } : i,
          ),
        }))
        void opsApi.updateInvoicesBatch(ids, { status: 'sent' })
      },
    }
  }, [state, activeTab, focusInvoiceId, reissuedNumbers, focusProposalId])

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>
}

export function useOpsStore(): OpsStore {
  const ctx = useContext(OpsContext)
  if (!ctx) throw new Error('useOpsStore must be used within OpsProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// InvoiceGenerator — restored at full fidelity from the deployed bundle
// (`ll` plus its `ol`/`wa`/`al`/`Ea`/`nl`/`Zt`/`rl`/`Ft` helpers), rewired
// onto useOpsStore().
//
// Features: invoice list with search / status filter / sortable columns,
// six-stat dashboard, manual invoice creation from the sponsor directory,
// contract-driven invoicing with recurring (monthly/quarterly/annual)
// generation, payment recording with partial-payment accumulation,
// per-invoice actions (view, edit, send, mark paid, print/PDF, duplicate,
// delete), batch send/delete, and a printable TAX INVOICE document.
// ---------------------------------------------------------------------------
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  CheckSquare,
  Copy,
  DollarSign,
  Download,
  Eye,
  FileSignature,
  FileText,
  Landmark,
  Package,
  Pencil,
  Plus,
  Receipt,
  Repeat,
  Search,
  Send,
  Square,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useOpsStore,
  type NewInvoiceInput,
  type OpsInvoice,
  type OpsInvoiceStatus,
} from './store'
import {
  ACTIVE_CONTRACTS,
  SPONSOR_DIRECTORY,
  type BillingFrequency,
  type SponsorContract,
} from './invoices/contacts'
import { buildMailtoInvoiceUrl, dispatchInvoiceEmail } from '@/lib/invoiceSend'
import { generateInvoicePdf } from '@/components/ops/InvoiceEmailTemplate'
import { TaxInvoiceLetterhead, TaxInvoicePayTo } from '@/components/ops/TaxInvoiceDocument'
import { EmailServiceBanner } from '@/components/ops/EmailServiceBanner'
import { ageInvoice } from '@/lib/invoiceAging'
import { addDaysISO, calendarDaysBetween, currentMonthKey, formatAuDate, todayISO } from '@/lib/opsClock'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface BillTo {
  name: string
  company: string
  email: string
  address: string
  abn: string
  phone: string
}

type GeneratedInvoiceStatus =
  | 'draft'
  | 'previewed'
  | 'tested'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'

type PaymentMethodKey = 'bank_transfer' | 'credit_card' | 'direct_debit' | 'cash' | 'cheque'

interface GeneratedInvoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  billTo: BillTo
  items: InvoiceLineItem[]
  subtotal: number
  gst: number
  total: number
  status: GeneratedInvoiceStatus
  paidDate?: string
  paidAmount?: number
  paymentMethod?: string
  paymentNotes?: string
  notes?: string
  proposalRef?: string
  contractRef?: string
}

// ---------------------------------------------------------------------------
// Status / payment-method config (bundle `ol`, `wa`, `al`, `Ea`)
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<GeneratedInvoiceStatus, string> = {
  draft: 'bg-[#2A2A2A] text-[#5B8DB8] hover:bg-[#2A2A2A]',
  previewed: 'bg-[#5B8DB8]/20 text-[#5B8DB8] hover:bg-[#5B8DB8]/20',
  tested: 'bg-purple-900/40 text-purple-400 hover:bg-purple-900/40',
  sent: 'bg-[#D4A84B]/20 text-[#D4A84B] hover:bg-[#D4A84B]/20',
  viewed: 'bg-[#5B8DB8]/20 text-[#5B8DB8] hover:bg-[#5B8DB8]/20',
  paid: 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/40',
  overdue: 'bg-[#E31E24]/20 text-[#E31E24] hover:bg-[#E31E24]/20',
  cancelled: 'bg-gray-800 text-gray-400 hover:bg-gray-800',
  partially_paid: 'bg-orange-900/40 text-orange-400 hover:bg-orange-900/40',
}

const STATUS_LABELS: Record<GeneratedInvoiceStatus, string> = {
  draft: 'Draft',
  previewed: 'Previewed',
  tested: 'Tested',
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  partially_paid: 'Partially Paid',
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodKey, string> = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  direct_debit: 'Direct Debit',
  cash: 'Cash',
  cheque: 'Cheque',
}

const FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  none: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

/** Resolves a stored payment method (key or label) to its display label. */
/** Module scope: impure ID generation is allowed outside component render. */
function newInvoiceId(suffix?: number): string {
  return `inv_${Date.now()}${suffix !== undefined ? `_${suffix}` : ''}`
}

function paymentMethodLabel(value?: string): string {
  if (!value) return ''
  return PAYMENT_METHOD_LABELS[value as PaymentMethodKey] ?? value
}

// ---------------------------------------------------------------------------
// Helpers (bundle `nl`, `Se`, `Is`, `cl`, `Zt`, `rl`, `Ft`)
// ---------------------------------------------------------------------------

/** Days past due relative to today. Unsent drafts can be stale without being AR-overdue. */
function daysOverdue(dueDate: string): number {
  return Math.max(0, calendarDaysBetween(dueDate, todayISO()))
}

function fmt(value: number): string {
  return (
    '$' + value.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  )
}

function fmtDate(value: string): string {
  return formatAuDate(value.split('T')[0])
}

function nextInvoiceNumber(invoices: GeneratedInvoice[]): string {
  const max = invoices.reduce((acc, inv) => {
    const match = inv.invoiceNumber.match(/ONEFM-2026-(\d+)/)
    return match ? Math.max(acc, parseInt(match[1], 10)) : acc
  }, 0)
  return `ONEFM-2026-${String(max + 1).padStart(3, '0')}`
}

function fromOps(invoice: OpsInvoice): GeneratedInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.number,
    date: invoice.issueDate.split('T')[0],
    dueDate: invoice.dueDate,
    billTo: {
      name: invoice.contactName || '',
      company: invoice.company || '',
      email: invoice.email || '',
      address: '',
      abn: '',
      phone: '',
    },
    items: [
      {
        description: invoice.description || 'Sponsorship',
        quantity: 1,
        unitPrice: invoice.amount,
        amount: invoice.amount,
      },
    ],
    subtotal: invoice.amount,
    gst: invoice.gst,
    total: invoice.total,
    status: invoice.status || 'draft',
    paidDate: invoice.paidDate,
    paidAmount: invoice.paidAmount,
    paymentMethod: invoice.paymentMethod || undefined,
    paymentNotes: invoice.notes,
    notes: invoice.notes,
    contractRef: invoice.contractId,
  }
}

/** Statuses outside the store's union are coerced to their nearest stage. */
function toOpsStatus(status: GeneratedInvoiceStatus): OpsInvoiceStatus {
  if (status === 'viewed') return 'sent'
  if (status === 'cancelled') return 'draft'
  return status
}

function toOps(invoice: GeneratedInvoice): NewInvoiceInput {
  return {
    id: invoice.id,
    number: invoice.invoiceNumber,
    company: invoice.billTo.company,
    contactName: invoice.billTo.name,
    email: invoice.billTo.email,
    amount: invoice.subtotal,
    gst: invoice.gst,
    total: invoice.total,
    description: invoice.items.map((i) => i.description).join('; ') || 'Sponsorship',
    period: invoice.notes || '',
    issueDate: invoice.date,
    dueDate: invoice.dueDate,
    status: toOpsStatus(invoice.status || 'draft'),
    emailSubject: `Your ONE FM 98.5 Invoice — ${invoice.billTo.company}`,
    emailBody: `Please find attached your invoice ${invoice.invoiceNumber}.`,
    contractId: invoice.contractRef,
    paymentMethod: invoice.paymentMethod,
    notes: invoice.notes,
  }
}

const emptyItem = (): InvoiceLineItem => ({ description: '', quantity: 1, unitPrice: 0, amount: 0 })

type SortKey = 'date' | 'amount' | 'status' | 'company'

// ---------------------------------------------------------------------------
// Component (bundle `ll`)
// ---------------------------------------------------------------------------

export default function InvoiceGenerator() {
  const {
    invoices: storeInvoices,
    addInvoice,
    updateInvoice,
    markInvoicePaid,
    queueForBatch,
    setActiveTab,
  } = useOpsStore()

  // Local view models created before the store round-trip (deployed kept the
  // same merged structure); the store version wins once a record exists there.
  const [localInvoices, setLocalInvoices] = useState<GeneratedInvoice[]>([])
  // The store has no delete API, so deletions are tracked locally.
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  const invoices = useMemo<GeneratedInvoice[]>(() => {
    const merged = new Map<string, GeneratedInvoice>()
    storeInvoices.map(fromOps).forEach((inv) => merged.set(inv.id, inv))
    localInvoices.forEach((inv) => {
      if (!merged.has(inv.id)) merged.set(inv.id, inv)
    })
    return Array.from(merged.values()).filter((inv) => !removedIds.has(inv.id))
  }, [storeInvoices, localInvoices, removedIds])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [viewInvoice, setViewInvoice] = useState<GeneratedInvoice | null>(null)
  const [payInvoice, setPayInvoice] = useState<GeneratedInvoice | null>(null)
  const [editInvoice, setEditInvoice] = useState<GeneratedInvoice | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [mainTab, setMainTab] = useState('invoices')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchMode, setBatchMode] = useState(false)

  // Contract tab state
  const [contractId, setContractId] = useState('')
  const [contractSponsor, setContractSponsor] = useState('')
  const [contractItems, setContractItems] = useState<InvoiceLineItem[]>([emptyItem()])
  const [contractDate, setContractDate] = useState(todayISO)
  const [contractDueDate, setContractDueDate] = useState(() => addDaysISO(todayISO(), 14))
  const [contractNotes, setContractNotes] = useState('')
  const [contractProposalRef, setContractProposalRef] = useState('')
  const [recurring, setRecurring] = useState<BillingFrequency>('none')

  // Create dialog state
  const [sponsorCompany, setSponsorCompany] = useState('')
  const [createDueDate, setCreateDueDate] = useState(() => addDaysISO(todayISO(), 14))
  const [createNotes, setCreateNotes] = useState('')
  const [createItems, setCreateItems] = useState<InvoiceLineItem[]>([emptyItem()])
  const [createProposalRef, setCreateProposalRef] = useState('')

  // Payment dialog state
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethodKey>('bank_transfer')
  const [payNotes, setPayNotes] = useState('')

  const sponsor = SPONSOR_DIRECTORY.find((s) => s.company === sponsorCompany)
  const contract = ACTIVE_CONTRACTS.find((c) => c.id === contractId)
  const contractSponsorContact = SPONSOR_DIRECTORY.find((s) => s.company === contractSponsor)

  const filtered = useMemo(() => {
    const list = invoices.filter((inv) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.billTo.company.toLowerCase().includes(q) ||
        inv.billTo.name.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
    list.sort((a, b) => {
      let diff = 0
      switch (sortKey) {
        case 'date':
          diff = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          diff = a.total - b.total
          break
        case 'status':
          diff = a.status.localeCompare(b.status)
          break
        case 'company':
          diff = a.billTo.company.localeCompare(b.billTo.company)
          break
      }
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [invoices, search, statusFilter, sortKey, sortDir])

  const stats = useMemo(() => {
    const outstanding = invoices
      .filter((i) => i.status === 'sent' || i.status === 'viewed' || i.status === 'partially_paid')
      .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0)
    const overdueTotal = invoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0)
    const paidThisMonth = invoices
      .filter(
        (i) =>
          (i.status === 'paid' || i.status === 'partially_paid') &&
          i.paidDate &&
          i.paidDate.startsWith(currentMonthKey()),
      )
      .reduce((sum, i) => sum + (i.paidAmount || 0), 0)
    const totalPaid = invoices
      .filter((i) => i.status === 'paid' || i.status === 'partially_paid')
      .reduce((sum, i) => sum + (i.paidAmount || 0), 0)
    const readyToSend = invoices.filter((i) => i.status === 'draft').length
    return {
      outstanding,
      overdueTotal,
      paidThisMonth,
      totalPaid,
      totalCount: invoices.length,
      readyToSend,
    }
  }, [invoices])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  // -------------------------------------------------------------------------
  // Create dialog line items
  // -------------------------------------------------------------------------

  function addCreateItem() {
    setCreateItems([...createItems, emptyItem()])
  }

  function removeCreateItem(index: number) {
    if (createItems.length <= 1) return
    setCreateItems(createItems.filter((_, i) => i !== index))
  }

  function updateCreateItem(index: number, patch: Partial<InvoiceLineItem>) {
    setCreateItems((items) =>
      items.map((item, i) => {
        if (i !== index) return item
        const next = { ...item, ...patch }
        next.amount = next.quantity * next.unitPrice
        return next
      }),
    )
  }

  const createSubtotal = createItems.reduce((sum, i) => sum + i.amount, 0)
  const createGst = createSubtotal * 0.1
  const createTotal = createSubtotal + createGst

  function handleCreateInvoice() {
    if (!sponsor || !createDueDate) return
    const items = createItems.filter((i) => i.description.trim() && i.amount > 0)
    if (items.length === 0) return
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
    const gst = subtotal * 0.1
    const invoice: GeneratedInvoice = {
      id: newInvoiceId(),
      invoiceNumber: nextInvoiceNumber(invoices),
      date: todayISO(),
      dueDate: createDueDate,
      billTo: { ...sponsor },
      items,
      subtotal,
      gst,
      total: subtotal + gst,
      status: 'draft',
      notes: createNotes,
      proposalRef: createProposalRef || undefined,
    }
    setLocalInvoices([invoice, ...invoices])
    addInvoice(toOps(invoice))
    setCreateOpen(false)
    resetCreateForm()
  }

  function resetCreateForm() {
    setSponsorCompany('')
    setCreateDueDate(addDaysISO(todayISO(), 14))
    setCreateNotes('')
    setCreateItems([emptyItem()])
    setCreateProposalRef('')
  }

  // -------------------------------------------------------------------------
  // Contract tab line items
  // -------------------------------------------------------------------------

  function addContractItem() {
    setContractItems([...contractItems, emptyItem()])
  }

  function removeContractItem(index: number) {
    if (contractItems.length <= 1) return
    setContractItems(contractItems.filter((_, i) => i !== index))
  }

  function updateContractItem(index: number, patch: Partial<InvoiceLineItem>) {
    setContractItems((items) =>
      items.map((item, i) => {
        if (i !== index) return item
        const next = { ...item, ...patch }
        next.amount = next.quantity * next.unitPrice
        return next
      }),
    )
  }

  const contractSubtotal = contractItems.reduce((sum, i) => sum + i.amount, 0)
  const contractGst = contractSubtotal * 0.1
  const contractTotal = contractSubtotal + contractGst

  function handleCreateFromContract() {
    let billTo: BillTo
    if (contract) {
      billTo = {
        name: contract.contactName,
        company: contract.companyName,
        email: contract.email,
        address: contract.address,
        abn: contract.abn,
        phone: contract.phone,
      }
    } else if (contractSponsorContact) {
      billTo = { ...contractSponsorContact }
    } else {
      return
    }
    const items = contractItems.filter((i) => i.description.trim() && i.amount > 0)
    if (items.length === 0) return
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
    const gst = subtotal * 0.1
    const invoice: GeneratedInvoice = {
      id: newInvoiceId(),
      invoiceNumber: nextInvoiceNumber(invoices),
      date: contractDate,
      dueDate: contractDueDate,
      billTo,
      items,
      subtotal,
      gst,
      total: subtotal + gst,
      status: 'draft',
      notes: contractNotes,
      proposalRef: contractProposalRef || undefined,
      contractRef: contract?.id,
    }
    setLocalInvoices([invoice, ...invoices])
    addInvoice(toOps(invoice))
    resetContractForm()
  }

  function handleGenerateRecurring() {
    if (!contract || recurring === 'none') return
    const billTo: BillTo = {
      name: contract.contactName,
      company: contract.companyName,
      email: contract.email,
      address: contract.address,
      abn: contract.abn,
      phone: contract.phone,
    }
    const items = contractItems.filter((i) => i.description.trim() && i.amount > 0)
    if (items.length === 0) return
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
    const gst = subtotal * 0.1
    const stepMonths = recurring === 'monthly' ? 1 : recurring === 'quarterly' ? 3 : 12
    const count = recurring === 'monthly' ? 6 : recurring === 'quarterly' ? 2 : 1
    const generated: GeneratedInvoice[] = []
    for (let i = 0; i < count; i++) {
      const issue = new Date(contract.startDate)
      issue.setMonth(issue.getMonth() + i * stepMonths)
      const due = new Date(issue)
      due.setDate(due.getDate() + 14)
      const invoice: GeneratedInvoice = {
        id: newInvoiceId(i),
        invoiceNumber: nextInvoiceNumber([...invoices, ...generated]),
        date: issue.toISOString().split('T')[0],
        dueDate: due.toISOString().split('T')[0],
        billTo: { ...billTo },
        items: items.map((item) => ({ ...item })),
        subtotal,
        gst,
        total: subtotal + gst,
        status: 'draft',
        notes: `${contractNotes ? contractNotes + '\n' : ''}${FREQUENCY_LABELS[recurring]} invoice ${i + 1} of ${count}`.trim(),
        proposalRef: contractProposalRef || undefined,
        contractRef: contract.id,
      }
      generated.push(invoice)
    }
    setLocalInvoices([...generated, ...invoices])
    generated.forEach((invoice) => addInvoice(toOps(invoice)))
    resetContractForm()
  }

  function resetContractForm() {
    setContractId('')
    setContractSponsor('')
    setContractItems([emptyItem()])
    setContractDate(todayISO())
    setContractDueDate(addDaysISO(todayISO(), 14))
    setContractNotes('')
    setContractProposalRef('')
    setRecurring('none')
  }

  function prefillFromContract(c: SponsorContract) {
    const monthly = c.contractValue / 6
    setContractItems([
      {
        description: `${c.campaign} — ${c.schedule} (${c.period})`,
        quantity: 1,
        unitPrice: recurring === 'monthly' ? monthly : c.contractValue,
        amount: recurring === 'monthly' ? monthly : c.contractValue,
      },
    ])
    setContractNotes(`${c.campaign} Campaign\n${c.schedule}\nPeriod: ${c.period}`)
    setContractProposalRef(c.campaign)
  }

  // -------------------------------------------------------------------------
  // Payment recording (partial-payment accumulation)
  // -------------------------------------------------------------------------

  function handleRecordPayment() {
    if (!payInvoice || !payAmount || !payDate) return
    const amount = parseFloat(payAmount)
    const newPaidAmount = (payInvoice.paidAmount || 0) + amount
    const newStatus: GeneratedInvoiceStatus =
      newPaidAmount >= payInvoice.total ? 'paid' : 'partially_paid'
    setLocalInvoices((list) =>
      list.map((inv) =>
        inv.id === payInvoice.id
          ? {
              ...inv,
              status: newStatus,
              paidDate: payDate,
              paidAmount: newPaidAmount,
              paymentMethod: payMethod,
              paymentNotes: payNotes,
            }
          : inv,
      ),
    )
    markInvoicePaid(payInvoice.id, newPaidAmount, PAYMENT_METHOD_LABELS[payMethod])
    updateInvoice(payInvoice.id, { paidDate: payDate, notes: payNotes || payInvoice.notes })
    setPayInvoice(null)
    setPayAmount('')
    setPayDate('')
    setPayNotes('')
  }

  function handleSaveEdit() {
    if (!editInvoice) return
    setLocalInvoices((list) => list.map((inv) => (inv.id === editInvoice.id ? editInvoice : inv)))
    const patch = toOps(editInvoice)
    updateInvoice(editInvoice.id, {
      issueDate: patch.issueDate,
      dueDate: patch.dueDate,
      description: patch.description,
      amount: patch.amount,
      gst: patch.gst,
      total: patch.total,
      notes: editInvoice.notes,
    })
    setEditInvoice(null)
  }

  async function handleSendInvoice(id: string) {
    const inv = localInvoices.find((i) => i.id === id)
    if (!inv?.billTo.email) return

    const description =
      inv.items.map((item) => item.description).join('; ') || 'Sponsorship'

    const payload = {
      to: inv.billTo.email,
      contactName: inv.billTo.name,
      company: inv.billTo.company,
      number: inv.invoiceNumber,
      email: inv.billTo.email,
      amountExclGst: inv.subtotal,
      gst: inv.gst,
      total: inv.total,
      description,
      period: '',
      dueDate: inv.dueDate,
      issueDate: inv.date,
      emailSubject: `Invoice ${inv.invoiceNumber} from ONE FM 98.5 — ${inv.billTo.company}`,
      emailBody: inv.notes,
      invoiceId: inv.id,
    }

    const result = await dispatchInvoiceEmail(payload)

    if (result.devMode) {
      window.alert(
        `NOT sent — no email service is configured yet. Invoice ${inv.invoiceNumber} was NOT emailed to ${inv.billTo.email}.\n\nUse the Batch Send tab for PDF + mailto fallback, or add RESEND_API_KEY on Netlify.`,
      )
      return
    }

    if (result.success) {
      setLocalInvoices((list) =>
        list.map((i) => (i.id === id ? { ...i, status: 'sent' } : i)),
      )
      updateInvoice(id, { status: 'sent' })
      return
    }

    if (result.usedMailtoFallback) {
      try {
        const pdf = await generateInvoicePdf({
          ...payload,
          contactName: inv.billTo.name,
          company: inv.billTo.company,
        })
        pdf.save(`${inv.invoiceNumber}.pdf`)
      } catch {
        // PDF optional — still open mailto
      }
      window.location.assign(buildMailtoInvoiceUrl(payload))
      setLocalInvoices((list) =>
        list.map((i) => (i.id === id ? { ...i, status: 'sent' } : i)),
      )
      updateInvoice(id, { status: 'sent' })
      window.alert(
        `PDF downloaded. Email client opened for ${inv.billTo.email} — attach ${inv.invoiceNumber}.pdf before sending.`,
      )
      return
    }

    window.alert(result.error ?? `Failed to send invoice ${inv.invoiceNumber}.`)
  }

  function handleDeleteInvoice(id: string) {
    setLocalInvoices((list) => list.filter((inv) => inv.id !== id))
    setRemovedIds((prev) => new Set(prev).add(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((i) => i.id)))
  }

  function handleBatchSend() {
    // This tab doesn't email sponsors itself — queue the selection into the
    // Batch Send tab (real dispatch, PDF attachment, test mode) and jump there.
    const draftIds = Array.from(selectedIds).filter((id) => {
      const inv = invoices.find((i) => i.id === id)
      return inv && inv.status !== 'sent' && inv.status !== 'paid'
    })
    if (draftIds.length === 0) {
      window.alert('Nothing to queue — selected invoice(s) are already sent or paid.')
      return
    }
    draftIds.forEach((id) => queueForBatch(id))
    setSelectedIds(new Set())
    setBatchMode(false)
    setActiveTab('batch')
  }

  function handleBatchDelete() {
    setLocalInvoices((list) => list.filter((inv) => !selectedIds.has(inv.id)))
    setRemovedIds((prev) => {
      const next = new Set(prev)
      selectedIds.forEach((id) => next.add(id))
      return next
    })
    setSelectedIds(new Set())
    setBatchMode(false)
  }

  async function handlePrint(invoice: GeneratedInvoice) {
    const description = invoice.items.map(i => i.description).join(', ') || 'Sponsorship services'
    const doc = await generateInvoicePdf({
      number: invoice.invoiceNumber,
      company: invoice.billTo.company,
      contactName: invoice.billTo.name,
      email: invoice.billTo.email,
      description,
      amountExclGst: invoice.subtotal,
      gst: invoice.gst,
      total: invoice.total,
      dueDate: invoice.dueDate,
      issueDate: invoice.date,
    })
    doc.save(`${invoice.invoiceNumber}.pdf`)
  }

  function handleDuplicate(invoice: GeneratedInvoice) {
    const copy: GeneratedInvoice = {
      ...invoice,
      id: newInvoiceId(),
      invoiceNumber: nextInvoiceNumber(invoices),
      date: todayISO(),
      dueDate: addDaysISO(todayISO(), 14),
      status: 'draft',
      paidDate: undefined,
      paidAmount: undefined,
      paymentMethod: undefined,
      paymentNotes: undefined,
    }
    setLocalInvoices([copy, ...invoices])
    addInvoice(toOps(copy))
  }

  return (
    <div className="min-h-screen bg-[#101010] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#D4A84B]" />
            Invoice Generator
          </h1>
          <p className="text-[#5B8DB8] text-sm mt-1">Create, manage and track ONE FM invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBatchMode(!batchMode)
              setSelectedIds(new Set())
            }}
            className={`border-[#2A2A2A] text-[#5B8DB8] hover:bg-[#2A2A2A]/30 ${
              batchMode ? 'bg-[#D4A84B]/20 text-[#D4A84B] border-[#D4A84B]/50' : ''
            }`}
          >
            {batchMode ? <X className="h-4 w-4 mr-1" /> : <CheckSquare className="h-4 w-4 mr-1" />}
            {batchMode ? 'Cancel' : 'Batch'}
          </Button>
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v)}>
            <TabsList className="bg-[#0E1E38] border border-[#2A2A2A]/50">
              <TabsTrigger
                value="invoices"
                className="data-[state=active]:bg-[#D4A84B] data-[state=active]:text-[#101010] text-[#5B8DB8]"
              >
                Invoices
              </TabsTrigger>
              <TabsTrigger
                value="contracts"
                className="data-[state=active]:bg-[#D4A84B] data-[state=active]:text-[#101010] text-[#5B8DB8]"
              >
                <FileSignature className="h-3.5 w-3.5 mr-1" />
                From Contract
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D4A84B] hover:bg-[#C49A3B] text-[#101010] font-semibold">
                <Plus className="h-4 w-4 mr-2" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0E1E38] border-[#2A2A2A] text-white max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#D4A84B]">Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-1 block">Select Sponsor</label>
                  <Select value={sponsorCompany} onValueChange={setSponsorCompany}>
                    <SelectTrigger className="bg-[#101010] border-[#2A2A2A] text-white">
                      <SelectValue placeholder="Choose a sponsor..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]">
                      {SPONSOR_DIRECTORY.map((s, idx) => (
                        <SelectItem
                          key={`${s.company}-${idx}`}
                          value={s.company}
                          className="text-white hover:bg-[#2A2A2A]"
                        >
                          {s.company} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {sponsor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[#101010] rounded-lg p-3 border border-[#2A2A2A]/50 text-sm space-y-1"
                  >
                    <p>
                      <span className="text-[#5B8DB8]">Bill to:</span> {sponsor.name}
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">Company:</span> {sponsor.company}
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">Email:</span> {sponsor.email}
                    </p>
                    {sponsor.phone && (
                      <p>
                        <span className="text-[#5B8DB8]">Phone:</span> {sponsor.phone}
                      </p>
                    )}
                    {sponsor.address && (
                      <p>
                        <span className="text-[#5B8DB8]">Address:</span> {sponsor.address}
                      </p>
                    )}
                    {sponsor.abn && (
                      <p>
                        <span className="text-[#5B8DB8]">ABN:</span> {sponsor.abn}
                      </p>
                    )}
                  </motion.div>
                )}
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-1 block">
                    Due Date (default 14 days)
                  </label>
                  <Input
                    type="date"
                    value={createDueDate}
                    onChange={(e) => setCreateDueDate(e.target.value)}
                    className="bg-[#101010] border-[#2A2A2A] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-1 block">Proposal Reference</label>
                  <Input
                    value={createProposalRef}
                    onChange={(e) => setCreateProposalRef(e.target.value)}
                    placeholder="e.g. PROP-2026-008"
                    className="bg-[#101010] border-[#2A2A2A] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-2 block">Line Items</label>
                  {createItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-start">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateCreateItem(index, { description: e.target.value })}
                        className="bg-[#101010] border-[#2A2A2A] text-white flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          updateCreateItem(index, { quantity: parseInt(e.target.value) || 0 })
                        }
                        className="bg-[#101010] border-[#2A2A2A] text-white w-16"
                      />
                      <Input
                        type="number"
                        placeholder="$ Price"
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          updateCreateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="bg-[#101010] border-[#2A2A2A] text-white w-24"
                      />
                      <div className="w-24 text-right text-sm text-white pt-2">
                        {fmt(item.amount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCreateItem(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCreateItem}
                    className="border-[#2A2A2A] text-[#5B8DB8] hover:bg-[#2A2A2A]/30"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="bg-[#101010] rounded-lg p-3 border border-[#2A2A2A]/50 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8]">Subtotal</span>
                    <span>{fmt(createSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8]">GST (10%)</span>
                    <span>{fmt(createGst)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#2A2A2A] pt-1 font-semibold text-[#D4A84B]">
                    <span>Total</span>
                    <span>{fmt(createTotal)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-1 block">Notes</label>
                  <Input
                    value={createNotes}
                    onChange={(e) => setCreateNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="bg-[#101010] border-[#2A2A2A] text-white"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCreateOpen(false)
                    resetCreateForm()
                  }}
                  className="text-[#5B8DB8]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvoice}
                  disabled={!sponsor || !createDueDate || createTotal <= 0}
                  className="bg-[#D4A84B] hover:bg-[#C49A3B] text-[#101010] font-semibold"
                >
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {mainTab === 'invoices' && (
        <>
          <EmailServiceBanner />

          {/* Stat cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#D4A84B]/20 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-[#D4A84B]" />
                </div>
                <div>
                  <p className="text-[#5B8DB8] text-xs">Outstanding</p>
                  <p className="text-lg font-bold text-white">{fmt(stats.outstanding)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#E31E24]/20 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-[#5B8DB8] text-xs">Overdue</p>
                  <p className="text-lg font-bold text-[#E31E24]">{fmt(stats.overdueTotal)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-emerald-900/40 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[#5B8DB8] text-xs">Paid This Month</p>
                  <p className="text-lg font-bold text-emerald-400">{fmt(stats.paidThisMonth)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#2A2A2A] p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-[#5B8DB8]" />
                </div>
                <div>
                  <p className="text-[#5B8DB8] text-xs">Total Invoices</p>
                  <p className="text-lg font-bold text-white">{stats.totalCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-blue-900/40 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[#5B8DB8] text-xs">Total Paid</p>
                  <p className="text-lg font-bold text-blue-400">{fmt(stats.totalPaid)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-amber-900/40 p-2 rounded-lg">
                  <Send className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[#5B8DB8] text-xs">Ready to Send</p>
                  <p className="text-lg font-bold text-amber-400">{stats.readyToSend}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search + filter + batch actions */}
          <div className="flex gap-3 mb-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5B8DB8]" />
              <Input
                placeholder="Search by company name or invoice number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0E1E38] border-[#2A2A2A]/50 text-white pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0E1E38] border-[#2A2A2A]/50 text-white w-44">
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[#5B8DB8]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span className="text-[#5B8DB8]">Filter</span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]">
                <SelectItem value="all" className="text-white hover:bg-[#2A2A2A]">
                  All Statuses
                </SelectItem>
                <SelectItem value="draft" className="text-white hover:bg-[#2A2A2A]">
                  Draft
                </SelectItem>
                <SelectItem value="sent" className="text-white hover:bg-[#2A2A2A]">
                  Sent
                </SelectItem>
                <SelectItem value="viewed" className="text-white hover:bg-[#2A2A2A]">
                  Viewed
                </SelectItem>
                <SelectItem value="paid" className="text-white hover:bg-[#2A2A2A]">
                  Paid
                </SelectItem>
                <SelectItem value="partially_paid" className="text-white hover:bg-[#2A2A2A]">
                  Partially Paid
                </SelectItem>
                <SelectItem value="overdue" className="text-white hover:bg-[#2A2A2A]">
                  Overdue
                </SelectItem>
                <SelectItem value="cancelled" className="text-white hover:bg-[#2A2A2A]">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
            {batchMode && selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-[#5B8DB8] text-sm">{selectedIds.size} selected</span>
                <Button
                  size="sm"
                  onClick={handleBatchSend}
                  className="bg-[#D4A84B] hover:bg-[#C49A3B] text-[#101010] font-semibold"
                >
                  <Send className="h-3.5 w-3.5 mr-1" /> Queue for Batch Send
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBatchDelete}
                  className="border-red-800 text-red-400 hover:bg-red-900/30"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </motion.div>
            )}
          </div>

          {/* Invoice table */}
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Invoices</CardTitle>
                {batchMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="text-[#5B8DB8] hover:text-white"
                  >
                    {selectedIds.size === filtered.length ? (
                      <CheckSquare className="h-4 w-4 mr-1" />
                    ) : (
                      <Square className="h-4 w-4 mr-1" />
                    )}
                    Select All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A]/50 hover:bg-transparent">
                    {batchMode && <TableHead className="text-[#5B8DB8] w-10" />}
                    <TableHead
                      className="text-[#5B8DB8] cursor-pointer hover:text-[#D4A84B]"
                      onClick={() => toggleSort('company')}
                    >
                      <span className="flex items-center gap-1">
                        Invoice # <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-[#5B8DB8] cursor-pointer hover:text-[#D4A84B]"
                      onClick={() => toggleSort('company')}
                    >
                      <span className="flex items-center gap-1">
                        Company <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-[#5B8DB8] cursor-pointer hover:text-[#D4A84B]"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center gap-1">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-[#5B8DB8] cursor-pointer hover:text-[#D4A84B]"
                      onClick={() => toggleSort('amount')}
                    >
                      <span className="flex items-center gap-1">
                        Amount <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-[#5B8DB8] cursor-pointer hover:text-[#D4A84B]"
                      onClick={() => toggleSort('status')}
                    >
                      <span className="flex items-center gap-1">
                        Status <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="text-[#5B8DB8]">Overdue</TableHead>
                    <TableHead className="text-[#5B8DB8] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((invoice) => {
                    const overdueDays = daysOverdue(invoice.dueDate)
                    const aged = ageInvoice(
                      { status: invoice.status, dueDate: invoice.dueDate },
                      todayISO(),
                    )
                    const isSelected = selectedIds.has(invoice.id)
                    return (
                      <TableRow
                        key={invoice.id}
                        className={`border-[#2A2A2A]/30 hover:bg-[#101010]/50 transition-colors ${
                          isSelected ? 'bg-[#D4A84B]/5' : ''
                        }`}
                      >
                        {batchMode && (
                          <TableCell className="w-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSelect(invoice.id)}
                              className="text-[#5B8DB8] hover:text-[#D4A84B] p-1"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[#D4A84B]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-[#D4A84B] text-sm">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          {invoice.billTo.company}
                        </TableCell>
                        <TableCell className="text-[#5B8DB8] text-sm">
                          {fmtDate(invoice.date)}
                        </TableCell>
                        <TableCell className="text-white font-medium text-sm">
                          {fmt(invoice.total)}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_STYLES[invoice.status] + ' text-xs font-medium'}>
                            {STATUS_LABELS[invoice.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {aged === 'unsent_stale' ? (
                            <span className="text-amber-400 text-xs font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Unsent · {overdueDays}d
                            </span>
                          ) : invoice.status === 'overdue' ? (
                            <span className="text-[#E31E24] text-xs font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {overdueDays} day
                              {overdueDays !== 1 ? 's' : ''}
                            </span>
                          ) : invoice.status === 'paid' ? (
                            <span className="text-emerald-400 text-xs">
                              Paid {invoice.paidDate ? fmtDate(invoice.paidDate) : ''}
                            </span>
                          ) : invoice.status === 'partially_paid' ? (
                            <span className="text-orange-400 text-xs">
                              {fmt(invoice.paidAmount || 0)} / {fmt(invoice.total)}
                            </span>
                          ) : (
                            <span className="text-[#5B8DB8] text-xs">
                              Due {fmtDate(invoice.dueDate)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewInvoice(invoice)}
                              className="text-[#5B8DB8] hover:text-white p-1"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.status === 'draft' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditInvoice(invoice)}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendInvoice(invoice.id)}
                                  className="text-[#D4A84B] hover:text-[#C49A3B] p-1"
                                  title="Send"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {(invoice.status === 'sent' ||
                              invoice.status === 'viewed' ||
                              invoice.status === 'overdue' ||
                              invoice.status === 'partially_paid') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPayInvoice(invoice)
                                  setPayAmount(String(invoice.total - (invoice.paidAmount || 0)))
                                  setPayDate(todayISO())
                                }}
                                className="text-emerald-400 hover:text-emerald-300 p-1"
                                title="Mark Paid"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(invoice)}
                              className="text-[#D4A84B] hover:text-[#C49A3B] p-1"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(invoice)}
                              className="text-[#5B8DB8] hover:text-white p-1"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={batchMode ? 8 : 7}
                        className="text-center text-[#5B8DB8] py-8"
                      >
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {mainTab === 'contracts' && (
        <div className="space-y-6">
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardHeader>
              <CardTitle className="text-lg text-[#D4A84B] flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Create Invoice from Contract
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Select Existing Contract</label>
                <Select
                  value={contractId}
                  onValueChange={(v) => {
                    setContractId(v)
                    const c = ACTIVE_CONTRACTS.find((x) => x.id === v)
                    if (c) prefillFromContract(c)
                  }}
                >
                  <SelectTrigger className="bg-[#101010] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Choose a contract or select sponsor below..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]">
                    {ACTIVE_CONTRACTS.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-white hover:bg-[#2A2A2A]">
                        {c.companyName} — {c.campaign} ({fmt(c.contractValue)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2A2A2A]/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0E1E38] px-3 text-[#5B8DB8]">OR</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Select from Sponsors</label>
                <Select value={contractSponsor} onValueChange={setContractSponsor}>
                  <SelectTrigger className="bg-[#101010] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Choose a sponsor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]">
                    {SPONSOR_DIRECTORY.map((s, idx) => (
                      <SelectItem
                        key={`${s.company}-${idx}`}
                        value={s.company}
                        className="text-white hover:bg-[#2A2A2A]"
                      >
                        {s.company} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {contract && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#101010] rounded-lg p-4 border border-[#D4A84B]/30 text-sm space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#D4A84B]">{contract.companyName}</h4>
                    <Badge className="bg-[#D4A84B]/20 text-[#D4A84B]">{contract.industry}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p>
                      <span className="text-[#5B8DB8]">Contact:</span> {contract.contactName}
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">Email:</span> {contract.email}
                    </p>
                    {contract.phone && (
                      <p>
                        <span className="text-[#5B8DB8]">Phone:</span> {contract.phone}
                      </p>
                    )}
                    <p>
                      <span className="text-[#5B8DB8]">Campaign:</span> {contract.campaign}
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">Period:</span> {contract.period}
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">Dates:</span> {fmtDate(contract.startDate)} -{' '}
                      {fmtDate(contract.endDate)}
                    </p>
                  </div>
                  <p className="text-[#5B8DB8]">
                    Schedule: <span className="text-white">{contract.schedule}</span>
                  </p>
                  <div className="flex gap-4 pt-1 border-t border-[#2A2A2A]/50 mt-2">
                    <p>
                      <span className="text-[#5B8DB8]">Value:</span>{' '}
                      <span className="text-[#D4A84B] font-semibold">
                        {fmt(contract.contractValue)}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">GST:</span>{' '}
                      <span className="text-white">{fmt(contract.gst)}</span>
                    </p>
                    <p>
                      <span className="text-[#5B8DB8]">Total:</span>{' '}
                      <span className="text-white font-semibold">{fmt(contract.total)}</span>
                    </p>
                  </div>
                </motion.div>
              )}
              {contractSponsorContact && !contract && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#101010] rounded-lg p-3 border border-[#2A2A2A]/50 text-sm space-y-1"
                >
                  <p>
                    <span className="text-[#5B8DB8]">Bill to:</span> {contractSponsorContact.name}
                  </p>
                  <p>
                    <span className="text-[#5B8DB8]">Company:</span>{' '}
                    {contractSponsorContact.company}
                  </p>
                  <p>
                    <span className="text-[#5B8DB8]">Email:</span> {contractSponsorContact.email}
                  </p>
                  {contractSponsorContact.phone && (
                    <p>
                      <span className="text-[#5B8DB8]">Phone:</span> {contractSponsorContact.phone}
                    </p>
                  )}
                  {contractSponsorContact.address && (
                    <p>
                      <span className="text-[#5B8DB8]">Address:</span>{' '}
                      {contractSponsorContact.address}
                    </p>
                  )}
                  {contractSponsorContact.abn && (
                    <p>
                      <span className="text-[#5B8DB8]">ABN:</span> {contractSponsorContact.abn}
                    </p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {(contract || contractSponsorContact) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#5B8DB8] mb-1 block">Invoice Date</label>
                      <Input
                        type="date"
                        value={contractDate}
                        onChange={(e) => setContractDate(e.target.value)}
                        className="bg-[#101010] border-[#2A2A2A] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#5B8DB8] mb-1 block">
                        Due Date (default 14 days)
                      </label>
                      <Input
                        type="date"
                        value={contractDueDate}
                        onChange={(e) => setContractDueDate(e.target.value)}
                        className="bg-[#101010] border-[#2A2A2A] text-white"
                      />
                    </div>
                  </div>
                  {contract && (
                    <div>
                      <label className="text-sm text-[#5B8DB8] mb-1 block">Recurring Billing</label>
                      <Select
                        value={recurring}
                        onValueChange={(v) => setRecurring(v as BillingFrequency)}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]">
                          <SelectItem value="none" className="text-white">
                            One-time Invoice
                          </SelectItem>
                          <SelectItem value="monthly" className="text-white">
                            Monthly (6 invoices)
                          </SelectItem>
                          <SelectItem value="quarterly" className="text-white">
                            Quarterly (2 invoices)
                          </SelectItem>
                          <SelectItem value="annually" className="text-white">
                            Annually (1 invoice)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {recurring !== 'none' && contract && (
                        <p className="text-xs text-[#5B8DB8] mt-1">
                          Will generate {recurring === 'monthly' ? 6 : recurring === 'quarterly' ? 2 : 1}{' '}
                          invoices of{' '}
                          {fmt(
                            contract.contractValue /
                              (recurring === 'monthly' ? 6 : recurring === 'quarterly' ? 2 : 1),
                          )}{' '}
                          each (excl GST)
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-[#5B8DB8] mb-1 block">
                      Proposal / Campaign Reference
                    </label>
                    <Input
                      value={contractProposalRef}
                      onChange={(e) => setContractProposalRef(e.target.value)}
                      placeholder="e.g. GVL 2026 MAJOR"
                      className="bg-[#101010] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#5B8DB8] mb-2 block">Line Items</label>
                    {contractItems.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2 items-start">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateContractItem(index, { description: e.target.value })}
                          className="bg-[#101010] border-[#2A2A2A] text-white flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            updateContractItem(index, { quantity: parseInt(e.target.value) || 0 })
                          }
                          className="bg-[#101010] border-[#2A2A2A] text-white w-16"
                        />
                        <Input
                          type="number"
                          placeholder="$ Price"
                          value={item.unitPrice || ''}
                          onChange={(e) =>
                            updateContractItem(index, { unitPrice: parseFloat(e.target.value) || 0 })
                          }
                          className="bg-[#101010] border-[#2A2A2A] text-white w-24"
                        />
                        <div className="w-24 text-right text-sm text-white pt-2">
                          {fmt(item.amount)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContractItem(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addContractItem}
                      className="border-[#2A2A2A] text-[#5B8DB8] hover:bg-[#2A2A2A]/30"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Item
                    </Button>
                  </div>
                  <div className="bg-[#101010] rounded-lg p-3 border border-[#2A2A2A]/50 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5B8DB8]">Subtotal (excl GST)</span>
                      <span className="text-white">{fmt(contractSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B8DB8]">GST (10%)</span>
                      <span className="text-white">{fmt(contractGst)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#2A2A2A] pt-1 font-semibold text-[#D4A84B] text-base">
                      <span>Total (incl GST)</span>
                      <span>{fmt(contractTotal)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-[#5B8DB8] mb-1 block">Notes</label>
                    <Input
                      value={contractNotes}
                      onChange={(e) => setContractNotes(e.target.value)}
                      placeholder="Internal notes..."
                      className="bg-[#101010] border-[#2A2A2A] text-white"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    {contract && recurring !== 'none' ? (
                      <Button
                        onClick={handleGenerateRecurring}
                        disabled={contractTotal <= 0}
                        className="bg-[#D4A84B] hover:bg-[#C49A3B] text-[#101010] font-semibold flex-1"
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Generate {FREQUENCY_LABELS[recurring]} Invoices
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCreateFromContract}
                        disabled={contractTotal <= 0}
                        className="bg-[#D4A84B] hover:bg-[#C49A3B] text-[#101010] font-semibold flex-1"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Create Invoice
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={resetContractForm}
                      className="border-[#2A2A2A] text-[#5B8DB8] hover:bg-[#2A2A2A]/30"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Landmark className="h-5 w-5 text-[#D4A84B]" />
                Active Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A]/50 hover:bg-transparent">
                    <TableHead className="text-[#5B8DB8]">Company</TableHead>
                    <TableHead className="text-[#5B8DB8]">Campaign</TableHead>
                    <TableHead className="text-[#5B8DB8]">Industry</TableHead>
                    <TableHead className="text-[#5B8DB8]">Period</TableHead>
                    <TableHead className="text-[#5B8DB8]">Value (excl GST)</TableHead>
                    <TableHead className="text-[#5B8DB8]">GST</TableHead>
                    <TableHead className="text-[#5B8DB8]">Total</TableHead>
                    <TableHead className="text-[#5B8DB8]">Start - End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ACTIVE_CONTRACTS.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-[#2A2A2A]/30 hover:bg-[#101010]/50 cursor-pointer"
                      onClick={() => {
                        setContractId(c.id)
                        prefillFromContract(c)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <TableCell className="text-white font-medium text-sm">
                        {c.companyName}
                      </TableCell>
                      <TableCell className="text-[#D4A84B] text-sm">{c.campaign}</TableCell>
                      <TableCell className="text-[#5B8DB8] text-sm">{c.industry}</TableCell>
                      <TableCell className="text-white text-sm">{c.period}</TableCell>
                      <TableCell className="text-white text-sm">{fmt(c.contractValue)}</TableCell>
                      <TableCell className="text-[#5B8DB8] text-sm">{fmt(c.gst)}</TableCell>
                      <TableCell className="text-[#D4A84B] font-semibold text-sm">
                        {fmt(c.total)}
                      </TableCell>
                      <TableCell className="text-[#5B8DB8] text-sm">
                        {fmtDate(c.startDate)} - {fmtDate(c.endDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {ACTIVE_CONTRACTS.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-[#5B8DB8] py-8">
                        No contracts loaded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View / print dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="bg-white text-black max-w-3xl max-h-[85vh] overflow-y-auto print:max-w-none print:max-h-none print:w-full print:overflow-visible print:bg-white print:text-black print:border-none print:shadow-none print:fixed print:inset-0 print:top-0 print:left-0 print:translate-x-0 print:translate-y-0 print:rounded-none print:p-0">
          {viewInvoice && (
            <div className="print-area">
              <TaxInvoiceLetterhead invoiceNumber={viewInvoice.invoiceNumber} />

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Bill To
                  </h4>
                  <p className="font-semibold text-[#101010]">{viewInvoice.billTo.name}</p>
                  <p className="text-gray-700">{viewInvoice.billTo.company}</p>
                  {viewInvoice.billTo.phone && (
                    <p className="text-gray-500 text-sm">{viewInvoice.billTo.phone}</p>
                  )}
                  <p className="text-gray-500 text-sm">{viewInvoice.billTo.email}</p>
                  {viewInvoice.billTo.address && (
                    <p className="text-gray-500 text-sm">{viewInvoice.billTo.address}</p>
                  )}
                  {viewInvoice.billTo.abn && (
                    <p className="text-gray-500 text-sm">ABN: {viewInvoice.billTo.abn}</p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-gray-500">Invoice Date:</span>
                    <span className="font-medium">{fmtDate(viewInvoice.date)}</span>
                  </div>
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-medium">{fmtDate(viewInvoice.dueDate)}</span>
                  </div>
                  {viewInvoice.proposalRef && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-gray-500">Proposal Ref:</span>
                      <span className="font-medium">{viewInvoice.proposalRef}</span>
                    </div>
                  )}
                  {viewInvoice.contractRef && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-gray-500">Contract Ref:</span>
                      <span className="font-medium">{viewInvoice.contractRef}</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-4 text-sm mt-2">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`font-semibold ${
                        viewInvoice.status === 'paid'
                          ? 'text-emerald-600'
                          : viewInvoice.status === 'overdue'
                            ? 'text-[#E31E24]'
                            : viewInvoice.status === 'partially_paid'
                              ? 'text-orange-500'
                              : 'text-[#D4A84B]'
                      }`}
                    >
                      {STATUS_LABELS[viewInvoice.status].toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <table className="w-full mb-6 border-collapse">
                <thead>
                  <tr className="bg-[#101010] text-white">
                    <th className="text-left p-3 text-sm font-semibold">Description</th>
                    <th className="text-center p-3 text-sm font-semibold w-20">Qty</th>
                    <th className="text-right p-3 text-sm font-semibold w-32">Unit Price</th>
                    <th className="text-right p-3 text-sm font-semibold w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInvoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-3 text-sm">{item.description}</td>
                      <td className="p-3 text-sm text-center">{item.quantity}</td>
                      <td className="p-3 text-sm text-right">{fmt(item.unitPrice)}</td>
                      <td className="p-3 text-sm text-right font-medium">{fmt(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-6">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal (excl GST)</span>
                    <span className="font-medium">{fmt(viewInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (10%)</span>
                    <span className="font-medium">{fmt(viewInvoice.gst)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
                    <span className="text-[#101010]">Total (AUD)</span>
                    <span className="text-[#101010]">{fmt(viewInvoice.total)}</span>
                  </div>
                  {viewInvoice.paidAmount !== undefined && viewInvoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-emerald-600 border-t border-gray-200 pt-1">
                        <span>Paid ({paymentMethodLabel(viewInvoice.paymentMethod)})</span>
                        <span className="font-medium">-{fmt(viewInvoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Balance Due</span>
                        <span>{fmt(viewInvoice.total - viewInvoice.paidAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {viewInvoice.notes && (
                <div className="bg-gray-50 p-3 rounded mb-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{viewInvoice.notes}</p>
                </div>
              )}
              {viewInvoice.paymentNotes && (
                <div className="bg-emerald-50 p-3 rounded mb-6">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">
                    Payment Notes
                  </p>
                  <p className="text-sm text-emerald-700">{viewInvoice.paymentNotes}</p>
                </div>
              )}

              <TaxInvoicePayTo reference={viewInvoice.invoiceNumber} />

              <div className="text-xs text-gray-400 border-t border-gray-200 pt-3 space-y-1">
                <p className="font-medium text-gray-500 mb-1">Terms & Conditions</p>
                <p>
                  Payment is due within 14 days of invoice date. Late payments may incur a 5% late
                  fee per month. GST included at 10% where applicable.
                </p>
                <p className="mt-2">For queries, contact accounts@fm985.com.au | (03) 5831 3131</p>
              </div>

              <div className="mt-6 text-center py-4 border-t border-gray-200">
                <p className="text-[#101010] font-semibold text-sm">
                  Thank you for supporting community radio!
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  ONE FM 98.5 — By the community, for the community
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editInvoice} onOpenChange={(open) => !open && setEditInvoice(null)}>
        <DialogContent className="bg-[#0E1E38] border-[#2A2A2A] text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A84B]">
              Edit Invoice {editInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {editInvoice && (
            <div className="space-y-4">
              <div className="bg-[#101010] rounded-lg p-3 border border-[#2A2A2A]/50 text-sm">
                <p>
                  <span className="text-[#5B8DB8]">Company:</span> {editInvoice.billTo.company}
                </p>
                <p>
                  <span className="text-[#5B8DB8]">Bill to:</span> {editInvoice.billTo.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-1 block">Invoice Date</label>
                  <Input
                    type="date"
                    value={editInvoice.date}
                    onChange={(e) => setEditInvoice({ ...editInvoice, date: e.target.value })}
                    className="bg-[#101010] border-[#2A2A2A] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5B8DB8] mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={editInvoice.dueDate}
                    onChange={(e) => setEditInvoice({ ...editInvoice, dueDate: e.target.value })}
                    className="bg-[#101010] border-[#2A2A2A] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Proposal Reference</label>
                <Input
                  value={editInvoice.proposalRef || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, proposalRef: e.target.value })}
                  className="bg-[#101010] border-[#2A2A2A] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Notes</label>
                <Input
                  value={editInvoice.notes || ''}
                  onChange={(e) => setEditInvoice({ ...editInvoice, notes: e.target.value })}
                  className="bg-[#101010] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="bg-[#101010] rounded-lg p-3 border border-[#2A2A2A]/50 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5B8DB8]">Subtotal</span>
                  <span>{fmt(editInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B8DB8]">GST (10%)</span>
                  <span>{fmt(editInvoice.gst)}</span>
                </div>
                <div className="flex justify-between border-t border-[#2A2A2A] pt-1 font-semibold text-[#D4A84B]">
                  <span>Total</span>
                  <span>{fmt(editInvoice.total)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditInvoice(null)} className="text-[#5B8DB8]">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#D4A84B] hover:bg-[#C49A3B] text-[#101010] font-semibold"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={!!payInvoice} onOpenChange={(open) => !open && setPayInvoice(null)}>
        <DialogContent className="bg-[#0E1E38] border-[#2A2A2A] text-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A84B]">
              {payInvoice?.status === 'partially_paid'
                ? 'Record Additional Payment'
                : 'Mark Invoice as Paid'}
            </DialogTitle>
          </DialogHeader>
          {payInvoice && (
            <div className="space-y-4">
              <div className="bg-[#101010] rounded p-3 border border-[#2A2A2A]/50 text-sm">
                <p className="text-[#5B8DB8]">
                  Invoice:{' '}
                  <span className="text-[#D4A84B] font-mono">{payInvoice.invoiceNumber}</span>
                </p>
                <p className="text-[#5B8DB8]">
                  Company: <span className="text-white">{payInvoice.billTo.company}</span>
                </p>
                <p className="text-[#5B8DB8]">
                  Total: <span className="text-white font-semibold">{fmt(payInvoice.total)}</span>
                </p>
                {payInvoice.paidAmount !== undefined && payInvoice.paidAmount > 0 && (
                  <p className="text-[#5B8DB8]">
                    Already Paid:{' '}
                    <span className="text-emerald-400">{fmt(payInvoice.paidAmount)}</span>
                  </p>
                )}
                <p className="text-[#5B8DB8]">
                  Balance:{' '}
                  <span className="text-[#D4A84B] font-semibold">
                    {fmt(payInvoice.total - (payInvoice.paidAmount || 0))}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Payment Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="bg-[#101010] border-[#2A2A2A] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Payment Date</label>
                <Input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="bg-[#101010] border-[#2A2A2A] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Payment Method</label>
                <Select value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethodKey)}>
                  <SelectTrigger className="bg-[#101010] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]">
                    <SelectItem value="bank_transfer" className="text-white">
                      Bank Transfer
                    </SelectItem>
                    <SelectItem value="credit_card" className="text-white">
                      Credit Card
                    </SelectItem>
                    <SelectItem value="direct_debit" className="text-white">
                      Direct Debit
                    </SelectItem>
                    <SelectItem value="cash" className="text-white">
                      Cash
                    </SelectItem>
                    <SelectItem value="cheque" className="text-white">
                      Cheque
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#5B8DB8] mb-1 block">Payment Notes</label>
                <Input
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Ref #12345, bank transfer confirmed"
                  className="bg-[#101010] border-[#2A2A2A] text-white"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayInvoice(null)} className="text-[#5B8DB8]">
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          [data-slot="dialog-overlay"],
          [data-slot="dialog-close"] { display: none !important; }
          [data-slot="dialog-content"] {
            position: static !important;
            transform: none !important;
            inset: auto !important;
            max-width: none !important;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          body * { visibility: hidden !important; }
          .print-area,
          .print-area * { visibility: visible !important; }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-area table { display: table !important; }
          .print-area thead { display: table-header-group !important; }
          .print-area tbody { display: table-row-group !important; }
          .print-area tr { display: table-row !important; }
          .print-area th,
          .print-area td { display: table-cell !important; }
          .print-area .flex { display: flex !important; }
          .print-area .grid { display: grid !important; }
        }
      `}</style>
    </div>
  )
}

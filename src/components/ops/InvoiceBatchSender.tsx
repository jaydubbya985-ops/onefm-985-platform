// ---------------------------------------------------------------------------
// InvoiceBatchSender — restored at full fidelity from the deployed bundle
// (`hp`, `ao`, `xp`, `jt` and friends), rewired onto useOpsStore().
//
// Workflow: draft → previewed → tested → sent → paid, with per-invoice
// preview / test-send / send / receipt actions, batch actions, GST
// verification, Xero CSV export and mailto: email generation.
//
// Note: the deployed bundle set up a batch confirmation dialog state
// ("Send N Invoices?" / "Reset All Invoices?") but never rendered it — the
// dialog markup was missing, so confirms silently never fired. That bug is
// fixed here: the confirm dialog is rendered alongside the single-send dialog.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Copy,
  DollarSign,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Mail,
  Pencil,
  Receipt,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast, type ToastType } from './Toast'
import { EmailServiceBanner } from './EmailServiceBanner'
import { useOpsStore, type OpsInvoice } from './store'
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  generateInvoiceEmailHtml,
  generateInvoicePdf,
  generateReceiptEmailHtml,
} from './InvoiceEmailTemplate'
import InvoiceEmailTemplate from './InvoiceEmailTemplate'
import { TaxInvoiceDocument } from './TaxInvoiceDocument'
import {
  ALL_BATCH_INVOICES,
  AUGUST_BATCH_DUE_DATE,
  BATCH_DUE_DATE,
} from './data/invoices'
import { ageInvoice } from '@/lib/invoiceAging'
import {
  JUNE_BATCH_CREATED,
  calendarDaysBetween,
  formatAuDate,
  formatElapsed,
  todayISO,
} from '@/lib/opsClock'
import { downloadXeroCsv, summariseXeroExport } from './invoices/xeroExport'
import {
  buildMailtoInvoiceUrl,
  DEFAULT_TEST_INBOX,
  dispatchInvoiceBatch,
  dispatchInvoiceEmail,
  dispatchReceiptEmail,
  type InvoiceSendPayload,
} from '@/lib/invoiceSend'

// ---------------------------------------------------------------------------
// Types + status config (bundle `jt`, `ip`)
// ---------------------------------------------------------------------------

type BatchStatus = 'draft' | 'previewed' | 'tested' | 'sent' | 'paid'

interface BatchRow {
  id: string
  number: string
  company: string
  contactName: string
  email: string
  amountExclGst: number
  gst: number
  total: number
  description: string
  period: string
  dueDate: string
  createdAt: string
  story: string
  emailSubject: string
  emailBody: string
  status: BatchStatus
  notes: string
  batchId: 'june-2026' | 'aug-2026'
}

function rowToSendPayload(row: BatchRow, overrideEmail?: string): InvoiceSendPayload {
  return {
    to: overrideEmail || row.email,
    contactName: row.contactName,
    company: row.company,
    number: row.number,
    email: row.email,
    amountExclGst: row.amountExclGst,
    gst: row.gst,
    total: row.total,
    description: row.description,
    period: row.period,
    dueDate: row.dueDate,
    issueDate: row.createdAt,
    emailSubject: row.emailSubject,
    emailBody: row.emailBody,
    invoiceId: row.id,
  }
}

interface ConfirmState {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  variant: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
}

const STATUS_CONFIG: Record<
  BatchStatus,
  { label: string; color: string; bg: string; border: string; icon: ReactNode }
> = {
  draft: {
    label: 'Draft',
    color: 'text-slate-400',
    bg: 'bg-slate-900/60',
    border: 'border-slate-700',
    icon: <FileText className="w-3 h-3" />,
  },
  previewed: {
    label: 'Previewed',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-700',
    icon: <Eye className="w-3 h-3" />,
  },
  tested: {
    label: 'Tested',
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-700',
    icon: <FlaskConical className="w-3 h-3" />,
  },
  sent: {
    label: 'Sent',
    color: 'text-amber-400',
    bg: 'bg-amber-900/30',
    border: 'border-amber-700',
    icon: <Send className="w-3 h-3" />,
  },
  paid: {
    label: 'Paid',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-700',
    icon: <CheckCircle className="w-3 h-3" />,
  },
}

const STATUS_ORDER: BatchStatus[] = ['draft', 'previewed', 'tested', 'sent', 'paid']

// ---------------------------------------------------------------------------
// Helpers (bundle `sa`, `ts`, `Js`)
// ---------------------------------------------------------------------------

const verifyGst = (amountExclGst: number, gst: number): boolean =>
  Math.round(amountExclGst * 0.1 * 100) / 100 === gst

const formatCurrency = (value: number): string =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

/** Store statuses outside the batch flow are shown at their nearest stage. */
function toBatchStatus(status: OpsInvoice['status']): BatchStatus {
  if (status === 'partially_paid' || status === 'overdue') return 'sent'
  return status
}

function toBatchRow(invoice: OpsInvoice): BatchRow {
  return {
    id: invoice.id,
    number: invoice.number,
    company: invoice.company,
    contactName: invoice.contactName,
    email: invoice.email,
    amountExclGst: invoice.amount,
    gst: invoice.gst,
    total: invoice.total,
    description: invoice.description,
    period: invoice.period || '',
    dueDate: invoice.dueDate,
    createdAt: invoice.issueDate,
    story: invoice.story || '',
    emailSubject: invoice.emailSubject || `Invoice ${invoice.number} — ONE FM 98.5`,
    emailBody: invoice.emailBody || '',
    status: toBatchStatus(invoice.status),
    notes: invoice.notes || '',
    batchId: invoice.batchId ?? 'june-2026',
  }
}

// ---------------------------------------------------------------------------
// Stat card (bundle `ao`)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  amount,
  icon,
  accent,
}: {
  label: string
  amount: string
  icon: ReactNode
  accent: string
}) {
  return (
    <Card className="bg-[#161616] border-[#1E293B] relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 ${accent}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#D4A853]/70 mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-[#F4F1EA]">{amount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#1E293B]/60 text-[#D4A853]">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// White A4-style invoice preview (bundle `xp`)
// ---------------------------------------------------------------------------

function InvoicePreview({ invoice }: { invoice: BatchRow }) {
  return (
    <TaxInvoiceDocument
      invoice={{
        number: invoice.number,
        company: invoice.company,
        contactName: invoice.contactName,
        email: invoice.email,
        description: invoice.description,
        period: invoice.period,
        issueDate: invoice.createdAt,
        dueDate: invoice.dueDate,
        amountExclGst: invoice.amountExclGst,
        gst: invoice.gst,
        total: invoice.total,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component (bundle `hp`)
// ---------------------------------------------------------------------------

export default function InvoiceBatchSender() {
  const { toast } = useToast()
  const { invoices, updateInvoice, markInvoicePaid, sendBatch, focusInvoiceId, setFocusInvoiceId } =
    useOpsStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState('invoice')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'all' | 'unsent'>('all')
  const [batchFilter, setBatchFilter] = useState<'all' | 'june-2026' | 'aug-2026'>('all')
  const [testMode, setTestMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'default',
    onConfirm: () => {},
  })
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [testAddress, setTestAddress] = useState('jasonstv1@bigpond.com')
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendTarget, setSendTarget] = useState<BatchRow | null>(null)

  const rows = useMemo<BatchRow[]>(() => {
    const inBatch = invoices.filter((i) => i.inBatch)
    if (inBatch.length > 0) return inBatch.map(toBatchRow)
    // Mirror the deployed fallback: an empty store still shows the June batch.
    return ALL_BATCH_INVOICES.map((b) =>
      toBatchRow({
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
      }),
    )
  }, [invoices])

  const active = useMemo(() => rows.find((r) => r.id === activeId) || null, [rows, activeId])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows
      .filter(
        (r) =>
          r.company.toLowerCase().includes(q) ||
          r.number.toLowerCase().includes(q) ||
          r.contactName.toLowerCase().includes(q),
      )
      .filter((r) => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'unsent') return r.status !== 'sent' && r.status !== 'paid'
        return r.status === statusFilter
      })
      .filter((r) => (batchFilter === 'all' ? true : r.batchId === batchFilter))
  }, [rows, search, statusFilter, batchFilter])

  useEffect(() => {
    if (!focusInvoiceId) return
    setActiveId(focusInvoiceId)
    setDetailTab('invoice')
    setSearch('')
    setStatusFilter('all')
    setBatchFilter('all')
    setFocusInvoiceId(null)
  }, [focusInvoiceId, setFocusInvoiceId])

  const stats = useMemo(() => {
    const selected = rows.filter((r) => selectedIds.has(r.id))
    const selectedAmount = selected.reduce((sum, r) => sum + r.total, 0)
    const total = rows.reduce((sum, r) => sum + r.total, 0)
    const sentAmount = rows
      .filter((r) => r.status === 'sent' || r.status === 'paid')
      .reduce((sum, r) => sum + r.total, 0)
    const paidAmount = rows
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.total, 0)
    const remainingAmount = total - sentAmount
    return {
      total,
      selected: selected.length,
      selectedAmount,
      sent: rows.filter((r) => r.status === 'sent' || r.status === 'paid').length,
      sentAmount,
      paid: rows.filter((r) => r.status === 'paid').length,
      paidAmount,
      remaining: rows.filter((r) => r.status !== 'sent' && r.status !== 'paid').length,
      remainingAmount,
    }
  }, [rows, selectedIds])

  const progress = useMemo(() => {
    if (rows.length === 0) return 0
    const maxScore = rows.length * 4
    const score = rows.reduce((sum, r) => sum + STATUS_ORDER.indexOf(r.status), 0)
    return Math.round((score / maxScore) * 100)
  }, [rows])

  const allSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id))
  const someSelected = filtered.some((r) => selectedIds.has(r.id)) && !allSelected

  useEffect(() => {
    if (active) {
      setEditSubject(active.emailSubject)
      setEditBody(active.emailBody)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id])

  const notify = useCallback(
    (message: string, type: ToastType = 'info') => {
      toast(message, type)
    },
    [toast],
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const filteredIds = filtered.map((r) => r.id)
    const allFilteredSelected = filteredIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id))
      else filteredIds.forEach((id) => next.add(id))
      return next
    })
  }

  const updateStatus = (id: string, status: BatchStatus) => {
    updateInvoice(id, { status })
  }

  const saveEmailContent = (id: string, emailSubject: string, emailBody: string) => {
    updateInvoice(id, { emailSubject, emailBody })
  }

  const handlePreview = (id: string) => {
    updateStatus(id, 'previewed')
    setActiveId(id)
    setDetailTab('invoice')
    notify('Invoice preview opened', 'info')
  }

  const buildEmailHtml = (row: BatchRow): string =>
    generateInvoiceEmailHtml(
      {
        contactName: row.contactName,
        company: row.company,
        invoiceNumber: row.number,
        amountExclGst: row.amountExclGst,
        gst: row.gst,
        total: row.total,
        dueDate: formatDate(row.dueDate),
        customMessage: row.emailBody,
        campaign: row.description,
      },
      BANK_BSB,
      BANK_ACCOUNT,
      BANK_ACCOUNT_NAME,
    )

  const copyHtmlToClipboard = async (row: BatchRow): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(buildEmailHtml(row))
      return true
    } catch {
      return false
    }
  }

  const handleTestSend = async (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    const recipient = testAddress || 'jasonstv1@bigpond.com'
    setSending(true)
    try {
      const payload = {
        ...rowToSendPayload(row, recipient),
        testMode: true as const,
        testRecipient: recipient,
      }
      const result = await dispatchInvoiceEmail(payload)
      if (result.devMode) {
        updateStatus(id, 'tested')
        toast(`Not actually sent — no email service configured (dev mode)`, 'warning')
      } else if (result.success) {
        updateStatus(id, 'tested')
        toast(`Test invoice sent to ${recipient}`, 'success')
      } else if (result.usedMailtoFallback) {
        window.location.href = buildMailtoInvoiceUrl(payload)
        updateStatus(id, 'tested')
        toast(`Resend unavailable — test email opened for ${recipient}`, 'warning')
      } else {
        notify(result.error ?? 'Test send failed', 'error')
      }
    } finally {
      setSending(false)
    }
  }

  const handleSendRequest = (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    if (row.status === 'draft') {
      notify('Preview required before sending', 'warning')
      return
    }
    setSendTarget(row)
    setSendDialogOpen(true)
  }

  const handleConfirmSend = async (row: BatchRow) => {
    setSending(true)
    try {
      const payload = testMode
        ? {
            ...rowToSendPayload(row, testAddress || DEFAULT_TEST_INBOX),
            testMode: true as const,
            testRecipient: testAddress || DEFAULT_TEST_INBOX,
          }
        : rowToSendPayload(row)
      const deliveryTo = testMode ? (testAddress || DEFAULT_TEST_INBOX) : row.email
      const result = await dispatchInvoiceEmail(payload)
      if (result.success && !result.devMode) {
        if (!testMode) sendBatch([row.id])
        else updateStatus(row.id, 'tested')
        notify(
          testMode
            ? `TEST invoice ${row.number} sent to ${deliveryTo}`
            : `Invoice ${row.number} sent to ${row.email} with PDF attached`,
          'success',
        )
      } else {
        // devMode (no email service) or usedMailtoFallback — download PDF and open email client
        try {
          const pdf = await generateInvoicePdf({ ...row, issueDate: row.createdAt })
          pdf.save(`${row.number}.pdf`)
        } catch {
          notify('Failed to generate PDF', 'error')
        }
        window.location.href = buildMailtoInvoiceUrl(payload)
        if (!testMode) sendBatch([row.id])
        else updateStatus(row.id, 'tested')
        notify(
          `PDF downloaded. Email client opened for ${deliveryTo} — attach ${row.number}.pdf before sending.`,
          'warning',
        )
      }
    } finally {
      setSending(false)
      setSendDialogOpen(false)
      setSendTarget(null)
    }
  }

  const handleMarkPaid = (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    markInvoicePaid(id, row.total, 'Bank Transfer')
    notify('Invoice marked as paid', 'success')
  }

  const handleSendReceipt = async (row: BatchRow) => {
    const paymentDate = new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const result = await dispatchReceiptEmail({
      to: row.email,
      contactName: row.contactName,
      company: row.company,
      invoiceNumber: row.number,
      amount: row.total,
      paymentDate,
      paymentMethod: 'Bank Transfer',
      reference: row.number,
    })
    if (result.devMode) {
      notify(`NOT sent — no email service configured yet. Receipt was NOT emailed to ${row.email}.`, 'error')
    } else if (result.success) {
      notify(`Receipt sent to ${row.email}`, 'success')
    } else if (result.usedMailtoFallback) {
      const html = generateReceiptEmailHtml({
        contactName: row.contactName,
        company: row.company,
        invoiceNumber: row.number,
        amount: row.total,
        paymentDate,
        paymentMethod: 'Bank Transfer',
        reference: row.number,
      })
      const subject = encodeURIComponent(`Payment Received — ${row.number} | ONE FM 98.5`)
      const body = encodeURIComponent(`Receipt for ${row.company}.\n\n${html}`)
      window.location.href = `mailto:${row.email}?subject=${subject}&body=${body}`
      notify(`Resend unavailable — receipt email opened for ${row.company}`, 'warning')
    } else {
      notify(result.error ?? 'Failed to send receipt', 'error')
    }
  }

  const handlePreviewSelected = () => {
    const selected = rows.filter((r) => selectedIds.has(r.id))
    if (selected.length === 0) {
      notify('No invoices selected', 'warning')
      return
    }
    selected.forEach((r) => {
      if (r.status === 'draft') updateStatus(r.id, 'previewed')
    })
    notify(`${selected.length} invoices previewed`, 'info')
  }

  const handleTestSelected = async () => {
    const selected = rows.filter((r) => selectedIds.has(r.id))
    if (selected.length === 0) {
      notify('No invoices selected', 'warning')
      return
    }
    const recipient = testAddress || 'jasonstv1@bigpond.com'
    setSending(true)
    try {
      let sent = 0
      let devMode = 0
      for (const r of selected) {
        const result = await dispatchInvoiceEmail({
          ...rowToSendPayload(r, recipient),
          testMode: true,
          testRecipient: recipient,
        })
        if (result.devMode) {
          devMode++
        } else if (result.success || result.usedMailtoFallback) {
          updateStatus(r.id, 'tested')
          sent++
        }
      }
      if (devMode > 0) {
        notify(
          `${devMode} NOT sent — no email service configured (dev mode)${sent ? `; ${sent} sent to ${recipient}` : ''}`,
          'error',
        )
      } else {
        notify(`${sent} test invoices sent to ${recipient}`, sent > 0 ? 'success' : 'error')
      }
    } finally {
      setSending(false)
    }
  }

  const handleSendSelected = () => {
    const selected = rows.filter((r) => selectedIds.has(r.id))
    if (selected.length === 0) {
      notify('No invoices selected', 'warning')
      return
    }
    const drafts = selected.filter((r) => r.status === 'draft')
    if (drafts.length > 0) {
      notify(`${drafts.length} selected invoices have not been previewed`, 'warning')
      return
    }
    const totalValue = selected.reduce((sum, r) => sum + r.total, 0)
    const testInbox = testAddress || DEFAULT_TEST_INBOX
    setConfirm({
      open: true,
      title: testMode
        ? `TEST-send ${selected.length} invoices?`
        : `Send ${selected.length} Invoices?`,
      description: testMode
        ? `TEST MODE: all ${selected.length} emails go to ${testInbox} only — no sponsors. Total value (for reference): ${formatCurrency(totalValue)}.`
        : `LIVE: this will email ${selected.length} sponsors via Resend with PDF attachments. Total value: ${formatCurrency(totalValue)}.`,
      confirmLabel: sending
        ? 'Sending…'
        : testMode
          ? `Test-send ${selected.length}`
          : `Send ${selected.length} Invoices`,
      variant: selected.length > 1 && !testMode ? 'danger' : 'default',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, open: false }))
        setSending(true)
        try {
          const payloads = selected.map((r) => rowToSendPayload(r))
          const actuallySentIds: string[] = []
          const result = await dispatchInvoiceBatch(
            payloads,
            (index, _total, itemResult) => {
              if (itemResult.success && !itemResult.devMode) {
                actuallySentIds.push(selected[index - 1].id)
              } else if (itemResult.usedMailtoFallback) {
                actuallySentIds.push(selected[index - 1].id)
              }
            },
            testMode ? { testMode: true, testRecipient: testInbox } : undefined,
          )
          if (actuallySentIds.length > 0) {
            if (testMode) {
              actuallySentIds.forEach((id) => updateStatus(id, 'tested'))
            } else {
              sendBatch(actuallySentIds)
            }
          }
          if (result.devMode > 0) {
            notify(
              `${result.devMode} invoice(s) NOT sent — no email service configured (dev mode). ${result.sent} real send(s) succeeded.`,
              'error',
            )
          } else {
            notify(
              testMode
                ? `Test batch: ${result.sent} sent to ${testInbox}${result.mailtoFallback ? `, ${result.mailtoFallback} via email client` : ''}${result.failed ? `, ${result.failed} failed` : ''}`
                : `Batch complete: ${result.sent} sent${result.mailtoFallback ? `, ${result.mailtoFallback} via email client` : ''}${result.failed ? `, ${result.failed} failed` : ''} (${formatCurrency(totalValue)})`,
              result.failed > 0 ? 'warning' : 'success',
            )
          }
        } finally {
          setSending(false)
        }
      },
    })
  }

  const handleSaveEmail = () => {
    if (!active) return
    saveEmailContent(active.id, editSubject, editBody)
    notify('Email content saved', 'success')
  }

  const handleReset = () => {
    setConfirm({
      open: true,
      title: 'Reset All Invoices?',
      description:
        'This will reset ALL invoices to draft status and clear all selections. Email content changes will be preserved.',
      confirmLabel: 'Reset All',
      variant: 'danger',
      onConfirm: () => {
        rows.forEach((r) => updateInvoice(r.id, { status: 'draft' }))
        setSelectedIds(new Set())
        setConfirm((prev) => ({ ...prev, open: false }))
        notify('All invoices reset to draft', 'info')
      },
    })
  }

  const handleXeroExport = () => {
    const selected = rows.filter((r) => selectedIds.has(r.id))
    const toExport = selected.length > 0 ? selected : rows
    const validation = downloadXeroCsv(toExport)
    if (!validation.valid) {
      notify(
        `Xero export blocked: ${validation.errors[0]?.message ?? 'validation failed'} (${validation.errors.length} errors)`,
        'error',
      )
      return
    }
    if (validation.warnings.length > 0) {
      notify(`${validation.warnings.length} warnings — export completed`, 'warning')
    }
    const summary = summariseXeroExport(toExport)
    toast(
      `Exported ${summary.totalInvoices} invoices for Xero — ${summary.totalExclGst.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })} excl GST`,
      'success',
    )
  }

  const toggleDetail = (id: string) => {
    setActiveId(activeId === id ? null : id)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#101010] text-[#F4F1EA] p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#D4A853]/60 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[#101010]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#F4F1EA]">Invoice batches</h1>
                  <p className="text-sm text-[#F4F1EA]/50">
                    {rows.length} invoices ·{' '}
                    {rows
                      .reduce((s, r) => s + r.total, 0)
                      .toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}{' '}
                    inc GST
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`border-[#1E293B] ${
                  testMode
                    ? 'bg-purple-900/30 text-purple-400 border-purple-700'
                    : 'text-[#F4F1EA]/50'
                }`}
              >
                {testMode ? (
                  <span className="flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" /> Test Mode Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Mode
                  </span>
                )}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestMode(!testMode)}
                className="border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B]"
              >
                {testMode ? 'Switch to Live' : 'Test Mode'}
              </Button>
            </div>
          </div>

          <EmailServiceBanner />

          <div className="mb-4 rounded-lg border border-amber-700/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-200/90">
            June batch created {formatAuDate(JUNE_BATCH_CREATED)} —{' '}
            {formatElapsed(calendarDaysBetween(JUNE_BATCH_CREATED, todayISO()))}. Original due{' '}
            {formatAuDate(BATCH_DUE_DATE)}. Those drafts were never sent, so they are stale to send,
            not customer-overdue. August catch-up is due {formatAuDate(AUGUST_BATCH_DUE_DATE)}. FOOTT
            ONEFM-2026-011 already covers Jun–Nov — do not raise another FOOTT invoice. Xero is the
            books; this list is the send guide only. Payments received will come off later — do not
            mark paid from here until Jay allocates them.
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(
              [
                ['all', 'All batches'],
                ['june-2026', 'June 2026 (stale)'],
                ['aug-2026', 'August 2026 (new)'],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant="outline"
                onClick={() => setBatchFilter(id)}
                className={`border-[#1E293B] ${
                  batchFilter === id
                    ? 'bg-[#D4A853]/20 text-[#D4A853] border-[#D4A853]/50'
                    : 'text-[#F4F1EA]/70 hover:bg-[#1E293B]'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Value"
              amount={formatCurrency(stats.total)}
              icon={<DollarSign className="w-5 h-5" />}
              accent="bg-gradient-to-r from-[#D4A853] to-[#D4A853]/60"
            />
            <StatCard
              label="Selected"
              amount={`${stats.selected} (${formatCurrency(stats.selectedAmount)})`}
              icon={<CheckSquare className="w-5 h-5" />}
              accent="bg-gradient-to-r from-blue-500 to-blue-400/60"
            />
            <StatCard
              label="Sent / Paid"
              amount={`${stats.sent} (${formatCurrency(stats.sentAmount)})`}
              icon={<Send className="w-5 h-5" />}
              accent="bg-gradient-to-r from-amber-500 to-amber-400/60"
            />
            <StatCard
              label="Remaining"
              amount={`${stats.remaining} (${formatCurrency(stats.remainingAmount)})`}
              icon={<Clock className="w-5 h-5" />}
              accent="bg-gradient-to-r from-emerald-500 to-emerald-400/60"
            />
          </div>

          {/* Batch progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4A853]" />
                <span className="text-sm font-medium text-[#F4F1EA]/80">Batch Progress</span>
              </div>
              <span className="text-sm font-bold text-[#D4A853]">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#1E293B] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4A853] via-amber-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] uppercase tracking-wider text-[#F4F1EA]/30">
              <span>Draft</span>
              <span>Previewed</span>
              <span>Tested</span>
              <span>Sent</span>
              <span>Paid</span>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewSelected}
                className="border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B] gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSelected}
                className="border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B] gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Test Selected
              </Button>
              <Button
                size="sm"
                onClick={handleSendSelected}
                className="bg-[#D4A853] hover:bg-[#D4A853]/90 text-[#101010] font-semibold gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-red-900/50 text-red-400 hover:bg-red-900/20 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleXeroExport}
                className="border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20 gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Export for Xero
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const unsent = rows.filter((r) => r.status !== 'sent' && r.status !== 'paid')
                  setSelectedIds(new Set(unsent.map((r) => r.id)))
                  setStatusFilter('unsent')
                  notify(`Selected ${unsent.length} unsent invoice(s)`, 'info')
                }}
                className="border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B] gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Select All Unsent ({stats.remaining})
              </Button>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as BatchStatus | 'all' | 'unsent')}
              >
                <SelectTrigger className="bg-[#161616] border-[#1E293B] text-[#F4F1EA] w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#161616] border-[#1E293B] text-[#F4F1EA]">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="unsent">Unsent (awaiting)</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="previewed">Previewed</SelectItem>
                  <SelectItem value="tested">Tested</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#F4F1EA]/30" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-64 bg-[#161616] border-[#1E293B] text-[#F4F1EA] placeholder:text-[#F4F1EA]/30 focus-visible:ring-[#D4A853]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Invoice table */}
            <div className="flex-1 min-w-0">
              <Card className="bg-[#161616] border-[#1E293B]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-[#F4F1EA] flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#D4A853]" />
                      Invoices
                      <Badge
                        variant="outline"
                        className="border-[#1E293B] text-[#F4F1EA]/50 ml-2"
                      >
                        {filtered.length} / {rows.length}
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-520px)] min-h-[400px]">
                    <Table className="min-w-[860px]">
                      <TableHeader>
                        <TableRow className="border-[#1E293B] hover:bg-transparent">
                          <TableHead className="w-10">
                            <Checkbox
                              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                              onCheckedChange={toggleSelectAll}
                              className="border-[#1E293B] data-[state=checked]:bg-[#D4A853] data-[state=checked]:border-[#D4A853]"
                            />
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider">
                            #
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider">
                            Company
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider text-right">
                            Amount
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider text-right">
                            GST
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider text-right">
                            Total
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider">
                            Description
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider">
                            Status
                          </TableHead>
                          <TableHead className="text-[#F4F1EA]/50 text-xs uppercase tracking-wider text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((row) => {
                          const gstOk = verifyGst(row.amountExclGst, row.gst)
                          const status = STATUS_CONFIG[row.status]
                          const isActive = activeId === row.id
                          return (
                            <motion.tr
                              key={row.id}
                              layout
                              onClick={() => toggleDetail(row.id)}
                              className={`border-[#1E293B]/60 cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-[#D4A853]/5'
                                  : selectedIds.has(row.id)
                                    ? 'bg-blue-900/10'
                                    : 'hover:bg-[#1E293B]/40'
                              }`}
                            >
                              <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedIds.has(row.id)}
                                  onCheckedChange={() => toggleSelect(row.id)}
                                  className="border-[#1E293B] data-[state=checked]:bg-[#D4A853] data-[state=checked]:border-[#D4A853]"
                                />
                              </TableCell>
                              <TableCell
                                className="font-mono text-sm text-[#D4A853]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => toggleDetail(row.id)}
                                  className="hover:underline text-left"
                                >
                                  {row.number}
                                </button>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm text-[#F4F1EA]">
                                    {row.company}
                                  </p>
                                  <p className="text-[10px] uppercase tracking-wider text-[#F4F1EA]/35 mt-0.5">
                                    {row.batchId === 'aug-2026' ? 'Aug 2026 catch-up' : 'June 2026 batch'}
                                    {row.batchId !== 'aug-2026' &&
                                    ageInvoice(
                                      { status: row.status, dueDate: row.dueDate },
                                      todayISO(),
                                    ) === 'unsent_stale'
                                      ? ' · unsent stale'
                                      : ''}
                                  </p>
                                  {row.contactName && (
                                    <p className="text-xs text-[#F4F1EA]/40">{row.contactName}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-sm text-[#F4F1EA]">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help">
                                      {formatCurrency(row.amountExclGst)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="bg-[#161616] border-[#1E293B]"
                                  >
                                    <p className="text-xs">Excl. GST (locked)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-sm text-[#F4F1EA]/70">
                                    {formatCurrency(row.gst)}
                                  </span>
                                  {gstOk ? (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="bg-[#161616] border-[#1E293B]"
                                      >
                                        <p className="text-xs text-emerald-400">
                                          GST correct (10%)
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="bg-[#161616] border-[#1E293B]"
                                      >
                                        <p className="text-xs text-red-400">GST mismatch!</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm font-bold text-[#D4A853]">
                                  {formatCurrency(row.total)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <p className="text-xs text-[#F4F1EA]/60 max-w-[200px] truncate">
                                  {row.description}
                                </p>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${status.bg} ${status.color} ${status.border} text-xs gap-1`}
                                >
                                  {status.icon}
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className="text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                        onClick={() => handlePreview(row.id)}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-[#161616] border-[#1E293B]"
                                    >
                                      <p className="text-xs">Preview</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                                        onClick={() => handleTestSend(row.id)}
                                      >
                                        <FlaskConical className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-[#161616] border-[#1E293B]"
                                    >
                                      <p className="text-xs">Test Send</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-[#D4A853] hover:text-[#D4A853]/80 hover:bg-[#D4A853]/10"
                                        onClick={() => handleSendRequest(row.id)}
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-[#161616] border-[#1E293B]"
                                    >
                                      <p className="text-xs">Send</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                                        onClick={() => handleMarkPaid(row.id)}
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-[#161616] border-[#1E293B]"
                                    >
                                      <p className="text-xs">Mark Paid</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  {row.status === 'paid' && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-[#D4A853] hover:text-[#D4A853]/80 hover:bg-[#D4A853]/10"
                                          onClick={() => handleSendReceipt(row)}
                                        >
                                          <Receipt className="w-3.5 h-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="bg-[#161616] border-[#1E293B]"
                                      >
                                        <p className="text-xs">Send Receipt</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Footer summary */}
              <div className="mt-4 flex items-center justify-between text-sm text-[#F4F1EA]/40">
                <div className="flex items-center gap-4">
                  <span>
                    Total Invoices: <strong className="text-[#F4F1EA]">{rows.length}</strong>
                  </span>
                  <span>
                    Selected: <strong className="text-[#D4A853]">{stats.selected}</strong>{' '}
                    ({formatCurrency(stats.selectedAmount)})
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-emerald-400/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {rows.filter((r) => verifyGst(r.amountExclGst, r.gst)).length} of {rows.length}{' '}
                    GST verified
                  </span>
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, width: 0, x: 50 }}
                  animate={{ opacity: 1, width: 560, x: 0 }}
                  exit={{ opacity: 0, width: 0, x: 50 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden flex-shrink-0"
                >
                  <Card className="bg-[#161616] border-[#1E293B] h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-[#F4F1EA] flex items-center gap-2">
                            <span className="font-mono text-[#D4A853]">{active.number}</span>
                            <Badge
                              variant="outline"
                              className={`${STATUS_CONFIG[active.status].bg} ${STATUS_CONFIG[active.status].color} ${STATUS_CONFIG[active.status].border} text-xs gap-1`}
                            >
                              {STATUS_CONFIG[active.status].icon}
                              {STATUS_CONFIG[active.status].label}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-[#F4F1EA]/60 mt-0.5">
                            {active.company}
                            {active.contactName && ` • ${active.contactName}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#F4F1EA]/40 hover:text-[#F4F1EA]"
                          onClick={() => setActiveId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
                        <TabsList className="bg-[#1E293B]/50 border border-[#1E293B] w-full mb-4">
                          <TabsTrigger
                            value="invoice"
                            className="flex-1 text-xs data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#101010]"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1" />
                            Invoice
                          </TabsTrigger>
                          <TabsTrigger
                            value="email"
                            className="flex-1 text-xs data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#101010]"
                          >
                            <Mail className="w-3.5 h-3.5 mr-1" />
                            Email
                          </TabsTrigger>
                          <TabsTrigger
                            value="edit"
                            className="flex-1 text-xs data-[state=active]:bg-[#D4A853] data-[state=active]:text-[#101010]"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="invoice" className="mt-0 space-y-4">
                          <ScrollArea className="h-[min(72vh,760px)] min-h-[360px]">
                            <InvoicePreview invoice={active} />
                          </ScrollArea>
                          <div className="rounded-md border border-[#1B458F]/60 bg-[#0B1220] px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wider text-[#7EB6FF] font-semibold">
                              Pay to (same as PDF)
                            </p>
                            <p className="text-xs text-[#F4F1EA] mt-0.5 leading-snug">
                              {BANK_ACCOUNT_NAME} · BSB {BANK_BSB} · {BANK_ACCOUNT} · ref{' '}
                              <span className="font-mono text-[#E51636]">{active.number}</span>
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B] gap-1.5"
                              onClick={() => {
                                updateStatus(active.id, 'previewed')
                                toast('Marked as previewed', 'success')
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Mark Previewed
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-[#D4A853] hover:bg-[#D4A853]/90 text-[#101010] font-semibold gap-1.5"
                              onClick={async () => {
                                try {
                                  const pdf = await generateInvoicePdf({ ...active, issueDate: active.createdAt })
                                  pdf.save(`${active.number}.pdf`)
                                  toast(`Downloaded ${active.number}.pdf`, 'success')
                                } catch {
                                  toast('Failed to generate PDF', 'error')
                                }
                              }}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download PDF
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-[#D4A853] hover:bg-[#D4A853]/90 text-[#101010] font-semibold gap-1.5"
                              onClick={() => handleSendRequest(active.id)}
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="email" className="mt-0 space-y-4">
                          <div className="bg-[#1E293B]/40 rounded-lg p-3 flex items-center gap-3">
                            <span className="text-xs text-[#F4F1EA]/40 uppercase tracking-wider font-medium whitespace-nowrap">
                              Test Recipient:
                            </span>
                            <Input
                              value={testAddress}
                              onChange={(e) => setTestAddress(e.target.value)}
                              placeholder="jasonstv1@bigpond.com"
                              className="h-7 text-xs bg-[#101010] border-[#1E293B] text-[#F4F1EA] focus-visible:ring-[#D4A853]"
                            />
                          </div>
                          <ScrollArea className="h-[calc(100vh-592px)] min-h-[130px]">
                            <InvoiceEmailTemplate
                              data={{
                                contactName: active.contactName,
                                company: active.company,
                                invoiceNumber: active.number,
                                amountExclGst: active.amountExclGst,
                                gst: active.gst,
                                total: active.total,
                                dueDate: formatDate(active.dueDate),
                                customMessage: active.emailBody,
                                campaign: active.description,
                              }}
                              onMessageChange={(message) => setEditBody(message)}
                            />
                          </ScrollArea>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B] gap-1.5"
                              onClick={async () => {
                                if (await copyHtmlToClipboard(active)) {
                                  toast('HTML copied to clipboard! Paste into Outlook/Gmail.', 'success')
                                } else {
                                  toast('Failed to copy HTML', 'error')
                                }
                              }}
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy HTML
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-purple-900/50 text-purple-400 hover:bg-purple-900/20 gap-1.5"
                              onClick={() => handleTestSend(active.id)}
                            >
                              <FlaskConical className="w-3.5 h-3.5" />
                              Test Send
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-[#D4A853] hover:bg-[#D4A853]/90 text-[#101010] font-semibold gap-1.5"
                              onClick={() => handleSendRequest(active.id)}
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send Email
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="edit" className="mt-0 space-y-4">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-[#F4F1EA]/50 uppercase tracking-wider mb-1 block">
                                Subject Line
                              </label>
                              <Input
                                value={editSubject}
                                onChange={(e) => setEditSubject(e.target.value)}
                                className="bg-[#101010] border-[#1E293B] text-[#F4F1EA] focus-visible:ring-[#D4A853]"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-[#F4F1EA]/50 uppercase tracking-wider mb-1 block">
                                Email Body
                              </label>
                              <Textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="bg-[#101010] border-[#1E293B] text-[#F4F1EA] focus-visible:ring-[#D4A853] min-h-[300px] font-mono text-sm leading-relaxed"
                              />
                            </div>
                            <div className="bg-[#1E293B]/40 rounded-lg p-3 text-xs text-[#F4F1EA]/40 space-y-1">
                              <p className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#D4A853]" />
                                Changes auto-save when you click Save
                              </p>
                              <p>Amounts are locked for verification. Only email text is editable.</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEmail}
                                className="bg-[#D4A853] hover:bg-[#D4A853]/90 text-[#101010] font-semibold"
                              >
                                <Save className="w-3.5 h-3.5 mr-1.5" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditSubject(active?.emailSubject || '')
                                  setEditBody(active?.emailBody || '')
                                }}
                                className="border-[#1E293B] text-[#F4F1EA] hover:bg-[#1E293B]"
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                Reset
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Single-invoice send dialog */}
          {sendDialogOpen && sendTarget && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setSendDialogOpen(false)}
            >
              <div
                className="bg-[#161616] border border-[#2A2A2A]/40 rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#2A2A2A]/30">
                  <h3 className="text-lg font-bold text-[#F4F1EA]">Send Invoice</h3>
                  <p className="text-sm text-[#5B8DB8] mt-1">
                    {sendTarget.number} — {sendTarget.company}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-[#1E293B]/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5B8DB8]">To:</span>
                      <span className="text-[#F4F1EA]">
                        {sendTarget.contactName || sendTarget.company}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B8DB8]">Email:</span>
                      <span className="text-[#F4F1EA]">{sendTarget.email || '(no email)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B8DB8]">Amount:</span>
                      <span className="text-[#D4A853] font-bold">
                        {formatCurrency(sendTarget.total)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5B8DB8]">
                    This will download the PDF and open your email client. Please attach the PDF
                    before sending.
                  </p>
                </div>
                <div className="p-4 border-t border-[#2A2A2A]/30 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#2A2A2A]/40 text-[#F4F1EA] hover:bg-[#1E293B]"
                    onClick={() => setSendDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#D4A853] text-[#101010] hover:bg-[#F4F1EA] font-bold"
                    onClick={() => handleConfirmSend(sendTarget)}
                  >
                    <Send className="w-4 h-4 mr-2" /> Send Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Batch confirm dialog ("Send N Invoices?" / "Reset All Invoices?") */}
          {confirm.open && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirm((prev) => ({ ...prev, open: false }))}
            >
              <div
                className="bg-[#161616] border border-[#2A2A2A]/40 rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#2A2A2A]/30">
                  <h3 className="text-lg font-bold text-[#F4F1EA] flex items-center gap-2">
                    {confirm.variant === 'danger' && (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    {confirm.title}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#5B8DB8]">{confirm.description}</p>
                </div>
                <div className="p-4 border-t border-[#2A2A2A]/30 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#2A2A2A]/40 text-[#F4F1EA] hover:bg-[#1E293B]"
                    onClick={() => setConfirm((prev) => ({ ...prev, open: false }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={`flex-1 font-bold ${
                      confirm.variant === 'danger'
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-[#D4A853] text-[#101010] hover:bg-[#F4F1EA]'
                    }`}
                    onClick={confirm.onConfirm}
                  >
                    {confirm.confirmLabel}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

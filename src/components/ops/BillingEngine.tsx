import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  DollarSign,
  FileCheck,
  FileText,
  Landmark,
  Link2,
  Phone,
  PieChart as PieChartIcon,
  Receipt,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Shield,
  Square,
  Target,
  Timer,
  TrendingUp,
  UserX,
  Users,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from './Toast'
import { AGING_BUCKETS } from './data/invoices'
import {
  COLLECTION_TRENDS,
  FORECAST_SCENARIOS,
  GST_QUARTERS,
  MOCK_ACQUITTALS,
  MOCK_PAYMENTS,
  MOCK_RENEWALS,
  MONTHLY_REVENUE,
  PAYMENT_METHOD_ANALYSIS,
  REVENUE_BY_SOURCE,
  TIER_ANALYSIS,
  type AcquittalRecord,
  type RenewalRecord,
  type RenewalStatus,
} from './data/payments'
import { useOpsStore, type OpsInvoice } from './store'
import { downloadXeroCsv, type XeroExportableInvoice } from './invoices/xeroExport'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type BillingTab =
  | 'dashboard'
  | 'aging'
  | 'billing-cycle'
  | 'payments'
  | 'acquittals'
  | 'renewals'
  | 'reports'
  | 'forecast'

/** Simplified display status used by the deployed billing UI. */
type DisplayStatus = 'draft' | 'sent' | 'overdue' | 'partial' | 'paid'

function displayStatus(invoice: OpsInvoice): DisplayStatus {
  switch (invoice.status) {
    case 'paid':
      return 'paid'
    case 'partially_paid':
      return 'partial'
    case 'overdue':
      return 'overdue'
    case 'sent':
      return 'sent'
    default:
      // draft / previewed / tested have not gone out yet
      return 'draft'
  }
}

function daysOverdue(dueDate: string): number {
  const days = Math.floor(
    (Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24),
  )
  return days > 0 ? days : 0
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(value)
}

function statusBadgeClass(status: DisplayStatus): string {
  return (
    {
      paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    } as Record<DisplayStatus, string>
  )[status]
}

function renewalBadgeClass(status: RenewalStatus): string {
  return (
    {
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      proposal_sent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      negotiating: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      renewed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      churned: 'bg-red-500/20 text-red-400 border-red-500/30',
    } as Record<RenewalStatus, string>
  )[status]
}

function renewalStatusLabel(status: RenewalStatus): string {
  return (
    {
      upcoming: 'Upcoming',
      proposal_sent: 'Proposal Sent',
      negotiating: 'Negotiating',
      renewed: 'Renewed',
      churned: 'Churned',
    } as Record<RenewalStatus, string>
  )[status]
}

function probabilityTextClass(probability: number): string {
  if (probability >= 80) return 'text-emerald-400'
  if (probability >= 60) return 'text-amber-400'
  if (probability >= 40) return 'text-orange-400'
  return 'text-red-400'
}

function probabilityBarClass(probability: number): string {
  if (probability >= 80) return 'bg-emerald-500'
  if (probability >= 60) return 'bg-amber-500'
  if (probability >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function isoToday(): string {
  return new Date().toISOString().split('T')[0]
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const PAYMENT_METHOD_OPTIONS = [
  'Bank Transfer',
  'Credit Card',
  'Direct Debit',
  'Cash',
  'Cheque',
]

const TABS: Array<{ id: BillingTab; label: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'aging', label: 'Aging Report', icon: Clock },
  { id: 'billing-cycle', label: 'Billing Cycle', icon: RefreshCw },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'acquittals', label: 'Acquittals', icon: FileText },
  { id: 'renewals', label: 'Renewals', icon: Repeat },
  { id: 'reports', label: 'Reports', icon: PieChartIcon },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BillingEngine() {
  const { toast } = useToast()
  const { invoices, updateInvoice } = useOpsStore()

  const [tab, setTab] = useState<BillingTab>('dashboard')
  const [renewals, setRenewals] = useState<RenewalRecord[]>(MOCK_RENEWALS)
  const [acquittals, setAcquittals] = useState<AcquittalRecord[]>(MOCK_ACQUITTALS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  // Record Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<OpsInvoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentDate, setPaymentDate] = useState(isoToday())

  // Reminder dialog
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [reminderInvoice, setReminderInvoice] = useState<OpsInvoice | null>(null)

  // Acquittal dialog
  const [acquittalDialogOpen, setAcquittalDialogOpen] = useState(false)
  const [acquittalTarget, setAcquittalTarget] = useState<AcquittalRecord | null>(null)

  // Billing cycle
  const [cycleComplete, setCycleComplete] = useState(false)
  const [cycleProgress, setCycleProgress] = useState(45)

  const now = new Date()
  const currentMonthKey = isoToday().slice(0, 7)
  const currentMonthLabel = now.toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })
  const daysUntilNextCycle = Math.max(
    0,
    Math.ceil(
      (new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )

  // ----- Store-driven figures ------------------------------------------------

  const stats = useMemo(() => {
    const outstanding = invoices.filter((i) => {
      const s = displayStatus(i)
      return s === 'sent' || s === 'overdue' || s === 'partial'
    })
    const outstandingTotal = outstanding.reduce(
      (sum, i) => sum + (i.total - (i.paidAmount ?? 0)),
      0,
    )
    const overdueInvoices = invoices.filter((i) => {
      const s = displayStatus(i)
      return s === 'overdue' || (s === 'partial' && daysOverdue(i.dueDate) > 0)
    })
    const overdueTotal = overdueInvoices.reduce(
      (sum, i) => sum + (i.total - (i.paidAmount ?? 0)),
      0,
    )
    const bucketTotal = (min: number, max: number) =>
      invoices
        .filter((i) => {
          const s = displayStatus(i)
          const days = daysOverdue(i.dueDate)
          return (s === 'overdue' || s === 'partial') && days >= min && days <= max
        })
        .reduce((sum, i) => sum + (i.total - (i.paidAmount ?? 0)), 0)
    const paidish = invoices.filter((i) => {
      const s = displayStatus(i)
      return s === 'paid' || s === 'partial'
    })
    const thisMonthRevenue = paidish
      .filter((i) => i.issueDate.startsWith(currentMonthKey))
      .reduce((sum, i) => sum + (i.paidAmount ?? 0), 0)
    const ytdRevenue = paidish.reduce((sum, i) => sum + (i.paidAmount ?? 0), 0)
    const issued = invoices.filter((i) => displayStatus(i) !== 'draft')
    const totalIssued = issued.reduce((sum, i) => sum + i.total, 0)
    const totalPaid = ytdRevenue
    const collectionRate =
      totalIssued > 0 ? Math.round((totalPaid / totalIssued) * 100) : 0
    const settled = invoices.filter(
      (i) => displayStatus(i) === 'paid' && i.paidDate && i.dueDate,
    )
    const avgDaysToPay =
      settled.length > 0
        ? Math.round(
            settled.reduce((sum, i) => {
              const issuedAt = new Date(i.issueDate).getTime()
              const paidAt = new Date(i.paidDate as string).getTime()
              return sum + Math.floor((paidAt - issuedAt) / (1000 * 60 * 60 * 24))
            }, 0) / settled.length,
          )
        : 0
    return {
      outstandingTotal,
      overdueTotal,
      overdue1to30: bucketTotal(1, 30),
      overdue31to60: bucketTotal(31, 60),
      overdue60plus: bucketTotal(61, 9999),
      thisMonthRevenue,
      ytdRevenue,
      collectionRate,
      avgDaysToPay,
      totalIssued,
      totalPaid,
      outstandingCount: outstanding.length,
    }
  }, [invoices, currentMonthKey])

  const agingBuckets = useMemo(
    () =>
      AGING_BUCKETS.map((bucket) => {
        const bucketInvoices = invoices.filter((i) => {
          const s = displayStatus(i)
          if (s === 'paid' || s === 'draft') return false
          const days = daysOverdue(i.dueDate)
          return days >= bucket.minDays && days <= bucket.maxDays
        })
        return {
          ...bucket,
          invoices: bucketInvoices,
          total: bucketInvoices.reduce(
            (sum, i) => sum + (i.total - (i.paidAmount ?? 0)),
            0,
          ),
        }
      }),
    [invoices],
  )

  const filteredInvoices = useMemo(() => {
    if (!search) return invoices
    const q = search.toLowerCase()
    return invoices.filter(
      (i) =>
        i.company.toLowerCase().includes(q) ||
        i.number.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    )
  }, [invoices, search])

  const activeRenewals = useMemo(
    () =>
      renewals
        .filter((r) => r.status !== 'churned' && r.status !== 'renewed')
        .sort((a, b) => a.daysRemaining - b.daysRemaining),
    [renewals],
  )
  const churnedRenewals = useMemo(
    () => renewals.filter((r) => r.status === 'churned'),
    [renewals],
  )
  const renewalRate = useMemo(() => {
    const decided = renewals.filter(
      (r) => r.status === 'renewed' || r.status === 'churned',
    )
    if (decided.length === 0) return 0
    return Math.round(
      (decided.filter((r) => r.status === 'renewed').length / decided.length) * 100,
    )
  }, [renewals])

  const monthInvoices = useMemo(
    () => invoices.filter((i) => i.issueDate.startsWith(currentMonthKey)),
    [invoices, currentMonthKey],
  )

  // ----- Actions -------------------------------------------------------------

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectedGroup(ids: string[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (ids.every((id) => next.has(id))) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  function openPaymentDialog(invoice: OpsInvoice) {
    setPaymentInvoice(invoice)
    setPaymentAmount(String(invoice.total - (invoice.paidAmount ?? 0)))
    setPaymentReference('')
    setPaymentDate(isoToday())
    setPaymentDialogOpen(true)
  }

  function recordPayment() {
    if (!paymentInvoice || !paymentAmount) return
    const amount = parseFloat(paymentAmount)
    if (Number.isNaN(amount) || amount <= 0) return
    const newPaid = (paymentInvoice.paidAmount ?? 0) + amount
    updateInvoice(paymentInvoice.id, {
      paidAmount: newPaid,
      status: newPaid >= paymentInvoice.total ? 'paid' : 'partially_paid',
      paymentMethod,
      paidDate: paymentDate,
    })
    toast(
      `Payment of ${formatCurrency(amount)} recorded for ${paymentInvoice.number}`,
      'success',
    )
    setPaymentDialogOpen(false)
    setPaymentInvoice(null)
    setPaymentAmount('')
  }

  function bulkMarkPaid() {
    let count = 0
    invoices.forEach((i) => {
      const s = displayStatus(i)
      if (selectedIds.has(i.id) && (s === 'overdue' || s === 'sent')) {
        updateInvoice(i.id, {
          status: 'paid',
          paidAmount: i.total,
          paidDate: isoToday(),
          paymentMethod: 'Bank Transfer',
        })
        count += 1
      }
    })
    setSelectedIds(new Set())
    if (count > 0) toast(`${count} invoice${count === 1 ? '' : 's'} marked paid`, 'success')
  }

  function openReminderDialog(invoice: OpsInvoice) {
    setReminderInvoice(invoice)
    setReminderDialogOpen(true)
  }

  function sendReminder() {
    if (!reminderInvoice) return
    const to = reminderInvoice.email?.trim()
    if (!to) {
      toast('No email on this invoice — reminder was NOT sent.', 'error')
      return
    }
    const due = formatCurrency(
      reminderInvoice.total - (reminderInvoice.paidAmount ?? 0),
    )
    const subject = encodeURIComponent(
      `Payment reminder — ${reminderInvoice.number} | ONE FM 98.5`,
    )
    const body = encodeURIComponent(
      `Hi ${reminderInvoice.contactName},\n\nThis is a payment reminder for invoice ${reminderInvoice.number} (${reminderInvoice.company}).\nAmount due: ${due}.\nDue date: ${reminderInvoice.dueDate}.\n\nPlease see the invoice PDF for bank details.\n\nONE FM 98.5 accounts`,
    )
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
    toast(
      `Email client opened for ${reminderInvoice.company}. Reminder is NOT marked sent until you send it.`,
      'warning',
    )
    setReminderDialogOpen(false)
    setReminderInvoice(null)
  }

  function runBillingCycle() {
    const draftCount = monthInvoices.filter((i) => displayStatus(i) === 'draft').length
    setCycleComplete(true)
    setCycleProgress(100)
    toast(
      draftCount > 0
        ? `Cycle checklist marked complete. ${draftCount} draft invoice${draftCount === 1 ? '' : 's'} were NOT emailed — use Batch Send.`
        : 'Cycle checklist marked complete — no draft invoices to email.',
      draftCount > 0 ? 'warning' : 'success',
    )
  }

  function openAcquittalDialog(record: AcquittalRecord) {
    setAcquittalTarget(record)
    setAcquittalDialogOpen(true)
  }

  function confirmAcquittal() {
    if (!acquittalTarget) return
    setAcquittals((prev) =>
      prev.map((a) =>
        a.id === acquittalTarget.id ? { ...a, status: 'acquitted' } : a,
      ),
    )
    toast(`${acquittalTarget.sponsorName} acquittal confirmed`, 'success')
    setAcquittalDialogOpen(false)
    setAcquittalTarget(null)
  }

  function generateRenewalProposal(record: RenewalRecord) {
    setRenewals((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, status: 'proposal_sent' } : r)),
    )
    toast(`Renewal proposal generated for ${record.sponsorName}`, 'success')
  }

  function exportXero() {
    const toExport: XeroExportableInvoice[] = invoices
      .filter((i) => displayStatus(i) !== 'draft')
      .map((i) => ({
        number: i.number,
        company: i.company,
        contactName: i.contactName,
        email: i.email,
        description: i.description,
        period: i.period,
        amountExclGst: i.amount,
        gst: i.gst,
        total: i.total,
        dueDate: i.dueDate,
        createdAt: i.issueDate,
      }))

    const validation = downloadXeroCsv(toExport, `onefm-xero-export-${isoToday()}.csv`)
    if (!validation.valid) {
      toast(`Xero export failed: ${validation.errors[0]?.message ?? 'validation error'}`, 'error')
      return
    }
    toast(`Xero export downloaded (${toExport.length} invoices)`, 'success')
  }

  // ----- Billing cycle steps (store-driven counts) ----------------------------

  const cycleSteps = [
    {
      label: 'Entry',
      week: 1,
      description: 'Finalise invoice data for the month',
      completed: true,
      current: false,
      count: monthInvoices.length,
      icon: FileText,
    },
    {
      label: 'Billing',
      week: 1,
      description: 'Send all invoices for the month',
      completed: cycleComplete,
      current: !cycleComplete,
      count: monthInvoices.filter((i) => displayStatus(i) !== 'draft').length,
      icon: Send,
    },
    {
      label: 'Reminders',
      week: 2,
      description: 'Payment reminders for overdue accounts',
      completed: false,
      current: false,
      count: invoices.filter((i) => displayStatus(i) === 'overdue').length,
      icon: Bell,
    },
    {
      label: 'Follow-up',
      week: 3,
      description: 'Phone calls for 30+ days overdue',
      completed: false,
      current: false,
      count: invoices.filter(
        (i) => daysOverdue(i.dueDate) > 30 && displayStatus(i) === 'overdue',
      ).length,
      icon: Phone,
    },
    {
      label: 'Acquittal',
      week: 4,
      description: 'Process acquittals & close the month',
      completed: false,
      current: false,
      count: acquittals.filter((a) => a.status === 'acquitted').length,
      icon: FileCheck,
    },
  ]

  // ----- Render ---------------------------------------------------------------

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as BillingTab)}>
          <TabsList className="bg-[#1E293B] border border-[#2A2A2A]/30 p-1 flex flex-wrap gap-1 h-auto">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium data-[state=active]:bg-one-gold data-[state=active]:text-one-navy text-one-white/60 hover:text-one-white transition-colors"
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          onClick={exportXero}
          className="border-[#2A2A2A]/40 text-one-white/70 hover:text-one-white text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export to Xero
        </Button>
      </motion.div>

      {tab === 'dashboard' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              {
                label: 'Outstanding',
                value: formatCurrency(stats.outstandingTotal),
                icon: DollarSign,
                color: 'text-amber-400',
                sub: `${stats.outstandingCount} invoices`,
              },
              {
                label: 'Overdue Amount',
                value: formatCurrency(stats.overdueTotal),
                icon: AlertTriangle,
                color: 'text-red-400',
                sub: `1-30d: ${formatCurrency(stats.overdue1to30)}`,
              },
              {
                label: 'Revenue This Month',
                value: formatCurrency(stats.thisMonthRevenue),
                icon: TrendingUp,
                color: 'text-emerald-400',
                sub: currentMonthLabel,
              },
              {
                label: 'Revenue YTD',
                value: formatCurrency(stats.ytdRevenue),
                icon: BarChart3,
                color: 'text-blue-400',
                sub: `Since Jan ${now.getFullYear()}`,
              },
              {
                label: 'Collection Rate',
                value: `${stats.collectionRate}%`,
                icon: Target,
                color: 'text-purple-400',
                sub: `${formatCurrency(stats.totalPaid)} / ${formatCurrency(stats.totalIssued)}`,
              },
              {
                label: 'Avg Days to Pay',
                value: `${stats.avgDaysToPay}`,
                icon: Timer,
                color: 'text-cyan-400',
                sub: 'Average',
              },
            ].map((kpi, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <Card className="bg-[#1E293B] border-[#2A2A2A]/30 hover:border-one-gold/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-one-white/50 text-xs font-medium">
                        {kpi.label}
                      </span>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                    <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    <div className="text-one-white/40 text-[10px] mt-1">{kpi.sub}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-one-gold" />
                      Billing Cycle Status — {currentMonthLabel}
                    </CardTitle>
                    <p className="text-one-white/40 text-xs mt-1">
                      Progress through the monthly billing workflow
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-one-gold text-sm font-semibold">
                      {daysUntilNextCycle} days
                    </div>
                    <div className="text-one-white/40 text-[10px]">until next cycle</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-one-white/50">Cycle Progress</span>
                    <span className="text-one-gold font-medium">{cycleProgress}%</span>
                  </div>
                  <Progress value={cycleProgress} className="h-2 bg-[#101010]" />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {cycleSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-lg p-3 border ${
                        step.completed
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : step.current
                            ? 'border-one-gold/40 bg-one-gold/5'
                            : 'border-[#2A2A2A]/20 bg-[#101010]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed
                              ? 'bg-emerald-500/20'
                              : step.current
                                ? 'bg-one-gold/20'
                                : 'bg-slate-500/10'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <step.icon
                              className={`w-3.5 h-3.5 ${
                                step.current ? 'text-one-gold' : 'text-one-white/30'
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            step.completed
                              ? 'text-emerald-400'
                              : step.current
                                ? 'text-one-gold'
                                : 'text-one-white/40'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-one-white/30 mb-1.5 leading-tight">
                        {step.description}
                      </p>
                      <div className="text-lg font-bold text-one-white">{step.count}</div>
                      <div className="text-[9px] text-one-white/30">Week {step.week}</div>
                      {step.current && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-one-gold animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-one-gold" />
                    Aging Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agingBuckets.map((bucket, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#101010]/50 border border-[#2A2A2A]/20"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: bucket.color }}
                          />
                          <span className="text-one-white/70 text-sm">{bucket.label}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-transparent border-[#2A2A2A]/30 text-one-white/50"
                          >
                            {bucket.invoices.length}
                          </Badge>
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: bucket.color }}
                        >
                          {formatCurrency(bucket.total)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A]/30">
                      <span className="text-one-white/70 text-sm font-medium">
                        Total Outstanding
                      </span>
                      <span className="text-base font-bold text-one-gold">
                        {formatCurrency(stats.outstandingTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-one-gold" />
                    Monthly Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={MONTHLY_REVENUE}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#D4A853" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A/30" />
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                      <YAxis
                        stroke="#475569"
                        fontSize={11}
                        tickFormatter={(v) => `$${Number(v) / 1000}k`}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #2A2A2A',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#F4F1EA' }}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#D4A853"
                        fill="url(#revGrad)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="collected"
                        stroke="#5B8DB8"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}

      {tab === 'aging' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h2 className="text-one-white text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-one-gold" />
                Aging Report
              </h2>
              <p className="text-one-white/40 text-sm mt-1">
                All outstanding invoices grouped by aging period
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-one-white/30" />
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-[#101010] border-[#2A2A2A]/30 text-one-white text-sm placeholder:text-one-white/30"
                />
              </div>
              {selectedIds.size > 0 && (
                <Button
                  onClick={bulkMarkPaid}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Mark {selectedIds.size} Paid
                </Button>
              )}
            </div>
          </motion.div>

          {AGING_BUCKETS.map((bucket, idx) => {
            const bucketInvoices = filteredInvoices.filter((i) => {
              const s = displayStatus(i)
              if (s === 'paid' || s === 'draft') return false
              const days = daysOverdue(i.dueDate)
              return days >= bucket.minDays && days <= bucket.maxDays
            })
            if (bucketInvoices.length === 0) return null
            const bucketTotal = bucketInvoices.reduce(
              (sum, i) => sum + (i.total - (i.paidAmount ?? 0)),
              0,
            )
            const allSelected =
              bucketInvoices.length > 0 &&
              bucketInvoices.every((i) => selectedIds.has(i.id))
            return (
              <motion.div key={idx} variants={fadeUp}>
                <Card className="bg-[#1E293B] border-[#2A2A2A]/30 overflow-hidden">
                  <CardHeader className="pb-3 border-b border-[#2A2A2A]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            toggleSelectedGroup(bucketInvoices.map((i) => i.id))
                          }
                          className="focus:outline-none"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-one-gold" />
                          ) : (
                            <Square className="w-4 h-4 text-one-white/30" />
                          )}
                        </button>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bucket.color }}
                        />
                        <CardTitle className="text-one-white text-sm font-semibold">
                          {bucket.label}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="bg-transparent border-[#2A2A2A]/30 text-one-white/50 text-[10px]"
                        >
                          {bucketInvoices.length} invoices
                        </Badge>
                      </div>
                      <span className="text-sm font-bold" style={{ color: bucket.color }}>
                        {formatCurrency(bucketTotal)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2A2A2A]/20 hover:bg-transparent">
                          <TableHead className="w-8" />
                          <TableHead className="text-one-white/50 text-xs">
                            Invoice #
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs">
                            Company
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs">
                            Campaign
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs text-right">
                            Amount
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs">
                            Due Date
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs">
                            Days Overdue
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs">
                            Status
                          </TableHead>
                          <TableHead className="text-one-white/50 text-xs text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bucketInvoices.map((invoice) => (
                          <TableRow
                            key={invoice.id}
                            className="border-[#2A2A2A]/15 hover:bg-one-gold/5"
                          >
                            <TableCell>
                              <button
                                onClick={() => toggleSelected(invoice.id)}
                                className="focus:outline-none"
                              >
                                {selectedIds.has(invoice.id) ? (
                                  <CheckSquare className="w-4 h-4 text-one-gold" />
                                ) : (
                                  <Square className="w-4 h-4 text-one-white/20" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="text-one-white text-xs font-mono">
                              {invoice.number}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-one-white text-xs font-medium">
                                  {invoice.company}
                                </div>
                                <div className="text-one-white/40 text-[10px]">
                                  {invoice.contactName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-one-white/60 text-xs">
                              {invoice.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-one-white text-xs font-semibold">
                                {formatCurrency(invoice.total)}
                              </div>
                              {invoice.paidAmount ? (
                                <div className="text-[10px] text-one-white/40">
                                  Paid: {formatCurrency(invoice.paidAmount)} / Bal:{' '}
                                  {formatCurrency(invoice.total - invoice.paidAmount)}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-one-white/60 text-xs">
                              {invoice.dueDate}
                            </TableCell>
                            <TableCell>
                              <span
                                className="text-xs font-medium"
                                style={{ color: bucket.color }}
                              >
                                {daysOverdue(invoice.dueDate)} days
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${statusBadgeClass(displayStatus(invoice))}`}
                              >
                                {displayStatus(invoice)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openReminderDialog(invoice)}
                                  className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPaymentDialog(invoice)}
                                  className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {tab === 'billing-cycle' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h2 className="text-one-white text-lg font-semibold flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-one-gold" />
                Monthly Billing Cycle Manager
              </h2>
              <p className="text-one-white/40 text-sm mt-1">
                Manage the end-to-end billing workflow for {currentMonthLabel}
              </p>
            </div>
            <Button
              onClick={runBillingCycle}
              disabled={cycleComplete}
              className={`${cycleComplete ? 'bg-emerald-600/50' : 'bg-one-gold hover:bg-one-gold/90'} text-one-navy font-medium`}
            >
              {cycleComplete ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {cycleComplete ? 'Cycle Completed' : 'Run Billing Cycle'}
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              {
                step: cycleSteps[1],
                title: 'Week 1: Send Invoices',
                detail: `Send all invoices for ${currentMonthLabel}. ${monthInvoices.filter((i) => displayStatus(i) === 'draft').length} invoices ready to send.`,
                action: 'Send All',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
              },
              {
                step: cycleSteps[2],
                title: 'Week 2: Payment Reminders',
                detail: `Send reminders for overdue invoices. ${invoices.filter((i) => displayStatus(i) === 'overdue').length} invoices currently overdue.`,
                action: 'Send Reminders',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
              },
              {
                step: cycleSteps[3],
                title: 'Week 3: Follow-up Calls',
                detail: `Phone follow-ups for accounts 30+ days overdue. ${invoices.filter((i) => daysOverdue(i.dueDate) > 30 && displayStatus(i) === 'overdue').length} accounts need calls.`,
                action: 'View List',
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/20',
              },
              {
                step: cycleSteps[4],
                title: 'Week 4: Process Acquittals',
                detail: `Generate acquittal reports and close the month. ${acquittals.filter((a) => a.status !== 'acquitted').length} pending acquittals.`,
                action: 'Process',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
              },
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <Card className={`${item.bg} ${item.border} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <item.step.icon className={`w-4 h-4 ${item.color}`} />
                          <h3 className={`text-sm font-semibold ${item.color}`}>
                            {item.title}
                          </h3>
                          {item.step.completed && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-one-white/50 text-xs mb-3">{item.detail}</p>
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-lg font-bold text-one-white">
                              {item.step.count}
                            </div>
                            <div className="text-[10px] text-one-white/40">items</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-one-white/20" />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${item.border} ${item.color} bg-transparent hover:bg-one-gold/10 text-xs`}
                      >
                        {item.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-one-gold" />
                  {currentMonthLabel} Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]/20 hover:bg-transparent">
                      <TableHead className="text-one-white/50 text-xs">Invoice #</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Company</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Campaign</TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-one-white/50 text-xs">Status</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="border-[#2A2A2A]/15 hover:bg-one-gold/5"
                      >
                        <TableCell className="text-one-white text-xs font-mono">
                          {invoice.number}
                        </TableCell>
                        <TableCell className="text-one-white text-xs font-medium">
                          {invoice.company}
                        </TableCell>
                        <TableCell className="text-one-white/60 text-xs">
                          {invoice.description}
                        </TableCell>
                        <TableCell className="text-one-white text-xs font-semibold text-right">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${statusBadgeClass(displayStatus(invoice))}`}
                          >
                            {displayStatus(invoice)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-one-white/60 text-xs">
                          {invoice.dueDate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {tab === 'payments' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h2 className="text-one-white text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-one-gold" />
                Payment Tracking
              </h2>
              <p className="text-one-white/40 text-sm mt-1">
                Record and track all sponsor payments
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PAYMENT_METHOD_ANALYSIS.map((method, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: method.color }}
                      />
                      <span className="text-one-white/60 text-xs">{method.method}</span>
                    </div>
                    <div className="text-lg font-bold text-one-white">
                      {formatCurrency(method.amount)}
                    </div>
                    <div className="text-[10px] text-one-white/40">
                      {method.count} transactions
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-one-gold" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]/20 hover:bg-transparent">
                      <TableHead className="text-one-white/50 text-xs">Date</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Invoice</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Company</TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-one-white/50 text-xs">Method</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Reference</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_PAYMENTS.filter((p) => p.allocated).map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="border-[#2A2A2A]/15 hover:bg-one-gold/5"
                      >
                        <TableCell className="text-one-white/60 text-xs">
                          {payment.date}
                        </TableCell>
                        <TableCell className="text-one-white text-xs font-mono">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-one-white text-xs font-medium">
                          {payment.company}
                        </TableCell>
                        <TableCell className="text-emerald-400 text-xs font-semibold text-right">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-transparent border-[#2A2A2A]/30 text-one-white/60"
                          >
                            {payment.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-one-white/50 text-xs font-mono">
                          {payment.reference}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          >
                            Allocated
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-400 text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Unallocated Payments
                </CardTitle>
                <p className="text-one-white/40 text-xs">
                  Payments received without a clear invoice reference
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]/20 hover:bg-transparent">
                      <TableHead className="text-one-white/50 text-xs">Date</TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-one-white/50 text-xs">Method</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Reference</TableHead>
                      <TableHead className="text-one-white/50 text-xs">Notes</TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_PAYMENTS.filter((p) => !p.allocated).map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="border-[#2A2A2A]/15 hover:bg-one-gold/5"
                      >
                        <TableCell className="text-one-white/60 text-xs">
                          {payment.date}
                        </TableCell>
                        <TableCell className="text-amber-400 text-xs font-semibold text-right">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-transparent border-[#2A2A2A]/30 text-one-white/60"
                          >
                            {payment.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-one-white/50 text-xs font-mono">
                          {payment.reference}
                        </TableCell>
                        <TableCell className="text-one-white/40 text-xs">
                          {payment.notes}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toast('Allocation workflow coming soon', 'info')
                            }
                            className="h-7 px-2 text-one-gold hover:text-one-gold/80 hover:bg-one-gold/10 text-xs"
                          >
                            <Link2 className="w-3.5 h-3.5 mr-1" />
                            Allocate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {tab === 'acquittals' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h2 className="text-one-white text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-one-gold" />
                Sponsor Acquittal Reports
              </h2>
              <p className="text-one-white/40 text-sm mt-1">
                Generate and track sponsor acquittal reports
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {acquittals.map((acq) => (
              <motion.div key={acq.id} variants={fadeUp}>
                <Card
                  className={`${
                    acq.status === 'acquitted'
                      ? 'border-emerald-500/30'
                      : acq.status === 'in_progress'
                        ? 'border-amber-500/30'
                        : 'border-[#2A2A2A]/30'
                  } bg-[#1E293B] border`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-one-white text-sm font-semibold">
                          {acq.sponsorName}
                        </h3>
                        <p className="text-one-white/50 text-xs">{acq.campaign}</p>
                        <p className="text-one-white/30 text-[10px]">
                          {acq.contractPeriod}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          acq.status === 'acquitted'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : acq.status === 'in_progress'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {acq.status === 'acquitted'
                          ? 'Acquitted'
                          : acq.status === 'in_progress'
                            ? 'In Progress'
                            : 'Pending'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 rounded bg-[#101010]/50">
                        <div className="text-xs text-one-white/40">Contract</div>
                        <div className="text-sm font-bold text-one-white">
                          {formatCurrency(acq.contractValue)}
                        </div>
                      </div>
                      <div className="text-center p-2 rounded bg-[#101010]/50">
                        <div className="text-xs text-one-white/40">Billed</div>
                        <div className="text-sm font-bold text-one-gold">
                          {formatCurrency(acq.amountBilled)}
                        </div>
                      </div>
                      <div className="text-center p-2 rounded bg-[#101010]/50">
                        <div className="text-xs text-one-white/40">Balance</div>
                        <div
                          className={`text-sm font-bold ${
                            acq.balanceRemaining > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatCurrency(acq.balanceRemaining)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-one-white/40">
                          Invoices:{' '}
                          <span className="text-one-white">
                            {acq.invoicesPaid}/{acq.invoicesIssued} paid
                          </span>
                        </span>
                        <span className="text-one-white/40">
                          Spots:{' '}
                          <span className="text-one-white">
                            {acq.spotsDelivered}/{acq.spotsScheduled} delivered
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {acq.status !== 'acquitted' && (
                        <Button
                          size="sm"
                          onClick={() => openAcquittalDialog(acq)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Mark Acquitted
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast(`Acquittal report exported for ${acq.sponsorName}`, 'success')
                        }
                        className="border-[#2A2A2A]/30 text-one-white/70 hover:text-one-white text-xs flex-1"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Export PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'renewals' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-one-white/50 text-xs">Upcoming Renewals</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-one-white">
                    {activeRenewals.length}
                  </div>
                  <div className="text-[10px] text-one-white/40">Next 90 days</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-one-white/50 text-xs">Renewal Rate</span>
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{renewalRate}%</div>
                  <div className="text-[10px] text-one-white/40">Of decided contracts</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-one-white/50 text-xs">At-Risk Revenue</span>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {formatCurrency(
                      activeRenewals
                        .filter((r) => r.probability < 60)
                        .reduce((sum, r) => sum + r.currentContractValue, 0),
                    )}
                  </div>
                  <div className="text-[10px] text-one-white/40">
                    {activeRenewals.filter((r) => r.probability < 60).length} sponsors at
                    risk
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-one-gold" />
                  Upcoming Renewals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeRenewals.map((renewal) => (
                    <div
                      key={renewal.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-[#101010]/50 border border-[#2A2A2A]/20 hover:border-one-gold/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-one-white text-sm font-semibold truncate">
                            {renewal.sponsorName}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${renewalBadgeClass(renewal.status)}`}
                          >
                            {renewalStatusLabel(renewal.status)}
                          </Badge>
                          {renewal.tier && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-transparent border-[#2A2A2A]/30 text-one-white/50"
                            >
                              {renewal.tier}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-one-white/40">
                          <span>{renewal.lastYearCampaign}</span>
                          <span>Ends: {renewal.endDate}</span>
                          <span
                            className={
                              renewal.daysRemaining <= 30
                                ? 'text-red-400'
                                : 'text-amber-400'
                            }
                          >
                            {renewal.daysRemaining} days remaining
                          </span>
                        </div>
                        {renewal.notes && (
                          <p className="text-[10px] text-one-white/30 mt-1 italic">
                            {renewal.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right mr-2">
                        <div className="text-sm font-bold text-one-white">
                          {formatCurrency(renewal.currentContractValue)}
                        </div>
                        <div className="text-[10px] text-one-white/40">current value</div>
                      </div>
                      <div className="w-16">
                        <div
                          className={`text-xs font-bold text-right ${probabilityTextClass(renewal.probability)}`}
                        >
                          {renewal.probability}%
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#101010] mt-1">
                          <div
                            className={`h-full rounded-full ${probabilityBarClass(renewal.probability)}`}
                            style={{ width: `${renewal.probability}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generateRenewalProposal(renewal)}
                        disabled={renewal.status === 'proposal_sent'}
                        className={`text-xs ${
                          renewal.status === 'proposal_sent'
                            ? 'bg-purple-600/30'
                            : 'bg-one-gold hover:bg-one-gold/90 text-one-navy'
                        }`}
                      >
                        {renewal.status === 'proposal_sent' ? 'Sent' : 'Generate Proposal'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {churnedRenewals.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-red-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-400 text-base font-semibold flex items-center gap-2">
                    <UserX className="w-4 h-4" />
                    Churned Sponsors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {churnedRenewals.map((renewal) => (
                      <div
                        key={renewal.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-one-white text-sm font-semibold">
                              {renewal.sponsorName}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30"
                            >
                              Churned
                            </Badge>
                          </div>
                          <p className="text-[10px] text-one-white/40">
                            {renewal.lastYearCampaign} — {renewal.notes}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-400">
                            {formatCurrency(renewal.currentContractValue)}
                          </div>
                          <div className="text-[10px] text-one-white/40">lost revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {tab === 'reports' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h2 className="text-one-white text-lg font-semibold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-one-gold" />
                Financial Reports
              </h2>
              <p className="text-one-white/40 text-sm mt-1">
                Comprehensive financial analysis and reporting
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-one-gold" />
                  Monthly Revenue Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MONTHLY_REVENUE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A/30" />
                    <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickFormatter={(v) => `$${Number(v) / 1000}k`}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #2A2A2A',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F4F1EA' }}
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'revenue'
                          ? 'Revenue'
                          : name === 'target'
                            ? 'Target'
                            : 'Collected',
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#D4A853" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar
                      dataKey="target"
                      fill="#5B8DB8"
                      radius={[4, 4, 0, 0]}
                      name="Target"
                      opacity={0.6}
                    />
                    <Bar
                      dataKey="collected"
                      fill="#7CBA7C"
                      radius={[4, 4, 0, 0]}
                      name="Collected"
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-one-gold" />
                    Revenue by Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <RePieChart>
                      <Pie
                        data={REVENUE_BY_SOURCE}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="revenue"
                      >
                        {REVENUE_BY_SOURCE.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #2A2A2A',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {REVENUE_BY_SOURCE.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-one-white/60 text-[10px]">
                          {entry.source}: {formatCurrency(entry.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-one-gold" />
                    Sponsor Tier Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <RePieChart>
                      <Pie
                        data={TIER_ANALYSIS}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="revenue"
                      >
                        {TIER_ANALYSIS.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #2A2A2A',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {TIER_ANALYSIS.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-one-white/60 text-[10px]">
                          {entry.tier}: {entry.count} sponsors
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-one-gold" />
                    Payment Method Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={PAYMENT_METHOD_ANALYSIS} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A/30" />
                      <XAxis
                        type="number"
                        stroke="#475569"
                        fontSize={11}
                        tickFormatter={(v) => `$${Number(v) / 1000}k`}
                      />
                      <YAxis
                        dataKey="method"
                        type="category"
                        stroke="#475569"
                        fontSize={10}
                        width={90}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #2A2A2A',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {PAYMENT_METHOD_ANALYSIS.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-one-gold" />
                    Collection Rate Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={COLLECTION_TRENDS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A/30" />
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                      <YAxis
                        stroke="#475569"
                        fontSize={11}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #2A2A2A',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value}%`, 'Collection Rate']}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#D4A853"
                        strokeWidth={2}
                        dot={{ fill: '#D4A853', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-one-gold" />
                  GST Summary (Quarterly)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]/20 hover:bg-transparent">
                      <TableHead className="text-one-white/50 text-xs">Quarter</TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        GST Collected
                      </TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        GST Paid
                      </TableHead>
                      <TableHead className="text-one-white/50 text-xs text-right">
                        Net GST
                      </TableHead>
                      <TableHead className="text-one-white/50 text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {GST_QUARTERS.map((q, idx) => (
                      <TableRow key={idx} className="border-[#2A2A2A]/15 hover:bg-one-gold/5">
                        <TableCell className="text-one-white text-xs font-medium">
                          {q.quarter}
                        </TableCell>
                        <TableCell className="text-emerald-400 text-xs text-right">
                          {formatCurrency(q.collected)}
                        </TableCell>
                        <TableCell className="text-red-400 text-xs text-right">
                          {formatCurrency(q.paid)}
                        </TableCell>
                        <TableCell
                          className={`text-xs font-semibold text-right ${
                            q.net >= 0 ? 'text-one-gold' : 'text-red-400'
                          }`}
                        >
                          {formatCurrency(q.net)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          >
                            Filed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {tab === 'forecast' && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h2 className="text-one-white text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-one-gold" />
                Revenue Forecasting
              </h2>
              <p className="text-one-white/40 text-sm mt-1">
                Projected revenue based on active contracts and renewal probability
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-one-white/50 text-xs">Conservative (6mo)</span>
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    {formatCurrency(
                      FORECAST_SCENARIOS.reduce((sum, m) => sum + m.conservative, 0),
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-one-gold" />
                    <span className="text-one-white/50 text-xs">Optimistic (6mo)</span>
                  </div>
                  <div className="text-xl font-bold text-one-gold">
                    {formatCurrency(
                      FORECAST_SCENARIOS.reduce((sum, m) => sum + m.optimistic, 0),
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span className="text-one-white/50 text-xs">Active Contract Base</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {formatCurrency(
                      renewals
                        .filter((r) => r.status !== 'churned')
                        .reduce((sum, r) => sum + r.currentContractValue, 0),
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-one-gold" />
                  6-Month Revenue Forecast
                </CardTitle>
                <p className="text-one-white/40 text-xs">
                  Conservative vs Optimistic scenarios
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={FORECAST_SCENARIOS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A/30" />
                    <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickFormatter={(v) => `$${Number(v) / 1000}k`}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #2A2A2A',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F4F1EA' }}
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'conservative' ? 'Conservative' : 'Optimistic',
                      ]}
                    />
                    <Bar
                      dataKey="conservative"
                      fill="#5B8DB8"
                      radius={[4, 4, 0, 0]}
                      name="Conservative"
                    />
                    <Bar
                      dataKey="optimistic"
                      fill="#D4A853"
                      radius={[4, 4, 0, 0]}
                      name="Optimistic"
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="bg-[#1E293B] border-[#2A2A2A]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-one-white text-base font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-one-gold" />
                  Forecast Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Active Contracts',
                      value: String(renewals.filter((r) => r.status !== 'churned').length),
                      sub: 'Sponsors under contract',
                      icon: FileText,
                      color: 'text-blue-400',
                    },
                    {
                      label: 'Weighted Renewal Probability',
                      value: `${Math.round(
                        activeRenewals.reduce((sum, r) => sum + r.probability, 0) /
                          (activeRenewals.length || 1),
                      )}%`,
                      sub: 'Average across all renewals',
                      icon: Target,
                      color: 'text-amber-400',
                    },
                    {
                      label: 'At-Risk Contracts',
                      value: String(activeRenewals.filter((r) => r.probability < 50).length),
                      sub: 'Require attention',
                      icon: AlertTriangle,
                      color: 'text-red-400',
                    },
                    {
                      label: 'Secured Revenue',
                      value: formatCurrency(
                        activeRenewals
                          .filter((r) => r.probability >= 80)
                          .reduce((sum, r) => sum + r.currentContractValue, 0),
                      ),
                      sub: 'High probability renewals',
                      icon: CheckCircle2,
                      color: 'text-emerald-400',
                    },
                  ].map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#101010]/50 border border-[#2A2A2A]/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <factor.icon className={`w-4 h-4 ${factor.color}`} />
                        <span className="text-one-white/50 text-[10px]">
                          {factor.label}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${factor.color}`}>
                        {factor.value}
                      </div>
                      <div className="text-[10px] text-one-white/30 mt-1">{factor.sub}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Record Payment dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#2A2A2A]/30 text-one-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-one-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-one-gold" />
              Record Payment
            </DialogTitle>
          </DialogHeader>
          {paymentInvoice && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#101010]/50 border border-[#2A2A2A]/20">
                <div className="text-xs text-one-white/50">Invoice</div>
                <div className="text-sm font-semibold text-one-white">
                  {paymentInvoice.number} — {paymentInvoice.company}
                </div>
                <div className="text-xs text-one-white/40">
                  Total: {formatCurrency(paymentInvoice.total)} | Paid:{' '}
                  {formatCurrency(paymentInvoice.paidAmount ?? 0)} | Balance:{' '}
                  {formatCurrency(paymentInvoice.total - (paymentInvoice.paidAmount ?? 0))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-one-white/50 mb-1 block">Amount</label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="bg-[#101010] border-[#2A2A2A]/30 text-one-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-one-white/50 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-[#101010] border-[#2A2A2A]/30 text-one-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-one-white/50 mb-1 block">
                  Payment Method
                </label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/30 text-one-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#2A2A2A]/30">
                    {PAYMENT_METHOD_OPTIONS.map((m) => (
                      <SelectItem
                        key={m}
                        value={m}
                        className="text-one-white hover:bg-one-gold/10"
                      >
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-one-white/50 mb-1 block">Reference</label>
                <Input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Payment reference number"
                  className="bg-[#101010] border-[#2A2A2A]/30 text-one-white text-sm placeholder:text-one-white/20"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              className="border-[#2A2A2A]/30 text-one-white/70 hover:text-one-white"
            >
              Cancel
            </Button>
            <Button
              onClick={recordPayment}
              className="bg-one-gold hover:bg-one-gold/90 text-one-navy"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#2A2A2A]/30 text-one-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-one-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Send Payment Reminder
            </DialogTitle>
          </DialogHeader>
          {reminderInvoice && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#101010]/50 border border-amber-500/20">
                <div className="text-xs text-one-white/50">Invoice</div>
                <div className="text-sm font-semibold text-one-white">
                  {reminderInvoice.number} — {reminderInvoice.company}
                </div>
                <div className="text-xs text-amber-400 mt-1">
                  Amount Due:{' '}
                  {formatCurrency(
                    reminderInvoice.total - (reminderInvoice.paidAmount ?? 0),
                  )}{' '}
                  | Overdue: {daysOverdue(reminderInvoice.dueDate)} days
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-one-white/60">
                  Opens your email client to{' '}
                  <strong className="text-one-white">{reminderInvoice.contactName}</strong>
                  {reminderInvoice.email ? (
                    <>
                      {' '}
                      &lt;<strong className="text-one-white">{reminderInvoice.email}</strong>&gt;
                    </>
                  ) : null}{' '}
                  at <strong className="text-one-white">{reminderInvoice.company}</strong>.
                  Nothing is emailed until you send that message.
                </p>
                <p className="text-xs text-one-white/40 mt-2">
                  Draft includes invoice number, amount due, and a request to pay from the PDF.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReminderDialogOpen(false)}
              className="border-[#2A2A2A]/30 text-one-white/70 hover:text-one-white"
            >
              Cancel
            </Button>
            <Button
              onClick={sendReminder}
              className="bg-amber-500 hover:bg-amber-600 text-one-navy"
            >
              <Send className="w-4 h-4 mr-1" />
              Open email client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Acquittal dialog */}
      <Dialog open={acquittalDialogOpen} onOpenChange={setAcquittalDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#2A2A2A]/30 text-one-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-one-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Confirm Acquittal
            </DialogTitle>
          </DialogHeader>
          {acquittalTarget && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#101010]/50 border border-emerald-500/20">
                <div className="text-xs text-one-white/50">Sponsor</div>
                <div className="text-sm font-semibold text-one-white">
                  {acquittalTarget.sponsorName}
                </div>
                <div className="text-xs text-one-white/40">
                  {acquittalTarget.campaign} — {acquittalTarget.contractPeriod}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-[#101010]/50 text-center">
                  <div className="text-[10px] text-one-white/40">Contract Value</div>
                  <div className="text-sm font-bold text-one-white">
                    {formatCurrency(acquittalTarget.contractValue)}
                  </div>
                </div>
                <div className="p-2 rounded bg-[#101010]/50 text-center">
                  <div className="text-[10px] text-one-white/40">Amount Paid</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {formatCurrency(acquittalTarget.amountPaid)}
                  </div>
                </div>
              </div>
              <p className="text-xs text-one-white/50">
                This will mark the acquittal as complete. All deliverables have been
                verified and payment confirmed.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcquittalDialogOpen(false)}
              className="border-[#2A2A2A]/30 text-one-white/70 hover:text-one-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAcquittal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Confirm Acquittal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

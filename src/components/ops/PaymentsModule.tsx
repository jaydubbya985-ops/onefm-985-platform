import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  Bell,
  Calendar,
  CheckCircle2,
  Copy,
  CreditCard,
  Crown,
  Download,
  DollarSign,
  FileText,
  Globe,
  Heart,
  History,
  IdCard,
  Landmark,
  Link2,
  Mail,
  Medal,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
import { useToast } from './Toast'
import {
  ACCENT,
  DONATION_SOURCES,
  DONOR_STATUSES,
  MEMBER_STATUSES,
  MEMBERSHIP_TIERS,
  MONTHLY_DONATION_GOAL,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYPAL_WEBHOOK_URL,
  SEED_CLIENT_PAYMENTS,
  SEED_DONATIONS,
  SEED_MEMBERS,
  SEED_OUTSTANDING_INVOICES,
  SEED_RECURRING_DONATIONS,
  STRIPE_WEBHOOK_URL,
  buildPaymentLink,
  type BillingFrequency,
  type ClientPayment,
  type DonationRecord,
  type DonationSource,
  type DonationType,
  type DonorStatus,
  type MemberRecord,
  type MembershipTierId,
  type PaymentMethod,
  type RecurringDonation,
  type RecurringStatus,
} from './data/payments'

// ---------------------------------------------------------------------------
// Persistence + shared helpers
// ---------------------------------------------------------------------------

function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

function isoToday(): string {
  return new Date().toISOString().split('T')[0]
}

function monthStartIso(): string {
  return `${isoToday().slice(0, 7)}-01`
}

function isoDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

type LucideIcon = typeof CreditCard

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, LucideIcon> = {
  bank_transfer: Landmark,
  credit_card: CreditCard,
  paypal: Wallet,
  direct_debit: ArrowLeftRight,
  cash: Banknote,
  cheque: FileText,
}

const DONATION_SOURCE_ICONS: Record<DonationSource, LucideIcon> = {
  website: Globe,
  event: Calendar,
  radio_appeal: Radio,
  direct_mail: Mail,
  other: MoreHorizontal,
}

const TIER_ICONS: Record<MembershipTierId, LucideIcon> = {
  bronze: Medal,
  silver: Star,
  gold: Trophy,
  platinum: Crown,
}

const STRIPE_PUBLISHABLE_KEY: string =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ?? ''
// Accepts both pk_live_ and pk_test_ keys
const STRIPE_KEY_CONFIGURED = STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_') || STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const fieldClass = 'bg-[#0F1D2F] border-slate-700 text-[#F4F1EA] mt-1'
const selectItemClass = 'text-[#F4F1EA] hover:bg-[#1E293B] focus:bg-[#1E293B]'

// ---------------------------------------------------------------------------
// Shared presentational pieces
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: string
  delay?: number
}

function StatCard({ title, value, subtitle, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      <Card className="border border-slate-800 bg-[#0F1D2F] hover:border-slate-700 transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {title}
              </p>
              <p
                className="text-2xl font-bold text-[#F4F1EA]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {value}
              </p>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
            <div className="rounded-lg p-2.5" style={{ backgroundColor: `${color}18` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-[#F4F1EA]">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Payments tab
// ---------------------------------------------------------------------------

function PaymentsTab() {
  const { toast } = useToast()
  const [payments, setPayments] = usePersistentState<ClientPayment[]>(
    'onefm_payments',
    SEED_CLIENT_PAYMENTS,
  )
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [recordOpen, setRecordOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('credit_card')
  const [date, setDate] = useState(isoToday())
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(STRIPE_KEY_CONFIGURED)
  const [stripeTestMode, setStripeTestMode] = useState(true)
  const [paypalConnected, setPaypalConnected] = useState(false)
  const [paypalTestMode, setPaypalTestMode] = useState(true)

  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    [payments],
  )
  const totalOutstanding = useMemo(
    () => SEED_OUTSTANDING_INVOICES.reduce((sum, inv) => sum + inv.balance, 0),
    [],
  )
  const collectionRate = useMemo(() => {
    const total = totalPaid + totalOutstanding
    return total > 0 ? ((totalPaid / total) * 100).toFixed(1) : '0'
  }, [totalPaid, totalOutstanding])

  const methodTotals = useMemo(() => {
    const totals: Partial<Record<PaymentMethod, number>> = {}
    payments
      .filter((p) => p.status === 'completed')
      .forEach((p) => {
        totals[p.method] = (totals[p.method] ?? 0) + p.amount
      })
    return totals
  }, [payments])

  const filteredPayments = useMemo(
    () =>
      payments.filter((p) => {
        const q = search.toLowerCase()
        const matches =
          p.clientName.toLowerCase().includes(q) ||
          p.invoiceNumber.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q)
        const methodOk = methodFilter === 'all' || p.method === methodFilter
        return matches && methodOk
      }),
    [payments, search, methodFilter],
  )

  const selectedInvoice = SEED_OUTSTANDING_INVOICES.find(
    (inv) => inv.id === selectedInvoiceId,
  )

  function recordPayment() {
    if (!selectedInvoice || !amount) return
    const value = parseFloat(amount)
    if (Number.isNaN(value) || value <= 0) return
    const record: ClientPayment = {
      id: `cp-${Date.now()}`,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.number,
      clientName: selectedInvoice.client,
      amount: value,
      method,
      date,
      reference: reference || `TRX-${Date.now().toString(36).toUpperCase()}`,
      notes,
      status: 'completed',
    }
    setPayments((prev) => [record, ...prev])
    toast(`Payment of $${value.toLocaleString()} recorded for ${selectedInvoice.number}`, 'success')
    setRecordOpen(false)
    setSelectedInvoiceId('')
    setAmount('')
    setReference('')
    setNotes('')
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    toast('Payment link copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const paymentLink = selectedInvoice ? buildPaymentLink(selectedInvoice.id) : ''

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paid This Month"
          value={`$${totalPaid.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`}
          subtitle="Completed payments"
          icon={DollarSign}
          color={ACCENT.gold}
          delay={0}
        />
        <StatCard
          title="Total Outstanding"
          value={`$${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`}
          subtitle={`${SEED_OUTSTANDING_INVOICES.length} invoices pending`}
          icon={AlertTriangle}
          color={ACCENT.warning}
          delay={0.05}
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          subtitle="Of total invoiced"
          icon={TrendingUp}
          color={ACCENT.success}
          delay={0.1}
        />
        <StatCard
          title="Total Transactions"
          value={`${payments.length}`}
          subtitle={`${payments.filter((p) => p.status === 'completed').length} completed`}
          icon={Receipt}
          color={ACCENT.info}
          delay={0.15}
        />
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#D4A853]" /> Payment Methods Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => {
                const config = PAYMENT_METHODS[key]
                const Icon = PAYMENT_METHOD_ICONS[key]
                const total = methodTotals[key] ?? 0
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-800 bg-[#0A1628] p-3 text-center hover:border-slate-700 transition-all"
                  >
                    <Icon
                      className="h-5 w-5 mx-auto mb-1.5"
                      style={{ color: config.color }}
                    />
                    <p className="text-xs text-slate-400">{config.label}</p>
                    <p className="text-sm font-semibold text-[#F4F1EA] mt-0.5">
                      ${total.toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Button
          onClick={() => setRecordOpen(true)}
          className="bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Record Payment
        </Button>
        <Button
          variant="outline"
          onClick={() => setLinkOpen(true)}
          className="border-slate-700 text-[#F4F1EA] hover:bg-[#1E293B] hover:text-[#D4A853]"
        >
          <Link2 className="h-4 w-4 mr-1.5" /> Payment Link Generator
        </Button>
      </motion.div>

      {/* Record Payment dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg">Record New Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300 text-xs">Select Invoice</Label>
              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Search invoices..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1D2F] border-slate-700">
                  {SEED_OUTSTANDING_INVOICES.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id} className={selectItemClass}>
                      {inv.number} — {inv.client} (Balance: ${inv.balance.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedInvoice && (
              <div className="rounded-lg bg-[#1E293B] border border-slate-700 p-3">
                <p className="text-xs text-slate-400">Invoice Balance</p>
                <p className="text-lg font-bold text-[#D4A853]">
                  $
                  {selectedInvoice.balance.toLocaleString('en-AU', {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Due: {selectedInvoice.dueDate}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Payment Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Payment Method</Label>
                <Select
                  value={method}
                  onValueChange={(v) => setMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {PAYMENT_METHODS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Payment Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Reference / Transaction ID</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="TRX-XXXXXX"
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className={`${fieldClass} min-h-[60px]`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRecordOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-[#1E293B]"
            >
              Cancel
            </Button>
            <Button
              onClick={recordPayment}
              className="bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Link Generator dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5" /> Payment Link Generator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300 text-xs">Select Invoice</Label>
              <Select onValueChange={setSelectedInvoiceId}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Choose an invoice..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1D2F] border-slate-700">
                  {SEED_OUTSTANDING_INVOICES.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id} className={selectItemClass}>
                      {inv.number} — {inv.client} (${inv.balance.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedInvoice && (
              <>
                <div className="rounded-lg bg-[#1E293B] border border-slate-700 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#D4A853] p-2 rounded-lg">
                      <QrCode className="h-8 w-8 text-[#0A1628]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F4F1EA]">Scan to Pay</p>
                      <p className="text-xs text-slate-400">
                        QR code for {selectedInvoice.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded bg-[#0A1628] border border-slate-700 p-2.5">
                    <code className="text-xs text-[#D4A853] flex-1 truncate">
                      {paymentLink}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyLink(paymentLink)}
                      className="h-7 px-2 text-slate-400 hover:text-[#D4A853]"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() =>
                      toast(
                        STRIPE_KEY_CONFIGURED
                          ? 'Stripe Checkout session would open here'
                          : 'Add VITE_STRIPE_PUBLISHABLE_KEY to enable Stripe checkout',
                        STRIPE_KEY_CONFIGURED ? 'info' : 'error',
                      )
                    }
                    className="bg-[#635BFF] hover:bg-[#7A73FF] text-white font-semibold"
                  >
                    <CreditCard className="h-4 w-4 mr-1.5" /> Pay with Stripe
                  </Button>
                  <Button
                    onClick={() => toast('PayPal checkout is not configured in this demo', 'info')}
                    className="bg-[#0070BA] hover:bg-[#0085E0] text-white font-semibold"
                  >
                    <Wallet className="h-4 w-4 mr-1.5" /> Pay with PayPal
                  </Button>
                </div>
              </>
            )}
            {!selectedInvoice && (
              <div className="text-center py-6 text-slate-500 text-sm">
                Select an invoice to generate a payment link
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLinkOpen(false)
                setSelectedInvoiceId('')
              }}
              className="border-slate-700 text-slate-300 hover:bg-[#1E293B]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#D4A853]" /> Recent Payments
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search payments..."
                    className="pl-8 h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-48"
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-36">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="all" className={selectItemClass}>
                      All Methods
                    </SelectItem>
                    {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {PAYMENT_METHODS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs font-medium">
                      Invoice
                    </TableHead>
                    <TableHead className="text-slate-400 text-xs font-medium">
                      Client
                    </TableHead>
                    <TableHead className="text-slate-400 text-xs font-medium">
                      Amount
                    </TableHead>
                    <TableHead className="text-slate-400 text-xs font-medium">
                      Method
                    </TableHead>
                    <TableHead className="text-slate-400 text-xs font-medium">Date</TableHead>
                    <TableHead className="text-slate-400 text-xs font-medium">
                      Reference
                    </TableHead>
                    <TableHead className="text-slate-400 text-xs font-medium">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, idx) => {
                    const methodConfig = PAYMENT_METHODS[payment.method]
                    const statusConfig = PAYMENT_STATUSES[payment.status]
                    const MethodIcon = PAYMENT_METHOD_ICONS[payment.method]
                    return (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-slate-800 hover:bg-[#162236] transition-colors border-b"
                      >
                        <TableCell className="text-xs text-[#F4F1EA] font-medium">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-xs text-[#F4F1EA]">
                          {payment.clientName}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-[#D4A853]">
                          $
                          {payment.amount.toLocaleString('en-AU', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MethodIcon
                              className="h-3 w-3"
                              style={{ color: methodConfig.color }}
                            />
                            <span className="text-xs text-slate-300">
                              {methodConfig.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {payment.date}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {payment.reference}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: `${statusConfig.color}22`,
                              color: statusConfig.color,
                              borderColor: `${statusConfig.color}44`,
                            }}
                            variant="outline"
                            className="text-[10px] font-medium"
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-800 bg-[#0F1D2F]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#635BFF]" /> Stripe Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      stripeConnected ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-[#F4F1EA]">
                    {stripeConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Test Mode</span>
                  <Switch checked={stripeTestMode} onCheckedChange={setStripeTestMode} />
                </div>
              </div>
              <div className="rounded-lg bg-[#0A1628] border border-slate-800 p-3">
                <p className="text-xs text-slate-400 mb-1">Webhook URL</p>
                <code className="text-xs text-[#635BFF] font-mono">{STRIPE_WEBHOOK_URL}</code>
              </div>
              {!STRIPE_KEY_CONFIGURED && (
                <p className="text-[11px] text-amber-400/80 leading-relaxed">
                  No publishable key found. Set{' '}
                  <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code> in your
                  environment to enable live Stripe checkout.
                </p>
              )}
              <Button
                onClick={() => {
                  if (!stripeConnected && !STRIPE_KEY_CONFIGURED) {
                    toast(
                      'Add VITE_STRIPE_PUBLISHABLE_KEY to your environment first',
                      'error',
                    )
                    return
                  }
                  setStripeConnected((c) => !c)
                }}
                variant="outline"
                className={`w-full text-xs font-semibold ${
                  stripeConnected
                    ? 'border-red-800 text-red-400 hover:bg-red-950/30'
                    : 'border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/10'
                }`}
              >
                {stripeConnected ? 'Disconnect Stripe' : 'Connect Stripe Account'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-slate-800 bg-[#0F1D2F]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#0070BA]" /> PayPal Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      paypalConnected ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-[#F4F1EA]">
                    {paypalConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Test Mode</span>
                  <Switch checked={paypalTestMode} onCheckedChange={setPaypalTestMode} />
                </div>
              </div>
              <div className="rounded-lg bg-[#0A1628] border border-slate-800 p-3">
                <p className="text-xs text-slate-400 mb-1">Webhook URL</p>
                <code className="text-xs text-[#0070BA] font-mono">{PAYPAL_WEBHOOK_URL}</code>
              </div>
              <Button
                onClick={() => setPaypalConnected((c) => !c)}
                variant="outline"
                className={`w-full text-xs font-semibold ${
                  paypalConnected
                    ? 'border-red-800 text-red-400 hover:bg-red-950/30'
                    : 'border-[#0070BA] text-[#0070BA] hover:bg-[#0070BA]/10'
                }`}
              >
                {paypalConnected ? 'Disconnect PayPal' : 'Connect PayPal Account'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Donations tab
// ---------------------------------------------------------------------------

interface DonorSummary {
  id: string
  name: string
  email: string
  phone: string
  totalDonated: number
  lastDonation: string
  donationCount: number
  status: DonorStatus
}

function DonationsTab() {
  const { toast } = useToast()
  const [donations, setDonations] = usePersistentState<DonationRecord[]>(
    'onefm_donations',
    SEED_DONATIONS,
  )
  const [recurring] = usePersistentState<RecurringDonation[]>(
    'onefm_recurring',
    SEED_RECURRING_DONATIONS,
  )
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [recordOpen, setRecordOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptDonation, setReceiptDonation] = useState<DonationRecord | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyDonor, setHistoryDonor] = useState<DonorSummary | null>(null)

  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [donationAmount, setDonationAmount] = useState('')
  const [donationType, setDonationType] = useState<DonationType>('one_time')
  const [donationMethod, setDonationMethod] = useState<PaymentMethod>('credit_card')
  const [donationDate, setDonationDate] = useState(isoToday())
  const [donationNotes, setDonationNotes] = useState('')
  const [donationSource, setDonationSource] = useState<DonationSource>('website')
  const [receiptNumber, setReceiptNumber] = useState('')

  const monthStart = monthStartIso()
  const donationsThisMonth = useMemo(
    () =>
      donations.filter((d) => d.date >= monthStart).reduce((sum, d) => sum + d.amount, 0),
    [donations, monthStart],
  )
  const donationsYtd = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations],
  )
  const uniqueDonors = useMemo(
    () => new Set(donations.map((d) => d.email)).size,
    [donations],
  )
  const averageDonation = donations.length > 0 ? donationsYtd / donations.length : 0
  const goalProgress = Math.min((donationsThisMonth / MONTHLY_DONATION_GOAL) * 100, 100)

  const donors = useMemo<DonorSummary[]>(() => {
    const map = new Map<
      string,
      { name: string; email: string; phone: string; total: number; last: string; count: number }
    >()
    donations.forEach((d) => {
      const existing = map.get(d.email)
      if (existing) {
        existing.total += d.amount
        existing.count += 1
        if (d.date > existing.last) existing.last = d.date
      } else {
        map.set(d.email, {
          name: d.donorName,
          email: d.email,
          phone: d.phone,
          total: d.amount,
          last: d.date,
          count: 1,
        })
      }
    })
    return Array.from(map.values()).map((d, idx) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(d.last).getTime()) / 86400000,
      )
      let status: DonorStatus = 'active'
      if (daysSince > 90) status = 'lapsed'
      else if (d.count === 1) status = 'new'
      return {
        id: `donor-${idx + 1}`,
        name: d.name,
        email: d.email,
        phone: d.phone,
        totalDonated: d.total,
        lastDonation: d.last,
        donationCount: d.count,
        status,
      }
    })
  }, [donations])

  const filteredDonations = useMemo(
    () =>
      donations.filter((d) => {
        const q = search.toLowerCase()
        const matches =
          d.donorName.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.receiptNumber.toLowerCase().includes(q)
        const sourceOk = sourceFilter === 'all' || d.source === sourceFilter
        const typeOk = typeFilter === 'all' || d.type === typeFilter
        return matches && sourceOk && typeOk
      }),
    [donations, search, sourceFilter, typeFilter],
  )

  const donorHistory = useMemo(
    () =>
      historyDonor
        ? donations
            .filter((d) => d.email === historyDonor.email)
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    [donations, historyDonor],
  )

  function generateReceiptNumber() {
    setReceiptNumber(
      `ONE-D-${new Date().getFullYear()}-${String(donations.length + 1).padStart(3, '0')}`,
    )
  }

  function saveDonation() {
    if (!donorName || !donationAmount) return
    const value = parseFloat(donationAmount)
    if (Number.isNaN(value) || value <= 0) return
    const record: DonationRecord = {
      id: `don-${Date.now()}`,
      donorName,
      email: donorEmail,
      phone: donorPhone,
      amount: value,
      type: donationType,
      method: donationMethod,
      date: donationDate,
      source: donationSource,
      receiptNumber:
        receiptNumber ||
        `ONE-D-${new Date().getFullYear()}-${String(donations.length + 1).padStart(3, '0')}`,
      notes: donationNotes || undefined,
    }
    setDonations((prev) => [record, ...prev])
    toast(`Donation of $${value.toLocaleString()} recorded — thank you ${donorName}!`, 'success')
    setRecordOpen(false)
    setDonorName('')
    setDonorEmail('')
    setDonorPhone('')
    setDonationAmount('')
    setDonationNotes('')
    setReceiptNumber('')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Donations This Month"
          value={`$${donationsThisMonth.toLocaleString()}`}
          subtitle={`Goal: $${MONTHLY_DONATION_GOAL.toLocaleString()}`}
          icon={Heart}
          color={ACCENT.danger}
          delay={0}
        />
        <StatCard
          title="Donations YTD"
          value={`$${donationsYtd.toLocaleString()}`}
          subtitle="All donations"
          icon={TrendingUp}
          color={ACCENT.gold}
          delay={0.05}
        />
        <StatCard
          title="Unique Donors"
          value={`${uniqueDonors}`}
          subtitle="Contributors"
          icon={Users}
          color={ACCENT.info}
          delay={0.1}
        />
        <StatCard
          title="Average Donation"
          value={`$${averageDonation.toFixed(2)}`}
          subtitle="Per contribution"
          icon={DollarSign}
          color={ACCENT.success}
          delay={0.15}
        />
        <StatCard
          title="Recurring Donors"
          value={`${recurring.filter((r) => r.status === 'active').length}`}
          subtitle="Monthly active"
          icon={RefreshCw}
          color={ACCENT.warning}
          delay={0.2}
        />
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D4A853]" />
                <span className="text-sm font-medium text-[#F4F1EA]">
                  Monthly Donation Goal
                </span>
              </div>
              <span className="text-xs text-slate-400">
                ${donationsThisMonth.toLocaleString()} of $
                {MONTHLY_DONATION_GOAL.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 bg-[#1E293B] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C875]"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {goalProgress.toFixed(0)}% of monthly target reached
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            setRecordOpen(true)
            generateReceiptNumber()
          }}
          className="bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Record Donation
        </Button>
      </motion.div>

      {/* Record Donation dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" /> Record New Donation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Donor Name</Label>
                <Input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Full name"
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Email</Label>
                <Input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="For receipt"
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Phone</Label>
                <Input
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="Phone number"
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Donation Type</Label>
                <Select
                  value={donationType}
                  onValueChange={(v) => setDonationType(v as DonationType)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="one_time" className={selectItemClass}>
                      One-time
                    </SelectItem>
                    <SelectItem value="monthly_recurring" className={selectItemClass}>
                      Monthly Recurring
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Payment Method</Label>
                <Select
                  value={donationMethod}
                  onValueChange={(v) => setDonationMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {PAYMENT_METHODS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Date</Label>
                <Input
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Campaign / Source</Label>
                <Select
                  value={donationSource}
                  onValueChange={(v) => setDonationSource(v as DonationSource)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    {(Object.keys(DONATION_SOURCES) as DonationSource[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {DONATION_SOURCES[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Notes</Label>
              <Textarea
                value={donationNotes}
                onChange={(e) => setDonationNotes(e.target.value)}
                placeholder="Optional notes..."
                className={`${fieldClass} min-h-[50px]`}
              />
            </div>
            <div className="rounded-lg bg-[#1E293B] border border-slate-700 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Tax Receipt Number</p>
                <p className="text-sm font-mono font-semibold text-[#D4A853]">
                  {receiptNumber || '—'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={generateReceiptNumber}
                className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853]/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Generate
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRecordOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-[#1E293B]"
            >
              Cancel
            </Button>
            <Button
              onClick={saveDonation}
              className="bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Save Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tax Receipt dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" /> Tax Receipt
            </DialogTitle>
          </DialogHeader>
          {receiptDonation && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-[#D4A853]/30 bg-[#0F1D2F] p-6 space-y-5">
                <div className="text-center border-b border-slate-700 pb-4">
                  <h2
                    className="text-xl font-bold text-[#D4A853]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    ONE FM 98.5
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Official Tax Donation Receipt
                  </p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">
                      Receipt No.
                    </p>
                    <p className="text-sm font-semibold text-[#F4F1EA] font-mono">
                      {receiptDonation.receiptNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">
                      Date Issued
                    </p>
                    <p className="text-sm font-semibold text-[#F4F1EA]">
                      {receiptDonation.date}
                    </p>
                  </div>
                </div>
                <div className="rounded bg-[#0A1628] border border-slate-700 p-4 space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    Donor Details
                  </p>
                  <p className="text-sm text-[#F4F1EA] font-medium">
                    {receiptDonation.donorName}
                  </p>
                  <p className="text-xs text-slate-400">{receiptDonation.email}</p>
                  <p className="text-xs text-slate-400">{receiptDonation.phone}</p>
                </div>
                <div className="rounded bg-[#0A1628] border border-slate-700 p-4 space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    Donation Details
                  </p>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#F4F1EA]">Amount Donated</span>
                    <span className="text-sm font-bold text-[#D4A853]">
                      ${receiptDonation.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#F4F1EA]">Payment Method</span>
                    <span className="text-sm text-slate-300">
                      {PAYMENT_METHODS[receiptDonation.method].label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#F4F1EA]">Type</span>
                    <span className="text-sm text-slate-300">
                      {receiptDonation.type === 'one_time' ? 'One-time' : 'Monthly Recurring'}
                    </span>
                  </div>
                </div>
                <div className="rounded bg-emerald-950/30 border border-emerald-800/50 p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-emerald-300 leading-relaxed">
                      ONE FM 98.5 is registered as a Deductible Gift Recipient (DGR). This
                      donation is tax deductible. ABN: 12 345 678 901. Receipt type: GIFT.
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 text-center italic">
                  This receipt is for taxation purposes. Please keep it with your tax
                  records.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => toast('Receipt sent to printer', 'success')}
                  className="flex-1 bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
                >
                  <Printer className="h-4 w-4 mr-1.5" /> Print Receipt
                </Button>
                <Button
                  onClick={() => toast('Receipt PDF downloaded', 'success')}
                  variant="outline"
                  className="flex-1 border-slate-700 text-[#F4F1EA] hover:bg-[#1E293B] hover:text-[#D4A853]"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Donor History dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Donor History
            </DialogTitle>
          </DialogHeader>
          {historyDonor && (
            <div className="space-y-4">
              <div className="rounded-lg bg-[#0F1D2F] border border-slate-700 p-4">
                <h4 className="text-base font-semibold text-[#F4F1EA]">
                  {historyDonor.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {historyDonor.email} · {historyDonor.phone}
                </p>
                <div className="flex gap-4 mt-3">
                  <div>
                    <p className="text-xs text-slate-400">Total Donated</p>
                    <p className="text-lg font-bold text-[#D4A853]">
                      ${historyDonor.totalDonated.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Donations</p>
                    <p className="text-lg font-bold text-[#F4F1EA]">
                      {historyDonor.donationCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <Badge
                      style={{
                        backgroundColor: `${DONOR_STATUSES[historyDonor.status].color}22`,
                        color: DONOR_STATUSES[historyDonor.status].color,
                      }}
                      variant="outline"
                      className="text-[10px] mt-0.5"
                    >
                      {DONOR_STATUSES[historyDonor.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 text-xs">Date</TableHead>
                      <TableHead className="text-slate-400 text-xs">Amount</TableHead>
                      <TableHead className="text-slate-400 text-xs">Type</TableHead>
                      <TableHead className="text-slate-400 text-xs">Method</TableHead>
                      <TableHead className="text-slate-400 text-xs">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donorHistory.map((d) => (
                      <TableRow key={d.id} className="border-slate-800 hover:bg-[#162236]">
                        <TableCell className="text-xs text-[#F4F1EA]">{d.date}</TableCell>
                        <TableCell className="text-xs font-semibold text-[#D4A853]">
                          ${d.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-slate-700 text-slate-300"
                          >
                            {d.type === 'one_time' ? 'One-time' : 'Monthly'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {PAYMENT_METHODS[d.method].label}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {d.receiptNumber}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#D4A853]" /> Donation Records
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-40"
                  />
                </div>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-32">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="all" className={selectItemClass}>
                      All Sources
                    </SelectItem>
                    {(Object.keys(DONATION_SOURCES) as DonationSource[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {DONATION_SOURCES[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-28">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="all" className={selectItemClass}>
                      All Types
                    </SelectItem>
                    <SelectItem value="one_time" className={selectItemClass}>
                      One-time
                    </SelectItem>
                    <SelectItem value="monthly_recurring" className={selectItemClass}>
                      Monthly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs">Donor</TableHead>
                    <TableHead className="text-slate-400 text-xs">Amount</TableHead>
                    <TableHead className="text-slate-400 text-xs">Type</TableHead>
                    <TableHead className="text-slate-400 text-xs">Source</TableHead>
                    <TableHead className="text-slate-400 text-xs">Date</TableHead>
                    <TableHead className="text-slate-400 text-xs">Receipt</TableHead>
                    <TableHead className="text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation, idx) => {
                    const SourceIcon = DONATION_SOURCE_ICONS[donation.source]
                    return (
                      <motion.tr
                        key={donation.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        className="border-slate-800 hover:bg-[#162236] transition-colors border-b"
                      >
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium text-[#F4F1EA]">
                              {donation.donorName}
                            </p>
                            <p className="text-[10px] text-slate-500">{donation.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-[#D4A853]">
                          ${donation.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-slate-700 text-slate-300"
                          >
                            {donation.type === 'one_time' ? 'One-time' : 'Monthly'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <SourceIcon className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-400">
                              {DONATION_SOURCES[donation.source].label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {donation.date}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {donation.receiptNumber}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReceiptDonation(donation)
                              setReceiptOpen(true)
                            }}
                            className="h-7 px-2 text-slate-400 hover:text-[#D4A853]"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#D4A853]" /> Donor Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs">Name</TableHead>
                    <TableHead className="text-slate-400 text-xs">Email</TableHead>
                    <TableHead className="text-slate-400 text-xs">Total Donated</TableHead>
                    <TableHead className="text-slate-400 text-xs">Last Donation</TableHead>
                    <TableHead className="text-slate-400 text-xs">Count</TableHead>
                    <TableHead className="text-slate-400 text-xs">Status</TableHead>
                    <TableHead className="text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors.slice(0, 10).map((donor, idx) => (
                    <motion.tr
                      key={donor.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-slate-800 hover:bg-[#162236] transition-colors border-b"
                    >
                      <TableCell className="text-xs font-medium text-[#F4F1EA]">
                        {donor.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">{donor.email}</TableCell>
                      <TableCell className="text-xs font-semibold text-[#D4A853]">
                        ${donor.totalDonated.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {donor.lastDonation}
                      </TableCell>
                      <TableCell className="text-xs text-[#F4F1EA]">
                        {donor.donationCount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: `${DONOR_STATUSES[donor.status].color}22`,
                            color: DONOR_STATUSES[donor.status].color,
                          }}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {DONOR_STATUSES[donor.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setHistoryDonor(donor)
                            setHistoryOpen(true)
                          }}
                          className="h-7 px-2 text-slate-400 hover:text-[#D4A853]"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[#D4A853]" /> Recurring Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs">Donor</TableHead>
                    <TableHead className="text-slate-400 text-xs">Amount / Month</TableHead>
                    <TableHead className="text-slate-400 text-xs">Start Date</TableHead>
                    <TableHead className="text-slate-400 text-xs">Next Charge</TableHead>
                    <TableHead className="text-slate-400 text-xs">Total Charged</TableHead>
                    <TableHead className="text-slate-400 text-xs">Status</TableHead>
                    <TableHead className="text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurring.map((rd, idx) => (
                    <RecurringDonationRow key={rd.id} rd={rd} index={idx} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const RECURRING_STATUS_COLORS: Record<RecurringStatus, string> = {
  active: '#10B981',
  paused: '#F59E0B',
  cancelled: '#EF4444',
}

function RecurringDonationRow({ rd, index }: { rd: RecurringDonation; index: number }) {
  const [status, setStatus] = useState<RecurringStatus>(rd.status)

  function togglePause() {
    if (status === 'active') setStatus('paused')
    else if (status === 'paused') setStatus('active')
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="border-slate-800 hover:bg-[#162236] transition-colors border-b"
    >
      <TableCell>
        <div>
          <p className="text-xs font-medium text-[#F4F1EA]">{rd.donorName}</p>
          <p className="text-[10px] text-slate-500">{rd.email}</p>
        </div>
      </TableCell>
      <TableCell className="text-xs font-semibold text-[#D4A853]">
        ${rd.amount.toFixed(2)}
      </TableCell>
      <TableCell className="text-xs text-slate-400">{rd.startDate}</TableCell>
      <TableCell className="text-xs text-slate-400">
        {status === 'cancelled' ? '—' : rd.nextChargeDate}
      </TableCell>
      <TableCell className="text-xs text-[#F4F1EA]">${rd.totalCharged.toFixed(2)}</TableCell>
      <TableCell>
        <Badge
          style={{
            backgroundColor: `${RECURRING_STATUS_COLORS[status]}22`,
            color: RECURRING_STATUS_COLORS[status],
          }}
          variant="outline"
          className="text-[10px] capitalize"
        >
          {status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {status !== 'cancelled' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePause}
              className="h-7 w-7 p-0 text-slate-400 hover:text-[#D4A853]"
              title={status === 'active' ? 'Pause' : 'Resume'}
            >
              {status === 'active' ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          {status !== 'cancelled' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStatus('cancelled')}
              className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
              title="Cancel"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TableCell>
    </motion.tr>
  )
}

// ---------------------------------------------------------------------------
// Memberships tab
// ---------------------------------------------------------------------------

function MembershipsTab() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [registerOpen, setRegisterOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [cardMember, setCardMember] = useState<MemberRecord | null>(null)
  const [members, setMembers] = usePersistentState<MemberRecord[]>(
    'onefm_members',
    SEED_MEMBERS,
  )

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [tier, setTier] = useState<MembershipTierId>('bronze')
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const [source, setSource] = useState('')
  const [agreed, setAgreed] = useState(false)

  const monthStart = monthStartIso()
  const expiryWindowEnd = isoDaysFromNow(30)
  const today = isoToday()

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === 'active').length,
    [members],
  )
  const newThisMonth = useMemo(
    () => members.filter((m) => m.joinDate >= monthStart && m.status === 'active').length,
    [members, monthStart],
  )
  const monthlyRevenue = useMemo(
    () =>
      members
        .filter((m) => m.status === 'active')
        .reduce(
          (sum, m) => sum + (m.billingFrequency === 'monthly' ? m.amount : m.amount / 12),
          0,
        ),
    [members],
  )
  const expiringSoon = useMemo(
    () =>
      members.filter(
        (m) =>
          m.status === 'active' &&
          m.renewalDate >= today &&
          m.renewalDate <= expiryWindowEnd,
      ),
    [members, today, expiryWindowEnd],
  )
  const retentionRate = useMemo(() => {
    const notCancelled = members.filter((m) => m.status !== 'cancelled').length
    const active = members.filter((m) => m.status === 'active').length
    return notCancelled > 0 ? ((active / notCancelled) * 100).toFixed(1) : '0'
  }, [members])

  const filteredMembers = useMemo(
    () =>
      members.filter((m) => {
        const q = search.toLowerCase()
        const matches =
          m.name.toLowerCase().includes(q) ||
          m.memberId.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        const tierOk = tierFilter === 'all' || m.tier === tierFilter
        const statusOk = statusFilter === 'all' || m.status === statusFilter
        return matches && tierOk && statusOk
      }),
    [members, search, tierFilter, statusFilter],
  )

  function registerMember() {
    const renewal = new Date()
    if (frequency === 'monthly') renewal.setMonth(renewal.getMonth() + 1)
    else renewal.setFullYear(renewal.getFullYear() + 1)
    const record: MemberRecord = {
      id: `m${Date.now()}`,
      memberId: `ONE-M-985${String(members.length + 1).padStart(2, '0')}`,
      name,
      email,
      phone,
      address,
      tier,
      billingFrequency: frequency,
      joinDate: isoToday(),
      renewalDate: renewal.toISOString().split('T')[0],
      amount: MEMBERSHIP_TIERS[tier][frequency],
      status: 'active',
      autoRenew: true,
      paymentMethod,
      source,
    }
    setMembers((prev) => [...prev, record])
    toast(`Welcome aboard, ${name}! Membership ${record.memberId} created`, 'success')
    setRegisterOpen(false)
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setSource('')
    setAgreed(false)
  }

  function setMemberStatus(id: string, status: MemberRecord['status']) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Members"
          value={`${activeMembers}`}
          subtitle="Current members"
          icon={Users}
          color={ACCENT.info}
          delay={0}
        />
        <StatCard
          title="New This Month"
          value={`${newThisMonth}`}
          subtitle="Recently joined"
          icon={Plus}
          color={ACCENT.success}
          delay={0.05}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toFixed(0)}`}
          subtitle="Est. from active"
          icon={DollarSign}
          color={ACCENT.gold}
          delay={0.1}
        />
        <StatCard
          title="Expiring Soon"
          value={`${expiringSoon.length}`}
          subtitle="Within 30 days"
          icon={Calendar}
          color={ACCENT.warning}
          delay={0.15}
        />
        <StatCard
          title="Retention Rate"
          value={`${retentionRate}%`}
          subtitle="Active vs lapsed"
          icon={TrendingUp}
          color={ACCENT.success}
          delay={0.2}
        />
      </div>

      <motion.div variants={itemVariants}>
        <SectionHeader title="Membership Tiers" subtitle="Choose your level of support" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(MEMBERSHIP_TIERS) as MembershipTierId[]).map((key) => {
            const config = MEMBERSHIP_TIERS[key]
            const TierIcon = TIER_ICONS[key]
            const count = members.filter(
              (m) => m.tier === key && m.status === 'active',
            ).length
            return (
              <motion.div key={key} variants={itemVariants}>
                <Card className="border border-slate-800 bg-[#0F1D2F] hover:border-slate-700 transition-all overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: config.color }} />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TierIcon className="h-5 w-5" style={{ color: config.color }} />
                        <span className="text-sm font-bold text-[#F4F1EA]">
                          {config.label}
                        </span>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: `${config.color}22`,
                          color: config.color,
                        }}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {count} members
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-xl font-bold text-[#D4A853]">
                        ${config.monthly}
                      </span>
                      <span className="text-xs text-slate-500">/month</span>
                      <span className="text-xs text-slate-600 mx-1">or</span>
                      <span className="text-sm font-semibold text-[#F4F1EA]">
                        ${config.annual}
                      </span>
                      <span className="text-xs text-slate-500">/year</span>
                    </div>
                    <div className="space-y-1.5">
                      {config.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2
                            className="h-3 w-3 flex-shrink-0"
                            style={{ color: config.color }}
                          />
                          <span className="text-xs text-slate-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Button
          onClick={() => setRegisterOpen(true)}
          className="bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Register New Member
        </Button>
      </motion.div>

      {/* Member Registration dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Member Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className={fieldClass}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Residential address"
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Membership Tier</Label>
                <Select value={tier} onValueChange={(v) => setTier(v as MembershipTierId)}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    {(Object.keys(MEMBERSHIP_TIERS) as MembershipTierId[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {MEMBERSHIP_TIERS[key].label} — ${MEMBERSHIP_TIERS[key].monthly}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Billing Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(v) => setFrequency(v as BillingFrequency)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="monthly" className={selectItemClass}>
                      Monthly
                    </SelectItem>
                    <SelectItem value="annual" className={selectItemClass}>
                      Annual (Save ~17%)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="credit_card" className={selectItemClass}>
                      Credit Card
                    </SelectItem>
                    <SelectItem value="direct_debit" className={selectItemClass}>
                      Direct Debit
                    </SelectItem>
                    <SelectItem value="paypal" className={selectItemClass}>
                      PayPal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">How did you hear about us?</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Radio, Friend, Web..."
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="rounded-lg bg-[#1E293B] border border-slate-700 p-3">
              <p className="text-xs text-slate-400 mb-2">Membership Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#F4F1EA]">
                  {MEMBERSHIP_TIERS[tier].label} Member ({frequency})
                </span>
                <span className="font-semibold text-[#D4A853]">
                  ${MEMBERSHIP_TIERS[tier][frequency]}
                  {frequency === 'monthly' ? '/mo' : '/yr'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="border-slate-600"
              />
              <Label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer">
                I agree to the membership terms and conditions
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegisterOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-[#1E293B]"
            >
              Cancel
            </Button>
            <Button
              onClick={registerMember}
              disabled={!name || !email || !agreed}
              className="bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Join Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Digital Membership Card dialog */}
      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent className="bg-[#0A1628] border border-slate-800 text-[#F4F1EA] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#D4A853] text-lg flex items-center gap-2">
              <IdCard className="h-5 w-5" /> Digital Membership Card
            </DialogTitle>
          </DialogHeader>
          {cardMember && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-[#D4A853]/30 bg-gradient-to-br from-[#0F1D2F] to-[#162236] p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#D4A853]/10 border-2 border-[#D4A853]/30 flex items-center justify-center">
                  <Users className="h-8 w-8 text-[#D4A853]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F4F1EA]">{cardMember.name}</h3>
                  <p className="text-xs text-slate-400">{cardMember.email}</p>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Member ID</p>
                    <p className="text-xs font-mono text-[#D4A853]">{cardMember.memberId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Tier</p>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: MEMBERSHIP_TIERS[cardMember.tier].color }}
                    >
                      {MEMBERSHIP_TIERS[cardMember.tier].label}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Joined</p>
                    <p className="text-xs text-[#F4F1EA]">{cardMember.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Expires</p>
                    <p className="text-xs text-[#F4F1EA]">{cardMember.renewalDate}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white p-2 rounded-lg">
                    <QrCode className="h-16 w-16 text-[#0A1628]" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">Scan at event check-in</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => toast('Membership card sent to printer', 'success')}
                  className="flex-1 bg-[#D4A853] hover:bg-[#E8C875] text-[#0A1628] font-semibold"
                >
                  <Printer className="h-4 w-4 mr-1.5" /> Print Card
                </Button>
                <Button
                  onClick={() => toast('Membership card downloaded', 'success')}
                  variant="outline"
                  className="flex-1 border-slate-700 text-[#F4F1EA] hover:bg-[#1E293B] hover:text-[#D4A853]"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#D4A853]" /> Member Directory
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members..."
                    className="pl-8 h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-40"
                  />
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-28">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="all" className={selectItemClass}>
                      All Tiers
                    </SelectItem>
                    {(Object.keys(MEMBERSHIP_TIERS) as MembershipTierId[]).map((key) => (
                      <SelectItem key={key} value={key} className={selectItemClass}>
                        {MEMBERSHIP_TIERS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs bg-[#0A1628] border-slate-700 text-[#F4F1EA] w-28">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1D2F] border-slate-700">
                    <SelectItem value="all" className={selectItemClass}>
                      All Status
                    </SelectItem>
                    <SelectItem value="active" className={selectItemClass}>
                      Active
                    </SelectItem>
                    <SelectItem value="lapsed" className={selectItemClass}>
                      Lapsed
                    </SelectItem>
                    <SelectItem value="cancelled" className={selectItemClass}>
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs">Member ID</TableHead>
                    <TableHead className="text-slate-400 text-xs">Name</TableHead>
                    <TableHead className="text-slate-400 text-xs">Tier</TableHead>
                    <TableHead className="text-slate-400 text-xs">Join Date</TableHead>
                    <TableHead className="text-slate-400 text-xs">Renewal</TableHead>
                    <TableHead className="text-slate-400 text-xs">Amount</TableHead>
                    <TableHead className="text-slate-400 text-xs">Status</TableHead>
                    <TableHead className="text-slate-400 text-xs">Auto</TableHead>
                    <TableHead className="text-slate-400 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member, idx) => {
                    const tierConfig = MEMBERSHIP_TIERS[member.tier]
                    const TierIcon = TIER_ICONS[member.tier]
                    const statusConfig = MEMBER_STATUSES[member.status]
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        className="border-slate-800 hover:bg-[#162236] transition-colors border-b"
                      >
                        <TableCell className="text-xs font-mono text-slate-400">
                          {member.memberId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium text-[#F4F1EA]">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-slate-500">{member.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TierIcon
                              className="h-3.5 w-3.5"
                              style={{ color: tierConfig.color }}
                            />
                            <span className="text-xs text-slate-300">
                              {tierConfig.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {member.joinDate}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {member.renewalDate}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-[#D4A853]">
                          ${member.amount.toFixed(2)}
                          <span className="text-slate-500 font-normal">
                            /{member.billingFrequency === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: `${statusConfig.color}22`,
                              color: statusConfig.color,
                            }}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.autoRenew ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-slate-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setCardMember(member)
                                setCardOpen(true)
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-[#D4A853]"
                              title="View Card"
                            >
                              <IdCard className="h-3.5 w-3.5" />
                            </Button>
                            {member.status === 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setMemberStatus(member.id, 'lapsed')}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-amber-500"
                                title="Pause"
                              >
                                <Pause className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {member.status === 'lapsed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setMemberStatus(member.id, 'active')}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-500"
                                title="Renew"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {member.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setMemberStatus(member.id, 'cancelled')}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                                title="Cancel"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
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
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border border-slate-800 bg-[#0F1D2F]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#F4F1EA] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#D4A853]" /> Expiring Soon (Next 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No memberships expiring in the next 30 days.
              </p>
            ) : (
              <div className="space-y-2">
                {expiringSoon.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0A1628] p-3 hover:border-amber-800/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#F4F1EA]">{member.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {MEMBERSHIP_TIERS[member.tier].label} · Expires{' '}
                          {member.renewalDate}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast(`Renewal reminder sent to ${member.name}`, 'success')}
                      className="h-7 text-xs border-amber-800 text-amber-400 hover:bg-amber-950/30"
                    >
                      <Send className="h-3 w-3 mr-1" /> Send Reminder
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Module shell
// ---------------------------------------------------------------------------

type ModuleTab = 'payments' | 'donations' | 'memberships'

export default function PaymentsModule() {
  const [tab, setTab] = useState<ModuleTab>('payments')

  // Header total reads the same persisted stores the tabs use.
  const [payments] = usePersistentState<ClientPayment[]>(
    'onefm_payments',
    SEED_CLIENT_PAYMENTS,
  )
  const [donations] = usePersistentState<DonationRecord[]>(
    'onefm_donations',
    SEED_DONATIONS,
  )
  const [members] = usePersistentState<MemberRecord[]>('onefm_members', SEED_MEMBERS)

  const totalIncomeYtd =
    payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) +
    donations.reduce((sum, d) => sum + d.amount, 0) +
    members
      .filter((m) => m.status === 'active')
      .reduce(
        (sum, m) => sum + m.amount * (m.billingFrequency === 'monthly' ? 12 : 1),
        0,
      ) /
      12

  const tabTriggerClass =
    'text-xs font-medium text-slate-400 data-[state=active]:text-[#0A1628] data-[state=active]:bg-[#D4A853] data-[state=active]:font-semibold px-4 py-2 rounded-md transition-all'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: ACCENT.gold, fontFamily: 'var(--font-heading)' }}
          >
            Payments &amp; Donations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage invoice payments, tax-deductible donations, and community memberships
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0F1D2F] border border-slate-800 px-3 py-2">
          <DollarSign className="h-4 w-4 text-[#D4A853]" />
          <span className="text-xs text-slate-400">Total Income YTD:</span>
          <span className="text-sm font-bold text-[#D4A853]">
            ${Math.round(totalIncomeYtd).toLocaleString()}
          </span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ModuleTab)} className="w-full">
        <TabsList className="bg-[#0F1D2F] border border-slate-800 p-1 h-auto gap-1">
          <TabsTrigger value="payments" className={tabTriggerClass}>
            <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Payments
          </TabsTrigger>
          <TabsTrigger value="donations" className={tabTriggerClass}>
            <Heart className="h-3.5 w-3.5 mr-1.5" /> Donations
          </TabsTrigger>
          <TabsTrigger value="memberships" className={tabTriggerClass}>
            <Users className="h-3.5 w-3.5 mr-1.5" /> Memberships
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="payments" className="mt-6">
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <PaymentsTab />
            </motion.div>
          </TabsContent>
          <TabsContent value="donations" className="mt-6">
            <motion.div
              key="donations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <DonationsTab />
            </motion.div>
          </TabsContent>
          <TabsContent value="memberships" className="mt-6">
            <motion.div
              key="memberships"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <MembershipsTab />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Award,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FilePenLine,
  FileText,
  Filter,
  Paperclip,
  Plus,
  Radio,
  Receipt,
  RefreshCw,
  Search,
  SquarePen,
  Trash2,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from './Toast'
import { useOpsStore } from './store'
import {
  CONTRACT_STATES,
  INDUSTRIES,
  type Contract,
  type ContractStatus,
} from './data/sponsors'
import {
  BILLING_FREQUENCIES,
  CONTRACT_STATUSES,
  CONTRACT_TEMPLATES,
  DAYPARTS,
  INVOICE_STATUS_BADGE_CLASSES,
  PACKAGE_TYPES,
  PAYMENT_TERMS,
  SPOT_DURATIONS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  addDays,
  billingFrequencyLabel,
  buildInvoiceEmailBody,
  contractToForm,
  daysUntil,
  durationDays,
  emptyContractForm,
  formatCurrency,
  formatDate,
  gstOf,
  isoDate,
  nextContractNumber,
  normalizeContract,
  packageTypeLabel,
  paymentTermsLabel,
  totalIncGstOf,
  type ContractFormState,
  type RichContract,
} from './contracts/constants'
import { buildXeroLinesFromContracts, downloadXeroCsv, summarizeXeroExport } from './contracts/xero'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { generateContractPdf } from '@/lib/contractDocument'

// ---------------------------------------------------------------------------
// Local persistence for contracts created in this module. Contracts from the
// shared ops store (seeds + accepted proposals) are merged with these.
// ---------------------------------------------------------------------------

const LOCAL_CONTRACTS_KEY = 'onefm_contracts_local'

/** Jason Welsh — Vice Chairperson (BOARD_2024 / Annual Report 2024). Not Station Manager. */
const CONTRACT_ACTIVITY_BY = 'Vice Chairperson' as const

function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable — keep working in memory.
    }
  }, [key, value])
  return [value, setValue]
}

/** Replicates the ops store's sequential invoice numbering (INV-2026-XXX). */
function nextInvoiceNumber(existing: string[]): string {
  const prefix = 'INV-2026-'
  let max = 0
  for (const number of existing) {
    if (number.startsWith(prefix)) {
      const num = parseInt(number.slice(prefix.length), 10)
      if (!Number.isNaN(num) && num > max) max = num
    }
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

// ---------------------------------------------------------------------------
// Presentational sub-components
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delay,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="bg-[#161616] border-[#2A2A2A]/40 hover:border-[#D4A853]/30 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider mb-1 truncate">
                {title}
              </p>
              <p className="text-[#F4F1EA] text-2xl font-bold truncate">{value}</p>
              {subtitle && <p className="text-[#5B8DB8]/60 text-xs mt-1 truncate">{subtitle}</p>}
            </div>
            <div className="ml-3 p-2 rounded-lg bg-[#2A2A2A]/30">
              <Icon className="w-5 h-5 text-[#D4A853]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

type SortField = 'contractNumber' | 'company' | 'value' | 'startDate' | 'endDate' | 'status'
type SortDirection = 'asc' | 'desc'

function SortableHeader({
  field,
  children,
  className = '',
  sortField,
  sortDirection,
  onSort,
}: {
  field: SortField
  children: React.ReactNode
  className?: string
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}) {
  return (
    <TableHead
      className={`cursor-pointer text-[#5B8DB8] text-xs font-medium uppercase tracking-wider hover:text-[#D4A853] transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <ChevronDown className={`w-3 h-3 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </TableHead>
  )
}

// ---------------------------------------------------------------------------
// Contract Manager
// ---------------------------------------------------------------------------

export default function ContractManager() {
  const { toast } = useToast()
  const {
    contracts: storeContracts,
    invoices,
    updateContract,
    updateInvoice,
    addInvoice,
    generateInvoiceFromContract,
    setActiveTab,
  } = useOpsStore()
  const [localContracts, setLocalContracts] = useLocalStorage<Contract[]>(LOCAL_CONTRACTS_KEY, [])

  // Merge store contracts with locally-created ones, deduped by contract
  // number (store wins), then resolve rich-field defaults for rendering.
  const storeIds = useMemo(() => new Set(storeContracts.map((c) => c.id)), [storeContracts])
  const contracts = useMemo<RichContract[]>(() => {
    const seen = new Set(storeContracts.map((c) => c.contractNumber))
    const merged: Contract[] = [...storeContracts]
    for (const contract of localContracts) {
      if (seen.has(contract.contractNumber)) continue
      seen.add(contract.contractNumber)
      merged.push(contract)
    }
    return merged.map(normalizeContract)
  }, [storeContracts, localContracts])

  /** Route a patch to the shared store or the local contract list. */
  const patchContract = useCallback(
    (id: string, patch: Partial<Contract>) => {
      if (storeIds.has(id)) {
        updateContract(id, patch)
      } else {
        setLocalContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      }
    },
    [storeIds, updateContract, setLocalContracts],
  )

  // ---- UI state -----------------------------------------------------------

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [billingFilter, setBillingFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('contractNumber')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [generateTargetId, setGenerateTargetId] = useState<string | null>(null)
  const [form, setForm] = useState<ContractFormState>(emptyContractForm())
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [formTab, setFormTab] = useState('company')
  const [detailTab, setDetailTab] = useState('overview')

  const editing = editingId ? (contracts.find((c) => c.id === editingId) ?? null) : null
  const detail = detailId ? (contracts.find((c) => c.id === detailId) ?? null) : null
  const generateTarget = generateTargetId
    ? (contracts.find((c) => c.id === generateTargetId) ?? null)
    : null

  // ---- Derived data -------------------------------------------------------

  const stats = useMemo(() => {
    const running = contracts.filter((c) => ['active', 'expiring_soon'].includes(c.status))
    const totalActive = running.length
    const totalValue = running.reduce((sum, c) => sum + c.contractValue, 0)
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const expiringThisMonth = contracts.filter((c) => {
      const end = new Date(c.endDate)
      return (
        end.getMonth() === month &&
        end.getFullYear() === year &&
        ['active', 'expiring_soon'].includes(c.status)
      )
    }).length
    const renewedYTD = contracts.filter(
      (c) => c.status === 'renewed' && new Date(c.createdAt).getFullYear() === year,
    ).length
    const avgContractValue = totalActive > 0 ? Math.round(totalValue / totalActive) : 0
    const topSponsor = running.reduce<{ name: string; value: number } | null>(
      (top, c) =>
        !top || c.contractValue > top.value ? { name: c.companyName, value: c.contractValue } : top,
      null,
    )
    return {
      totalActive,
      totalValue,
      expiringThisMonth,
      renewedYTD,
      avgContractValue,
      topSponsor: topSponsor?.name || '—',
    }
  }, [contracts])

  const filteredContracts = useMemo(() => {
    let result = [...contracts]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(query) ||
          c.primaryContact.toLowerCase().includes(query) ||
          c.contractNumber.toLowerCase().includes(query) ||
          c.campaignName.toLowerCase().includes(query),
      )
    }
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter)
    if (industryFilter !== 'all') result = result.filter((c) => c.industry === industryFilter)
    if (billingFilter !== 'all') result = result.filter((c) => c.billingFrequency === billingFilter)
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'company':
          cmp = a.companyName.localeCompare(b.companyName)
          break
        case 'value':
          cmp = a.contractValue - b.contractValue
          break
        case 'startDate':
          cmp = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          break
        case 'endDate':
          cmp = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'contractNumber':
          cmp = a.contractNumber.localeCompare(b.contractNumber)
          break
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return result
  }, [contracts, searchQuery, statusFilter, industryFilter, billingFilter, sortField, sortDirection])

  // ---- Handlers -----------------------------------------------------------

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField],
  )

  const openCreate = useCallback(() => {
    setForm(emptyContractForm())
    setEditingId(null)
    setSelectedTemplate('')
    setFormTab('company')
    setIsFormOpen(true)
  }, [])

  const openEdit = useCallback((contract: RichContract) => {
    setEditingId(contract.id)
    setForm(contractToForm(contract))
    setFormTab('company')
    setIsFormOpen(true)
  }, [])

  const openDetail = useCallback((contract: RichContract) => {
    setDetailId(contract.id)
    setDetailTab('overview')
    setIsDetailOpen(true)
  }, [])

  const applyTemplate = useCallback((templateId: string) => {
    const template = CONTRACT_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    setForm((prev) => ({
      ...prev,
      campaignName: template.campaignName,
      packageType: template.packageType,
      description: template.descriptionText,
      contractValue: template.defaultValue,
      billingFrequency: template.defaultFrequency,
      numberOfPeriods: template.defaultPeriods,
      spotDuration: template.defaultDuration,
      dayparts: template.dayparts.map((d) => ({ ...d })),
      broadcastSchedule: template.broadcastText,
    }))
  }, [])

  const handleSave = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault()
      const gst = gstOf(form.contractValue)
      const totalValue = totalIncGstOf(form.contractValue)
      const amountPerInvoice =
        form.numberOfPeriods > 0
          ? Math.round((totalValue / form.numberOfPeriods) * 100) / 100
          : totalValue
      if (editingId) {
        patchContract(editingId, {
          companyName: form.companyName,
          abn: form.abn,
          industry: form.industry,
          website: form.website,
          primaryContact: form.primaryContact,
          position: form.position,
          email: form.email,
          phone: form.phone,
          secondaryContact: form.secondaryContact,
          secondaryEmail: form.secondaryEmail,
          secondaryPhone: form.secondaryPhone,
          streetAddress: form.streetAddress,
          suburb: form.suburb,
          state: form.state,
          postcode: form.postcode,
          campaignName: form.campaignName,
          packageType: form.packageType,
          description: form.description,
          contractValue: form.contractValue,
          gst,
          totalValue,
          billingFrequency: form.billingFrequency,
          numberOfPeriods: form.numberOfPeriods,
          amountPerInvoice,
          paymentTerms: form.paymentTerms,
          startDate: form.startDate,
          endDate: form.endDate,
          broadcastSchedule: form.broadcastSchedule,
          dayparts: form.dayparts.map((d) => ({ ...d })),
          spotDuration: form.spotDuration,
          status: form.status,
          signedDate: form.signedDate,
          signedBy: form.signedBy,
          ourSignatory: form.ourSignatory,
          internalNotes: form.internalNotes,
          renewalReminderDate: form.renewalReminderDate,
          updatedAt: new Date().toISOString(),
        })
      } else {
        const contractNumber = nextContractNumber(contracts)
        const contract: Contract = {
          id: `contract_${Date.now()}`,
          contractNumber,
          companyName: form.companyName,
          abn: form.abn,
          industry: form.industry,
          website: form.website,
          primaryContact: form.primaryContact,
          position: form.position,
          email: form.email,
          phone: form.phone,
          secondaryContact: form.secondaryContact,
          secondaryEmail: form.secondaryEmail,
          secondaryPhone: form.secondaryPhone,
          streetAddress: form.streetAddress,
          suburb: form.suburb,
          state: form.state,
          postcode: form.postcode,
          campaignName: form.campaignName,
          packageType: form.packageType,
          description: form.description,
          contractValue: form.contractValue,
          gst,
          totalValue,
          billingFrequency: form.billingFrequency,
          numberOfPeriods: form.numberOfPeriods,
          amountPerInvoice,
          paymentTerms: form.paymentTerms,
          startDate: form.startDate,
          endDate: form.endDate,
          broadcastSchedule: form.broadcastSchedule,
          dayparts: form.dayparts.map((d) => ({ ...d })),
          spotDuration: form.spotDuration,
          status: form.status,
          tier: packageTypeLabel(form.packageType) || 'Custom',
          signedDate: form.signedDate,
          signedBy: form.signedBy,
          ourSignatory: form.ourSignatory,
          internalNotes: form.internalNotes,
          renewalReminderDate: form.renewalReminderDate,
          attachments: [],
          invoices: [],
          activityLog: [
            {
              id: `act_${Date.now()}_1`,
              action: 'Contract created',
              performedBy: CONTRACT_ACTIVITY_BY,
              timestamp: new Date().toISOString(),
              notes: `Contract ${contractNumber} created`,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setLocalContracts((prev) => [...prev, contract])
      }
      setIsFormOpen(false)
      setEditingId(null)
      setForm(emptyContractForm())
    },
    [form, editingId, contracts, patchContract, setLocalContracts],
  )

  const handleDelete = useCallback(
    (id: string) => {
      setLocalContracts((prev) => prev.filter((c) => c.id !== id))
      setIsDetailOpen(false)
      setDetailId(null)
    },
    [setLocalContracts],
  )

  const handleCancelContract = useCallback(
    (contract: RichContract) => {
      patchContract(contract.id, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
        activityLog: [
          ...contract.activityLog,
          {
            id: `act_${Date.now()}`,
            action: 'Contract cancelled',
            performedBy: CONTRACT_ACTIVITY_BY,
            timestamp: new Date().toISOString(),
            notes: 'Contract cancelled by station',
          },
        ],
      })
      setIsDetailOpen(false)
      setDetailId(null)
    },
    [patchContract],
  )

  const handleRenew = useCallback(
    (contract: RichContract) => {
      const newStart = contract.endDate
      const length = durationDays(contract.startDate, contract.endDate)
      const newEnd = isoDate(new Date(new Date(contract.endDate).getTime() + length * 24 * 60 * 60 * 1000))
      const contractNumber = nextContractNumber(contracts)
      const renewed: Contract = {
        ...contract,
        id: `contract_${Date.now()}`,
        contractNumber,
        status: 'active',
        startDate: newStart,
        endDate: newEnd,
        parentContractId: contract.id,
        signedDate: '',
        signedBy: '',
        invoices: [],
        renewalReminderDate: '',
        activityLog: [
          {
            id: `act_${Date.now()}_renew`,
            action: `Contract renewed from ${contract.contractNumber}`,
            performedBy: CONTRACT_ACTIVITY_BY,
            timestamp: new Date().toISOString(),
            notes: `Renewed contract ${contract.contractNumber} → ${contractNumber}`,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      patchContract(contract.id, { status: 'renewed', updatedAt: new Date().toISOString() })
      setLocalContracts((prev) => [...prev, renewed])
      setIsDetailOpen(false)
      setDetailId(null)
      toast(`Contract renewed — ${contractNumber} created`, 'success')
    },
    [contracts, patchContract, setLocalContracts, toast],
  )

  const openGenerateInvoice = useCallback((contract: RichContract) => {
    setGenerateTargetId(contract.id)
    setIsGenerateOpen(true)
  }, [])

  const handleGenerateInvoice = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault()
      if (!generateTarget) return
      const target = generateTarget
      const sequence =
        target.invoices.filter((i) => i.status === 'paid' || i.status === 'sent').length + 1
      const amount =
        target.amountPerInvoice || target.contractValue / (target.numberOfPeriods || 1)
      const gst = Math.round(amount * 0.1 * 100) / 100
      const total = Math.round((amount + gst) * 100) / 100
      const number = nextInvoiceNumber(invoices.map((i) => i.number))
      const description = target.campaignName || target.description || 'Sponsorship'
      const period = `${formatDate(target.startDate)} → ${formatDate(target.endDate)}`
      const dueDate = isoDate(addDays(new Date(), 14))
      const emailSubject = `Your ONE FM 98.5 Invoice — ${target.companyName}`
      const emailBody = buildInvoiceEmailBody(target.companyName, target.primaryContact)

      if (storeIds.has(target.id)) {
        // Store-backed contract: generate via the shared store action, then
        // align the draft with the contract's billing schedule.
        const invoiceId = generateInvoiceFromContract(target.id)
        if (!invoiceId) return
        updateInvoice(invoiceId, {
          amount,
          gst,
          total,
          description,
          period,
          dueDate,
          emailSubject,
          emailBody,
        })
      } else {
        addInvoice({
          number,
          company: target.companyName,
          contactName: target.primaryContact || '',
          email: target.email || '',
          amount,
          gst,
          total,
          description,
          period,
          issueDate: isoDate(new Date()),
          dueDate,
          emailSubject,
          emailBody,
          contractId: target.id,
          notes: `Generated from contract ${target.contractNumber}`,
        })
        setActiveTab('invoices')
      }

      patchContract(target.id, {
        invoices: [
          ...target.invoices,
          {
            invoiceNumber: number,
            amount,
            status: 'draft',
            date: isoDate(new Date()),
            dueDate,
            periodLabel: `Invoice ${sequence} of ${target.numberOfPeriods}`,
          },
        ],
        updatedAt: new Date().toISOString(),
        activityLog: [
          ...target.activityLog,
          {
            id: `act_${Date.now()}`,
            action: `Generated invoice ${number}`,
            performedBy: CONTRACT_ACTIVITY_BY,
            timestamp: new Date().toISOString(),
            notes: `Invoice ${sequence} of ${target.numberOfPeriods} — saved to shared invoice store`,
          },
        ],
      })
      toast(`Invoice ${number} created — opening Invoices`, 'success')
      setIsGenerateOpen(false)
      setGenerateTargetId(null)
      setIsDetailOpen(false)
      setDetailId(null)
    },
    [
      generateTarget,
      invoices,
      storeIds,
      generateInvoiceFromContract,
      updateInvoice,
      addInvoice,
      setActiveTab,
      patchContract,
      toast,
    ],
  )

  const exportCsv = useCallback(() => {
    const headers = [
      'Contract Number',
      'Company Name',
      'ABN',
      'Industry',
      'Primary Contact',
      'Email',
      'Phone',
      'Campaign Name',
      'Package Type',
      'Contract Value (excl GST)',
      'GST',
      'Total (incl GST)',
      'Billing Frequency',
      'Start Date',
      'End Date',
      'Status',
      'Days Remaining',
      'Invoice Count',
      'Signed Date',
    ]
    const rows = filteredContracts.map((c) => [
      c.contractNumber,
      c.companyName,
      c.abn,
      c.industry,
      c.primaryContact,
      c.email,
      c.phone,
      c.campaignName,
      packageTypeLabel(c.packageType),
      c.contractValue.toFixed(2),
      c.gst.toFixed(2),
      c.totalValue.toFixed(2),
      billingFrequencyLabel(c.billingFrequency),
      c.startDate,
      c.endDate,
      STATUS_LABELS[c.status],
      String(daysUntil(c.endDate)),
      String(c.invoices.length),
      c.signedDate,
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `contracts_export_${new Date().toISOString().split('T')[0]}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    toast('Contracts exported', 'success')
  }, [filteredContracts, toast])

  const exportXero = useCallback(() => {
    const lines = buildXeroLinesFromContracts(filteredContracts)
    downloadXeroCsv(lines, `onefm-xero-contracts-${new Date().toISOString().split('T')[0]}.csv`)
    const summary = summarizeXeroExport(lines)
    toast(
      `Exported ${summary.totalInvoices} lines for Xero — $${summary.totalExclGst.toLocaleString('en-AU')} excl GST`,
      'success',
    )
  }, [filteredContracts, toast])

  const downloadContract = useCallback(
    async (contract: RichContract) => {
      try {
        const pdf = await generateContractPdf(contract)
        pdf.save(`${contract.contractNumber}.pdf`)
        toast(`Downloaded ${contract.contractNumber}.pdf`, 'success')
      } catch (err) {
        console.error(err)
        toast('Contract PDF failed — try again', 'error')
      }
    },
    [toast],
  )

  // ---- Render -------------------------------------------------------------

  const formTabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'contract', label: 'Contract', icon: FilePenLine },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'status', label: 'Status & Notes', icon: CheckCircle2 },
  ]

  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'broadcast', label: 'Broadcast', icon: Radio },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'activity', label: 'Activity Log', icon: Clock },
  ]

  const fieldClass =
    'bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm placeholder:text-[#5B8DB8]/30'

  return (
    <div className="min-h-screen bg-[#101010]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[#F4F1EA] text-3xl font-bold">Contract Manager</h1>
          <p className="text-[#5B8DB8]/60 text-sm mt-1">
            {BRAND.fullName} · {formatCoverageShort()} — create, track, renew, and invoice
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={exportCsv}
            variant="outline"
            className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30 text-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={exportXero}
            variant="outline"
            className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30 text-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            Export for Xero
          </Button>
          <Button
            onClick={openCreate}
            className="bg-[#D4A853] text-[#101010] hover:bg-[#D4A853]/90 text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Active Contracts"
          value={String(stats.totalActive)}
          subtitle="Currently running"
          icon={FileText}
          delay={0}
        />
        <StatCard
          title="Contract Value"
          value={formatCurrency(stats.totalValue)}
          subtitle="Excl. GST — Active only"
          icon={DollarSign}
          delay={0.05}
        />
        <StatCard
          title="Expiring This Month"
          value={String(stats.expiringThisMonth)}
          subtitle="Needs attention"
          icon={AlertTriangle}
          delay={0.1}
        />
        <StatCard
          title="Renewed YTD"
          value={String(stats.renewedYTD)}
          subtitle="Contract renewals"
          icon={RefreshCw}
          delay={0.15}
        />
        <StatCard
          title="Avg. Contract Value"
          value={formatCurrency(stats.avgContractValue)}
          subtitle="Per active contract"
          icon={TrendingUp}
          delay={0.2}
        />
        <StatCard
          title="Top Sponsor"
          value={stats.topSponsor}
          subtitle="Highest value"
          icon={Award}
          delay={0.25}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#161616] border border-[#2A2A2A]/40 rounded-lg p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B8DB8]/50" />
            <Input
              placeholder="Search company, contact, contract #, campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] placeholder:text-[#5B8DB8]/30 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#5B8DB8]/50" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                <SelectItem value="all" className="text-[#F4F1EA]">
                  All Statuses
                </SelectItem>
                {CONTRACT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="text-[#F4F1EA]">
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#5B8DB8]/50" />
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px] bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-xs">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                <SelectItem value="all" className="text-[#F4F1EA]">
                  All Industries
                </SelectItem>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry} className="text-[#F4F1EA]">
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#5B8DB8]/50" />
            <Select value={billingFilter} onValueChange={setBillingFilter}>
              <SelectTrigger className="w-[160px] bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-xs">
                <SelectValue placeholder="All Billing" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                <SelectItem value="all" className="text-[#F4F1EA]">
                  All Billing
                </SelectItem>
                {BILLING_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value} className="text-[#F4F1EA]">
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Contracts table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#161616] border border-[#2A2A2A]/40 rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#2A2A2A]/30 flex items-center justify-between">
          <p className="text-[#F4F1EA] text-sm font-medium">
            {filteredContracts.length}{' '}
            <span className="text-[#5B8DB8]/60 font-normal">
              contract{filteredContracts.length !== 1 ? 's' : ''} found
            </span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2A2A2A]/30 hover:bg-transparent">
                <SortableHeader
                  field="contractNumber"
                  className="w-[120px]"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Contract #
                </SortableHeader>
                <SortableHeader
                  field="company"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Company
                </SortableHeader>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider">
                  Contact
                </TableHead>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider">
                  Industry
                </TableHead>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[140px]">
                  Campaign
                </TableHead>
                <SortableHeader
                  field="value"
                  className="w-[110px]"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Value (excl)
                </SortableHeader>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[80px]">
                  GST
                </TableHead>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[110px]">
                  Total (incl)
                </TableHead>
                <SortableHeader
                  field="startDate"
                  className="w-[140px]"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Period
                </SortableHeader>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[80px]">
                  Billing
                </TableHead>
                <SortableHeader
                  field="status"
                  className="w-[110px]"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Status
                </SortableHeader>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[90px]">
                  Days Left
                </TableHead>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[60px]">
                  Inv.
                </TableHead>
                <TableHead className="text-[#5B8DB8] text-xs font-medium uppercase tracking-wider w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredContracts.map((contract, index) => {
                  const daysLeft = daysUntil(contract.endDate)
                  return (
                    <motion.tr
                      key={contract.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-[#2A2A2A]/20 hover:bg-[#2A2A2A]/15 transition-colors cursor-pointer"
                      onClick={() => openDetail(contract)}
                    >
                      <TableCell className="text-[#F4F1EA] text-xs font-mono font-medium">
                        {contract.contractNumber}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#2A2A2A]/40 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-[#5B8DB8]" />
                          </div>
                          <span className="text-[#F4F1EA] text-xs font-medium truncate">
                            {contract.companyName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#5B8DB8] text-xs">
                        {contract.primaryContact}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-[#2A2A2A]/20 text-[#5B8DB8] border-[#2A2A2A]/40"
                        >
                          {contract.industry}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#5B8DB8] text-xs max-w-[140px]">
                        <span className="truncate block">{contract.campaignName}</span>
                      </TableCell>
                      <TableCell className="text-[#F4F1EA] text-xs font-medium">
                        {formatCurrency(contract.contractValue)}
                      </TableCell>
                      <TableCell className="text-[#5B8DB8] text-xs">
                        {formatCurrency(contract.gst)}
                      </TableCell>
                      <TableCell className="text-[#F4F1EA] text-xs font-semibold">
                        {formatCurrency(contract.totalValue)}
                      </TableCell>
                      <TableCell className="text-[#5B8DB8] text-xs whitespace-nowrap">
                        {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                      </TableCell>
                      <TableCell className="text-[#5B8DB8] text-xs">
                        {billingFrequencyLabel(contract.billingFrequency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] inline-flex items-center ${STATUS_BADGE_CLASSES[contract.status]}`}
                        >
                          <span className="truncate">{STATUS_LABELS[contract.status]}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {contract.status === 'cancelled' ? (
                          <span className="text-gray-500">—</span>
                        ) : daysLeft < 0 ? (
                          <span className="text-[#E31E24]">Expired</span>
                        ) : daysLeft <= 30 ? (
                          <span className="text-orange-400 font-medium">{daysLeft}d</span>
                        ) : (
                          <span className="text-emerald-400">{daysLeft}d</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#F4F1EA] text-xs text-center">
                        {contract.invoices.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-[#5B8DB8] hover:text-[#D4A853] hover:bg-[#D4A853]/10"
                            onClick={() => openDetail(contract)}
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-[#5B8DB8] hover:text-[#D4A853] hover:bg-[#D4A853]/10"
                            onClick={() => void downloadContract(contract)}
                            title="Download agreement PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-[#5B8DB8] hover:text-[#D4A853] hover:bg-[#D4A853]/10"
                            onClick={() => openEdit(contract)}
                            title="Edit"
                          >
                            <SquarePen className="w-3.5 h-3.5" />
                          </Button>
                          {contract.status !== 'cancelled' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-7 h-7 text-[#5B8DB8] hover:text-emerald-400 hover:bg-emerald-400/10"
                              onClick={() => openGenerateInvoice(contract)}
                              title="Generate Invoice"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        {filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-[#2A2A2A]/40 mx-auto mb-3" />
            <p className="text-[#5B8DB8]/40 text-sm">No contracts found</p>
            <p className="text-[#5B8DB8]/30 text-xs mt-1">
              Try adjusting your filters or create a new contract
            </p>
          </div>
        )}
      </motion.div>

      {/* Create / edit dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingId(null)
            setForm(emptyContractForm())
            setSelectedTemplate('')
          }
        }}
      >
        <DialogContent className="max-w-[95vw] max-h-[85vh] bg-[#161616] border-[#2A2A2A]/40 p-0 w-[95vw] flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#2A2A2A]/30 shrink-0">
            <DialogTitle className="text-[#F4F1EA] text-xl font-bold flex items-center gap-3 break-words">
              <FilePenLine className="w-5 h-5 text-[#D4A853] shrink-0" />
              <span className="truncate">
                {editing ? `Edit Contract — ${editing.contractNumber}` : 'Create New Contract'}
              </span>
            </DialogTitle>
            {!editing && (
              <p className="text-[#5B8DB8]/60 text-xs mt-1">
                Start from a template or fill in the details manually
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {!editing && (
                <div className="px-6 py-4 border-b border-[#2A2A2A]/30 bg-[#101010]/50">
                  <Label className="text-[#F4F1EA] text-xs font-medium uppercase tracking-wider mb-3 block">
                    Start from Template (Optional)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
                    <Button
                      type="button"
                      variant={selectedTemplate === '' ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedTemplate('')
                        setForm(emptyContractForm())
                      }}
                      className={`text-xs h-auto py-3 flex flex-col items-center gap-1 min-w-0 overflow-hidden ${
                        selectedTemplate === ''
                          ? 'bg-[#D4A853] text-[#101010] hover:bg-[#D4A853]/90'
                          : 'bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30'
                      }`}
                    >
                      <span className="font-semibold truncate max-w-full">Blank</span>
                      <span className="text-[10px] opacity-70 truncate max-w-full">Start fresh</span>
                    </Button>
                    {CONTRACT_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        type="button"
                        variant={selectedTemplate === template.id ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          applyTemplate(template.id)
                        }}
                        className={`text-xs h-auto py-3 flex flex-col items-center gap-1 min-w-0 overflow-hidden ${
                          selectedTemplate === template.id
                            ? 'bg-[#D4A853] text-[#101010] hover:bg-[#D4A853]/90'
                            : 'bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30'
                        }`}
                      >
                        <span className="font-semibold truncate max-w-full">{template.name}</span>
                        <span className="text-[10px] opacity-70 truncate max-w-full">
                          {template.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Tabs value={formTab} onValueChange={setFormTab} className="w-full">
                <div className="px-6 border-b border-[#2A2A2A]/30">
                  <TabsList className="bg-transparent h-10 w-full justify-start gap-1">
                    {formTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="text-xs px-3 py-2 rounded-t-lg data-[state=active]:bg-[#2A2A2A]/40 data-[state=active]:text-[#D4A853] data-[state=active]:border-b-2 data-[state=active]:border-[#D4A853] text-[#5B8DB8] hover:text-[#F4F1EA] transition-all min-w-0 inline-flex items-center gap-1.5"
                      >
                        <tab.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Company tab */}
                <div className={`px-6 py-6 ${formTab === 'company' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Company Name <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        value={form.companyName}
                        onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                        placeholder="e.g. Peppermill Inn"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">ABN</Label>
                      <Input
                        value={form.abn}
                        onChange={(e) => setForm((f) => ({ ...f, abn: e.target.value }))}
                        placeholder="XX XXX XXX XXX"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Industry <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Select
                        value={form.industry}
                        onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry} className="text-[#F4F1EA]">
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Website</Label>
                      <Input
                        value={form.website}
                        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                        placeholder="www.example.com.au"
                        className={fieldClass}
                      />
                    </div>
                    <Separator className="col-span-full bg-[#2A2A2A]/30 my-2" />
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Street Address</Label>
                      <Input
                        value={form.streetAddress}
                        onChange={(e) => setForm((f) => ({ ...f, streetAddress: e.target.value }))}
                        placeholder="123 Main Street"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Suburb</Label>
                      <Input
                        value={form.suburb}
                        onChange={(e) => setForm((f) => ({ ...f, suburb: e.target.value }))}
                        placeholder="Shepparton"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">State</Label>
                      <Select
                        value={form.state}
                        onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                          {CONTRACT_STATES.map((state) => (
                            <SelectItem key={state} value={state} className="text-[#F4F1EA]">
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Postcode</Label>
                      <Input
                        value={form.postcode}
                        onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                        placeholder="3630"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact tab */}
                <div className={`px-6 py-6 ${formTab === 'contact' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
                    <div className="col-span-full">
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Primary Contact
                      </h4>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Contact Name <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        value={form.primaryContact}
                        onChange={(e) => setForm((f) => ({ ...f, primaryContact: e.target.value }))}
                        placeholder="Full name"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Position / Title</Label>
                      <Input
                        value={form.position}
                        onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                        placeholder="e.g. Marketing Manager"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Email <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="contact@company.com.au"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Phone <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="(03) 0000 0000"
                        className={fieldClass}
                      />
                    </div>
                    <Separator className="col-span-full bg-[#2A2A2A]/30 my-2" />
                    <div className="col-span-full">
                      <h4 className="text-[#5B8DB8] text-xs font-semibold uppercase tracking-wider mb-3">
                        Secondary Contact (Optional)
                      </h4>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Contact Name</Label>
                      <Input
                        value={form.secondaryContact}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, secondaryContact: e.target.value }))
                        }
                        placeholder="Full name"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Email</Label>
                      <Input
                        type="email"
                        value={form.secondaryEmail}
                        onChange={(e) => setForm((f) => ({ ...f, secondaryEmail: e.target.value }))}
                        placeholder="contact@company.com.au"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Phone</Label>
                      <Input
                        value={form.secondaryPhone}
                        onChange={(e) => setForm((f) => ({ ...f, secondaryPhone: e.target.value }))}
                        placeholder="(03) 0000 0000"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Contract tab */}
                <div className={`px-6 py-6 ${formTab === 'contract' ? 'block' : 'hidden'}`}>
                  <div className="space-y-5">
                    {!editing && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-[#F4F1EA] text-xs">
                          Contract Number (auto-generated)
                        </Label>
                        <Input
                          value={nextContractNumber(contracts)}
                          disabled
                          className="bg-[#101010] border-[#2A2A2A]/40 text-[#5B8DB8] text-sm font-mono"
                        />
                      </div>
                    )}
                    {editing && (
                      <div className="space-y-2 min-w-0">
                        <Label className="text-[#F4F1EA] text-xs">Contract Number</Label>
                        <Input
                          value={editing.contractNumber}
                          disabled
                          className="bg-[#101010] border-[#2A2A2A]/40 text-[#5B8DB8] text-sm font-mono"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
                      <div className="space-y-2 min-w-0">
                        <Label className="text-[#F4F1EA] text-xs">
                          Campaign / Package Name <span className="text-[#E31E24]">*</span>
                        </Label>
                        <Input
                          value={form.campaignName}
                          onChange={(e) => setForm((f) => ({ ...f, campaignName: e.target.value }))}
                          placeholder="e.g. GVL 2026 MAJOR"
                          className={fieldClass}
                        />
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label className="text-[#F4F1EA] text-xs">Package Type</Label>
                        <Select
                          value={form.packageType}
                          onValueChange={(v) => setForm((f) => ({ ...f, packageType: v }))}
                        >
                          <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                            {PACKAGE_TYPES.map((pkg) => (
                              <SelectItem key={pkg.value} value={pkg.value} className="text-[#F4F1EA]">
                                {pkg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Description / What's Included</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Full description of the sponsorship package, deliverables, benefits..."
                        rows={5}
                        className={`${fieldClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial tab */}
                <div className={`px-6 py-6 ${formTab === 'financial' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Contract Value (excl GST) <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={form.contractValue || ''}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, contractValue: parseFloat(e.target.value) || 0 }))
                        }
                        placeholder="0.00"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">GST (auto 10%)</Label>
                      <Input
                        value={formatCurrency(gstOf(form.contractValue))}
                        disabled
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#5B8DB8] text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Total (incl GST)</Label>
                      <Input
                        value={formatCurrency(totalIncGstOf(form.contractValue))}
                        disabled
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#D4A853] text-sm font-semibold font-mono"
                      />
                    </div>
                    <Separator className="col-span-full bg-[#2A2A2A]/30 my-1" />
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Billing Frequency <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Select
                        value={form.billingFrequency}
                        onValueChange={(v) => setForm((f) => ({ ...f, billingFrequency: v }))}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                          {BILLING_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value} className="text-[#F4F1EA]">
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Number of Billing Periods</Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.numberOfPeriods || ''}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, numberOfPeriods: parseInt(e.target.value) || 1 }))
                        }
                        placeholder="e.g. 6 for monthly over 6 months"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Amount per Invoice</Label>
                      <Input
                        value={formatCurrency(
                          form.numberOfPeriods > 0
                            ? totalIncGstOf(form.contractValue) / form.numberOfPeriods
                            : totalIncGstOf(form.contractValue),
                        )}
                        disabled
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#5B8DB8] text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Payment Terms</Label>
                      <Select
                        value={form.paymentTerms}
                        onValueChange={(v) => setForm((f) => ({ ...f, paymentTerms: v }))}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                          {PAYMENT_TERMS.map((terms) => (
                            <SelectItem
                              key={terms.value}
                              value={terms.value}
                              className="text-[#F4F1EA]"
                            >
                              {terms.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Schedule tab */}
                <div className={`px-6 py-6 ${formTab === 'schedule' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Contract Start Date <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Contract End Date <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Spot Duration</Label>
                      <Select
                        value={form.spotDuration}
                        onValueChange={(v) => setForm((f) => ({ ...f, spotDuration: v }))}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                          {SPOT_DURATIONS.map((duration) => (
                            <SelectItem key={duration} value={duration} className="text-[#F4F1EA]">
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-[#F4F1EA] text-xs">Broadcast Schedule Description</Label>
                      <Textarea
                        value={form.broadcastSchedule}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, broadcastSchedule: e.target.value }))
                        }
                        placeholder="e.g. 4 x 30 sec spots across all dayparts (EM, B, M, L, D, LN)"
                        rows={3}
                        className={`${fieldClass} resize-none`}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <Label className="text-[#F4F1EA] text-xs font-medium mb-3 block">
                      Daypart Selection & Spot Count
                    </Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {DAYPARTS.map((daypart) => {
                        const entry = form.dayparts.find((d) => d.daypart === daypart)
                        const checked = !!entry
                        return (
                          <div
                            key={daypart}
                            className="bg-[#101010] border border-[#2A2A2A]/40 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  setForm(
                                    value
                                      ? (f) => ({
                                          ...f,
                                          dayparts: [...f.dayparts, { daypart, count: 1 }],
                                        })
                                      : (f) => ({
                                          ...f,
                                          dayparts: f.dayparts.filter((d) => d.daypart !== daypart),
                                        }),
                                  )
                                }}
                                className="border-[#2A2A2A] data-[state=checked]:bg-[#D4A853] data-[state=checked]:border-[#D4A853]"
                              />
                              <Label className="text-[#F4F1EA] text-xs font-medium cursor-pointer">
                                {daypart}
                              </Label>
                            </div>
                            {checked && (
                              <Input
                                type="number"
                                min={1}
                                value={entry?.count || 1}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    dayparts: f.dayparts.map((d) =>
                                      d.daypart === daypart
                                        ? { ...d, count: parseInt(e.target.value) || 1 }
                                        : d,
                                    ),
                                  }))
                                }
                                className="h-7 text-xs bg-[#161616] border-[#2A2A2A]/40 text-[#F4F1EA]"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-[#5B8DB8]/50 text-[10px] mt-2">
                      EM = Early Morning | B = Breakfast | M = Midday | L = Late Afternoon | D =
                      Drive | LN = Late Night
                    </p>
                  </div>
                </div>

                {/* Status & notes tab */}
                <div className={`px-6 py-6 ${formTab === 'status' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">
                        Status <span className="text-[#E31E24]">*</span>
                      </Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, status: v as ContractStatus }))
                        }
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161616] border-[#2A2A2A]/40">
                          {CONTRACT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="text-[#F4F1EA]">
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Signed Date</Label>
                      <Input
                        type="date"
                        value={form.signedDate}
                        onChange={(e) => setForm((f) => ({ ...f, signedDate: e.target.value }))}
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Signed By (their side)</Label>
                      <Input
                        value={form.signedBy}
                        onChange={(e) => setForm((f) => ({ ...f, signedBy: e.target.value }))}
                        placeholder="Name and title of signatory"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Our Signatory</Label>
                      <Input
                        value={form.ourSignatory}
                        onChange={(e) => setForm((f) => ({ ...f, ourSignatory: e.target.value }))}
                        placeholder="ONE FM signatory"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label className="text-[#F4F1EA] text-xs">Renewal Reminder Date</Label>
                      <Input
                        type="date"
                        value={form.renewalReminderDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, renewalReminderDate: e.target.value }))
                        }
                        className="bg-[#101010] border-[#2A2A2A]/40 text-[#F4F1EA] text-sm"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-[#F4F1EA] text-xs">Internal Notes</Label>
                      <Textarea
                        value={form.internalNotes}
                        onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value }))}
                        placeholder="Private notes about this contract — renewal reminders, contact preferences, special conditions..."
                        rows={4}
                        className={`${fieldClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-[#2A2A2A]/30 gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingId(null)
                  setForm(emptyContractForm())
                }}
                className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#F4F1EA] hover:border-[#D4A853]/30 text-xs"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#D4A853] text-[#101010] hover:bg-[#D4A853]/90 text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {editing ? 'Save Changes' : 'Create Contract'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setDetailId(null)
        }}
      >
        <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-y-auto overflow-x-hidden bg-[#161616] border-[#2A2A2A]/40 p-0 w-[95vw]">
          {detail && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-[#2A2A2A]/30">
                <div className="flex items-start justify-between gap-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2 min-w-0">
                      <h2 className="text-[#F4F1EA] text-xl font-bold truncate">
                        {detail.companyName}
                      </h2>
                      <Badge
                        variant="outline"
                        className={`${STATUS_BADGE_CLASSES[detail.status]} inline-flex items-center shrink-0`}
                      >
                        <span className="truncate">{STATUS_LABELS[detail.status]}</span>
                      </Badge>
                    </div>
                    <p className="text-[#5B8DB8] text-sm font-mono truncate">
                      {detail.contractNumber}
                    </p>
                    <p className="text-[#D4A853] text-sm mt-1 font-medium truncate">
                      {detail.campaignName}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end shrink-0">
                    {detail.status !== 'cancelled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30 text-xs"
                          onClick={() => void downloadContract(detail)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Agreement PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30 text-xs"
                          onClick={() => {
                            setIsDetailOpen(false)
                            openEdit(detail)
                          }}
                        >
                          <SquarePen className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-[#2A2A2A]/40 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400/30 text-xs"
                          onClick={() => openGenerateInvoice(detail)}
                        >
                          <Receipt className="w-3.5 h-3.5 mr-1.5" />
                          Generate Invoice
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#D4A853] hover:border-[#D4A853]/30 text-xs"
                          onClick={() => handleRenew(detail)}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Renew
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-[#2A2A2A]/40 text-[#E31E24] hover:text-[#E31E24] hover:border-[#E31E24]/30 text-xs"
                          onClick={() => handleCancelContract(detail)}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {!storeIds.has(detail.id) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-[#2A2A2A]/40 text-[#E31E24] hover:text-[#E31E24] hover:border-[#E31E24]/30 text-xs"
                        onClick={() => handleDelete(detail.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
                <div className="px-6 border-b border-[#2A2A2A]/30">
                  <TabsList className="bg-transparent h-10 w-full justify-start gap-1">
                    {detailTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="text-xs px-3 py-2 rounded-t-lg data-[state=active]:bg-[#2A2A2A]/40 data-[state=active]:text-[#D4A853] data-[state=active]:border-b-2 data-[state=active]:border-[#D4A853] text-[#5B8DB8] hover:text-[#F4F1EA] transition-all min-w-0 inline-flex items-center gap-1.5"
                      >
                        <tab.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                        {tab.id === 'invoices' && detail.invoices.length > 0 && (
                          <span className="ml-0.5 text-[10px] bg-[#2A2A2A]/40 px-1.5 rounded-full shrink-0">
                            {detail.invoices.length}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Overview */}
                <div className={`px-6 py-5 ${detailTab === 'overview' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Company Information
                      </h4>
                      <div className="space-y-2 min-w-0">
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Company</span>
                          <span className="text-[#F4F1EA] text-xs font-medium">
                            {detail.companyName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">ABN</span>
                          <span className="text-[#F4F1EA] text-xs font-mono">
                            {detail.abn || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Industry</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-[#2A2A2A]/20 text-[#5B8DB8] border-[#2A2A2A]/40"
                          >
                            {detail.industry}
                          </Badge>
                        </div>
                        {detail.website && (
                          <div className="flex justify-between">
                            <span className="text-[#5B8DB8] text-xs">Website</span>
                            <span className="text-[#D4A853] text-xs">{detail.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Contact Details
                      </h4>
                      <div className="space-y-2 min-w-0">
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Primary Contact</span>
                          <span className="text-[#F4F1EA] text-xs">
                            {detail.primaryContact}
                            {detail.position && ` — ${detail.position}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Email</span>
                          <span className="text-[#F4F1EA] text-xs">{detail.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Phone</span>
                          <span className="text-[#F4F1EA] text-xs">{detail.phone}</span>
                        </div>
                        {detail.secondaryContact && (
                          <div className="flex justify-between">
                            <span className="text-[#5B8DB8] text-xs">Secondary</span>
                            <span className="text-[#F4F1EA] text-xs">{detail.secondaryContact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Address
                      </h4>
                      <div className="space-y-1">
                        <p className="text-[#F4F1EA] text-xs">{detail.streetAddress}</p>
                        <p className="text-[#5B8DB8] text-xs">
                          {detail.suburb} {detail.state} {detail.postcode}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Contract Details
                      </h4>
                      <div className="space-y-2 min-w-0">
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Package Type</span>
                          <span className="text-[#F4F1EA] text-xs">
                            {packageTypeLabel(detail.packageType)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Payment Terms</span>
                          <span className="text-[#F4F1EA] text-xs">
                            {paymentTermsLabel(detail.paymentTerms)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Signed By</span>
                          <span className="text-[#F4F1EA] text-xs">{detail.signedBy || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Our Signatory</span>
                          <span className="text-[#F4F1EA] text-xs">{detail.ourSignatory}</span>
                        </div>
                      </div>
                    </div>
                    {detail.description && (
                      <div className="md:col-span-2">
                        <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-2">
                          Description
                        </h4>
                        <p className="text-[#5B8DB8] text-xs leading-relaxed">
                          {detail.description}
                        </p>
                      </div>
                    )}
                    {detail.internalNotes && (
                      <div className="md:col-span-2">
                        <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-2">
                          Internal Notes
                        </h4>
                        <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-3">
                          <p className="text-[#5B8DB8] text-xs leading-relaxed">
                            {detail.internalNotes}
                          </p>
                        </div>
                      </div>
                    )}
                    {detail.attachments.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-2">
                          Attachments
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {detail.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-2 bg-[#101010] border border-[#2A2A2A]/30 rounded-lg px-3 py-2"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-[#5B8DB8]" />
                              <span className="text-[#F4F1EA] text-xs">{attachment.fileName}</span>
                              <span className="text-[#5B8DB8]/50 text-[10px]">
                                {attachment.fileSize}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial */}
                <div className={`px-6 py-5 ${detailTab === 'financial' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-[#101010] border-[#2A2A2A]/30">
                      <CardContent className="p-4">
                        <p className="text-[#5B8DB8] text-[10px] uppercase tracking-wider mb-1">
                          Contract Value (excl GST)
                        </p>
                        <p className="text-[#F4F1EA] text-xl font-bold">
                          {formatCurrency(detail.contractValue)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#101010] border-[#2A2A2A]/30">
                      <CardContent className="p-4">
                        <p className="text-[#5B8DB8] text-[10px] uppercase tracking-wider mb-1">
                          GST (10%)
                        </p>
                        <p className="text-[#5B8DB8] text-xl font-bold">
                          {formatCurrency(detail.gst)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#101010] border-[#D4A853]/30">
                      <CardContent className="p-4">
                        <p className="text-[#D4A853] text-[10px] uppercase tracking-wider mb-1">
                          Total (incl GST)
                        </p>
                        <p className="text-[#D4A853] text-xl font-bold">
                          {formatCurrency(detail.totalValue)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-3">
                      <p className="text-[#5B8DB8] text-[10px] uppercase mb-1">Billing</p>
                      <p className="text-[#F4F1EA] text-sm font-medium">
                        {billingFrequencyLabel(detail.billingFrequency)}
                      </p>
                    </div>
                    <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-3">
                      <p className="text-[#5B8DB8] text-[10px] uppercase mb-1">Periods</p>
                      <p className="text-[#F4F1EA] text-sm font-medium">{detail.numberOfPeriods}</p>
                    </div>
                    <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-3">
                      <p className="text-[#5B8DB8] text-[10px] uppercase mb-1">Per Invoice</p>
                      <p className="text-[#F4F1EA] text-sm font-medium">
                        {formatCurrency(detail.amountPerInvoice)}
                      </p>
                    </div>
                    <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-3">
                      <p className="text-[#5B8DB8] text-[10px] uppercase mb-1">Invoices</p>
                      <p className="text-[#F4F1EA] text-sm font-medium">
                        {detail.invoices.length} of {detail.numberOfPeriods}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                      Payment Summary
                    </h4>
                    {(() => {
                      const totalInvoiced = detail.invoices.reduce((sum, i) => sum + i.amount, 0)
                      const totalPaid = detail.invoices
                        .filter((i) => i.status === 'paid')
                        .reduce((sum, i) => sum + i.amount, 0)
                      const outstanding = totalInvoiced - totalPaid
                      return (
                        <div className="space-y-2 min-w-0">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#5B8DB8]">Total Invoiced</span>
                            <span className="text-[#F4F1EA] font-medium">
                              {formatCurrency(totalInvoiced)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#5B8DB8]">Total Paid</span>
                            <span className="text-emerald-400 font-medium">
                              {formatCurrency(totalPaid)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#5B8DB8]">Outstanding</span>
                            <span
                              className={`font-medium ${outstanding > 0 ? 'text-orange-400' : 'text-emerald-400'}`}
                            >
                              {formatCurrency(outstanding)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs pt-2 border-t border-[#2A2A2A]/30">
                            <span className="text-[#5B8DB8]">Remaining to Invoice</span>
                            <span className="text-[#F4F1EA] font-medium">
                              {formatCurrency(detail.totalValue - totalInvoiced)}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Broadcast */}
                <div className={`px-6 py-5 ${detailTab === 'broadcast' ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Contract Period
                      </h4>
                      <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Start Date</span>
                          <span className="text-[#F4F1EA] text-xs font-medium">
                            {formatDate(detail.startDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">End Date</span>
                          <span className="text-[#F4F1EA] text-xs font-medium">
                            {formatDate(detail.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Duration</span>
                          <span className="text-[#F4F1EA] text-xs">
                            {durationDays(detail.startDate, detail.endDate)} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Days Remaining</span>
                          <span
                            className={`text-xs font-medium ${
                              daysUntil(detail.endDate) <= 30
                                ? 'text-orange-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {daysUntil(detail.endDate)} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B8DB8] text-xs">Spot Duration</span>
                          <span className="text-[#F4F1EA] text-xs">{detail.spotDuration}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                        Schedule Summary
                      </h4>
                      {detail.broadcastSchedule && (
                        <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-4 mb-4">
                          <p className="text-[#5B8DB8] text-xs leading-relaxed">
                            {detail.broadcastSchedule}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-3">
                      Daypart Breakdown
                    </h4>
                    {detail.dayparts.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {DAYPARTS.map((daypart) => {
                          const entry = detail.dayparts.find((d) => d.daypart === daypart)
                          return (
                            <div
                              key={daypart}
                              className={`rounded-lg p-3 text-center border ${
                                entry
                                  ? 'bg-[#2A2A2A]/30 border-[#D4A853]/30'
                                  : 'bg-[#101010] border-[#2A2A2A]/20 opacity-40'
                              }`}
                            >
                              <p
                                className={`text-lg font-bold ${entry ? 'text-[#D4A853]' : 'text-[#5B8DB8]/30'}`}
                              >
                                {daypart}
                              </p>
                              <p className="text-[#5B8DB8] text-[10px] mt-1">
                                {entry ? `${entry.count} spots` : '—'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-[#5B8DB8]/50 text-sm">No daypart breakdown recorded</p>
                    )}
                  </div>
                  {detail.dayparts.length > 0 && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className="bg-[#101010] border border-[#D4A853]/30 rounded-lg px-4 py-2">
                        <span className="text-[#5B8DB8] text-[10px] uppercase">
                          Total Weekly Spots
                        </span>
                        <span className="text-[#D4A853] text-sm font-bold ml-3">
                          {detail.dayparts.reduce((sum, d) => sum + d.count, 0)}
                        </span>
                      </div>
                      <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg px-4 py-2">
                        <span className="text-[#5B8DB8] text-[10px] uppercase">Duration</span>
                        <span className="text-[#F4F1EA] text-sm font-medium ml-3">
                          {detail.spotDuration}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoices */}
                <div className={`px-6 py-5 ${detailTab === 'invoices' ? 'block' : 'hidden'}`}>
                  {detail.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {detail.invoices.map((invoice) => (
                        <motion.div
                          key={invoice.invoiceNumber}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#2A2A2A]/40 flex items-center justify-center">
                                <Receipt className="w-4 h-4 text-[#D4A853]" />
                              </div>
                              <div>
                                <p className="text-[#F4F1EA] text-sm font-medium font-mono">
                                  {invoice.invoiceNumber}
                                </p>
                                <p className="text-[#5B8DB8] text-[10px]">{invoice.periodLabel}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#F4F1EA] text-sm font-semibold">
                                {formatCurrency(invoice.amount)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${INVOICE_STATUS_BADGE_CLASSES[invoice.status ?? 'draft']}`}
                                >
                                  {(invoice.status ?? 'draft').charAt(0).toUpperCase() +
                                    (invoice.status ?? 'draft').slice(1)}
                                </Badge>
                                <span className="text-[#5B8DB8]/50 text-[10px]">
                                  Due {formatDate(invoice.dueDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Receipt className="w-12 h-12 text-[#2A2A2A]/40 mx-auto mb-3" />
                      <p className="text-[#5B8DB8]/40 text-sm">No invoices generated yet</p>
                      {detail.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          className="mt-3 bg-[#D4A853] text-[#101010] hover:bg-[#D4A853]/90 text-xs"
                          onClick={() => openGenerateInvoice(detail)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Generate First Invoice
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Activity log */}
                <div className={`px-6 py-5 ${detailTab === 'activity' ? 'block' : 'hidden'}`}>
                  <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-[#2A2A2A]/30" />
                    <div className="space-y-4">
                      {detail.activityLog.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative pl-10"
                        >
                          <div
                            className={`absolute left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${
                              index === 0
                                ? 'bg-[#D4A853] border-[#D4A853]'
                                : 'bg-[#161616] border-[#5B8DB8]'
                            }`}
                          />
                          <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[#F4F1EA] text-xs font-medium">{entry.action}</p>
                              <p className="text-[#5B8DB8]/50 text-[10px]">
                                {new Date(entry.timestamp).toLocaleDateString('en-AU', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-3 h-3 text-[#5B8DB8]/50" />
                              <span className="text-[#5B8DB8] text-[10px]">{entry.performedBy}</span>
                            </div>
                            {entry.notes && (
                              <p className="text-[#5B8DB8]/60 text-[10px] mt-1 italic">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate invoice dialog */}
      <Dialog
        open={isGenerateOpen}
        onOpenChange={(open) => {
          setIsGenerateOpen(open)
          if (!open) setGenerateTargetId(null)
        }}
      >
        <DialogContent className="max-w-md bg-[#161616] border-[#2A2A2A]/40 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#F4F1EA] text-lg font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#D4A853]" />
              Generate Invoice
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateInvoice}>
            {generateTarget && (
              <div className="py-4 space-y-4">
                <div className="bg-[#101010] border border-[#2A2A2A]/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8] text-xs">Contract</span>
                    <span className="text-[#F4F1EA] text-xs font-mono">
                      {generateTarget.contractNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8] text-xs">Company</span>
                    <span className="text-[#F4F1EA] text-xs font-medium">
                      {generateTarget.companyName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8] text-xs">Campaign</span>
                    <span className="text-[#D4A853] text-xs">{generateTarget.campaignName}</span>
                  </div>
                  <Separator className="bg-[#2A2A2A]/30" />
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8] text-xs">Invoice Amount</span>
                    <span className="text-[#D4A853] text-sm font-bold">
                      {formatCurrency(generateTarget.amountPerInvoice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8] text-xs">Billing Period</span>
                    <span className="text-[#F4F1EA] text-xs">
                      Invoice{' '}
                      {generateTarget.invoices.filter(
                        (i) => i.status === 'paid' || i.status === 'sent',
                      ).length + 1}{' '}
                      of {generateTarget.numberOfPeriods}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B8DB8] text-xs">Payment Terms</span>
                    <span className="text-[#F4F1EA] text-xs">
                      {paymentTermsLabel(generateTarget.paymentTerms)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsGenerateOpen(false)
                  setGenerateTargetId(null)
                }}
                className="bg-transparent border-[#2A2A2A]/40 text-[#5B8DB8] hover:text-[#F4F1EA] hover:border-[#D4A853]/30 text-xs"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#D4A853] text-[#101010] hover:bg-[#D4A853]/90 text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Confirm & Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
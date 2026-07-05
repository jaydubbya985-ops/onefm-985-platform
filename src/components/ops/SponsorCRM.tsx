import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileClock,
  FileText,
  Filter,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Star,
  StickyNote,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
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
import { useOpsStore } from './store'
import {
  AU_STATES,
  CRM_INDUSTRIES,
  CRM_SPONSORS,
  PIPELINE_STAGES,
  SPONSOR_STATUS_OPTIONS,
  type Contract,
  type CrmSponsor,
  type SponsorNote,
  type SponsorNoteType,
  type SponsorPipelineStatus,
  type SponsorProposalStatus,
  type SponsorTier,
} from './data/sponsors'

// ---------------------------------------------------------------------------
// Module helpers (extracted from the deployed bundle)
// ---------------------------------------------------------------------------

const SPONSORS_STORAGE_KEY = 'onefm_sponsors'

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso?: string): string {
  return iso
    ? new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
}

function daysSince(iso?: string): number {
  if (!iso) return 0
  const date = new Date(iso)
  return Math.max(0, Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24)))
}

function daysUntil(iso?: string): number {
  if (!iso) return 0
  const date = new Date(iso)
  const now = new Date()
  return Math.max(0, Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function tierBadgeClasses(tier: SponsorTier): string {
  switch (tier) {
    case 'champion':
      return 'bg-[#E31E24]/20 text-[#E31E24] border-[#E31E24]/40'
    case 'gold':
      return 'bg-[#D4A84B]/20 text-[#D4A84B] border-[#D4A84B]/40'
    case 'silver':
      return 'bg-slate-400/20 text-slate-300 border-slate-400/40'
    case 'bronze':
      return 'bg-amber-700/20 text-amber-600 border-amber-700/40'
    default:
      return 'bg-[#2A2A2A]/30 text-slate-400 border-[#2A2A2A]/40'
  }
}

function statusBadgeClasses(status: SponsorPipelineStatus): string {
  switch (status) {
    case 'lead':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    case 'contacted':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'proposal_sent':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'negotiating':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'contracted':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    case 'active':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'lapsed':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
  }
}

function ProposalStatusIcon({ status }: { status: SponsorProposalStatus }) {
  switch (status) {
    case 'draft':
      return <FileClock className="h-3.5 w-3.5 text-slate-400" />
    case 'sent':
      return <Send className="h-3.5 w-3.5 text-blue-400" />
    case 'viewed':
      return <Eye className="h-3.5 w-3.5 text-amber-400" />
    case 'accepted':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    case 'declined':
      return <Ban className="h-3.5 w-3.5 text-red-400" />
    case 'expired':
      return <Clock className="h-3.5 w-3.5 text-slate-500" />
  }
}

function NoteTypeIcon({ type }: { type: SponsorNoteType }) {
  switch (type) {
    case 'call':
      return <Phone className="h-3.5 w-3.5 text-blue-400" />
    case 'email':
      return <Mail className="h-3.5 w-3.5 text-amber-400" />
    case 'meeting':
      return <Users className="h-3.5 w-3.5 text-purple-400" />
    case 'note':
      return <StickyNote className="h-3.5 w-3.5 text-slate-400" />
  }
}

function TierIcon({ tier }: { tier: SponsorTier }) {
  switch (tier) {
    case 'champion':
      return <Award className="h-4 w-4 text-[#E31E24]" />
    case 'gold':
      return <Star className="h-4 w-4 text-[#D4A84B]" />
    case 'silver':
      return <Star className="h-4 w-4 text-slate-300" />
    case 'bronze':
      return <Star className="h-4 w-4 text-amber-600" />
    default:
      return null
  }
}

function statusFormLabel(status: SponsorPipelineStatus): string {
  return status === 'active' ? 'Active' : status === 'lapsed' ? 'Inactive' : 'Prospect'
}

interface SponsorFormState {
  companyName: string
  contactName: string
  email: string
  phone: string
  abn: string
  streetAddress: string
  suburb: string
  state: string
  postcode: string
  industry: string
  status: string
  notes: string
  annualValue: number
  tier: SponsorTier
  website: string
  startDate: string
  endDate: string
}

const EMPTY_SPONSOR_FORM: SponsorFormState = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  abn: '',
  streetAddress: '',
  suburb: '',
  state: 'VIC',
  postcode: '',
  industry: '',
  status: 'Prospect',
  notes: '',
  annualValue: 0,
  tier: 'none',
  website: '',
  startDate: '',
  endDate: '',
}

function composeAddress(form: SponsorFormState): string | undefined {
  const parts = [form.streetAddress, form.suburb, form.state, form.postcode].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : undefined
}

function parseAddress(address?: string): {
  streetAddress: string
  suburb: string
  state: string
  postcode: string
} {
  if (!address) return { streetAddress: '', suburb: '', state: 'VIC', postcode: '' }
  const parts = address.split(', ').map((p) => p.trim())
  return {
    streetAddress: parts[0] || '',
    suburb: parts[1] || '',
    state: parts[2] || 'VIC',
    postcode: parts[3] || '',
  }
}

const TIER_VALUES: SponsorTier[] = ['champion', 'gold', 'silver', 'bronze', 'custom', 'none']

function contractStatusToPipeline(status: Contract['status']): SponsorPipelineStatus {
  if (status === 'active' || status === 'expiring_soon') return 'active'
  if (status === 'expired' || status === 'cancelled') return 'lapsed'
  return 'contracted'
}

/** Companies with a contract in the ops store appear in the CRM even when not seeded. */
function sponsorFromContract(contract: Contract): CrmSponsor {
  const tier = contract.tier.toLowerCase() as SponsorTier
  return {
    id: `sp-${contract.id}`,
    companyName: contract.companyName,
    contactName: contract.primaryContact,
    email: contract.email,
    phone: contract.phone ?? '',
    industry: contract.industry ?? 'Other',
    address:
      [contract.streetAddress, contract.suburb, contract.state, contract.postcode]
        .filter(Boolean)
        .join(', ') || undefined,
    website: contract.website,
    abn: contract.abn,
    tier: TIER_VALUES.includes(tier) ? tier : 'custom',
    status: contractStatusToPipeline(contract.status),
    annualValue: contract.contractValue,
    startDate: contract.startDate,
    endDate: contract.endDate,
    proposals: [],
    notes: [
      {
        id: `n-${contract.id}`,
        date: contract.startDate,
        author: 'Ops Portal',
        content: `From contract ${contract.contractNumber} — ${contract.campaignName}`,
        type: 'note',
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Sponsor CRM
// ---------------------------------------------------------------------------

export default function SponsorCRM() {
  const { contracts } = useOpsStore()
  const [sponsors, setSponsors] = useLocalStorage<CrmSponsor[]>(SPONSORS_STORAGE_KEY, CRM_SPONSORS)
  const [view, setView] = useState('pipeline')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [form, setForm] = useState<SponsorFormState>(EMPTY_SPONSOR_FORM)
  const [newNote, setNewNote] = useState<{ content: string; type: SponsorNoteType; author: string }>(
    { content: '', type: 'note', author: 'Sarah J.' },
  )

  // Merge persisted CRM sponsors with companies derived from ops-store
  // contracts (deduped by company name; CRM records win).
  const merged = useMemo(() => {
    const known = new Set(sponsors.map((s) => s.companyName.toLowerCase()))
    const derived: CrmSponsor[] = []
    for (const contract of contracts) {
      const key = contract.companyName.toLowerCase()
      if (known.has(key)) continue
      known.add(key)
      derived.push(sponsorFromContract(contract))
    }
    return [...sponsors, ...derived]
  }, [sponsors, contracts])

  const filtered = useMemo(
    () =>
      merged.filter((s) => {
        const matchesSearch =
          s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.industry.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTier = tierFilter === 'all' || s.tier === tierFilter
        return matchesSearch && matchesTier
      }),
    [merged, searchQuery, tierFilter],
  )

  const stats = useMemo(() => {
    const total = merged.length
    const active = merged.filter((s) => s.status === 'active').length
    const pipelineValue = merged
      .filter((s) => ['proposal_sent', 'negotiating', 'contracted'].includes(s.status))
      .reduce((sum, s) => sum + s.annualValue, 0)
    const proposalsSent = merged.reduce(
      (sum, s) =>
        sum + s.proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length,
      0,
    )
    const renewalsDue = merged.filter(
      (s) => s.endDate && daysUntil(s.endDate) <= 90 && s.status === 'active',
    ).length
    return { total, active, pipelineValue, proposalsSent, renewalsDue }
  }, [merged])

  const grouped = useMemo(() => {
    const groups: Partial<Record<SponsorPipelineStatus, CrmSponsor[]>> = {}
    PIPELINE_STAGES.forEach((stage) => {
      groups[stage.key] = filtered.filter((s) => s.status === stage.key)
    })
    return groups
  }, [filtered])

  const selected = selectedId ? (merged.find((s) => s.id === selectedId) ?? null) : null
  const deleteTarget = deleteTargetId ? (merged.find((s) => s.id === deleteTargetId) ?? null) : null

  // ---- Mutations ----------------------------------------------------------

  /** Apply a patch to a sponsor, materialising derived (contract) records. */
  const upsertSponsor = (id: string, patch: Partial<CrmSponsor>) => {
    setSponsors((prev) => {
      if (prev.some((s) => s.id === id)) {
        return prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      }
      const derived = merged.find((s) => s.id === id)
      return derived ? [...prev, { ...derived, ...patch }] : prev
    })
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_SPONSOR_FORM)
    setIsFormOpen(true)
  }

  const openEdit = (sponsor: CrmSponsor, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingId(sponsor.id)
    const address = parseAddress(sponsor.address)
    setForm({
      companyName: sponsor.companyName,
      contactName: sponsor.contactName,
      email: sponsor.email,
      phone: sponsor.phone,
      abn: sponsor.abn || '',
      streetAddress: address.streetAddress,
      suburb: address.suburb,
      state: address.state,
      postcode: address.postcode,
      industry: sponsor.industry,
      status: statusFormLabel(sponsor.status),
      notes: '',
      annualValue: sponsor.annualValue,
      tier: sponsor.tier,
      website: sponsor.website || '',
      startDate: sponsor.startDate || '',
      endDate: sponsor.endDate || '',
    })
    setIsFormOpen(true)
  }

  const saveSponsor = () => {
    if (!form.companyName.trim()) return
    const status =
      SPONSOR_STATUS_OPTIONS.find((o) => o.label === form.status)?.value || 'lead'
    const address = composeAddress(form)
    if (editingId) {
      const noteAddition: SponsorNote[] = form.notes.trim()
        ? [
            {
              id: `n${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              author: 'Station Mgr',
              content: form.notes.trim(),
              type: 'note',
            },
          ]
        : []
      const existing = merged.find((s) => s.id === editingId)
      upsertSponsor(editingId, {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        industry: form.industry || 'Other',
        address,
        website: form.website || undefined,
        tier: form.tier,
        status,
        annualValue: form.annualValue || 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        abn: form.abn.trim() || undefined,
        ...(noteAddition.length > 0 && existing
          ? { notes: [...noteAddition, ...existing.notes] }
          : {}),
      })
    } else {
      const notes: SponsorNote[] = form.notes.trim()
        ? [
            {
              id: `n${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              author: 'Station Mgr',
              content: form.notes.trim(),
              type: 'note',
            },
          ]
        : []
      const sponsor: CrmSponsor = {
        id: `sponsor_${Date.now()}`,
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        industry: form.industry || 'Other',
        address,
        website: form.website || undefined,
        tier: form.tier,
        status,
        annualValue: form.annualValue || 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        proposals: [],
        notes,
        abn: form.abn.trim() || undefined,
      }
      setSponsors((prev) => [...prev, sponsor])
    }
    setForm(EMPTY_SPONSOR_FORM)
    setEditingId(null)
    setIsFormOpen(false)
  }

  const confirmDelete = (sponsor: CrmSponsor, event: React.MouseEvent) => {
    event.stopPropagation()
    setDeleteTargetId(sponsor.id)
    setIsDeleteOpen(true)
  }

  const deleteSponsor = () => {
    if (!deleteTarget) return
    setSponsors((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTargetId(null)
    setIsDeleteOpen(false)
    if (selectedId === deleteTarget.id) {
      setSelectedId(null)
      setIsDetailOpen(false)
    }
  }

  const addNote = () => {
    if (!selected || !newNote.content.trim()) return
    const note: SponsorNote = {
      id: `n${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: newNote.author,
      content: newNote.content.trim(),
      type: newNote.type,
    }
    upsertSponsor(selected.id, { notes: [note, ...selected.notes] })
    setNewNote({ content: '', type: 'note', author: 'Sarah J.' })
  }

  const changeStatus = (id: string, status: SponsorPipelineStatus) => {
    upsertSponsor(id, { status })
  }

  const changeTier = (id: string, tier: SponsorTier) => {
    upsertSponsor(id, { tier })
  }

  const openDetail = (sponsor: CrmSponsor) => {
    setSelectedId(sponsor.id)
    setIsDetailOpen(true)
  }

  // ---- Render -------------------------------------------------------------

  return (
    <div
      className="min-h-screen bg-[#101010] text-white p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sponsor <span className="text-[#D4A84B]">CRM</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              ONE FM 98.5 — Manage sponsors, proposals & communications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="bg-[#0E1E38] border border-[#2A2A2A]/50">
                <TabsTrigger
                  value="pipeline"
                  className="data-[state=active]:bg-[#D4A84B] data-[state=active]:text-[#101010] text-slate-300"
                >
                  Pipeline
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-[#D4A84B] data-[state=active]:text-[#101010] text-slate-300"
                >
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={openAdd}
              className="bg-one-gold hover:bg-one-gold/90 text-one-navy font-label text-xs uppercase tracking-wider gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Sponsor
            </Button>

            {/* Add / edit dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="bg-[#0E1E38] border-[#2A2A2A]/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {editingId ? 'Edit Sponsor' : 'Add New Sponsor'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Company Name *</Label>
                      <Input
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="Company name"
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Contact Name</Label>
                      <Input
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="Contact person"
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email</Label>
                      <Input
                        type="email"
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="email@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Phone</Label>
                      <Input
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="(03) XXXX XXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">ABN</Label>
                      <Input
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="12 345 678 901"
                        value={form.abn}
                        onChange={(e) => setForm({ ...form, abn: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Industry</Label>
                      <Select
                        value={form.industry || ' '}
                        onValueChange={(v) => setForm({ ...form, industry: v === ' ' ? '' : v })}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-white">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                          <SelectItem value=" " className="text-white hover:bg-[#2A2A2A]/50">
                            Select industry
                          </SelectItem>
                          {CRM_INDUSTRIES.map((industry) => (
                            <SelectItem
                              key={industry}
                              value={industry}
                              className="text-white hover:bg-[#2A2A2A]/50"
                            >
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Street Address</Label>
                    <Input
                      className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                      placeholder="123 Main Street"
                      value={form.streetAddress}
                      onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Suburb</Label>
                      <Input
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="Shepparton"
                        value={form.suburb}
                        onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">State</Label>
                      <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                          {AU_STATES.map((state) => (
                            <SelectItem
                              key={state}
                              value={state}
                              className="text-white hover:bg-[#2A2A2A]/50"
                            >
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Postcode</Label>
                      <Input
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="3630"
                        value={form.postcode}
                        onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v })}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                          {SPONSOR_STATUS_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.label}
                              value={option.label}
                              className="text-white hover:bg-[#2A2A2A]/50"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Tier</Label>
                      <Select
                        value={form.tier}
                        onValueChange={(v) => setForm({ ...form, tier: v as SponsorTier })}
                      >
                        <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                          <SelectItem value="champion" className="text-white hover:bg-[#2A2A2A]/50">
                            Champion
                          </SelectItem>
                          <SelectItem value="gold" className="text-white hover:bg-[#2A2A2A]/50">
                            Gold
                          </SelectItem>
                          <SelectItem value="silver" className="text-white hover:bg-[#2A2A2A]/50">
                            Silver
                          </SelectItem>
                          <SelectItem value="bronze" className="text-white hover:bg-[#2A2A2A]/50">
                            Bronze
                          </SelectItem>
                          <SelectItem value="custom" className="text-white hover:bg-[#2A2A2A]/50">
                            Custom
                          </SelectItem>
                          <SelectItem value="none" className="text-white hover:bg-[#2A2A2A]/50">
                            None
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Annual Value ($)</Label>
                      <Input
                        type="number"
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                        placeholder="0"
                        value={form.annualValue || ''}
                        onChange={(e) =>
                          setForm({ ...form, annualValue: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Start Date</Label>
                      <Input
                        type="date"
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">End Date</Label>
                      <Input
                        type="date"
                        className="bg-[#101010] border-[#2A2A2A]/50 text-white"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Website</Label>
                    <Input
                      className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
                      placeholder="www.company.com.au"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      {editingId ? 'Add Note (optional)' : 'Notes (optional)'}
                    </Label>
                    <Textarea
                      className="bg-[#101010] border-[#2A2A2A]/50 text-white placeholder:text-slate-500 resize-none"
                      placeholder="Any notes about this sponsor..."
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="border-[#2A2A2A]/50 text-slate-300 hover:bg-[#2A2A2A]/30 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={saveSponsor}
                    disabled={!form.companyName.trim()}
                    className="bg-[#D4A84B] hover:bg-[#D4A84B]/90 text-[#101010] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingId ? 'Save Changes' : 'Add Sponsor'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Total Sponsors</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#2A2A2A]/40 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#D4A84B]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Active</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Pipeline Value</p>
                  <p className="text-2xl font-bold text-[#D4A84B] mt-1">
                    {formatCurrency(stats.pipelineValue)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#D4A84B]/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[#D4A84B]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Proposals Sent</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{stats.proposalsSent}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Renewals Due</p>
                  <p className="text-2xl font-bold text-[#E31E24] mt-1">{stats.renewalsDue}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#E31E24]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#E31E24]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              className="pl-9 bg-[#0E1E38] border-[#2A2A2A]/50 text-white placeholder:text-slate-500"
              placeholder="Search sponsors, contacts, industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select onValueChange={setTierFilter} defaultValue="all">
            <SelectTrigger className="w-44 bg-[#0E1E38] border-[#2A2A2A]/50 text-white">
              <Filter className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
              <SelectItem value="all" className="text-white hover:bg-[#2A2A2A]/50">
                All Tiers
              </SelectItem>
              <SelectItem value="champion" className="text-white hover:bg-[#2A2A2A]/50">
                Champion
              </SelectItem>
              <SelectItem value="gold" className="text-white hover:bg-[#2A2A2A]/50">
                Gold
              </SelectItem>
              <SelectItem value="silver" className="text-white hover:bg-[#2A2A2A]/50">
                Silver
              </SelectItem>
              <SelectItem value="bronze" className="text-white hover:bg-[#2A2A2A]/50">
                Bronze
              </SelectItem>
              <SelectItem value="custom" className="text-white hover:bg-[#2A2A2A]/50">
                Custom
              </SelectItem>
              <SelectItem value="none" className="text-white hover:bg-[#2A2A2A]/50">
                None
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pipeline view */}
      {view === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageSponsors = grouped[stage.key] || []
            return (
              <div key={stage.key} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">{stage.label}</h3>
                    <Badge
                      variant="outline"
                      className="bg-[#2A2A2A]/30 text-slate-400 border-[#2A2A2A]/40 text-xs"
                    >
                      {stageSponsors.length}
                    </Badge>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </div>
                <div className="space-y-2.5">
                  {stageSponsors.map((sponsor) => {
                    const lastTouch =
                      sponsor.notes[sponsor.notes.length - 1]?.date || sponsor.startDate
                    const inactiveDays = daysSince(lastTouch)
                    return (
                      <Card
                        key={sponsor.id}
                        className="bg-[#0E1E38] border-[#2A2A2A]/40 hover:border-[#D4A84B]/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-[#D4A84B]/5"
                        onClick={() => openDetail(sponsor)}
                      >
                        <CardContent className="p-3.5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <TierIcon tier={sponsor.tier} />
                              <h4 className="text-sm font-semibold text-white truncate">
                                {sponsor.companyName}
                              </h4>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{sponsor.contactName}</p>
                          {sponsor.annualValue > 0 && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <DollarSign className="h-3 w-3 text-[#D4A84B]" />
                              <span className="text-xs font-medium text-[#D4A84B]">
                                {formatCurrency(sponsor.annualValue)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`${tierBadgeClasses(sponsor.tier)} text-[10px] px-1.5 py-0`}
                            >
                              {sponsor.tier}
                            </Badge>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span className="text-[10px]">{inactiveDays}d</span>
                            </div>
                          </div>
                          {sponsor.proposals.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#2A2A2A]/30">
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] text-slate-400">
                                  {sponsor.proposals.length} proposal
                                  {sponsor.proposals.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  {stageSponsors.length === 0 && (
                    <div className="border-2 border-dashed border-[#2A2A2A]/30 rounded-lg p-6 text-center">
                      <p className="text-xs text-slate-500">No sponsors</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <Card className="bg-[#0E1E38] border-[#2A2A2A]/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-[#2A2A2A]/50 hover:bg-transparent">
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Company
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Contact
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Tier
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider text-right">
                    Annual Value
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Contract Period
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider text-center">
                    Renewal
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sponsor) => {
                  const renewalDays = sponsor.endDate ? daysUntil(sponsor.endDate) : null
                  return (
                    <TableRow
                      key={sponsor.id}
                      className="border-b-[#2A2A2A]/30 hover:bg-[#2A2A2A]/20 cursor-pointer transition-colors"
                      onClick={() => openDetail(sponsor)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TierIcon tier={sponsor.tier} />
                          <div>
                            <p className="text-sm font-medium text-white">{sponsor.companyName}</p>
                            <p className="text-[10px] text-slate-500">{sponsor.industry}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-300">{sponsor.contactName}</p>
                          <p className="text-[10px] text-slate-500">{sponsor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${tierBadgeClasses(sponsor.tier)} text-[10px] capitalize`}
                        >
                          {sponsor.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusBadgeClasses(sponsor.status)} text-[10px] capitalize`}
                        >
                          {sponsor.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium text-[#D4A84B]">
                          {sponsor.annualValue > 0 ? formatCurrency(sponsor.annualValue) : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {sponsor.startDate ? (
                          <div className="text-xs text-slate-400">
                            {formatDate(sponsor.startDate)} — {formatDate(sponsor.endDate)}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {renewalDays !== null ? (
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-xs font-medium ${
                                renewalDays <= 30
                                  ? 'text-[#E31E24]'
                                  : renewalDays <= 90
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                              }`}
                            >
                              {renewalDays}d
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {renewalDays <= 30 ? 'Urgent' : renewalDays <= 90 ? 'Soon' : 'OK'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-[#D4A84B] hover:bg-[#2A2A2A]/50"
                            onClick={(e) => openEdit(sponsor, e)}
                            title="Edit sponsor"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-[#E31E24] hover:bg-[#2A2A2A]/50"
                            onClick={(e) => confirmDelete(sponsor, e)}
                            title="Delete sponsor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-[#2A2A2A]/50"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(sponsor)
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <p className="text-sm text-slate-500">No sponsors found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-[#0E1E38] border-[#2A2A2A]/50 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Delete Sponsor
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">{deleteTarget?.companyName}</span>?
            </p>
            <p className="text-xs text-slate-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#2A2A2A]/50 text-slate-300 hover:bg-[#2A2A2A]/30 hover:text-white"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteSponsor}
              className="bg-[#E31E24] hover:bg-[#E31E24]/90 text-white font-semibold"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsor detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          showCloseButton={false}
          className="bg-[#0E1E38] border-[#2A2A2A]/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0"
        >
          {selected && (
            <>
              <div className="p-6 pb-4 border-b border-[#2A2A2A]/40">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#2A2A2A]/50 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-[#D4A84B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2
                          className="text-lg font-bold text-white"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {selected.companyName}
                        </h2>
                        <TierIcon tier={selected.tier} />
                      </div>
                      <p className="text-sm text-slate-400">{selected.industry}</p>
                    </div>
                  </div>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-[#2A2A2A]/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-300">{selected.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-300 truncate">{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-300">{selected.phone}</span>
                  </div>
                  {selected.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-300 truncate">{selected.website}</span>
                    </div>
                  )}
                </div>
                {selected.address && (
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-400">{selected.address}</span>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-b border-[#2A2A2A]/40">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Status</Label>
                    <Select
                      value={selected.status}
                      onValueChange={(v) =>
                        changeStatus(selected.id, v as SponsorPipelineStatus)
                      }
                    >
                      <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-white text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                        {PIPELINE_STAGES.map((stage) => (
                          <SelectItem
                            key={stage.key}
                            value={stage.key}
                            className="text-white hover:bg-[#2A2A2A]/50 text-sm"
                          >
                            {stage.label}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="lapsed"
                          className="text-white hover:bg-[#2A2A2A]/50 text-sm"
                        >
                          Lapsed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Tier</Label>
                    <Select
                      value={selected.tier}
                      onValueChange={(v) => changeTier(selected.id, v as SponsorTier)}
                    >
                      <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-white text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                        {TIER_VALUES.map((tier) => (
                          <SelectItem
                            key={tier}
                            value={tier}
                            className="text-white hover:bg-[#2A2A2A]/50 text-sm capitalize"
                          >
                            {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selected.annualValue > 0 && (
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[#D4A84B]" />
                      <span className="text-sm font-semibold text-[#D4A84B]">
                        {formatCurrency(selected.annualValue)} / year
                      </span>
                    </div>
                    {selected.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-xs text-slate-400">
                          {formatDate(selected.startDate)} — {formatDate(selected.endDate)}
                        </span>
                      </div>
                    )}
                    {selected.endDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span
                          className={`text-xs ${
                            daysUntil(selected.endDate) <= 90 ? 'text-[#E31E24]' : 'text-slate-400'
                          }`}
                        >
                          {daysUntil(selected.endDate)} days until renewal
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Proposals */}
              <div className="px-6 py-4 border-b border-[#2A2A2A]/40">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#D4A84B]" />
                  Proposals ({selected.proposals.length})
                </h3>
                {selected.proposals.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No proposals yet</p>
                ) : (
                  <div className="space-y-2">
                    {selected.proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="bg-[#101010]/60 rounded-lg p-3 border border-[#2A2A2A]/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ProposalStatusIcon status={proposal.status} />
                            <span className="text-sm font-medium text-white">{proposal.title}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              proposal.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : proposal.status === 'declined'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : proposal.status === 'sent'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : proposal.status === 'viewed'
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {proposal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#D4A84B] font-medium">
                            {formatCurrency(proposal.value)}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            {proposal.sentDate && <span>Sent: {formatDate(proposal.sentDate)}</span>}
                            {proposal.acceptedDate && (
                              <span>Accepted: {formatDate(proposal.acceptedDate)}</span>
                            )}
                          </div>
                        </div>
                        {proposal.sections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proposal.sections.map((section, index) => (
                              <span
                                key={index}
                                className="text-[10px] bg-[#2A2A2A]/40 text-slate-400 px-1.5 py-0.5 rounded"
                              >
                                {section}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Communication log */}
              <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#D4A84B]" />
                  Communication Log ({selected.notes.length})
                </h3>
                <div className="bg-[#101010]/60 rounded-lg p-3 border border-[#2A2A2A]/30 mb-4">
                  <div className="space-y-2">
                    <Textarea
                      className="bg-[#101010] border-[#2A2A2A]/50 text-white text-sm placeholder:text-slate-500 resize-none"
                      placeholder="Add a note, call log, or meeting summary..."
                      rows={2}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Select
                          value={newNote.type}
                          onValueChange={(v) =>
                            setNewNote({ ...newNote, type: v as SponsorNoteType })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs bg-[#101010] border-[#2A2A2A]/50 text-white w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                            <SelectItem value="note" className="text-white text-xs">
                              Note
                            </SelectItem>
                            <SelectItem value="call" className="text-white text-xs">
                              Call
                            </SelectItem>
                            <SelectItem value="email" className="text-white text-xs">
                              Email
                            </SelectItem>
                            <SelectItem value="meeting" className="text-white text-xs">
                              Meeting
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={newNote.author}
                          onValueChange={(v) => setNewNote({ ...newNote, author: v })}
                        >
                          <SelectTrigger className="h-7 text-xs bg-[#101010] border-[#2A2A2A]/50 text-white w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0E1E38] border-[#2A2A2A]/50">
                            <SelectItem value="Sarah J." className="text-white text-xs">
                              Sarah J.
                            </SelectItem>
                            <SelectItem value="Mike R." className="text-white text-xs">
                              Mike R.
                            </SelectItem>
                            <SelectItem value="Alex T." className="text-white text-xs">
                              Alex T.
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 bg-[#D4A84B] hover:bg-[#D4A84B]/90 text-[#101010] text-xs font-semibold gap-1"
                        onClick={addNote}
                        disabled={!newNote.content.trim()}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {selected.notes.map((note, index) => (
                    <div key={note.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-7 w-7 rounded-full bg-[#2A2A2A]/50 flex items-center justify-center flex-shrink-0">
                          <NoteTypeIcon type={note.type} />
                        </div>
                        {index < selected.notes.length - 1 && (
                          <div className="w-px h-full bg-[#2A2A2A]/30 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-300 capitalize">
                            {note.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{formatDate(note.date)}</span>
                          <span className="text-[10px] text-slate-600">by {note.author}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

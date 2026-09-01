import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CircleCheck,
  DollarSign,
  FilePlus2,
  Inbox,
  Search,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import {
  ASSIGNEES,
  FILTER_TABS,
  formatCurrency,
  formatDate,
  isClosed,
  PRIORITY_CONFIG,
  SOURCE_CONFIG,
  STATUS_CONFIG,
  type EnquiryStatus,
} from './data/enquiries'
import { useOpsStore } from './store'
import { useToast } from './Toast'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function isWithinLastWeek(iso: string) {
  return Date.now() - new Date(iso).getTime() < WEEK_MS
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isText,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: string
  isText?: boolean
}) {
  return (
    <div className="rounded-xl border border-one-border bg-[#0D1E36]/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('size-4', color)} />
        <span className="text-[11px] text-one-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold tabular-nums', isText ? 'text-lg' : 'text-one-white')}>
        {value}
      </p>
    </div>
  )
}

export default function EnquiryDashboard() {
  const { enquiries, updateEnquiry, addEnquiryNote, createProposalFromEnquiry } = useOpsStore()
  const { toast } = useToast()
  const { user } = useAuth()
  const assignees = isSupabaseConfigured()
    ? user?.email
      ? [user.email]
      : []
    : ASSIGNEES
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<'updatedAt' | 'priority' | 'value'>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [noteText, setNoteText] = useState('')

  const selected = useMemo(
    () => enquiries.find((e) => e.id === selectedId) ?? null,
    [enquiries, selectedId],
  )

  const stats = useMemo(() => {
    return {
      total: enquiries.length,
      newThisWeek: enquiries.filter((e) => isWithinLastWeek(e.createdAt)).length,
      pending: enquiries.filter((e) => !isClosed(e.status)).length,
      closedWon: enquiries.filter((e) => e.status === 'closed_won').length,
      pipeline: enquiries
        .filter((e) => !isClosed(e.status))
        .reduce((sum, e) => sum + (e.value ?? 0), 0),
    }
  }, [enquiries])

  const filtered = useMemo(() => {
    let list = [...enquiries]
    if (filter === 'closed') {
      list = list.filter((e) => isClosed(e.status))
    } else if (filter !== 'all') {
      list = list.filter((e) => e.status === filter)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.company ?? '').toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortCol === 'priority') {
        const order = { urgent: 3, high: 2, medium: 1, low: 0 }
        cmp = (order[a.priority] ?? 0) - (order[b.priority] ?? 0)
      } else if (sortCol === 'value') {
        cmp = (a.value ?? 0) - (b.value ?? 0)
      } else {
        cmp = new Date(a[sortCol]).getTime() - new Date(b[sortCol]).getTime()
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [enquiries, filter, search, sortCol, sortDir])

  const updateStatus = (id: string, status: EnquiryStatus) => {
    updateEnquiry(id, { status })
  }

  const updateAssignee = (id: string, assignedTo: string) => {
    updateEnquiry(id, { assignedTo })
  }

  const addNote = (id: string, text: string) => {
    if (!text.trim()) return
    addEnquiryNote(id, text)
    setNoteText('')
  }

  const handleCreateProposal = (id: string) => {
    const proposalId = createProposalFromEnquiry(id)
    if (proposalId) {
      toast('Draft proposal created — opening Proposals', 'success')
    }
  }

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  const tabCount = (key: string) => {
    if (key === 'all') return enquiries.length
    if (key === 'closed') return enquiries.filter((e) => isClosed(e.status)).length
    return enquiries.filter((e) => e.status === key).length
  }

  return (
    <div className="text-one-white -mx-2">
      <header className="border-b border-one-border bg-one-navy/90 backdrop-blur-md sticky top-[72px] z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-one-gold/20 flex items-center justify-center">
                <Inbox className="size-5 text-one-gold" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Enquiry Management</h1>
                <p className="text-[11px] text-one-muted leading-none mt-0.5">
                  {BRAND.fullName} · {formatCoverageShort()} — Track, manage & convert incoming enquiries
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-one-muted" />
              <Input
                placeholder="Search enquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-[240px] text-xs bg-one-navy border-one-border placeholder:text-one-muted/60"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Inbox} label="Total Enquiries" value={stats.total} color="text-blue-400" />
          <StatCard icon={TrendingUp} label="New This Week" value={stats.newThisWeek} color="text-one-gold" />
          <StatCard icon={UserCheck} label="Pending Response" value={stats.pending} color="text-orange-400" />
          <StatCard icon={CircleCheck} label="Closed Won" value={stats.closedWon} color="text-green-400" />
          <StatCard
            icon={DollarSign}
            label="Pipeline Value"
            value={formatCurrency(stats.pipeline)}
            color="text-emerald-400"
            isText
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-4 bg-one-navy border border-one-border rounded-lg p-1 w-fit">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                  active
                    ? 'bg-one-gold/20 text-one-gold shadow-sm'
                    : 'text-one-muted hover:text-one-white hover:bg-white/5',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 text-[10px] tabular-nums',
                    active ? 'text-one-gold/70' : 'text-one-muted/85',
                  )}
                >
                  {tabCount(tab.key)}
                </span>
                {active && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-md border border-one-gold/30"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="rounded-xl border border-one-border overflow-hidden bg-[#0D1E36]/60 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-one-border hover:bg-transparent">
                  <TableHead className="text-one-muted text-[11px] font-semibold uppercase tracking-wider w-[140px]">
                    Status
                  </TableHead>
                  <TableHead className="text-one-muted text-[11px] font-semibold uppercase tracking-wider">
                    Name / Company
                  </TableHead>
                  <TableHead className="text-one-muted text-[11px] font-semibold uppercase tracking-wider w-[110px]">
                    Source
                  </TableHead>
                  <TableHead className="text-one-muted text-[11px] font-semibold uppercase tracking-wider">
                    Subject
                  </TableHead>
                  <TableHead
                    className="text-one-muted text-[11px] font-semibold uppercase tracking-wider w-[100px] cursor-pointer"
                    onClick={() => toggleSort('value')}
                  >
                    Value
                  </TableHead>
                  <TableHead
                    className="text-one-muted text-[11px] font-semibold uppercase tracking-wider w-[100px] cursor-pointer"
                    onClick={() => toggleSort('updatedAt')}
                  >
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((enq) => {
                  const status = STATUS_CONFIG[enq.status]
                  const source = SOURCE_CONFIG[enq.source]
                  return (
                    <TableRow
                      key={enq.id}
                      className="border-one-border cursor-pointer hover:bg-white/5"
                      onClick={() => setSelectedId(enq.id)}
                    >
                      <TableCell>
                        <Badge variant="outline" className={cn('text-[10px]', status.color)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{enq.name}</div>
                        <div className="text-xs text-one-muted">{enq.company ?? enq.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-[10px]', source.color)}>
                          {source.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-one-white/80 max-w-[200px] truncate">
                        {enq.subject}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">{formatCurrency(enq.value)}</TableCell>
                      <TableCell className="text-xs text-one-muted">{formatDate(enq.updatedAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="bg-[#0D1E36] border-one-border text-one-white w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-one-white">{selected.subject}</SheetTitle>
                <p className="text-xs text-one-muted">{selected.id}</p>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="text-xs text-one-muted">{selected.email} · {selected.phone}</p>
                  {selected.company && (
                    <p className="text-xs text-one-muted">{selected.company}</p>
                  )}
                </div>

                <p className="text-sm text-one-white/80 leading-relaxed">{selected.message}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-one-muted uppercase tracking-wider">Status</label>
                    <Select
                      value={selected.status}
                      onValueChange={(v) => updateStatus(selected.id, v as EnquiryStatus)}
                    >
                      <SelectTrigger className="mt-1 bg-one-navy border-one-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            {cfg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-one-muted uppercase tracking-wider">Assigned To</label>
                    <Select
                      value={selected.assignedTo ?? 'unassigned'}
                      onValueChange={(v) =>
                        updateAssignee(selected.id, v === 'unassigned' ? '' : v)
                      }
                    >
                      <SelectTrigger className="mt-1 bg-one-navy border-one-border">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignees.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className={PRIORITY_CONFIG[selected.priority].color}>
                    {PRIORITY_CONFIG[selected.priority].label}
                  </Badge>
                  <Badge variant="outline">{formatCurrency(selected.value)}</Badge>
                </div>

                {!isClosed(selected.status) && (
                  <Button
                    onClick={() => handleCreateProposal(selected.id)}
                    className="w-full bg-one-gold text-one-navy hover:bg-one-gold/90"
                  >
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    Create Proposal
                  </Button>
                )}

                <div>
                  <h4 className="text-xs font-label uppercase tracking-wider text-one-muted mb-3">
                    Notes
                  </h4>
                  <div className="space-y-2 mb-3">
                    {selected.notes.map((note) => (
                      <div key={note.id} className="rounded-lg bg-one-navy/50 p-3 text-sm">
                        <p>{note.text}</p>
                        <p className="text-[10px] text-one-muted mt-1">
                          {note.author} · {formatDate(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="bg-one-navy border-one-border text-sm mb-2"
                  />
                  <Button
                    size="sm"
                    onClick={() => addNote(selected.id, noteText)}
                    className="bg-one-gold text-one-navy hover:bg-one-gold/90"
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

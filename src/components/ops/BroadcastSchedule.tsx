import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Coffee,
  Eye,
  FileText,
  Megaphone,
  Mic,
  Moon,
  Music,
  Pencil,
  Plus,
  Printer,
  Radio,
  RotateCcw,
  Search,
  Sun,
  Sunrise,
  Trash2,
  TrendingUp,
  Utensils,
  X,
  Zap,
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
import {
  DAYPARTS,
  DAY_NAMES_FULL,
  DAY_NAMES_SHORT,
  PROGRAMME_CATEGORY_META,
  PROGRAMME_GUIDE,
  SATURDAY_SPORTS_LINEUP,
  SEED_CAMPAIGNS,
  SEED_SPONSORS,
  buildSeedSpots,
  type AdSpot,
  type DaypartCode,
  type ProgrammeCategory,
  type ProgrammeEntry,
  type ScheduleCampaign,
  type ScheduleSponsor,
  type SpotStatus,
} from './data/schedule'
import { opsInitial, opsStorageKey } from '@/lib/opsMode'

// ----------------------------- shared helpers ------------------------------

const DAYPART_ICONS: Record<DaypartCode, React.ReactNode> = {
  EM: <Sunrise className="w-3.5 h-3.5" />,
  B: <Coffee className="w-3.5 h-3.5" />,
  M: <Sun className="w-3.5 h-3.5" />,
  L: <Utensils className="w-3.5 h-3.5" />,
  D: <TrendingUp className="w-3.5 h-3.5" />,
  LN: <Moon className="w-3.5 h-3.5" />,
}

const SPOT_STATUS_CLASSES: Record<SpotStatus, string> = {
  scheduled: 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/30',
  delivered: 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

function formatWeekRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${start.toLocaleDateString('en-AU', opts)} — ${end.toLocaleDateString('en-AU', opts)}`
}

/** Monday-based start of week. */
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 0 = Monday … 6 = Sunday. */
function mondayIndex(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/** localStorage-backed state, matching the deployed build's persistence keys. */
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// The deployed build initialised these stores empty; we seed them with the
// extracted campaign/spot records so the UI renders populated.
const INITIAL_SPOTS = buildSeedSpots()

// ------------------------------ spot tooltip -------------------------------

function SpotTooltip({ spot, campaign }: { spot: AdSpot; campaign: ScheduleCampaign | undefined }) {
  return (
    <div className="bg-[#1E293B] border border-[#2A2A2A] rounded-lg p-3 shadow-xl min-w-[220px]">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: campaign?.color || '#D4A853' }} />
        <span className="text-one-white font-semibold text-sm">{spot.sponsorName}</span>
      </div>
      <p className="text-one-white/60 text-xs mb-1.5">{spot.campaignName}</p>
      <div className="flex items-center gap-3 text-xs text-one-white/50 mb-1.5">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {spot.duration}s
        </span>
        <span>{DAYPARTS.find((d) => d.code === spot.daypart)?.label}</span>
      </div>
      <Badge className={`text-[10px] ${SPOT_STATUS_CLASSES[spot.status]}`}>
        {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
      </Badge>
    </div>
  )
}

// ------------------------------- week stats --------------------------------

function WeekStats({
  spots,
  campaigns,
  weekStart,
  weekEnd,
}: {
  spots: AdSpot[]
  campaigns: ScheduleCampaign[]
  weekStart: Date
  weekEnd: Date
}) {
  const weekSpots = useMemo(
    () =>
      spots.filter((s) => {
        const d = fromIsoDate(s.date)
        return d >= weekStart && d <= weekEnd
      }),
    [spots, weekStart, weekEnd],
  )
  const total = weekSpots.length
  const delivered = weekSpots.filter((s) => s.status === 'delivered').length
  const fillRate = total > 0 ? Math.round((delivered / total) * 100) : 0
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length

  const byCampaign = useMemo(() => {
    const map: Record<string, { count: number; color: string; name: string }> = {}
    weekSpots.forEach((s) => {
      if (!map[s.campaignId]) {
        const campaign = campaigns.find((c) => c.id === s.campaignId)
        map[s.campaignId] = { count: 0, color: campaign?.color || '#D4A853', name: s.campaignName }
      }
      map[s.campaignId].count++
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [weekSpots, campaigns])

  const stats = [
    {
      label: 'Total Spots This Week',
      value: total,
      sub: `${delivered} delivered, ${total - delivered} scheduled`,
      icon: <Radio className="w-5 h-5 text-one-gold" />,
    },
    {
      label: 'Fill Rate',
      value: `${fillRate}%`,
      sub: `${delivered} of ${total} spots aired`,
      icon: <TrendingUp className="w-5 h-5 text-[#10B981]" />,
    },
    {
      label: 'Active Campaigns',
      value: activeCampaigns,
      sub: `${campaigns.length} total campaigns`,
      icon: <Megaphone className="w-5 h-5 text-[#3B82F6]" />,
    },
    {
      label: 'Top Campaign',
      value: byCampaign[0]?.name || 'None',
      sub: `${byCampaign[0]?.count || 0} spots this week`,
      icon: <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
        >
          <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-one-white/40 text-[11px] font-label uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-one-white text-2xl font-bold">{stat.value}</p>
                  <p className="text-one-white/40 text-xs mt-1">{stat.sub}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#1E293B]">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// -------------------------------- week grid --------------------------------

function WeekGrid({
  weekStart,
  spots,
  campaigns,
  onCellClick,
  onSpotClick,
}: {
  weekStart: Date
  spots: AdSpot[]
  campaigns: ScheduleCampaign[]
  onCellClick: (dayIndex: number, daypart: DaypartCode) => void
  onSpotClick: (spot: AdSpot) => void
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const todayIso = toIsoDate(new Date())

  return (
    <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-8 border-b border-[#2A2A2A]/40">
          <div className="p-3 border-r border-[#2A2A2A]/40 bg-[#101010]/60">
            <span className="text-one-white/30 text-[10px] font-label uppercase tracking-wider">Daypart</span>
          </div>
          {days.map((day, i) => {
            const isToday = toIsoDate(day) === todayIso
            return (
              <div
                key={i}
                className={`p-3 text-center border-r border-[#2A2A2A]/40 ${isToday ? 'bg-one-gold/10' : 'bg-[#101010]/30'}`}
              >
                <p className={`text-xs font-label uppercase tracking-wider ${isToday ? 'text-one-gold' : 'text-one-white/50'}`}>
                  {DAY_NAMES_SHORT[day.getDay()]}
                </p>
                <p className={`text-lg font-bold ${isToday ? 'text-one-gold' : 'text-one-white'}`}>{day.getDate()}</p>
              </div>
            )
          })}
        </div>
        {DAYPARTS.map((daypart) => (
          <div key={daypart.code} className="grid grid-cols-8 border-b border-[#2A2A2A]/30">
            <div className="p-3 border-r border-[#2A2A2A]/40 bg-[#101010]/40 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-1.5 text-one-gold">
                {DAYPART_ICONS[daypart.code]}
                <span className="text-[11px] font-semibold">{daypart.code}</span>
              </div>
              <span className="text-[10px] text-one-white/30 leading-tight">{daypart.timeRange}</span>
            </div>
            {days.map((day, dayIndex) => {
              const iso = toIsoDate(day)
              const cellSpots = spots.filter((s) => s.date === iso && s.daypart === daypart.code)
              const isToday = iso === todayIso
              return (
                <div
                  key={dayIndex}
                  onClick={() => cellSpots.length === 0 && onCellClick(dayIndex, daypart.code)}
                  className={`min-h-[80px] p-1.5 border-r border-[#2A2A2A]/30 cursor-pointer transition-all hover:bg-[#2A2A2A]/20 ${isToday ? 'bg-one-gold/5' : ''}`}
                >
                  <AnimatePresence>
                    {cellSpots.map((spot) => {
                      const campaign = campaigns.find((c) => c.id === spot.campaignId)
                      return (
                        <motion.div
                          key={spot.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSpotClick(spot)
                          }}
                          className="group relative mb-1 p-1.5 rounded border text-[10px] cursor-pointer transition-all hover:brightness-110"
                          style={{
                            backgroundColor: `${campaign?.color || '#D4A853'}15`,
                            borderColor: `${campaign?.color || '#D4A853'}40`,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: campaign?.color || '#D4A853' }}
                            />
                            <span className="text-one-white truncate font-medium">{spot.sponsorName}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-one-white/40">
                            <span>{spot.duration}s</span>
                            {spot.status === 'delivered' && (
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#10B981] ml-auto" />
                            )}
                            {spot.status === 'cancelled' && <X className="w-2.5 h-2.5 text-red-400 ml-auto" />}
                          </div>
                          <div className="absolute z-50 left-full ml-2 top-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            <SpotTooltip spot={spot} campaign={campaign} />
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ----------------------------- book spot dialog ----------------------------

const BOOK_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function BookSpotDialog({
  open,
  onClose,
  onBook,
  sponsors,
  campaigns,
  defaultDayIndex,
  defaultDaypart,
  weekStart,
}: {
  open: boolean
  onClose: () => void
  onBook: (spots: AdSpot[]) => void
  sponsors: ScheduleSponsor[]
  campaigns: ScheduleCampaign[]
  defaultDayIndex: number
  defaultDaypart: DaypartCode
  weekStart: Date
}) {
  const [sponsorId, setSponsorId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [daypart, setDaypart] = useState<DaypartCode>(defaultDaypart)
  const [selectedDays, setSelectedDays] = useState<number[]>([defaultDayIndex])
  const [duration, setDuration] = useState(30)
  const [perDay, setPerDay] = useState(1)
  const [startDate, setStartDate] = useState(toIsoDate(weekStart))
  const [endDate, setEndDate] = useState(toIsoDate(addDays(weekStart, 6)))
  const [notes, setNotes] = useState('')
  const [wasOpen, setWasOpen] = useState(false)

  // Reset form each time the dialog opens (render-phase adjustment)
  if (open && !wasOpen) {
    setWasOpen(true)
    setDaypart(defaultDaypart)
    setSelectedDays([defaultDayIndex])
    setStartDate(toIsoDate(weekStart))
    setEndDate(toIsoDate(addDays(weekStart, 6)))
  } else if (!open && wasOpen) {
    setWasOpen(false)
  }

  const sponsor = sponsors.find((s) => s.id === sponsorId)
  const sponsorCampaigns = campaigns.filter((c) => c.sponsorId === sponsorId)

  const toggleDay = (index: number) => {
    setSelectedDays((days) =>
      days.includes(index) ? days.filter((d) => d !== index) : [...days, index].sort(),
    )
  }

  const handleBook = () => {
    if (!sponsorId || !campaignId || selectedDays.length === 0) return
    const selectedSponsor = sponsors.find((s) => s.id === sponsorId)
    const selectedCampaign = campaigns.find((c) => c.id === campaignId)
    if (!selectedSponsor || !selectedCampaign) return

    const newSpots: AdSpot[] = []
    const start = fromIsoDate(startDate)
    const end = fromIsoDate(endDate)
    let cursor = new Date(start)
    while (cursor <= end) {
      const dayIdx = mondayIndex(cursor)
      if (selectedDays.includes(dayIdx)) {
        for (let i = 0; i < perDay; i++) {
          newSpots.push({
            id: makeId('spot'),
            sponsorId: selectedSponsor.id,
            sponsorName: selectedSponsor.name,
            campaignId: selectedCampaign.id,
            campaignName: selectedCampaign.name,
            daypart,
            dayOfWeek: cursor.getDay(),
            duration,
            date: toIsoDate(cursor),
            status: 'scheduled',
            notes,
          })
        }
      }
      cursor = addDays(cursor, 1)
    }
    onBook(newSpots)
    onClose()
    setSponsorId('')
    setCampaignId('')
    setSelectedDays([])
    setPerDay(1)
    setNotes('')
  }

  const canBook = Boolean(sponsorId && campaignId && selectedDays.length > 0 && startDate && endDate)
  const estimatedSpots = Math.max(
    1,
    Math.ceil((fromIsoDate(endDate).getTime() - fromIsoDate(startDate).getTime()) / (864e5 * 7)) *
      selectedDays.length *
      perDay,
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#111d32] border-[#2A2A2A]/50 text-one-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-one-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-one-gold" />
            Book Ad Spots
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Sponsor</Label>
            <Select
              value={sponsorId}
              onValueChange={(v) => {
                setSponsorId(v)
                setCampaignId('')
              }}
            >
              <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                <SelectValue placeholder="Select sponsor" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                {sponsors.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-one-white hover:bg-[#2A2A2A]">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Campaign</Label>
            <Select value={campaignId} onValueChange={setCampaignId} disabled={!sponsorId}>
              <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                <SelectValue placeholder={sponsorId ? 'Select campaign' : 'Choose sponsor first'} />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                {sponsorCampaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-one-white hover:bg-[#2A2A2A]">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Daypart</Label>
            <Select value={daypart} onValueChange={(v) => setDaypart(v as DaypartCode)}>
              <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                {DAYPARTS.map((d) => (
                  <SelectItem key={d.code} value={d.code} className="text-one-white hover:bg-[#2A2A2A]">
                    {d.code} — {d.label} ({d.timeRange})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Days of Week</Label>
            <div className="flex gap-2">
              {BOOK_DAY_LABELS.map((label, index) => (
                <button
                  key={label}
                  onClick={() => toggleDay(index)}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all border ${
                    selectedDays.includes(index)
                      ? 'bg-one-gold text-one-navy border-one-gold'
                      : 'bg-[#101010] text-one-white/40 border-[#2A2A2A]/50 hover:border-one-gold/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Spot Duration</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                  {[15, 30, 60].map((d) => (
                    <SelectItem key={d} value={String(d)} className="text-one-white hover:bg-[#2A2A2A]">
                      {d} seconds
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Spots / Day</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={perDay}
                onChange={(e) => setPerDay(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              className="bg-[#101010] border-[#2A2A2A]/50 text-one-white placeholder:text-one-white/20 min-h-[60px]"
            />
          </div>
          {sponsorId && campaignId && selectedDays.length > 0 && (
            <div className="bg-one-gold/10 border border-one-gold/30 rounded-lg p-3 text-xs">
              <p className="text-one-gold font-medium">Will create ~{estimatedSpots} spots</p>
              <p className="text-one-white/50 mt-0.5">
                {sponsor?.name} · {DAYPARTS.find((d) => d.code === daypart)?.label} ·{' '}
                {selectedDays.map((i) => DAY_NAMES_SHORT[i === 6 ? 0 : i + 1]).join(', ')}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button
            onClick={onClose}
            className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={!canBook}
            className="bg-one-gold text-one-navy hover:bg-one-gold/90 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Book Spots
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----------------------------- edit spot dialog ----------------------------

function EditSpotDialog({
  open,
  onClose,
  spot,
  campaigns,
  onSave,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  spot: AdSpot | null
  campaigns: ScheduleCampaign[]
  onSave: (spot: AdSpot) => void
  onDelete: (spotId: string) => void
}) {
  const [status, setStatus] = useState<SpotStatus>('scheduled')
  const [notes, setNotes] = useState('')
  const [prevSpotId, setPrevSpotId] = useState(spot?.id)

  // Load the spot into the form when a different spot is selected
  if (spot && spot.id !== prevSpotId) {
    setPrevSpotId(spot.id)
    setStatus(spot.status)
    setNotes(spot.notes || '')
  }

  if (!spot) return null
  const campaign = campaigns.find((c) => c.id === spot.campaignId)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#111d32] border-[#2A2A2A]/50 text-one-white max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-one-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-one-gold" />
            Edit Spot
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-[#101010] rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-one-white/40">Sponsor</span>
              <span className="text-one-white font-medium">{spot.sponsorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-one-white/40">Campaign</span>
              <span className="text-one-white font-medium" style={{ color: campaign?.color }}>
                {spot.campaignName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-one-white/40">Daypart</span>
              <span className="text-one-white">
                {spot.daypart} — {DAYPARTS.find((d) => d.code === spot.daypart)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-one-white/40">Date</span>
              <span className="text-one-white">
                {fromIsoDate(spot.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-one-white/40">Duration</span>
              <span className="text-one-white">{spot.duration} seconds</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as SpotStatus)}>
              <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                <SelectItem value="scheduled" className="text-one-white hover:bg-[#2A2A2A]">
                  Scheduled
                </SelectItem>
                <SelectItem value="delivered" className="text-one-white hover:bg-[#2A2A2A]">
                  Delivered
                </SelectItem>
                <SelectItem value="cancelled" className="text-one-white hover:bg-[#2A2A2A]">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-one-white/60 text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#101010] border-[#2A2A2A]/50 text-one-white min-h-[60px]"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button
            onClick={() => onDelete(spot.id)}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
          <Button
            onClick={onClose}
            className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({ ...spot, status, notes })
              onClose()
            }}
            className="bg-one-gold text-one-navy hover:bg-one-gold/90"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ------------------------------ campaigns list ------------------------------

function CampaignsList({
  campaigns,
  spots,
  onViewCampaign,
}: {
  campaigns: ScheduleCampaign[]
  spots: AdSpot[]
  onViewCampaign: (campaign: ScheduleCampaign) => void
}) {
  const [search, setSearch] = useState('')
  const filtered = campaigns
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.sponsorName.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      a.status === 'active' && b.status !== 'active' ? -1 : a.status !== 'active' && b.status === 'active' ? 1 : 0,
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-one-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns or sponsors..."
            className="pl-9 bg-[#101010] border-[#2A2A2A]/50 text-one-white placeholder:text-one-white/20"
          />
        </div>
        <Badge className="bg-[#1E293B] text-one-white/60 border-[#2A2A2A]/40">{filtered.length} campaigns</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((campaign, i) => {
          const campaignSpots = spots.filter((s) => s.campaignId === campaign.id)
          const aired = campaignSpots.filter((s) => s.status === 'delivered').length
          const upcoming = campaignSpots.filter((s) => s.status === 'scheduled').length
          const progress = campaign.totalSpots > 0 ? Math.round((campaign.spotsDelivered / campaign.totalSpots) * 100) : 0
          return (
            <motion.div key={campaign.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card
                className="bg-[#111d32]/80 border-[#2A2A2A]/40 cursor-pointer hover:border-[#2A2A2A]/70 transition-all"
                onClick={() => onViewCampaign(campaign)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: campaign.color }} />
                      <div>
                        <h3 className="text-one-white font-semibold text-sm">{campaign.name}</h3>
                        <p className="text-one-white/40 text-xs">{campaign.sponsorName}</p>
                      </div>
                    </div>
                    <Badge
                      className={`text-[10px] ${
                        campaign.status === 'active'
                          ? 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30'
                          : campaign.status === 'completed'
                            ? 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-one-white/40">Delivery Progress</span>
                      <span className="text-one-white/60">
                        {progress}% ({campaign.spotsDelivered}/{campaign.totalSpots})
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#101010] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: campaign.color }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-one-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {fromIsoDate(campaign.startDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} —{' '}
                      {fromIsoDate(campaign.endDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      {aired} aired
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#3B82F6]" />
                      {upcoming} scheduled
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ----------------------------- campaign detail ------------------------------

function CampaignDetail({
  campaign,
  spots,
  onBack,
}: {
  campaign: ScheduleCampaign
  spots: AdSpot[]
  onBack: () => void
}) {
  const campaignSpots = spots.filter((s) => s.campaignId === campaign.id)
  const delivered = campaignSpots.filter((s) => s.status === 'delivered').length
  const scheduled = campaignSpots.filter((s) => s.status === 'scheduled').length
  const progress = campaign.totalSpots > 0 ? Math.round((campaign.spotsDelivered / campaign.totalSpots) * 100) : 0

  const daypartMap = useMemo(() => {
    const map: Record<DaypartCode, { total: number; delivered: number }> = {
      EM: { total: 0, delivered: 0 },
      B: { total: 0, delivered: 0 },
      M: { total: 0, delivered: 0 },
      L: { total: 0, delivered: 0 },
      D: { total: 0, delivered: 0 },
      LN: { total: 0, delivered: 0 },
    }
    campaignSpots.forEach((s) => {
      map[s.daypart].total++
      if (s.status === 'delivered') map[s.daypart].delivered++
    })
    return map
  }, [campaignSpots])

  const statCards = [
    { label: 'Total Spots', value: campaign.totalSpots, icon: <Radio className="w-4 h-4 text-one-gold" /> },
    { label: 'Delivered', value: delivered, icon: <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> },
    { label: 'Scheduled', value: scheduled, icon: <Clock className="w-4 h-4 text-[#3B82F6]" /> },
    { label: 'Progress', value: `${progress}%`, icon: <TrendingUp className="w-4 h-4 text-[#8B5CF6]" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button onClick={onBack} className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h2 className="text-one-white text-xl font-bold flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: campaign.color }} />
            {campaign.name}
          </h2>
          <p className="text-one-white/40 text-sm">{campaign.sponsorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-[#111d32]/80 border-[#2A2A2A]/40">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-one-white/40 text-[10px] font-label uppercase">{stat.label}</span>
              </div>
              <p className="text-one-white text-xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-one-white text-sm">Delivery Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-3 bg-[#101010] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: campaign.color }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-one-white/40">
            <span>0%</span>
            <span>
              {campaign.spotsDelivered} of {campaign.totalSpots} spots delivered
            </span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-one-white text-sm">Daypart Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {DAYPARTS.map((daypart) => {
              const stats = daypartMap[daypart.code]
              if (stats.total === 0) return null
              const pct = Math.round((stats.delivered / stats.total) * 100)
              return (
                <div key={daypart.code}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-one-white/70">
                      {daypart.code} — {daypart.label} ({daypart.timeRange})
                    </span>
                    <span className="text-one-white/40">
                      {stats.delivered}/{stats.total}
                    </span>
                  </div>
                  <div className="h-2 bg-[#101010] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: campaign.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-one-white text-sm">Recent Spots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A]/40 hover:bg-transparent">
                <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Date</TableHead>
                <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Daypart</TableHead>
                <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Duration</TableHead>
                <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignSpots.slice(0, 20).map((spot) => (
                <TableRow key={spot.id} className="border-[#2A2A2A]/30 hover:bg-[#2A2A2A]/10">
                  <TableCell className="text-one-white text-xs">
                    {fromIsoDate(spot.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </TableCell>
                  <TableCell className="text-one-white/70 text-xs">{spot.daypart}</TableCell>
                  <TableCell className="text-one-white/70 text-xs">{spot.duration}s</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${SPOT_STATUS_CLASSES[spot.status]}`}>{spot.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// -------------------------------- all spots --------------------------------

function AllSpots({
  spots,
  campaigns,
  onUpdateSpots,
}: {
  spots: AdSpot[]
  campaigns: ScheduleCampaign[]
  onUpdateSpots: (spots: AdSpot[]) => void
}) {
  const [search, setSearch] = useState('')
  const [sponsorFilter, setSponsorFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [daypartFilter, setDaypartFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const sponsorOptions = useMemo(() => {
    const map = new Map<string, string>()
    spots.forEach((s) => map.set(s.sponsorId, s.sponsorName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [spots])

  const filtered = useMemo(
    () =>
      spots
        .filter((s) => {
          const matchesSearch =
            !search ||
            s.sponsorName.toLowerCase().includes(search.toLowerCase()) ||
            s.campaignName.toLowerCase().includes(search.toLowerCase())
          const matchesSponsor = sponsorFilter === 'all' || s.sponsorId === sponsorFilter
          const matchesCampaign = campaignFilter === 'all' || s.campaignId === campaignFilter
          const matchesDaypart = daypartFilter === 'all' || s.daypart === daypartFilter
          const matchesStatus = statusFilter === 'all' || s.status === statusFilter
          return matchesSearch && matchesSponsor && matchesCampaign && matchesDaypart && matchesStatus
        })
        .sort((a, b) => fromIsoDate(b.date).getTime() - fromIsoDate(a.date).getTime()),
    [spots, search, sponsorFilter, campaignFilter, daypartFilter, statusFilter],
  )

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((s) => s.id)))
  }

  const bulkSetStatus = (status: SpotStatus) => {
    onUpdateSpots(spots.map((s) => (selected.has(s.id) ? { ...s, status } : s)))
    setSelected(new Set())
  }

  const bulkDelete = () => {
    onUpdateSpots(spots.filter((s) => !selected.has(s.id)))
    setSelected(new Set())
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-one-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sponsor or campaign..."
            className="pl-9 bg-[#101010] border-[#2A2A2A]/50 text-one-white placeholder:text-one-white/20"
          />
        </div>
        <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
          <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white w-[160px]">
            <SelectValue placeholder="All Sponsors" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
            <SelectItem value="all" className="text-one-white hover:bg-[#2A2A2A]">
              All Sponsors
            </SelectItem>
            {sponsorOptions.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-one-white hover:bg-[#2A2A2A]">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white w-[160px]">
            <SelectValue placeholder="All Campaigns" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
            <SelectItem value="all" className="text-one-white hover:bg-[#2A2A2A]">
              All Campaigns
            </SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-one-white hover:bg-[#2A2A2A]">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={daypartFilter} onValueChange={setDaypartFilter}>
          <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white w-[120px]">
            <SelectValue placeholder="Daypart" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
            <SelectItem value="all" className="text-one-white hover:bg-[#2A2A2A]">
              All Dayparts
            </SelectItem>
            {DAYPARTS.map((d) => (
              <SelectItem key={d.code} value={d.code} className="text-one-white hover:bg-[#2A2A2A]">
                {d.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
            <SelectItem value="all" className="text-one-white hover:bg-[#2A2A2A]">
              All Status
            </SelectItem>
            <SelectItem value="scheduled" className="text-one-white hover:bg-[#2A2A2A]">
              Scheduled
            </SelectItem>
            <SelectItem value="delivered" className="text-one-white hover:bg-[#2A2A2A]">
              Delivered
            </SelectItem>
            <SelectItem value="cancelled" className="text-one-white hover:bg-[#2A2A2A]">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2 bg-one-gold/10 border border-one-gold/30 rounded-lg"
        >
          <span className="text-one-gold text-xs font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => bulkSetStatus('delivered')}
            className="bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30 border border-[#10B981]/30 h-7 text-xs"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Mark Delivered
          </Button>
          <Button
            size="sm"
            onClick={() => bulkSetStatus('scheduled')}
            className="bg-[#3B82F6]/20 text-[#60A5FA] hover:bg-[#3B82F6]/30 border border-[#3B82F6]/30 h-7 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Mark Scheduled
          </Button>
          <Button
            size="sm"
            onClick={() => bulkSetStatus('cancelled')}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={bulkDelete}
            className="bg-red-500/30 text-red-300 hover:bg-red-500/40 border border-red-500/40 h-7 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </motion.div>
      )}

      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2A2A2A]/40 hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onCheckedChange={toggleAll}
                      className="border-[#2A2A2A]"
                    />
                  </TableHead>
                  <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Sponsor</TableHead>
                  <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Campaign</TableHead>
                  <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Daypart</TableHead>
                  <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Date</TableHead>
                  <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Dur</TableHead>
                  <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-one-white/30 py-8 text-sm">
                      No spots match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((spot) => {
                    const campaign = campaigns.find((c) => c.id === spot.campaignId)
                    return (
                      <TableRow key={spot.id} className="border-[#2A2A2A]/30 hover:bg-[#2A2A2A]/10">
                        <TableCell>
                          <Checkbox
                            checked={selected.has(spot.id)}
                            onCheckedChange={() => toggleOne(spot.id)}
                            className="border-[#2A2A2A]"
                          />
                        </TableCell>
                        <TableCell className="text-one-white text-xs">{spot.sponsorName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: campaign?.color || '#D4A853' }}
                            />
                            <span className="text-one-white/80 text-xs">{spot.campaignName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-one-white/60 text-xs">{spot.daypart}</TableCell>
                        <TableCell className="text-one-white/60 text-xs">
                          {fromIsoDate(spot.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </TableCell>
                        <TableCell className="text-one-white/60 text-xs">{spot.duration}s</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${SPOT_STATUS_CLASSES[spot.status]}`}>{spot.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <p className="text-one-white/30 text-xs">{filtered.length} spots</p>
    </div>
  )
}

// ----------------------------- delivery reports -----------------------------

function DeliveryReports({ spots, campaigns }: { spots: AdSpot[]; campaigns: ScheduleCampaign[] }) {
  const [campaignId, setCampaignId] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return toIsoDate(d)
  })
  const [endDate, setEndDate] = useState(() => toIsoDate(new Date()))

  const report = useMemo(() => {
    if (!campaignId) return null
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return null

    const inRange = spots.filter((s) => s.campaignId === campaignId && s.date >= startDate && s.date <= endDate)
    const total = inRange.length
    const delivered = inRange.filter((s) => s.status === 'delivered').length
    const scheduled = inRange.filter((s) => s.status === 'scheduled').length

    const daypartMap: Record<DaypartCode, { total: number; delivered: number }> = {
      EM: { total: 0, delivered: 0 },
      B: { total: 0, delivered: 0 },
      M: { total: 0, delivered: 0 },
      L: { total: 0, delivered: 0 },
      D: { total: 0, delivered: 0 },
      LN: { total: 0, delivered: 0 },
    }
    inRange.forEach((s) => {
      daypartMap[s.daypart].total++
      if (s.status === 'delivered') daypartMap[s.daypart].delivered++
    })

    const weeklyMap: Record<string, { total: number; delivered: number }> = {}
    inRange.forEach((s) => {
      const weekIso = toIsoDate(startOfWeek(fromIsoDate(s.date)))
      if (!weeklyMap[weekIso]) weeklyMap[weekIso] = { total: 0, delivered: 0 }
      weeklyMap[weekIso].total++
      if (s.status === 'delivered') weeklyMap[weekIso].delivered++
    })

    return { campaign, total, delivered, scheduled, daypartMap, weeklyMap, spots: inRange }
  }, [campaignId, startDate, endDate, spots, campaigns])

  return (
    <div className="space-y-6">
      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Campaign</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-one-white hover:bg-[#2A2A2A]">
                      {c.name} — {c.sponsorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-one-white text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-one-gold" />
                Delivery Report
              </h3>
              <p className="text-one-white/40 text-sm">
                {report.campaign.name} — {report.campaign.sponsorName}
              </p>
            </div>
            <Button
              onClick={() => window.print()}
              className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print / PDF
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Spots', value: report.total, color: 'text-one-white' },
              { label: 'Delivered', value: report.delivered, color: 'text-[#10B981]' },
              { label: 'Scheduled', value: report.scheduled, color: 'text-[#3B82F6]' },
              {
                label: 'Compliance',
                value: report.total > 0 ? `${Math.round((report.delivered / report.total) * 100)}%` : 'N/A',
                color: 'text-one-gold',
              },
            ].map((stat) => (
              <Card key={stat.label} className="bg-[#111d32]/80 border-[#2A2A2A]/40">
                <CardContent className="p-3 text-center">
                  <p className="text-one-white/40 text-[10px] font-label uppercase">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-one-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-one-gold" />
                Daypart Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {DAYPARTS.map((daypart) => {
                  const stats = report.daypartMap[daypart.code]
                  if (stats.total === 0) return null
                  const pct = Math.round((stats.delivered / stats.total) * 100)
                  return (
                    <div key={daypart.code}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-one-white/70 flex items-center gap-1.5">
                          {DAYPART_ICONS[daypart.code]}
                          {daypart.code} — {daypart.label}
                        </span>
                        <span className="text-one-white/40">
                          {stats.delivered}/{stats.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#101010] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-one-gold"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-one-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-one-gold" />
                Weekly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {Object.entries(report.weeklyMap)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([weekIso, stats]) => {
                    const pct = Math.round((stats.delivered / stats.total) * 100)
                    const weekEnd = addDays(fromIsoDate(weekIso), 6)
                    return (
                      <div key={weekIso}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-one-white/60">
                            {fromIsoDate(weekIso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} —{' '}
                            {weekEnd.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-one-white/40">
                            {stats.delivered}/{stats.total}
                          </span>
                        </div>
                        <div className="h-2 bg-[#101010] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-one-white text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-one-gold" />
                Spot Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]/40 hover:bg-transparent">
                      <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Date</TableHead>
                      <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Day</TableHead>
                      <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Daypart</TableHead>
                      <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Duration</TableHead>
                      <TableHead className="text-one-white/40 text-[10px] font-label uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...report.spots]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((spot) => (
                        <TableRow key={spot.id} className="border-[#2A2A2A]/30 hover:bg-[#2A2A2A]/10">
                          <TableCell className="text-one-white text-xs">
                            {fromIsoDate(spot.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-one-white/60 text-xs">
                            {DAY_NAMES_FULL[fromIsoDate(spot.date).getDay()]}
                          </TableCell>
                          <TableCell className="text-one-white/60 text-xs">{spot.daypart}</TableCell>
                          <TableCell className="text-one-white/60 text-xs">{spot.duration}s</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${SPOT_STATUS_CLASSES[spot.status]}`}>{spot.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111d32]/80 border-one-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-one-gold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Certificate of Broadcast Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs space-y-2">
              <p className="text-one-white/60">
                This certifies that <strong className="text-one-white">{report.campaign.sponsorName}</strong> booked{' '}
                <strong className="text-one-white">{report.total}</strong> advertising spots under the{' '}
                <strong className="text-one-white">{report.campaign.name}</strong> campaign, of which{' '}
                <strong className="text-[#10B981]">{report.delivered}</strong> have been broadcast as of{' '}
                {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
              <p className="text-one-white/40">
                Period: {fromIsoDate(startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} —{' '}
                {fromIsoDate(endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-one-white/40">
                Overall compliance rate:{' '}
                <strong className="text-one-gold">
                  {report.total > 0 ? Math.round((report.delivered / report.total) * 100) : 0}%
                </strong>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// ------------------------------- auto-schedule ------------------------------

function AutoSchedule({
  sponsors,
  campaigns,
  onGenerateSpots,
}: {
  sponsors: ScheduleSponsor[]
  campaigns: ScheduleCampaign[]
  onGenerateSpots: (spots: AdSpot[]) => void
}) {
  const [sponsorId, setSponsorId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [duration, setDuration] = useState(30)
  const [startDate, setStartDate] = useState(toIsoDate(new Date()))
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 6)
    return toIsoDate(d)
  })
  const [distribution, setDistribution] = useState<Record<DaypartCode, number>>({
    EM: 1,
    B: 1,
    M: 1,
    L: 0,
    D: 1,
    LN: 0,
  })
  const [preview, setPreview] = useState<AdSpot[] | null>(null)

  const sponsorCampaigns = campaigns.filter((c) => c.sponsorId === sponsorId)

  const generatePreview = () => {
    if (!sponsorId || !campaignId) return
    const sponsor = sponsors.find((s) => s.id === sponsorId)
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!sponsor || !campaign) return

    const rotation = (Object.entries(distribution) as Array<[DaypartCode, number]>)
      .filter(([, count]) => count > 0)
      .flatMap(([code, count]) => Array.from({ length: count }, () => code))
    if (rotation.length === 0) return

    const generated: AdSpot[] = []
    const start = fromIsoDate(startDate)
    const end = fromIsoDate(endDate)
    let cursor = new Date(start)
    let serial = 0
    while (cursor <= end) {
      const dow = cursor.getDay()
      if (dow !== 0) {
        const daypart = rotation[serial % rotation.length]
        generated.push({
          id: makeId('spot_preview'),
          sponsorId: sponsor.id,
          sponsorName: sponsor.name,
          campaignId: campaign.id,
          campaignName: campaign.name,
          daypart,
          dayOfWeek: dow,
          duration,
          date: toIsoDate(cursor),
          status: 'scheduled',
          notes: 'Auto-generated from contract',
        })
        serial++
      }
      cursor = addDays(cursor, 1)
    }
    setPreview(generated)
  }

  const confirmGenerate = () => {
    if (!preview) return
    onGenerateSpots(preview.map((s) => ({ ...s, id: makeId('spot') })))
    setPreview(null)
    setSponsorId('')
    setCampaignId('')
  }

  const previewCount = preview?.length || 0
  const previewByDaypart: Partial<Record<DaypartCode, number>> = preview
    ? preview.reduce<Partial<Record<DaypartCode, number>>>((acc, s) => {
        acc[s.daypart] = (acc[s.daypart] || 0) + 1
        return acc
      }, {})
    : {}

  return (
    <div className="space-y-6">
      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-one-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-one-gold" />
            Auto-Schedule from Contract
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-one-white/40 text-xs">
            Automatically generate spot bookings from a sponsorship contract. Specify the sponsor, campaign, spot count,
            duration, and date range — the system will distribute spots evenly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Sponsor</Label>
              <Select
                value={sponsorId}
                onValueChange={(v) => {
                  setSponsorId(v)
                  setCampaignId('')
                }}
              >
                <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                  <SelectValue placeholder="Select sponsor" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                  {sponsors.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-one-white hover:bg-[#2A2A2A]">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Campaign</Label>
              <Select value={campaignId} onValueChange={setCampaignId} disabled={!sponsorId}>
                <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                  {sponsorCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-one-white hover:bg-[#2A2A2A]">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Duration</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="bg-[#101010] border-[#2A2A2A]/50 text-one-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#2A2A2A]">
                  {[15, 30, 60].map((d) => (
                    <SelectItem key={d} value={String(d)} className="text-one-white hover:bg-[#2A2A2A]">
                      {d}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-one-white/60 text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#101010] border-[#2A2A2A]/50 text-one-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-one-white/60 text-xs">Daypart Distribution (slots per day rotation)</Label>
            <div className="grid grid-cols-6 gap-2">
              {DAYPARTS.map((daypart) => (
                <div key={daypart.code} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-one-gold mb-1">
                    {DAYPART_ICONS[daypart.code]}
                    <span className="text-[10px] font-semibold">{daypart.code}</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={distribution[daypart.code]}
                    onChange={(e) =>
                      setDistribution((prev) => ({
                        ...prev,
                        [daypart.code]: Math.max(0, Math.min(5, Number(e.target.value))),
                      }))
                    }
                    className="bg-[#101010] border-[#2A2A2A]/50 text-one-white text-center h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={generatePreview}
            disabled={!sponsorId || !campaignId}
            className="bg-one-gold text-one-navy hover:bg-one-gold/90 disabled:opacity-50"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview Schedule
          </Button>
        </CardContent>
      </Card>

      {preview && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="bg-[#111d32]/80 border-one-gold/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-one-gold text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Schedule Preview — {previewCount} spots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {DAYPARTS.map((daypart) => (
                  <div key={daypart.code} className="bg-[#101010] rounded-lg p-2 text-center">
                    <p className="text-one-gold text-lg font-bold">{previewByDaypart[daypart.code] || 0}</p>
                    <p className="text-one-white/30 text-[10px]">{daypart.code}</p>
                  </div>
                ))}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A]/40 hover:bg-transparent">
                      <TableHead className="text-one-white/40 text-[10px]">Date</TableHead>
                      <TableHead className="text-one-white/40 text-[10px]">Daypart</TableHead>
                      <TableHead className="text-one-white/40 text-[10px]">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(0, 30).map((spot) => (
                      <TableRow key={spot.id} className="border-[#2A2A2A]/30 hover:bg-[#2A2A2A]/10">
                        <TableCell className="text-one-white/70 text-xs">
                          {fromIsoDate(spot.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </TableCell>
                        <TableCell className="text-one-white/70 text-xs">{spot.daypart}</TableCell>
                        <TableCell className="text-one-white/70 text-xs">{spot.duration}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {preview.length > 30 && (
                  <p className="text-one-white/30 text-xs text-center py-2">...and {preview.length - 30} more spots</p>
                )}
              </div>
              <Button onClick={confirmGenerate} className="bg-one-gold text-one-navy hover:bg-one-gold/90 w-full">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Confirm & Generate {previewCount} Spots
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// ------------------------------ programme guide -----------------------------

/** Sort key from a programme's start time (e.g. "6:00am – 9:00am"). */
function programmeSortKey(entry: ProgrammeEntry): number {
  const match = entry.time.match(/^(\d{1,2}):(\d{2})(am|pm)/i)
  if (!match) return 9 * 60 // unparsable blocks ("Saturday daytime") sit mid-morning
  let hours = Number(match[1]) % 12
  if (match[3].toLowerCase() === 'pm') hours += 12
  return hours * 60 + Number(match[2])
}

function ProgrammeGuide({ spots }: { spots: AdSpot[] }) {
  // Mon..Sun display order.
  const dayOrder = [1, 2, 3, 4, 5, 6, 0]

  const sponsorsByDayAndDaypart = useMemo(() => {
    const map = new Map<string, Set<string>>()
    spots.forEach((s) => {
      if (s.status === 'cancelled') return
      const key = `${s.dayOfWeek}:${s.daypart}`
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)?.add(s.sponsorName)
    })
    return map
  }, [spots])

  const sponsorsForEntry = (entry: ProgrammeEntry): string[] => {
    const names = new Set<string>()
    entry.dayparts.forEach((dp) => {
      sponsorsByDayAndDaypart.get(`${entry.day}:${dp}`)?.forEach((n) => names.add(n))
    })
    return Array.from(names)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-one-white/40 text-[10px] font-label uppercase tracking-wider">Categories</span>
            {(Object.entries(PROGRAMME_CATEGORY_META) as Array<[ProgrammeCategory, { label: string; color: string }]>).map(
              ([key, meta]) => (
                <span key={key} className="flex items-center gap-1.5 text-xs text-one-white/60">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label}
                </span>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dayOrder.map((day, i) => {
          const entries = PROGRAMME_GUIDE.filter((p) => p.day === day).sort(
            (a, b) => programmeSortKey(a) - programmeSortKey(b),
          )
          return (
            <motion.div key={day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-one-white text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-one-gold" />
                    {DAY_NAMES_FULL[day]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {entries.map((entry) => {
                    const meta = PROGRAMME_CATEGORY_META[entry.category]
                    const slotSponsors = sponsorsForEntry(entry)
                    return (
                      <div
                        key={entry.id}
                        className="rounded-lg border p-2.5"
                        style={{ backgroundColor: `${meta.color}10`, borderColor: `${meta.color}30` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-one-white text-xs font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                              {entry.show}
                            </p>
                            <p className="text-one-white/40 text-[11px] mt-0.5 flex items-center gap-1">
                              <Mic className="w-3 h-3" />
                              {entry.presenter}
                            </p>
                          </div>
                          <span className="text-one-white/50 text-[10px] whitespace-nowrap">{entry.time}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {entry.dayparts.map((dp) => (
                            <Badge key={dp} className="bg-[#101010] text-one-gold border-[#2A2A2A]/50 text-[9px] px-1.5 py-0">
                              {dp}
                            </Badge>
                          ))}
                          {slotSponsors.slice(0, 2).map((name) => (
                            <Badge key={name} className="bg-one-gold/10 text-one-gold/80 border-one-gold/20 text-[9px] px-1.5 py-0">
                              {name}
                            </Badge>
                          ))}
                          {slotSponsors.length > 2 && (
                            <span className="text-one-white/30 text-[9px]">+{slotSponsors.length - 2} sponsors</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="bg-[#111d32]/80 border-one-gold/30 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-one-gold text-sm flex items-center gap-2">
                <Music className="w-4 h-4" />
                Super Saturday Lineup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {SATURDAY_SPORTS_LINEUP.map((show) => (
                <div key={show.name} className="rounded-lg bg-[#101010] border border-[#2A2A2A]/40 p-2.5">
                  <p className="text-one-white text-xs font-semibold">{show.name}</p>
                  <p className="text-one-white/40 text-[11px] mt-0.5">{show.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-[#111d32]/80 border-[#2A2A2A]/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-one-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-one-gold" />
            Sales Dayparts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DAYPARTS.map((daypart) => (
              <div key={daypart.code} className="rounded-lg bg-[#101010] border border-[#2A2A2A]/40 p-3">
                <div className="flex items-center gap-1.5 text-one-gold mb-1">
                  {DAYPART_ICONS[daypart.code]}
                  <span className="text-[11px] font-semibold">
                    {daypart.code} — {daypart.label}
                  </span>
                </div>
                <p className="text-one-white/60 text-xs">{daypart.timeRange}</p>
                <p className="text-one-white/30 text-[11px] mt-0.5">{daypart.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ------------------------------ main component ------------------------------

type ScheduleTab = 'schedule' | 'programme' | 'campaigns' | 'spots' | 'reports' | 'auto'

export default function BroadcastSchedule() {
  const [tab, setTab] = useState<ScheduleTab>('schedule')
  const [weekOffset, setWeekOffset] = useState(0)
  const [spots, setSpots] = usePersistentState<AdSpot[]>(
    opsStorageKey('onefm_schedule_spots'),
    opsInitial(INITIAL_SPOTS, []),
  )
  const [campaigns] = usePersistentState<ScheduleCampaign[]>(
    opsStorageKey('onefm_schedule_campaigns'),
    opsInitial(SEED_CAMPAIGNS, []),
  )
  const [sponsors] = usePersistentState<ScheduleSponsor[]>(
    opsStorageKey('onefm_schedule_sponsors'),
    opsInitial(SEED_SPONSORS, []),
  )
  const [bookOpen, setBookOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingSpot, setEditingSpot] = useState<AdSpot | null>(null)
  const [bookDayIndex, setBookDayIndex] = useState(0)
  const [bookDaypart, setBookDaypart] = useState<DaypartCode>('B')
  const [selectedCampaign, setSelectedCampaign] = useState<ScheduleCampaign | null>(null)

  const currentWeekStart = startOfWeek(new Date())
  const weekStart = addDays(currentWeekStart, weekOffset * 7)
  const weekEnd = addDays(weekStart, 6)

  const openBookDialog = (dayIndex: number, daypart: DaypartCode) => {
    setBookDayIndex(dayIndex)
    setBookDaypart(daypart)
    setBookOpen(true)
  }

  const openEditDialog = (spot: AdSpot) => {
    setEditingSpot(spot)
    setEditOpen(true)
  }

  const handleBook = (newSpots: AdSpot[]) => {
    setSpots((prev) => [...prev, ...newSpots])
  }

  const handleSaveSpot = (spot: AdSpot) => {
    setSpots((prev) => prev.map((s) => (s.id === spot.id ? spot : s)))
  }

  const handleDeleteSpot = (spotId: string) => {
    setSpots((prev) => prev.filter((s) => s.id !== spotId))
    setEditOpen(false)
  }

  const tabs: Array<{ id: ScheduleTab; label: string; icon: React.ReactNode }> = [
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'programme', label: 'Programme Guide', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'spots', label: 'All Spots', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Delivery Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'auto', label: 'Auto-Schedule', icon: <Zap className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-one-white text-2xl md:text-3xl font-h1 flex items-center gap-2">
            <Radio className="w-6 h-6 text-one-gold" />
            Broadcast Schedule
          </h2>
          <p className="text-one-white/40 text-sm mt-0.5">Manage ad spots, campaigns, and delivery reports</p>
        </div>
        {tab === 'schedule' && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40 h-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setWeekOffset(0)}
              className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40 h-9 text-xs"
            >
              Today
            </Button>
            <div className="px-3 py-1.5 bg-[#101010] border border-[#2A2A2A]/40 rounded-lg">
              <span className="text-one-white text-xs font-medium">{formatWeekRange(weekStart, weekEnd)}</span>
            </div>
            <Button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="bg-[#1E293B] text-one-white/70 hover:bg-[#1E293B]/80 border border-[#2A2A2A]/40 h-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => openBookDialog(0, 'B')}
              className="bg-one-gold text-one-navy hover:bg-one-gold/90 h-9 text-xs ml-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Book Spot
            </Button>
          </div>
        )}
      </motion.div>

      {tab === 'schedule' && <WeekStats spots={spots} campaigns={campaigns} weekStart={weekStart} weekEnd={weekEnd} />}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as ScheduleTab)
          setSelectedCampaign(null)
        }}
      >
        <TabsList className="bg-[#111d32] border border-[#2A2A2A]/40 p-1 gap-1">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-one-gold data-[state=active]:text-one-navy data-[state=inactive]:text-one-white/50 data-[state=inactive]:hover:text-one-white/70"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab + (selectedCampaign?.id || '')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'schedule' && (
            <WeekGrid
              weekStart={weekStart}
              spots={spots}
              campaigns={campaigns}
              onCellClick={openBookDialog}
              onSpotClick={openEditDialog}
            />
          )}
          {tab === 'programme' && <ProgrammeGuide spots={spots} />}
          {tab === 'campaigns' &&
            (selectedCampaign ? (
              <CampaignDetail campaign={selectedCampaign} spots={spots} onBack={() => setSelectedCampaign(null)} />
            ) : (
              <CampaignsList
                campaigns={campaigns}
                spots={spots}
                onViewCampaign={(c) => {
                  setSelectedCampaign(c)
                  setTab('campaigns')
                }}
              />
            ))}
          {tab === 'spots' && <AllSpots spots={spots} campaigns={campaigns} onUpdateSpots={setSpots} />}
          {tab === 'reports' && <DeliveryReports spots={spots} campaigns={campaigns} />}
          {tab === 'auto' && (
            <AutoSchedule sponsors={sponsors} campaigns={campaigns} onGenerateSpots={(s) => setSpots((prev) => [...prev, ...s])} />
          )}
        </motion.div>
      </AnimatePresence>

      <BookSpotDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBook={handleBook}
        sponsors={sponsors}
        campaigns={campaigns}
        defaultDayIndex={bookDayIndex}
        defaultDaypart={bookDaypart}
        weekStart={weekStart}
      />
      <EditSpotDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        spot={editingSpot}
        campaigns={campaigns}
        onSave={handleSaveSpot}
        onDelete={handleDeleteSpot}
      />
    </div>
  )
}

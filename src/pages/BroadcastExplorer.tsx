import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Search, Grid3X3, List, ChevronDown,
  ChevronLeft, ChevronRight, Radio, Globe, Smartphone,
  Headphones, Sparkles, Calendar,
  Instagram, Twitter, Music, ArrowRight
} from 'lucide-react'
import { WordReveal } from '@/components/WordReveal'
import { TiltCard } from '@/components/TiltCard'
import { Marquee } from '@/components/Marquee'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { Link } from 'react-router-dom'
import { PageJobsBar, type PageJob } from '@/components/PageJobsBar'
import { HOST_PHOTOS, STATION_PHOTOS } from '@/lib/stationPhotos'
import {
  FULL_SCHEDULE,
  PROGRAM_PREVIEW_CARDS,
  ALL_PRESENTERS,
  getCurrentLiveShow,
  getBreakfastScheduleLabel,
} from '@/data/programGuide'
import { useLiveStream } from '@/hooks/useLiveStream'

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: '#F2F2F2',
  Music: '#9B5DE5',
  Community: '#B6FF00',
  Sport: '#E51636',
  Multicultural: '#FF6B6B',
  Country: '#F2F2F2',
}

/** programGuide day (0=Sun) → grid day index (0=Mon) */
function toExplorerDay(pgDay: number) {
  return pgDay === 0 ? 6 : pgDay - 1
}

function formatHour(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

const SHOWS = FULL_SCHEDULE.map((slot, i) => {
  const endDisplay = slot.endHour === 24 ? '24:00' : formatHour(slot.endHour)
  const duration =
    slot.endHour > slot.startHour
      ? slot.endHour - slot.startHour
      : 24 - slot.startHour + slot.endHour
  return {
    id: `show-${slot.day}-${slot.startHour}-${i}`,
    name: slot.name,
    hosts: slot.host,
    time: `${formatHour(slot.startHour)}–${endDisplay}`,
    duration,
    start: slot.startHour,
    day: toExplorerDay(slot.day),
    category: slot.category === 'Sport' ? 'Sports' : slot.category,
    color: CATEGORY_COLORS[slot.category] ?? '#B6FF00',
    desc: `${slot.name} with ${slot.host}. Source: fm985.com.au/guide/`,
  }
})

const HOST_AVATARS: Record<string, string> = {
  Morning:    STATION_PHOTOS.commentaryBoxAction,
  Daytime:    STATION_PHOTOS.studioCommentarySelfie,
  Afternoon:  STATION_PHOTOS.commentaryBoxWide,
  Evening:    HOST_PHOTOS.onAirHost2,
  Weekend:    STATION_PHOTOS.gvlNightPanorama,
  Specialist: STATION_PHOTOS.studioSbsDiversity,
}

const HOSTS = ALL_PRESENTERS.map((p) => ({
  name: p.name,
  role: p.show,
  shows: [p.show],
  avatar: HOST_AVATARS[p.shift] ?? STATION_PHOTOS.studioCommentarySelfie,
  shift: p.shift,
}))

const SEGMENTS = PROGRAM_PREVIEW_CARDS.map((card, i) => ({
  id: String(i + 1).padStart(2, '0'),
  name: card.title,
  duration: card.schedule,
  category: card.title.includes('Breakfast') ? 'Breakfast' : 'Program',
  desc: card.description,
  stats: { editions: 'Weekly', avg: card.schedule, source: 'fm985.com.au' },
}))

const SHOW_CARDS = PROGRAM_PREVIEW_CARDS.slice(0, 6).map((card) => {
  const cat = card.title.includes('Breakfast')
    ? 'Breakfast'
    : card.title.includes('Sport') || card.title.includes('GVL') || card.title.includes('AFL')
      ? 'Sport'
      : card.title.includes('Multicultural') || card.title.includes('Samoan') || card.title.includes('Punjabi')
        ? 'Multicultural'
        : card.title.includes('Country')
          ? 'Music'
          : card.title.includes('Community') || card.title.includes('James Manley')
            ? 'Community'
            : 'Music'
  return {
    name: card.title,
    host: card.presenter,
    schedule: card.schedule,
    desc: card.description,
    tags: [cat, 'Live'],
    color: CATEGORY_COLORS[cat] ?? '#B6FF00',
    category: cat,
  }
})

const BROADCAST_JOBS: PageJob[] = [
  { label: 'Listen Live', path: '/listen', description: 'Stream now', icon: Headphones, accent: '#E51636' },
  { label: 'Program Guide', path: '/programs', description: 'Shows & hosts', icon: Calendar, accent: '#F2F2F2' },
  { label: 'Coverage', path: '/coverage', description: 'Broadcast area', icon: Globe, accent: '#1B458F' },
  { label: 'GVL Sport', path: '/football', description: 'Saturday coverage', icon: Sparkles, accent: '#B6FF00' },
]

/* ─── Deterministic gradient avatar ─── */
const AVATAR_PALETTES = [
  { from: '#1B458F', to: '#071D3A', accent: '#F2F2F2' },
  { from: '#F2F2F2', to: '#1B3A6F', accent: '#FFF8DC' },
  { from: '#E51636', to: '#1A0A20', accent: '#FF9BAA' },
  { from: '#B6FF00', to: '#0A2030', accent: '#7FFFD4' },
  { from: '#9B5DE5', to: '#1A0A30', accent: '#DDB3FF' },
  { from: '#FF6B6B', to: '#2A0A10', accent: '#FFB3B3' },
  { from: '#1B458F', to: '#0D2A18', accent: '#6EE7B7' },
]

function getPresenterAvatar(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 37 + name.charCodeAt(i)) >>> 0
  const palette = AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
  const words = name.trim().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
  const initials = words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[words.length - 1][0]).toUpperCase()
  return { ...palette, initials }
}

/* ─── Easing helpers ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── Data ─── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIME_FILTERS = [
  { label: 'All Day', value: 'all' },
  { label: 'Morning (6–12)', value: 'morning' },
  { label: 'Afternoon (12–18)', value: 'afternoon' },
  { label: 'Evening (18–24)', value: 'evening' },
  { label: 'Overnight (0–6)', value: 'overnight' },
]

/* ─── Live Waveform Canvas ─── */
const LiveWaveform = memo(function LiveWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      t += 0.015
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Active spectrum bars
      const barCount = 120
      const barWidth = canvas.width / barCount
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth
        const noise = Math.sin(i * 0.3 + t * 3) * Math.cos(i * 0.1 - t * 2)
        const height = Math.abs(noise) * canvas.height * 0.45 + Math.random() * canvas.height * 0.1
        const hue = 30 + Math.sin(i * 0.05 + t) * 20
        ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${0.15 + Math.abs(noise) * 0.2})`
        ctx.fillRect(x, (canvas.height - height) / 2, barWidth - 1, height)
      }

      // Signal Red accent waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        const yBase = canvas.height * 0.5 + (i - 1) * 30
        for (let x = 0; x < canvas.width; x += 3) {
          const amp = 40 + i * 20
          const freq = 0.005 + i * 0.002
          const phase = t * 2 + i * 1.5
          const y = yBase + Math.sin(x * freq + phase) * amp
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(230, 57, 70, ${0.08 - i * 0.02})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
})

/* ─── Section 1: Hero — Live Status ─── */
function HeroSection() {
  const live = getCurrentLiveShow()
  const stream = useLiveStream()

  return (
    <section className="relative overflow-hidden bg-[#071D3A]" style={{ height: '50vh', minHeight: 480 }} data-cursor-label="ON AIR NOW">
      <div aria-hidden className="grain-overlay" />
      <LiveWaveform />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-20" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: easeOutBack }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-one-red/90 text-one-white font-label mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-ivory opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ivory" />
          </span>
          ON AIR NOW
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easeOutExpo }}
          className="font-h1 text-one-white mb-3 text-center"
          style={{ textShadow: '0 0 40px rgba(212,150,58,0.3)', fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}
        >
          {live.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-h3 text-one-white mb-2 text-center"
        >
          with {live.host}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-label text-one-electric mb-4"
        >
          {live.time}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => void stream.toggle()}
            data-cursor-label={stream.playing ? 'PAUSE' : 'LISTEN LIVE'}
            className="btn-primary text-xs inline-flex items-center gap-2"
          >
            {stream.playing ? <Pause size={14} /> : <Play size={14} />}
            {stream.playing ? 'Pause' : 'Listen Live'}
          </button>
          <Link to="/programs" data-cursor-label="PROGRAMS" className="btn-secondary text-xs">
            Program Guide
          </Link>
        </motion.div>

        <TiltCard maxTilt={4} className="w-full max-w-md mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease: easeOutExpo }}
          className="glass-card px-5 py-3 flex items-center gap-4"
        >
          <div className="font-micro text-muted">UP NEXT</div>
          <div className="flex-1">
            <div className="font-body-small text-one-white">{live.upNext}</div>
          </div>
          <ArrowRight size={16} className="text-one-gold" />
        </motion.div>
        </TiltCard>
      </div>
    </section>
  )
}

/* ─── Section 2: Interactive Schedule ─── */
function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0)
  const [timeFilter, setTimeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const filteredShows = useMemo(() => {
    let shows = SHOWS.filter((s) => s.day === activeDay)
    if (timeFilter !== 'all') {
      const ranges: Record<string, [number, number]> = {
        morning: [6, 12], afternoon: [12, 18], evening: [18, 24], overnight: [0, 6],
      }
      const [min, max] = ranges[timeFilter]
      shows = shows.filter((s) => s.start >= min && s.start < max)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      shows = shows.filter((s) => s.name.toLowerCase().includes(q) || s.hosts.toLowerCase().includes(q))
    }
    return shows
  }, [activeDay, timeFilter, search])

  return (
    <section className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="SCHEDULE GRID">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex flex-wrap items-center gap-3 mb-8 sticky top-[72px] z-30 bg-[#071D3A]/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-xl"
        >
          {/* Day selector */}
          <div className="flex gap-1 flex-wrap">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setActiveDay(i)}
                data-cursor-label={day.toUpperCase()}
                className={`px-3 py-1.5 rounded-full font-label text-[11px] transition-all duration-200 ${
                  activeDay === i ? 'bg-one-gold text-one-navy' : 'border border-one-border text-muted hover:text-one-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Time filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-cursor-label="FILTER"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-one-border font-label text-[11px] text-muted hover:text-one-white transition-colors"
            >
              {TIME_FILTERS.find((f) => f.value === timeFilter)?.label}
              <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOutBack }}
                  className="absolute top-full left-0 mt-1 glass-card z-40 min-w-[180px] py-2"
                >
                  {TIME_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setTimeFilter(f.value); setDropdownOpen(false) }}
                      data-cursor-label={f.label.toUpperCase()}
                      className={`block w-full text-left px-4 py-2 font-label text-[11px] transition-colors ${
                        timeFilter === f.value ? 'text-one-gold' : 'text-muted hover:text-one-white hover:bg-one-gold/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              data-cursor-label="GRID"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-one-gold/20 text-one-gold' : 'text-muted hover:text-one-white'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              data-cursor-label="LIST"
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-one-gold/20 text-one-gold' : 'text-muted hover:text-one-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search shows, hosts, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[240px] pl-8 pr-3 py-1.5 rounded-lg bg-one-navy border border-one-border font-body-small text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold text-sm"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key={`grid-${activeDay}-${timeFilter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-x-auto"
            >
              {/* Time header */}
              <div className="flex border-b border-one-border mb-2 min-w-[800px]">
                <div className="w-20 shrink-0" />
                {Array.from({ length: 12 }, (_, i) => i * 2).map((h) => (
                  <div key={h} className="flex-1 font-label text-[10px] text-muted py-2 text-center">
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Day row */}
              <div className="relative min-w-[800px]" style={{ height: 80 }}>
                {/* Time slots background */}
                <div className="absolute inset-0 flex">
                  <div className="w-20 shrink-0 border-r border-one-border flex items-center justify-center">
                    <span className="font-label text-[10px] text-muted">{DAYS[activeDay]}</span>
                  </div>
                  <div className="flex-1 relative">
                    {/* Current time indicator (includes minutes for precision) */}
                    {(() => {
                      const now = new Date()
                      const pct = ((now.getHours() + now.getMinutes() / 60) / 24) * 100
                      return (
                        <div className="absolute top-0 bottom-0 w-px bg-one-gold z-20" style={{ left: `${pct}%` }}>
                          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-one-gold animate-pulse" />
                        </div>
                      )
                    })()}

                    {/* Show blocks */}
                    {filteredShows.map((show, i) => (
                      <motion.div
                        key={show.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3, ease: easeOutExpo }}
                        whileHover={{ scale: 1.03, zIndex: 10 }}
                        className="absolute rounded-md overflow-hidden cursor-pointer group"
                        style={{
                          left: `${(show.start / 24) * 100}%`,
                          width: `${(show.duration / 24) * 100}%`,
                          top: 8,
                          bottom: 8,
                          backgroundColor: show.color + '22',
                          borderLeft: `3px solid ${show.color}`,
                        }}
                      >
                        <div aria-hidden className="explore-tile-scan" />
                        <div className="px-2 py-1 h-full flex flex-col justify-center">
                          <div className="font-h4 text-one-white text-sm truncate">{show.name}</div>
                          <div className="font-micro text-muted">{show.time}</div>
                          <div className="font-micro text-muted truncate">{show.hosts}</div>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-one-navy/90 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-center px-3">
                          <div className="font-h4 text-one-white text-sm">{show.name}</div>
                          <div className="font-body-small text-one-white text-xs mt-1 line-clamp-2">{show.desc}</div>
                          <div className="font-micro text-one-gold mt-2">{show.hosts}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`list-${activeDay}-${timeFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {filteredShows.map((show, i) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg border border-one-border hover:border-one-gold/30 transition-colors"
                  style={{ borderLeftWidth: 3, borderLeftColor: show.color }}
                >
                  <div className="w-24 font-label text-[11px] text-muted shrink-0">{show.time}</div>
                  <div className="flex-1">
                    <div className="font-h4 text-one-white text-sm">{show.name}</div>
                    <div className="font-body-small text-muted text-xs">{show.hosts}</div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full font-label text-[10px] shrink-0 border"
                    style={{
                      color: show.color,
                      backgroundColor: `${show.color}18`,
                      borderColor: `${show.color}30`,
                    }}
                  >
                    {show.category}
                  </span>
                  <div className="font-label text-[10px] text-muted w-16 shrink-0">{show.duration}h</div>
                  <ArrowRight size={14} className="text-muted shrink-0" />
                </motion.div>
              ))}
              {filteredShows.length === 0 && (
                <div className="text-center py-12 font-body-small text-muted">No shows found for this filter.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ─── Section 3: Show Spotlight ─── */
function ShowSpotlight() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  return (
    <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="FEATURED SHOWS">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Featured show */}
        <TiltCard maxTilt={2} className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="glass-card overflow-hidden group"
        >
          <div className="flex flex-col md:flex-row" style={{ minHeight: 400 }}>
            <div className="md:w-[45%] relative overflow-hidden">
              <img
                src="/assets/images/commentary-box-action.jpg"
                alt="ONE FM Breakfast"
                className="w-full h-full object-cover md:absolute md:inset-0 group-hover:scale-105 transition-transform duration-700"
                style={{ maxHeight: 400 }}
              />
              <div aria-hidden className="explore-tile-scan" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-data-violet/90 text-one-white font-label text-[10px]">
                BREAKFAST
              </div>
            </div>
            <div className="md:w-[55%] p-6 md:p-8 flex flex-col justify-center">
              <WordReveal text="ONE FM BREAKFAST" className="font-h2 text-one-white mb-3 block" as="h2" stagger={0.05} />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-one-gold/30 flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1B458F 0%, #F2F2F2 100%)' }}>
                  <span className="font-heading font-black text-sm text-one-white/90 leading-none select-none" style={{ letterSpacing: '-0.04em' }}>OB</span>
                </div>
                <div>
                  <div className="font-h4 text-one-white">Rotating hosts</div>
                  <div className="font-label text-one-gold text-[10px]">MON–FRI 6AM–9AM</div>
                </div>
              </div>
              <div className="font-label text-one-gold mb-4">{getBreakfastScheduleLabel()}</div>
              <p className="font-body text-one-white mb-6 line-clamp-3">
                Community interviews, local news, and music across the Goulburn Valley. The essential morning companion for the Valley.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['NEWS', 'MUSIC', 'TALK', 'LIVE CALLS'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-one-border font-label text-muted text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <Link to="/listen" data-cursor-label="LISTEN" className="btn-primary text-xs">Listen Live</Link>
                <Link to="/programs" data-cursor-label="PROGRAMS" className="btn-secondary text-xs">Program Guide</Link>
              </div>
            </div>
          </div>
        </motion.div>
        </TiltCard>

        {/* Carousel header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-h3 text-one-white">More Shows</h3>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} data-cursor-label="PREV" className="w-8 h-8 rounded-full bg-one-gold/20 flex items-center justify-center text-one-gold hover:bg-one-gold/40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll('right')} data-cursor-label="NEXT" className="w-8 h-8 rounded-full bg-one-gold/20 flex items-center justify-center text-one-gold hover:bg-one-gold/40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {SHOW_CARDS.map((show, i) => (
            <TiltCard key={show.name} maxTilt={6} className="shrink-0 snap-start" style={{ width: 280, minHeight: 340 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
              data-cursor-label="SHOW"
              className="glass-card overflow-hidden cursor-pointer group h-full"
            >
              <div className="relative h-[180px] overflow-hidden">
                {/* Gradient feature visual derived from category color */}
                <div
                  className="absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                  style={{ background: `linear-gradient(135deg, ${show.color}33 0%, #04101F 60%)` }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="font-heading font-black select-none opacity-20"
                    style={{ fontSize: '5rem', color: show.color, letterSpacing: '-0.04em' }}
                  >
                    FM
                  </span>
                </div>
                <div aria-hidden className="explore-tile-scan" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md font-label text-[10px] text-one-white" style={{ backgroundColor: show.color + 'CC' }}>
                  {show.category || 'MUSIC'}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-h4 text-one-white mb-2">{show.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const av = getPresenterAvatar(show.host)
                    return (
                      <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${av.from} 0%, ${av.to} 100%)` }}>
                        <span className="font-heading font-black text-[8px] leading-none select-none" style={{ color: av.accent }}>
                          {av.initials}
                        </span>
                      </div>
                    )
                  })()}
                  <span className="font-body-small text-muted text-xs">{show.host}</span>
                </div>
                <div className="font-label text-muted text-[10px] mb-3">{show.schedule}</div>
                <div className="h-1 rounded-full" style={{ backgroundColor: show.color }} />
              </div>
            </motion.div>
            </TiltCard>
          ))}
        </div>

        <div className="text-right mt-4">
          <Link to="/programs" data-cursor-label="SHOWS" className="inline-flex items-center gap-1 font-label text-one-gold text-xs hover:text-one-gold transition-colors link-hover">
            View All Shows <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Section 4: Host Roster ─── */
function HostRoster() {
  const [hostFilter, setHostFilter] = useState('All Hosts')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const filters = ['All Hosts', 'Morning', 'Daytime', 'Evening', 'Weekend', 'Specialist']

  const filteredHosts = hostFilter === 'All Hosts'
    ? HOSTS
    : HOSTS.filter((h) => h.shift === hostFilter)

  return (
    <section className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="MEET THE VOICES">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <WordReveal text="MEET THE VOICES" className="font-h2 text-one-white mb-2 block" as="h2" />
            <p className="font-body-small text-muted">16 real presenters behind the microphone</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-cursor-label="FILTER"
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card font-label text-[11px] text-muted hover:text-one-white transition-colors"
            >
              {hostFilter}
              <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOutBack }}
                  className="absolute top-full right-0 mt-1 glass-card z-40 min-w-[160px] py-2"
                >
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => { setHostFilter(f); setDropdownOpen(false) }}
                      data-cursor-label={f.toUpperCase()}
                      className={`block w-full text-left px-4 py-2 font-label text-[11px] transition-colors ${
                        hostFilter === f ? 'text-one-gold' : 'text-muted hover:text-one-white hover:bg-one-gold/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredHosts.map((host, i) => (
              <motion.div
                key={host.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                whileHover={{ y: -4 }}
                data-cursor-label="PRESENTER"
                className="group"
              >
                {(() => {
                  const av = getPresenterAvatar(host.name)
                  return (
                    <div className="relative mb-4 mx-auto rounded-2xl overflow-hidden border-2 border-one-gold/30 group-hover:border-one-gold transition-colors duration-300 group-hover:scale-105 transition-transform duration-500" style={{ width: 200, height: 200 }}>
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${av.from} 0%, ${av.to} 100%)` }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-heading font-black select-none"
                          style={{ fontSize: '3.5rem', color: av.accent, opacity: 0.9, letterSpacing: '-0.04em' }}
                        >
                          {av.initials}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-one-navy/40 via-transparent to-transparent" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.15)' }} />
                    </div>
                  )
                })()}
                <h3 className="font-h3 text-one-white text-center group-hover:translate-x-1 transition-transform duration-300">{host.name}</h3>
                <div className="font-label text-one-muted text-[10px] text-center mt-1">{host.role}</div>
                <div className="font-body-small text-muted text-xs text-center mt-2">{host.shows.join(', ')}</div>
                <div className="flex justify-center gap-3 mt-3 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Twitter size={14} className="text-muted hover:text-one-white transition-colors cursor-pointer" />
                  <Instagram size={14} className="text-muted hover:text-one-white transition-colors cursor-pointer" />
                  <Music size={14} className="text-muted hover:text-one-white transition-colors cursor-pointer" />
                </div>
                <div className="text-center mt-3">
                  <Link to="/programs" data-cursor-label="PROGRAMS" className="font-label text-one-gold text-[10px] hover:text-one-gold transition-colors link-hover">View Programs →</Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 5: Segment Deep-Dive ─── */
function SegmentDeepDive() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-surface-peak section-bleed-top section-padding" data-cursor-label="SIGNATURE SEGMENTS">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="mb-10"
        >
          <WordReveal text="SIGNATURE SEGMENTS" className="font-h2 text-one-white mb-2 block" as="h2" />
          <p className="font-body-small text-muted">What makes ONE FM unmissable</p>
        </motion.div>

        <div className="space-y-0">
          {SEGMENTS.map((seg, i) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: easeOutExpo }}
              className="border-b border-one-border"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                data-cursor-label={openIndex === i ? 'CLOSE' : 'EXPAND'}
                className={`w-full flex items-center gap-4 py-5 px-2 transition-colors duration-200 ${
                  openIndex === i ? 'bg-one-gold/5' : 'hover:bg-one-gold/[0.02]'
                }`}
              >
                <span className="font-label text-one-gold text-sm w-8">{seg.id}</span>
                <span className={`font-h3 flex-1 text-left transition-colors ${openIndex === i ? 'text-one-gold' : 'text-one-white'}`}>
                  {seg.name}
                </span>
                <span className="font-label text-muted text-[10px] hidden sm:block">{seg.duration}</span>
                <span className="px-2 py-0.5 rounded-full border border-one-border font-label text-[10px] text-muted hidden sm:block">
                  {seg.category}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: easeOutBack }}
                >
                  <ChevronDown size={16} className="text-muted" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: easeOutExpo }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-6 pl-14">
                      <p className="font-body text-one-white mb-4 max-w-2xl">{seg.desc}</p>
                      <div className="flex flex-wrap gap-6 mb-4">
                        <div>
                          <div className="font-stat text-gold-gradient" style={{ fontSize: '2rem' }}>{seg.stats.editions}</div>
                          <div className="font-label text-muted text-[10px]">EDITIONS</div>
                        </div>
                        <div>
                          <div className="font-stat text-one-gold" style={{ fontSize: '1.1rem' }}>{seg.stats.avg}</div>
                          <div className="font-label text-muted text-[10px]">SCHEDULE</div>
                        </div>
                        <div>
                          <div className="font-stat text-one-gold" style={{ fontSize: '1.1rem' }}>{seg.stats.source}</div>
                          <div className="font-label text-muted text-[10px]">SOURCE</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button data-cursor-label="PREVIEW" className="w-8 h-8 rounded-full bg-one-gold flex items-center justify-center text-one-navy hover:scale-105 transition-transform">
                          <Play size={14} />
                        </button>
                        <span className="font-label text-muted text-[10px]">PREVIEW</span>
                        <Link to="/broadcast" data-cursor-label="SCHEDULE" className="ml-4 font-label text-one-gold text-[10px] hover:text-one-gold transition-colors link-hover">
                          See Full Schedule →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 6: Behind the Scenes ─── */
function BehindTheScenes() {
  return (
    <section className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="BEHIND THE MIC">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="relative flex flex-col gap-3"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={STATION_PHOTOS.commentaryTeamUniform}
                alt="ONE FM broadcast team in the commentary box"
                className="w-full object-cover hover:scale-[1.03] transition-transform duration-700"
                style={{ height: 300 }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="font-micro text-one-white/80">The ONE FM team — ready to call the game</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={STATION_PHOTOS.commentaryCallAction}
                alt="ONE FM commentator calling the game live"
                className="w-full object-cover hover:scale-[1.03] transition-transform duration-700"
                style={{ height: 170 }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="font-micro text-one-white/80">Calling the game — live from the ground</p>
              </div>
            </div>
          </motion.div>

          <div>
            <WordReveal text="BEHIND THE MIC" className="font-h2 text-one-white mb-6 block" as="h2" />
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: easeOutExpo }}
              className="font-body text-one-white mb-8"
            >
              ONE FM 98.5 — Callsign 3ONE, ACMA License 1385226/1, licensed by APRA AMCOS. Our state-of-the-art broadcast facility combines professional audio equipment with community-focused programming. From the early morning breakfast show to late-night multicultural programs, we're the heartbeat of the Goulburn Valley.
            </motion.p>

            <div className="space-y-4 mb-8">
              {[
                { title: 'Live Community Programming', desc: 'Real local voices, real local stories' },
                { title: 'HD Broadcast Suite', desc: 'Crystal-clear transmission across 100km radius' },
                { title: 'Live Stream Infrastructure', desc: 'Global reach, local heart' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: easeOutExpo }}
                  className="glass-card p-4 flex items-center gap-4 hover:border-one-gold/30 transition-colors cursor-default group relative overflow-hidden"
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="w-10 h-10 rounded-lg bg-one-gold/20 flex items-center justify-center text-one-gold shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="font-h4 text-one-white text-sm">{item.title}</div>
                    <div className="font-body-small text-muted text-xs">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/contact" data-cursor-label="CONTACT" className="btn-secondary text-xs">Tour the Studio</Link>
              <Link to="/heritage" data-cursor-label="HERITAGE" className="inline-flex items-center gap-1 font-label text-one-gold text-xs hover:text-one-gold transition-colors pt-3 link-hover">
                View Station Heritage →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Section 7: Listen Live / CTA ─── */
function ListenLiveCTA() {
  const platforms = [
    { name: 'FM 98.5', icon: <Radio size={24} /> },
    { name: 'Web', icon: <Globe size={24} /> },
    { name: 'iOS', icon: <Smartphone size={24} /> },
    { name: 'Android', icon: <Smartphone size={24} /> },
    { name: 'Alexa', icon: <Headphones size={24} /> },
  ]

  return (
    <section className="relative bg-surface-glow section-bleed-top section-padding overflow-hidden" data-cursor-label="LISTEN LIVE">
      {/* Decorative spectrum bars at bottom */}
      <div aria-hidden className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-25 pointer-events-none h-24">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="w-2 rounded-t-sm bg-one-electric animate-waveform motion-reduce:animate-none"
            style={{
              height: `${20 + ((i * 41 + 11) % 61)}px`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.8 + ((i * 19 + 3) % 13) / 20}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[600px] mx-auto px-4 sm:px-6 text-center relative z-10">
        <WordReveal text="TUNE IN ANYWHERE" className="font-h2 text-one-white mb-4 block" as="h2" />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-body text-one-white mb-10"
        >
          FM 98.5 · Stream online · iOS &amp; Android · Smart speakers · Ask Alexa
        </motion.p>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: easeOutBack }}
              whileHover={{ scale: 1.05 }}
              className="glass-card w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-one-gold/10 transition-colors group"
            >
              <div className="text-muted group-hover:text-one-gold transition-colors">{p.icon}</div>
              <span className="font-label text-[9px] text-muted group-hover:text-one-gold transition-colors">{p.name}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5, ease: easeOutBack }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-one-gold animate-ping opacity-30" />
            <button className="relative w-20 h-20 rounded-full bg-one-gold flex items-center justify-center text-one-navy hover:scale-105 transition-transform" data-cursor-label="PLAY">
              <Play size={32} fill="currentColor" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-one-red" />
            </span>
            <span className="font-label text-one-red text-xs">LIVE</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function BroadcastExplorer() {
  return (
    <Layout>
      <SEO title="Broadcast Explorer" description="Explore ONE FM 98.5's full program schedule with real presenters, shows, and GVL football broadcasts. Callsign 3ONE, ACMA License 1385226/1." />
      <HeroSection />

      {/* ── Broadcast Marquee Strip ── */}
      <div className="bg-[#04101F] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={34}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">LIVE &amp; LOCAL · 24/7</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">BREAKFAST · MUSIC · SPORT · CULTURE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">CALLSIGN 3ONE · SINCE 1989</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">GVL FOOTBALL LIVE COMMENTARY</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">ACMA LICENSE 1385226/1 · COMMUNITY RADIO</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">ETHNIC &amp; MULTICULTURAL PROGRAMS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">REAL VOICES · REAL STORIES</span>,
          ]}
        />
      </div>

      <PageJobsBar jobs={BROADCAST_JOBS} className="py-4 bg-one-navy border-b border-one-border/40" />
      <ScheduleSection />
      <ShowSpotlight />
      <HostRoster />
      <SegmentDeepDive />
      <BehindTheScenes />
      <ListenLiveCTA />
    </Layout>
  )
}

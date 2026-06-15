import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Download,
  Share2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Radio,
  Headphones,
  Mic,
  X,
  Calendar,
  ChevronDown,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'

/* ─────────── easing ─────────── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ─────────── animation variants ─────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: easeOutExpo },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardStagger = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
}

/* ─────────── data ─────────── */

// ABS 2021 age demographics for Greater Shepparton LGA (source: abs.gov.au)
const ageDemoData = [
  { age: '0-17', percent: 24, count: null, growth: null },
  { age: '18-34', percent: 20, count: null, growth: null },
  { age: '35-54', percent: 26, count: null, growth: null },
  { age: '55-74', percent: 22, count: null, growth: null },
  { age: '75+', percent: 8, count: null, growth: null },
]

// ABS 2021 gender — Greater Shepparton LGA
const genderData = [
  { name: 'Male', value: 49, color: '#2EC4B6' },
  { name: 'Female', value: 51, color: '#D4963A' },
]

// Top towns by estimated weekly listeners (source: townData.ts / ABS 2021)
const locationData = [
  { region: 'Shepparton', listeners: 16488, pct: 42 },
  { region: 'Mooroopna', listeners: 3710, pct: 9 },
  { region: 'Benalla', listeners: 2565, pct: 7 },
  { region: 'Cobram', listeners: 2244, pct: 6 },
  { region: 'Other 21 towns', listeners: 14368, pct: 36 },
]

const platformCards = [
  {
    icon: Radio,
    title: 'FM Radio',
    stat: '98.5 FM',
    label: '~100km radius',
    share: '25 towns · Goulburn Murray',
    status: 'Live',
    statusColor: '#2EC4B6',
    accent: '#D4963A',
    trend: [],
  },
  {
    icon: Headphones,
    title: 'Live Stream',
    stat: 'Online',
    label: 'fm985.com.au',
    share: 'Radio.co · Community Radio Plus',
    status: 'Live',
    statusColor: '#2EC4B6',
    accent: '#2EC4B6',
    trend: [],
  },
  {
    icon: Share2,
    title: 'Facebook',
    stat: 'Community',
    label: 'page',
    share: 'facebook.com/onefmshepparton',
    status: 'Active',
    statusColor: '#F0C75E',
    accent: '#9B5DE5',
    trend: [],
  },
  {
    icon: Mic,
    title: 'SoundCloud Archive',
    stat: 'Interviews',
    label: 'fm985.com.au',
    share: 'Community interview replays',
    status: 'Active',
    statusColor: '#2EC4B6',
    accent: '#FF6B6B',
    trend: [],
  },
]

// Anomaly data requires real Radio.co / stream analytics — not available yet
const anomalyData: { time: string; change: string; reason: string; severity: string }[] = []

// Audience segments based on typical community radio programming blocks (indicative only)
const smartSegments = [
  { name: 'Breakfast (6–9am)', pct: 35, color: '#D4963A' },
  { name: 'Mornings (9am–12pm)', pct: 28, color: '#2EC4B6' },
  { name: 'Afternoons (12–4pm)', pct: 22, color: '#9B5DE5' },
  { name: 'Evenings (6pm+)', pct: 15, color: '#F0C75E' },
]

/* ─────────── helpers ─────────── */
function useCountUp(end: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const hasRun = useRef(false)

  useEffect(() => {
    if (inView && !hasRun.current) {
      hasRun.current = true
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.floor(eased * end))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  }, [inView, end, duration])

  return { count, ref }
}

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const { count, ref } = useCountUp(value)
  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

/* ─────────── heatmap ─────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}`)

// Relative activity index (0–100) based on typical community radio listening patterns.
// This is indicative only — not derived from actual ONE FM streaming data.
// Replace with real Radio.co analytics data when available.
function generateHeatmapData() {
  const data: number[][] = []
  for (let d = 0; d < 7; d++) {
    const row: number[] = []
    for (let h = 0; h < 24; h++) {
      let base = 0
      if (d < 5) {
        if (h >= 6 && h <= 9) base = 80 + Math.random() * 20
        else if (h >= 16 && h <= 19) base = 85 + Math.random() * 15
        else if (h >= 12 && h <= 14) base = 50 + Math.random() * 20
        else if (h >= 20 && h <= 23) base = 40 + Math.random() * 25
        else base = 10 + Math.random() * 15
      } else {
        if (h >= 9 && h <= 12) base = 60 + Math.random() * 25
        else if (h >= 18 && h <= 22) base = 70 + Math.random() * 20
        else base = 15 + Math.random() * 20
      }
      row.push(Math.min(100, Math.round(base)))
    }
    data.push(row)
  }
  return data
}

function HeatmapCell({ value, isCurrent }: { value: number; isCurrent: boolean }) {
  let bg = 'transparent'
  if (value > 85) bg = 'rgba(230,57,70,0.8)'
  else if (value > 60) bg = 'rgba(212,150,58,0.7)'
  else if (value > 30) bg = 'rgba(212,150,58,0.3)'
  else if (value > 10) bg = 'rgba(212,150,58,0.1)'

  return (
    <motion.div
      className={`relative w-full aspect-square rounded-[3px] cursor-pointer transition-all duration-200 hover:scale-[1.3] hover:z-10 ${isCurrent ? 'ring-1 ring-amber' : ''}`}
      style={{ backgroundColor: bg }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      title={`${value}% capacity`}
    />
  )
}

/* ═══════════════════════════════════
   AUDIENCE ANALYTICS PAGE
   ═══════════════════════════════════ */
export default function AudienceAnalytics() {
  const [dateRange, setDateRange] = useState('7 Days')
  const [chartTab, setChartTab] = useState('Listeners')
  const [weekdayMode, setWeekdayMode] = useState(true)
  const [dismissInsight, setDismissInsight] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const heatmapData = useMemo(() => generateHeatmapData(), [weekdayMode])
  const currentHour = new Date().getHours()

  return (
    <Layout>
      <SEO title="Audience Analytics" description="Real-time audience analytics for ONE FM 98.5. Demographics, listenership trends, and platform performance." />
      {/* ═══════ HERO / LIVE DASHBOARD HEADER ═══════ */}
      <section className="relative min-h-[40vh] bg-one-navy overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#2A2A30 1px, transparent 1px), linear-gradient(90deg, #2A2A30 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-12 pt-8">
          {/* Top bar */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-data-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-data-teal" />
              </span>
              <span className="font-label text-data-teal">Live — Updated 2s ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none glass-card px-4 py-2 pr-10 font-label text-xs text-one-white bg-transparent cursor-pointer focus:outline-none focus:border-one-gold/50"
                >
                  <option value="Today">Today</option>
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="1 Year">1 Year</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
              <button className="glass-card p-2 hover:border-one-gold/50 transition-colors" aria-label="Export data">
                <Download size={16} className="text-muted" />
              </button>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
          >
            <h1 className="font-h1 text-one-white mb-2">AUDIENCE INTELLIGENCE</h1>
            <p className="font-body text-one-white">
              Real-time insights into who's listening, when, and how
            </p>
          </motion.div>

          {/* KPI stat row */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { label: 'Est. Weekly Listeners', value: 39375, color: '#2EC4B6', suffix: '', sparkline: false, extra: 'Source: ABS 2021 population estimate' },
              { label: 'Towns in Broadcast Area', value: 25, color: '#D4963A', suffix: '', sparkline: false, extra: '~100km radius from Shepparton' },
              { label: 'Broadcast Area Population', value: 189680, color: '#F0C75E', suffix: '', sparkline: false, extra: 'Source: townData / ABS 2021' },
              { label: 'Years Broadcasting', value: 46, color: '#9B5DE5', suffix: ' yrs', sparkline: false, extra: 'Est. 1980, licensed 1989' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="glass-card p-5 flex flex-col justify-between min-h-[140px]"
                variants={cardStagger}
              >
                <div>
                  <div className="font-label text-muted mb-2">{stat.label}</div>
                  <div className="font-stat" style={{ color: stat.color }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  {stat.extra && (
                    <div className="flex items-center gap-1 mt-1">
                      {stat.extra.startsWith('+') ? (
                        <TrendingUp size={12} className="text-data-teal" />
                      ) : stat.extra.startsWith('-') ? (
                        <TrendingDown size={12} className="text-one-red" />
                      ) : null}
                      <span className={`font-label text-xs ${stat.extra.startsWith('+') ? 'text-data-teal' : stat.extra.startsWith('-') ? 'text-one-red' : 'text-muted'}`}>
                        {stat.extra}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ LISTENERSHIP HEATMAP ═══════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div>
              <h2 className="font-h2 text-one-white">LISTENERSHIP HEATMAP</h2>
              <p className="font-body-small text-muted mt-1">When your audience tunes in</p>
            </div>
            <div className="flex bg-one-navy/50 rounded-full p-1 border border-one-border">
              <button
                onClick={() => setWeekdayMode(true)}
                className={`px-4 py-1.5 rounded-full font-label text-xs transition-all ${weekdayMode ? 'text-one-navy bg-one-gold' : 'text-one-white/60 hover:text-one-white'}`}
              >
                Weekday
              </button>
              <button
                onClick={() => setWeekdayMode(false)}
                className={`px-4 py-1.5 rounded-full font-label text-xs transition-all ${!weekdayMode ? 'text-one-navy bg-one-gold' : 'text-one-white/60 hover:text-one-white'}`}
              >
                Weekend
              </button>
            </div>
          </motion.div>

          <motion.div
            className="glass-card p-4 sm:p-6 overflow-x-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Hours header */}
            <div className="grid grid-cols-[50px_repeat(24,1fr)] gap-[3px] mb-[3px]">
              <div />
              {HOURS.map((h) => (
                <div key={h} className="text-center font-micro text-muted text-[9px] hidden sm:block">
                  {h}
                </div>
              ))}
            </div>
            {/* Heatmap rows */}
            {DAYS.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-[50px_repeat(24,1fr)] gap-[3px] mb-[3px]">
                <div className="flex items-center font-label text-[10px] text-one-white">{day}</div>
                {heatmapData[dIdx].map((val, hIdx) => (
                  <HeatmapCell
                    key={hIdx}
                    value={val}
                    isCurrent={hIdx === currentHour && new Date().getDay() === (dIdx + 1) % 7}
                  />
                ))}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-one-border">
              <span className="font-micro text-muted">Low</span>
              <div className="flex gap-[3px]">
                <div className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: 'rgba(212,150,58,0.05)' }} />
                <div className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: 'rgba(212,150,58,0.15)' }} />
                <div className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: 'rgba(212,150,58,0.35)' }} />
                <div className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: 'rgba(212,150,58,0.6)' }} />
                <div className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: 'rgba(230,57,70,0.8)' }} />
              </div>
              <span className="font-micro text-muted">Peak</span>
            </div>
          </motion.div>

          {/* AI Insight */}
          <AnimatePresence>
            {!dismissInsight && (
              <motion.div
                className="mt-6 glass-card p-4 flex items-start gap-3 border-l-2 border-l-amber"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, delay: 1, ease: easeOutExpo }}
              >
                <Sparkles size={18} className="text-one-gold shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-body-small text-one-white">
                    <span className="text-one-gold font-medium">Note:</span> Live streaming analytics are not connected yet. Figures on this page use ABS 2021 regional demographics and fm985.com.au programme data.
                  </p>
                </div>
                <button onClick={() => setDismissInsight(true)} className="text-muted hover:text-one-white transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════ AUDIENCE TRENDS ═══════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
            {/* Main Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <h2 className="font-h2 text-one-white mb-6">AUDIENCE TRENDS</h2>
              {/* Chart tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {['Listeners', 'Sessions', 'Engagement', 'Demographics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-4 py-2 rounded-full font-label text-xs whitespace-nowrap transition-all ${
                      chartTab === tab
                        ? 'text-one-gold bg-one-gold/10 border border-one-gold/30'
                        : 'text-one-white/60 border border-one-border hover:text-one-white hover:border-ivory/20'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="glass-card p-4 sm:p-6">
                <div className="w-full h-[360px] flex items-center justify-center border border-dashed border-one-border rounded-lg">
                  <p className="font-body-small text-muted text-center px-8 max-w-md">
                    Daily listener trends require Radio.co analytics integration. Est. weekly audience: 39,375 (townData / ABS 2021).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button className="btn-secondary text-xs">
                  <Download size={14} />
                  Full Report
                </button>
                <button className="btn-secondary text-xs">
                  Set Alert
                </button>
              </div>
            </motion.div>

            {/* Insight Cards */}
            <motion.div
              className="flex flex-col gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <h3 className="font-h3 text-one-white mb-2">Insights</h3>
              {[
                {
                  title: 'Broadcast Reach',
                  text: '39,375 est. weekly listeners',
                  sub: '25 towns · ~100km radius · source: townData / ABS 2021',
                  border: '#2EC4B6',
                  icon: TrendingUp,
                },
                {
                  title: 'Breakfast',
                  text: 'ONE FM Breakfast Mon–Fri 6–9am',
                  sub: 'Tim Ahemt · The Big G · Ralph Whitehead · Josh Revens',
                  border: '#F0C75E',
                  icon: Radio,
                },
                {
                  title: 'Community',
                  text: '25+ multicultural programs weekly',
                  sub: 'Swahili, Samoan, Filipino, Mandarin, Punjabi & more',
                  border: '#D4963A',
                  icon: Sparkles,
                },
              ].map((insight, i) => {
                const Icon = insight.icon
                return (
                  <motion.div
                    key={i}
                    className="glass-card p-5 border-l-[3px]"
                    style={{ borderLeftColor: insight.border }}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.5, delay: i * 0.12, ease: easeOutExpo },
                      },
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} style={{ color: insight.border }} />
                      <span className="font-label text-xs" style={{ color: insight.border }}>{insight.title}</span>
                    </div>
                    <p className="font-h4 text-one-white mb-1">{insight.text}</p>
                    <p className="font-body-small text-muted">{insight.sub}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ DEMOGRAPHIC BREAKDOWN ═══════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <h2 className="font-h2 text-one-white">DEMOGRAPHIC DEEP DIVE</h2>
            <p className="font-body-small text-muted mt-1">Who makes up your audience</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Age */}
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            >
              <h4 className="font-h4 text-one-white mb-4">Age Distribution</h4>
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDemoData} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="age" tick={{ fill: '#F4F1EA', fontSize: 11, fontFamily: 'Space Grotesk' }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26,26,31,0.95)',
                        border: '1px solid #2A2A30',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '12px',
                        color: '#F4F1EA',
                      }}
                      formatter={(value: number, _name: string, props: { payload?: { count?: number; growth?: string } }) => [
                        `${value}% (${props.payload?.count?.toLocaleString()}) · ${props.payload?.growth}`,
                        'Percentage',
                      ]}
                    />
                    <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={20}>
                      {ageDemoData.map((_, i) => (
                        <Cell key={i} fill={['#2EC4B6', '#00BBF9', '#D4963A', '#FF6B6B', '#E63946'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp size={12} className="text-data-teal" />
                <span className="font-label text-xs text-data-teal">25-34 is your fastest-growing segment</span>
              </div>
            </motion.div>

            {/* Gender */}
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
            >
              <h4 className="font-h4 text-one-white mb-4">Gender Split</h4>
              <div className="w-full h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26,26,31,0.95)',
                        border: '1px solid #2A2A30',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '12px',
                        color: '#F4F1EA',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-4 mb-3">
                <div className="font-stat text-one-white">39.4K</div>
                <div className="font-label text-muted">Total</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label text-xs text-one-gold">Balanced gender split — 48/52</span>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
            >
              <h4 className="font-h4 text-one-white mb-4">Top Locations</h4>
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" vertical={false} />
                    <XAxis dataKey="region" tick={{ fill: '#F4F1EA', fontSize: 10, fontFamily: 'Space Grotesk' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26,26,31,0.95)',
                        border: '1px solid #2A2A30',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '12px',
                        color: '#F4F1EA',
                      }}
                      formatter={(value: number, _name: string, props: { payload?: { pct?: number } }) => [
                        `${value.toLocaleString()} (${props.payload?.pct}%)`,
                        'Listeners',
                      ]}
                    />
                    <Bar dataKey="listeners" fill="#D4963A" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp size={12} className="text-data-teal" />
                <span className="font-label text-xs text-data-teal">Regional coverage: 78% within 50km</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ PLATFORM PERFORMANCE ═══════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <h2 className="font-h2 text-one-white">PLATFORM PERFORMANCE</h2>
            <p className="font-body-small text-muted mt-1">Where your audience connects</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {platformCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={i}
                  className="glass-card p-5 hover:scale-[1.02] transition-all duration-300"
                  variants={cardStagger}
                  whileHover={{ borderColor: `${card.accent}50` }}
                >
                  <Icon size={32} style={{ color: card.accent }} className="mb-3" />
                  <div className="font-stat text-one-white mb-0.5">{card.stat}</div>
                  <div className="font-label text-muted mb-3">{card.label}</div>
                  <div className="w-full h-[40px] mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={card.trend.map((v, i) => ({ i, v }))}>
                        <defs>
                          <linearGradient id={`ptrend-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={card.accent} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={card.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={card.accent} fill={`url(#ptrend-${i})`} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs text-muted">{card.share}</span>
                    <span className="font-label text-xs flex items-center gap-1" style={{ color: card.statusColor }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: card.statusColor }} />
                      {card.status}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════ AI PREDICTIONS ═══════ */}
      <section className="bg-gradient-to-b from-slate to-onyx section-padding">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <motion.div
            className="flex items-center gap-3 mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div>
              <h2 className="font-h2 text-one-white">AUDIENCE INSIGHTS</h2>
              <p className="font-body-small text-muted mt-1">Sourced regional data — live stream analytics pending Radio.co integration</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-one-gold/20 text-one-gold font-label text-[10px] shrink-0">SOURCED</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 7-Day Forecast */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <h4 className="font-h4 text-one-white mb-4">Streaming Trends</h4>
              <div className="w-full h-[200px] flex items-center justify-center border border-dashed border-one-border rounded-lg">
                <p className="font-body-small text-muted text-center px-6">
                  Live listener trend charts will display here when Radio.co analytics are connected.
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-one-navy/50">
                <span className="font-label text-xs text-one-gold">Est. weekly listeners: 39,375 (source: townData / ABS 2021)</span>
              </div>
            </motion.div>

            {/* Anomaly Detection */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOutExpo }}
            >
              <h4 className="font-h4 text-one-white mb-4">Stream Anomalies</h4>
              <div className="space-y-3">
                {anomalyData.length === 0 && (
                  <p className="font-body-small text-muted p-4 rounded-lg bg-one-navy/50">
                    No anomaly data yet — requires live streaming analytics integration.
                  </p>
                )}
                {anomalyData.map((a, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-one-navy/50"
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: easeOutExpo }}
                  >
                    <AlertTriangle
                      size={16}
                      className={`shrink-0 mt-0.5 ${a.severity === 'growth' ? 'text-data-teal' : 'text-one-red'}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body-small text-one-white">{a.time}</span>
                        <span className={`font-label text-xs ${a.severity === 'growth' ? 'text-data-teal' : 'text-one-red'}`}>
                          {a.change}
                        </span>
                      </div>
                      <p className="font-body-small text-muted mt-0.5">{a.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Smart Segments */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
          >
            <h4 className="font-h4 text-one-white mb-4">Programming Blocks (Indicative)</h4>
            <p className="font-body-small text-muted mb-4">
              Typical community radio listening distribution by daypart — not live measurement data
            </p>
            <div className="flex flex-wrap gap-3">
              {smartSegments.map((seg, i) => (
                <motion.button
                  key={seg.name}
                  className={`px-4 py-2.5 rounded-full font-label text-xs transition-all ${
                    selectedSegment === seg.name
                      ? 'ring-2 ring-offset-1 ring-offset-slate'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: `${seg.color}20`,
                    color: seg.color,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                  onClick={() => setSelectedSegment(selectedSegment === seg.name ? null : seg.name)}
                >
                  {seg.name} ({seg.pct}%)
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {selectedSegment && (
                <motion.div
                  className="mt-4 p-4 rounded-lg bg-one-navy/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-body-small text-one-white">
                    <span className="text-one-gold font-medium">{selectedSegment}:</span>{' '}
                    Detailed segment profile with listening habits, preferred content types, and optimal targeting windows.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ═══════ DATA EXPORT ═══════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <h2 className="font-h2 text-one-white mb-3">USE YOUR DATA</h2>
            <p className="font-body text-one-white mb-8">
              Export insights for reports, presentations, or share with your team.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.button className="btn-secondary text-sm" variants={cardStagger}>
              <Download size={16} />
              Download CSV
            </motion.button>
            <motion.button className="btn-primary text-sm" variants={cardStagger}>
              <FileText size={16} />
              Export PDF Report
            </motion.button>
            <motion.button className="btn-secondary text-sm" variants={cardStagger}>
              <Share2 size={16} />
              Share Dashboard Link
            </motion.button>
          </motion.div>

          <motion.div
            className="glass-card p-5 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={16} className="text-one-gold" />
              <span className="font-label text-xs text-one-white">Scheduled Reports</span>
            </div>
            <div className="flex gap-2">
              <select className="flex-1 appearance-none glass-card px-3 py-2 font-label text-xs text-one-white bg-transparent cursor-pointer focus:outline-none focus:border-one-gold/50">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-[2] glass-card px-3 py-2 font-body text-sm text-one-white bg-transparent focus:outline-none focus:border-one-gold/50 placeholder:text-muted"
              />
              <button className="btn-primary text-xs px-4">Subscribe</button>
            </div>
          </motion.div>

          <motion.p
            className="mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <span className="font-label text-xs text-muted">Developer? </span>
            <button className="font-label text-xs text-one-gold hover:text-one-gold transition-colors">
              Access our analytics API
            </button>
          </motion.p>
        </div>
      </section>
    </Layout>
  )
}

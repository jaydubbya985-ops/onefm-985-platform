import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Radio,
  Headphones,
  Mic,
  X,
  AlertTriangle,
} from 'lucide-react'
import {
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
import { WordReveal } from '@/components/WordReveal'
import { TiltCard } from '@/components/TiltCard'
import { Marquee } from '@/components/Marquee'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { SEO } from '@/components/SEO'
import { towns } from '@/data/townData'
import {
  broadcastPopulationCount,
  coverageNumbers,
  formatBroadcastPopulation,
  formatCoverageShort,
  formatRadius,
  formatTowns,
  formatWeeklyListenersPlain,
  townsCount,
  weeklyListenersCount,
  yearsBroadcastingValue,
} from '@/lib/coverageCopy'
import {
  BREAKFAST_SHOW,
  BREAKFAST_TIME,
  MULTICULTURAL_PROGRAM_COUNT,
  MULTICULTURAL_PROGRAMS,
  getBreakfastScheduleLabel,
} from '@/data/programGuide'

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
  { name: 'Male', value: 49, color: '#B6FF00' },
  { name: 'Female', value: 51, color: '#D4963A' },
]

// Top towns by estimated weekly listeners (source: townData.ts / ABS 2021).
// Do not invent a remainder bucket against formatWeeklyListenersPlain() — town
// estimates sum to a different figure (see scripts/audit-town-data.ts).
const locationData = [...towns]
  .sort((a, b) => b.listenersEstimate - a.listenersEstimate)
  .slice(0, 5)
  .map((t) => ({ region: t.name, listeners: t.listenersEstimate }))

const platformCards = [
  {
    icon: Radio,
    title: 'FM Radio',
    stat: '98.5 FM',
    label: `${formatRadius()} radius`,
    share: `${formatTowns()} · Goulburn Murray`,
    status: 'On air',
    statusColor: '#B6FF00',
    accent: '#D4963A',
  },
  {
    icon: Headphones,
    title: 'Live Stream',
    stat: 'Online',
    label: 'fm985.com.au',
    share: 'Radio.co stream via fm985.com.au',
    status: 'Analytics pending',
    statusColor: '#F0C75E',
    accent: '#B6FF00',
  },
  {
    icon: Share2,
    title: 'Facebook',
    stat: 'Community',
    label: 'page',
    share: 'facebook.com/onefmshepparton',
    status: 'Link only — no follower count',
    statusColor: '#F0C75E',
    accent: '#9B5DE5',
  },
  {
    icon: Mic,
    title: 'SoundCloud Archive',
    stat: 'Interviews',
    label: 'fm985.com.au',
    share: 'Community interview replays',
    status: 'Archive — no play counts',
    statusColor: '#F0C75E',
    accent: '#FF6B6B',
  },
]

// No invented lift/drop %. Empty until Radio.co (or a sourced station survey) exists.
const anomalyData: { time: string; change: string; reason: string; severity: string }[] = []

/* ─────────── helpers ─────────── */

/* ═══════════════════════════════════
   AUDIENCE ANALYTICS PAGE
   ═══════════════════════════════════ */
export default function AudienceAnalytics() {
  const [chartTab, setChartTab] = useState('Listeners')
  const [dismissInsight, setDismissInsight] = useState(false)

  return (
    <Layout>
      <SEO title="Audience Analytics" description={`Modelled audience insights for ONE FM 98.5 — demographics, listenership trends and coverage across ${formatTowns()}. Live stream analytics pending Radio.co integration.`} />
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[40vh] bg-surface-deep overflow-hidden" data-cursor-label="AUDIENCE">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#2A2A30 1px, transparent 1px), linear-gradient(90deg, #2A2A30 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div aria-hidden className="grain-overlay" />

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
              <span className="font-label text-one-gold/80">Modelled — not live listener counts. Radio.co pending.</span>
              <div className="flex items-end gap-[2px]" aria-hidden style={{ height: 12 }}>
                {[3, 6, 9, 6, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-sm"
                    style={{
                      height: h,
                      backgroundColor: 'rgba(46,196,182,0.7)',
                      animation: `freq-bar ${0.7 + i * 0.11}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="font-label text-[10px] tracking-[0.18em] text-muted">
              ABS 2021 model · not a date-filtered live dashboard
            </p>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
          >
            <WordReveal text="AUDIENCE INTELLIGENCE" className="font-h1 text-one-white mb-2 block" as="h1" stagger={0.04} />
            <p className="font-body text-one-white">
              Modelled audience for the {formatCoverageShort()} broadcast area (ABS 2021 via townData). Live stream counts: data pending.
            </p>
          </motion.div>

          {/* KPI stat row */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            data-cursor-label="KEY METRICS"
          >
            {[
              { label: 'Est. Weekly Listeners', value: weeklyListenersCount(), color: '#B6FF00', suffix: '', sparkline: false, extra: 'Source: ABS 2021 population estimate' },
              { label: 'Towns in Broadcast Area', value: townsCount(), color: '#D4963A', suffix: '', sparkline: false, extra: `${formatRadius()} radius from Shepparton` },
              { label: 'Broadcast Area Population', value: broadcastPopulationCount(), color: '#F0C75E', suffix: '', sparkline: false, extra: `Source: ABS 2021 · ${formatTowns()}` },
              { label: 'Years Broadcasting', value: coverageNumbers.yearsBroadcasting, color: '#9B5DE5', suffix: ' yrs', sparkline: false, extra: 'Licensed 1989 · callsign 3ONE' },
            ].map((stat) => (
              <TiltCard key={stat.label} maxTilt={5} className="flex flex-col min-h-[140px]">
              <motion.div
                className="glass-card p-5 flex flex-col justify-between h-full group relative overflow-hidden"
                variants={cardStagger}
              >
                <div aria-hidden className="explore-tile-scan" />
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
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Analytics Marquee Strip ── */}
      <div className="bg-[#070707] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={30}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">MODELLED AUDIENCE · ABS 2021</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{formatWeeklyListenersPlain()} EST. WEEKLY LISTENERS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">DEMOGRAPHICS · REACH · PERFORMANCE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{formatCoverageShort().toUpperCase()}</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">ABS 2021 POPULATION · LICENSED 1989</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{formatBroadcastPopulation()} BROADCAST AREA POPULATION</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">ABS 2021 · NOT LIVE STREAM COUNTS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{yearsBroadcastingValue()} YEARS ON AIR · 98.5 FM SHEPPARTON</span>,
          ]}
        />
      </div>

      {/* ═══════ LISTENERSHIP HEATMAP ═══════ */}
      <section className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="HEATMAP">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <WordReveal text="HOUR-BY-HOUR LISTENING" className="font-h2 text-one-white block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mt-1">
              A heatmap of when people listen is data pending until Radio.co stream analytics are connected. We will not publish a typical-pattern grid as if it were ONE FM data.
            </p>
          </motion.div>

          {/* AI Insight */}
          <AnimatePresence>
            {!dismissInsight && (
              <motion.div
                className="mt-6 glass-card p-4 flex items-start gap-3 border-l-2 border-l-one-gold"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, delay: 1, ease: easeOutExpo }}
              >
                <Sparkles size={18} className="text-one-gold shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-body-small text-one-white">
                    <span className="text-one-gold font-medium">Data source:</span> Figures on this page use ABS 2021 regional demographics and fm985.com.au programme data. Live Radio.co stream analytics will auto-populate when connected.
                  </p>
                </div>
                <button onClick={() => setDismissInsight(true)} data-cursor-label="DISMISS" className="text-muted hover:text-one-white transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════ AUDIENCE TRENDS ═══════ */}
      <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="AUDIENCE TRENDS">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
            {/* Main Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <WordReveal text="AUDIENCE TRENDS" className="font-h2 text-one-white mb-6 block" as="h2" stagger={0.05} />
              {/* Chart tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {['Listeners', 'Sessions', 'Engagement', 'Demographics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    data-cursor-label={tab.toUpperCase()}
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

              <TiltCard maxTilt={2}>
              <div className="glass-card p-4 sm:p-6 group relative overflow-hidden">
                <div aria-hidden className="explore-tile-scan" />
                <div className="w-full h-[360px]">
                  {chartTab === 'Listeners' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <p className="font-h3 text-one-white">
                        {formatWeeklyListenersPlain()}
                      </p>
                      <p className="font-body-small text-muted text-center px-8 max-w-md">
                        Est. weekly listeners (ABS 2021 via townData, {formatTowns()} / {formatRadius()}). Month-by-month stream counts: data pending until Radio.co is connected.
                      </p>
                    </div>
                  )}
                  {chartTab === 'Demographics' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageDemoData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#6B6B75', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v + '%'} />
                        <YAxis type="category" dataKey="age" tick={{ fill: '#6B6B75', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,29,48,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                          itemStyle={{ color: '#F4F1EA' }}
                          formatter={(value: number) => [value + '%', 'Share of population']}
                        />
                        <Bar dataKey="percent" fill="#B6FF00" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {(chartTab === 'Sessions' || chartTab === 'Engagement') && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <p className="font-body-small text-muted text-center px-8 max-w-md">
                        {chartTab} data requires Radio.co stream analytics integration. Listener reach estimates are based on ABS 2021 regional population modelling.
                      </p>
                    </div>
                  )}
                </div>
                <p className="font-label text-[9px] text-muted/40 mt-3">
                  Projected estimates · ABS 2021 regional model · Not live streaming data
                </p>
              </div>
              </TiltCard>
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
                  text: `${formatWeeklyListenersPlain()} est. weekly listeners`,
                  sub: `${formatCoverageShort()} · source: townData / ABS 2021`,
                  border: '#B6FF00',
                  icon: TrendingUp,
                },
                {
                  title: 'Breakfast',
                  text: `${BREAKFAST_SHOW} · ${BREAKFAST_TIME} weekdays`,
                  sub: getBreakfastScheduleLabel(),
                  border: '#F0C75E',
                  icon: Radio,
                },
                {
                  title: 'Community',
                  text: `${MULTICULTURAL_PROGRAM_COUNT} multicultural programs each week`,
                  sub: `${MULTICULTURAL_PROGRAMS.map((s) => s.name).join(', ')} — fm985.com.au/guide`,
                  border: '#D4963A',
                  icon: Sparkles,
                },
              ].map((insight, i) => {
                const Icon = insight.icon
                return (
                  <TiltCard key={i} maxTilt={5}>
                  <motion.div
                    className="glass-card p-5 border-l-[3px] group relative overflow-hidden"
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
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} style={{ color: insight.border }} />
                      <span className="font-label text-xs" style={{ color: insight.border }}>{insight.title}</span>
                    </div>
                    <p className="font-h4 text-one-white mb-1">{insight.text}</p>
                    <p className="font-body-small text-muted">{insight.sub}</p>
                  </motion.div>
                  </TiltCard>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ DEMOGRAPHIC BREAKDOWN ═══════ */}
      <section className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="DEMOGRAPHICS">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <WordReveal text="DEMOGRAPHIC DEEP DIVE" className="font-h2 text-one-white block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mt-1">Greater Shepparton LGA (ABS 2021) — not a measured ONE FM listener survey</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Age */}
            <TiltCard maxTilt={4} className="h-full">
            <motion.div
              className="glass-card p-5 h-full group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            >
              <div aria-hidden className="explore-tile-scan" />
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
                      formatter={(value: number) => [
                        `${value}% of Greater Shepparton LGA`,
                        'ABS 2021',
                      ]}
                    />
                    <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={20}>
                      {ageDemoData.map((_, i) => (
                        <Cell key={i} fill={['#B6FF00', '#00BBF9', '#D4963A', '#FF6B6B', '#E63946'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp size={12} className="text-data-teal" />
                <span className="font-label text-xs text-one-white/70">Greater Shepparton LGA (ABS 2021) — not a measured ONE FM age split. Growth by age: data pending.</span>
              </div>
            </motion.div>
            </TiltCard>

            {/* Gender */}
            <TiltCard maxTilt={4} className="h-full">
            <motion.div
              className="glass-card p-5 h-full group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
            >
              <div aria-hidden className="explore-tile-scan" />
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
                <div className="font-stat text-gold-gradient">49 / 51</div>
                <div className="font-label text-muted">Male / Female</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label text-xs text-one-gold">Greater Shepparton LGA (ABS 2021) — not a measured ONE FM gender split</span>
              </div>
            </motion.div>
            </TiltCard>

            {/* Location */}
            <TiltCard maxTilt={4} className="h-full">
            <motion.div
              className="glass-card p-5 h-full group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
            >
              <div aria-hidden className="explore-tile-scan" />
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
                      formatter={(value: number) => [
                        `${value.toLocaleString()} est.`,
                        'Weekly listeners (townData)',
                      ]}
                    />
                    <Bar dataKey="listeners" fill="#D4963A" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-label text-xs text-muted">Top 5 towns by townData listener estimate (ABS 2021). Not a diary survey or 50km coverage share.</span>
              </div>
            </motion.div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ═══════ PLATFORM PERFORMANCE ═══════ */}
      <section className="bg-surface-peak section-bleed-top section-padding" data-cursor-label="PLATFORM STATS">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <WordReveal text="PLATFORM PERFORMANCE" className="font-h2 text-one-white block" as="h2" stagger={0.05} />
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
                  className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                  variants={cardStagger}
                  whileHover={{ borderColor: `${card.accent}50` }}
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <Icon size={32} style={{ color: card.accent }} className="mb-3" />
                  <div className="font-stat text-gold-gradient mb-0.5">{card.stat}</div>
                  <div className="font-label text-muted mb-3">{card.label}</div>
                  <p className="font-label text-[10px] text-muted/70 mb-3">No invented trend sparkline. Counts: data pending.</p>
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
      <section className="bg-surface-glow section-bleed-top section-padding" data-cursor-label="AI PREDICTIONS">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <motion.div
            className="flex items-center gap-3 mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div>
              <WordReveal text="AUDIENCE INSIGHTS" className="font-h2 text-one-white block" as="h2" stagger={0.05} />
              <p className="font-body-small text-muted mt-1">Sourced regional data · ABS 2021 model · Station programme records</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-one-gold/20 text-one-gold font-label text-[10px] shrink-0">SOURCED</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 7-Day Forecast */}
            <TiltCard maxTilt={4} className="h-full">
            <motion.div
              className="glass-card p-6 h-full group relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <div aria-hidden className="explore-tile-scan" />
              <h4 className="font-h4 text-one-white mb-4">Weekly Listener Distribution</h4>
              <p className="font-body-small text-muted p-4 rounded-lg bg-one-navy/50">
                Day-by-day listener counts are data pending. Approved figure is {formatWeeklyListenersPlain()} estimated weekly listeners (ABS 2021 via townData), not a modelled Sat peak.
              </p>
            </motion.div>
            </TiltCard>

            {/* Anomaly Detection */}
            <TiltCard maxTilt={4} className="h-full">
            <motion.div
              className="glass-card p-6 h-full group relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOutExpo }}
            >
              <div aria-hidden className="explore-tile-scan" />
              <h4 className="font-h4 text-one-white mb-4">Audience Events</h4>
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
            </TiltCard>
          </div>

          {/* Smart Segments */}
          <TiltCard maxTilt={3}>
          <motion.div
            className="glass-card p-6 group relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
          >
            <div aria-hidden className="explore-tile-scan" />
            <h4 className="font-h4 text-one-white mb-4">Programming Blocks</h4>
            <p className="font-body-small text-muted mb-4">
              Daypart share of listenership is data pending. Breakfast is 6:00am–9:00am (ONE FM Breakfast). We do not publish invented percentages.
            </p>
          </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* ═══════ DATA EXPORT ═══════ */}
      <section className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="DATA EXPORT">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <WordReveal text="USE YOUR DATA" className="font-h2 text-one-white mb-3 block" as="h2" />
            <p className="font-body text-one-white mb-8">
              CSV / PDF export, scheduled reports, and an analytics API are data pending until Radio.co is connected. We will not generate a file of invented counts.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

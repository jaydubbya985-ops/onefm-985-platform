import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Download,
  ChevronDown,
  Radio,
  Headphones,
  Share2,
  Mic,
  Mail,
  Phone,
  Calendar,
  FileText,
  Image,
  Music,
  Layers,
  Package,
  Check,
  ArrowRight,
  TrendingUp,
  FileDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { generateMediaKitDocx } from '@/lib/docxExport'
import { rateCard, stationStats } from '@/data/pricing'
import { towns } from '@/data/townData'
import { Layout } from '@/components/Layout'

const topTownListeners = [...towns]
  .sort((a, b) => b.listenersEstimate - a.listenersEstimate)
  .slice(0, 5)
  .map((t) => ({ region: t.name, listeners: t.listenersEstimate }))

/* ─────────── easing tokens ─────────── */
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
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardStagger = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
}

/* ─────────── data ─────────── */
const platformData = [
  { name: 'FM Radio', value: 62, color: '#D4963A' },
  { name: 'Streaming', value: 23, color: '#2EC4B6' },
  { name: 'Podcast', value: 10, color: '#9B5DE5' },
  { name: 'Social', value: 5, color: '#FF6B6B' },
]

const ageData = [
  { age: '18-24', percent: 18 },
  { age: '25-34', percent: 32 },
  { age: '35-44', percent: 24 },
  { age: '45-54', percent: 16 },
  { age: '55+', percent: 10 },
]

const genderData = [
  { gender: 'Male', percent: 48, color: '#2EC4B6' },
  { gender: 'Female', percent: 49, color: '#D4963A' },
  { gender: 'Other', percent: 3, color: '#9B5DE5' },
]

const locationData = topTownListeners

const rateCardData = [
  { type: 'Live Read', duration: 'Host mention', peak: rateCard.liveRead, offPeak: Math.round(rateCard.liveRead * 0.6), availability: 'Limited' },
  { type: 'Premium Spot', duration: '60s', peak: rateCard.premiumSpot, offPeak: Math.round(rateCard.premiumSpot * 0.5), availability: 'Moderate' },
  { type: 'Standard Spot', duration: '30s', peak: rateCard.standardSpot30s, offPeak: Math.round(rateCard.standardSpot30s * 0.5), availability: 'High' },
  { type: 'Standard Spot', duration: '60s', peak: rateCard.standardSpot60s, offPeak: Math.round(rateCard.standardSpot60s * 0.5), availability: 'High' },
  { type: 'Sponsorship Mention', duration: '10s', peak: rateCard.sponsorshipMention, offPeak: Math.round(rateCard.sponsorshipMention * 0.5), availability: 'High' },
  { type: 'Website Banner', duration: 'Display', peak: rateCard.websiteBanner, offPeak: Math.round(rateCard.websiteBanner * 0.5), availability: 'High' },
  { type: 'Newsletter Mention', duration: 'Full', peak: rateCard.newsletterMention, offPeak: Math.round(rateCard.newsletterMention * 0.5), availability: 'Moderate' },
  { type: 'Social Post', duration: 'Story + Post', peak: rateCard.socialPost, offPeak: Math.round(rateCard.socialPost * 0.5), availability: 'Moderate' },
]

const platformCards = [
  {
    icon: Radio,
    title: 'FM Radio',
    stat: '98.5 FM',
    statLabel: 'broadcast frequency',
    reach: '~100km radius',
    coverage: 'Goulburn Murray region — 25 towns',
    accent: '#D4963A',
  },
  {
    icon: Headphones,
    title: 'Live Stream',
    stat: 'Online',
    statLabel: 'via fm985.com.au',
    reach: 'Worldwide',
    coverage: 'Radio.co stream · Community Radio Plus app',
    accent: '#2EC4B6',
  },
  {
    icon: Share2,
    title: 'Social Media',
    stat: 'Facebook',
    statLabel: 'community page',
    reach: 'facebook.com/onefmshepparton',
    coverage: 'Local news, events, community',
    accent: '#9B5DE5',
  },
  {
    icon: Mic,
    title: 'Interviews & Podcasts',
    stat: 'SoundCloud',
    statLabel: 'interview archive',
    reach: 'soundcloud.com',
    coverage: 'Local interviews, community voices',
    accent: '#FF6B6B',
  },
]

const assetCards = [
  { icon: Package, name: 'Logo Package', format: 'AI, EPS, PNG, SVG', size: '2.4 MB', popular: false },
  { icon: FileText, name: 'Brand Guidelines', format: 'PDF', size: '24 pages', popular: false },
  { icon: Image, name: 'Photo Library', format: 'JPG, PNG', size: '120+ images', popular: false },
  { icon: Music, name: 'Audio Ident & Jingles', format: 'WAV, MP3', size: '12 tracks', popular: false },
  { icon: Layers, name: 'Social Media Templates', format: 'PSD, Canva', size: '24 templates', popular: false },
  { icon: FileText, name: 'Complete Media Kit', format: 'PDF, PPT', size: '18 MB', popular: true },
]

/* ─────────── helpers ─────────── */
function useCountUp(end: number, duration = 1200, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const hasRun = useRef(false)

  useEffect(() => {
    if (!startOnView || inView) {
      if (hasRun.current) return
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
  }, [inView, end, duration, startOnView])

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

/* ─────────── waveform background ─────────── */
function WaveformBg() {
  const bars = Array.from({ length: 60 }, (_, i) => i)
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.08] pointer-events-none">
      <div className="flex items-end justify-center gap-[2px] h-full px-8">
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-[3px] bg-amber rounded-full"
            animate={{
              height: [`${20 + Math.random() * 30}%`, `${40 + Math.random() * 50}%`, `${20 + Math.random() * 30}%`],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────── signal bars ─────────── */
function SignalBars({ color = '#D4963A' }: { color?: string }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {[40, 55, 70, 85, 100].map((h, i) => (
        <motion.div
          key={i}
          className="w-[4px] rounded-sm"
          style={{ backgroundColor: color, height: `${h}%` }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: easeOutExpo }}
        />
      ))}
    </div>
  )
}

/* ─────────── availability pill ─────────── */
function AvailabilityPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    High: 'bg-data-teal/20 text-data-teal',
    Moderate: 'bg-gold/20 text-gold',
    Limited: 'bg-signal-red/20 text-signal-red',
  }
  const isLimited = status === 'Limited'
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-label text-[10px] ${colors[status] || 'bg-muted/20 text-muted'} ${isLimited ? 'animate-pulse' : ''}`}
    >
      {status}
    </span>
  )
}

/* ═══════════════════════════════════
   MEDIA KIT PAGE
   ═══════════════════════════════════ */
export default function MediaKit() {
  const [demoTab, setDemoTab] = useState<'Overview' | 'Age' | 'Gender' | 'Location'>('Overview')
  const [currency, setCurrency] = useState('AUD')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [docxGenerating, setDocxGenerating] = useState(false)

  const currencyRates: Record<string, number> = { AUD: 1, USD: 0.65, GBP: 0.52, EUR: 0.6 }
  const rateMultiplier = currencyRates[currency] || 1

  const formatPrice = (val: number) => {
    const converted = Math.round(val * rateMultiplier)
    const symbols: Record<string, string> = { AUD: '$', USD: '$', GBP: '£', EUR: '€' }
    return `${symbols[currency] || '$'}${converted.toLocaleString()}`
  }

  const handleDownload = (name: string) => {
    setDownloading(name)
    setTimeout(() => setDownloading(null), 2000)
  }

  const handleDownloadDocx = async () => {
    setDocxGenerating(true)
    try {
      const audienceStats = [
        { label: 'Weekly Listeners', value: stationStats.weeklyListeners.toLocaleString() },
        { label: 'Broadcast Population', value: stationStats.broadcastPopulation.toLocaleString() },
        { label: 'Towns Covered', value: String(stationStats.totalTowns) },
        { label: 'Broadcast Radius', value: `${stationStats.broadcastRadiusKm} km` },
        { label: 'Social Followers', value: stationStats.socialFollowers.toLocaleString() },
        { label: 'Podcast Downloads', value: stationStats.podcastDownloads.toLocaleString() },
        { label: 'Years Broadcasting', value: String(stationStats.yearsBroadcasting) },
      ]

      const platformReach = [
        { platform: 'FM Radio', stat: '98.5 FM', reach: `${stationStats.weeklyListeners.toLocaleString()} est. weekly listeners` },
        { platform: 'Live Stream', stat: 'fm985.com.au', reach: 'Radio.co · Community Radio Plus app' },
        { platform: 'Social Media', stat: `${stationStats.socialFollowers.toLocaleString()}`, reach: 'Facebook community page (target growth to 12,500)' },
        { platform: 'SoundCloud', stat: 'Interview archive', reach: 'Community interviews on fm985.com.au' },
      ]

      const rateCardRows = rateCardData.map((row) => ({
        type: row.type,
        duration: row.duration,
        peak: Math.round(row.peak * rateMultiplier),
        offPeak: Math.round(row.offPeak * rateMultiplier),
        availability: row.availability,
      }))

      const blob = await generateMediaKitDocx({
        rateCard: rateCardRows,
        audienceStats,
        platformReach,
        contactEmail: 'partnerships@onefm.station',
        contactPhone: '+61 2 5555 0198',
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ONE-FM-Media-Kit.docx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Media Kit downloaded as Word document')
    } catch {
      toast.error('Failed to generate Media Kit document')
    }
    setDocxGenerating(false)
  }

  return (
    <Layout>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[60vh] flex items-center bg-onyx overflow-hidden">
        <WaveformBg />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-24 w-full">
          <motion.p
            className="font-label text-muted mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Home / Media Kit
          </motion.p>

          <motion.h1
            className="font-h1 text-ivory mb-6 max-w-[700px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
          >
            MEDIA KIT
          </motion.h1>

          <motion.p
            className="font-body text-chalk max-w-[600px] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeOutExpo }}
          >
            Everything you need to know about ONE FM's audience, reach, and advertising
            opportunities. Download the complete kit or explore sections below.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: easeOutExpo }}
          >
            <button className="btn-primary text-sm">
              <Download size={16} />
              Download Full Kit (PDF)
            </button>
            <button
              className="btn-primary text-sm"
              onClick={handleDownloadDocx}
              disabled={docxGenerating}
            >
              {docxGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              Download Media Kit (DOCX)
            </button>
            <a href="#rate-card" className="btn-secondary text-sm">
              View Rate Card
            </a>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {[
              { value: stationStats.weeklyListeners, label: 'Listeners', suffix: '' },
              { value: stationStats.socialFollowers, label: 'Social', suffix: '' },
              { value: 1, label: 'Regional', suffix: '', prefix: '#' },
              { value: 24, label: 'Broadcast', suffix: '/7' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-6 md:gap-8">
                <div>
                  <div className="font-stat text-amber">
                    <AnimatedNumber value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                  </div>
                  <div className="font-label text-muted">{stat.label}</div>
                </div>
                {i < 3 && <div className="hidden md:block w-px h-10 bg-border-dark" />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ AUDIENCE DEMOGRAPHICS ═══════ */}
      <section className="bg-slate section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.h2
            className="font-h2 text-ivory mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            WHO'S LISTENING
          </motion.h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {(['Overview', 'Age', 'Gender', 'Location'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDemoTab(tab)}
                className={`px-5 py-2.5 rounded-full font-label text-xs transition-all duration-300 ${
                  demoTab === tab
                    ? 'text-amber bg-amber/10 border border-amber/30'
                    : 'text-ivory/60 border border-border-dark hover:text-ivory hover:border-ivory/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {demoTab === 'Overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10"
              >
                {/* Donut Chart */}
                <div className="glass-card p-6 flex flex-col items-center">
                  <div className="w-full h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {platformData.map((entry, index) => (
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
                  <div className="text-center -mt-8">
                    <div className="font-stat text-ivory">25</div>
                    <div className="font-label text-muted">Towns in broadcast area</div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {platformData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-body-small text-chalk">{item.name} {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insight Cards */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    { title: 'Core Audience: 25-54', desc: 'Prime spending demographic' },
                    { title: 'Peak Hours: 6AM–9AM, 4PM–7PM', desc: 'Drive-time dominance' },
                    { title: 'Avg. Session: 47 min', desc: 'Above-industry retention' },
                    { title: 'Cross-Platform: 78%', desc: 'Multi-channel engagement' },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      className="glass-card p-5 hover:border-amber/30 transition-all duration-300"
                      variants={cardStagger}
                    >
                      <h4 className="font-h4 text-ivory mb-1">{card.title}</h4>
                      <p className="font-body-small text-muted">{card.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {demoTab === 'Age' && (
              <motion.div
                key="age"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6"
              >
                <div className="w-full h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#6B6B75', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="age" tick={{ fill: '#F4F1EA', fontSize: 13, fontFamily: 'Space Grotesk' }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(26,26,31,0.95)',
                          border: '1px solid #2A2A30',
                          borderRadius: '8px',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          color: '#F4F1EA',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Percentage']}
                      />
                      <Bar dataKey="percent" fill="#D4963A" radius={[0, 4, 4, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {demoTab === 'Gender' && (
              <motion.div
                key="gender"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8"
              >
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="w-[280px] h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="percent" stroke="none">
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
                          formatter={(value: number) => [`${value}%`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="flex flex-col gap-4">
                      {genderData.map((g) => (
                        <div key={g.gender} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                          <span className="font-body text-chalk">{g.gender}</span>
                          <span className="font-label text-amber">{g.percent}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="font-body-small text-muted mt-6">
                      Diverse programming ensures balanced audience
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {demoTab === 'Location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6"
              >
                <div className="w-full h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationData} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" vertical={false} />
                      <XAxis dataKey="region" tick={{ fill: '#F4F1EA', fontSize: 12, fontFamily: 'Space Grotesk' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6B6B75', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(26,26,31,0.95)',
                          border: '1px solid #2A2A30',
                          borderRadius: '8px',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          color: '#F4F1EA',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Listeners']}
                      />
                      <Bar dataKey="listeners" fill="#D4963A" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {locationData.map((loc) => (
                    <div key={loc.region} className="text-center p-3 rounded-lg bg-onyx/50">
                      <div className="font-label text-amber text-xs">{loc.listeners.toLocaleString()}</div>
                      <div className="font-micro text-muted">{loc.region}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════ PLATFORM REACH ═══════ */}
      <section className="bg-onyx section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <h2 className="font-h2 text-ivory">PLATFORM REACH</h2>
            <p className="font-body-small text-muted mt-2">Where your message travels</p>
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
                  className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group"
                  variants={cardStagger}
                  whileHover={{ borderColor: `${card.accent}50` }}
                >
                  <Icon size={40} style={{ color: card.accent }} className="mb-4" />
                  <div className="font-stat text-ivory mb-1">{card.stat}</div>
                  <div className="font-label text-muted mb-3">{card.statLabel}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-data-teal" />
                    <span className="font-body-small text-chalk">{card.reach}</span>
                  </div>
                  <p className="font-body-small text-muted">{card.coverage}</p>
                  {card.title === 'FM Radio' && (
                    <div className="mt-4">
                      <SignalBars color={card.accent} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════ RATE CARD ═══════ */}
      <section id="rate-card" className="bg-slate section-padding">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div>
              <h2 className="font-h2 text-ivory">ADVERTISING RATES</h2>
              <p className="font-micro text-muted mt-2">Effective Q2 2025 — All rates in selected currency, GST exclusive</p>
            </div>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none glass-card px-4 py-2.5 pr-10 font-label text-xs text-ivory bg-transparent cursor-pointer focus:outline-none focus:border-amber/50"
              >
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </motion.div>

          <motion.div
            className="glass-card overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border-dark bg-glass font-label text-xs text-muted uppercase">
              <span>Spot Type</span>
              <span>Duration</span>
              <span>Peak Rate</span>
              <span>Off-Peak</span>
              <span>Availability</span>
            </div>
            {/* Table Rows */}
            {rateCardData.map((row, i) => (
              <motion.div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border-dark/50 hover:bg-amber/5 transition-colors duration-200 items-center"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.4, delay: i * 0.06, ease: easeOutExpo },
                  },
                }}
              >
                <span className="font-body-small text-ivory">{row.type}</span>
                <span className="font-mono text-sm text-chalk">{row.duration}</span>
                <span className="font-mono text-sm text-amber">{formatPrice(row.peak)}</span>
                <span className="font-mono text-sm text-chalk">{formatPrice(row.offPeak)}</span>
                <AvailabilityPill status={row.availability} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="font-body-small text-muted max-w-lg">
              Volume discounts available for packages of 10+ spots. Custom packages and annual agreements receive preferential rates.
            </p>
            <div className="flex gap-3 shrink-0">
              <Link to="/proposal" className="btn-primary text-xs">
                Request Custom Quote
              </Link>
              <button className="btn-secondary text-xs">
                <Download size={14} />
                Rate Card
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ BRAND ASSETS ═══════ */}
      <section className="bg-onyx section-padding">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <h2 className="font-h2 text-ivory">BRAND ASSETS</h2>
            <p className="font-body-small text-muted mt-2">Logos, guidelines, and creative resources</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {assetCards.map((asset, i) => {
              const Icon = asset.icon
              const isDownloading = downloading === asset.name
              return (
                <motion.div
                  key={i}
                  className="glass-card p-6 hover:-translate-y-1 hover:shadow-glow hover:border-amber/30 transition-all duration-300 group"
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.5, delay: i * 0.08, ease: easeOutExpo },
                    },
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-amber/10 flex items-center justify-center">
                      <Icon size={24} className="text-amber" />
                    </div>
                    {asset.popular && (
                      <span className="px-3 py-1 rounded-full bg-gold/20 text-gold font-label text-[10px]">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <h4 className="font-h4 text-ivory mb-1">{asset.name}</h4>
                  <p className="font-body-small text-muted mb-1">{asset.format}</p>
                  <p className="font-micro text-muted mb-4">{asset.size}</p>
                  <button
                    onClick={() => handleDownload(asset.name)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-label text-xs transition-all duration-300 ${
                      asset.popular
                        ? 'btn-primary text-xs'
                        : 'border border-ivory/40 text-ivory hover:bg-ivory/10'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Check size={14} />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        {asset.popular ? 'Download All' : 'Download'}
                      </>
                    )}
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section className="relative bg-gradient-to-b from-onyx to-slate section-padding">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <h2 className="font-h2 text-ivory mb-4">READY TO AMPLIFY?</h2>
            <p className="font-body text-chalk mb-10">
              Our partnerships team is ready to build a campaign that works for your brand.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="flex items-center gap-3" variants={cardStagger}>
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <Mail size={18} className="text-amber" />
              </div>
              <span className="font-mono text-sm text-chalk">partnerships@onefm.station</span>
            </motion.div>
            <motion.div className="flex items-center gap-3" variants={cardStagger}>
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <Phone size={18} className="text-amber" />
              </div>
              <span className="font-mono text-sm text-chalk">+61 2 5555 0198</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button className="btn-primary text-sm">
              <Calendar size={16} />
              Book a Meeting
            </button>
            <Link to="/proposal" className="flex items-center gap-2 font-label text-xs text-amber hover:text-gold transition-colors">
              Or build a custom proposal yourself
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

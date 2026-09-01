import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
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
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { generateMediaKitDocx } from '@/lib/docxExport'
import { rateCard } from '@/data/pricing'
import { towns } from '@/data/townData'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'
import { SponsorCommercialCta } from '@/components/SponsorCommercialCta'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import {
  audienceStatsRows,
  broadcastPopulationValue,
  coverageNumbers,
  formatCoverageRegion,
  formatFmRadiusDetail,
  formatRadius,
  weeklyListenersValue,
  yearsBroadcastingValue,
} from '@/lib/coverageCopy'
import { STANDARD_SPOT_PLUS_GST } from '@/lib/inventoryCopy'
import { InventoryLadder } from '@/components/InventoryLadder'
import { MediaImage } from '@/components/MediaImage'
import { TiltCard } from '@/components/TiltCard'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { CredibilityStrip } from '@/components/home/CredibilityStrip'

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

/* ─────────── data (sourced — no fabricated percentages) ─────────── */
const reachChannels = [
  { name: 'FM Radio', detail: formatFmRadiusDetail(), color: '#F2F2F2' },
  { name: 'Live Stream', detail: 'fm985.com.au · Radio.co', color: '#B6FF00' },
  { name: 'SoundCloud', detail: 'Interview archive after broadcast', color: '#FF5500' },
  { name: 'Facebook', detail: 'facebook.com/onefmshepparton', color: '#1877F2' },
]

const audienceStats = audienceStatsRows()

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
    reach: `${formatRadius()} radius`,
    coverage: formatCoverageRegion(),
    accent: '#F2F2F2',
  },
  {
    icon: Headphones,
    title: 'Live Stream',
    stat: 'Online',
    statLabel: 'via fm985.com.au',
    reach: 'Worldwide',
    coverage: 'Radio.co stream · Community Radio Plus app',
    accent: '#B6FF00',
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

/* ─────────── waveform background ─────────── */
const WAVEFORM_BARS = Array.from({ length: 60 }, (_, i) => ({
  lo:      20 + ((i * 31 + 7) % 31),
  hi:      40 + ((i * 23 + 13) % 51),
  loEnd:   20 + ((i * 37 + 17) % 31),
  duration: 2 + ((i * 17 + 5) % 20) / 10,
  delay:    ((i * 11 + 3) % 20) / 10,
}))

function WaveformBg() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden opacity-[0.08] pointer-events-none">
      <div className="flex items-end justify-center gap-[2px] h-full px-8">
        {WAVEFORM_BARS.map((bar, i) => (
          <motion.div
            key={i}
            className="w-[3px] bg-one-gold rounded-full"
            animate={{ height: [`${bar.lo}%`, `${bar.hi}%`, `${bar.loEnd}%`] }}
            transition={{ duration: bar.duration, repeat: Infinity, ease: 'easeInOut', delay: bar.delay }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────── signal bars ─────────── */
function SignalBars({ color = '#F2F2F2' }: { color?: string }) {
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

/* ─── Studio Photo Strip ─── */
const STUDIO_PHOTOS = [
  { src: STATION_PHOTOS.commentaryCallAction,  alt: 'Commentary team live on air',        caption: 'Live on Air' },
  { src: STATION_PHOTOS.commentaryTeamSelfie,  alt: 'Commentary team behind the scenes',  caption: 'Behind the Mic' },
  { src: STATION_PHOTOS.obSetupFull,           alt: 'Outside broadcast full setup',        caption: 'OB Ready' },
  { src: STATION_PHOTOS.studioExteriorRainbow, alt: 'ONE FM studio exterior with rainbow', caption: 'The Studio' },
]

function StudioPhotoStrip() {
  return (
    <section className="py-16 bg-[#070707]" data-cursor-label="STUDIO">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="font-label text-one-gold text-[10px] tracking-widest uppercase mb-2">Behind the Signal</p>
            <WordReveal text="The Station. The Team." className="font-h2 text-one-white block" as="h2" stagger={0.05} />
          </div>
          <span className="hidden sm:block font-label text-one-muted text-[10px] tracking-widest uppercase">ONE FM 98.5</span>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[200px] lg:auto-rows-[220px]">
          {STUDIO_PHOTOS.map((photo, i) => (
            <TiltCard key={photo.alt} maxTilt={6} className="h-full">
              <motion.div
                className="relative overflow-hidden rounded-xl group h-full"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <MediaImage
                  src={photo.src}
                  fallbackSrc={STATION_PHOTOS.commentaryBoxAction}
                  alt={photo.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div aria-hidden className="explore-tile-scan" />
                <div className="absolute bottom-0 inset-x-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="font-label text-[10px] tracking-[0.2em] text-one-white uppercase">{photo.caption}</span>
                </div>
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════
   MEDIA KIT PAGE
   ═══════════════════════════════════ */
export default function MediaKit() {
  const [demoTab, setDemoTab] = useState<'Overview' | 'Reach' | 'Top Towns'>('Overview')
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

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  const handleDownload = (name: string) => {
    setDownloading(name)
    setTimeout(() => setDownloading(null), 2000)
  }

  const handleDownloadDocx = async () => {
    setDocxGenerating(true)
    try {
      const audienceStats = [
        { label: 'Weekly Listeners', value: weeklyListenersValue() },
        { label: 'Broadcast Population', value: broadcastPopulationValue() },
        { label: 'Towns Covered', value: String(coverageNumbers.totalTowns) },
        { label: 'Broadcast Radius', value: `${coverageNumbers.broadcastRadiusKm} km` },
        { label: 'Years Broadcasting', value: yearsBroadcastingValue() },
      ]

      const platformReach = [
        { platform: 'FM Radio', stat: '98.5 FM', reach: `${weeklyListenersValue()} est. weekly listeners` },
        { platform: 'Live Stream', stat: 'fm985.com.au', reach: 'Radio.co · Community Radio Plus app' },
        { platform: 'Social Media', stat: 'Facebook', reach: 'facebook.com/onefmshepparton — follower count reported by the platform' },
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
        contactEmail: BRAND.email,
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
      <SEO
        title="Media Kit"
        description="ONE FM 98.5 media kit — rate card, audience reach, sponsorship packages, and brand assets for advertisers in the Goulburn Valley."
      />
      {/* ═══════ HERO ═══════ */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-end bg-[#101010] overflow-hidden" data-cursor-label="MEDIA KIT">
        {/* Background image */}
        <motion.div
          style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
        >
          <img
            src={STATION_PHOTOS.obVanBranded}
            alt=""
            aria-hidden
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.58 }}
          />
        </motion.div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/65 via-transparent to-transparent" />
        {/* Waveform overlay */}
        <WaveformBg />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-32 pb-40 w-full">
          <motion.span
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
          >
            Advertise with ONE FM · Shepparton
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.62 + 0.8)) * 12 + 2),
                  backgroundColor: 'rgba(201,162,39,0.35)',
                  animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.085) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Media" as="span" className="block text-ivory" delay={0.15} stagger={0.12} />
            <WordReveal text="Kit." as="span" className="block text-one-gold" delay={0.4} stagger={0.12} />
          </h1>

          <motion.p
            className="font-body text-chalk/80 max-w-[520px] mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: easeOutExpo }}
          >
            Everything you need to know about ONE FM's audience, reach, and advertising
            opportunities. Download the complete kit or explore sections below.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: easeOutExpo }}
          >
            <MagneticButton strength={10}>
              <button data-cursor-label="DOWNLOAD PDF" className="btn-primary text-sm flex items-center gap-2">
                <Download size={16} />
                Download Full Kit (PDF)
              </button>
            </MagneticButton>
            <MagneticButton strength={8}>
              <button
                data-cursor-label="DOWNLOAD DOCX"
                className="btn-primary text-sm flex items-center gap-2"
                onClick={handleDownloadDocx}
                disabled={docxGenerating}
              >
                {docxGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                Download Media Kit (DOCX)
              </button>
            </MagneticButton>
            <MagneticButton strength={6} cursorLabel="RATE CARD">
              <a href="#rate-card" className="btn-secondary text-sm">
                View Rate Card
              </a>
            </MagneticButton>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[
              { value: coverageNumbers.weeklyListeners, label: 'Est. listeners', suffix: '' },
              { value: coverageNumbers.totalTowns, label: 'Towns', suffix: '' },
              { value: coverageNumbers.yearsBroadcasting, label: 'Years on air', suffix: '' },
              { value: 24, label: 'Broadcast', suffix: '/7' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-6 md:gap-8">
                <div>
                  <div className="font-stat text-gold-gradient">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix || ''} />
                  </div>
                  <div className="font-label text-muted">{stat.label}</div>
                </div>
                {i < 3 && <div className="hidden md:block w-px h-10 bg-border-dark" />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <CredibilityStrip />

      {/* ── Media Kit Marquee Strip ── */}
      <div className="bg-[#070707] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={30}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">ADVERTISING RATES 2026</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-chalk/40">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">{broadcastPopulationValue()} PEOPLE IN THE BROADCAST AREA</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-chalk/40">GOULBURN VALLEY · VICTORIA</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">LIVE READS · SPOT ADS · SPONSORSHIP</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-chalk/40">~{coverageNumbers.broadcastRadiusKm} KM BROADCAST RADIUS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">COMMUNITY RADIO · CALLSIGN: 3ONE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-chalk/40">{yearsBroadcastingValue()} YEARS ON AIR</span>,
          ]}
        />
      </div>

      {/* ─── Studio Photo Strip ─── */}
      <StudioPhotoStrip />

      {/* ═══════ AUDIENCE DEMOGRAPHICS ═══════ */}
      <section className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="AUDIENCE DATA">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <WordReveal text="WHO'S LISTENING" className="font-h2 text-ivory mb-8 block" as="h2" stagger={0.05} />

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {(['Overview', 'Reach', 'Top Towns'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDemoTab(tab)}
                data-cursor-label={tab.toUpperCase()}
                className={`px-5 py-2.5 rounded-full font-label text-xs transition-all duration-300 ${
                  demoTab === tab
                    ? 'text-one-gold bg-one-gold/10 border border-one-gold/30'
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
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {audienceStats.map((stat) => (
                    <TiltCard key={stat.label} maxTilt={5} className="h-full">
                      <motion.div
                        className="glass-card p-5 hover:border-one-gold/30 transition-all duration-300 h-full"
                        variants={cardStagger}
                      >
                        <div className="font-stat text-gold-gradient text-2xl">{stat.value}</div>
                        <h4 className="font-h4 text-ivory mb-1 mt-2">{stat.label}</h4>
                        <p className="font-body-small text-muted">{stat.note}</p>
                      </motion.div>
                    </TiltCard>
                  ))}
                </motion.div>

                <TiltCard maxTilt={4}>
                <div className="glass-card p-6">
                  <h3 className="font-h4 text-ivory mb-4">Where ONE FM reaches listeners</h3>
                  <div className="space-y-3">
                    {reachChannels.map((ch) => (
                      <div
                        key={ch.name}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border-dark bg-onyx/40"
                      >
                        <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
                        <div>
                          <p className="font-label text-ivory text-xs">{ch.name}</p>
                          <p className="font-body-small text-muted text-xs mt-0.5">{ch.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="font-body-small text-muted mt-4 text-xs">
                    Peak listening: breakfast (6–9am) and drive (4–7pm). Detailed demographics available on request.
                  </p>
                </div>
                </TiltCard>
              </motion.div>
            )}

            {demoTab === 'Reach' && (
              <motion.div
                key="reach"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {platformCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <TiltCard key={card.title} maxTilt={5} className="h-full">
                    <div className="glass-card p-6 hover:border-one-gold/30 transition-colors h-full">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${card.accent}22`, color: card.accent }}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <h4 className="font-h4 text-ivory">{card.title}</h4>
                          <p className="font-stat text-gold-gradient text-lg mt-1">{card.stat}</p>
                          <p className="font-label text-muted text-[10px]">{card.statLabel}</p>
                          <p className="font-body-small text-chalk mt-2">{card.reach}</p>
                          <p className="font-body-small text-muted text-xs">{card.coverage}</p>
                        </div>
                      </div>
                    </div>
                    </TiltCard>
                  )
                })}
              </motion.div>
            )}

            {demoTab === 'Top Towns' && (
              <motion.div
                key="top-towns"
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
                      <Bar dataKey="listeners" fill="#F2F2F2" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {locationData.map((loc) => (
                    <div key={loc.region} className="text-center p-3 rounded-lg bg-onyx/50">
                      <div className="font-label text-one-gold text-xs">{loc.listeners.toLocaleString()} est.</div>
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
      <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="PLATFORM REACH">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <WordReveal text="PLATFORM REACH" className="font-h2 text-ivory block" as="h2" stagger={0.05} />
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
                  className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                  variants={cardStagger}
                  whileHover={{ borderColor: `${card.accent}50` }}
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <Icon size={40} style={{ color: card.accent }} className="mb-4" />
                  <div className="font-stat text-gold-gradient mb-1">{card.stat}</div>
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
      <section id="rate-card" className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="RATE CARD">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div>
              <WordReveal text="ADVERTISING RATES" className="font-h2 text-ivory block" as="h2" stagger={0.05} />
              <p className="font-micro text-muted mt-2">Effective Q1 2026 — All rates plus GST. {STANDARD_SPOT_PLUS_GST}. GVL and live reads are premium inventory — never sold as the $25 floor.</p>
            </div>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none glass-card px-4 py-2.5 pr-10 font-label text-xs text-ivory bg-transparent cursor-pointer focus:outline-none focus:border-one-gold/50"
              >
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </motion.div>

          <InventoryLadder className="mb-10" />

          <motion.div
            className="glass-card overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border-dark bg-one-navy/50 font-label text-xs text-muted uppercase">
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
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border-dark/50 hover:bg-one-gold/5 transition-colors duration-200 items-center"
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
                <span className="font-mono text-sm text-one-gold">{formatPrice(row.peak)}</span>
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
              <MagneticButton strength={10}>
                <Link to="/proposal" data-cursor-label="QUOTE" className="btn-primary text-xs">
                  Request Custom Quote
                </Link>
              </MagneticButton>
              <MagneticButton strength={6}>
                <button data-cursor-label="DOWNLOAD" className="btn-secondary text-xs">
                  <Download size={14} />
                  Rate Card
                </button>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ BRAND ASSETS ═══════ */}
      <section className="bg-surface-peak section-bleed-top section-padding" data-cursor-label="BRAND ASSETS">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <WordReveal text="BRAND ASSETS" className="font-h2 text-ivory block" as="h2" stagger={0.05} />
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
                <TiltCard key={asset.name} maxTilt={5} className="h-full">
                <motion.div
                  className="glass-card p-6 hover:shadow-glow hover:border-one-gold/30 transition-all duration-300 group h-full relative overflow-hidden"
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.5, delay: i * 0.08, ease: easeOutExpo },
                    },
                  }}
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-one-gold/10 flex items-center justify-center">
                      <Icon size={24} className="text-one-gold" />
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
                    data-cursor-label={isDownloading ? 'DONE' : 'DOWNLOAD'}
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
                </TiltCard>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section className="relative bg-surface-glow section-bleed-top section-padding" data-cursor-label="GET IN TOUCH">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <WordReveal text="READY TO AMPLIFY?" className="font-h2 text-ivory mb-4 block" as="h2" stagger={0.05} />
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
              <div className="w-10 h-10 rounded-full bg-one-gold/10 flex items-center justify-center">
                <Mail size={18} className="text-one-gold" />
              </div>
              <a href={`mailto:${BRAND.email}`} data-cursor-label="EMAIL" className="font-mono text-sm text-chalk hover:text-one-gold transition-colors link-hover">
                {BRAND.email}
              </a>
            </motion.div>
            <motion.div className="flex items-center gap-3" variants={cardStagger}>
              <div className="w-10 h-10 rounded-full bg-one-gold/10 flex items-center justify-center">
                <Phone size={18} className="text-one-gold" />
              </div>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} data-cursor-label="CALL" className="font-mono text-sm text-chalk hover:text-one-gold transition-colors link-hover">
                {BRAND.phone}
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MagneticButton strength={10} cursorLabel="BOOK">
              <button className="btn-primary text-sm">
                <Calendar size={16} />
                Book a Meeting
              </button>
            </MagneticButton>
            <MagneticButton strength={6} cursorLabel="REQUEST">
              <Link to="/proposal" className="flex items-center gap-2 font-label text-xs text-one-gold hover:text-gold transition-colors link-hover">
                Or request a tailored proposal
                <ArrowRight size={14} />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>
      <SponsorCommercialCta
        headline="From stats to signed campaign"
        subline="Download the kit, explore coverage by town, or request a tailored proposal."
      />
    </Layout>
  )
}

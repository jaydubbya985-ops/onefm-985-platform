import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Check, Info, X, ArrowRight,
  Share2, Save, Minus, Plus,
  Sparkles, Radio, Trophy, Globe, MapPin,
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { generalTiers, rateCard, stationStats } from '@/data/pricing'
import { submitEnquiry } from '@/lib/enquiries'
import { BRAND } from '@/lib/brand'
import { toast } from 'sonner'
import { SponsorCommercialCta } from '@/components/SponsorCommercialCta'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { STATION_PHOTOS, PHOTO_DEFAULTS } from '@/lib/stationPhotos'
import { MediaImage } from '@/components/MediaImage'
import { TiltCard } from '@/components/TiltCard'
import { CredibilityStrip } from '@/components/home/CredibilityStrip'
import { AnimatedNumber } from '@/components/AnimatedNumber'

/* ─── easing helpers ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── Particle Canvas (isolated from Framer Motion) ─── */
const ParticleField = memo(function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; burst: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    const count = 35
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        burst: 0,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.offsetWidth
        if (p.x > canvas.offsetWidth) p.x = 0
        if (p.y < 0) p.y = canvas.offsetHeight
        if (p.y > canvas.offsetHeight) p.y = 0
        if (Math.random() < 0.005) p.burst = 1
        if (p.burst > 0) {
          p.burst += 0.02
          if (p.burst >= 1) p.burst = 0
        }
        const a = p.alpha + (p.burst > 0 ? Math.sin(p.burst * Math.PI) * 0.5 : 0)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,150,58,${a})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
})

/* ─── Tier Data (from pricing.ts) ─── */
interface MappedTier {
  key: string
  name: string
  color: string
  monthly: number
  annual: number
  desc: string
  features: string[]
  ctaStyle: 'primary' | 'secondary'
  popular: boolean
}

const tierMap: MappedTier[] = Object.entries(generalTiers).map(([key, tier]) => {
  const hasExclusivity = 'exclusivity' in tier && (tier as Record<string, unknown>).exclusivity === true
  return {
    key,
    name: tier.name.toUpperCase(),
    color: key === 'communityPartner' ? 'text-one-white' : 'text-gold-gradient',
    monthly: tier.weeklyPrice * 4,
    annual: Math.round(tier.weeklyPrice * 52 * (1 - rateCard.packageDiscount)),
    desc: `${tier.spots} radio spots, ${tier.socialPosts} social posts per month.${hasExclusivity ? ' Category exclusivity included.' : ''}`,
    features: [
      `${tier.spots} × radio spots`,
      `${tier.socialPosts} social posts per month`,
      hasExclusivity ? 'Category exclusivity' : 'Website logo listing',
      'Newsletter inclusion',
      hasExclusivity ? 'Dedicated account manager' : 'Basic reporting',
      hasExclusivity ? 'First refusal on new initiatives' : 'Community event shoutout',
    ],
    ctaStyle: key === 'communityPartner' ? 'secondary' : 'primary',
    popular: key === 'championPartner',
  }
})

/* ─── Add-on Data ─── */
const addOns = [
  { key: 'event', name: 'Event Sponsorship', price: 800 },
  { key: 'podcast', name: 'Podcast Integration', price: 450 },
  { key: 'social', name: 'Social Campaign Boost', price: 600 },
  { key: 'newsletter', name: 'Newsletter Feature', price: 200 },
  { key: 'liveRead', name: 'Host Live Read', price: 350 },
]

/* ─── Case Studies → factual sponsorship channels (no fabricated lift %) ─── */
const sponsorChannels = [
  {
    id: 1,
    title: 'Drive-time radio spots',
    industry: 'Broadcast',
    image: STATION_PHOTOS.obSetupFull,
    stats: ['Breakfast 6–9am', 'Afternoon 4–7pm', 'From $25/spot'],
    desc: 'Peak listening on ONE FM 98.5 — host live reads and standard spots from our published rate card.',
  },
  {
    id: 2,
    title: 'GVL Saturday coverage',
    industry: 'Sport',
    image: STATION_PHOTOS.gvlNightPanorama,
    stats: ['Live footy & netball', '9 tiers from $25/wk', 'Match-day mentions'],
    desc: 'Official Goulburn Valley League broadcaster — put your brand in front of game-day audiences.',
    link: '/football',
  },
  {
    id: 3,
    title: 'Digital & social',
    industry: 'Digital',
    image: STATION_PHOTOS.eventLasersCrowd,
    stats: ['Facebook community', 'SoundCloud interviews', 'Website banners'],
    desc: 'Cross-platform mentions bundled with radio packages — see Media Kit for reach stats.',
    link: '/media-kit',
  },
  {
    id: 4,
    title: 'Valley-wide reach',
    industry: 'Regional',
    image: STATION_PHOTOS.geoTownAerial,
    stats: [`${stationStats.totalTowns} towns`, `${stationStats.broadcastRadiusKm} km radius`, `Est. ${stationStats.weeklyListeners.toLocaleString()} listeners/wk`],
    desc: 'Interactive coverage map with population and listener estimates per town.',
    link: '/coverage',
  },
]

const industryColors: Record<string, string> = {
  Broadcast: 'bg-one-gold/20 text-one-gold',
  Sport: 'bg-data-teal/20 text-data-teal',
  Digital: 'bg-data-violet/20 text-data-violet',
  Regional: 'bg-sage/20 text-sage',
  Automotive: 'bg-one-gold/20 text-one-gold',
  Retail: 'bg-data-teal/20 text-data-teal',
  Events: 'bg-data-violet/20 text-data-violet',
  Healthcare: 'bg-sage/20 text-sage',
}

const industryColorHex: Record<string, string> = {
  Broadcast: '#D4AF37',
  Sport: '#2EC4B6',
  Digital: '#9B5DE5',
  Regional: '#6DB05E',
}

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  Broadcast: Radio,
  Sport: Trophy,
  Digital: Globe,
  Regional: MapPin,
}

type SponsorChannel = (typeof sponsorChannels)[number]

function renderChannelCard(cs: SponsorChannel) {
  const accent = industryColorHex[cs.industry] ?? '#D4AF37'
  const HeroIcon = INDUSTRY_ICONS[cs.industry] ?? Radio
  return (
    <>
      <div className="h-[200px] relative overflow-hidden">
        <MediaImage
          src={cs.image}
          fallbackSrc={PHOTO_DEFAULTS.regional}
          alt={cs.title}
          className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-t from-one-navy via-one-navy/50 to-transparent z-10" />
        {/* Industry colour tint — top-left corner bleed */}
        <div
          className="absolute inset-0 z-10 opacity-25"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 55%)` }}
        />
        {/* Industry badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`font-micro px-2 py-0.5 rounded ${industryColors[cs.industry] || 'bg-muted/20 text-muted'}`}>
            {cs.industry}
          </span>
        </div>
        {/* Icon badge bottom-right */}
        <div className="absolute bottom-3 right-3 z-20">
          <div className="w-9 h-9 rounded-lg bg-one-navy/60 backdrop-blur-sm border border-one-border/50 flex items-center justify-center">
            <HeroIcon size={18} style={{ color: accent }} />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-h3 text-one-white mb-2 group-hover:text-one-gold transition-colors">{cs.title}</h3>
        <div className="flex flex-wrap gap-3 mb-3">
          {cs.stats.map((s) => (
            <span key={s} className="font-mono text-xs text-one-white/70">{s}</span>
          ))}
        </div>
        <p className="font-body-small text-one-muted line-clamp-2 mb-4">{cs.desc}</p>
        {'link' in cs && cs.link && (
          <span className="inline-flex items-center gap-1 font-label text-one-gold group-hover:gap-2 transition-all">
            Learn more <ArrowRight size={14} />
          </span>
        )}
      </div>
    </>
  )
}

/* ─── Community voice (sourced — not fabricated sponsor quotes) ─── */
const communityVoice = {
  quote:
    "When the 2022 floods cut our town off, ONE FM was the only way we knew what was happening. They saved lives, simple as that.",
  name: 'Margaret Tresize',
  role: 'Community Leader, Rochester',
}

/* ─── Section wrapper with scroll reveal ─── */
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: easeOutExpo }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Sponsorship In Action Gallery ─── */
const SPONSOR_GALLERY = [
  { src: STATION_PHOTOS.eventFoodTrucks,     alt: 'Local food trucks at a community event',     caption: 'Community Presence', className: 'col-span-2 lg:col-span-2 row-span-2' },
  { src: STATION_PHOTOS.matchDayFlag,        alt: 'ONE FM match day flag at the stadium',        caption: 'Brand Exposure',     className: '' },
  { src: STATION_PHOTOS.gvlTownersCelebration, alt: 'GVL Towners celebrating together',          caption: 'With the Crowd',     className: '' },
  { src: STATION_PHOTOS.eventOutdoorCinema,  alt: 'Outdoor cinema event at dusk',               caption: 'Live Events',        className: '' },
  { src: STATION_PHOTOS.eventLasersCrowd,    alt: 'Community festival with laser lights',        caption: 'Festival Energy',    className: '' },
  { src: STATION_PHOTOS.obSetupFull,         alt: 'ONE FM outside broadcast setup on location',  caption: 'On Location OB',     className: 'col-span-1 lg:col-span-2' },
]

function SponsorGallery() {
  return (
    <section className="py-20 bg-[#020810]" data-cursor-label="IN ACTION">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="font-label text-one-gold text-[10px] tracking-widest uppercase mb-2">Your Brand · Our Reach</p>
            <WordReveal text="Sponsorship in Action" className="font-h2 text-one-white block" as="h2" stagger={0.05} />
          </div>
          <span className="hidden sm:block font-label text-one-muted text-[10px] tracking-widest uppercase">GV Community</span>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[190px] lg:auto-rows-[210px] gap-3">
          {SPONSOR_GALLERY.map((photo, i) => (
            <TiltCard key={photo.alt} maxTilt={5} className={`h-full ${photo.className}`}>
              <motion.div
                className="relative overflow-hidden rounded-xl group h-full"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <MediaImage
                  src={photo.src}
                  fallbackSrc={PHOTO_DEFAULTS.community}
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

/* ═══════════════════════════════════════════ */
/*  MAIN PAGE                                  */
/* ═══════════════════════════════════════════ */
export default function SponsorshipKit() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedTier, setSelectedTier] = useState('championPartner')
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({ event: false, podcast: false, social: false, newsletter: false, liveRead: false })
  const [duration, setDuration] = useState(3)
  const [industry, setIndustry] = useState('Retail')
  const [showSuggestion, setShowSuggestion] = useState(true)
  const [calcIndustry, setCalcIndustry] = useState('Retail')
  const [calcSize, setCalcSize] = useState('Champion')
  const [calcBudget, setCalcBudget] = useState(5000)
  const [calcGoal, setCalcGoal] = useState('Brand Awareness')
  const [calcResults, setCalcResults] = useState(false)
  const [caseFilter, setCaseFilter] = useState('All')
  const [heroName, setHeroName] = useState('')
  const [heroEmail, setHeroEmail] = useState('')
  const [heroSubmitted, setHeroSubmitted] = useState(false)
  const [heroSubmitting, setHeroSubmitting] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  const toggleAddon = (key: string) => {
    setSelectedAddons((p) => ({ ...p, [key]: !p[key] }))
  }

  const currentTier = tierMap.find((t) => t.key === selectedTier) || tierMap[1]
  const basePrice = isAnnual ? currentTier.annual : currentTier.monthly
  const addonTotal = addOns.reduce((sum, a) => sum + (selectedAddons[a.key] ? a.price : 0), 0)
  const rawTotal = (basePrice + addonTotal) * (isAnnual ? 1 : duration)
  const discount = duration >= 12 ? 0.15 : duration >= 6 ? 0.10 : duration >= 3 ? 0.05 : 0
  const total = Math.round(rawTotal * (1 - discount))

  const filteredCases = caseFilter === 'All' ? sponsorChannels : sponsorChannels.filter((c) => c.industry === caseFilter)

  /* Reach estimate — uses station stats only, not fabricated ROI */
  const computeROI = useCallback(() => {
    const shareBySize: Record<string, number> = {
      Community: 0.04,
      Champion: 0.08,
      Premier: 0.12,
      Signature: 0.15,
      Custom: 0.1,
    }
    const share = shareBySize[calcSize] ?? 0.08
    const weeklyReach = Math.round(stationStats.weeklyListeners * share)
    const spotsPerMonth = calcSize === 'Premier' || calcSize === 'Signature' ? 40 : 20
    const monthlyImpressions = weeklyReach * spotsPerMonth
    const cpm = monthlyImpressions > 0 ? ((calcBudget / monthlyImpressions) * 1000).toFixed(2) : '0.00'
    return { weeklyReach, cpm, monthlyImpressions, spotsPerMonth }
  }, [calcBudget, calcSize])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout>
      <SEO title="Sponsorship Packages" description="Partner with ONE FM 98.5. Bronze, Silver, Gold packages. Interactive package builder with ROI calculator." />
      {/* ── Section 1: Hero ── */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-end overflow-hidden bg-[#050D1A]" data-cursor-label="PARTNER WITH US">
        {/* Background image */}
        <motion.div
          style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
        >
          <img
            src={STATION_PHOTOS.obSetupFull}
            alt=""
            aria-hidden
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.52 }}
          />
        </motion.div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A] via-[#050D1A]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/60 via-transparent to-transparent" />
        {/* Subtle particle layer still active */}
        <ParticleField />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-32 pb-16 w-full">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            Sponsorship Opportunities · ONE FM 98.5
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.63 + 0.6)) * 12 + 2),
                  backgroundColor: 'rgba(201,162,39,0.36)',
                  animation: `freq-bar ${0.71 + (i % 6) * 0.13}s ${(i * 0.088) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Partner" as="span" className="block text-one-white" delay={0.15} stagger={0.12} />
            <WordReveal text="with ONE." as="span" className="block text-one-gold" delay={0.4} stagger={0.1} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: easeOutExpo }}
            className="font-body text-one-white/70 max-w-[520px] mb-10"
          >
            Premium sponsorship opportunities tailored to your brand. From local businesses to national campaigns — we build packages that deliver results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: easeOutExpo }}
            className="flex flex-wrap gap-8 mb-10"
          >
            {[
              { num: 500, label: 'Active Partners', suffix: '+' },
              { num: stationStats.weeklyListeners, label: 'Weekly Listeners', suffix: '' },
              { num: stationStats.broadcastPopulation, label: 'People Reached', suffix: '' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                <div>
                  <div className="font-stat text-gold-gradient">
                    <AnimatedNumber value={s.num} suffix={s.suffix || ''} />
                  </div>
                  <div className="font-label text-muted mt-1">{s.label}</div>
                </div>
                {i < 2 && <div className="hidden sm:block w-px h-10 bg-one-border/40" />}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0, ease: easeOutExpo }}
            className="flex flex-wrap gap-4"
          >
            <MagneticButton strength={10} cursorLabel="BUILD">
              <button onClick={() => scrollTo('builder')} className="btn-primary">
                Build Custom Package
              </button>
            </MagneticButton>
            <MagneticButton strength={8} cursorLabel="COMPARE">
              <button onClick={() => scrollTo('tiers')} className="text-one-gold font-label hover:text-one-gold transition-colors link-hover">
                View Tier Comparison →
              </button>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      <CredibilityStrip />

      {/* ── Sponsorship Marquee Strip ── */}
      <div className="bg-[#020810] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={28}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">LIVE READS · SPOT ADS · SPONSORSHIP PACKAGES</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">500+ ACTIVE PARTNERS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">GOULBURN VALLEY · VICTORIA</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">94% RENEWAL RATE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">COMMUNITY RADIO · {stationStats.yearsBroadcasting} YEARS ON AIR</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">{stationStats.broadcastPopulation.toLocaleString()} PEOPLE REACHED</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">CALLSIGN: 3ONE · ACMA LICENSED</span>,
          ]}
        />
      </div>

      {/* ── Sponsorship Gallery ── */}
      <SponsorGallery />

      {/* ── Section 2: Tiers ── */}
      <section id="tiers" className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="PACKAGES">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <WordReveal text="SPONSORSHIP TIERS" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mb-6">Choose your level of partnership</p>
            <div className="inline-flex items-center gap-3 bg-one-navy rounded-full p-1 border border-one-border">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-full font-label text-xs transition-all ${!isAnnual ? 'bg-one-gold text-one-navy' : 'text-muted'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-full font-label text-xs transition-all ${isAnnual ? 'bg-one-gold text-one-navy' : 'text-muted'}`}
              >
                Annual
              </button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {tierMap.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: tier.key === 'championPartner' ? -12 : 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.12 + (tier.key === 'championPartner' ? 0.2 : 0), ease: easeOutExpo }}
                whileHover={{ y: tier.key === 'championPartner' ? -16 : -6 }}
                className={`glass-card p-6 relative ${tier.key === 'championPartner' ? 'border-one-gold/40 shadow-glow' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-one-gold text-one-navy font-label text-[10px] px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                <h3 className={`font-h2 ${tier.color} mb-2`}>{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isAnnual ? 'a' : 'm'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="font-stat text-gold-gradient"
                    >
                      ${isAnnual ? tier.annual.toLocaleString() : tier.monthly.toLocaleString()}
                    </motion.span>
                  </AnimatePresence>
                  <span className="font-label text-muted">/{isAnnual ? 'yr' : 'mo'}</span>
                </div>
                {isAnnual && tier.key !== 'signaturePartner' && (
                  <span className="inline-block bg-one-gold/20 text-one-gold font-label text-[10px] px-2 py-0.5 rounded mb-3">
                    {tier.key === 'communityPartner' ? '10%' : 'Save 8%'} savings
                  </span>
                )}
                <p className="font-body-small text-one-white mb-5">{tier.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className="text-one-gold mt-0.5 shrink-0" />
                      <span className="font-body-small text-one-white">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelectedTier(tier.key); scrollTo('builder') }}
                  className={`w-full ${tier.ctaStyle === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Select {tier.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Package Builder ── */}
      <section id="builder" className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="BUILD PACKAGE">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <WordReveal text="BUILD YOUR PACKAGE" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mb-4">Customize every element of your sponsorship</p>
            <AnimatePresence>
              {showSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: easeOutBack }}
                  className="glass-card inline-flex items-center gap-3 px-4 py-3 text-left border-l-2 border-l-one-gold max-w-xl mx-auto"
                >
                  <Sparkles size={16} className="text-one-gold shrink-0" />
                  <span className="font-body-small text-one-white">
                    Based on your industry <strong className="text-one-white">[{industry}]</strong>, we recommend: <strong className="text-one-gold">Silver + Event Sponsorship</strong>
                  </span>
                  <button onClick={() => setShowSuggestion(false)} className="text-muted hover:text-one-white shrink-0">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left builder */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Base Tier */}
              <div className="glass-card p-5">
                <h4 className="font-h4 text-one-white mb-3">Base Tier</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tierMap.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTier(t.key)}
                      className={`px-4 py-2 rounded-lg font-label text-xs border transition-all ${
                        selectedTier === t.key
                          ? 'bg-one-gold text-one-navy border-one-gold'
                          : 'bg-transparent text-one-white border-one-border hover:border-one-gold/50'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(tierMap.find((t) => t.key === selectedTier)?.features || []).slice(0, 4).map((f) => (
                    <span key={f} className="font-micro text-one-gold bg-one-gold/10 px-2 py-1 rounded">{f}</span>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div className="glass-card p-5">
                <h4 className="font-h4 text-one-white mb-3">Add-On Modules</h4>
                <div className="space-y-3">
                  {addOns.map((a) => (
                    <label
                      key={a.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedAddons[a.key]
                          ? 'border-one-gold/60 bg-one-gold/5'
                          : 'border-one-border hover:border-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedAddons[a.key] ? 'bg-one-gold border-one-gold' : 'border-muted'}`}>
                        {selectedAddons[a.key] && <Check size={12} className="text-one-navy" />}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!selectedAddons[a.key]}
                        onChange={() => toggleAddon(a.key)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body-small text-one-white">{a.name}</span>
                          <span className="font-mono text-sm text-one-gold">${a.price}/mo</span>
                        </div>
                      </div>
                      <Info size={14} className="text-muted shrink-0" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="glass-card p-5">
                <h4 className="font-h4 text-one-white mb-3">Campaign Duration</h4>
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-8 h-8 rounded-full border border-one-border flex items-center justify-center text-one-white hover:border-one-gold transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-stat text-gold-gradient w-16 text-center">{duration}</span>
                  <span className="font-label text-muted">months</span>
                  <button onClick={() => setDuration(Math.min(12, duration + 1))} className="w-8 h-8 rounded-full border border-one-border flex items-center justify-center text-one-white hover:border-one-gold transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { min: 3, label: '3+ months: 5% off' },
                    { min: 6, label: '6+ months: 10% off' },
                    { min: 12, label: '12 months: 15% off' },
                  ].map((d) => (
                    <span
                      key={d.min}
                      className={`font-micro px-2 py-1 rounded border ${
                        duration >= d.min ? 'border-data-teal text-data-teal bg-data-teal/10' : 'border-one-border text-muted'
                      }`}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="glass-card p-5">
                <h4 className="font-h4 text-one-white mb-3">Target Audience</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="skit-demographic" className="font-label text-muted mb-1 block">Primary Demographic</label>
                    <select
                      id="skit-demographic"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-one-navy border border-one-border rounded-lg px-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none transition-colors"
                    >
                      {['18-24', '25-34', '35-44', '45-54', '55+'].map((age) => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="skit-industry" className="font-label text-muted mb-1 block">Industry</label>
                    <select
                      id="skit-industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-one-navy border border-one-border rounded-lg px-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none transition-colors"
                    >
                      {['Retail', 'Automotive', 'Food & Beverage', 'Technology', 'Healthcare', 'Entertainment', 'Other'].map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="font-body-small text-data-teal">
                  Est. {stationStats.weeklyListeners.toLocaleString()} listeners per week across {stationStats.totalTowns} towns
                </p>
              </div>

              {/* Brand Info */}
              <div className="glass-card p-5">
                <h4 className="font-h4 text-one-white mb-3">Brand Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Company Name', 'Contact Name', 'Email', 'Phone'].map((label) => {
                    const fieldId = `skit-${label.toLowerCase().replace(/\s+/g, '-')}`
                    return (
                      <div key={label}>
                        <label htmlFor={fieldId} className="font-label text-muted mb-1 block">{label}</label>
                        <input
                          id={fieldId}
                          type="text"
                          placeholder={label}
                          className="w-full bg-one-navy border border-one-border rounded-lg px-3 py-2.5 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-one-gold/15 transition-all"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right live preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
              className="lg:col-span-2"
            >
              <div className="glass-card p-6 sticky top-24 group relative overflow-hidden">
                <div aria-hidden className="explore-tile-scan" />
                <h3 className="font-h3 text-one-white mb-4">Your Package Summary</h3>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="font-body-small text-one-white">Base ({currentTier.name})</span>
                    <span className="font-mono text-sm text-one-white">${basePrice.toLocaleString()}{isAnnual ? '/yr' : '/mo'}</span>
                  </div>
                  {addOns.filter((a) => selectedAddons[a.key]).map((a) => (
                    <div key={a.key} className="flex justify-between items-center">
                      <span className="font-body-small text-one-white">{a.name}</span>
                      <span className="font-mono text-sm text-one-white">${a.price}/mo</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className="font-body-small text-one-white">Duration</span>
                    <span className="font-mono text-sm text-one-white">{duration} months</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-body-small text-data-teal">Duration Discount</span>
                      <span className="font-mono text-sm text-data-teal">-{Math.round(discount * 100)}%</span>
                    </div>
                  )}
                  <div className="border-t border-one-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-h4 text-one-white">Total</span>
                      <motion.span
                        key={total}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-stat text-gold-gradient"
                      >
                        ${total.toLocaleString()}
                      </motion.span>
                    </div>
                  </div>
                </div>

                {isAnnual && (
                  <div className="bg-one-gold/10 text-one-gold font-label text-xs px-3 py-2 rounded-lg mb-4 text-center">
                    You save ${(currentTier.monthly * 12 - currentTier.annual).toLocaleString()} with annual billing
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full border-2 border-data-teal flex items-center justify-center">
                    <span className="font-mono text-xs text-data-teal">85%</span>
                  </div>
                  <div>
                    <div className="font-label text-data-teal">Audience Match</div>
                    <div className="font-micro text-muted">Based on your selections</div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="font-label text-muted mb-1">Estimated Reach</div>
                  <div className="font-stat text-gold-gradient">
                    <AnimatedNumber value={Math.round(total * (isAnnual ? 0.5 : 2.1))} prefix="~" suffix=" weekly" />
                  </div>
                </div>

                <div className="space-y-3">
                  <button data-cursor-label="GENERATE" className="btn-primary w-full">Generate Proposal</button>
                  <div className="flex gap-3">
                    <button data-cursor-label="SAVE" className="btn-secondary flex-1">
                      <Save size={14} /> Save
                    </button>
                    <button data-cursor-label="SHARE" className="btn-secondary flex-1">
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Partner Showcase ── */}
      <section className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="PARTNER SHOWCASE">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <WordReveal text="TRUSTED BY LEADING BRANDS" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">Local businesses across the Goulburn Valley partner with ONE FM</p>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <TiltCard maxTilt={3}>
            <div className="glass-card p-8 text-center">
              <p className="font-body text-one-white italic mb-4 text-lg">"{communityVoice.quote}"</p>
              <p className="font-h4 text-one-white">{communityVoice.name}</p>
              <p className="font-label text-muted mb-3">{communityVoice.role}</p>
              <p className="font-body-small text-muted text-xs mt-4">
                Sponsor testimonials available on request — contact {BRAND.email}
              </p>
            </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ── Section 5: Reach Estimator (was ROI Calculator) ── */}
      <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="REACH ESTIMATOR">
        <div className="max-w-[1000px] mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <WordReveal text="ESTIMATE YOUR REACH" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">Indicative reach based on {stationStats.weeklyListeners.toLocaleString()} est. weekly listeners — not a guaranteed ROI</p>
          </ScrollReveal>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="glass-card p-6 max-w-[600px] mx-auto mb-6"
          >
            <div className="space-y-4">
              {[
                { label: 'Industry', value: calcIndustry, options: ['Retail', 'Automotive', 'Food & Beverage', 'Technology', 'Healthcare', 'Entertainment', 'Other'], setter: setCalcIndustry },
                { label: 'Campaign Size', value: calcSize, options: ['Community', 'Champion', 'Premier', 'Signature', 'Custom'], setter: setCalcSize },
                { label: 'Target Action', value: calcGoal, options: ['Brand Awareness', 'Lead Generation', 'Event Promotion', 'Product Launch'], setter: setCalcGoal },
              ].map((field, i) => {
                const fieldId = `roi-${field.label.toLowerCase().replace(/\s+/g, '-')}`
                return (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <label htmlFor={fieldId} className="font-label text-muted mb-1.5 block">{field.label}</label>
                    <select
                      id={fieldId}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full bg-one-navy border border-one-border rounded-lg px-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none transition-colors"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </motion.div>
                )
              })}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.24, duration: 0.5 }}
              >
                <label htmlFor="roi-budget" className="font-label text-muted mb-1.5 block">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted">$</span>
                  <input
                    id="roi-budget"
                    type="number"
                    value={calcBudget}
                    onChange={(e) => setCalcBudget(Number(e.target.value))}
                    className="w-full bg-one-navy border border-one-border rounded-lg pl-7 pr-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>
              <button
                onClick={() => setCalcResults(true)}
                data-cursor-label="CALCULATE"
                className="btn-primary w-full mt-2"
              >
                Calculate Reach
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {calcResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
                className="overflow-hidden"
              >
                {(() => {
                  const r = computeROI()
                  return (
                    <div className="glass-card p-6 max-w-[600px] mx-auto space-y-6 group relative overflow-hidden">
                      <div aria-hidden className="explore-tile-scan" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Est. Weekly Reach', value: `~${r.weeklyReach.toLocaleString()}`, color: 'text-data-teal' },
                          { label: 'Est. CPM', value: `$${r.cpm}`, color: 'text-one-gold' },
                          { label: 'Monthly Impressions', value: `~${r.monthlyImpressions.toLocaleString()}`, color: 'text-data-violet' },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className={`font-stat ${stat.color}`}>{stat.value}</div>
                            <div className="font-label text-muted">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      <p className="font-body-small text-muted text-xs text-center">
                        Assumes ~{r.spotsPerMonth} spot impressions/month for {calcSize} tier. Actual results vary — contact us for a tailored proposal.
                      </p>
                      <div className="glass-card p-4 border-l-2 border-l-one-gold">
                        <p className="font-body-small text-one-white">
                          Based on your inputs, we recommend: <strong className="text-one-gold">{calcSize === 'Custom' ? 'Custom Package' : calcSize + ' Partner'} + {calcGoal === 'Event Promotion' ? 'Event Sponsorship' : 'Social Campaign Boost'}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const sizeMap: Record<string, string> = { community: 'communityPartner', champion: 'championPartner', premier: 'premierPartner', signature: 'signaturePartner', custom: 'custom' }
                          setSelectedTier(sizeMap[calcSize.toLowerCase()] || 'championPartner')
                          scrollTo('builder')
                        }}
                        data-cursor-label="BUILD"
                        className="btn-primary w-full"
                      >
                        Build This Package
                      </button>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Section 6: Case Studies ── */}
      <section className="bg-surface-peak section-bleed-top section-padding" data-cursor-label="CASE STUDIES">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <WordReveal text="SPONSORSHIP CHANNELS" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            </div>
            <select
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="bg-one-navy border border-one-border rounded-lg px-3 py-2 font-body-small text-one-white focus:border-one-gold focus:outline-none"
            >
              {['All', 'Broadcast', 'Sport', 'Digital', 'Regional'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </ScrollReveal>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCases.map((cs, i) => (
                <motion.div
                  key={cs.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: easeOutExpo }}
                  whileHover={{ y: -4 }}
                  className="glass-card overflow-hidden group h-full"
                >
                  <div aria-hidden className="explore-tile-scan" />
                  {'link' in cs && cs.link ? (
                    <Link to={cs.link} data-cursor-label="VIEW" className="block h-full">
                      {renderChannelCard(cs)}
                    </Link>
                  ) : (
                    renderChannelCard(cs)
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Section 7: Final CTA ── */}
      <section className="relative bg-surface-glow section-bleed-top section-padding overflow-hidden" data-cursor-label="LET'S TALK">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,150,58,0.03) 20px, rgba(212,150,58,0.03) 21px)' }} />
        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <ScrollReveal>
            <WordReveal text="READY TO GO ON AIR?" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
            <p className="font-body text-one-white mb-8">
              Let's build a sponsorship package that delivers real results for your brand.
            </p>

            {!heroSubmitted ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setHeroSubmitting(true)
                  try {
                    await submitEnquiry({
                      name: heroName,
                      email: heroEmail,
                      subject: 'Sponsorship Kit — Get Started',
                      message: `${heroName} requested sponsorship information via the media kit.`,
                      source: 'sponsorship',
                      enquiryType: 'Sponsorship Enquiry',
                      priority: 'high',
                    })
                    setHeroSubmitted(true)
                    toast.success('Thanks! We\'ll be in touch within 24 hours.')
                  } catch {
                    toast.error('Something went wrong. Please try again.')
                  } finally {
                    setHeroSubmitting(false)
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 mb-4 max-w-lg mx-auto"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  className="flex-1 bg-one-navy border border-one-border rounded-lg px-4 py-3 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-one-gold/15 transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Business Email"
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="flex-1 bg-one-navy border border-one-border rounded-lg px-4 py-3 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-one-gold/15 transition-all"
                  required
                />
                <button type="submit" disabled={heroSubmitting} data-cursor-label={heroSubmitting ? 'SENDING' : 'START'} className="btn-primary whitespace-nowrap">
                  {heroSubmitting ? 'Sending…' : 'Get Started'}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 glass-card border-l-2 border-l-one-gold max-w-lg mx-auto mb-4"
              >
                <Sparkles size={24} className="text-one-gold mx-auto mb-2" />
                <p className="font-h4 text-one-white mb-1">Thanks, {heroName}!</p>
                <p className="font-body-small text-one-white">Our team will be in touch within 24 hours.</p>
              </motion.div>
            )}

            <p className="font-label text-muted mb-4">
              Or call us:{' '}
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} data-cursor-label="CALL" className="text-one-white hover:text-one-gold transition-colors">
                {BRAND.phone}
              </a>
            </p>
            <Link to="/proposal" data-cursor-label="PROPOSAL" className="font-label text-one-gold hover:text-one-gold transition-colors link-hover">
              Prefer to self-serve? Try the Proposal Builder →
            </Link>
          </ScrollReveal>
        </div>
      </section>
      <SponsorCommercialCta
        headline="See your reach before you commit"
        subline="Map 25 communities, compare packages, or speak with our partnerships team."
      />
    </Layout>
  )
}

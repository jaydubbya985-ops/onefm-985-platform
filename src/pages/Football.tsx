import { useState, useEffect, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Check, Star, TrendingUp, Users, Radio, MapPin,
  Target, ArrowRight, Send, Phone, Mail,
  User, Building, MessageSquare, ChevronDown, Sparkles,
  BarChart3, Clock, Shield, Award
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { CinegraphBackground } from '@/components/CinegraphBackground'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { footballTiers, stationStats } from '@/data/pricing'
import { submitEnquiry } from '@/lib/enquiries'
import { BRAND } from '@/lib/brand'
import { toast } from 'sonner'
import { SponsorCommercialCta } from '@/components/SponsorCommercialCta'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { MediaImage } from '@/components/MediaImage'
import { TiltCard } from '@/components/TiltCard'
import { AnimatedNumber } from '@/components/AnimatedNumber'

/* ─── easing helpers ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ─── Particle Canvas (football field themed) ─── */
const ParticleField = memo(function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    const count = 40
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
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
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`
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

/* ─── ScrollReveal wrapper ─── */
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

/* ─── 9-Tier Data (from pricing.ts) ─── */
const tierMeta: Record<string, { key: string; shortName: string; color: string; accent: string; ctaStyle: 'primary' | 'secondary'; popular?: boolean; bestValue?: boolean; crown?: boolean }> = {
  'Community Supporter': { key: 'community-supporter', shortName: 'SUPPORTER', color: 'text-one-white', accent: '#6B6B75', ctaStyle: 'secondary' },
  'Community Partner': { key: 'community-partner', shortName: 'PARTNER', color: 'text-one-gold', accent: '#F0C75E', ctaStyle: 'secondary' },
  'Local Champion': { key: 'local-champion', shortName: 'CHAMPION', color: 'text-one-gold', accent: '#F0C75E', ctaStyle: 'secondary' },
  'Champion Partner': { key: 'champion-partner', shortName: 'CHAMPION+', color: 'text-one-gold', accent: '#D4963A', ctaStyle: 'primary', popular: true },
  'Major Partner': { key: 'major-partner', shortName: 'MAJOR', color: 'text-one-gold', accent: '#D4963A', ctaStyle: 'primary' },
  'Premier Partner': { key: 'premier-partner', shortName: 'PREMIER', color: 'text-one-gold', accent: '#D4963A', ctaStyle: 'primary', bestValue: true },
  'Elite Partner': { key: 'elite-partner', shortName: 'ELITE', color: 'text-one-gold', accent: '#F0C75E', ctaStyle: 'primary' },
  'Signature Partner': { key: 'signature-partner', shortName: 'SIGNATURE', color: 'text-one-white', accent: '#D4A84B', ctaStyle: 'primary' },
  'Naming Rights Partner': { key: 'naming-rights', shortName: 'NAMING', color: 'text-one-white', accent: '#D4A84B', ctaStyle: 'primary', crown: true },
}

const tiers = footballTiers.map((t) => {
  const meta = tierMeta[t.name]
  return {
    key: meta.key,
    name: t.name,
    shortName: meta.shortName,
    price: t.price,
    color: meta.color,
    accent: meta.accent,
    features: t.features,
    ctaStyle: meta.ctaStyle,
    popular: meta.popular,
    bestValue: meta.bestValue,
    badge: t.badge,
    crown: meta.crown,
  }
})

/* ─── ONE FM reach row (sourced from stationStats) ─── */
const roiData = [
  {
    medium: 'ONE FM Football',
    reach: `${stationStats.weeklyListeners.toLocaleString()} est./wk`,
    frequency: 'Sat matchday + drive-time',
    notes: 'GVL live coverage — local trust, loyal audience',
  },
]

/* ─── Regional reach facts (no unsourced age breakdown) ─── */
const reachFacts = [
  { label: 'Est. weekly listeners', value: stationStats.weeklyListeners.toLocaleString() },
  { label: 'Towns in broadcast area', value: String(stationStats.totalTowns) },
  { label: 'Broadcast radius', value: `${stationStats.broadcastRadiusKm} km` },
  { label: 'Area population (2026 est.)', value: stationStats.broadcastPopulation.toLocaleString() },
]

const townData = [
  'Shepparton', 'Mooroopna', 'Tatura', 'Kyabram', 'Numurkah',
  'Nathalia', 'Rushworth', 'Murchison', 'Violet Town', 'Euroa',
  'Seymour', 'Benalla', 'Shepparton East', 'Congupna', 'Undera',
  'Stanhope', 'Girgarre', ' Merrigum', 'Toolamba', 'Dookie',
  'Barmah', 'Picola', 'Wunghnu', 'Katandra', 'Tallygaroopna',
]

/* ─── Community voice ─── */
const communityVoice = {
  quote:
    "When the 2022 floods cut our town off, ONE FM was the only way we knew what was happening. They saved lives, simple as that.",
  name: 'Margaret Tresize',
  role: 'Community Leader, Rochester',
}

/* ─── Enquiry Form Data (from pricing.ts) ─── */
const tierOptions = [
  ...footballTiers.map((t) => `${t.name} ($${t.price}/wk)`),
  'Not sure — need advice',
]

/* ─── GVL Photo Gallery ─── */
const GVL_GALLERY = [
  { src: STATION_PHOTOS.gvlActionSprint,       alt: 'GVL player sprinting at full pace',       caption: 'Full Pace',        className: 'col-span-2 lg:col-span-2 row-span-2' },
  { src: STATION_PHOTOS.gvlPlayerHighFive,     alt: 'Players sharing a high five after the siren', caption: 'The Siren',    className: '' },
  { src: STATION_PHOTOS.commentaryBoxAction,   alt: 'Commentary team calling the action',      caption: 'On the Call',      className: '' },
  { src: STATION_PHOTOS.gvlCrowdStands,        alt: 'Passionate GVL crowd in the stands',      caption: 'The Faithful',     className: '' },
  { src: STATION_PHOTOS.gvlPlayerCelebration,  alt: 'Player celebrating a goal',               caption: 'The Moment',       className: '' },
  { src: STATION_PHOTOS.gvlGoalCelebration,    alt: 'Team goal celebration',                   caption: 'We Score',         className: 'col-span-1 lg:col-span-2' },
]

function GVLGalleryStrip() {
  return (
    <section className="py-20 bg-[#070707]" data-cursor-label="GVL SPORT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="font-label text-one-gold text-[10px] tracking-widest uppercase mb-2">Matchday · In Frame</p>
            <WordReveal text="The Game. The Moment." className="font-h2 text-one-white block" as="h2" stagger={0.05} />
          </div>
          <span className="hidden sm:block font-label text-one-muted text-[10px] tracking-widest uppercase">GVL Coverage</span>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[190px] lg:auto-rows-[210px] gap-3">
          {GVL_GALLERY.map((photo, i) => (
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
                  fallbackSrc={STATION_PHOTOS.gvlNightPanorama}
                  alt={photo.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
export default function Football() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    tier: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitEnquiry({
        name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        company: formData.businessName,
        subject: `GVL Football Sponsorship — ${formData.tier || 'General enquiry'}`,
        message: formData.message || `Interested in ${formData.tier || 'GVL football sponsorship'}.`,
        source: 'football',
        enquiryType: 'GVL Football Sponsorship',
        priority: 'high',
      })
      setSubmitted(true)
      toast.success('Enquiry sent! Our partnerships team will be in touch within 24 hours.')
      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      toast.error('Something went wrong. Please call us on (03) 5831 3131.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }))
  }

  return (
    <Layout>
      <SEO title="GVL Football Sponsorship" description="Partner with ONE FM 98.5 for Goulburn Valley Football & Netball. 9 sponsorship tiers from $25/week." />
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[82vh] flex items-end overflow-hidden bg-[#101010]" data-cursor-label="GAME DAY">
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
          >
            <CinegraphBackground slot="gvlGameDay" opacity={0.6} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/55 via-transparent to-transparent" />
        </div>
        <div aria-hidden className="grain-overlay" />
        <ParticleField />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-32 pb-40 w-full">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            Goulburn Valley Football League Coverage
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
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.65)) * 12 + 3),
                  backgroundColor: 'rgba(201,162,39,0.38)',
                  animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.08) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Football" as="span" className="block text-one-white" delay={0.15} stagger={0.1} />
            <WordReveal text="Sponsorship." as="span" className="block text-one-gold" delay={0.4} stagger={0.08} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: easeOutExpo }}
            className="font-body text-one-white/70 max-w-[520px] mb-10"
          >
            Put your business in front of {stationStats.weeklyListeners.toLocaleString()} weekly listeners across {stationStats.totalTowns} communities
            in the Goulburn Valley. From $25/week to full naming rights — there's a tier for every budget.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: easeOutExpo }}
            className="flex flex-wrap gap-8 mb-10"
          >
            {[
              { num: stationStats.weeklyListeners, label: 'Weekly Listeners', suffix: '' },
              { num: stationStats.totalTowns, label: 'Communities', suffix: '' },
              { num: stationStats.broadcastRadiusKm, label: 'km Radius', suffix: 'km' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                <div>
                  <div className="font-stat text-gold-gradient">
                    <AnimatedNumber value={s.num} suffix={s.suffix} />
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
            <MagneticButton strength={10}>
              <a href="#tiers" data-cursor-label="PACKAGES" className="btn-primary">
                View Packages
              </a>
            </MagneticButton>
            <MagneticButton strength={8}>
              <Link to="/proposal" data-cursor-label="PROPOSAL" className="btn-secondary">
                Build Custom Proposal
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ── Football Marquee Strip ── */}
      <div className="bg-[#070707] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={30}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">GVL FOOTBALL LEAGUE COVERAGE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">LIVE MATCH COMMENTARY</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{stationStats.totalTowns} COMMUNITIES · GOULBURN VALLEY</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">FROM $25/WEEK · NAMING RIGHTS AVAILABLE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">ROUND-BY-ROUND BROADCAST</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">{stationStats.weeklyListeners.toLocaleString()} WEEKLY LISTENERS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">COMMENTARY TEAM · MATCHDAY PRESENCE</span>,
          ]}
        />
      </div>

      {/* ─── GVL Sports Photo Strip ─── */}
      <GVLGalleryStrip />

      {/* ═══════════════════════════════════════════
          SECTION 2 — THE 9 TIERS
          ═══════════════════════════════════════════ */}
      <section id="tiers" className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="BROADCAST PACKAGES">
        <div className="max-w-[1400px] mx-auto px-4">
          <ScrollReveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield size={18} className="text-one-electric" />
              <span className="font-label text-one-electric">9 SPONSORSHIP LEVELS</span>
            </div>
            <WordReveal text="CHOOSE YOUR IMPACT" className="font-h2 text-one-white mb-3 block" as="h2" />
            <p className="font-body-small text-muted max-w-[600px] mx-auto">
              From community supporters to naming rights partners — every dollar goes toward
              supporting local football and getting your brand heard.
            </p>
          </ScrollReveal>

          {/* 9-tier grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: tier.popular || tier.bestValue ? -10 : 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: easeOutExpo }}
                whileHover={{ y: tier.popular || tier.bestValue ? -14 : -6, transition: { duration: 0.3 } }}
                data-cursor-label="SELECT"
                className={`glass-card p-6 relative transition-shadow duration-300 ${
                  tier.popular || tier.bestValue ? 'border-one-gold/40 shadow-glow' : ''
                } ${tier.crown ? 'border-one-gold/50' : ''}`}
                style={tier.crown ? { boxShadow: '0 0 30px rgba(212,168,75,0.2)' } : {}}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className={`font-label text-[10px] px-3 py-1 rounded-full whitespace-nowrap ${
                      tier.crown
                        ? 'bg-one-gold text-one-navy'
                        : tier.bestValue
                        ? 'bg-data-teal text-one-navy'
                        : 'bg-one-gold text-one-navy'
                    }`}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Crown icon for top tier */}
                {tier.crown && (
                  <div className="flex justify-center mb-3">
                    <Award size={32} className="text-one-gold" />
                  </div>
                )}

                {/* Tier name */}
                <h3 className={`font-h3 ${tier.color} mb-1 text-center`}>{tier.name.toUpperCase()}</h3>
                <p className="font-label text-muted text-center mb-4">{tier.shortName} TIER</p>

                {/* Price */}
                <div className="text-center mb-5">
                  <span className="font-stat text-gold-gradient">${tier.price}</span>
                  <span className="font-label text-muted">/week</span>
                  <p className="font-micro text-muted mt-1">${(tier.price * 52).toLocaleString()}/year</p>
                </div>

                {/* Divider */}
                <div className="border-t border-one-border my-4" />

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={15} className="text-one-gold mt-0.5 shrink-0" />
                      <span className="font-body-small text-one-white">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to="/proposal"
                  className={`w-full block text-center ${
                    tier.ctaStyle === 'primary' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Select {tier.shortName}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — ROI COMPARISON
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="ROI COMPARISON">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BarChart3 size={18} className="text-data-teal" />
              <span className="font-label text-data-teal">WHY RADIO WINS</span>
            </div>
            <WordReveal text="BETTER VALUE THAN THE ALTERNATIVES" className="font-h2 text-one-white mb-3 block" as="h2" stagger={0.04} />
            <p className="font-body-small text-muted max-w-[600px] mx-auto">
              See how ONE FM football sponsorship stacks up against other local advertising options.
            </p>
          </ScrollReveal>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-one-border">
                  <th className="text-left py-4 px-4 font-label text-muted">Medium</th>
                  <th className="text-center py-4 px-4 font-label text-muted">Weekly Reach</th>
                  <th className="text-center py-4 px-4 font-label text-muted">Frequency</th>
                  <th className="text-left py-4 px-4 font-label text-muted">Notes</th>
                </tr>
              </thead>
              <tbody>
                {roiData.map((row, i) => (
                  <motion.tr
                    key={row.medium}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                    className="border-b border-one-border bg-one-gold/5"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Radio size={16} className="text-one-gold" />
                        <span className="font-body-small font-medium text-one-gold">{row.medium}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 font-mono text-sm text-one-white">{row.reach}</td>
                    <td className="text-center py-4 px-4 font-body-small text-one-white">{row.frequency}</td>
                    <td className="py-4 px-4 font-body-small text-muted">{row.notes}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <TiltCard maxTilt={3} className="mt-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-5 border-l-2 border-l-one-gold"
          >
            <div className="flex items-start gap-3">
              <TrendingUp size={18} className="text-one-gold shrink-0 mt-0.5" />
              <p className="font-body-small text-one-white">
                ONE FM reaches an estimated <strong className="text-one-gold">{stationStats.weeklyListeners.toLocaleString()}</strong> listeners
                weekly across {stationStats.totalTowns} communities. GVL packages put your brand alongside live match commentary every Saturday.
              </p>
            </div>
          </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — AUDIENCE DATA
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="AUDIENCE DATA">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users size={18} className="text-one-electric" />
              <span className="font-label text-one-electric">WHO IS LISTENING</span>
            </div>
            <WordReveal text="YOUR AUDIENCE, YOUR COMMUNITY" className="font-h2 text-one-white mb-3 block" as="h2" />
            <p className="font-body-small text-muted max-w-[600px] mx-auto">
              ONE FM broadcasts to {stationStats.totalTowns} towns across the Goulburn Valley, covering a projected population of {stationStats.broadcastPopulation.toLocaleString()}.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Regional reach facts */}
            <TiltCard maxTilt={5} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="glass-card p-6 h-full group relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <h4 className="font-h4 text-one-white mb-5">Regional Reach</h4>
              <div className="space-y-4">
                {reachFacts.map((d) => (
                  <div key={d.label} className="flex items-center justify-between border-b border-one-border/50 pb-3 last:border-0">
                    <span className="font-label text-xs text-muted">{d.label}</span>
                    <span className="font-body-small text-one-gold font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            </TiltCard>

            {/* Regional Coverage */}
            <TiltCard maxTilt={5} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
              className="glass-card p-6 h-full group relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <h4 className="font-h4 text-one-white mb-4">{stationStats.totalTowns} Communities Covered</h4>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {townData.map((town, i) => (
                  <motion.span
                    key={town}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.015, duration: 0.3 }}
                    className="font-micro px-2 py-1 rounded bg-one-navy text-one-white border border-one-border"
                  >
                    {town}
                  </motion.span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <MapPin size={14} className="text-one-electric" />
                <span className="font-label text-xs text-one-electric">{stationStats.broadcastRadiusKm}km broadcast radius from Shepparton</span>
              </div>
            </motion.div>
            </TiltCard>

            {/* Listener Habits */}
            <TiltCard maxTilt={5} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
              className="glass-card p-6 h-full group relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <h4 className="font-h4 text-one-white mb-5">Listener Habits</h4>
              <div className="space-y-5">
                {[
                  { icon: Clock, label: 'Peak Footy Hours', value: 'Sat 1pm — 6pm', color: '#F2F2F2' },
                  { icon: Target, label: 'Live Match Coverage', value: 'Every weekend', color: '#B6FF00' },
                  { icon: Radio, label: 'GVL Commentary', value: 'FM 98.5 + stream', color: '#F2F2F2' },
                  { icon: Users, label: 'Est. Weekly Listeners', value: stationStats.weeklyListeners.toLocaleString(), color: '#9B5DE5' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-one-navy flex items-center justify-center">
                        <Icon size={16} style={{ color: item.color }} />
                      </div>
                      <div>
                        <div className="font-label text-xs text-muted">{item.label}</div>
                        <div className="font-body-small text-one-white font-medium">{item.value}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4a — GVL ACTION STRIP
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-deep pt-6 overflow-hidden" data-cursor-label="GVL ACTION">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { src: STATION_PHOTOS.gvlGoalCelebration,     caption: 'GVL — where footy means everything' },
              { src: STATION_PHOTOS.gvlTownersCelebration,  caption: 'ONE FM celebrates every premiership moment' },
            ].map((photo, i) => (
              <motion.div
                key={photo.caption}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative overflow-hidden rounded-xl group"
                style={{ height: 220 }}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div aria-hidden className="explore-tile-scan" />
                <p className="absolute bottom-2 left-3 right-3 font-micro text-one-white/80 leading-tight">{photo.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4b — MATCH DAY PHOTO STRIP
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-mid py-6 overflow-hidden" data-cursor-label="MATCH DAY">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { src: STATION_PHOTOS.commentaryBoxView,    caption: 'Ready for kick-off — the broadcaster\'s view' },
              { src: STATION_PHOTOS.obSetupFull,          caption: 'ONE FM 98.5 on location — every match day' },
              { src: STATION_PHOTOS.commentaryTeamSelfie, caption: 'The broadcast team — live from the box' },
            ].map((photo, i) => (
              <motion.div
                key={photo.caption}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative overflow-hidden rounded-xl group"
                style={{ height: 180 }}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div aria-hidden className="explore-tile-scan" />
                <p className="absolute bottom-2 left-3 right-3 font-micro text-one-white/80 leading-tight">{photo.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="TESTIMONIALS">
        <div className="max-w-[1000px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star size={18} className="text-one-electric" />
              <span className="font-label text-one-electric">LOCAL PROOF</span>
            </div>
            <WordReveal text="COMMUNITY VOICE" className="font-h2 text-one-white mb-3 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">
              Why the Goulburn Valley trusts ONE FM.
            </p>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <TiltCard maxTilt={3}>
            <div className="glass-card p-8 text-center">
              <p className="font-body text-one-white italic mb-6 text-lg leading-relaxed">
                "{communityVoice.quote}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-one-white/10 flex items-center justify-center">
                  <User size={18} className="text-one-muted" />
                </div>
                <div className="text-left">
                  <p className="font-h4 text-one-white">{communityVoice.name}</p>
                  <p className="font-label text-muted text-xs">{communityVoice.role}</p>
                </div>
              </div>
              <p className="font-body-small text-muted text-xs mt-6">
                GVL sponsor testimonials available on request — {BRAND.email}
              </p>
            </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — ENQUIRY FORM
          ═══════════════════════════════════════════ */}
      <section className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="ENQUIRE NOW">
        <div className="max-w-[700px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Send size={18} className="text-data-teal" />
              <span className="font-label text-data-teal">GET STARTED</span>
            </div>
            <WordReveal text="ENQUIRE NOW" className="font-h2 text-one-white mb-3 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">
              Tell us about your business and we'll recommend the perfect sponsorship tier.
            </p>
          </ScrollReveal>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="glass-card p-6 md:p-8"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="ftbl-business" className="font-label text-muted text-xs">Business Name</Label>
                    <div className="relative">
                      <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        id="ftbl-business"
                        placeholder="Your Business"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-one-gold/15"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ftbl-contact" className="font-label text-muted text-xs">Contact Name</Label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        id="ftbl-contact"
                        placeholder="Your Name"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-one-gold/15"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ftbl-email" className="font-label text-muted text-xs">Email</Label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        id="ftbl-email"
                        type="email"
                        placeholder="you@business.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-one-gold/15"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ftbl-phone" className="font-label text-muted text-xs">Phone</Label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        id="ftbl-phone"
                        type="tel"
                        placeholder="04XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-one-gold/15"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ftbl-tier" className="font-label text-muted text-xs">Interested Tier</Label>
                  <div className="relative">
                    <select
                      id="ftbl-tier"
                      value={formData.tier}
                      onChange={(e) => handleInputChange('tier', e.target.value)}
                      className="w-full bg-one-navy border border-one-border rounded-md px-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-one-gold/15 transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>Select a sponsorship tier</option>
                      {tierOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ftbl-message" className="font-label text-muted text-xs">Message</Label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-muted" />
                    <textarea
                      id="ftbl-message"
                      placeholder="Tell us about your business and goals..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={4}
                      className="w-full bg-one-navy border border-one-border rounded-md pl-9 pr-3 py-2.5 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-one-gold/15 transition-all resize-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} data-cursor-label={submitting ? 'SENDING' : 'SEND'} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send size={14} />
                  {submitting ? 'Sending…' : 'Submit Enquiry'}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-data-teal/20 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-data-teal" />
                </div>
                <h3 className="font-h3 text-one-white mb-2">Enquiry Sent!</h3>
                <p className="font-body-small text-one-white">
                  Thanks {formData.contactName || 'there'}! Our sponsorship team will be in touch within 24 hours.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7 — FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="relative bg-surface-glow section-bleed-top section-padding overflow-hidden" data-cursor-label="PARTNER UP">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,150,58,0.03) 20px, rgba(212,150,58,0.03) 21px)',
        }} />

        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={20} className="text-one-gold" />
            </div>
            <WordReveal text="READY TO SPONSOR LOCAL FOOTBALL?" className="font-h2 text-one-white mb-4 block" as="h2" />
            <p className="font-body text-one-white mb-8">
              Join the local businesses keeping community football alive. Every sponsorship
              dollar supports grassroots sport and puts your brand in front of thousands.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/proposal" data-cursor-label="PROPOSAL" className="btn-primary">
                Get Proposal
                <ArrowRight size={14} />
              </Link>
              <Link to="/contact" data-cursor-label="CONTACT" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <SponsorCommercialCta
        headline="Game day meets regional reach"
        subline="Pair GVL football sponsorship with valley-wide FM coverage — see the map or request the media kit."
      />
    </Layout>
  )
}

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Info, X, Star, ArrowRight,
  Share2, Save, Minus, Plus,
  Sparkles, Building2, TrendingUp
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { generalTiers, rateCard } from '@/data/pricing'
import { submitEnquiry } from '@/lib/enquiries'
import { toast } from 'sonner'

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
    color: key === 'communityPartner' ? 'text-one-white' : key === 'championPartner' ? 'text-one-gold' : 'text-one-gold',
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

/* ─── Case Studies ─── */
const caseStudies = [
  {
    id: 1,
    title: 'How Regional Auto Boosted Test Drives 43%',
    industry: 'Automotive',
    stats: ['12-week campaign', '$18,200 budget', '43% lift'],
    desc: 'A targeted drive-time spot campaign drove record foot traffic to regional dealerships.',
  },
  {
    id: 2,
    title: 'Farm Fresh Market Doubled Weekend Sales',
    industry: 'Retail',
    stats: ['8-week campaign', '$8,400 budget', '52% lift'],
    desc: 'Morning show live reads and social mentions transformed weekend trading.',
  },
  {
    id: 3,
    title: 'TechFest Sold Out in 72 Hours',
    industry: 'Events',
    stats: ['4-week blitz', '$12,000 budget', 'Sold out'],
    desc: 'Multi-platform sponsorship with host takeovers created unprecedented buzz.',
  },
  {
    id: 4,
    title: 'HealthFirst Clinic Reached 200K New Patients',
    industry: 'Healthcare',
    stats: ['16-week campaign', '$24,500 budget', '200K reach'],
    desc: 'Sponsored wellness segments established brand trust across the region.',
  },
]

const industryColors: Record<string, string> = {
  Automotive: 'bg-one-gold/20 text-one-gold',
  Retail: 'bg-data-teal/20 text-data-teal',
  Events: 'bg-data-violet/20 text-data-violet',
  Healthcare: 'bg-sage/20 text-sage',
}

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote: 'ONE FM delivered results from week one. Their team understood our brand and built a package that actually worked.',
    name: 'Rowan Farren-Parnell',
    company: 'Regional Auto Group',
    stars: 5,
  },
  {
    quote: 'The ROI calculator was spot on. We renewed for a full year after seeing a 38% increase in brand recall.',
    name: 'Marcus Rivera',
    company: 'Valley Fresh Markets',
    stars: 5,
  },
  {
    quote: 'Working with ONE FM feels like partnering with neighbours who truly care about your success.',
    name: 'Priya Naidoo',
    company: 'Coastline Realty',
    stars: 5,
  },
]

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 1.2 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / (duration * 1000), 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setVal(Math.floor(eased * target))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
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
  const [activeTestimonial, setActiveTestimonial] = useState(0)
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

  /* Testimonial auto-rotate */
  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 6000)
    return () => clearInterval(id)
  }, [])

  const toggleAddon = (key: string) => {
    setSelectedAddons((p) => ({ ...p, [key]: !p[key] }))
  }

  const currentTier = tierMap.find((t) => t.key === selectedTier) || tierMap[1]
  const basePrice = isAnnual ? currentTier.annual : currentTier.monthly
  const addonTotal = addOns.reduce((sum, a) => sum + (selectedAddons[a.key] ? a.price : 0), 0)
  const rawTotal = (basePrice + addonTotal) * (isAnnual ? 1 : duration)
  const discount = duration >= 12 ? 0.15 : duration >= 6 ? 0.10 : duration >= 3 ? 0.05 : 0
  const total = Math.round(rawTotal * (1 - discount))

  const filteredCases = caseFilter === 'All' ? caseStudies : caseStudies.filter((c) => c.industry === caseFilter)

  /* ROI calculation */
  const computeROI = useCallback(() => {
    const sizeMultiplier = calcSize === 'Signature' || calcSize === 'Premier' ? 480 : calcSize === 'Champion' ? 320 : 180
    const reach = Math.round(calcBudget * sizeMultiplier)
    const cpm = (calcBudget / (reach / 1000)).toFixed(1)
    const engagement = Math.round(reach * 0.12)
    const match = Math.min(60 + Math.round(calcBudget / 200), 98)
    const benchmark = Math.round(match - 72)
    return { reach, cpm, engagement, match, benchmark }
  }, [calcBudget, calcSize])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout>
      <SEO title="Sponsorship Packages" description="Partner with ONE FM 98.5. Bronze, Silver, Gold packages. Interactive package builder with ROI calculator." />
      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-one-navy">
        <ParticleField />
        <div className="relative z-10 max-w-[800px] mx-auto px-4 text-center py-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-label text-muted mb-4"
          >
            Home / Sponsorship
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
            className="font-h1 text-one-white mb-6"
          >
            PARTNER WITH ONE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
            className="font-body text-one-white max-w-[600px] mx-auto mb-10"
          >
            Premium sponsorship opportunities tailored to your brand. From local businesses to national campaigns — we build packages that deliver results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
            className="flex flex-wrap justify-center gap-8 mb-10"
          >
            {[
              { num: 500, label: 'Active Partners', suffix: '+' },
              { num: 94, label: 'Renewal Rate', suffix: '%' },
              { num: 2400000, label: 'Weekly Reach', prefix: '', suffix: '' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-stat text-one-gold">
                  <AnimatedCounter target={s.num} prefix={s.prefix || ''} suffix={s.suffix || ''} />
                </div>
                <div className="font-label text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeOutExpo }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button onClick={() => scrollTo('builder')} className="btn-primary">
              Build Custom Package
            </button>
            <button onClick={() => scrollTo('tiers')} className="text-one-gold font-label hover:text-one-gold transition-colors">
              View Tier Comparison →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Tiers ── */}
      <section id="tiers" className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-h2 text-one-white mb-2">SPONSORSHIP TIERS</h2>
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
                      className="font-stat text-one-white"
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
      <section id="builder" className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <h2 className="font-h2 text-one-white mb-2">BUILD YOUR PACKAGE</h2>
            <p className="font-body-small text-muted mb-4">Customize every element of your sponsorship</p>
            <AnimatePresence>
              {showSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: easeOutBack }}
                  className="glass-card inline-flex items-center gap-3 px-4 py-3 text-left border-l-2 border-l-amber max-w-xl mx-auto"
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
                  <span className="font-stat text-one-white w-16 text-center">{duration}</span>
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
                    <label className="font-label text-muted mb-1 block">Primary Demographic</label>
                    <select
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
                    <label className="font-label text-muted mb-1 block">Industry</label>
                    <select
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
                <p className="font-body-small text-data-teal">78% audience match for 25-34 demographic</p>
              </div>

              {/* Brand Info */}
              <div className="glass-card p-5">
                <h4 className="font-h4 text-one-white mb-3">Brand Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Company Name', 'Contact Name', 'Email', 'Phone'].map((label) => (
                    <div key={label}>
                      <label className="font-label text-muted mb-1 block">{label}</label>
                      <input
                        type="text"
                        placeholder={label}
                        className="w-full bg-one-navy border border-one-border rounded-lg px-3 py-2.5 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-amber/15 transition-all"
                      />
                    </div>
                  ))}
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
              <div className="glass-card p-6 sticky top-24">
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
                        className="font-stat text-one-gold"
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
                  <div className="font-stat text-one-white">
                    <AnimatedCounter target={Math.round(total * (isAnnual ? 0.5 : 2.1))} prefix="~" suffix=" weekly" />
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="btn-primary w-full">Generate Proposal</button>
                  <div className="flex gap-3">
                    <button className="btn-secondary flex-1">
                      <Save size={14} /> Save
                    </button>
                    <button className="btn-secondary flex-1">
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
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <h2 className="font-h2 text-one-white mb-2">TRUSTED BY LEADING BRANDS</h2>
            <p className="font-body-small text-muted">Join hundreds of businesses already on air</p>
          </ScrollReveal>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <img
              src="/sponsor-brand-logos.png"
              alt="Partner brand logos"
              className="w-full max-w-3xl mx-auto rounded-xl opacity-80 hover:opacity-100 transition-opacity"
            />
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <p className="font-body text-one-white italic mb-4 text-lg">"{testimonials[activeTestimonial].quote}"</p>
                <p className="font-h4 text-one-gold">{testimonials[activeTestimonial].name}</p>
                <p className="font-label text-muted mb-3">{testimonials[activeTestimonial].company}</p>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                    <Star key={i} size={16} className="text-one-gold fill-gold" />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-one-gold w-6' : 'bg-muted/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: ROI Calculator ── */}
      <section className="bg-gradient-to-b from-onyx to-slate section-padding">
        <div className="max-w-[1000px] mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <h2 className="font-h2 text-one-white mb-2">CALCULATE YOUR IMPACT</h2>
            <p className="font-body-small text-muted">Estimate the reach and ROI of your sponsorship</p>
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
              ].map((field, i) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <label className="font-label text-muted mb-1.5 block">{field.label}</label>
                  <select
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full bg-one-navy border border-one-border rounded-lg px-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none transition-colors"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.24, duration: 0.5 }}
              >
                <label className="font-label text-muted mb-1.5 block">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted">$</span>
                  <input
                    type="number"
                    value={calcBudget}
                    onChange={(e) => setCalcBudget(Number(e.target.value))}
                    className="w-full bg-one-navy border border-one-border rounded-lg pl-7 pr-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>
              <button
                onClick={() => setCalcResults(true)}
                className="btn-primary w-full mt-2"
              >
                Calculate Impact
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
                    <div className="glass-card p-6 max-w-[600px] mx-auto space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Weekly Reach', value: `~${r.reach.toLocaleString()}`, color: 'text-data-teal' },
                          { label: 'CPM', value: `$${r.cpm}`, color: 'text-one-gold' },
                          { label: 'Engagement', value: r.engagement.toLocaleString(), color: 'text-data-violet' },
                          { label: 'Match', value: `${r.match}%`, color: 'text-data-teal' },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className={`font-stat ${stat.color}`}>{stat.value}</div>
                            <div className="font-label text-muted">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-data-teal/10 border border-data-teal/30 rounded-lg">
                        <TrendingUp size={18} className="text-data-teal" />
                        <span className="font-body-small text-data-teal">
                          {r.benchmark > 0 ? `${r.benchmark}% better than industry average` : 'On par with industry average'}
                        </span>
                      </div>
                      <div className="glass-card p-4 border-l-2 border-l-amber">
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
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-h2 text-one-white mb-2">SUCCESS STORIES</h2>
            </div>
            <select
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="bg-one-navy border border-one-border rounded-lg px-3 py-2 font-body-small text-one-white focus:border-one-gold focus:outline-none"
            >
              {['All', 'Retail', 'Automotive', 'Events', 'Technology', 'Healthcare'].map((f) => (
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
                  className="glass-card overflow-hidden group"
                >
                  <div className="h-[200px] bg-one-navy relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 size={48} className="text-muted/30" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`font-micro px-2 py-0.5 rounded ${industryColors[cs.industry] || 'bg-muted/20 text-muted'}`}>
                        {cs.industry}
                      </span>
                    </div>
                    <h3 className="font-h3 text-one-white mb-2 group-hover:text-one-gold transition-colors">{cs.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {cs.stats.map((s) => (
                        <span key={s} className="font-mono text-xs text-one-white">{s}</span>
                      ))}
                    </div>
                    <p className="font-body-small text-one-white line-clamp-2 mb-4">{cs.desc}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold group-hover:gap-2 transition-all">
                      Read Full Story <ArrowRight size={14} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Section 7: Final CTA ── */}
      <section className="relative bg-one-navy section-padding overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,150,58,0.03) 20px, rgba(212,150,58,0.03) 21px)' }} />
        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-h2 text-one-white mb-4">READY TO GO ON AIR?</h2>
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
                  className="flex-1 bg-one-navy border border-one-border rounded-lg px-4 py-3 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-amber/15 transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Business Email"
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="flex-1 bg-one-navy border border-one-border rounded-lg px-4 py-3 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-amber/15 transition-all"
                  required
                />
                <button type="submit" disabled={heroSubmitting} className="btn-primary whitespace-nowrap">
                  {heroSubmitting ? 'Sending…' : 'Get Started'}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 glass-card border-l-2 border-l-amber max-w-lg mx-auto mb-4"
              >
                <Sparkles size={24} className="text-one-gold mx-auto mb-2" />
                <p className="font-h4 text-one-white mb-1">Thanks, {heroName}!</p>
                <p className="font-body-small text-one-white">Our team will be in touch within 24 hours.</p>
              </motion.div>
            )}

            <p className="font-label text-muted mb-4">
              Or call us: <span className="text-one-white">+61 2 5555 0198</span>
            </p>
            <Link to="/proposal" className="font-label text-one-gold hover:text-one-gold transition-colors">
              Prefer to self-serve? Try the Proposal Builder →
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  )
}

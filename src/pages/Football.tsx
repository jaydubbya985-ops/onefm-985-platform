import { useState, useEffect, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Star, TrendingUp, Users, Radio, MapPin,
  Trophy, Target, ArrowRight, Send, Phone, Mail,
  User, Building, MessageSquare, ChevronDown, Sparkles,
  Megaphone, BarChart3, Globe, Clock, Shield, Award, FileText
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { footballTiers, roiComparison, stationStats } from '@/data/pricing'
import { submitEnquiry } from '@/lib/enquiries'
import { toast } from 'sonner'

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
        ctx.fillStyle = `rgba(212,168,75,${p.alpha})`
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

/* ─── ROI Comparison Data (from pricing.ts) ─── */
const roiData = [
  { medium: 'ONE FM Football', cpm: `$${roiComparison.oneFm.cpm.toFixed(2)}`, reach: `${roiComparison.oneFm.reach.toLocaleString()}/wk`, frequency: `${roiComparison.oneFm.frequency}x/wk`, engagement: 'High', trust: roiComparison.oneFm.trust, notes: 'Local trust, loyal audience' },
  { medium: 'Local Newspaper', cpm: `$${roiComparison.newspaper.cpm.toFixed(2)}`, reach: `${roiComparison.newspaper.reach.toLocaleString()}/wk`, frequency: '1x/wk', engagement: 'Low', trust: roiComparison.newspaper.trust, notes: 'Declining readership' },
  { medium: 'Digital Ads (Display)', cpm: `$${roiComparison.digitalAds.cpm.toFixed(2)}`, reach: `${roiComparison.digitalAds.reach.toLocaleString()}/wk`, frequency: 'Variable', engagement: 'Medium', trust: roiComparison.digitalAds.trust, notes: 'Ad-blockers, low CTR' },
  { medium: 'Regional Billboard', cpm: `$${roiComparison.billboard.cpm.toFixed(2)}`, reach: `${roiComparison.billboard.reach.toLocaleString()}/day`, frequency: 'Passive', engagement: 'Low', trust: roiComparison.billboard.trust, notes: 'No targeting, hard to measure' },
  { medium: 'Social Media Ads', cpm: `$${roiComparison.socialMedia.cpm.toFixed(2)}`, reach: `${roiComparison.socialMedia.reach.toLocaleString()}/wk`, frequency: '2-3x/wk', engagement: 'Medium', trust: roiComparison.socialMedia.trust, notes: 'Algorithm changes, fatigue' },
]

/* ─── Audience Demographics ─── */
const demoData = [
  { label: '18-34', value: 32, color: '#D4963A' },
  { label: '35-49', value: 38, color: '#2EC4B6' },
  { label: '50-64', value: 22, color: '#F0C75E' },
  { label: '65+', value: 8, color: '#9B5DE5' },
]

const townData = [
  'Shepparton', 'Mooroopna', 'Tatura', 'Kyabram', 'Numurkah',
  'Nathalia', 'Rushworth', 'Murchison', 'Violet Town', 'Euroa',
  'Seymour', 'Benalla', 'Shepparton East', 'Congupna', 'Undera',
  'Stanhope', 'Girgarre', ' Merrigum', 'Toolamba', 'Dookie',
  'Barmah', 'Picola', 'Wunghnu', 'Katandra', 'Tallygaroopna',
]

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote: "Since sponsoring through ONE FM, our Saturday trade has jumped 35%. The footy crowd knows our name now — it's the best local advertising decision we've made.",
    name: 'Dave O\'Brien',
    company: 'O\'Brien\'s Hardware & Plumbing',
    stars: 5,
    tier: 'Champion Partner',
  },
  {
    quote: "We went with the Premier Partner package and had customers mention they heard our ad during the match call. That direct feedback never happened with online ads.",
    name: 'Maria Santos',
    company: 'Santos Family Bakery',
    stars: 5,
    tier: 'Premier Partner',
  },
  {
    quote: "ONE FM gave us category exclusivity so our competitor couldn't advertise. That's gold in a small town. We've renewed for 3 seasons straight.",
    name: 'Tim Henderson',
    company: 'Henderson Auto Services',
    stars: 5,
    tier: 'Signature Partner',
  },
]

/* ─── Enquiry Form Data (from pricing.ts) ─── */
const tierOptions = [
  ...footballTiers.map((t) => `${t.name} ($${t.price}/wk)`),
  'Not sure — need advice',
]

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
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 8000)
    return () => clearInterval(id)
  }, [])

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
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-one-navy">
        {/* Football field line pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 59px, #D4A84B 59px, #D4A84B 60px)`,
        }} />
        <ParticleField />

        <div className="relative z-10 max-w-[900px] mx-auto px-4 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Trophy size={20} className="text-one-gold" />
            <span className="font-label text-muted">Goulburn Valley Football League Coverage</span>
            <Trophy size={20} className="text-one-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
            className="font-h1 text-one-white mb-6"
          >
            FOOTBALL SPONSORSHIP
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
            className="font-body text-one-white max-w-[600px] mx-auto mb-10"
          >
            Put your business in front of {stationStats.weeklyListeners.toLocaleString()} weekly listeners across {stationStats.totalTowns} communities
            in the Goulburn Valley. From $25/week to full naming rights — there's a tier for every budget.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
            className="flex flex-wrap justify-center gap-8 mb-12"
          >
            {[
              { num: stationStats.weeklyListeners, label: 'Weekly Listeners', suffix: '' },
              { num: stationStats.totalTowns, label: 'Communities Covered', suffix: '' },
              { num: stationStats.broadcastRadiusKm, label: 'Kilometre Radius', suffix: 'km' },
              { num: stationStats.broadcastPopulation, label: 'Area Population (2026)', suffix: '' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-stat text-one-gold">
                  <AnimatedCounter target={s.num} suffix={s.suffix} />
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
            <a href="#tiers" className="btn-primary">
              View Packages
            </a>
            <Link to="/proposal" className="btn-secondary">
              Build Custom Proposal
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — THE 9 TIERS
          ═══════════════════════════════════════════ */}
      <section id="tiers" className="bg-one-navy section-padding">
        <div className="max-w-[1400px] mx-auto px-4">
          <ScrollReveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield size={18} className="text-one-gold" />
              <span className="font-label text-one-gold">9 SPONSORSHIP LEVELS</span>
            </div>
            <h2 className="font-h2 text-one-white mb-3">CHOOSE YOUR IMPACT</h2>
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
                  <span className="font-stat text-one-white">${tier.price}</span>
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
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BarChart3 size={18} className="text-data-teal" />
              <span className="font-label text-data-teal">WHY RADIO WINS</span>
            </div>
            <h2 className="font-h2 text-one-white mb-3">BETTER VALUE THAN THE ALTERNATIVES</h2>
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
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b border-one-border">
                  <th className="text-left py-4 px-4 font-label text-muted">Medium</th>
                  <th className="text-center py-4 px-4 font-label text-muted">CPM</th>
                  <th className="text-center py-4 px-4 font-label text-muted">Weekly Reach</th>
                  <th className="text-center py-4 px-4 font-label text-muted">Frequency</th>
                  <th className="text-center py-4 px-4 font-label text-muted">Engagement</th>
                  <th className="text-center py-4 px-4 font-label text-muted">Trust</th>
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
                    className={`border-b border-one-border ${
                      row.medium === 'ONE FM Football' ? 'bg-one-gold/5' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {row.medium === 'ONE FM Football' && <Radio size={16} className="text-one-gold" />}
                        {row.medium === 'Local Newspaper' && <FileText size={16} className="text-muted" />}
                        {row.medium === 'Digital Ads (Display)' && <Globe size={16} className="text-muted" />}
                        {row.medium === 'Regional Billboard' && <MapPin size={16} className="text-muted" />}
                        {row.medium === 'Social Media Ads' && <Megaphone size={16} className="text-muted" />}
                        <span className={`font-body-small font-medium ${
                          row.medium === 'ONE FM Football' ? 'text-one-gold' : 'text-one-white'
                        }`}>
                          {row.medium}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 font-mono text-sm">
                      <span className={row.medium === 'ONE FM Football' ? 'text-data-teal' : 'text-one-white'}>
                        {row.cpm}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 font-mono text-sm text-one-white">{row.reach}</td>
                    <td className="text-center py-4 px-4 font-body-small text-one-white">{row.frequency}</td>
                    <td className="text-center py-4 px-4">
                      <span className={`font-label text-xs px-2 py-0.5 rounded ${
                        row.engagement === 'High' ? 'bg-data-teal/20 text-data-teal' :
                        row.engagement === 'Medium' ? 'bg-one-gold/20 text-one-gold' :
                        'bg-one-red/10 text-one-red'
                      }`}>
                        {row.engagement}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 font-mono text-sm">
                      <span className={row.medium === 'ONE FM Football' ? 'text-data-teal' : 'text-one-white'}>
                        {row.trust}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Key takeaway */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 glass-card p-5 border-l-2 border-l-amber max-w-2xl mx-auto"
          >
            <div className="flex items-start gap-3">
              <TrendingUp size={18} className="text-one-gold shrink-0 mt-0.5" />
              <p className="font-body-small text-one-white">
                <strong className="text-one-white">The numbers speak for themselves:</strong> ONE FM delivers
                <strong className="text-one-gold"> 4.8x the weekly reach </strong> of the local newspaper at
                <strong className="text-data-teal"> 85% lower CPM</strong>. Local audiences trust their community radio station — 
                that trust transfers to your brand.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — AUDIENCE DATA
          ═══════════════════════════════════════════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users size={18} className="text-one-gold" />
              <span className="font-label text-one-gold">WHO IS LISTENING</span>
            </div>
            <h2 className="font-h2 text-one-white mb-3">YOUR AUDIENCE, YOUR COMMUNITY</h2>
            <p className="font-body-small text-muted max-w-[600px] mx-auto">
              ONE FM broadcasts to {stationStats.totalTowns} towns across the Goulburn Valley, covering a projected population of {stationStats.broadcastPopulation.toLocaleString()}.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Age Demographics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="glass-card p-6"
            >
              <h4 className="font-h4 text-one-white mb-5">Age Breakdown</h4>
              <div className="space-y-4">
                {demoData.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-label text-xs text-one-white">{d.label}</span>
                      <span className="font-label text-xs" style={{ color: d.color }}>{d.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-one-navy rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: easeOutExpo }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Regional Coverage */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
              className="glass-card p-6"
            >
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
                <MapPin size={14} className="text-one-gold" />
                <span className="font-label text-xs text-one-gold">{stationStats.broadcastRadiusKm}km broadcast radius from Shepparton</span>
              </div>
            </motion.div>

            {/* Listener Habits */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
              className="glass-card p-6"
            >
              <h4 className="font-h4 text-one-white mb-5">Listener Habits</h4>
              <div className="space-y-5">
                {[
                  { icon: Clock, label: 'Avg. Listening Time', value: '2h 15m / day', color: '#D4963A' },
                  { icon: Target, label: 'Peak Footy Hours', value: 'Sat 1pm — 6pm', color: '#2EC4B6' },
                  { icon: Radio, label: 'Live Match Coverage', value: 'Every weekend', color: '#F0C75E' },
                  { icon: Users, label: 'Unique Weekly Listeners', value: stationStats.weeklyListeners.toLocaleString(), color: '#9B5DE5' },
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
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1000px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star size={18} className="text-one-gold" />
              <span className="font-label text-one-gold">LOCAL PROOF</span>
            </div>
            <h2 className="font-h2 text-one-white mb-3">WHAT LOCAL SPONSORS SAY</h2>
            <p className="font-body-small text-muted">
              Real businesses across the Goulburn Valley trust ONE FM with their brand.
            </p>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-8 text-center"
              >
                <div className="flex justify-center gap-1 mb-5">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                    <Star key={i} size={18} className="text-one-gold fill-gold" />
                  ))}
                </div>
                <p className="font-body text-one-white italic mb-6 text-lg leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-one-gold/20 flex items-center justify-center">
                    <User size={18} className="text-one-gold" />
                  </div>
                  <div className="text-left">
                    <p className="font-h4 text-one-gold">{testimonials[activeTestimonial].name}</p>
                    <p className="font-label text-muted text-xs">{testimonials[activeTestimonial].company}</p>
                  </div>
                </div>
                <span className="inline-block mt-3 font-micro text-one-gold bg-one-gold/10 px-2 py-0.5 rounded">
                  {testimonials[activeTestimonial].tier}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === activeTestimonial ? 'bg-one-gold w-6' : 'bg-muted/40 hover:bg-muted/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — ENQUIRY FORM
          ═══════════════════════════════════════════ */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[700px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Send size={18} className="text-data-teal" />
              <span className="font-label text-data-teal">GET STARTED</span>
            </div>
            <h2 className="font-h2 text-one-white mb-3">ENQUIRE NOW</h2>
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
                    <Label className="font-label text-muted text-xs">Business Name</Label>
                    <div className="relative">
                      <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        placeholder="Your Business"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-amber/15"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-label text-muted text-xs">Contact Name</Label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        placeholder="Your Name"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-amber/15"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-label text-muted text-xs">Email</Label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        type="email"
                        placeholder="you@business.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-amber/15"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-label text-muted text-xs">Phone</Label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <Input
                        type="tel"
                        placeholder="04XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-9 bg-one-navy border-one-border text-one-white placeholder:text-muted/60 focus:border-one-gold focus:ring-amber/15"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-label text-muted text-xs">Interested Tier</Label>
                  <div className="relative">
                    <select
                      value={formData.tier}
                      onChange={(e) => handleInputChange('tier', e.target.value)}
                      className="w-full bg-one-navy border border-one-border rounded-md px-3 py-2.5 font-body-small text-one-white focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-amber/15 transition-all appearance-none"
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
                  <Label className="font-label text-muted text-xs">Message</Label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-muted" />
                    <textarea
                      placeholder="Tell us about your business and goals..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={4}
                      className="w-full bg-one-navy border border-one-border rounded-md pl-9 pr-3 py-2.5 font-body-small text-one-white placeholder:text-muted/60 focus:border-one-gold focus:outline-none focus:ring-2 focus:ring-amber/15 transition-all resize-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
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
      <section className="relative bg-one-navy section-padding overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,150,58,0.03) 20px, rgba(212,150,58,0.03) 21px)',
        }} />

        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={20} className="text-one-gold" />
            </div>
            <h2 className="font-h2 text-one-white mb-4">READY TO SPONSOR LOCAL FOOTBALL?</h2>
            <p className="font-body text-one-white mb-8">
              Join the local businesses keeping community football alive. Every sponsorship
              dollar supports grassroots sport and puts your brand in front of thousands.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/proposal" className="btn-primary">
                Get Proposal
                <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Waves, Mountain, Building2, TreePine, Sparkles,
  Headphones, Users, ArrowDown, ChevronRight, Radio
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'

/* ─── easing helpers ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 1.5 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
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

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ─── Scroll Reveal ─── */
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

/* ─── Timeline Data ─── */
// Source: ACMA licence records, station history, fm985.com.au
const timeline = [
  {
    year: 1980,
    title: 'Founded',
    desc: 'Goulburn Valley Community Radio Inc. established in Shepparton, Victoria — one of the early community broadcasting organisations in regional Australia.',
    label: 'Foundation',
  },
  {
    year: 1989,
    title: 'Licensed Broadcaster',
    desc: 'Granted community broadcasting licence by ACMA. ONE FM 98.5 (callsign 3ONE) begins licensed transmissions from Shepparton across the Goulburn Murray.',
    label: 'Licensed',
  },
  {
    year: 1990,
    title: 'Multicultural Programming',
    desc: 'ONE FM begins dedicated multicultural programming — Italian, Samoan, and community language shows connecting diverse communities across the Valley.',
    label: 'Community',
  },
  {
    year: 1998,
    title: '24/7 Broadcasting',
    desc: 'Around-the-clock programming launches. Overnight Mix ensures the Valley is never without a voice, even through the night.',
    label: 'Evolution',
  },
  {
    year: 2005,
    title: 'Online Streaming',
    desc: 'ONE FM begins streaming live at fm985.com.au — allowing listeners across Australia and the world to tune in to their Goulburn Murray station.',
    label: 'Innovation',
  },
  {
    year: 2010,
    title: 'GVL Football & Netball',
    desc: 'ONE FM becomes the dedicated broadcast partner for Goulburn Valley Football League, bringing live match commentary to homes across the region every weekend.',
    label: 'Sport',
  },
  {
    year: 2019,
    title: 'SoundCloud Archive',
    desc: 'Interviews and community content made available on SoundCloud, preserving Goulburn Valley voices and making programming accessible after broadcast.',
    label: 'Digital',
  },
  {
    year: 2026,
    title: 'Live & Local — Always',
    desc: 'ONE FM 98.5 continues broadcasting live and local from Shepparton — 24 presenters, 25 communities, one station. The Valley\'s community radio for over 45 years.',
    label: 'Today',
  },
]

/* ─── Regional Data ─── */
const regions = [
  { name: 'ONE FM Breakfast', icon: Waves, color: 'text-one-gold', bg: 'bg-one-gold/10', listeners: 'Mon–Fri', show: 'ONE FM Breakfast', highlight: 'Rotating hosts Mon–Fri mornings' },
  { name: 'The Valley', icon: Mountain, color: 'text-sage', bg: 'bg-sage/10', listeners: 'Daily', show: 'The Country Hour', highlight: 'Agricultural news and markets daily' },
  { name: 'The City', icon: Building2, color: 'text-data-teal', bg: 'bg-data-teal/10', listeners: 'Nightly', show: 'The Night Shift', highlight: 'Live music and late nights' },
  { name: 'The Hinterland', icon: TreePine, color: 'text-data-violet', bg: 'bg-data-violet/10', listeners: 'Weekly', show: 'Community Connect', highlight: 'Local voices across the region' },
]

/* ─── Team Data ─── */
const team = {
  leadership: [{ name: 'Station Manager', role: 'Goulburn Valley Community Radio Inc.', since: 'Since 1989', img: '/assets/images/studio-exterior-rainbow.jpg' }],
  onAir: [
    { name: 'Tim Ahemt', role: 'Breakfast Host (Mon–Tue)', since: '2026', img: '/assets/images/commentary-box-action.jpg' },
    { name: 'Lillian Stone', role: 'Breakfast Host (Wed)', since: '2026', img: '/assets/images/studio-commentary-selfie.jpg' },
    { name: 'Craig Stott', role: 'Breakfast (Thu)', since: '2026', img: '/assets/images/commentary-box-action.jpg' },
    { name: 'Di Hunter', role: 'Breakfast Host (Fri)', since: '2026', img: '/assets/images/studio-sbs-diversity.jpg' },
    { name: 'Johnny P', role: 'Dancing through the decades', since: '4 years on air', img: '/assets/images/commentary-box-action.jpg' },
    { name: 'Rowan Farren-Parnell', role: 'The Regional Voice', since: 'Community advocate', img: '/assets/images/studio-commentary-selfie.jpg' },
  ],
  production: [] as { name: string; role: string; since: string; img: string }[],
  engineering: [] as { name: string; role: string; since: string; img: string }[],
}

/* ─── Future Pillars — real station commitments ─── */
const pillars = [
  { icon: Sparkles, title: 'Live & Local Programming', desc: 'Continuing 45+ years of live local content — real presenters, real community voices, real Goulburn Murray' },
  { icon: Headphones, title: 'Online Streaming', desc: 'Listen anywhere on fm985.com.au, Community Radio Plus app, or direct stream — the Valley travels with you' },
  { icon: Users, title: 'Community Partnership', desc: 'Supporting NFPs, multicultural communities, GVL sport and local business across 25 towns' },
]

/* ─── Social Icons ─── */
const socials = [
  { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z', href: '#' },
  { label: 'TikTok', path: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5', href: '#' },
  { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z', href: '#' },
  { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', href: FACEBOOK_PAGE_URL, external: true },
  { label: 'YouTube', path: 'M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17', href: '#' },
]

/* ═══════════════════════════════════════════ */
/*  MAIN PAGE                                  */
/* ═══════════════════════════════════════════ */
export default function Heritage() {
  const [activeTimeline, setActiveTimeline] = useState(0)
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState<number | null>(null)

  /* Auto-advance timeline on scroll (desktop) */
  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById('timeline-section')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))
      const idx = Math.min(timeline.length - 1, Math.floor(progress * timeline.length))
      setActiveTimeline(idx)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Layout>
      <SEO title="Our Heritage & Community" description="37 years of community broadcasting. ONE FM 98.5's story from 1989 to today." />
      {/* ── Section 1: Hero ── */}
      <section className="relative min-h-[75dvh] flex items-end overflow-hidden bg-[#050D1A]">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0"
        >
          <img
            src="/assets/images/geo-lake-aerial.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ opacity: 0.32 }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A] via-[#050D1A]/55 to-[#050D1A]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050D1A]/50 via-transparent to-[#050D1A]/50" />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-[900px] mx-auto px-6 pb-16 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-12 bg-one-gold/60" />
            <span className="font-label text-one-gold tracking-widest text-xs uppercase">Est. 1989</span>
            <span className="h-px w-12 bg-one-gold/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: easeOutExpo }}
            className="font-heading font-black text-one-white mb-6 drop-shadow-lg leading-[0.95]"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            BORN HERE.<br />BUILT HERE.<br />BELONGS HERE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="font-body text-one-white/50 italic max-w-[600px] mb-10"
          >
            For nearly four decades, ONE FM has been the voice of this region — from the first crackling broadcast to today's multi-platform media network. The technology has evolved. The commitment never changed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex flex-col items-center gap-1"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown size={20} className="text-muted" />
            </motion.div>
            <span className="font-label text-muted">Our Story</span>
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Timeline ── */}
      <section id="timeline-section" className="bg-one-navy py-24 md:py-48">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <h2 className="font-h2 text-one-white mb-2">OUR JOURNEY</h2>
            <p className="font-body-small text-muted">The milestones that shaped ONE FM</p>
          </ScrollReveal>

          {/* Desktop horizontal timeline */}
          <div className="hidden lg:block relative">
            {/* Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.5, ease: easeOutExpo }}
              className="absolute top-[60px] left-0 right-0 h-0.5 bg-one-gold origin-left"
            />

            <div className="flex justify-between relative">
              {timeline.map((node, i) => (
                <motion.div
                  key={node.year}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2, ease: easeOutBack }}
                  className="flex flex-col items-center text-center w-[140px]"
                >
                  <button
                    onClick={() => setActiveTimeline(i)}
                    className={`w-4 h-4 rounded-full border-[3px] border-onyx mb-4 transition-all duration-300 ${
                      activeTimeline === i
                        ? 'bg-one-gold scale-150 shadow-[0_0_20px_rgba(212,150,58,0.4)]'
                        : 'bg-one-gold hover:scale-125'
                    }`}
                  />
                  <span className="font-stat text-one-gold mb-1">{node.year}</span>
                  <h4 className="font-h4 text-one-white mb-1">{node.title}</h4>
                  <p className="font-body-small text-one-white max-w-[140px] mb-2 leading-snug">{node.desc}</p>
                  <span className="font-micro border border-one-border text-muted px-2 py-0.5 rounded">{node.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile vertical timeline */}
          <div className="lg:hidden space-y-4">
            {timeline.map((node, i) => (
              <motion.div
                key={node.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-4"
              >
                <button
                  onClick={() => setMobileTimelineOpen(mobileTimelineOpen === i ? null : i)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-stat text-one-gold text-2xl">{node.year}</span>
                    <h4 className="font-h4 text-one-white">{node.title}</h4>
                  </div>
                  <ChevronRight size={16} className={`text-muted transition-transform ${mobileTimelineOpen === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileTimelineOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="font-body-small text-one-white mt-3 pt-3 border-t border-one-border">{node.desc}</p>
                      <span className="font-micro border border-one-border text-muted px-2 py-0.5 rounded mt-2 inline-block">{node.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Community Impact ── */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left stats */}
            <div className="lg:col-span-2 space-y-8">
              {[
                { num: 500, suffix: '+', label: 'Community Events Covered Annually' },
                { num: 2400000, prefix: '$', suffix: '', label: 'Value of Free Airtime for Causes' },
                { num: 247, prefix: '', suffix: '', label: 'Emergency Alert Network' },
                { num: 12000, suffix: '', label: 'Youth Mentored Through Programs' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.4 }}
                    className="h-0.5 w-12 bg-one-gold origin-left mb-3"
                  />
                  <div className="font-stat text-one-gold">
                    <AnimatedCounter target={stat.num} prefix={stat.prefix || ''} suffix={stat.suffix || ''} duration={1.5} />
                  </div>
                  <div className="font-label text-muted mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Right content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
              className="lg:col-span-3"
            >
              <h2 className="font-h2 text-one-white mb-4">MORE THAN A STATION</h2>
              <p className="font-body text-one-white mb-8">
                ONE FM isn't just a frequency on the dial — it's a community lifeline. When floods hit in 2019, we were the only broadcast still on air for 72 hours. When local businesses struggled in 2020, we provided free advertising to 200+ shops. When young creatives needed a platform, we gave them the mic.
              </p>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: easeOutExpo }}
                className="glass-card border-l-2 border-l-amber p-5 mb-8"
              >
                <p className="font-body text-one-white italic mb-3">
                  "ONE FM was there when no one else was. That antenna on the hill isn't just broadcasting — it's watching over us."
                </p>
                <p className="font-h4 text-one-gold">Maria Santos, Local Business Owner</p>
              </motion.div>

              <div className="flex flex-wrap gap-4">
                <Link to="/sponsorship" className="btn-primary">
                  Partner With Us
                </Link>
                <button className="btn-secondary">
                  Nominate a Cause
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Regional Identity ── */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1400px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-h2 text-one-white mb-2">OUR REGION</h2>
            <p className="font-body-small text-muted">Four unique areas, one voice</p>
          </ScrollReveal>

          {/* Stylized SVG Map */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] md:h-[500px] mb-12 rounded-2xl overflow-hidden bg-one-navy/50 border border-one-border"
          >
            <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="coastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4963A" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#D4963A" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="valleyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7A8B6E" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7A8B6E" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="cityGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#2EC4B6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#2EC4B6" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="hinterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9B5DE5" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Coast — top right blob */}
              <motion.path
                d="M450 20 Q650 10 750 60 Q780 120 720 160 Q600 180 500 140 Q420 100 450 20Z"
                fill="url(#coastGrad)"
                stroke="#D4963A"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0 }}
              />
              {/* Valley — left center */}
              <motion.path
                d="M50 120 Q180 80 280 140 Q320 200 260 260 Q140 280 80 220 Q20 180 50 120Z"
                fill="url(#valleyGrad)"
                stroke="#7A8B6E"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.2 }}
              />
              {/* City — center */}
              <motion.path
                d="M320 160 Q440 130 520 180 Q560 240 500 300 Q400 320 340 280 Q280 240 320 160Z"
                fill="url(#cityGrad)"
                stroke="#2EC4B6"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
              {/* Hinterland — bottom right */}
              <motion.path
                d="M550 220 Q680 200 740 260 Q780 320 720 370 Q620 390 560 340 Q500 300 550 220Z"
                fill="url(#hinterGrad)"
                stroke="#9B5DE5"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.6 }}
              />

              {/* Labels */}
              <text x="620" y="100" fill="#D4963A" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">The Coast</text>
              <text x="170" y="190" fill="#7A8B6E" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">The Valley</text>
              <text x="420" y="240" fill="#2EC4B6" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">The City</text>
              <text x="650" y="300" fill="#9B5DE5" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">The Hinterland</text>
            </svg>
          </motion.div>

          {/* Region cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region, i) => {
              const Icon = region.icon
              return (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: easeOutExpo }}
                  whileHover={{ y: -4 }}
                  className="glass-card p-5 text-center group"
                >
                  <div className={`w-12 h-12 rounded-xl ${region.bg} flex items-center justify-center mx-auto mb-3 group-hover:rotate-6 transition-transform duration-200`}>
                    <Icon size={24} className={region.color} />
                  </div>
                  <h4 className="font-h4 text-one-white mb-1">{region.name}</h4>
                  <div className={`font-stat ${region.color} mb-1`}>{region.listeners}</div>
                  <div className="font-label text-muted mb-1">Listeners</div>
                  <div className="font-body-small text-one-white mb-2">Top show: <span className="text-one-white">{region.show}</span></div>
                  <div className="font-micro text-muted">{region.highlight}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Team ── */}
      <section className="bg-one-navy section-padding">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-h2 text-one-white mb-2">THE PEOPLE BEHIND THE SIGNAL</h2>
            <p className="font-body-small text-muted">Engineers, producers, hosts, and storytellers</p>
          </ScrollReveal>

          <div className="space-y-12">
            {/* Leadership */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-label text-one-gold mb-4"
              >
                LEADERSHIP
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.leadership.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                    className="group relative"
                  >
                    <div className="overflow-hidden rounded-2xl mb-3">
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-[280px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none rounded-2xl" />
                    </div>
                    <h4 className="font-h4 text-one-white">{member.name}</h4>
                    <p className="font-label text-one-gold">{member.role}</p>
                    <p className="font-body-small text-muted">{member.since}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250 mt-1">
                      Bio →
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* On-Air */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-label text-one-gold mb-4"
              >
                ON-AIR
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.onAir.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                    className="group relative"
                  >
                    <div className="overflow-hidden rounded-2xl mb-3">
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-[280px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none rounded-2xl" />
                    </div>
                    <h4 className="font-h4 text-one-white">{member.name}</h4>
                    <p className="font-label text-one-gold">{member.role}</p>
                    <p className="font-body-small text-muted">{member.since}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250 mt-1">
                      Bio →
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Production */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-label text-one-gold mb-4"
              >
                PRODUCTION
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.production.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                    className="group relative"
                  >
                    <div className="overflow-hidden rounded-2xl mb-3">
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-[280px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none rounded-2xl" />
                    </div>
                    <h4 className="font-h4 text-one-white">{member.name}</h4>
                    <p className="font-label text-one-gold">{member.role}</p>
                    <p className="font-body-small text-muted">{member.since}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250 mt-1">
                      Bio →
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Engineering */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-label text-one-gold mb-4"
              >
                ENGINEERING
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.engineering.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                    className="group relative"
                  >
                    <div className="overflow-hidden rounded-2xl mb-3">
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-[280px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none rounded-2xl" />
                    </div>
                    <h4 className="font-h4 text-one-white">{member.name}</h4>
                    <p className="font-label text-one-gold">{member.role}</p>
                    <p className="font-body-small text-muted">{member.since}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250 mt-1">
                      Bio →
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Looking Forward ── */}
      <section className="bg-gradient-to-b from-slate to-onyx section-padding">
        <div className="max-w-[1000px] mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-h2 text-one-white mb-4">THE NEXT CHAPTER</h2>
            <p className="font-body text-one-white mb-12 max-w-[700px] mx-auto">
              AI-powered programming. Predictive audience analytics. Smart sponsorship matching. Interactive broadcast experiences. The future of regional radio isn't about replacing what makes us special — it's about amplifying it. We're building the most advanced community media platform in the country, without losing the human connection that got us here.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6, ease: easeOutExpo }}
                  whileHover={{ y: -4 }}
                  className="glass-card p-6 text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-one-gold/10 flex items-center justify-center mb-4 group-hover:shadow-[0_0_24px_rgba(212,150,58,0.25)] transition-shadow duration-200">
                    <Icon size={24} className="text-one-gold group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <h3 className="font-h3 text-one-white mb-2">{pillar.title}</h3>
                  <p className="font-body-small text-one-white">{pillar.desc}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/broadcast" className="btn-secondary">
              Explore the Tech
            </Link>
            <Link to="/sponsorship" className="btn-primary">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 7: CTA / Connect ── */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/images/community-outdoor-market.jpg"
            alt="Community event"
            className="w-full h-full object-cover opacity-15"
            style={{ position: 'fixed', top: 0, left: 0 }}
          />
        </div>
        <div className="absolute inset-0 bg-one-navy/80" />

        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-h2 text-one-white mb-4">BE PART OF THE STORY</h2>
            <p className="font-body text-one-white mb-8">
              Whether you're a listener, a partner, or a community champion — there's a place for you in the ONE FM story.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Link to="/" className="btn-primary">
                <Radio size={16} /> Listen Live
              </Link>
              <Link to="/sponsorship" className="btn-secondary">
                Sponsor
              </Link>
              <a href="mailto:hello@onefm.station" className="font-label text-one-gold hover:text-one-gold transition-colors flex items-center gap-1">
                Contact Us <ChevronRight size={14} />
              </a>
            </div>

            <div className="flex justify-center gap-4">
              {socials.map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  {...('external' in social && social.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: easeOutBack }}
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-one-white hover:bg-one-gold hover:text-one-navy transition-colors duration-200"
                  aria-label={social.label}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.path} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  )
}


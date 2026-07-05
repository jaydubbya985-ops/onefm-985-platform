import { useState, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Waves, Mountain, Building2, TreePine, Sparkles,
  Headphones, Users, ArrowDown, ChevronRight, Radio
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { HorizontalGallery } from '@/components/HorizontalGallery'
import { CredibilityStrip } from '@/components/home/CredibilityStrip'
import { LatestInterviews } from '@/components/LatestInterviews'
import { TiltCard } from '@/components/TiltCard'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { stationStats } from '@/data/pricing'

/* â”€â”€â”€ easing helpers â”€â”€â”€ */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* â”€â”€â”€ Scroll Reveal â”€â”€â”€ */
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

/* â”€â”€â”€ Timeline Data â”€â”€â”€ */
// Source: ACMA licence records, station history, fm985.com.au
const timeline = [
  {
    year: 1980,
    title: 'Founded',
    desc: 'Goulburn Valley Community Radio Inc. established in Shepparton, Victoria â€” one of the early community broadcasting organisations in regional Australia.',
    label: 'Foundation',
    img: '/assets/images/heritage-original-panel-1988.jpg',
    imgCaption: 'The original mixing panel, built in 1988',
  },
  {
    year: 1989,
    title: 'Licensed Broadcaster',
    desc: 'Granted community broadcasting licence by ACMA. ONE FM 98.5 (callsign 3ONE) begins licensed transmissions from Shepparton across the Goulburn Murray.',
    label: 'Licensed',
    img: '/assets/images/heritage-ob-mall-1989.jpg',
    imgCaption: 'Live OB broadcast at the Shepparton Mall opening, 1989',
  },
  {
    year: 1990,
    title: 'Multicultural Programming',
    desc: 'ONE FM begins dedicated multicultural programming â€” Italian, Samoan, and community language shows connecting diverse communities across the Valley.',
    label: 'Community',
    img: '/assets/images/heritage-sally-nayler-90s.jpg',
    imgCaption: 'Sally Nayler on air in Studio A, Shepparton East, 1990s',
  },
  {
    year: 1998,
    title: '24/7 Broadcasting',
    desc: 'Around-the-clock programming launches. Overnight Mix ensures the Valley is never without a voice, even through the night.',
    label: 'Evolution',
    img: undefined as string | undefined,
    imgCaption: undefined as string | undefined,
  },
  {
    year: 2005,
    title: 'Online Streaming',
    desc: 'ONE FM begins streaming live at fm985.com.au â€” allowing listeners across Australia and the world to tune in to their Goulburn Murray station.',
    label: 'Innovation',
    img: '/assets/images/heritage-truck-2005.jpg',
    imgCaption: 'The ONE FM outside broadcast truck, 2005',
  },
  {
    year: 2010,
    title: 'GVL Football & Netball',
    desc: 'ONE FM becomes the dedicated broadcast partner for Goulburn Valley Football League, bringing live match commentary to homes across the region every weekend.',
    label: 'Sport',
    img: undefined as string | undefined,
    imgCaption: undefined as string | undefined,
  },
  {
    year: 2019,
    title: 'SoundCloud Archive',
    desc: 'Interviews and community content made available on SoundCloud, preserving Goulburn Valley voices and making programming accessible after broadcast.',
    label: 'Digital',
    img: undefined as string | undefined,
    imgCaption: undefined as string | undefined,
  },
  {
    year: 2026,
    title: 'Live & Local â€” Always',
    desc: 'ONE FM 98.5 continues broadcasting live and local from Shepparton â€” 24 presenters, 25 communities, one station. The Valley\'s community radio for over 45 years.',
    label: 'Today',
    img: undefined as string | undefined,
    imgCaption: undefined as string | undefined,
  },
]

/* â”€â”€â”€ Regional Data â”€â”€â”€ */
const regions = [
  { name: 'The Coast', icon: Waves, color: 'text-one-gold', bg: 'bg-one-gold/10', listeners: 'Daily', show: 'ONE FM Breakfast', highlight: 'Murray River communities and lakeside towns' },
  { name: 'The Valley', icon: Mountain, color: 'text-sage', bg: 'bg-sage/10', listeners: 'Daily', show: 'The Country Hour', highlight: 'Agricultural news and markets daily' },
  { name: 'The City', icon: Building2, color: 'text-data-teal', bg: 'bg-data-teal/10', listeners: 'Nightly', show: 'The Night Shift', highlight: 'Live music and late nights' },
  { name: 'The Hinterland', icon: TreePine, color: 'text-data-violet', bg: 'bg-data-violet/10', listeners: 'Weekly', show: 'Community Connect', highlight: 'Local voices across the region' },
]

/* â”€â”€â”€ Team Data â”€â”€â”€ */
const team = {
  leadership: [{ name: 'Station Manager', role: 'Goulburn Valley Community Radio Inc.', since: 'Since 1989', img: '/assets/images/studio-exterior-rainbow.jpg' }],
  onAir: [
    { name: 'Tim Ahemt', role: 'Breakfast Host (Monâ€“Tue)', since: '2026', img: '/assets/images/commentary-box-action.jpg', realPhoto: false },
    { name: 'Lillian Stone', role: 'Breakfast Host (Wed)', since: '2026', img: '/assets/images/studio-commentary-selfie.jpg', realPhoto: false },
    { name: 'Craig Stott', role: 'Breakfast (Thu)', since: '2026', img: '/assets/images/commentary-box-action.jpg', realPhoto: false },
    { name: 'Di Hunter', role: 'Breakfast Host (Fri)', since: '2026', img: '/assets/images/heritage-di-hunter-carols-2014.jpg', realPhoto: true },
    { name: 'Johnny P', role: 'Dancing through the decades', since: '4 years on air', img: '/assets/images/commentary-box-action.jpg', realPhoto: false },
    { name: 'Rowan Farren-Parnell', role: 'The Regional Voice', since: 'Community advocate', img: '/assets/images/studio-commentary-selfie.jpg', realPhoto: false },
  ],
  production: [] as { name: string; role: string; since: string; img: string }[],
  engineering: [] as { name: string; role: string; since: string; img: string }[],
}

/* â”€â”€â”€ Future Pillars â€” real station commitments â”€â”€â”€ */
const pillars = [
  { icon: Sparkles, title: 'Live & Local Programming', desc: 'Continuing 45+ years of live local content â€” real presenters, real community voices, real Goulburn Murray' },
  { icon: Headphones, title: 'Online Streaming', desc: 'Listen anywhere on fm985.com.au, Community Radio Plus app, or direct stream â€” the Valley travels with you' },
  { icon: Users, title: 'Community Partnership', desc: 'Supporting NFPs, multicultural communities, GVL sport and local business across 25 towns' },
]

/* â”€â”€â”€ Social Icons â”€â”€â”€ */
const socials = [
  { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z', href: '#' },
  { label: 'TikTok', path: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5', href: '#' },
  { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z', href: '#' },
  { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', href: FACEBOOK_PAGE_URL, external: true },
  { label: 'YouTube', path: 'M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17', href: '#' },
]

/* â”€â”€â”€ Deterministic gradient avatar â”€â”€â”€ */
const HERITAGE_PALETTES = [
  { from: '#1B458F', to: '#101010', accent: '#F2F2F2' },
  { from: '#F2F2F2', to: '#1B3A6F', accent: '#FFF8DC' },
  { from: '#E51636', to: '#1A0A20', accent: '#FF9BAA' },
  { from: '#B6FF00', to: '#0A2030', accent: '#7FFFD4' },
  { from: '#9B5DE5', to: '#1A0A30', accent: '#DDB3FF' },
  { from: '#FF6B6B', to: '#2A0A10', accent: '#FFB3B3' },
  { from: '#1B458F', to: '#0D2A18', accent: '#6EE7B7' },
]

function getHeritageMemberAvatar(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 37 + name.charCodeAt(i)) >>> 0
  const palette = HERITAGE_PALETTES[hash % HERITAGE_PALETTES.length]
  const words = name.trim().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
  const initials = words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[words.length - 1][0]).toUpperCase()
  return { ...palette, initials }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/*  MAIN PAGE                                  */
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Heritage() {
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState<number | null>(null)
  const hScrollRef = useRef<HTMLElement>(null)
  const hTrackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  /* Pinned horizontal scroll â€” desktop only, respects reduced-motion */
  useLayoutEffect(() => {
    const section = hScrollRef.current
    const track = hTrackRef.current
    if (!section || !track) return
    if (window.matchMedia('(max-width: 1023px)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Force above HorizontalGallery's sticky/will-change compositing layer
    section.style.zIndex = '20'

    const ctx = gsap.context(() => {
      const getScrollDist = () => track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: () => -getScrollDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDist()}`,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <Layout>
      <SEO title="Our Heritage & Community" description={`${stationStats.yearsBroadcasting} years of community broadcasting. ONE FM 98.5's story from 1989 to today.`} />
      {/* â”€â”€ Section 1: Hero â”€â”€ */}
      <section ref={heroRef} className="relative min-h-[75dvh] flex items-end overflow-hidden bg-[#101010]" data-cursor-label="EXPLORE">
        {/* Scroll parallax wrapper â€” extends 28% above so image never gaps when shifted down */}
        <motion.div
          style={{ y: heroImgY, top: '-28%', bottom: 0, left: 0, right: 0, position: 'absolute', willChange: 'transform' }}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0"
          >
            <img
              src="/assets/images/geo-cyclists-canola.jpg"
              alt=""
              aria-hidden
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover object-center"
              style={{ opacity: 0.72 }}
            />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/30 via-transparent to-[#101010]/30" />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-[900px] mx-auto px-6 pb-40 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 mb-4"
          >
            <span className="h-px w-12 bg-one-gold/60" />
            <span className="font-label text-one-gold tracking-widest text-xs uppercase">Est. 1989</span>
            <span className="h-px w-12 bg-one-gold/60" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex items-end gap-[1.5px] mb-6"
            aria-hidden
          >
            {Array.from({ length: 22 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 2 + Math.floor(Math.abs(Math.sin(i * 0.55 + 1)) * 14 + 2),
                  backgroundColor: 'rgba(212,175,55,0.32)',
                  animation: `freq-bar ${0.75 + (i % 5) * 0.14}s ${(i * 0.09) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: easeOutExpo }}
            className="font-heading font-black mb-6 drop-shadow-lg leading-[0.95]"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <span className="text-one-white block">BORN HERE.</span>
            <span className="text-one-white block">BUILT HERE.</span>
            <span className="text-gold-gradient block">BELONGS HERE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="font-body text-one-white/50 italic max-w-[600px] mb-10"
          >
            For nearly four decades, ONE FM has been the voice of this region â€” from the first crackling broadcast to today's multi-platform media network. The technology has evolved. The commitment never changed.
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

      {/* â”€â”€ Heritage Marquee Strip â”€â”€ */}
      <div className="bg-[#070707] border-y border-one-border/20 py-3 overflow-hidden">
        <Marquee
          speed={28}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">EST. 1989</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">CALLSIGN: 3ONE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-electric/85">{stationStats.yearsBroadcasting} YEARS ON AIR</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{stationStats.broadcastPopulation.toLocaleString()} PEOPLE REACHED</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">GOULBURN VALLEY Â· VICTORIA</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">24/7 BROADCAST</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-electric/85">COMMUNITY RADIO</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM Â· SHEPPARTON</span>,
          ]}
        />
      </div>

      {/* â”€â”€ Station Fact Bar â”€â”€ */}
      <CredibilityStrip />

      {/* â”€â”€ Section 1.5: Station Archive â€” full-screen sticky horizontal gallery â”€â”€ */}
      <HorizontalGallery />

      {/* â”€â”€ Section 2: Timeline â€” pinned horizontal scroll (desktop) â”€â”€ */}
      <section
        ref={hScrollRef}
        id="timeline-section"
        className="hidden lg:block relative bg-[#040C1A]"
        style={{ zIndex: 20 }}
        data-cursor-label="SCROLL"
      >
        <div
          ref={hTrackRef}
          className="flex h-screen items-stretch will-change-transform bg-[#040C1A]"
          style={{ width: `${35 + timeline.length * 42}vw` }}
        >
          {/* Intro panel */}
          <div className="w-[35vw] h-full flex flex-col justify-center pl-[8vw] pr-12 shrink-0 border-r border-one-border/20">
            <span className="section-label mb-5">Heritage</span>
            <h2
              className="font-heading font-black text-one-white leading-none"
              style={{ fontSize: 'clamp(3rem, 5.5vw, 5rem)', letterSpacing: '-0.03em' }}
            >
              OUR<br />JOURNEY
            </h2>
            <div className="w-12 h-0.5 bg-one-gold/60 my-6" />
            <p className="font-body text-one-white/35 text-sm max-w-[24ch] leading-relaxed">
              {timeline[0].year}â€“{timeline[timeline.length - 1].year}<br />
              {timeline.length} milestones that shaped the Valley's voice.
            </p>
            <div className="flex items-center gap-2 mt-10 text-one-white/20">
              <Radio size={12} />
              <span className="font-label text-[9px] tracking-[0.22em]">SCROLL TO EXPLORE</span>
            </div>
          </div>

          {/* Timeline cards */}
          {timeline.map((node, i) => (
            <div
              key={node.year}
              className="w-[42vw] h-full flex items-center px-14 shrink-0 border-r border-one-border/15 relative overflow-hidden"
            >
              {/* Year as background texture, or archival photo when available */}
              {node.img ? (
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                  <img
                    src={node.img}
                    alt=""
                    loading="lazy"
                    className="absolute right-0 top-0 h-full w-[58%] object-cover"
                    style={{ filter: 'grayscale(0.35) sepia(0.18) brightness(0.6)', opacity: 0.6 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, rgba(8,13,24,1) 0%, rgba(8,13,24,0.88) 35%, rgba(8,13,24,0.2) 65%, transparent 100%)' }}
                  />
                </div>
              ) : (
                <div
                  aria-hidden
                  className="absolute right-8 top-1/2 -translate-y-1/2 font-heading font-black text-one-white select-none pointer-events-none"
                  style={{
                    fontSize: 'clamp(8rem, 16vw, 14rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.06em',
                    opacity: 0.038,
                  }}
                >
                  {node.year}
                </div>
              )}

              <div className="relative z-10 max-w-[440px]">
                {/* Meta row */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-label text-[9px] tracking-[0.28em] text-one-gold/60 uppercase">{node.label}</span>
                  <div className="flex-1 h-px bg-one-border/30" />
                  <span className="font-label text-[9px] tracking-wider text-one-white/20">
                    {String(i + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(timeline.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Year */}
                <div
                  className="font-heading font-black text-gold-gradient tabular-nums"
                  style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1, letterSpacing: '-0.04em' }}
                >
                  {node.year}
                </div>

                {/* Title */}
                <h3
                  className="font-heading font-bold text-one-white mt-2"
                  style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
                >
                  {node.title}
                </h3>

                <div className="w-10 h-0.5 bg-one-gold/50 my-5" />

                {/* Description */}
                <p className="font-body text-one-white/55 leading-relaxed max-w-[44ch]">
                  {node.desc}
                </p>

                {node.imgCaption && (
                  <p className="font-label text-[9px] tracking-wider text-one-white/30 mt-4 italic">
                    {node.imgCaption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ Section 2 (mobile): Timeline accordion â”€â”€ */}
      <section className="lg:hidden bg-surface-mid py-20 px-4">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-12">
            <WordReveal text="OUR JOURNEY" className="font-h2 text-one-white mb-2 block" as="h2" />
            <p className="font-body-small text-muted">The milestones that shaped ONE FM</p>
          </div>
          <div className="space-y-3">
            {timeline.map((node, i) => (
              <TiltCard key={node.year} maxTilt={5}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card p-4 group relative overflow-hidden"
              >
                <div aria-hidden className="explore-tile-scan" />
                <button
                  onClick={() => setMobileTimelineOpen(mobileTimelineOpen === i ? null : i)}
                  data-cursor-label={mobileTimelineOpen === i ? 'CLOSE' : 'EXPAND'}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-stat text-gold-gradient text-2xl">{node.year}</span>
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
                      {node.img && (
                        <div className="mt-3 pt-3 border-t border-one-border">
                          <img
                            src={node.img}
                            alt={node.imgCaption || node.title}
                            loading="lazy"
                            className="w-full h-40 object-cover rounded-lg"
                            style={{ filter: 'sepia(0.12) saturate(0.92)' }}
                          />
                          {node.imgCaption && (
                            <p className="font-label text-[9px] text-muted/70 mt-1.5 italic">{node.imgCaption}</p>
                          )}
                        </div>
                      )}
                      <p className={`font-body-small text-one-white pt-3 ${node.img ? '' : 'mt-3 border-t border-one-border'}`}>{node.desc}</p>
                      <span className="font-micro border border-one-border text-muted px-2 py-0.5 rounded mt-2 inline-block">{node.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Section 3: Community Impact â”€â”€ */}
      <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="COMMUNITY IMPACT">
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
                  <div className="font-stat text-gold-gradient">
                    <AnimatedNumber value={stat.num} prefix={stat.prefix || ''} suffix={stat.suffix || ''} duration={1500} />
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
              <WordReveal text="MORE THAN A STATION" className="font-h2 text-one-white mb-4 block" as="h2" />
              <p className="font-body text-one-white mb-8">
                ONE FM isn't just a frequency on the dial â€” it's a community lifeline. When floods hit in 2019, we were the only broadcast still on air for 72 hours. When local businesses struggled in 2020, we provided free advertising to 200+ shops. When young creatives needed a platform, we gave them the mic.
              </p>

              <TiltCard maxTilt={3} className="mb-8">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: easeOutExpo }}
                className="glass-card border-l-2 border-l-one-gold p-5"
              >
                <p className="font-body text-one-white italic mb-3">
                  "ONE FM was there when no one else was. That antenna on the hill isn't just broadcasting â€” it's watching over us."
                </p>
                <p className="font-h4 text-one-white">Maria Santos, Local Business Owner</p>
              </motion.div>
              </TiltCard>

              <div className="flex flex-wrap gap-4">
                <Link to="/sponsorship" data-cursor-label="PARTNER" className="btn-primary">
                  Partner With Us
                </Link>
                <button data-cursor-label="NOMINATE" className="btn-secondary">
                  Nominate a Cause
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Section 4: Regional Identity â”€â”€ */}
      <section className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="REGIONAL IDENTITY">
        <div className="max-w-[1400px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <WordReveal text="OUR REGION" className="font-h2 text-one-white mb-2 block" as="h2" />
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
                  <stop offset="0%" stopColor="#B6FF00" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#B6FF00" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="hinterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9B5DE5" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Coast â€” top right blob */}
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
              {/* Valley â€” left center */}
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
              {/* City â€” center */}
              <motion.path
                d="M320 160 Q440 130 520 180 Q560 240 500 300 Q400 320 340 280 Q280 240 320 160Z"
                fill="url(#cityGrad)"
                stroke="#B6FF00"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
              {/* Hinterland â€” bottom right */}
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
              <text x="420" y="240" fill="#B6FF00" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">The City</text>
              <text x="650" y="300" fill="#9B5DE5" fontSize="14" fontFamily="JetBrains Mono" textAnchor="middle">The Hinterland</text>
            </svg>
          </motion.div>

          {/* Region cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region, i) => {
              const Icon = region.icon
              return (
                <TiltCard key={region.name} maxTilt={5} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: easeOutExpo }}
                    data-cursor-label={region.name.toUpperCase()}
                    className="glass-card p-5 text-center group h-full relative overflow-hidden"
                  >
                    <div aria-hidden className="explore-tile-scan" />
                    <div className={`w-12 h-12 rounded-xl ${region.bg} flex items-center justify-center mx-auto mb-3 group-hover:rotate-6 transition-transform duration-200`}>
                      <Icon size={24} className={region.color} />
                    </div>
                    <h4 className="font-h4 text-one-white mb-1">{region.name}</h4>
                    <div className={`font-stat ${region.color} mb-1`}>{region.listeners}</div>
                    <div className="font-label text-muted mb-1">Listeners</div>
                    <div className="font-body-small text-one-white mb-2">Top show: <span className="text-one-white">{region.show}</span></div>
                    <div className="font-micro text-muted">{region.highlight}</div>
                  </motion.div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* â”€â”€ Section 5: Team â”€â”€ */}
      <section className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="THE TEAM">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <WordReveal text="THE PEOPLE BEHIND THE SIGNAL" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">Engineers, producers, hosts, and storytellers</p>
          </ScrollReveal>

          <div className="space-y-12">
            {/* Leadership */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-label text-one-electric mb-4"
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
                    {(() => {
                      const av = getHeritageMemberAvatar(member.name)
                      return (
                        <div className="overflow-hidden rounded-2xl mb-3 relative" style={{ height: 280 }}>
                          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${av.from} 0%, ${av.to} 100%)` }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="font-heading font-black select-none"
                              style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', color: av.accent, opacity: 0.9, letterSpacing: '-0.04em' }}
                            >
                              {av.initials}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-one-navy/50 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" />
                          <div aria-hidden className="explore-tile-scan" />
                        </div>
                      )
                    })()}
                    <h4 className="font-h4 text-one-white">{member.name}</h4>
                    <p className="font-label text-one-muted">{member.role}</p>
                    <p className="font-body-small text-muted">{member.since}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250 mt-1">
                      Bio â†’
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
                className="font-label text-one-electric mb-4"
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
                    {(() => {
                      if (member.realPhoto) {
                        return (
                          <div className="overflow-hidden rounded-2xl mb-3 relative" style={{ height: 280 }}>
                            <img
                              src={member.img}
                              alt={member.name}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-one-navy/60 via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" />
                            <div aria-hidden className="explore-tile-scan" />
                          </div>
                        )
                      }
                      const av = getHeritageMemberAvatar(member.name)
                      return (
                        <div className="overflow-hidden rounded-2xl mb-3 relative" style={{ height: 280 }}>
                          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${av.from} 0%, ${av.to} 100%)` }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="font-heading font-black select-none"
                              style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', color: av.accent, opacity: 0.9, letterSpacing: '-0.04em' }}
                            >
                              {av.initials}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-one-navy/50 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-one-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" />
                          <div aria-hidden className="explore-tile-scan" />
                        </div>
                      )
                    })()}
                    <h4 className="font-h4 text-one-white">{member.name}</h4>
                    <p className="font-label text-one-muted">{member.role}</p>
                    <p className="font-body-small text-muted">{member.since}</p>
                    <span className="inline-flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250 mt-1">
                      Bio â†’
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* â”€â”€ Section 6: Looking Forward â”€â”€ */}
      <section className="bg-surface-glow section-bleed-top section-padding" data-cursor-label="LOOKING AHEAD">
        <div className="max-w-[1000px] mx-auto px-4 text-center">
          <ScrollReveal>
            <WordReveal text="THE NEXT CHAPTER" className="font-h2 text-one-white mb-4 block" as="h2" />
            <p className="font-body text-one-white mb-12 max-w-[700px] mx-auto">
              AI-powered programming. Predictive audience analytics. Smart sponsorship matching. Interactive broadcast experiences. The future of regional radio isn't about replacing what makes us special â€” it's about amplifying it. We're building the most advanced community media platform in the country, without losing the human connection that got us here.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <TiltCard key={pillar.title} maxTilt={4} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: easeOutExpo }}
                    data-cursor-label={pillar.title.toUpperCase()}
                    className="glass-card p-6 text-left group h-full relative overflow-hidden"
                  >
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="w-12 h-12 rounded-xl bg-one-gold/10 flex items-center justify-center mb-4 group-hover:shadow-[0_0_24px_rgba(212,150,58,0.25)] transition-shadow duration-200">
                      <Icon size={24} className="text-one-gold group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <h3 className="font-h3 text-one-white mb-2">{pillar.title}</h3>
                    <p className="font-body-small text-one-white">{pillar.desc}</p>
                  </motion.div>
                </TiltCard>
              )
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <MagneticButton strength={8}>
              <Link to="/broadcast" data-cursor-label="BROADCAST" className="btn-secondary">
                Explore the Tech
              </Link>
            </MagneticButton>
            <MagneticButton strength={10}>
              <Link to="/sponsorship" data-cursor-label="PARTNER" className="btn-primary">
                Partner With Us
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* â”€â”€ Section 7: Latest Interviews â”€â”€ */}
      <LatestInterviews />

      {/* â”€â”€ Section 8: CTA / Connect â”€â”€ */}
      <section className="relative bg-surface-lift section-bleed-top section-padding overflow-hidden" data-cursor-label="CONNECT">
        <div className="absolute inset-0">
          <img
            src="/assets/images/community-book-stall.jpg"
            alt="Community event"
            className="w-full h-full object-cover opacity-15"
          />
        </div>
        <div className="absolute inset-0 bg-one-navy/80" />

        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <ScrollReveal>
            <WordReveal text="BE PART OF THE STORY" className="font-h2 text-one-white mb-4 block" as="h2" />
            <p className="font-body text-one-white mb-8">
              Whether you're a listener, a partner, or a community champion â€” there's a place for you in the ONE FM story.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <MagneticButton strength={10}>
                <Link to="/" data-cursor-label="LISTEN" className="btn-primary">
                  <Radio size={16} /> Listen Live
                </Link>
              </MagneticButton>
              <MagneticButton strength={8}>
                <Link to="/sponsorship" data-cursor-label="SPONSOR" className="btn-secondary">
                  Sponsor
                </Link>
              </MagneticButton>
              <a href="mailto:admin@fm985.com.au" data-cursor-label="EMAIL" className="font-label text-one-gold hover:text-one-gold transition-colors flex items-center gap-1 link-hover">
                Contact Us <ChevronRight size={14} />
              </a>
            </div>

            <div className="flex justify-center gap-4">
              {socials.map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  data-cursor-label={social.label.toUpperCase()}
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



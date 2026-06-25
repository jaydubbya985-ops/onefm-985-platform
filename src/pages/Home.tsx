import { useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { MediaImage } from '@/components/MediaImage'
import { media } from '@/lib/media'
import { getCurrentLiveShow } from '@/data/programGuide'
import { stationStats } from '@/data/pricing'
import { LatestInterviews } from '@/components/LatestInterviews'
import { ExploreOneFMGrid } from '@/components/home/ExploreOneFMGrid'
import { HeroAtmosphere } from '@/components/home/HeroAtmosphere'
import { HeroHeadline } from '@/components/home/HeroHeadline'
import { presenterPhotoPath } from '@/lib/presenterAssets'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '@/components/MagneticButton'
import { WordReveal } from '@/components/WordReveal'
import { Marquee } from '@/components/Marquee'
import { TextScramble } from '@/components/TextScramble'
import { FrequencyTuner } from '@/components/FrequencyTuner'
import { SignalDivider } from '@/components/SignalDivider'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { TiltCard } from '@/components/TiltCard'
import {
  Play, Pause, ArrowRight,
  Radio, Users, Heart,
  ChevronDown,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ─── Animated waveform bars — live strip only (not hero) ─── */
function WaveformBars({ active }: { active: boolean }) {
  const heights = [55, 80, 45, 95, 60, 75, 40, 85, 50, 70]
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 28 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={active ? 'wave-bar' : 'wave-bar opacity-20'}
          style={{
            height: active ? undefined : `${h * 0.35}%`,
            minHeight: 4,
            maxHeight: '100%',
            animationDelay: active ? `${i * 0.11}s` : '0s',
            animationDuration: active ? `${0.75 + (i % 4) * 0.15}s` : '0s',
            opacity: active ? 0.75 - i * 0.025 : 0.18,
          }}
        />
      ))}
    </div>
  )
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ─── Count-up stat — GSAP animates number to target on scroll-in ─── */
function CountStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const match = value.match(/^([\d,]+)(.*)$/)
    if (!match) return
    const target = parseInt(match[1].replace(/,/g, ''), 10)
    const suffix = match[2]
    const obj = { n: 0 }
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: target,
        duration: 1.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate() { el.textContent = Math.round(obj.n).toLocaleString() + suffix },
      })
    })
    return () => ctx.revert()
  }, [value])

  return <span ref={ref}>{value}</span>
}

/* ─── Section angle divider ─── */
function AngleDivider({ fill, right = false }: { fill: string; right?: boolean }) {
  const pts = right ? '0,0 1440,0 1440,72' : '0,0 1440,0 0,72'
  return (
    <div aria-hidden className="absolute top-0 inset-x-0 pointer-events-none" style={{ height: 72 }}>
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="block w-full h-full">
        <polygon points={pts} fill={fill} />
      </svg>
    </div>
  )
}

/* ─────────────────────── HOME PAGE ─────────────────────── */
export default function Home() {
  const stream = useLiveStream()
  const playerMeta = usePlayerMetadata()
  const currentShow = getCurrentLiveShow()
  const liveStripRef = useRef<HTMLElement>(null)
  const missionImgRef = useRef<HTMLDivElement>(null)

  // Live strip: top gold rule draws in on first scroll into viewport
  useLayoutEffect(() => {
    const el = liveStripRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rule = el.querySelector<HTMLElement>('[data-live-rule]')
    if (!rule) return

    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(rule, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }),
    })

    return () => trigger.kill()
  }, [])

  // Mission section: parallax on the community photo
  useLayoutEffect(() => {
    const el = missionImgRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const inner = el.querySelector<HTMLElement>(':scope > div')
    if (!inner) return
    const ctx = gsap.context(() => {
      gsap.to(inner, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <Layout>
      <SEO
        title="Home"
        description="ONE FM 98.5 — Goulburn Valley's community radio. 24/7 local programming, live sports, multicultural shows, and real community voices since 1989. Callsign 3ONE."
      />

      {/* ══════════════════════════════════════════════════════
          1. HERO — full screen, maximum type scale
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden bg-[#050D1A]" data-cursor-label="ON AIR NOW">

        <div aria-hidden className="grain-overlay" />
        <HeroAtmosphere />

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-10 max-w-7xl mx-auto w-full pt-32 pb-36">

          {/* Station badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="mb-8"
          >
            <span className="section-label mb-0">On the air</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease }}
            className="mb-10"
          >
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-[10px] tracking-[0.28em] text-one-white/45">
              <span className="flex items-center gap-2 text-one-red">
                <span className="w-1.5 h-1.5 rounded-full bg-one-red animate-pulse" />
                LIVE
              </span>
              <span className="text-one-white/20">·</span>
              <TextScramble text="98.5 FM · SHEPPARTON" delay={380} duration={800} className="font-label text-[10px] tracking-[0.28em]" />
              <span className="text-one-white/20">·</span>
              <span className="whitespace-nowrap">EST. 1989</span>
            </span>
          </motion.div>

          {/* Main headline — GSAP mask reveal via HeroHeadline */}
          <HeroHeadline />

          {/* Descriptor */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease }}
            className="font-body text-one-white/55 text-[1.05rem] max-w-md mb-12 leading-relaxed"
          >
            Community radio for the Goulburn Valley — {stationStats.totalTowns} towns, est.&nbsp;{stationStats.weeklyListeners.toLocaleString()} weekly listeners, one frequency.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.58, ease }}
            className="flex flex-wrap gap-4 items-center"
          >
            <MagneticButton strength={10} cursorLabel="LISTEN">
              <Link to="/listen" className="btn-primary inline-flex items-center gap-2.5 text-sm px-8 py-3.5">
                <Play size={15} fill="currentColor" />
                Listen Live
              </Link>
            </MagneticButton>
            <MagneticButton strength={8} cursorLabel="PARTNER">
              <Link to="/sponsorship" className="inline-flex items-center gap-2 font-label text-[11px] tracking-wider text-one-white/60 hover:text-one-gold transition-colors group link-hover">
                Advertise with Us
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Now on Air — floating presenter card, bottom-right */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95, ease }}
          className="absolute right-6 sm:right-10 z-10 hidden sm:block"
          style={{ top: 'calc(100dvh - 196px)' }}
        >
          <div className="glass-card px-4 py-3.5 flex items-center gap-3.5 min-w-0 max-w-[260px] group relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            {/* Presenter photo */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-one-gold/50 shrink-0">
              <MediaImage
                src={presenterPhotoPath(currentShow.host)}
                fallbackSrc={media.onAirHost1}
                alt={currentShow.host}
                priority
                skeleton={false}
                className="absolute inset-0 group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Show info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-one-red animate-pulse shrink-0" />
                <span className="font-label text-[8px] text-one-red tracking-[0.2em]">NOW ON AIR</span>
              </div>
              <div className="font-heading text-one-white text-sm font-semibold leading-tight truncate">
                {currentShow.name}
              </div>
              <div className="font-label text-[9px] text-one-muted tracking-wider">
                {currentShow.host}
              </div>
            </div>
            {/* Play/pause */}
            <button
              onClick={() => stream.toggle()}
              data-cursor-label={stream.playing ? 'PAUSE' : 'PLAY'}
              className="w-8 h-8 rounded-full bg-one-gold flex items-center justify-center hover:scale-110 transition-transform shrink-0"
              aria-label={stream.playing ? 'Pause' : 'Play'}
            >
              {stream.playing
                ? <Pause size={13} className="text-one-navy" fill="currentColor" />
                : <Play size={13} className="text-one-navy translate-x-[1px]" fill="currentColor" />}
            </button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="font-label text-[9px] tracking-[0.2em] text-one-white/25">SCROLL</span>
          <ChevronDown size={14} className="text-one-white/25 animate-bounce" style={{ animationDuration: '2s' }} />
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#040B14] to-transparent z-10 pointer-events-none" />
      </section>


      {/* ══════════════════════════════════════════════════════
          2. LIVE STRIP — cinematic broadcasting band
      ══════════════════════════════════════════════════════ */}
      <section ref={liveStripRef} className="relative bg-[#030A12] overflow-hidden" data-cursor-label="PLAY LIVE">
        <span data-live-rule className="gold-rule-h absolute top-0 inset-x-0" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Left: badge + show info */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
              {/* Presenter photo */}
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-one-gold/40 shrink-0 hidden sm:block">
                <MediaImage
                  src={presenterPhotoPath(currentShow.host)}
                  fallbackSrc={media.onAirHost1}
                  alt={currentShow.host}
                  priority
                  skeleton={false}
                  className="absolute inset-0"
                />
              </div>

              {/* Live badge + frequency */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="live-badge">
                  <span className="live-badge-dot" />
                  <span className="font-label text-[7px] text-white tracking-widest">LIVE</span>
                </div>
                <span
                  className="font-heading text-one-gold font-bold leading-none tabular-nums"
                  style={{ fontSize: '0.95rem', letterSpacing: '-0.02em' }}
                >
                  98.5
                </span>
              </div>

              {/* Vertical divider */}
              <div className="w-px h-12 bg-one-border/50 shrink-0" />

              {/* Show info */}
              <div className="flex-1 min-w-0">
                <div className="font-label text-[9px] tracking-[0.22em] text-one-muted mb-1">
                  NOW ON AIR — ONE FM SHEPPARTON
                </div>
                <div className="font-heading text-one-white text-lg font-semibold leading-tight truncate">
                  {playerMeta.nowPlaying || currentShow.name}
                </div>
                <div className="font-label text-[9px] tracking-wider text-one-muted mt-0.5">
                  with {currentShow.host} · {currentShow.time}
                </div>
              </div>
            </div>

            {/* Right: waveform + play button */}
            <div className="flex items-center gap-5 shrink-0 pl-0 sm:pl-4 sm:border-l sm:border-one-border/40">
              <div className="hidden xs:block">
                <WaveformBars active={stream.playing} />
              </div>

              <button
                onClick={() => stream.toggle()}
                data-cursor-label={stream.playing ? 'PAUSE' : 'PLAY LIVE'}
                className="group relative w-12 h-12 rounded-full bg-one-gold flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-glow shrink-0"
                aria-label={stream.playing ? 'Pause broadcast' : 'Play broadcast'}
              >
                <span className="absolute inset-0 rounded-full bg-one-gold/30 scale-0 group-hover:scale-[1.6] transition-transform duration-500 ease-out" />
                {stream.playing
                  ? <Pause size={17} className="text-one-navy relative z-10" fill="currentColor" />
                  : <Play size={17} className="text-one-navy relative z-10 translate-x-0.5" fill="currentColor" />}
              </button>
            </div>
          </div>

          {stream.error && (
            <p className="mt-3 font-label text-[10px] text-one-red/60">{stream.error}</p>
          )}
        </div>

        <span className="gold-rule-h absolute bottom-0 inset-x-0 opacity-30" />
      </section>


      {/* ══════════════════════════════════════════════════════
          2b. MARQUEE TICKER — kinetic station facts
      ══════════════════════════════════════════════════════ */}
      <div className="bg-[#020810] py-3 border-b border-one-border/20 overflow-hidden">
        <Marquee
          speed={32}
          items={[
            <span className="font-label text-[10px] tracking-[0.18em] text-one-muted/70">{stationStats.broadcastPopulation.toLocaleString()} PEOPLE REACHED</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-electric/60">LIVE &amp; LOCAL SINCE 1989</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-muted/70">{stationStats.totalTowns} TOWNS · {stationStats.broadcastRadiusKm} KM RADIUS</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-gold/60">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-muted/70">{stationStats.weeklyListeners.toLocaleString()} EST. WEEKLY LISTENERS</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-electric/60">GVL FOOTBALL &amp; NETBALL COVERAGE</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-muted/70">COMMUNITY RADIO · CALLSIGN 3ONE</span>,
            <span className="font-label text-[10px] tracking-[0.18em] text-one-gold/60">MULTICULTURAL BROADCASTING</span>,
          ]}
        />
      </div>


      {/* ══════════════════════════════════════════════════════
          2bX. SIGNAL IDENTITY — cinematic viewport typography
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center overflow-hidden bg-[#01060E]"
        style={{ minHeight: '82dvh' }}
        data-cursor-label="98.5 FM"
      >
        <div aria-hidden className="grain-overlay" />

        {/* Ambient gold radial */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 65%)' }}
        />

        {/* Ghost "98.5" backdrop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span
            className="font-heading font-black text-one-gold"
            style={{
              fontSize: 'clamp(28vw, 40vw, 52vw)',
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
              opacity: 0.09,
              whiteSpace: 'nowrap',
            }}
          >
            98.5
          </span>
        </motion.div>

        {/* Foreground typography */}
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease }}
            className="flex justify-center mb-8"
          >
            <span className="section-label">The Frequency</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.0, delay: 0.08, ease }}
            className="font-heading font-black text-gold-gradient"
            style={{ fontSize: 'clamp(5rem, 15vw, 12rem)', lineHeight: 0.88, letterSpacing: '-0.04em' }}
          >
            98.5
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.22, ease }}
            className="font-label text-one-white/25 tracking-[0.28em] mt-8"
          >
            FM · SHEPPARTON · GOULBURN VALLEY
          </motion.p>
        </div>

        {/* Decorative frequency bars — bottom edge */}
        <div
          aria-hidden
          className="absolute bottom-0 inset-x-0 flex items-end justify-center gap-[3px] pointer-events-none"
          style={{ height: 56, paddingBottom: 0 }}
        >
          {Array.from({ length: 32 }, (_, i) => {
            const dur = 0.9 + (i % 7) * 0.18
            const delay = (i * 0.11) % 1.4
            const maxH = 18 + (i % 5) * 9
            return (
              <div
                key={i}
                style={{
                  width: 2,
                  height: maxH,
                  borderRadius: 1,
                  background: 'rgba(212,175,55,0.22)',
                  transformOrigin: 'bottom',
                  animation: `freq-bar ${dur}s ${delay}s ease-in-out infinite`,
                }}
              />
            )
          })}
        </div>
      </section>

      <SignalDivider className="bg-[#01060E]" />

      {/* ══════════════════════════════════════════════════════
          2c. TUNE IN — FrequencyTuner hero moment
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col justify-center bg-[#020810] overflow-hidden"
        style={{ minHeight: '82dvh', paddingTop: '5rem', paddingBottom: '5rem' }}
        data-cursor-label="TUNE"
      >
        <div aria-hidden className="grain-overlay" />

        {/* Gold ambient radial behind the tuner */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 70%)' }}
        />

        {/* Typographic texture — "98.5" as pure graphic element */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span
            className="font-heading font-bold text-one-white select-none"
            style={{
              fontSize: 'clamp(20rem, 52vw, 50rem)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              opacity: 0.048,
              transform: 'translateY(8%)',
              whiteSpace: 'nowrap',
            }}
          >
            98.5
          </span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease }}
          >
            <span className="section-label mb-6 block">Tune In</span>
            <p className="font-body text-one-white/40 text-sm max-w-[40ch] mb-12 leading-relaxed">
              Drag the needle to 98.5 — or let it find you.
            </p>

            <FrequencyTuner className="w-full" autoSweep />

            <div className="mt-10">
              <MagneticButton strength={8}>
                <Link
                  to="/listen"
                  className="inline-flex items-center gap-2.5 font-label text-[11px] tracking-wider text-one-gold hover:gap-4 transition-all duration-300 group"
                >
                  Full player &amp; schedule
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          3. STATS — editorial horizontal list
          Numbers are the design.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#040C1A] relative overflow-hidden" data-cursor-label="SIGNAL REACH">
        <div aria-hidden className="grain-overlay" />
        <span className="gold-rule-h absolute top-0 inset-x-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
            <span className="section-label">Signal Coverage</span>
          </div>

          {([
            { value: stationStats.broadcastPopulation.toLocaleString(), label: 'People Reached' },
            { value: `${stationStats.broadcastRadiusKm} km`,            label: 'Broadcast Radius' },
            { value: stationStats.weeklyListeners.toLocaleString(),     label: 'Est. Weekly Listeners' },
            { value: String(stationStats.totalTowns),                   label: 'Towns Covered' },
          ]).map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              className="group flex items-baseline gap-5 sm:gap-8 py-6 sm:py-7 border-b border-one-border/25 hover:border-one-gold/20 transition-colors duration-400 cursor-default"
            >
              {/* Big number */}
              <div
                className="font-heading font-bold text-one-white tabular-nums group-hover:text-one-gold transition-colors duration-500 shrink-0"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 1, letterSpacing: '-0.025em' }}
              >
                <CountStat value={value} />
              </div>

              {/* Connector line */}
              <div className="flex-1 h-px bg-one-border/30 group-hover:bg-one-gold/15 transition-colors duration-400 self-center hidden sm:block" />

              {/* Label */}
              <div className="font-label text-one-muted text-[10px] sm:text-[11px] tracking-[0.22em] group-hover:text-one-white/60 transition-colors duration-300 shrink-0 uppercase">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          3b. MARQUEE STRIP — signal data ticker
      ══════════════════════════════════════════════════════ */}
      <div className="overflow-hidden bg-[#030810] border-y border-one-border/20 py-[14px]">
        <div className="ticker-track" style={{ animationDuration: '44s' }}>
          {[0, 1].map((copy) => (
            <span key={copy} className="flex items-center">
              {[
                'EST. 1989',
                `${stationStats.weeklyListeners.toLocaleString()} WEEKLY LISTENERS`,
                `${stationStats.broadcastRadiusKm}KM BROADCAST RADIUS`,
                `${stationStats.totalTowns} TOWNS COVERED`,
                'SHEPPARTON · VIC',
                'CALLSIGN: 3ONE',
                '98.5 FM',
                'COMMUNITY RADIO',
                'GOULBURN VALLEY',
                'ON AIR 24/7',
              ].map((item) => (
                <span key={item} className="flex items-center gap-7 shrink-0 pr-7">
                  <span className="font-label text-[9px] tracking-[0.28em] text-one-muted/50 uppercase whitespace-nowrap">
                    {item}
                  </span>
                  <span className="block w-[3px] h-[3px] rounded-full bg-one-electric/25 shrink-0" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4. MISSION — editorial text + image
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 bg-surface-glow relative overflow-hidden" data-cursor-label="OUR STORY">
        <AngleDivider fill="#030810" right />
        <div aria-hidden className="grain-overlay opacity-50" style={{ opacity: 0.02 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">

            {/* Left — editorial text */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, ease }}
            >
              <span className="section-label mb-7 block">Community First</span>

              <WordReveal
                text="More than a radio station."
                as="h2"
                className="text-one-white mb-7 font-heading font-bold"
                style={{ fontSize: 'clamp(3rem, 6.5vw, 5.5rem)', lineHeight: 0.93, letterSpacing: '-0.02em' }}
                stagger={0.020}
                variant="char"
              />

              <div className="w-12 h-[2px] bg-gradient-to-r from-one-gold to-one-champagne/60 rounded mb-8" />

              <p className="font-body text-one-white/55 leading-relaxed mb-5 max-w-[42ch]">
                From emergency broadcasts during the 2022 floods to calling
                the GVL Grand Final live — ONE FM is the voice the Valley
                turns to when it matters most.
              </p>
              <p className="font-body text-one-white/55 leading-relaxed mb-10 max-w-[42ch]">
                Volunteer-run, community-owned, and proudly on air since 1989.
                Callsign: <span className="text-one-white font-medium">3ONE</span>.
                Frequency: <span className="text-one-white font-medium">98.5 FM</span>.
              </p>

              <MagneticButton strength={8}>
                <Link
                  to="/story"
                  className="inline-flex items-center gap-2.5 font-label text-[11px] tracking-wider text-one-gold hover:gap-4 transition-all duration-300 group"
                >
                  Our Story
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Right — image with floating accent */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, delay: 0.1, ease }}
              className="relative"
            >
              <div ref={missionImgRef} className="rounded-2xl overflow-hidden aspect-[4/5] relative border border-one-border/30 group">
                <MediaImage
                  src={media.communityEvent}
                  fallbackSrc={media.communityGathering}
                  alt="ONE FM community event"
                  className="absolute inset-0 scale-[1.15] group-hover:scale-[1.19] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 cinematic-overlay" />
                <div aria-hidden className="explore-tile-scan" />
              </div>

              {/* Floating stat */}
              <TiltCard maxTilt={8} className="absolute -bottom-6 -left-5 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35, ease }}
                className="glass-card px-6 py-5"
              >
                <div
                  className="font-heading font-bold text-gold-gradient leading-none mb-1 tabular-nums"
                  style={{ fontSize: '3rem', letterSpacing: '-0.025em' }}
                >
                  <AnimatedNumber value={stationStats.yearsBroadcasting} />
                </div>
                <div className="font-label text-one-muted text-[10px] tracking-[0.2em]">YEARS ON AIR</div>
              </motion.div>
              </TiltCard>

              {/* Callsign tag */}
              <div className="absolute top-5 right-5 glass-subtle px-3 py-1.5 rounded-full">
                <span className="font-label text-one-gold text-[10px] tracking-widest">3ONE · 98.5 FM</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          5. EXPLORE GRID — photo tiles linking to all sections
      ══════════════════════════════════════════════════════ */}
      <ExploreOneFMGrid />

      {/* ══════════════════════════════════════════════════════
          6. LATEST INTERVIEWS — real content
      ══════════════════════════════════════════════════════ */}
      <LatestInterviews />


      {/* ══════════════════════════════════════════════════════
          6. CTA — numbered editorial cards
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-[#040C1A] relative overflow-hidden" data-cursor-label="GET INVOLVED">
        <AngleDivider fill="#071D3A" />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease }}
            className="mb-14"
          >
            <span className="section-label mb-6 block">Get Involved</span>
            <h2
              className="font-heading font-bold text-one-white"
              style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
            >
              <WordReveal text="Join the Valley's" as="span" className="block" stagger={0.025} variant="char" />
              <WordReveal text="voice." as="span" className="block" stagger={0.02} delay={0.15} variant="char" />
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-one-border/20 rounded-2xl overflow-hidden">
            {([
              {
                index: '01',
                icon: Radio,
                title: 'Listen Live',
                body: 'On FM 98.5, online stream, or Community Radio Plus app — free, always.',
                cta: 'Tune In',
                to: '/listen',
                accent: true,
              },
              {
                index: '02',
                icon: Users,
                title: 'Sponsor ONE FM',
                body: `Reach ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} towns. Regional radio that delivers.`,
                cta: 'Enquire Now',
                to: '/sponsorship',
                accent: false,
              },
              {
                index: '03',
                icon: Heart,
                title: 'Get Involved',
                body: "Volunteer, donate, or become a member. Help keep the Valley's voice strong.",
                cta: 'Learn More',
                to: '/contact',
                accent: false,
              },
            ]).map(({ index, icon: Icon, title, body, cta, to, accent }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.09, ease }}
                data-cursor-label={cta.toUpperCase()}
                className={`flex flex-col p-8 lg:p-10 group transition-colors duration-300 relative overflow-hidden ${
                  accent
                    ? 'bg-[#071020] hover:bg-[#081428]'
                    : 'bg-[#040C1A] hover:bg-[#060F1E]'
                }`}
              >
                <div aria-hidden className="explore-tile-scan" />
                {/* Index number */}
                <div className="flex items-start justify-between mb-8">
                  <span
                    className={`font-heading font-bold leading-none tabular-nums ${
                      accent ? 'text-one-gold/30' : 'text-one-white/10'
                    }`}
                    style={{ fontSize: '3.5rem', letterSpacing: '-0.03em' }}
                  >
                    {index}
                  </span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    accent ? 'bg-one-gold/15' : 'bg-one-white/5'
                  }`}>
                    <Icon size={17} className={accent ? 'text-one-gold' : 'text-one-white/40'} />
                  </div>
                </div>

                <h3
                  className="font-heading font-semibold text-one-white mb-3"
                  style={{ fontSize: '1.2rem', lineHeight: 1.25 }}
                >
                  {title}
                </h3>

                <p className="font-body-small text-one-muted leading-relaxed flex-1 mb-8 max-w-[30ch]">
                  {body}
                </p>

                <Link
                  to={to}
                  className={`inline-flex items-center gap-2 font-label text-[11px] tracking-wider transition-all duration-300 group-hover:gap-3 ${
                    accent ? 'text-one-gold' : 'text-one-white/40 group-hover:text-one-white/70'
                  }`}
                >
                  {cta}
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  )
}

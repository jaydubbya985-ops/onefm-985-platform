import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { MediaImage } from '@/components/MediaImage'
import { media } from '@/lib/media'
import { getCurrentLiveShow } from '@/data/programGuide'
import { LatestInterviews } from '@/components/LatestInterviews'
import { CinegraphBackground } from '@/components/CinegraphBackground'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { motion } from 'framer-motion'
import {
  Play, Pause, ArrowRight,
  Radio, Users, Heart,
  ChevronDown,
} from 'lucide-react'

/* ─── Waveform canvas — very subtle background element ─── */
function WaveformIdent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number

    const resize = () => {
      const p = canvas.parentElement
      if (!p) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = p.clientWidth * dpr
      canvas.height = p.clientHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      t += 0.005
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, w, h)

      const bars = 56
      const bw = w / bars
      for (let i = 0; i < bars; i++) {
        const noise = Math.sin(i * 0.31 + t * 2.2) * Math.cos(i * 0.11 - t * 1.6)
        const bh = (Math.abs(noise) * 0.45 + 0.04) * h
        const x = i * bw
        const y = (h - bh) / 2
        const g = ctx.createLinearGradient(0, y, 0, y + bh)
        g.addColorStop(0, 'rgba(212,175,55,0.04)')
        g.addColorStop(0.5, 'rgba(212,175,55,0.10)')
        g.addColorStop(1, 'rgba(212,175,55,0.02)')
        ctx.fillStyle = g
        ctx.fillRect(x, y, bw - 1.5, bh)
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, opacity: 0.6 }}
    />
  )
}

/* ─── Animated waveform bars for live player ─── */
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

/* ─────────────────────── HOME PAGE ─────────────────────── */
export default function Home() {
  const stream = useLiveStream()
  const playerMeta = usePlayerMetadata()
  const currentShow = getCurrentLiveShow()

  return (
    <Layout>
      <SEO
        title="Home"
        description="ONE FM 98.5 — Goulburn Valley's community radio. 24/7 local programming, live sports, multicultural shows, and real community voices since 1989. Callsign 3ONE."
      />

      {/* ══════════════════════════════════════════════════════
          1. HERO — full screen, maximum type scale
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden bg-[#050D1A]">

        {/* Grain overlay */}
        <div aria-hidden className="grain-overlay" />

        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <CinegraphBackground slot="homeHero" opacity={0.28} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/85 via-[#050D1A]/50 to-[#050D1A]/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050D1A]/80 via-transparent to-[#050D1A]/80" />
        </div>

        {/* Waveform canvas */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <WaveformIdent />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-10 max-w-7xl mx-auto w-full pt-32 pb-28">

          {/* Station badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-3 font-label text-[10px] tracking-[0.28em] text-one-white/50">
              <span className="flex items-center gap-2 text-one-red">
                <span className="w-1.5 h-1.5 rounded-full bg-one-red animate-pulse" />
                ON AIR
              </span>
              <span className="text-one-white/20">·</span>
              <span>98.5 FM · SHEPPARTON, VIC</span>
              <span className="text-one-white/20">·</span>
              <span>EST. 1989</span>
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.18, ease }}
            className="font-hero text-one-white text-shadow-hero mb-8"
          >
            THE VOICE
            <br />
            <span className="text-one-gold">OF THE</span>
            <br />
            VALLEY.
          </motion.h1>

          {/* Descriptor */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease }}
            className="font-body text-one-white/50 text-[1.05rem] max-w-sm mb-12 leading-relaxed italic"
          >
            Goulburn Valley's community radio —<br />
            25 towns, 185,000 people, one frequency.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.58, ease }}
            className="flex flex-wrap gap-4 items-center"
          >
            <Link to="/listen" className="btn-primary inline-flex items-center gap-2.5 text-sm px-8 py-3.5">
              <Play size={15} fill="currentColor" />
              Listen Live
            </Link>
            <Link to="/sponsorship" className="inline-flex items-center gap-2 font-label text-[11px] tracking-wider text-one-white/60 hover:text-one-gold transition-colors group">
              Advertise with Us
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

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
      <section className="relative bg-[#030A12] overflow-hidden">
        <span className="gold-rule-h absolute top-0 inset-x-0" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Left: badge + show info */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
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
          3. STATS — editorial horizontal list
          Numbers are the design.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#040C1A] relative overflow-hidden">
        <div aria-hidden className="grain-overlay" />
        <span className="gold-rule-h absolute top-0 inset-x-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
            <span className="section-label">Signal Coverage</span>
          </div>

          {([
            { value: '185,791', label: 'People Reached' },
            { value: '100 km',  label: 'Broadcast Radius' },
            { value: '39,375',  label: 'Est. Weekly Listeners' },
            { value: '25',      label: 'Towns Covered' },
          ] as const).map(({ value, label }, i) => (
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
                {value}
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
          4. MISSION — editorial text + image
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 bg-one-navy relative overflow-hidden">
        <div aria-hidden className="grain-overlay opacity-50" style={{ opacity: 0.02 }} />
        <span className="gold-rule-h absolute top-0 inset-x-0 opacity-40" />

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

              <h2
                className="text-one-white mb-7 font-heading font-bold"
                style={{ fontSize: 'clamp(3rem, 6.5vw, 5.5rem)', lineHeight: 0.93, letterSpacing: '-0.02em' }}
              >
                More than
                <br />
                a radio
                <br />
                station.
              </h2>

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

              <Link
                to="/story"
                className="inline-flex items-center gap-2.5 font-label text-[11px] tracking-wider text-one-gold hover:gap-4 transition-all duration-300 group"
              >
                Our Story
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Right — image with floating accent */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75, delay: 0.1, ease }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/5] relative border border-one-border/30">
                <MediaImage
                  src={media.communityEvent}
                  fallbackSrc={media.communityGathering}
                  alt="ONE FM community event"
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 cinematic-overlay" />
              </div>

              {/* Floating stat */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35, ease }}
                className="absolute -bottom-6 -left-5 glass-card px-6 py-5 hidden lg:block"
              >
                <div
                  className="font-heading font-bold text-one-gold leading-none mb-1 tabular-nums"
                  style={{ fontSize: '3rem', letterSpacing: '-0.025em' }}
                >
                  37
                </div>
                <div className="font-label text-one-muted text-[10px] tracking-[0.2em]">YEARS ON AIR</div>
              </motion.div>

              {/* Callsign tag */}
              <div className="absolute top-5 right-5 glass-subtle px-3 py-1.5 rounded-full">
                <span className="font-label text-one-gold text-[10px] tracking-widest">3ONE · 98.5 FM</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          5. LATEST INTERVIEWS — real content
      ══════════════════════════════════════════════════════ */}
      <LatestInterviews />


      {/* ══════════════════════════════════════════════════════
          6. CTA — numbered editorial cards
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-[#040C1A] border-t border-one-border/20 relative overflow-hidden">
        <div aria-hidden className="grain-overlay" />
        <span className="gold-rule-h absolute top-0 inset-x-0" />

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
              Join the Valley's
              <br />
              voice.
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
                body: 'Reach 39,375 weekly listeners across 25 towns. Regional radio that delivers.',
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
            ] as const).map(({ index, icon: Icon, title, body, cta, to, accent }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.09, ease }}
                className={`flex flex-col p-8 lg:p-10 group transition-colors duration-300 ${
                  accent
                    ? 'bg-[#071020] hover:bg-[#081428]'
                    : 'bg-[#040C1A] hover:bg-[#060F1E]'
                }`}
              >
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

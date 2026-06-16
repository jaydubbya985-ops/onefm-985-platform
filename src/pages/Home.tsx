import { useEffect, useRef, useState } from 'react'
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
  Play, Pause, Volume2, ArrowRight,
  Radio, Users, Headphones, Heart, Mic2,
} from 'lucide-react'

/* ─── Waveform canvas — hero background element ─── */
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
      t += 0.006
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, w, h)

      const bars = 48
      const bw = w / bars
      for (let i = 0; i < bars; i++) {
        const noise = Math.sin(i * 0.35 + t * 2.5) * Math.cos(i * 0.12 - t * 1.8)
        const bh = (Math.abs(noise) * 0.5 + 0.05) * h
        const x = i * bw
        const y = (h - bh) / 2
        const g = ctx.createLinearGradient(0, y, 0, y + bh)
        g.addColorStop(0, 'rgba(212,175,55,0.06)')
        g.addColorStop(0.5, 'rgba(212,175,55,0.14)')
        g.addColorStop(1, 'rgba(212,175,55,0.03)')
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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.7 }}
    />
  )
}

/* ─── Inline volume bar ─── */
function VolumeBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Volume2 size={13} className="text-one-muted shrink-0" />
      <div className="w-16 h-1 bg-one-border rounded-full overflow-hidden">
        <div
          className="h-full bg-one-gold rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────── HOME PAGE ─────────────────────── */
export default function Home() {
  const stream = useLiveStream()
  const playerMeta = usePlayerMetadata()
  const [volume] = useState(75)
  const currentShow = getCurrentLiveShow()

  const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

  return (
    <Layout>
      <SEO
        title="Home"
        description="ONE FM 98.5 — Goulburn Valley's community radio. 24/7 local programming, live sports, multicultural shows, and real community voices since 1989. Callsign 3ONE."
      />

      {/* ══════════════════════════════════════════════════════
          1. HERO
          Full-screen. Single idea. Nothing competing.
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden bg-[#050D1A]">

        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <CinegraphBackground slot="homeHero" opacity={0.35} />
          {/* Navy vignette — keeps text readable over any photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/80 via-[#050D1A]/40 to-[#050D1A]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050D1A]/70 via-transparent to-[#050D1A]/70" />
        </div>

        {/* Subtle waveform behind content */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <WaveformIdent />
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 sm:px-10 max-w-6xl mx-auto w-full pt-28 pb-24">

          {/* Station badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2.5 font-label text-one-gold text-[11px] tracking-[0.25em] uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-one-red animate-pulse" />
                LIVE
              </span>
              <span className="text-one-muted/60">·</span>
              98.5 FM · Shepparton, VIC
              <span className="text-one-muted/60">·</span>
              Est. 1989
            </span>
          </motion.div>

          {/* Main headline — maximum drama */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="font-hero text-one-white text-shadow-hero mb-6"
            style={{ lineHeight: 0.9 }}
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
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="font-body text-one-white/60 text-lg max-w-md mb-10 leading-relaxed"
          >
            Goulburn Valley's community radio — 25 towns,
            185,000 people, one frequency since 1989.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/listen" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
              <Play size={17} fill="currentColor" />
              Listen Live
            </Link>
            <Link to="/sponsorship" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3.5">
              Advertise
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-one-navy to-transparent z-10 pointer-events-none" />
      </section>


      {/* ══════════════════════════════════════════════════════
          2. LIVE NOW STRIP
          Clean. Minimal. Just enough.
      ══════════════════════════════════════════════════════ */}
      <section className="bg-one-navy border-t border-b border-one-border/30 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
          >
            {/* Artwork + live badge */}
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-one-border bg-one-navy/60">
              <MediaImage
                src={media.onAirHost1}
                fallbackSrc={media.presenter1}
                alt={currentShow.name}
                priority
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-one-navy/20" />
              <div className="absolute top-1 left-1 live-badge">
                <span className="live-badge-dot" />
                <span className="font-label text-[7px] text-white leading-none">LIVE</span>
              </div>
            </div>

            {/* Show info */}
            <div className="flex-1 min-w-0">
              <div className="font-label text-one-muted text-[10px] tracking-widest mb-0.5">
                NOW ON AIR — ONE FM 98.5
              </div>
              <div className="font-h3 text-one-white truncate">
                {playerMeta.nowPlaying || currentShow.name}
              </div>
              <div className="font-body-small text-one-muted text-xs">
                with {currentShow.host} · {currentShow.time}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 shrink-0">
              <VolumeBar value={volume} />
              <button
                onClick={() => stream.toggle()}
                className="w-11 h-11 rounded-full bg-one-gold hover:bg-one-gold/90 text-one-navy flex items-center justify-center transition-all hover:scale-105 shrink-0"
                aria-label={stream.playing ? 'Pause' : 'Play'}
              >
                {stream.playing
                  ? <Pause size={18} fill="currentColor" />
                  : <Play size={18} fill="currentColor" className="translate-x-0.5" />}
              </button>
            </div>
          </motion.div>

          {stream.error && (
            <p className="mt-3 font-body-small text-one-red/70 text-xs">{stream.error}</p>
          )}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          3. MISSION
          Two columns. Left: big editorial text. Right: image + accent stat.
      ══════════════════════════════════════════════════════ */}
      <section className="section-padding bg-one-navy">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease }}
            >
              <span className="font-label text-one-gold text-[11px] tracking-[0.2em] uppercase mb-5 block">
                Community First
              </span>
              <h2 className="font-h1 text-one-white mb-6">
                More than
                <br />
                a radio
                <br />
                station.
              </h2>
              <div className="w-10 h-[3px] bg-one-gold rounded mb-8" />
              <p className="font-body text-one-white/60 leading-relaxed mb-5">
                From emergency broadcasts during the 2022 floods to calling the
                GVL Grand Final live — ONE FM is the voice the Valley turns to
                when it matters most.
              </p>
              <p className="font-body text-one-white/60 leading-relaxed mb-10">
                Volunteer-run, community-owned, and proudly on air since 1989.
                Callsign: <span className="text-one-white font-medium">3ONE</span>.
                Frequency: <span className="text-one-white font-medium">98.5 FM</span>.
              </p>
              <Link to="/story" className="inline-flex items-center gap-2 font-label text-one-gold text-[11px] tracking-wider hover:gap-3 transition-all group">
                Our Story
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Right — image + floating stat */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/5] relative border border-one-border/40">
                <MediaImage
                  src={media.communityEvent}
                  fallbackSrc={media.communityGathering}
                  alt="ONE FM community event"
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 cinematic-overlay" />
              </div>
              {/* Floating accent stat */}
              <div className="absolute -bottom-6 -left-6 glass-card px-6 py-5 hidden lg:block">
                <div className="font-stat text-one-gold text-5xl leading-none mb-1">37</div>
                <div className="font-label text-one-muted text-[10px] tracking-wider">YEARS ON AIR</div>
              </div>
              {/* Floating callsign tag */}
              <div className="absolute top-5 right-5 glass-subtle px-3 py-1.5 rounded-full">
                <span className="font-label text-one-gold text-[10px] tracking-widest">3ONE · 98.5 FM</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          4. STATS
          Four numbers. That's it. No clutter.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#050D1A] border-t border-one-border/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-one-border/20 rounded-2xl overflow-hidden">
            {[
              { value: '185,791', label: 'People Reached', icon: Users },
              { value: '100 km', label: 'Broadcast Radius', icon: Radio },
              { value: '39,375', label: 'Est. Weekly Listeners', icon: Headphones },
              { value: '25', label: 'Towns Covered', icon: Mic2 },
            ].map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="bg-[#050D1A] px-8 py-10 flex flex-col items-center text-center group"
              >
                <Icon size={20} className="text-one-gold/50 mb-4 group-hover:text-one-gold transition-colors duration-300" />
                <div className="font-stat text-one-white text-4xl md:text-5xl mb-2 tabular-nums">
                  {value}
                </div>
                <div className="font-label text-one-muted text-[10px] tracking-widest uppercase">
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          5. LATEST INTERVIEWS
          Real content from fm985.com.au.
      ══════════════════════════════════════════════════════ */}
      <LatestInterviews />


      {/* ══════════════════════════════════════════════════════
          6. CTA
          Three clear paths. Nothing more.
      ══════════════════════════════════════════════════════ */}
      <section className="section-padding bg-[#050D1A] border-t border-one-border/20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="font-label text-one-gold text-[11px] tracking-[0.2em] uppercase mb-4 block text-center">
              Get Involved
            </span>
            <h2 className="font-h1 text-one-white text-center mb-4">
              Join the Valley's
              <br />
              voice.
            </h2>
            <div className="w-10 h-[3px] bg-one-gold rounded mx-auto mb-14" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Radio,
                  title: 'Listen Live',
                  body: 'On FM 98.5, online stream, or Community Radio Plus app. Free, always.',
                  cta: 'Tune In',
                  to: '/listen',
                  primary: true,
                },
                {
                  icon: Users,
                  title: 'Sponsor ONE FM',
                  body: 'Reach 39,375 weekly listeners across 25 towns. Regional radio that delivers.',
                  cta: 'Enquire Now',
                  to: '/sponsorship',
                  primary: false,
                },
                {
                  icon: Heart,
                  title: 'Get Involved',
                  body: "Volunteer, donate, or become a member. Help keep the Valley's voice strong.",
                  cta: 'Learn More',
                  to: '/contact',
                  primary: false,
                },
              ].map(({ icon: Icon, title, body, cta, to, primary }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                  className={`rounded-2xl p-8 flex flex-col border transition-all duration-300 group hover:-translate-y-1 ${
                    primary
                      ? 'bg-one-gold/10 border-one-gold/30 hover:border-one-gold/60'
                      : 'bg-one-navy/60 border-one-border/40 hover:border-one-gold/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${
                    primary ? 'bg-one-gold/20' : 'bg-one-gold/10'
                  }`}>
                    <Icon size={20} className="text-one-gold" />
                  </div>
                  <h3 className="font-h3 text-one-white mb-3">{title}</h3>
                  <p className="font-body-small text-one-muted leading-relaxed flex-1 mb-6">{body}</p>
                  <Link
                    to={to}
                    className={`inline-flex items-center gap-2 font-label text-[11px] tracking-wider group-hover:gap-3 transition-all ${
                      primary ? 'text-one-gold' : 'text-one-white/60 hover:text-one-gold'
                    }`}
                  >
                    {cta} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  )
}

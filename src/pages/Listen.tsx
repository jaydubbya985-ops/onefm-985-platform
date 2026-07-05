import { useCallback, useEffect, useRef, useState } from 'react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { Marquee } from '@/components/Marquee'
import { TiltCard } from '@/components/TiltCard'
import { LivePlayerWidget } from '@/components/home/LivePlayerWidget'
import { CinegraphBackground } from '@/components/CinegraphBackground'
import { PageJobsBar, type PageJob } from '@/components/PageJobsBar'
import { SoundCloudPanel } from '@/components/social/SoundCloudPanel'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { LISTEN_LINKS } from '@/lib/listenLinks'
import { BRAND } from '@/lib/brand'
import { ExternalLink, Headphones, MapPin, Radio, Smartphone, Trophy } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { MagneticButton } from '@/components/MagneticButton'
import { FrequencyTuner } from '@/components/FrequencyTuner'
import { WeatherWidget } from '@/components/WeatherWidget'

const PAGE_JOBS: PageJob[] = [
  { label: 'Programs', path: '/programs', description: 'Weekly guide', icon: Radio, accent: '#F2F2F2' },
  { label: 'Broadcast', path: '/broadcast', description: 'Schedule grid', icon: Headphones, accent: '#B6FF00' },
  { label: 'Coverage', path: '/coverage', description: '25 towns', icon: MapPin, accent: '#1B458F' },
  { label: 'GVL Football', path: '/football', description: 'Game day', icon: Trophy, accent: '#E51636' },
]

const WAYS = [
  {
    icon: Radio,
    title: LISTEN_LINKS.fm.label,
    desc: LISTEN_LINKS.fm.description,
    detail: 'Tune your radio to 98.5 FM in the Goulburn Murray',
    href: null,
  },
  {
    icon: Headphones,
    title: LISTEN_LINKS.web.label,
    desc: LISTEN_LINKS.web.description,
    detail: 'Official web audio player',
    href: LISTEN_LINKS.web.href,
  },
  {
    icon: Smartphone,
    title: LISTEN_LINKS.crp.label,
    desc: LISTEN_LINKS.crp.description,
    detail: 'Search ONE FM in the app',
    href: LISTEN_LINKS.crp.href,
  },
] as const

/** Canvas waveform — spectrum analyzer when on-air, static noise when demodulated */
function ListenWaveform({ isDemodRef }: { isDemodRef: React.MutableRefObject<boolean> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const electricRgb = useRef('0, 229, 255')

  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--one-electric-rgb').trim()
      if (v) electricRgb.current = v
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-time'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let t = 0
    const BARS = 80
    const peaks = new Float32Array(BARS)

    // Frequency-domain shape: bass-heavy, roll-off at treble — mimics real music spectrum
    const specShape = (i: number) => {
      const f = i / BARS
      const bass    = 0.82 * Math.exp(-((f - 0.05) ** 2) / 0.006)
      const lowMid  = 0.55 * Math.exp(-((f - 0.18) ** 2) / 0.010)
      const mid     = 0.42 * Math.exp(-((f - 0.38) ** 2) / 0.022)
      const rollOff = Math.pow(Math.max(0, 1 - f * 1.1), 1.6)
      return (bass + lowMid + mid) * rollOff + 0.04
    }

    const resize = () => {
      const p = canvas.parentElement
      if (!p) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = p.clientWidth * dpr
      canvas.height = p.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      t += 0.009
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, w, h)
      const bw = w / BARS
      const demod = isDemodRef?.current ?? false

      // Beat at ~96 BPM → period 0.625s → at 60fps t += 0.009 → period = 0.625*0.009*60 ≈ 0.3375 in t-units
      const beatPeriod = 0.34
      const beatPhase = (t % beatPeriod) / beatPeriod
      // Quick attack, slow decay envelope
      const beat = beatPhase < 0.12 ? beatPhase / 0.12 : Math.pow(1 - (beatPhase - 0.12) / 0.88, 2.5)

      for (let i = 0; i < BARS; i++) {
        let bh: number

        if (demod) {
          bh = (Math.random() * 0.75 + 0.08) * h
        } else {
          const base = specShape(i)
          // Layered oscillators: slow sway + fast detail + beat impulse
          const sway   = Math.sin(i * 0.18 + t * 0.7) * 0.5 + 0.5
          const detail = Math.sin(i * 0.55 + t * 2.2) * 0.5 + 0.5
          const noise  = Math.sin(i * 1.1  + t * 4.5) * 0.5 + 0.5
          const amp    = base * (0.45 + sway * 0.30 + detail * 0.16 + noise * 0.09)
          const beatBump = i < BARS * 0.35 ? beat * 0.22 : beat * 0.08
          bh = Math.max(0.03, amp + beatBump) * h * 0.82
        }

        // Peak hold: rise fast, decay slowly
        if (bh > peaks[i]) {
          peaks[i] = bh
        } else {
          peaks[i] = Math.max(0, peaks[i] - h * 0.0012)
        }

        const x = i * bw
        const cy = h / 2   // center-mounted (mirrored from middle)
        const half = bh / 2

        // Bar gradient — frequency-band color coding
        const f = i / BARS
        const g = ctx.createLinearGradient(0, cy - half, 0, cy)
        if (demod) {
          g.addColorStop(0,   'rgba(229,22,54,0.65)')
          g.addColorStop(0.5, 'rgba(229,22,54,0.28)')
          g.addColorStop(1,   'rgba(0,0,0,0)')
        } else if (f < 0.22) {
          // Bass — gold
          g.addColorStop(0,   `rgba(212,175,55,${0.65 - f * 0.5})`)
          g.addColorStop(0.5, 'rgba(212,175,55,0.18)')
          g.addColorStop(1,   'rgba(0,0,0,0)')
        } else if (f < 0.62) {
          // Mid — themed electric
          g.addColorStop(0,   `rgba(${electricRgb.current},0.58)`)
          g.addColorStop(0.5, `rgba(${electricRgb.current},0.22)`)
          g.addColorStop(1,   'rgba(0,0,0,0)')
        } else {
          // Treble — cool blue
          g.addColorStop(0,   'rgba(100,180,255,0.45)')
          g.addColorStop(0.5, 'rgba(27,69,143,0.18)')
          g.addColorStop(1,   'rgba(0,0,0,0)')
        }

        ctx.fillStyle = g
        // Mirror top and bottom from center
        ctx.fillRect(x + 1, cy - half, Math.max(bw - 2, 1), half)
        ctx.fillRect(x + 1, cy,        Math.max(bw - 2, 1), half)

        // Peak hold dot — top arm only
        if (!demod && peaks[i] > h * 0.04) {
          ctx.fillStyle = f < 0.22
            ? 'rgba(212,175,55,0.55)'
            : f < 0.62
            ? `rgba(${electricRgb.current},0.45)`
            : 'rgba(100,180,255,0.38)'
          ctx.fillRect(x + 2, cy - peaks[i] / 2 - 1, Math.max(bw - 4, 1), 1.5)
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [isDemodRef])

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full opacity-75" />
}

function StaticNoise() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let id: number
    const draw = () => {
      const w = canvas.width, h = canvas.height
      const img = ctx.createImageData(w, h)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 220) | 0
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v
        img.data[i + 3] = (Math.random() * 90 + 10) | 0
      }
      ctx.putImageData(img, 0, 0)
      id = requestAnimationFrame(draw)
    }
    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    onResize()
    window.addEventListener('resize', onResize)
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize) }
  }, [])
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.14 }}
    />
  )
}

const IDLE_MS = 3 * 60 * 1000

function DeadAirOverlay() {
  const [active, setActive] = useState(false)
  const activeRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const arm = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setActive(true)
        activeRef.current = true
      }, IDLE_MS)
    }
    const handler = () => {
      if (activeRef.current) {
        setActive(false)
        activeRef.current = false
      }
      arm()
    }
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'] as const
    events.forEach(e => document.addEventListener(e, handler, { passive: true }))
    arm()
    return () => {
      events.forEach(e => document.removeEventListener(e, handler as EventListener))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="dead-air"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeIn' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99980,
            background: 'rgba(3, 7, 18, 0.97)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => { setActive(false); activeRef.current = false }}
          role="dialog"
          aria-modal
          aria-label="Dead air — click or press any key to continue"
        >
          <StaticNoise />
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem', maxWidth: '90vw' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.55rem',
              letterSpacing: '0.35em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '2.5rem',
              textTransform: 'uppercase',
              animation: 'tunedPulse 1.5s ease-in-out infinite',
            }}>
              ● NO SIGNAL
            </div>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2.5rem' }}>
              <span style={{
                display: 'block',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 'clamp(3rem, 12vw, 9rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: 'rgba(255,255,255,0.07)',
                userSelect: 'none',
              }}>DEAD AIR</span>
              <span aria-hidden style={{
                position: 'absolute', inset: 0, display: 'block',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 'clamp(3rem, 12vw, 9rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: 'rgba(229,22,54,0.75)',
                animation: 'deadAirGlitchR 2.8s steps(1) infinite',
                userSelect: 'none',
              }}>DEAD AIR</span>
              <span aria-hidden style={{
                position: 'absolute', inset: 0, display: 'block',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 'clamp(3rem, 12vw, 9rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: 'var(--one-electric)',
                opacity: 0.7,
                animation: 'deadAirGlitchC 2.8s steps(1) infinite',
                userSelect: 'none',
              }}>DEAD AIR</span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 'clamp(0.85rem, 2.5vw, 1.15rem)',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.75rem',
              }}
            >
              Still there? ONE FM never goes dead air.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.22)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Back to you — click or press any key to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function Listen() {
  const [isDemod, setIsDemod] = useState(false)
  const isDemodRef = useRef(false)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  const handleDemodChange = useCallback((demod: boolean) => {
    setIsDemod(demod)
    isDemodRef.current = demod
  }, [])

  return (
    <Layout>
      <SEO
        title="Listen Live"
        description="Listen to ONE FM 98.5 live — FM 98.5 across the Goulburn Murray, stream at fm985.com.au, or via Community Radio Plus."
      />

      <section ref={heroRef} className="relative min-h-[78dvh] flex flex-col justify-end overflow-hidden pt-24 bg-[#101010]" style={{ transition: 'background 0.4s' }} data-cursor-label="TUNE IN">
        <div aria-hidden className="grain-overlay" />
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
          >
            {/* studio-control-room.jpg's actual subject (the presenter) sits in
                the left third of the frame -- default object-cover centers on
                the studio monitor behind him instead. Bias left. */}
            <CinegraphBackground slot="listenStudio" opacity={isDemod ? 0.2 : 0.50} imageClassName="object-left" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/55 via-[#101010]/25 to-[#101010]/90" />
        </div>
        {/* Demodulation scan-line overlay */}
        {isDemod && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(229,22,54,0.04) 3px, rgba(229,22,54,0.04) 4px)',
              animation: 'scanDown 6s linear infinite',
              mixBlendMode: 'screen',
            }}
          />
        )}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <ListenWaveform isDemodRef={isDemodRef} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pb-12 w-full">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            On Air Now · ONE FM 98.5
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.59 + 0.7)) * 12 + 2),
                  backgroundColor: 'rgba(201,162,39,0.35)',
                  animation: `freq-bar ${0.71 + (i % 6) * 0.13}s ${(i * 0.085) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{
              fontSize: 'clamp(3.2rem, 9vw, 7.5rem)',
              letterSpacing: '-0.03em',
              filter: isDemod ? 'blur(0.8px) saturate(0.4)' : 'none',
              transition: 'filter 0.3s',
            }}
          >
            <WordReveal text="Listen" as="span" className="block text-one-white" delay={0.15} stagger={0.12} />
            <WordReveal text="Live." as="span" className="block text-one-gold" delay={0.4} stagger={0.12} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease }}
            className="font-body text-one-white/45 max-w-xl mb-4 italic"
          >
            {BRAND.fullName} — a quiet room for the valley's voice. FM, stream, Community Radio Plus.
          </motion.p>

          {/* Live conditions strip */}
          <motion.div
            className="mb-8 flex items-center gap-3 px-3 py-2 rounded-lg border border-one-border/60 bg-one-midnight/50 w-fit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <span className="font-label text-[9px] tracking-[0.2em] text-one-muted/88 uppercase whitespace-nowrap">Live · Shepparton</span>
            <div className="h-3 w-px bg-one-border/60 shrink-0" />
            <WeatherWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="flex flex-wrap gap-4"
          >
            <MagneticButton cursorLabel="TUNE IN">
              <a
                href={LISTEN_LINKS.web.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3.5 rounded-full font-label text-[11px] tracking-[0.2em] uppercase"
              >
                Stream Now
              </a>
            </MagneticButton>
            <MagneticButton cursorLabel="GET APP">
              <a
                href={LISTEN_LINKS.crp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-8 py-3.5 rounded-full font-label text-[11px] tracking-[0.2em] uppercase"
              >
                Get the App
              </a>
            </MagneticButton>
          </motion.div>

          {/* ── Frequency Tuner ── the signature interactive moment */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.65, ease }}
            className="mt-10 w-full"
          >
            <FrequencyTuner onDemodChange={handleDemodChange} />
          </motion.div>
        </div>
      </section>

      {/* ── Listen Marquee Strip ── */}
      <div className="bg-[#070707] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={30}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">STREAMING 24/7</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">FM · ONLINE · APP · SMART SPEAKER</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">GOULBURN VALLEY · SINCE 1989</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">COMMUNITY RADIO PLUS · AVAILABLE NOW</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">TUNE IN · STREAM ON · PLAY ANYWHERE</span>,
          ]}
        />
      </div>

      <PageJobsBar jobs={PAGE_JOBS} className="-mt-4 pb-4 relative z-20" />

      <section className="relative -mt-2 bg-[#030A12]">
        <div aria-hidden className="grain-overlay opacity-60" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-2">
          <LivePlayerWidget className="shadow-2xl shadow-black/40" />
        </div>
      </section>

      <section className="section-padding section-bleed-top bg-surface-lift" data-cursor-label="LISTEN OPTIONS">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="section-label mb-4 block">All listening options</span>
          <WordReveal text="Ways to Listen" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
          <p className="font-body-small text-muted mb-8">Official ONE FM listening options</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WAYS.map((way) => {
              const Icon = way.icon
              const inner = (
                <div className="glass-card p-6 h-full hover:border-one-gold/30 transition-colors group relative overflow-hidden">
                  <div aria-hidden className="explore-tile-scan" />
                  <Icon size={28} className="text-one-gold mb-4" />
                  <h3 className="font-h4 text-one-white mb-1">{way.title}</h3>
                  <p className="font-body-small text-muted mb-2">{way.desc}</p>
                  <p className="font-label text-xs text-one-white/70">{way.detail}</p>
                  {way.href && (
                    <span className="inline-flex items-center gap-1 font-label text-one-gold text-[10px] mt-4">
                      Open <ExternalLink size={10} />
                    </span>
                  )}
                </div>
              )
              return (
                <TiltCard key={way.title} maxTilt={5}>
                  {way.href ? (
                    <a href={way.href} data-cursor-label="OPEN" target="_blank" rel="noopener noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <div>{inner}</div>
                  )}
                </TiltCard>
              )
            })}
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SoundCloudPanel compact />
            <FacebookPanel compact />
          </div>

          <TiltCard maxTilt={3} className="mt-8">
          <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            <div>
              <p className="font-label text-one-gold text-xs mb-1">Studio line</p>
              <a href={LISTEN_LINKS.phone.href!} data-cursor-label="CALL" className="font-h4 text-one-white hover:text-one-gold transition-colors link-hover">
                {BRAND.phone}
              </a>
            </div>
            <p className="font-body-small text-muted text-sm max-w-md">
              {BRAND.org} · {BRAND.address}
            </p>
          </div>
          </TiltCard>
        </div>
      </section>

      <DeadAirOverlay />
    </Layout>
  )
}

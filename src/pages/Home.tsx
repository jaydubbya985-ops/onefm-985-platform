import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WeatherMini } from '@/components/WeatherWidget'
import { MediaImage } from '@/components/MediaImage'
import { media } from '@/lib/media'
import {
  BREAKFAST_SHOW,
  getBreakfastHost,
  getBreakfastScheduleLabel,
  getCurrentLiveShow,
} from '@/data/programGuide'
import { LatestInterviews } from '@/components/LatestInterviews'
import { motion, useInView } from 'framer-motion'
import {
  Play, Pause, Volume2, ArrowRight, MapPin, Radio,
  Users, Clock, Heart, Calendar, ChevronRight,
  Quote, Wifi, Headphones, Zap, Globe, Trophy, Mic2,
} from 'lucide-react'

/* ΓöÇΓöÇΓöÇ Station Ident ΓöÇΓöÇΓöÇ */
function StationIdent() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef('98.5 ONE FM')
  const colorRef = useRef('rgba(212,150,58,0.04)')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = parent.clientWidth * dpr
      canvas.height = parent.clientHeight * dpr
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

      ctx.font = 'bold 150px "Space Grotesk", sans-serif'
      ctx.fillStyle = colorRef.current
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const yOffset = Math.sin(t * 2) * 15

      ctx.save()
      ctx.translate(w / 2, h / 2 + yOffset)
      ctx.fillText(textRef.current, 0, 0)
      ctx.restore()

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
    </div>
  )
}

/* ΓöÇΓöÇΓöÇ Get Current Show ΓöÇΓöÇΓöÇ */
function getCurrentShow() {
  return getCurrentLiveShow()
}

/* ΓöÇΓöÇΓöÇ Audio Wave Canvas ΓöÇΓöÇΓöÇ */
function AudioWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      t += 0.008
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Frequency bars
      const barCount = 60
      const barWidth = canvas.width / barCount
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth
        const noise = Math.sin(i * 0.3 + t * 3) * Math.cos(i * 0.1 - t * 2)
        const height = Math.abs(noise) * canvas.height * 0.6 + Math.random() * canvas.height * 0.2

        const gradient = ctx.createLinearGradient(0, (canvas.height - height) / 2, 0, (canvas.height + height) / 2)
        gradient.addColorStop(0, 'rgba(212,150,58,0.15)')
        gradient.addColorStop(0.5, 'rgba(212,150,58,0.3)')
        gradient.addColorStop(1, 'rgba(212,150,58,0.05)')

        ctx.fillStyle = gradient
        ctx.fillRect(x, (canvas.height - height) / 2, barWidth - 1, height)
      }

      // Signal line
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height / 2 + Math.sin(x * 0.01 + t * 3) * 30 * Math.sin(x * 0.003)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(212,150,58,0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
}

/* ΓöÇΓöÇΓöÇ Ken Burns (tailwind handles it now via animate-ken-burns) ΓöÇΓöÇΓöÇ */
function KenBurnsStyle() { return null }

/* ΓöÇΓöÇΓöÇ Sub-section: ProgramPreview ΓöÇΓöÇΓöÇ */
function ProgramPreview() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const [activeFilter, setActiveFilter] = useState('all')

  const programData = [
    {
      title: BREAKFAST_SHOW,
      presenter: getBreakfastScheduleLabel(),
      schedule: 'MondayΓÇôFriday, 6AMΓÇô9AM',
      description: 'Rotating breakfast hosts ΓÇö community interviews, local news, and music. The Valley\'s essential morning companion.',
      color: '#D4963A',
    },
    {
      title: 'Dancing through the decades',
      presenter: 'Johnny P (John Painter)',
      schedule: 'MondayΓÇôFriday, 9AMΓÇô12PM',
      description: 'Music from across the decades with Johnny P. Four years on air, playing the hits that span generations.',
      color: '#D4963A',
    },
    {
      title: 'The Regional Voice',
      presenter: 'James Manley',
      schedule: 'MondayΓÇôFriday, 12PMΓÇô3PM',
      description: 'Community-focused programming with local interviews and advocacy. The issues that matter to the Valley.',
      color: '#D4963A',
    },
    {
      title: 'Africonnect',
      presenter: 'Fikiri',
      schedule: 'Monday, 9PMΓÇô10PM',
      description: 'Swahili language program connecting the African community in the Goulburn Valley.',
      color: '#D4963A',
    },
    {
      title: 'Planet of Sound',
      presenter: 'Carlos Rock',
      schedule: 'Thursday & Friday, 11PM',
      description: 'Rock music program spanning 19-20 years on air with Carlos Rock. A Valley institution for rock fans.',
      color: '#D4963A',
    },
    {
      title: 'Good Evening Country',
      presenter: 'Timmy Ahmet',
      schedule: 'Friday, 8PMΓÇô9PM',
      description: 'Country music showcase Friday evenings. The best country classics and new releases.',
      color: '#D4963A',
    },
  ]

  return (
    <section ref={ref} className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-block font-label text-one-gold mb-3 px-3 py-1 rounded-full border border-one-gold/30 bg-one-gold/10 text-[11px] tracking-wider">
              ON AIR
            </span>
            <h2 className="font-h2 text-one-white">Program Preview</h2>
          </div>
          <Link
            to="/programs"
            className="hidden sm:inline-flex items-center gap-1 font-label text-one-gold hover:text-one-gold transition-colors text-[11px] group"
          >
            Full Schedule{' '}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Time-slot filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'morning', 'afternoon', 'evening'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`font-label text-[10px] tracking-wider px-3 py-1.5 rounded-full transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-one-gold text-one-navy'
                  : 'border border-one-border text-muted hover:border-one-gold/30 hover:text-one-gold'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'morning' ? 'Morning' : filter === 'afternoon' ? 'Afternoon' : 'Evening'}
            </button>
          ))}
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programData.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-card p-5 hover:border-one-gold/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-h4 text-one-white group-hover:text-one-gold transition-colors">
                  {program.title}
                </h3>
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-2"
                  style={{ backgroundColor: program.color }}
                />
              </div>
              <p className="font-body-small text-muted mb-2">{program.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-one-border">
                <span className="font-label text-muted text-[10px]">{program.schedule}</span>
                <span className="font-label text-one-gold text-[10px]">{program.presenter}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <Link
          to="/programs"
          className="sm:hidden mt-6 inline-flex items-center gap-1 font-label text-one-gold text-[11px] group"
        >
          Full Schedule{' '}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}

/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
/*  HOME PAGE                                              */
/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
export default function Home() {
  const [playing, setPlaying] = useState(false)
  const [volume] = useState(75)
  const [currentTime] = useState(() => new Date())
  const currentShow = getCurrentShow()
  const timeStr = currentTime.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // Program preview
  const todayHost = getBreakfastHost(currentTime.getDay())
  const featuredShows = [
    {
      name: BREAKFAST_SHOW,
      time: 'MonΓÇôFri 6:00AM',
      host: todayHost,
      image: media.onAirHost1,
      fallback: media.presenter1,
      isNow: currentShow.name === BREAKFAST_SHOW,
    },
    {
      name: 'Dancing through the decades',
      time: 'MonΓÇôFri 9:00AM',
      host: 'John Painter',
      image: media.onAirHost2,
      fallback: media.presenter2,
      isNow: false,
    },
    {
      name: 'The Regional Voice',
      time: 'MonΓÇôFri 12:00PM',
      host: 'James Manley',
      image: media.onAirHost3,
      fallback: media.presenter3,
      isNow: false,
    },
    {
      name: 'Planet of Sound',
      time: 'Thu & Fri 11:00PM',
      host: 'Carlos Rock',
      image: media.studioControlRoom,
      fallback: media.radioStudio,
      isNow: false,
    },
  ]

  // Ticker data
  const tickerItems = [
    { text: 'Tune in now ΓÇö live sports coverage every Saturday', url: '/programs' },
    { text: '36 years of community broadcasting ΓÇö join the celebration', url: '/story' },
    { text: 'ONE FM is your emergency broadcaster for the Goulburn Valley', url: '/story' },
    { text: 'Sponsorship enquiries now open for 2026', url: '/sponsorship' },
    { text: 'Listen anywhere ΓÇö FM 98.5, online stream, smart speakers', url: '/listen' },
  ]

  return (
    <Layout>
      <SEO title="Home" description="ONE FM 98.5 ΓÇö Goulburn Valley's community radio. 24/7 local programming, live sports coverage, multicultural shows, and real community voices. Callsign 3ONE." />
      <KenBurnsStyle />

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ HERO ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden">
        {/* Cinematic background */}
        <div className="absolute inset-0 z-0">
          <MediaImage
            src={media.regionalLandscape}
            fallbackSrc={media.australianSunset}
            alt=""
            priority
            skeleton={false}
            className="absolute inset-0 w-full h-full animate-ken-burns"
            style={{ opacity: 0.35 }}
          />
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-one-navy/60 via-one-navy/40 to-one-navy" />
          <div className="absolute inset-0 bg-gradient-to-r from-one-navy/50 via-transparent to-one-navy/50" />
          {/* Gold vignette hint */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,75,0.03) 0%, transparent 70%)' }} />
        </div>

        <StationIdent />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto -mt-16 md:-mt-24">
          {/* Frequency */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2 font-label text-one-gold px-5 py-2.5 rounded-full border border-one-gold/30 bg-one-gold/10 text-sm tracking-widest backdrop-blur-sm">
              <Radio size={16} />
              98.5 FM
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-h1 text-one-white mb-6 text-shadow-hero"
          >
            THE VOICE OF
            <br />
            THE VALLEY
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-body text-one-muted max-w-2xl mx-auto mb-10"
          >
            Goulburn Valley's community radio. Local stories, local music, local voices ΓÇö 24/7. Based in Shepparton, Victoria, Australia.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/listen"
              className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Listen Live
            </Link>
            <Link
              to="/programs"
              className="btn-secondary text-base px-8 py-3.5 inline-flex items-center gap-2"
            >
              Explore Programs
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-wrap items-center justify-center gap-8 mb-12"
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-one-gold" />
              <span className="font-body-small text-one-muted">Shepparton, VIC, Australia</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-one-gold" />
              <span className="font-body-small text-one-muted">Callsign: 3ONE</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi size={16} className="text-one-gold" />
              <span className="font-body-small text-one-muted">24/7 Local Programming</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-one-gold" />
              <span className="font-body-small text-one-muted">FM 98.5 ┬╖ Online ┬╖ App</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ LIVE PLAYER BAR ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="relative z-20 -mt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="glass-card rounded-2xl overflow-hidden border-one-gold/20"
          >
            {/* Top: Now playing info */}
            <div className="p-6 pb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-one-navy shrink-0 border border-one-border">
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
                    <span className="font-label text-[8px] text-white">LIVE</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-label text-muted text-[10px] mb-1">
                    NOW PLAYING ΓÇö {currentShow.category}
                  </div>
                  <h3 className="font-h3 text-one-white truncate">
                    {currentShow.name}
                  </h3>
                  <p className="font-body-small text-muted">
                    with {currentShow.host} &middot; {currentShow.time}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="font-label text-muted text-xs hidden md:block">
                    {timeStr}
                  </div>
                  <WeatherMini />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-1 bg-one-navy rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-one-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '42%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-micro text-muted text-[10px]">ELAPSED</span>
                  <span className="font-micro text-muted text-[10px]">REMAINING</span>
                </div>
              </div>
            </div>

            {/* Bottom: Controls */}
            <div className="px-6 py-4 border-t border-one-border bg-one-navy/40">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="w-10 h-10 rounded-full bg-one-gold flex items-center justify-center text-one-navy hover:scale-105 transition-transform"
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <div className="flex items-center gap-2">
                    <Volume2 size={14} className="text-muted" />
                    <div className="w-20 h-1 bg-one-navy rounded-full">
                      <div
                        className="h-full bg-one-gold rounded-full transition-all"
                        style={{ width: `${volume}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to="/broadcast"
                    className="font-label text-one-gold text-[10px] hover:text-one-gold transition-colors"
                  >
                    View Broadcast Explorer
                  </Link>
                </div>

                <div className="font-body-small text-muted text-xs">
                  Up Next: {currentShow.upNext}
                </div>
              </div>
            </div>

            {/* Ticker */}
            <div className="px-6 py-2.5 border-t border-one-border bg-one-gold/5 overflow-hidden">
              <div className="ticker-track gap-10">
                {/* Duplicate 4├ù so the loop looks seamless at all widths */}
                {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                  <Link
                    key={i}
                    to={item.url}
                    className="font-label text-muted text-[10px] flex items-center gap-2 hover:text-one-gold transition-colors whitespace-nowrap shrink-0"
                  >
                    <ChevronRight size={12} className="text-one-gold shrink-0" />
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LatestInterviews />

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ FEATURED SHOWS ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="section-padding bg-[#0A0E1A] relative overflow-hidden">
        <AudioWave />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block font-label text-one-gold mb-3">
                FEATURED
              </span>
              <h2 className="font-h2 text-one-white">
                What's On Today
              </h2>
            </div>
            <Link
              to="/programs"
              className="hidden sm:inline-flex items-center gap-1 font-label text-one-gold text-xs group"
            >
              View Full Schedule{' '}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredShows.map((show, index) => (
              <motion.div
                key={show.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="glass-card overflow-hidden group cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden">
                  <MediaImage
                    src={show.image}
                    fallbackSrc={show.fallback}
                    alt={show.name}
                    className="absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 cinematic-overlay" />
                  {show.isNow && (
                    <div className="absolute top-3 left-3 live-badge">
                      <span className="live-badge-dot" />
                      <span className="font-label text-[9px] text-white">LIVE NOW</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="font-label text-muted text-[10px] mb-1">{show.time}</div>
                    <h3 className="font-h3 text-one-white text-base leading-tight">{show.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body-small text-muted text-xs">{show.host}</span>
                    <ChevronRight size={14} className="text-one-gold group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/programs"
            className="sm:hidden mt-6 inline-flex items-center gap-1 font-label text-one-gold text-xs group"
          >
            View Full Schedule{' '}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ PROGRAM PREVIEW ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <ProgramPreview />

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ VISION ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <span className="inline-block font-label text-one-gold mb-4">
                OUR VISION
              </span>
              <h2 className="font-h2 text-one-white mb-6">Community First</h2>
              <p className="font-body text-one-muted mb-6">
                ONE FM is a community radio station broadcasting to 25 towns across the Goulburn Valley and surrounding regions, reaching a total population of 185,791 people. We're more than a radio station ΓÇö we're the heartbeat of the community.
              </p>
              <p className="font-body text-one-muted mb-8">
                From emergency broadcasting during floods and fires to celebrating local footy on the weekend, ONE FM keeps the Valley connected, informed, and entertained.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/story" className="btn-primary inline-flex items-center gap-2">
                  Our Story
                  <ArrowRight size={16} />
                </Link>
                <Link to="/community" className="btn-secondary inline-flex items-center gap-2">
                  Community Directory
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-one-border aspect-[4/3] relative">
                <MediaImage
                  src={media.communityEvent}
                  fallbackSrc={media.communityGathering}
                  alt="Community event"
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 cinematic-overlay" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card px-6 py-4 hidden lg:block">
                <div className="font-stat text-one-gold text-4xl">36+</div>
                <div className="font-label text-muted text-xs">YEARS ON AIR</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ STATS ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="py-20 md:py-28 bg-[#070F1C] relative">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212,168,75,0.8) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="section-label justify-center mb-4">BY THE NUMBERS</span>
            <h2 className="font-h2 text-one-white mt-4">
              36 Years of Community Broadcasting
            </h2>
            <div className="gold-rule mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {[
              { value: '185,791', label: 'Population Reached', icon: Users },
              { value: '100 km', label: 'Broadcast Radius', icon: Radio },
              { value: '25', label: 'Towns Covered', icon: MapPin },
              { value: '24/7', label: 'Days on Air', icon: Clock },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="stat-card p-6 md:p-8 text-center group"
              >
                <stat.icon
                  size={26}
                  className="text-one-gold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="font-stat text-one-gold text-3xl md:text-4xl mb-2">
                  {stat.value}
                </div>
                <div className="font-label text-muted text-[10px]">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 mt-5">
            {[
              { value: '39,375', label: 'Weekly Listeners', icon: Headphones },
              { value: '12,000+', label: 'Emergency Broadcasts', icon: Zap },
              { value: '16', label: 'Presenters', icon: Mic2 },
              { value: '500+', label: 'Community Events Covered', icon: Calendar },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="stat-card p-6 md:p-8 text-center group"
              >
                <stat.icon
                  size={26}
                  className="text-one-gold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="font-stat text-one-gold text-3xl md:text-4xl mb-2">
                  {stat.value}
                </div>
                <div className="font-label text-muted text-[10px]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ COMMUNITY SPOTLIGHT ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0">
          <MediaImage
            src={media.regionalLandscape}
            fallbackSrc={media.australianSunset}
            alt="Goulburn Valley"
            className="absolute inset-0 animate-ken-burns"
          />
          <div className="absolute inset-0 bg-one-navy/82" />
          {/* Gold radial glow for warmth */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(212,168,75,0.04) 0%, transparent 60%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:w-[55%]"
            >
              <span className="inline-block font-label text-one-gold mb-4">
                COMMUNITY SPOTLIGHT
              </span>
              <h2 className="font-h2 text-one-white mb-6">
                25 Towns, One Voice
              </h2>
              <p className="font-body text-one-muted mb-6">
                Since 1989, ONE FM has been the trusted voice of the Goulburn Valley ΓÇö keeping communities informed, entertained, and connected through every challenge and celebration.
              </p>
              <p className="font-body text-one-muted mb-8">
                From Shepparton to Euroa, Tatura to Mansfield, our broadcast signal reaches deep into regional Victoria ΓÇö and our online stream carries the Valley's voice to the world.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Founded', value: '1989' },
                  { label: 'Frequency', value: '98.5 FM' },
                  { label: 'Callsign', value: '3ONE' },
                  { label: 'ACMA License', value: '1385226/1' },
                  { label: 'Broadcast Area', value: '100 km radius' },
                  { label: 'Format', value: 'Community Radio' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-one-gold/[0.06]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-one-gold" />
                    <div>
                      <div className="font-label text-muted text-[9px]">
                        {item.label}
                      </div>
                      <div className="font-body-small text-one-white text-sm">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/story"
                className="btn-primary inline-flex items-center gap-2"
              >
                Our Story
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lg:w-[45%]"
            >
              <div className="glass-card p-6 md:p-8 sticky top-24">
                <h3 className="font-h3 text-one-white mb-6">
                  Station Timeline
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      year: '1989',
                      event: 'Station Founded',
                      desc: 'ONE FM launches as the Goulburn Valley\'s first community radio station.',
                    },
                    {
                      year: '1995',
                      event: 'First GVL Broadcast Partnership',
                      desc: 'Signed landmark agreement with the Goulburn Valley League for live sports coverage.',
                    },
                    {
                      year: '2008',
                      event: 'Moved to New Studios',
                      desc: 'Purpose-built studios with digital mixing desks and production suites.',
                    },
                    {
                      year: '2014',
                      event: '25th Anniversary ΓÇö 25 Towns',
                      desc: 'Celebrated 25 years by visiting 25 towns across the listening area.',
                    },
                    {
                      year: '2020',
                      event: 'Emergency Broadcasting',
                      desc: 'Critical information lifeline during bushfires and COVID-19 pandemic.',
                    },
                    {
                      year: '2025',
                      event: '36th Year',
                      desc: 'Modern digital expansion with streaming, podcasts, and growing community reach.',
                    },
                  ].map((item, index) => (
                    <div
                      key={item.year}
                      className="flex gap-4 group"
                    >
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-3 h-3 rounded-full bg-one-gold border-2 border-one-navy group-hover:scale-125 transition-transform" />
                        {index < 5 && (
                          <div className="w-px h-full bg-one-border mt-1" />
                        )}
                      </div>
                      <div className="pb-6">
                        <span className="font-label text-one-gold text-xs">
                          {item.year}
                        </span>
                        <h4 className="font-h4 text-one-white text-sm mt-0.5">
                          {item.event}
                        </h4>
                        <p className="font-body-small text-muted text-xs mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ GVL GAME DAY ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="section-padding bg-[#0A0E1A] relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-one-gold/[0.02] rounded-l-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="order-2 lg:order-1"
            >
              <span className="inline-block font-label text-one-gold mb-4">
                GAME DAY
              </span>
              <h2 className="font-h2 text-one-white mb-6">
                GVL Coverage
              </h2>
              <p className="font-body text-one-muted mb-6">
                ONE FM is the official broadcaster for the Goulburn Valley League, covering the biggest footy and netball clashes every Saturday. Live commentary, expert analysis, and all the action you can't get anywhere else.
              </p>
              <p className="font-body text-one-muted mb-8">
                From Tatura to Mooroopna, Kyabram to Echuca ΓÇö we bring you every goal, every mark, every moment of GVL brilliance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/programs"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Trophy size={16} />
                  Game Day Schedule
                </Link>
                <Link
                  to="/broadcast"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Globe size={16} />
                  Broadcast Explorer
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-2xl overflow-hidden border border-one-border">
                <div className="relative aspect-video">
                  <MediaImage
                    src={media.communityEvent}
                    fallbackSrc={media.footballGame}
                    alt="GVL Game Day"
                    className="absolute inset-0"
                  />
                  <div className="absolute inset-0 cinematic-overlay" />
                </div>
                <div className="p-5 glass-card rounded-none border-t border-one-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-one-gold/20 flex items-center justify-center">
                      <Trophy size={18} className="text-one-gold" />
                    </div>
                    <div>
                      <h4 className="font-h4 text-one-white">Super Saturday Sports Show</h4>
                      <p className="font-label text-muted text-[10px]">
                        Every Saturday ┬╖ Live GVL Coverage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-body-small text-muted text-xs">
                    <span>Football</span>
                    <span className="w-1 h-1 rounded-full bg-one-gold" />
                    <span>Netball</span>
                    <span className="w-1 h-1 rounded-full bg-one-gold" />
                    <span>Cricket</span>
                    <span className="w-1 h-1 rounded-full bg-one-gold" />
                    <span>Racing</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ TESTIMONIAL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="section-padding relative overflow-hidden">
        {/* Studio background ΓÇö very subtle */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <MediaImage
            src={media.studioControlRoom}
            fallbackSrc={media.radioStudio}
            alt=""
            className="absolute inset-0"
            style={{ opacity: 0.08 }}
          />
          <div className="absolute inset-0 bg-one-navy/90" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <Quote
              size={48}
              className="text-one-gold/30 mx-auto mb-6"
            />
            <blockquote className="font-body text-one-white text-xl md:text-2xl italic mb-8 leading-relaxed">
              "When the 2022 floods cut our town off, ONE FM was the only way we knew what was happening. They saved lives, simple as that."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-one-gold/20 flex items-center justify-center">
                <Users size={20} className="text-one-gold" />
              </div>
              <div className="text-left">
                <div className="font-body-small text-one-white font-medium">
                  Margaret Tresize
                </div>
                <div className="font-label text-muted text-xs">
                  Community Leader, Rochester
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ CTA ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <section className="section-padding bg-[#0A0E1A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <h2 className="font-h2 text-one-white mb-6">
              Join the ONE FM Family
            </h2>
            <p className="font-body text-one-muted max-w-xl mx-auto mb-10">
              Whether you want to volunteer, sponsor, or just tune in ΓÇö there's a place for you in the ONE FM community. Help us keep the Valley's voice strong for the next 36 years.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="btn-primary inline-flex items-center gap-2 px-8"
              >
                <Heart size={16} />
                Get Involved
              </Link>
              <Link
                to="/sponsorship"
                className="btn-secondary inline-flex items-center gap-2 px-8"
              >
                Become a Sponsor
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
